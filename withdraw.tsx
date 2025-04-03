import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { withdrawSchema } from "@shared/schema";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DollarSign, 
  History,
  CreditCard,
  Bitcoin,
  Building
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type WithdrawFormValues = Omit<z.infer<typeof withdrawSchema>, "terms"> & {
  terms: boolean;
};

export default function Withdraw() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMethod, setSelectedMethod] = useState<string>("paypal");

  // Fetch transaction history
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  // Initialize the form
  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: 50,
      method: "paypal",
      address: "",
      terms: false,
    },
  });

  // Create withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: async (values: WithdrawFormValues) => {
      const response = await apiRequest("POST", "/api/withdrawals", values);
      return response.json();
    },
    onSuccess: (data) => {
      // Update user balance locally
      if (user) {
        updateUser({
          balance: user.balance - form.getValues().amount,
        });
      }
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      
      // Show success toast
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted successfully.",
      });
      
      // Reset the form
      form.reset();
    },
    onError: (error) => {
      console.error("Withdrawal error:", error);
      toast({
        title: "Withdrawal Failed",
        description: "There was an error processing your withdrawal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = async (values: WithdrawFormValues) => {
    try {
      await withdrawMutation.mutateAsync(values);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // Format transaction status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format transaction type
  const getTransactionTypeClass = (type: string, amount: number) => {
    if (type === "withdrawal" || amount < 0) {
      return "text-red-600 font-medium";
    }
    return "text-green-600 font-medium";
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Withdrawal Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <DollarSign className="mr-2 h-5 w-5 text-primary" />
            Withdraw Your Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/10 rounded-lg p-4 mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-2xl font-bold text-primary">
                {user ? formatCurrency(user.balance) : "$0.00"}
              </p>
            </div>
            <div className="bg-white p-2 rounded-md text-xs text-gray-600">
              <p>Minimum withdrawal: $50</p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <div className="grid grid-cols-3 gap-3">
                      <div
                        className={`border rounded-md p-3 text-center cursor-pointer transition ${
                          field.value === "paypal"
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-primary hover:bg-primary/5"
                        }`}
                        onClick={() => {
                          field.onChange("paypal");
                          setSelectedMethod("paypal");
                        }}
                      >
                        <CreditCard 
                          className={`mx-auto mb-1 ${
                            field.value === "paypal" ? "text-primary" : "text-gray-500"
                          }`} 
                        />
                        <p className="text-sm font-medium">PayPal</p>
                      </div>
                      <div
                        className={`border rounded-md p-3 text-center cursor-pointer transition ${
                          field.value === "bitcoin"
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-primary hover:bg-primary/5"
                        }`}
                        onClick={() => {
                          field.onChange("bitcoin");
                          setSelectedMethod("bitcoin");
                        }}
                      >
                        <Bitcoin 
                          className={`mx-auto mb-1 ${
                            field.value === "bitcoin" ? "text-primary" : "text-gray-500"
                          }`} 
                        />
                        <p className="text-sm font-medium">Bitcoin</p>
                      </div>
                      <div
                        className={`border rounded-md p-3 text-center cursor-pointer transition ${
                          field.value === "bank"
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-primary hover:bg-primary/5"
                        }`}
                        onClick={() => {
                          field.onChange("bank");
                          setSelectedMethod("bank");
                        }}
                      >
                        <Building 
                          className={`mx-auto mb-1 ${
                            field.value === "bank" ? "text-primary" : "text-gray-500"
                          }`} 
                        />
                        <p className="text-sm font-medium">Bank</p>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedMethod === "paypal" 
                        ? "PayPal Email" 
                        : selectedMethod === "bitcoin" 
                          ? "Bitcoin Address" 
                          : "Bank Account Details"
                      }
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={
                          selectedMethod === "paypal" 
                            ? "your-email@example.com" 
                            : selectedMethod === "bitcoin" 
                              ? "Your Bitcoin wallet address" 
                              : "Bank account number, routing number, etc."
                        } 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount to Withdraw</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                        <Input 
                          type="number" 
                          min={50} 
                          max={user?.balance || 50} 
                          step="0.01" 
                          className="pl-8" 
                          placeholder="50.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <div className="flex justify-between mt-1">
                      <FormDescription>Min: $50</FormDescription>
                      <FormDescription>
                        Max: {user ? formatCurrency(user.balance) : "$0.00"}
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I confirm this withdrawal request and understand it may take 1-3 business days to process.
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={withdrawMutation.isPending || (user?.balance || 0) < 50}
              >
                {withdrawMutation.isPending ? "Processing..." : "Request Withdrawal"}
              </Button>
              
              {(user?.balance || 0) < 50 && (
                <p className="text-sm text-red-500 text-center">
                  You need at least $50 in your balance to withdraw.
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <History className="mr-2 h-5 w-5 text-primary" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="earning">Earnings</SelectItem>
                <SelectItem value="referral">Referral Commissions</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="30days">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Last 30 Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="allTime">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isLoadingTransactions ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className={`text-right ${getTransactionTypeClass(transaction.type, transaction.amount)}`}>
                        {transaction.amount > 0 ? "+" : ""}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  Showing {transactions.length} transactions
                </span>
                <div className="flex items-center space-x-1">
                  <Button variant="outline" size="icon" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                  </Button>
                  <Button variant="outline" size="sm" className="bg-primary text-white hover:bg-primary/90">1</Button>
                  <Button variant="outline" size="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg font-medium mb-2">No transactions yet</p>
              <p>Your transaction history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
