import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Search, 
  Filter,
  Calendar,
  Tag,
  Hash,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Deal {
  id: number;
  title: string;
  category: string;
  discountPercentage: number;
  verificationPin: string;
  validUntil: string;
  status: 'active' | 'pending' | 'expired';
  claimsCount?: number;
  maxRedemptions?: number;
}

interface PinTrackerProps {
  deals: Deal[];
}

export default function PinTracker({ deals }: PinTrackerProps) {
  const [showPins, setShowPins] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  // Filter and search deals
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.verificationPin.includes(searchTerm);
    
    const matchesFilter = filterStatus === "all" || deal.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Group deals by status
  const dealsByStatus = {
    active: filteredDeals.filter(deal => deal.status === 'active'),
    pending: filteredDeals.filter(deal => deal.status === 'pending'),
    expired: filteredDeals.filter(deal => deal.status === 'expired')
  };

  const copyToClipboard = (text: string, dealTitle: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "PIN Copied",
      description: `PIN for "${dealTitle}" copied to clipboard`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const DealCard = ({ deal }: { deal: Deal }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-foreground dark:text-gray-100 mb-1">
              {deal.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Tag className="h-3 w-3" />
              {deal.category}
              <span>•</span>
              {deal.discountPercentage}% OFF
            </div>
          </div>
          <div className="flex items-center gap-1">
            {getStatusIcon(deal.status)}
            <Badge className={`text-xs ${getStatusColor(deal.status)}`}>
              {deal.status}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          {/* PIN Display */}
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">PIN:</span>
              <code className={`font-mono text-lg font-bold ${showPins ? 'text-blue-600' : 'text-gray-400'}`}>
                {showPins ? deal.verificationPin : '••••'}
              </code>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(deal.verificationPin, deal.title)}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>

          {/* Deal Stats */}
          <div className="flex justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Valid until: {new Date(deal.validUntil).toLocaleDateString()}
            </div>
            {deal.claimsCount !== undefined && (
              <div>
                Claims: {deal.claimsCount}
                {deal.maxRedemptions && `/${deal.maxRedemptions}`}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Hash className="h-4 w-4" />
          PIN Tracker ({deals.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Deal PIN Tracker
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by deal title, category, or PIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={showPins ? "default" : "outline"}
                size="sm"
                onClick={() => setShowPins(!showPins)}
                className="gap-2"
              >
                {showPins ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPins ? "Hide PINs" : "Show PINs"}
              </Button>
            </div>
          </div>

          {/* Deal Lists by Status */}
          <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({deals.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({dealsByStatus.active.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({dealsByStatus.pending.length})</TabsTrigger>
              <TabsTrigger value="expired">Expired ({dealsByStatus.expired.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="max-h-96 overflow-y-auto space-y-3">
                {filteredDeals.length > 0 ? (
                  filteredDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No deals found matching your search.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="active" className="mt-4">
              <div className="max-h-96 overflow-y-auto space-y-3">
                {dealsByStatus.active.length > 0 ? (
                  dealsByStatus.active.map((deal) => <DealCard key={deal.id} deal={deal} />)
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No active deals found.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <div className="max-h-96 overflow-y-auto space-y-3">
                {dealsByStatus.pending.length > 0 ? (
                  dealsByStatus.pending.map((deal) => <DealCard key={deal.id} deal={deal} />)
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No pending deals found.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="expired" className="mt-4">
              <div className="max-h-96 overflow-y-auto space-y-3">
                {dealsByStatus.expired.length > 0 ? (
                  dealsByStatus.expired.map((deal) => <DealCard key={deal.id} deal={deal} />)
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No expired deals found.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Tips */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1 text-sm">
              💡 PIN Management Tips:
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Use the "Show PINs" button to reveal all verification codes</li>
              <li>• Click the copy button next to any PIN to copy it to clipboard</li>
              <li>• Search by deal title, category, or PIN number to find specific deals</li>
              <li>• Filter by status to focus on active, pending, or expired deals</li>
              <li>• Keep this window open while serving customers for quick PIN access</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}