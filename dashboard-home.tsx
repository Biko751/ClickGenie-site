import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp, Megaphone, Users } from "lucide-react";

interface Activity {
  id: number;
  type: string;
  description: string;
  time: string;
}

interface Offer {
  id: number;
  title: string;
  network: string;
  epc: number;
  countries: string;
  maxClicksPerDay: number;
  active: boolean;
}

interface Referral {
  id: number;
  username: string;
  earnings: number;
}

export default function DashboardHome() {
  const { user } = useAuth();
  
  // Fetch user's transactions
  const { data: transactions } = useQuery({
    queryKey: ['/api/transactions'],
    enabled: !!user,
  });
  
  // Fetch user's offers
  const { data: offers } = useQuery({
    queryKey: ['/api/offers', { userId: user?.id }],
    enabled: !!user,
  });
  
  // Fetch user's referrals
  const { data: referrals } = useQuery({
    queryKey: ['/api/referrals'],
    enabled: !!user,
  });

  // Sample data for earnings chart (in a real app, this would come from API)
  const earningsData = [
    { name: 'Mon', earnings: 12.5 },
    { name: 'Tue', earnings: 19.8 },
    { name: 'Wed', earnings: 15.2 },
    { name: 'Thu', earnings: 22.1 },
    { name: 'Fri', earnings: 18.9 },
    { name: 'Sat', earnings: 10.5 },
    { name: 'Sun', earnings: 8.7 },
  ];
  
  // Mock activities based on transactions and other data
  const generateActivities = (): Activity[] => {
    const activities: Activity[] = [];
    
    if (transactions?.length) {
      transactions.slice(0, 5).forEach((transaction, index) => {
        activities.push({
          id: index,
          type: transaction.type,
          description: transaction.description,
          time: timeAgo(transaction.createdAt)
        });
      });
    }
    
    return activities.length ? activities : [];
  };
  
  const activities = generateActivities();
  
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold flex items-center">
            <Activity className="mr-2 h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <ul className="space-y-4">
              {activities.map((activity) => (
                <li key={activity.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-gray-500">
                        Type: {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No recent activity to display</p>
              <p className="text-sm mt-1">Start clicking on offers or submit your own!</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Earnings Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            Earnings Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                <Bar dataKey="earnings" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-600">Today</p>
              <p className="font-bold text-primary">{formatCurrency(8.7)}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-600">This Week</p>
              <p className="font-bold text-primary">{formatCurrency(107.7)}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-600">This Month</p>
              <p className="font-bold text-primary">{formatCurrency(342.75)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Your Active Offers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold flex items-center">
            <Megaphone className="mr-2 h-5 w-5 text-primary" />
            Your Active Offers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {offers && offers.length > 0 ? (
            <div className="space-y-4">
              {offers.slice(0, 3).map((offer: Offer) => (
                <div key={offer.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{offer.title}</h3>
                    <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">
                      {offer.active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-gray-500">Network: <span className="text-gray-900">{offer.network}</span></p>
                      <p className="text-gray-500">EPC: <span className="text-gray-900">{formatCurrency(offer.epc)}</span></p>
                    </div>
                    <div>
                      <p className="text-gray-500">
                        Country: <span className="text-gray-900">{offer.countries}</span>
                      </p>
                      <p className="text-gray-500">
                        Clicks: <span className="text-gray-900">24/{offer.maxClicksPerDay}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button className="text-xs bg-primary text-white rounded px-2 py-1 hover:bg-primary/90 transition">
                      Edit
                    </button>
                    <button className="text-xs bg-gray-200 text-gray-800 rounded px-2 py-1 hover:bg-gray-300 transition">
                      {offer.active ? 'Pause' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No active offers</p>
              <p className="text-sm mt-1">Create your first offer to start receiving clicks!</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Referral Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Referral Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-purple-600/10 rounded-md">
            <p className="font-medium mb-2">Your Referral Link:</p>
            <div className="flex">
              <input 
                type="text" 
                readOnly 
                value={`${window.location.origin}/signup?ref=${user?.referralCode}`}
                className="flex-grow bg-white border border-gray-300 rounded-l-md px-3 py-2 text-sm"
              />
              <button 
                className="bg-purple-600 text-white px-3 py-2 rounded-r-md hover:bg-purple-700 transition"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${user?.referralCode}`);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-md p-3 text-center">
              <p className="text-xs text-gray-600">Active Referrals</p>
              <p className="font-bold text-purple-600 text-xl">{referrals?.length || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-3 text-center">
              <p className="text-xs text-gray-600">Referral Earnings</p>
              <p className="font-bold text-purple-600 text-xl">{formatCurrency(78.50)}</p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-medium mb-2">Recent Referrals</h3>
            {referrals && referrals.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {referrals.slice(0, 3).map((referral: any) => (
                  <li key={referral.id} className="flex justify-between">
                    <span>{referral.username}</span>
                    <span className="text-purple-600">{formatCurrency(12.50)} earned</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No referrals yet. Share your link to start earning!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
