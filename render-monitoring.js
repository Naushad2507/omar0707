#!/usr/bin/env node

/**
 * Render Free Tier Monitoring and Keep-Alive System
 * Prevents sleep, monitors health, logs errors, and provides status dashboard
 */

import axios from 'axios';
import fs from 'fs';

// Configuration for monitoring
const MONITORING_CONFIG = {
  // Render service URL (update with actual deployment URL)
  serviceUrl: process.env.RENDER_SERVICE_URL || 'https://your-app.onrender.com',
  
  // Monitoring intervals
  healthCheckInterval: 14 * 60 * 1000, // 14 minutes (Render free tier sleeps after 15min)
  logRotationInterval: 24 * 60 * 60 * 1000, // 24 hours
  statusReportInterval: 60 * 60 * 1000, // 1 hour
  
  // Health check endpoints
  healthEndpoints: [
    '/api/deals',
    '/api/categories',
    '/api/cities',
    '/health'
  ],
  
  // UptimeRobot webhook configuration
  uptimeRobot: {
    enabled: false, // Set to true when UptimeRobot is configured
    webhookUrl: process.env.UPTIME_ROBOT_WEBHOOK,
    monitorInterval: 5 * 60 * 1000 // 5 minutes
  },
  
  // Alert thresholds
  alerts: {
    responseTimeWarning: 5000, // 5 seconds
    responseTimeError: 10000,  // 10 seconds
    consecutiveFailures: 3,
    errorRate: 0.1 // 10%
  }
};

class RenderMonitor {
  constructor() {
    this.monitoringData = {
      startTime: new Date(),
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      consecutiveFailures: 0,
      lastSuccessTime: null,
      lastErrorTime: null,
      averageResponseTime: 0,
      responseTimes: [],
      errors: [],
      status: 'initializing'
    };
    
    this.isMonitoring = false;
    this.intervals = [];
  }

