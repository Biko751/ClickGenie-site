import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { formatCurrency } from "@/lib/utils";

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
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "alltime";

interface LeaderboardUser {
  id: number;
  username: string;
  balance: number;
  clicksGiven: number;
  clicksReceived: number;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<LeaderboardPeriod>("daily");

  // Fetch leaderboard data
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
    refetchOnWindowFocus: false,
  });

  // Find user's rank
  const getUserRank = () => {
    if (!user || !leaderboard) return null;
    
    const userIndex = leaderboard.findIndex((item: LeaderboardUser) => item.id === user.id);
    return userIndex !== -1 ? userIndex + 1 : null;
  };

  const userRank = getUserRank();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-primary" />
          ClickGenie Leaderboard
        </CardTitle>
        <Tabs 
          defaultValue={period} 
          onValueChange={(value) => setPeriod(value as LeaderboardPeriod)}
          className="mt-2"
        >
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="alltime">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : leaderboard && leaderboard.length > 0 ? (
          <>
            {/* Top 3 Winners */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* Second Place */}
              <div className="order-1 md:order-1">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="bg-gradient-to-r from-gray-300 to-gray-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 text-white shadow-md">
                    <Medal className="h-6 w-6" />
                  </div>
                  <p className="font-bold mb-1">{leaderboard[1]?.username || "N/A"}</p>
                  <p className="text-sm text-gray-600 mb-1">2nd Place</p>
                  <p className="font-medium text-primary">
                    {leaderboard[1] ? formatCurrency(leaderboard[1].balance) : "$0.00"}
                  </p>
                </div>
              </div>
              
              {/* First Place */}
              <div className="order-0 md:order-2">
                <div className="bg-yellow-50 rounded-lg p-4 text-center -mt-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 text-white shadow-md">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <p className="font-bold text-lg mb-1">{leaderboard[0]?.username || "N/A"}</p>
                  <p className="text-sm text-gray-600 mb-1">1st Place</p>
                  <p className="font-medium text-primary text-lg">
                    {leaderboard[0] ? formatCurrency(leaderboard[0].balance) : "$0.00"}
                  </p>
                </div>
              </div>
              
              {/* Third Place */}
              <div className="order-2 md:order-3">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="bg-gradient-to-r from-amber-600 to-amber-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 text-white shadow-md">
                    <Award className="h-6 w-6" />
                  </div>
                  <p className="font-bold mb-1">{leaderboard[2]?.username || "N/A"}</p>
                  <p className="text-sm text-gray-600 mb-1">3rd Place</p>
                  <p className="font-medium text-primary">
                    {leaderboard[2] ? formatCurrency(leaderboard[2].balance) : "$0.00"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Full Leaderboard */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Clicks Given</TableHead>
                    <TableHead>Clicks Received</TableHead>
                    <TableHead className="text-right">Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((leader: LeaderboardUser, index: number) => (
                    <TableRow 
                      key={leader.id}
                      className={
                        index === 0 
                          ? "bg-yellow-50" 
                          : index === 1 
                            ? "bg-gray-50" 
                            : index === 2 
                              ? "bg-amber-50" 
                              : leader.id === user?.id 
                                ? "bg-blue-50" 
                                : ""
                      }
                    >
                      <TableCell className="font-bold">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {leader.username}
                        {leader.id === user?.id && (
                          <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">You</Badge>
                        )}
                      </TableCell>
                      <TableCell>{leader.clicksGiven}</TableCell>
                      <TableCell>{leader.clicksReceived}</TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {formatCurrency(leader.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {userRank && userRank > 10 && (
              <div className="mt-4 p-3 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Your current rank: <span className="font-bold">#{userRank}</span>
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg font-medium mb-2">No leaderboard data available</p>
            <p>Start engaging with offers to appear on the leaderboard!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
