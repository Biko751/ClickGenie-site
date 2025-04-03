import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, StarHalf, Quote } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CPA Marketer",
      since: "Member since 2022",
      avatar: "S",
      rating: 5,
      text: "ClickGenie has transformed how I approach CPA marketing. The engagement quality is incredible, and my conversion rates have doubled since joining! The community is also very supportive and always willing to share tips and strategies.",
    },
    {
      name: "Michael Rivera",
      role: "Affiliate Marketer",
      since: "Member since 2023",
      avatar: "M",
      rating: 4.5,
      text: "The community aspect sets ClickGenie apart. I've learned so much from other members and the support team is always ready to help. The fair rotation system ensures everyone gets exposure, which is rare in this industry.",
    },
    {
      name: "David Chen",
      role: "Digital Marketer",
      since: "Member since 2021",
      avatar: "D",
      rating: 5,
      text: "I was skeptical at first, but ClickGenie delivered beyond my expectations. The fair rotation system ensures everyone gets value. Highly recommended! My earnings have consistently grown month over month.",
    },
    {
      name: "Emily Rodriguez",
      role: "Solo Entrepreneur",
      since: "Member since 2022",
      avatar: "E",
      rating: 5,
      text: "As someone new to CPA marketing, ClickGenie made it easy to get started and learn the ropes. The community is welcoming and the platform is intuitive. I'm now earning consistently every month!",
    },
    {
      name: "James Wilson",
      role: "Performance Marketer",
      since: "Member since 2021",
      avatar: "J",
      rating: 4.5,
      text: "The verification system at ClickGenie ensures high-quality traffic, which has significantly improved my conversion rates. I've tried other exchanges before but none match the quality of engagement I get here.",
    },
    {
      name: "Sophia Lee",
      role: "Affiliate Manager",
      since: "Member since 2023",
      avatar: "S",
      rating: 5,
      text: "What I love most about ClickGenie is the transparency. You can see exactly where your clicks are coming from and track your performance in real-time. The referral program is also very generous!",
    }
  ];

  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-current" size={18} />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-current" size={18} />);
    }

    return stars;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">What Our Members Say</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Don't just take our word for it. Hear from the marketers who are achieving success with ClickGenie.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition duration-300">
            <CardContent className="p-6">
              <div className="mb-4 text-primary">
                <Quote size={32} />
              </div>
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {renderRating(testimonial.rating)}
                </div>
                <span className="ml-2 text-gray-500">{testimonial.rating.toFixed(1)}</span>
              </div>
              <p className="text-gray-600 mb-6">{testimonial.text}</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium mr-3">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                  <p className="text-xs text-gray-400">{testimonial.since}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-xl p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Join Our Success Stories?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of marketers who are leveraging ClickGenie to boost their CPA earnings.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" className="w-full sm:w-auto">
                Learn How It Works
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
