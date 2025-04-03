import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  MessageSquare,
  DollarSign,
  Star, 
  StarHalf 
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <CheckCircle className="text-primary text-xl" />,
      title: "Verified CPA Clicks",
      description: "Our 2-minute engagement rule ensures all clicks are genuine, maximizing your conversion potential."
    },
    {
      icon: <RefreshCw className="text-primary text-xl" />,
      title: "Fair Rotation System",
      description: "Everyone gets equal exposure with our intelligent rotation system ensuring maximum visibility."
    },
    {
      icon: <TrendingUp className="text-primary text-xl" />,
      title: "Real-Time Dashboard",
      description: "Track your earnings, clicks, and performance in real-time with our intuitive dashboard."
    },
    {
      icon: <Users className="text-primary text-xl" />,
      title: "Referral System",
      description: "Earn even more by inviting others. Get a percentage of their activity and climb our leaderboard."
    },
    {
      icon: <MessageSquare className="text-primary text-xl" />,
      title: "Community Chat",
      description: "Connect with other marketers, share strategies, and grow together with our community features."
    },
    {
      icon: <DollarSign className="text-primary text-xl" />,
      title: "Fast Payouts",
      description: "Get your earnings quickly with our streamlined withdrawal process and multiple payment options."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      since: "Member since 2022",
      rating: 5,
      text: "ClickGenie has transformed how I approach CPA marketing. The engagement quality is incredible, and my conversion rates have doubled since joining!"
    },
    {
      name: "Michael Rivera",
      since: "Member since 2023",
      rating: 4.5,
      text: "The community aspect sets ClickGenie apart. I've learned so much from other members and the support team is always ready to help."
    },
    {
      name: "David Chen",
      since: "Member since 2021",
      rating: 5,
      text: "I was skeptical at first, but ClickGenie delivered beyond my expectations. The fair rotation system ensures everyone gets value. Highly recommended!"
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Sign Up & Create Your Profile",
      description: "Create your account, set up your profile, and get access to the click exchange platform."
    },
    {
      number: 2,
      title: "Submit Your CPA Offers",
      description: "Add your CPA offers to the rotation system, specifying your target audience and maximum clicks."
    },
    {
      number: 3,
      title: "Click & Engage With Others",
      description: "Participate by clicking and engaging with other members' offers. Each verified click earns you credits."
    },
    {
      number: 4,
      title: "Track & Withdraw Earnings",
      description: "Monitor your earnings in real-time and withdraw your funds using your preferred payment method."
    }
  ];

  return (
    <div className="pt-10 pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Earn Together, Grow Together!</h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">Join ClickGenie – The CPA Click Exchange That Guarantees Engagement & Earnings.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
                  Sign Up Now
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose ClickGenie?</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition duration-300 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How ClickGenie Works</h2>
          
          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center mb-12 gap-6 last:mb-0">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0">
                  {step.number}
                </div>
                <Card className="flex-grow border-0 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Members Say</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 flex">
                    {[...Array(Math.floor(testimonial.rating))].map((_, i) => (
                      <Star key={i} className="fill-current" size={18} />
                    ))}
                    {testimonial.rating % 1 > 0 && (
                      <StarHalf className="fill-current" size={18} />
                    )}
                  </div>
                  <span className="ml-2 text-gray-500">{testimonial.rating.toFixed(1)}</span>
                </div>
                <p className="text-gray-600 mb-4">{testimonial.text}</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                    <span className="font-medium">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.since}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-purple-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Boost Your CPA Earnings?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of marketers who are leveraging ClickGenie to maximize their CPA campaigns and grow their income.</p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 hover:text-purple-700">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
