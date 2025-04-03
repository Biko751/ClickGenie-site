import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  UserCircle, 
  Send, 
  Plus,
  DollarSign,
  MousePointer,
  Users,
  TrendingUp,
  Crown
} from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";

// Import dashboard components
import PostOffer from "@/components/dashboard/post-offer";
import ClickOffers from "@/components/dashboard/click-offers";
import DashboardHome from "@/components/dashboard/dashboard-home";
import Referrals from "@/components/dashboard/referrals";
import Leaderboard from "@/components/dashboard/leaderboard";
import CommunityChat from "@/components/dashboard/community-chat";
import Withdraw from "@/components/dashboard/withdraw";
import VipMembership from "@/components/dashboard/vip-membership";
// Define a transaction interface 
interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

type DashboardTab = 
  | "dashboard-home"
  | "post-offer"
  | "click-offers"
  | "referrals"
  | "leaderboard"
  | "community"
  | "withdraw"
  | "vip";

interface ChatMessage {
  id: number;
  userId: number;
  username: string;
  channel: string;
  content: string;
  createdAt: string;
}

interface Activity {
  id: number;
  type: string;
  description: string;
  time: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard-home");
  const { isConnected, sendMessage, getMessagesByType } = useWebSocket();

  // Animation control effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Fetch user's transactions for activity feed
  const { data: transactions } = useQuery({
    queryKey: ['/api/transactions'],
    enabled: !!user,
  });
  
  // Fetch chat messages
  const { data: chatHistory, isLoading: isLoadingChat } = useQuery({
    queryKey: ['/api/chat', 'general'],
    queryFn: async () => {
      const response = await fetch('/api/chat/general');
      if (!response.ok) throw new Error("Failed to fetch chat messages");
      return response.json();
    },
    enabled: !!user,
  });

  // Get websocket messages
  const wsMessages = getMessagesByType("chat").filter(
    (msg) => msg.message.channel === 'general'
  );

  // Combine chat history with websocket messages
  const allMessages = [...(chatHistory || [])];
  
  // Add websocket messages that aren't already in the history
  wsMessages.forEach((msg) => {
    const exists = allMessages.some((m) => m.id === msg.message.id);
    if (!exists) {
      allMessages.push(msg.message);
    }
  });

