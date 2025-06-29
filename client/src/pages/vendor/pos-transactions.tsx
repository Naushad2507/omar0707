import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Receipt, 
  Search, 
  Filter, 
  Download,
  Calendar,
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock
} from "lucide-react";
import { format } from "date-fns";

interface PosTransaction {
  id: number;
  sessionId: number;
  dealId: number;
  customerId: number | null;
  transactionType: string;
  amount: string;
  savingsAmount: string;
  pinVerified: boolean;
  paymentMethod: string | null;
  status: string;
  receiptNumber: string | null;
  notes: string | null;
  processedAt: Date;
  deal?: {
    title: string;
    category: string;
    discountPercentage: number;
  };
}

export default function PosTransactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");

  // Fetch POS transactions
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['/api/pos/transactions'],
  });

  // Fetch POS sessions for summary
  const { data: sessions = [] } = useQuery({
    queryKey: ['/api/pos/sessions'],
  });

  const filteredTransactions = transactions.filter((transaction: PosTransaction) => {
    const matchesSearch = transaction.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.deal?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus;
    const matchesPayment = filterPaymentMethod === "all" || transaction.paymentMethod === filterPaymentMethod;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalRevenue = transactions.reduce((sum: number, t: PosTransaction) => sum + parseFloat(t.amount), 0);
  const totalSavings = transactions.reduce((sum: number, t: PosTransaction) => sum + parseFloat(t.savingsAmount), 0);
  const todayTransactions = transactions.filter((t: PosTransaction) => 
    format(new Date(t.processedAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'refunded': return 'outline';
      default: return 'secondary';
    }
  };

  const getPaymentMethodIcon = (method: string | null) => {
    switch (method) {
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'cash': return <DollarSign className="h-4 w-4" />;
      case 'upi': return <Receipt className="h-4 w-4" />;
      case 'wallet': return <Receipt className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">POS Transactions</h1>
          <p className="text-muted-foreground">Transaction history and analytics</p>
        </div>
        
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {transactions.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalSavings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total savings provided
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Transactions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              ₹{todayTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2)} revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter((s: any) => s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by receipt number or deal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Payment Method</label>
              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="wallet">Wallet</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {filteredTransactions.length} of {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction: PosTransaction) => (
                <div key={transaction.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                        <span className="font-semibold">#{transaction.receiptNumber}</span>
                      </div>
                      <Badge variant={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                      {transaction.pinVerified && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          PIN Verified
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{transaction.amount}</p>
                      <p className="text-sm text-green-600">₹{transaction.savingsAmount} saved</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Deal</p>
                      <p className="font-medium">{transaction.deal?.title || 'Unknown Deal'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium capitalize">
                        {transaction.paymentMethod || 'Cash'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date & Time</p>
                      <p className="font-medium">
                        {format(new Date(transaction.processedAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>

                  {transaction.notes && (
                    <>
                      <Separator className="my-3" />
                      <div>
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="text-sm">{transaction.notes}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}