  async log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      uptime: Date.now() - this.monitoringData.startTime,
      consecutiveFailures: this.monitoringData.consecutiveFailures
    };
    
    // Console output with icons
    const icon = {
      'INFO': '🔵',
      'SUCCESS': '✅',
      'ERROR': '❌',
      'WARNING': '⚠️',
      'HEALTH': '💗',
      'SLEEP': '😴',
      'WAKE': '⏰'
    }[level] || 'ℹ️';
    
    console.log(`${icon} [${timestamp}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
    
    // Store in monitoring data
    if (level === 'ERROR' || level === 'WARNING') {
      this.monitoringData.errors.push(logEntry);
      
      // Keep only last 100 errors to prevent memory issues
      if (this.monitoringData.errors.length > 100) {
        this.monitoringData.errors = this.monitoringData.errors.slice(-100);
      }
    }
    
    // Write to log file
    this.writeToLogFile(logEntry);
  }

  writeToLogFile(logEntry) {
    try {
      const logLine = `${logEntry.timestamp} [${logEntry.level}] ${logEntry.message}`;
      const logData = logEntry.data ? ` | ${JSON.stringify(logEntry.data)}` : '';
      fs.appendFileSync('render-monitor.log', `${logLine}${logData}\n`);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  async performHealthCheck() {
    const startTime = Date.now();
    this.monitoringData.totalRequests++;
    
    try {
      // Test main health endpoint first
      const healthResponse = await axios.get(`${MONITORING_CONFIG.serviceUrl}/health`, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Render-Monitor/1.0',
          'Accept': 'application/json'
        }
      });
      
      const responseTime = Date.now() - startTime;
      this.updateResponseTimes(responseTime);
      
      if (healthResponse.status === 200) {
        this.monitoringData.successfulRequests++;
        this.monitoringData.consecutiveFailures = 0;
        this.monitoringData.lastSuccessTime = new Date();
        this.monitoringData.status = 'healthy';
        
        this.log('HEALTH', 'Service health check passed', {
          responseTime: `${responseTime}ms`,
          status: healthResponse.status,
          consecutiveSuccesses: this.monitoringData.successfulRequests
        });
        
        // Test additional endpoints periodically
        if (this.monitoringData.totalRequests % 4 === 0) {
          await this.testAPIEndpoints();
        }
        
        return true;
      }
    } catch (error) {
      this.handleHealthCheckFailure(error, Date.now() - startTime);
      return false;
    }
  }

  async testAPIEndpoints() {
    this.log('INFO', 'Testing API endpoints functionality');
    
    for (const endpoint of MONITORING_CONFIG.healthEndpoints.slice(0, 3)) {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${MONITORING_CONFIG.serviceUrl}${endpoint}`, {
          timeout: 15000
        });
        
        const responseTime = Date.now() - startTime;
        
        this.log('SUCCESS', `API endpoint test: ${endpoint}`, {
          status: response.status,
          responseTime: `${responseTime}ms`,
          dataSize: JSON.stringify(response.data).length
        });
        
      } catch (error) {
        this.log('WARNING', `API endpoint issue: ${endpoint}`, {
          error: error.message,
          code: error.code
        });
      }
    }
  }

  handleHealthCheckFailure(error, responseTime) {
    this.monitoringData.failedRequests++;
    this.monitoringData.consecutiveFailures++;
    this.monitoringData.lastErrorTime = new Date();
    
    const errorType = this.categorizeError(error);
    
    this.log('ERROR', 'Health check failed', {
      error: error.message,
      code: error.code,
      responseTime: responseTime ? `${responseTime}ms` : 'timeout',
      consecutiveFailures: this.monitoringData.consecutiveFailures,
      errorType: errorType
    });
    
    // Update status based on consecutive failures
    if (this.monitoringData.consecutiveFailures >= MONITORING_CONFIG.alerts.consecutiveFailures) {
      this.monitoringData.status = 'critical';
      this.log('WARNING', 'Service entering critical state', {
        consecutiveFailures: this.monitoringData.consecutiveFailures,
        recommendation: 'Check Render service logs and status'
      });
    } else {
      this.monitoringData.status = 'degraded';
    }
    
    // Handle service sleep detection
    if (errorType === 'service_sleep') {
      this.handleServiceSleep();
    }
  }

  categorizeError(error) {
    if (error.code === 'ECONNREFUSED') {
      return 'service_sleep';
    } else if (error.code === 'ETIMEDOUT') {
      return 'timeout';
    } else if (error.response?.status >= 500) {
      return 'server_error';
    } else if (error.response?.status >= 400) {
      return 'client_error';
    } else {
      return 'network_error';
    }
  }

  handleServiceSleep() {
    this.log('SLEEP', 'Service appears to be sleeping (Render free tier)', {
      action: 'Attempting wake-up',
      consecutiveFailures: this.monitoringData.consecutiveFailures,
      recommendation: 'Consider UptimeRobot or upgrade to paid tier'
    });
    
    // Attempt immediate wake-up with multiple requests
    setTimeout(() => this.attemptWakeUp(), 5000);
  }

  async attemptWakeUp() {
    this.log('WAKE', 'Attempting to wake up sleeping service');
    
    const wakeUpPromises = [
      this.performHealthCheck(),
      this.performHealthCheck(),
      this.performHealthCheck()
    ];
    
    try {
      await Promise.all(wakeUpPromises);
      this.log('SUCCESS', 'Wake-up attempt completed');
    } catch (error) {
      this.log('ERROR', 'Wake-up attempt failed', { error: error.message });
    }
  }

  updateResponseTimes(responseTime) {
    this.monitoringData.responseTimes.push(responseTime);
    
    // Keep only last 100 response times
    if (this.monitoringData.responseTimes.length > 100) {
      this.monitoringData.responseTimes = this.monitoringData.responseTimes.slice(-100);
    }
    
    // Calculate average response time
    this.monitoringData.averageResponseTime = 
      this.monitoringData.responseTimes.reduce((a, b) => a + b, 0) / 
      this.monitoringData.responseTimes.length;
    
    // Alert on slow response times
    if (responseTime > MONITORING_CONFIG.alerts.responseTimeError) {
      this.log('WARNING', 'Slow response time detected', {
        responseTime: `${responseTime}ms`,
        threshold: `${MONITORING_CONFIG.alerts.responseTimeError}ms`,
        averageResponseTime: `${Math.round(this.monitoringData.averageResponseTime)}ms`
      });
    }
  }

  generateStatusReport() {
    const uptime = Date.now() - this.monitoringData.startTime;
    const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
    const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    
    const successRate = this.monitoringData.totalRequests > 0 
      ? (this.monitoringData.successfulRequests / this.monitoringData.totalRequests * 100).toFixed(2)
      : '0.00';
    
    const report = {
      timestamp: new Date().toISOString(),
      status: this.monitoringData.status,
      uptime: `${uptimeHours}h ${uptimeMinutes}m`,
      performance: {
        totalRequests: this.monitoringData.totalRequests,
        successfulRequests: this.monitoringData.successfulRequests,
        failedRequests: this.monitoringData.failedRequests,
        successRate: `${successRate}%`,
        averageResponseTime: `${Math.round(this.monitoringData.averageResponseTime)}ms`,
        consecutiveFailures: this.monitoringData.consecutiveFailures
      },
      lastEvents: {
        lastSuccess: this.monitoringData.lastSuccessTime?.toISOString() || 'Never',
        lastError: this.monitoringData.lastErrorTime?.toISOString() || 'Never',
        recentErrors: this.monitoringData.errors.slice(-5).length
      },
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.monitoringData.consecutiveFailures > 0) {
      recommendations.push('Service experiencing issues - check Render dashboard');
    }
    
    if (this.monitoringData.averageResponseTime > MONITORING_CONFIG.alerts.responseTimeWarning) {
      recommendations.push('Consider optimizing application performance');
    }
    
    if (!MONITORING_CONFIG.uptimeRobot.enabled) {
      recommendations.push('Set up UptimeRobot monitoring for better uptime');
    }
    
    const successRate = this.monitoringData.totalRequests > 0 
      ? this.monitoringData.successfulRequests / this.monitoringData.totalRequests
      : 1;
    
    if (successRate < 0.95) {
      recommendations.push('Consider upgrading to Render paid tier for better reliability');
    }
    
    return recommendations;
  }

  async saveStatusReport() {
    try {
      const report = this.generateStatusReport();
      fs.writeFileSync('render-status.json', JSON.stringify(report, null, 2));
      
      this.log('INFO', 'Status report updated', {
        status: report.status,
        uptime: report.uptime,
        successRate: report.performance.successRate,
        avgResponseTime: report.performance.averageResponseTime
      });
    } catch (error) {
      this.log('ERROR', 'Failed to save status report', { error: error.message });
    }
  }

  startMonitoring() {
    if (this.isMonitoring) {
      this.log('WARNING', 'Monitoring already started');
      return;
    }
    
    this.isMonitoring = true;
    this.log('INFO', 'Starting Render monitoring system', {
      serviceUrl: MONITORING_CONFIG.serviceUrl,
      checkInterval: `${MONITORING_CONFIG.healthCheckInterval / 1000}s`,
      uptimeRobotEnabled: MONITORING_CONFIG.uptimeRobot.enabled
    });
    
    // Initial health check
    this.performHealthCheck();
    
    // Set up monitoring intervals
    this.intervals.push(
      setInterval(() => this.performHealthCheck(), MONITORING_CONFIG.healthCheckInterval)
    );
    
    this.intervals.push(
      setInterval(() => this.saveStatusReport(), MONITORING_CONFIG.statusReportInterval)
    );
    
    // Log rotation
    this.intervals.push(
      setInterval(() => this.rotateLogFile(), MONITORING_CONFIG.logRotationInterval)
    );
    
    // Initial status report
    setTimeout(() => this.saveStatusReport(), 5000);
  }

  stopMonitoring() {
    if (!this.isMonitoring) {
      this.log('WARNING', 'Monitoring not started');
      return;
    }
    
    this.isMonitoring = false;
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    
    this.log('INFO', 'Monitoring stopped', {
      totalRequests: this.monitoringData.totalRequests,
      successRate: `${(this.monitoringData.successfulRequests / this.monitoringData.totalRequests * 100).toFixed(2)}%`
    });
  }

  rotateLogFile() {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const archiveName = `render-monitor-${timestamp}.log`;
      
      if (fs.existsSync('render-monitor.log')) {
        fs.renameSync('render-monitor.log', archiveName);
        this.log('INFO', 'Log file rotated', { archive: archiveName });
      }
    } catch (error) {
      this.log('ERROR', 'Log rotation failed', { error: error.message });
    }
  }

  // Handle graceful shutdown
  setupGracefulShutdown() {
    const shutdown = () => {
      this.log('INFO', 'Shutting down monitoring...');
      this.stopMonitoring();
      this.saveStatusReport();
      process.exit(0);
    };
    
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}

