import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, Shield } from "lucide-react";
import InstoredeelzLogo from "@/components/ui/instoredealz-logo";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="mb-4">
              <InstoredeelzLogo size="lg" className="text-white" />
            </div>
            <p className="text-gray-300 mb-4">
              Your ultimate destination for discovering amazing deals from local businesses across India.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Customers */}
          <div>
            <h4 className="font-semibold mb-4">For Customers</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link to="/customer/deals" className="hover:text-white transition-colors">
                  Browse Deals
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Membership Plans
                </Link>
              </li>
              <li>
                <Link to="/customer/dashboard" className="hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* For Businesses */}
          <div>
            <h4 className="font-semibold mb-4">For Businesses</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link to="/vendor/benefits" className="hover:text-white transition-colors">
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link to="/vendor/dashboard" className="hover:text-white transition-colors">
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <a href="#marketing" className="hover:text-white transition-colors">
                  Marketing Tools
                </a>
              </li>
              <li>
                <a href="#support" className="hover:text-white transition-colors">
                  Business Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Cookie Consent
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-300 text-sm space-y-1">
            <p>© 2024 QuantumQuirk EcomFlow Private Limited. All rights reserved.</p>
            <p>Contact: support@instoredealz.com | Phone: 90044 08584</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-300">🇮🇳 Made in India</span>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-success" />
              <span className="text-gray-300 text-sm">Secure & Trusted</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
