import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { generateReferralLink } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Twitter,
  Mail,
  Copy,
  Search,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Referral {
  id: number;
  username: string;
  lastLogin: string;
}

export default function Referrals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const referralLink = user ? generateReferralLink(user.referralCode) : "";

  // Fetch referrals data
  const { data: referrals, isLoading } = useQuery({
    queryKey: ["/api/referrals"],
    enabled: !!user,
  });

  // Copy referral link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  // Share referral link on social media
  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareOnTwitter = () => {
    const text = "Join me on ClickGenie and earn money for engaging with CPA offers! Use my referral link:";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareViaEmail = () => {
    const subject = "Join ClickGenie - CPA Click Exchange Platform";
    const body = `Hey,\n\nI've been using ClickGenie to earn money by engaging with CPA offers. It's a great platform with verified clicks and a fair rotation system.\n\nJoin using my referral link: ${referralLink}\n\nCheers!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Filter referrals based on search query
  const filteredReferrals = referrals?.filter((referral: Referral) =>
    referral.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mocked earnings data for the UI
  const referralStats = {
    activeReferrals: referrals?.length || 0,
    totalEarnings: 78.50,
    thisMonth: 24.75,
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Referral Link & Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Your Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-purple-600/10 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-2">Share Your Referral Link</h3>
            <div className="flex mb-2">
              <Input
                type="text"
                value={referralLink}
                readOnly
                className="rounded-r-none"
              />
              <Button
                className="rounded-l-none bg-purple-600 hover:bg-purple-700"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600">Earn 10% of your referrals' earnings for life!</p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-3">Referral Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-md p-3 text-center">
                <p className="text-xs text-gray-600">Total Referrals</p>
                <p className="font-bold text-purple-600 text-xl">{referralStats.activeReferrals}</p>
              </div>
              <div className="bg-gray-50 rounded-md p-3 text-center">
                <p className="text-xs text-gray-600">Active Referrals</p>
                <p className="font-bold text-purple-600 text-xl">{referralStats.activeReferrals}</p>
              </div>
              <div className="bg-gray-50 rounded-md p-3 text-center">
                <p className="text-xs text-gray-600">Total Earnings</p>
                <p className="font-bold text-purple-600 text-xl">{formatCurrency(referralStats.totalEarnings)}</p>
              </div>
              <div className="bg-gray-50 rounded-md p-3 text-center">
                <p className="text-xs text-gray-600">This Month</p>
                <p className="font-bold text-purple-600 text-xl">{formatCurrency(referralStats.thisMonth)}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Promote Your Link</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                className="flex items-center bg-[#1877F2] hover:bg-[#1877F2]/90"
                onClick={shareOnFacebook}
              >
                <Facebook className="mr-2 h-4 w-4" />
                Share on Facebook
              </Button>
              <Button
                className="flex items-center bg-[#1DA1F2] hover:bg-[#1DA1F2]/90"
                onClick={shareOnTwitter}
              >
                <Twitter className="mr-2 h-4 w-4" />
                Share on Twitter
              </Button>
              <Button
                className="flex items-center"
                onClick={shareViaEmail}
              >
                <Mail className="mr-2 h-4 w-4" />
                Share via Email
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Pro tip: Share your success stories when promoting your link to increase conversions!
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Referral List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Your Referrals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search referrals..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : referrals && referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReferrals.map((referral: Referral) => (
                    <TableRow key={referral.id}>
                      <TableCell className="font-medium">{referral.username}</TableCell>
                      <TableCell>{formatDate(referral.lastLogin)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800"
                        >
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-purple-600">
                        {formatCurrency(12.50)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex justify-between items-center text-sm mt-4">
                <span className="text-gray-600">
                  Showing {filteredReferrals.length} of {referrals.length} referrals
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
              <p className="text-lg font-medium mb-2">No referrals yet</p>
              <p>Share your referral link to start earning bonuses</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
