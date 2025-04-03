import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Check, Star, Award, TrendingUp } from "lucide-react";

// Mock featured offers from external networks
const FEATURED_OFFERS = [
  {
    id: 1,
    title: "Survey Junkie - Complete Surveys",
    network: "AdGate Media",
    payout: 2.45,
    description: "Complete simple surveys and earn cash. Must complete at least one survey to receive credit.",
    countries: ["US", "CA", "UK", "AU"],
    isAdmin: true,
    requiredTime: 180,
    url: "https://example.com/offer1",
    image: "🔍"
  },
  {
    id: 2,
    title: "Mobile Game - Reach Level 10",
    network: "OfferToro",
    payout: 3.75,
    description: "Download and play this mobile game. Reach level 10 to receive credit (usually takes 2-3 days).",
    countries: ["Worldwide"],
    isAdmin: false,
    requiredTime: 120,
    url: "https://example.com/offer2",
    image: "🎮"
  },
  {
    id: 3,
    title: "Credit Score Check",
    network: "CPAGrip",
    payout: 5.00,
    description: "Check your credit score for free. Must complete entire process to receive credit.",
    countries: ["US"],
    isAdmin: true,
    requiredTime: 240,
    url: "https://example.com/offer3",
    image: "💳"
  }
];

export default function FeaturedOffers() {
  const { toast } = useToast();
  const [countryFilter, setCountryFilter] = useState("All");
  
  // Filter offers - in a real implementation this would fetch from the server
  const filteredOffers = FEATURED_OFFERS.filter(offer => {
    if (countryFilter === "All") return true;
    return offer.countries.includes(countryFilter) || offer.countries.includes("Worldwide");
  });
  
  // Start an external offer in a new window
  const startExternalOffer = (offer: typeof FEATURED_OFFERS[0]) => {
    // In a real implementation, this would also record the start time and user
    window.open(offer.url, "_blank");
    
    toast({
      title: "Offer Started",
      description: `You've started the "${offer.title}" offer. Complete the requirements to earn ${offer.payout.toFixed(2)}.`,
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <Star className="mr-2 h-5 w-5 text-yellow-500" />
          Featured Offers from CPA Networks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">
          <p className="flex items-center text-amber-800">
            <Award className="h-4 w-4 mr-2" />
            <span>Complete these offers from our partners to earn additional rewards.</span>
          </p>
        </div>
        
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <div 
              key={offer.id} 
              className={`border ${offer.isAdmin ? 'border-primary/50 bg-primary/5' : 'border-gray-200'} rounded-md p-4 hover:shadow-md transition-shadow`}
            >
              <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-3xl">{offer.image}</div>
                  <div>
                    <h3 className="font-bold">{offer.title}</h3>
                    <p className="text-sm text-gray-600">Provider: {offer.network}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  ${offer.payout.toFixed(2)}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">{offer.description}</p>
              
              <div className="flex flex-wrap justify-between gap-2 mb-3 text-xs text-gray-500">
                <span>Countries: {offer.countries.join(", ")}</span>
                <span className="flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Required time: {Math.floor(offer.requiredTime / 60)}m {offer.requiredTime % 60}s
                </span>
              </div>
              
              <Button 
                onClick={() => startExternalOffer(offer)}
                className={`w-full ${offer.isAdmin ? 'bg-gradient-to-r from-primary to-primary/80' : ''}`}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Start Offer
              </Button>
              
              {offer.isAdmin && (
                <div className="mt-2 flex items-center justify-center text-xs text-primary">
                  <Check className="h-3 w-3 mr-1" />
                  Admin verified offer
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="text-xs text-gray-500">
        <p>Note: External offers are provided by third-party networks and subject to their terms and conditions.</p>
      </CardFooter>
    </Card>
  );
}