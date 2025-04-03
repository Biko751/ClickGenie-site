import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, RefreshCw, Ban, CheckCircle2, Trash, Edit, Eye } from 'lucide-react';

// Type definitions
type User = {
  id: number;
  username: string;
  email: string;
  balance: number;
  role: string;
  active: boolean;
  vipMember: boolean;
  createdAt: string;
  clicksGiven: number;
  clicksReceived: number;
};

type Offer = {
  id: number;
  userId: number;
  title: string;
  url: string;
  rewardAmount: number;
  active: boolean;
  createdAt: string;
};

type Transaction = {
  id: number;
  userId: number;
  amount: number;
  type: string;
  description: string;
  status: string;
  createdAt: string;
};

type Withdrawal = {
  id: number;
  userId: number;
  amount: number;
  method: string;
  address: string;
  status: string;
  createdAt: string;
  processedAt: string | null;
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [modifyBalance, setModifyBalance] = useState<string>('');
  const [balanceReason, setBalanceReason] = useState<string>('');

  // Redirect non-admin users
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access the admin panel.',
        variant: 'destructive',
      });
    }
  }, [user, navigate, toast]);

  // Fetch all users
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/users');
      const data = await res.json();
      return data as User[];
    },
    enabled: !!user && user.role === 'admin',
  });

  // Fetch all offers
  const { data: offers, isLoading: offersLoading, refetch: refetchOffers } = useQuery({
    queryKey: ['/api/admin/offers'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/offers');
      const data = await res.json();
      return data as Offer[];
    },
    enabled: !!user && user.role === 'admin',
  });

  // Fetch all transactions
  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ['/api/admin/transactions'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/transactions');
      const data = await res.json();
      return data as Transaction[];
    },
    enabled: !!user && user.role === 'admin',
  });

  // Fetch all withdrawals
  const { data: withdrawals, isLoading: withdrawalsLoading, refetch: refetchWithdrawals } = useQuery({
    queryKey: ['/api/admin/withdrawals'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/withdrawals');
      const data = await res.json();
      return data as Withdrawal[];
    },
    enabled: !!user && user.role === 'admin',
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User> & { id: number }) => {
      const { id, ...updates } = userData;
      const res = await apiRequest('PATCH', `/api/admin/users/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'User Updated', description: 'User has been successfully updated.' });
      setIsUserDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Update Failed', 
        description: error.message || 'Failed to update user',
        variant: 'destructive'
      });
    },
  });

  // Update offer mutation
  const updateOfferMutation = useMutation({
    mutationFn: async (offerData: Partial<Offer> & { id: number }) => {
      const { id, ...updates } = offerData;
      const res = await apiRequest('PATCH', `/api/admin/offers/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
      toast({ title: 'Offer Updated', description: 'Offer has been successfully updated.' });
      setIsOfferDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Update Failed', 
        description: error.message || 'Failed to update offer',
        variant: 'destructive'
      });
    },
  });

  // Delete offer mutation
  const deleteOfferMutation = useMutation({
    mutationFn: async (offerId: number) => {
      const res = await apiRequest('DELETE', `/api/admin/offers/${offerId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
      toast({ title: 'Offer Deleted', description: 'Offer has been successfully deleted.' });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Delete Failed', 
        description: error.message || 'Failed to delete offer',
        variant: 'destructive' 
      });
    },
  });

  // Update withdrawal status mutation
  const updateWithdrawalMutation = useMutation({
    mutationFn: async (data: { id: number; status: string }) => {
      const res = await apiRequest('PATCH', `/api/admin/withdrawals/${data.id}`, { status: data.status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
      toast({ title: 'Status Updated', description: 'Withdrawal status has been updated.' });
      setIsWithdrawalDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Update Failed', 
        description: error.message || 'Failed to update withdrawal status',
        variant: 'destructive'
      });
    },
  });

  // Handle modifying user balance
  const modifyUserBalanceMutation = useMutation({
    mutationFn: async (data: { userId: number; amount: number; reason: string }) => {
      const res = await apiRequest('POST', `/api/admin/users/${data.userId}/balance`, { 
        amount: data.amount,
        reason: data.reason
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });
      toast({ title: 'Balance Updated', description: 'User balance has been modified.' });
      setModifyBalance('');
      setBalanceReason('');
    },
    onError: (error: any) => {
      toast({ 
        title: 'Update Failed', 
        description: error.message || 'Failed to modify balance',
        variant: 'destructive'
      });
    },
  });

  // Filter users based on search term
  const filteredUsers = users?.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter offers based on search term
  const filteredOffers = offers?.filter(
    (offer) =>
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle balance modification
  const handleModifyBalance = () => {
    if (!selectedUser) return;
    
    const amount = parseFloat(modifyBalance);
    if (isNaN(amount)) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid number',
        variant: 'destructive',
      });
      return;
    }

    if (!balanceReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for the balance modification',
        variant: 'destructive',
      });
      return;
    }

    modifyUserBalanceMutation.mutate({
      userId: selectedUser.id,
      amount,
      reason: balanceReason
    });
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (!user || user.role !== 'admin') {
    return <div className="flex justify-center items-center h-screen">Access denied</div>;
  }

  const refreshData = () => {
    refetchUsers();
    refetchOffers();
    refetchTransactions();
    refetchWithdrawals();
    toast({ title: 'Data Refreshed', description: 'All data has been refreshed.' });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={refreshData} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <div className="flex items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users, offers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage all users on the platform. Total users: {users?.length || 0}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>VIP</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center">No users found</TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>${user.balance.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.active ? 'default' : 'destructive'}>
                              {user.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.vipMember ? 'default' : 'outline'}>
                              {user.vipMember ? 'VIP' : 'Standard'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsUserDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offers Tab */}
        <TabsContent value="offers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Offer Management</CardTitle>
              <CardDescription>
                Manage all offers on the platform. Total offers: {offers?.length || 0}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {offersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOffers?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">No offers found</TableCell>
                      </TableRow>
                    ) : (
                      filteredOffers?.map((offer) => (
                        <TableRow key={offer.id}>
                          <TableCell>{offer.id}</TableCell>
                          <TableCell>{offer.userId}</TableCell>
                          <TableCell>{offer.title}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{offer.url}</TableCell>
                          <TableCell>${offer.rewardAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={offer.active ? 'default' : 'destructive'}>
                              {offer.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(offer.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedOffer(offer);
                                  setIsOfferDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedOffer(offer);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => window.open(offer.url, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View all transactions on the platform. Total transactions: {transactions?.length || 0}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">No transactions found</TableCell>
                      </TableRow>
                    ) : (
                      transactions?.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{tx.id}</TableCell>
                          <TableCell>{tx.userId}</TableCell>
                          <TableCell>
                            <span className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                              ${Math.abs(tx.amount).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{tx.type}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{tx.description}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={tx.status === 'completed' ? 'default' : 
                                      tx.status === 'pending' ? 'outline' : 'destructive'}
                            >
                              {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(tx.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>
                Manage withdrawal requests. Total withdrawals: {withdrawals?.length || 0}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawalsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Processed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center">No withdrawal requests found</TableCell>
                      </TableRow>
                    ) : (
                      withdrawals?.map((withdrawal) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell>{withdrawal.id}</TableCell>
                          <TableCell>{withdrawal.userId}</TableCell>
                          <TableCell>${withdrawal.amount.toFixed(2)}</TableCell>
                          <TableCell>{withdrawal.method}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{withdrawal.address}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                withdrawal.status === 'completed' ? 'default' :
                                withdrawal.status === 'pending' ? 'outline' :
                                'destructive'
                              }
                            >
                              {withdrawal.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(withdrawal.createdAt)}</TableCell>
                          <TableCell>{withdrawal.processedAt ? formatDate(withdrawal.processedAt) : 'N/A'}</TableCell>
                          <TableCell>
                            {withdrawal.status === 'pending' && (
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedWithdrawal(withdrawal);
                                    setIsWithdrawalDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Edit Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">ID:</div>
                <div className="col-span-3">{selectedUser.id}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">Username:</div>
                <div className="col-span-3">{selectedUser.username}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">Email:</div>
                <div className="col-span-3">{selectedUser.email}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">Current Balance:</div>
                <div className="col-span-3">${selectedUser.balance.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">Modify Balance:</div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder="+/- amount"
                    value={modifyBalance}
                    onChange={(e) => setModifyBalance(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter positive value to add funds, negative to deduct
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">Reason:</div>
                <div className="col-span-3">
                  <Input
                    placeholder="Reason for balance modification"
                    value={balanceReason}
                    onChange={(e) => setBalanceReason(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">Set Status:</div>
                <div className="col-span-3">
                  <Select
                    value={selectedUser.active ? 'active' : 'inactive'}
                    onValueChange={(value) => 
                      setSelectedUser({...selectedUser, active: value === 'active'})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">VIP Status:</div>
                <div className="col-span-3">
                  <Select
                    value={selectedUser.vipMember ? 'vip' : 'standard'}
                    onValueChange={(value) => 
                      setSelectedUser({...selectedUser, vipMember: value === 'vip'})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select VIP status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vip">VIP Member</SelectItem>
                      <SelectItem value="standard">Standard User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">Role:</div>
                <div className="col-span-3">
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value) => 
                      setSelectedUser({...selectedUser, role: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-between">
            {modifyBalance && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleModifyBalance}
                disabled={modifyUserBalanceMutation.isPending}
              >
                {modifyUserBalanceMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Apply Balance Change
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="default"
                onClick={() => {
                  if (selectedUser) {
                    updateUserMutation.mutate({
                      id: selectedUser.id,
                      active: selectedUser.active,
                      vipMember: selectedUser.vipMember,
                      role: selectedUser.role
                    });
                  }
                }}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offer Edit Dialog */}
      <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Offer</DialogTitle>
            <DialogDescription>
              Update offer details and settings
            </DialogDescription>
          </DialogHeader>
          {selectedOffer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">ID:</div>
                <div className="col-span-3">{selectedOffer.id}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">User ID:</div>
                <div className="col-span-3">{selectedOffer.userId}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">Title:</div>
                <div className="col-span-3">
                  <Input
                    value={selectedOffer.title}
                    onChange={(e) => 
                      setSelectedOffer({...selectedOffer, title: e.target.value})
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">URL:</div>
                <div className="col-span-3">
                  <Input
                    value={selectedOffer.url}
                    onChange={(e) => 
                      setSelectedOffer({...selectedOffer, url: e.target.value})
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">Reward Amount:</div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={selectedOffer.rewardAmount}
                    onChange={(e) => 
                      setSelectedOffer({
                        ...selectedOffer, 
                        rewardAmount: parseFloat(e.target.value) || 0
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">Status:</div>
                <div className="col-span-3">
                  <Select
                    value={selectedOffer.active ? 'active' : 'inactive'}
                    onValueChange={(value) => 
                      setSelectedOffer({...selectedOffer, active: value === 'active'})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="default"
              onClick={() => {
                if (selectedOffer) {
                  updateOfferMutation.mutate({
                    id: selectedOffer.id,
                    title: selectedOffer.title,
                    url: selectedOffer.url,
                    rewardAmount: selectedOffer.rewardAmount,
                    active: selectedOffer.active
                  });
                }
              }}
              disabled={updateOfferMutation.isPending}
            >
              {updateOfferMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Offer Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the offer. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedOffer) {
                  deleteOfferMutation.mutate(selectedOffer.id);
                }
              }}
              disabled={deleteOfferMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteOfferMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Withdrawal Status Update Dialog */}
      <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Withdrawal Status</DialogTitle>
            <DialogDescription>
              Change the status of this withdrawal request
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">ID:</div>
                <div className="col-span-3">{selectedWithdrawal.id}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">User ID:</div>
                <div className="col-span-3">{selectedWithdrawal.userId}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">Amount:</div>
                <div className="col-span-3">${selectedWithdrawal.amount.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">Method:</div>
                <div className="col-span-3">{selectedWithdrawal.method}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">Address:</div>
                <div className="col-span-3">{selectedWithdrawal.address}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">Current Status:</div>
                <div className="col-span-3">
                  <Badge 
                    variant={
                      selectedWithdrawal.status === 'completed' ? 'default' :
                      selectedWithdrawal.status === 'pending' ? 'outline' :
                      'destructive'
                    }
                  >
                    {selectedWithdrawal.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">Update Status:</div>
                <div className="col-span-3">
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      onClick={() => {
                        updateWithdrawalMutation.mutate({
                          id: selectedWithdrawal.id,
                          status: 'completed'
                        });
                      }}
                      disabled={updateWithdrawalMutation.isPending}
                      className="flex-1"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        updateWithdrawalMutation.mutate({
                          id: selectedWithdrawal.id,
                          status: 'rejected'
                        });
                      }}
                      disabled={updateWithdrawalMutation.isPending}
                      className="flex-1"
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;