// UptimeRobot webhook endpoint (optional)
function createWebhookEndpoint() {
  return `
// Add this to your Express server routes for UptimeRobot webhook integration

app.post('/webhook/uptimerobot', (req, res) => {
  const { monitorFriendlyName, alertType, alertDetails, monitorURL } = req.body;
  
  console.log(\`📊 UptimeRobot Alert: \${alertType} for \${monitorFriendlyName}\`);
  console.log(\`Details: \${alertDetails}\`);
  console.log(\`URL: \${monitorURL}\`);
  
  // Log to monitoring system
  fs.appendFileSync('uptimerobot-alerts.log', 
    \`\${new Date().toISOString()} [\${alertType}] \${monitorFriendlyName}: \${alertDetails}\\n\`
  );
  
  res.status(200).json({ received: true });
});
`;
}

// Usage instructions
function printUsageInstructions() {
  console.log(`
📋 RENDER MONITORING SETUP INSTRUCTIONS
======================================

1. UPDATE SERVICE URL:
   Set environment variable: RENDER_SERVICE_URL=https://your-app.onrender.com
   Or update MONITORING_CONFIG.serviceUrl in this file

2. UPTIMEROBOT SETUP (Recommended):
   - Sign up at uptimerobot.com (free tier available)
   - Create HTTP(s) monitor for your Render service
   - Set monitoring interval to 5 minutes
   - Add webhook URL if needed

3. ADD HEALTH ENDPOINT:
   Add this to your Express server:

   app.get('/health', (req, res) => {
     res.status(200).json({
       status: 'healthy',
       timestamp: new Date().toISOString(),
       uptime: process.uptime(),
       version: '1.0.0'
     });
   });

4. RUN MONITORING:
   node render-monitoring.js

5. FILES CREATED:
   - render-monitor.log (daily logs)
   - render-status.json (current status)
   - uptimerobot-alerts.log (webhook alerts)

6. MONITORING FEATURES:
   ✅ Prevents Render free tier sleep (14min intervals)
   ✅ Health checks with response time monitoring  
   ✅ Error logging and categorization
   ✅ Status reports and recommendations
   ✅ UptimeRobot webhook integration
   ✅ Graceful shutdown handling
`);
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    printUsageInstructions();
    process.exit(0);
  }
  
  if (args.includes('--webhook-code')) {
    console.log(createWebhookEndpoint());
    process.exit(0);
  }
  
  const monitor = new RenderMonitor();
  monitor.setupGracefulShutdown();
  monitor.startMonitoring();
  
  // Print usage info after startup
  setTimeout(() => {
    console.log('\n💡 Monitor is running! Use Ctrl+C to stop.');
    console.log('💡 Check render-status.json for detailed status reports.');
    console.log('💡 Use --help flag for setup instructions.');
  }, 2000);
}

export default RenderMonitor;