  // Sort messages by creation time
  allMessages.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Send a new message
  const handleSendMessage = () => {
    if (!message.trim() || !isConnected || !user) return;
    
    const success = sendMessage({
      type: "chat",
      channelId: 'general',
      content: message.trim(),
    });
    
    if (success) {
      setMessage("");
    } else {
      toast({
        title: "Connection Issue",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Generate avatar initials
  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  // Generate random color for user avatar based on username
  const getUserColor = (username: string) => {
    const colors = [
      "bg-red-100 text-red-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
    ];
    
    // Use a hash function to consistently get the same color for the same username
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorIndex = hash % colors.length;
    
    return colors[colorIndex];
  };

  // Generate activities based on transactions
  const generateActivities = () => {
    if (transactions && Array.isArray(transactions) && transactions.length > 0) {
      return transactions.slice(0, 5).map((transaction: Transaction, index: number) => ({
        id: index,
        type: transaction.type,
        description: transaction.description,
        time: timeAgo(transaction.createdAt)
      }));
    }
    return [];
  };

  const activities = generateActivities();

  // If user is not available, show loading spinner
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6 overflow-x-hidden">
      <div className="container mx-auto px-4">
        {/* Dashboard Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <span 
                  onClick={() => setActiveTab("dashboard-home")} 
                  className="cursor-pointer text-primary hover:underline flex items-center"
                >
                  <UserCircle className="mr-2 h-6 w-6" />
                  {user.username}
                </span>
                <span className="ml-2 text-gray-900">Dashboard</span>
              </h1>
              <p className="text-gray-600">
                Last login: {new Date(user.lastLogin || Date.now()).toLocaleString()}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-primary/10 rounded-md px-4 py-2 text-center">
                <p className="text-xs text-gray-600">Balance</p>
                <p className="text-lg font-bold text-primary">${user.balance.toFixed(2)}</p>
              </div>
              <div className="bg-purple-600/10 rounded-md px-4 py-2 text-center">
                <p className="text-xs text-gray-600">Total Clicks Received</p>
                <p className="text-lg font-bold text-purple-600">{user.clicksReceived}</p>
              </div>
              <div className="bg-green-600/10 rounded-md px-4 py-2 text-center">
                <p className="text-xs text-gray-600">Total Clicks Given</p>
                <p className="text-lg font-bold text-green-600">{user.clicksGiven}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Interactive Dashboard with Animations */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* User Info Section - Slides in from the left */}
          <div 
            className={`w-full lg:w-1/2 transition-all duration-1000 ease-out transform ${
              isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            }`}
          >
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center">
                  <UserCircle className="mr-2 h-5 w-5 text-primary" />
                  User Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {/* User Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Earnings</p>
                      <p className="text-xl font-bold">${user.balance.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-full bg-purple-600/20 flex items-center justify-center mr-3">
                      <MousePointer className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Clicks</p>
                      <p className="text-xl font-bold">{user.clicksGiven}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-full bg-green-600/20 flex items-center justify-center mr-3">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Conversion Rate</p>
                      <p className="text-xl font-bold">4.2%</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-full bg-blue-600/20 flex items-center justify-center mr-3">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Referrals</p>
                      <p className="text-xl font-bold">{activities.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Post Offer CTA */}
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white p-6 mb-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => setActiveTab("post-offer")}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  <span className="text-lg">Post an Offer</span>
                </Button>

                {/* Recent Activity */}
                <div>
                  <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                  {activities.length > 0 ? (
                    <ScrollArea className="h-[220px] pr-4">
                      <ul className="space-y-4">
                        {activities.map((activity: Activity) => (
                          <li 
                            key={activity.id} 
                            className="border-b border-gray-100 pb-3 last:border-0 hover:bg-gray-50 p-2 rounded transition-colors"
                          >
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
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                      <p>No recent activity to display</p>
                      <p className="text-sm mt-1">Start clicking on offers or submit your own!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Section - Slides in from the right */}
          <div 
            className={`w-full lg:w-1/2 transition-all duration-1000 ease-out transform ${
              isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            } delay-300`}
          >
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5 text-primary" />
                  Community Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-grow flex flex-col">
                {/* Messages Area */}
                <ScrollArea className="flex-grow mb-4">
                  {isLoadingChat ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : allMessages && allMessages.length > 0 ? (
                    <div className="space-y-4">
                      {allMessages.map((message: ChatMessage) => (
                        <div 
                          key={message.id} 
                          className="flex hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 transform hover:scale-[1.01]"
                        >
                          <div 
                            className={`w-10 h-10 rounded-full ${getUserColor(message.username)} flex items-center justify-center mr-3 flex-shrink-0`}
                          >
                            <span>{getInitials(message.username)}</span>
                          </div>
                          <div>
                            <div className="flex items-center mb-1">
                              <span className="font-medium mr-2">{message.username}</span>
                              <span className="text-xs text-gray-500">{timeAgo(message.createdAt)}</span>
                            </div>
                            <p className="text-gray-800">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                      <UserCircle className="h-12 w-12 mb-2" />
                      <p className="text-lg font-medium">No messages yet</p>
                      <p className="text-sm">Be the first to start the conversation!</p>
                    </div>
                  )}
                </ScrollArea>
                
                {/* Message Input */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Type your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-grow"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!message.trim() || !isConnected}
                      className="transition-all duration-300 hover:bg-primary/90 transform hover:scale-105 active:scale-95"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  {!isConnected && (
                    <p className="text-sm text-red-500 mt-2">
                      Not connected to chat server. Please refresh the page.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* More dashboard content */}
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button 
              variant="outline" 
              className="p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow hover:border-primary"
              onClick={() => setActiveTab("click-offers")}
            >
              <MousePointer className="h-8 w-8 mb-2 text-primary" />
              <span>Click Offers</span>
            </Button>
            <Button 
              variant="outline" 
              className="p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow hover:border-primary"
              onClick={() => setActiveTab("withdraw")}
            >
              <DollarSign className="h-8 w-8 mb-2 text-green-600" />
              <span>Withdraw</span>
            </Button>
            <Button 
              variant="outline" 
              className="p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow hover:border-primary"
              onClick={() => setActiveTab("vip")}
            >
              <Crown className="h-8 w-8 mb-2 text-amber-500" />
              <span>VIP</span>
            </Button>
            <Button 
              variant="outline" 
              className="p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow hover:border-primary"
              onClick={() => setActiveTab("referrals")}
            >
              <Users className="h-8 w-8 mb-2 text-blue-600" />
              <span>Referrals</span>
            </Button>
            <Button 
              variant="outline" 
              className="p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow hover:border-primary"
              onClick={() => setActiveTab("leaderboard")}
            >
              <TrendingUp className="h-8 w-8 mb-2 text-purple-600" />
              <span>Leaderboard</span>
            </Button>
          </div>
        </div>
        
        {/* Tab Content Section */}
        {activeTab !== "dashboard-home" && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6 transition-all duration-300 ease-in-out">
            <h2 className="text-2xl font-bold mb-6">
              {activeTab === "post-offer" && "Post a New Offer"}
              {activeTab === "click-offers" && "Available Click Offers"}
              {activeTab === "referrals" && "Your Referrals"}
              {activeTab === "leaderboard" && "Top Earners Leaderboard"}
              {activeTab === "community" && "Community Discussion"}
              {activeTab === "withdraw" && "Withdraw Earnings"}
              {activeTab === "vip" && "VIP Membership"}
            </h2>
            
            {/* Render the appropriate component based on activeTab */}
            {activeTab === "post-offer" && <PostOffer />}
            {activeTab === "click-offers" && <ClickOffers />}
            {activeTab === "referrals" && <Referrals />}
            {activeTab === "leaderboard" && <Leaderboard />}
            {activeTab === "community" && <CommunityChat />}
            {activeTab === "withdraw" && <Withdraw />}
            {activeTab === "vip" && <VipMembership />}
          </div>
        )}
      </div>
    </div>
  );
}
