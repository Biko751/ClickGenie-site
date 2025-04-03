import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  Crown,
  Star,
  Clock,
  Award,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface VipPlan {
  id: 'monthly' | 'quarterly' | 'yearly';
  title: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

interface VipStatusResponse {
  vipMember: boolean;
  vipExpiry: string | null;
  benefits: string[] | null;
}

export default function VipMembership() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [vipStatus, setVipStatus] = useState<VipStatusResponse | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(true);

  // Fetch VIP status
  useEffect(() => {
    const fetchVipStatus = async () => {
      try {
        setIsStatusLoading(true);
        const response = await apiRequest('GET', '/api/vip/status');
        const data = await response.json();
        setVipStatus(data);
      } catch (error) {
        console.error('Failed to fetch VIP status:', error);
        toast({
          title: 'Error',
          description: 'Failed to load VIP membership status',
          variant: 'destructive',
        });
      } finally {
        setIsStatusLoading(false);
      }
    };

    fetchVipStatus();
  }, [toast]);

  const plans: VipPlan[] = [
    {
      id: 'monthly',
      title: 'Monthly',
      price: 19.99,
      duration: '30 days',
      features: [
        'Advanced geo-targeting options',
        'Higher click payouts (2x standard rate)',
        'Priority placement in offer rotations',
        'VIP-only offers access',
        'Reduced minimum withdrawal amount',
        'Same-day withdrawals'
      ]
    },
    {
      id: 'quarterly',
      title: 'Quarterly',
      price: 49.99,
      duration: '90 days',
      features: [
        'All Monthly features',
        'Ad-free dashboard experience',
        'Priority customer support',
        'Custom profile badge'
      ],
      popular: true,
      savings: 'Save 16%'
    },
    {
      id: 'yearly',
      title: 'Annual',
      price: 149.99,
      duration: '365 days',
      features: [
        'All Quarterly features',
        'Exclusive access to beta features',
        'Personalized offer recommendations',
        'Dedicated account manager'
      ],
      savings: 'Save 37%'
    }
  ];

  const handlePurchase = async (plan: VipPlan) => {
    if (!user) return;

    // Confirm purchase
    if (!window.confirm(`Are you sure you want to purchase the ${plan.title} VIP plan for ${formatCurrency(plan.price)}?`)) {
      return;
    }

    // Check if user has enough balance
    if (user.balance < plan.price) {
      toast({
        title: 'Insufficient Balance',
        description: `You need ${formatCurrency(plan.price)} to purchase this plan. Please earn more or make a deposit.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Make purchase API call
      const purchaseResponse = await apiRequest('POST', '/api/vip/purchase', { plan: plan.id });
      const purchaseData = await purchaseResponse.json();

      // Update user data in context
      const userResponse = await apiRequest('GET', '/api/user');
      const userData = await userResponse.json();
      updateUser(userData);

      // Refetch VIP status
      const statusResponse = await apiRequest('GET', '/api/vip/status');
      const statusData = await statusResponse.json();
      setVipStatus(statusData);

      // Invalidate transactions cache
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });

      toast({
        title: 'VIP Membership Purchased',
        description: `You are now a VIP member until ${formatDate(purchaseData.vipExpiry)}!`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: 'There was an error processing your VIP membership purchase.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isStatusLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-amber-400 to-yellow-600 text-white">
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6" />
          <CardTitle>VIP Membership</CardTitle>
        </div>
        <CardDescription className="text-white/90">
          Upgrade your experience and maximize your earnings
        </CardDescription>
      </CardHeader>

      <Tabs defaultValue={vipStatus?.vipMember ? "status" : "plans"}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plans">Membership Plans</TabsTrigger>
          <TabsTrigger value="status">Your VIP Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative overflow-hidden ${plan.popular ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 transform rotate-45 translate-x-[30%] translate-y-[-30%] shadow-sm">
                        POPULAR
                      </div>
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {plan.title}
                      {plan.popular && <Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
                    </CardTitle>
                    <CardDescription>
                      <div className="mt-2 flex items-end gap-1">
                        <span className="text-2xl font-bold">{formatCurrency(plan.price)}</span>
                        <span className="text-muted-foreground">/ {plan.duration}</span>
                      </div>
                      {plan.savings && (
                        <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">
                          {plan.savings}
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handlePurchase(plan)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing
                        </>
                      ) : (
                        <>Purchase</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="status">
          <CardContent className="pt-6">
            {vipStatus?.vipMember ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-amber-400 to-yellow-600 p-3 rounded-full">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Active VIP Member</h3>
                      <p className="text-sm text-muted-foreground">
                        Enjoy premium features and higher payouts
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-md border border-amber-100">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium">
                      Expires: {formatDate(vipStatus.vipExpiry || '')}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-amber-600" />
                    Your VIP Benefits
                  </h3>
                  <Separator className="mb-4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vipStatus.benefits?.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-muted/30 p-3 rounded-md">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-4">
                <div className="bg-muted p-4 rounded-full">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">You're not a VIP member yet</h3>
                <p className="text-muted-foreground max-w-md">
                  Unlock premium features, higher payouts, and exclusive offers by purchasing a VIP membership plan.
                </p>
                <Button 
                  onClick={() => document.querySelector('[value="plans"]')?.dispatchEvent(new Event('click'))}
                  className="mt-2"
                >
                  View Membership Plans
                </Button>
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}