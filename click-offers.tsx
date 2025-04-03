import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MousePointer, ExternalLink, Check, AlertTriangle } from "lucide-react";

interface Offer {
  id: number;
  userId: number;
  username: string;
  title: string;
  link: string;
  network: string;
  countries: string;
  epc: number;
  maxClicksPerDay: number;
  description: string;
  active: boolean;
}

export default function ClickOffers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Current click task state
  const [currentTask, setCurrentTask] = useState<Offer | null>(null);
  const [timer, setTimer] = useState(0);
  const [maxTime, setMaxTime] = useState(60); // 1 minute default
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countryFilter, setCountryFilter] = useState("All");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const offerWindowRef = useRef<Window | null>(null);

  // Fetch available offers
  const { data: availableOffers, isLoading } = useQuery({
    queryKey: ["/api/offers", { active: true }],
    queryFn: async () => {
      const response = await fetch("/api/offers?active=true");
      if (!response.ok) throw new Error("Failed to fetch offers");
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // Create click mutation
  const createClickMutation = useMutation({
    mutationFn: async (data: { offerId: number, duration: number, verified: boolean }) => {
      const response = await apiRequest("POST", "/api/clicks", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      
      toast({
        title: "Click Verified!",
        description: `You earned ${formatCurrency(currentTask?.epc || 0)} for this click.`,
      });
      
      setCurrentTask(null);
      setIsTimerRunning(false);
      setIsVerified(false);
      setTimer(0);
    },
    onError: (error) => {
      console.error("Error verifying click:", error);
      toast({
        title: "Verification Failed",
        description: "Unable to verify your click. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle timer
  useEffect(() => {
    if (isTimerRunning && !isVerified) {
      timerRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          const newTime = prevTimer + 1;
          if (newTime >= maxTime) {
            setIsVerified(true);
            clearInterval(timerRef.current as NodeJS.Timeout);
            return maxTime;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, isVerified, maxTime]);

  // Check if offer window is still open
  useEffect(() => {
    const checkWindow = () => {
      if (isTimerRunning && offerWindowRef.current && offerWindowRef.current.closed) {
        // Window was closed before verification
        setIsTimerRunning(false);
        toast({
          title: "Offer Abandoned",
          description: "You closed the offer window before completing verification.",
          variant: "destructive",
        });
      }
    };

    if (isTimerRunning) {
      const interval = setInterval(checkWindow, 1000);
      return () => clearInterval(interval);
    }
  }, [isTimerRunning, toast]);

  // Start a task
  const startTask = (offer: Offer) => {
    setCurrentTask(offer);
    setTimer(0);
    setIsVerified(false);
    
    // Open the offer in a new window
    offerWindowRef.current = window.open(offer.link, "_blank");
    
    // Start the timer only if the window was successfully opened
    if (offerWindowRef.current) {
      setIsTimerRunning(true);
    } else {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site to engage with offers.",
        variant: "destructive",
      });
    }
  };

  // Confirm click and submit verification
  const confirmClick = () => {
    if (currentTask && isVerified) {
      createClickMutation.mutate({
        offerId: currentTask.id,
        duration: timer,
        verified: true,
      });
    }
  };

  // Filter offers by country
  const filteredOffers = availableOffers?.filter((offer: Offer) => {
    if (countryFilter === "All") return true;
    return offer.countries.includes(countryFilter);
  }) || [];

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="grid gap-6">
      {/* Active Click Task */}
      {currentTask && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center">
              <MousePointer className="mr-2 h-5 w-5 text-primary" />
              Current Click Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold">{currentTask.title}</h3>
                  <p className="text-sm text-gray-600">
                    Posted by: <span className="font-medium">{currentTask.username}</span>
                  </p>
                </div>
                <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
                  Reward: {formatCurrency(currentTask.epc)} per click
                </Badge>
              </div>
              
              {currentTask.description && (
                <p className="text-gray-700 mb-4">{currentTask.description}</p>
              )}
              
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800 mb-6 flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>
                  Remember: You must engage with the page for the minimum time to receive credit.
                  Keep the offer page open for at least {maxTime} seconds.
                </span>
              </div>
              
              <div className="mb-6">
                <p className="font-medium mb-2">Engagement Timer:</p>
                <Progress value={(timer / maxTime) * 100} className="h-4" />
                <div className="flex justify-between text-sm mt-1">
                  <span>{formatTime(timer)}</span>
                  <span>{formatTime(maxTime)}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex-grow"
                  onClick={() => {
                    if (offerWindowRef.current && !offerWindowRef.current.closed) {
                      offerWindowRef.current.focus();
                    } else {
                      offerWindowRef.current = window.open(currentTask.link, "_blank");
                    }
                  }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Offer
                </Button>
                <Button 
                  className="flex-grow sm:flex-grow-0" 
                  disabled={!isVerified}
                  onClick={confirmClick}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirm Click
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Available Offers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <MousePointer className="mr-2 h-5 w-5 text-primary" />
            Available Offers to Click
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              Showing {filteredOffers.length} {filteredOffers.length === 1 ? 'offer' : 'offers'}
            </p>
            <Select 
              value={countryFilter} 
              onValueChange={setCountryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Countries</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="EU">Europe</SelectItem>
                <SelectItem value="Worldwide">Worldwide</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredOffers.length > 0 ? (
            <div className="space-y-4">
              {filteredOffers.map((offer: Offer) => (
                <div 
                  key={offer.id} 
                  className="border border-gray-200 rounded-md p-4 hover:border-primary transition"
                >
                  <div className="flex justify-between flex-wrap gap-2 mb-2">
                    <h3 className="font-bold">{offer.title}</h3>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      {formatCurrency(offer.epc)} per click
                    </Badge>
                  </div>
                  
                  {offer.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{offer.description}</p>
                  )}
                  
                  <div className="flex justify-between text-xs text-gray-500 mb-3">
                    <span>Posted by: {offer.username}</span>
                    <span>Target: {offer.countries}</span>
                  </div>
                  
                  <Button 
                    className="w-full"
                    variant="secondary"
                    disabled={!!currentTask}
                    onClick={() => startTask(offer)}
                  >
                    {currentTask ? 'Complete Current Task First' : 'Start Task'}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg font-medium mb-2">No offers available</p>
              <p>Check back later or adjust your country filter</p>
            </div>
          )}
        </CardContent>
        
        {filteredOffers.length > 0 && (
          <CardFooter className="flex justify-center">
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="icon" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-white hover:bg-primary/90">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
