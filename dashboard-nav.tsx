import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  PlusCircle, 
  MousePointer, 
  Users, 
  Trophy, 
  MessageCircle, 
  DollarSign 
} from "lucide-react";

type DashboardTab = 
  | "dashboard-home"
  | "post-offer"
  | "click-offers"
  | "referrals"
  | "leaderboard"
  | "community"
  | "withdraw";

interface DashboardNavProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
}

export default function DashboardNav({ activeTab, setActiveTab }: DashboardNavProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-2 mb-6 overflow-x-auto">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DashboardTab)}>
        <TabsList className="w-full justify-start min-w-max">
          <TabsTrigger value="dashboard-home" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="post-offer" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Post an Offer</span>
          </TabsTrigger>
          <TabsTrigger value="click-offers" className="flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            <span>Click Offers</span>
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Referrals</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>Leaderboard</span>
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>Community Chat</span>
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>Withdraw Earnings</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
