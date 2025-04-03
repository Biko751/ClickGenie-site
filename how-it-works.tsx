import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function HowItWorks() {
  const steps = [
    {
      title: "Sign Up & Create Your Profile",
      description: "Create your account, set up your profile, and get access to the click exchange platform.",
      details: [
        "Fill out the registration form with your basic information",
        "Verify your email address to activate your account",
        "Create a profile that will be visible to other members",
        "Get immediate access to the platform and all its features"
      ]
    },
    {
      title: "Submit Your CPA Offers",
      description: "Add your CPA offers to the rotation system, specifying your target audience and maximum clicks.",
      details: [
        "Input your offer details, including title, link, and description",
        "Select your target countries to ensure relevant traffic",
        "Specify your CPA network and earnings per click",
        "Set daily click limits to control your campaign budget"
      ]
    },
    {
      title: "Click & Engage With Others",
      description: "Participate by clicking and engaging with other members' offers. Each verified click earns you credits.",
      details: [
        "Browse available offers in the rotation system",
        "Click on offers that interest you or match your target audience",
        "Stay engaged with each offer for at least 1 minute to earn credits",
        "Complete the verification process to confirm genuine engagement"
      ]
    },
    {
      title: "Track & Withdraw Earnings",
      description: "Monitor your earnings in real-time and withdraw your funds using your preferred payment method.",
      details: [
        "View your earnings dashboard to track your performance",
        "Monitor clicks received, clicks given, and total earnings",
        "Request a withdrawal once you reach the minimum threshold",
        "Receive your earnings via PayPal, Bitcoin, or bank transfer"
      ]
    }
  ];

  const benefits = [
    {
      title: "High-Quality Traffic",
      description: "Our verification system ensures all clicks are genuine and engaged, maximizing your conversion potential."
    },
    {
      title: "Fair Exposure",
      description: "Our rotation system gives all offers fair exposure, ensuring no favoritism or bias in the system."
    },
    {
      title: "Community Support",
      description: "Connect with like-minded marketers, share strategies, and learn from each other's experiences."
    },
    {
      title: "Additional Income",
      description: "Earn from both your CPA offers and by referring new members to the platform."
    },
    {
      title: "Real-Time Analytics",
      description: "Track your performance with comprehensive analytics and make data-driven decisions."
    },
    {
      title: "Multiple Payment Options",
      description: "Withdraw your earnings conveniently using various payment methods."
    }
  ];

  const faqs = [
    {
      question: "How much does it cost to join ClickGenie?",
      answer: "ClickGenie is completely free to join. There are no registration fees or monthly subscriptions. We operate on a fair exchange system where members earn by participating in the platform."
    },
    {
      question: "How does the verification system work?",
      answer: "Our verification system requires members to engage with offers for at least 1 minute. This ensures that all clicks are genuine and valuable, which leads to better conversion rates for everyone."
    },
    {
      question: "What is the minimum withdrawal amount?",
      answer: "The minimum withdrawal amount is $50. This threshold helps us manage transaction fees and ensures that all withdrawals are cost-effective for both members and the platform."
    },
    {
      question: "How long does it take to receive withdrawals?",
      answer: "Withdrawal processing typically takes 1-3 business days, depending on your chosen payment method. PayPal is usually the fastest, while bank transfers may take a bit longer."
    },
    {
      question: "Can I have multiple accounts?",
      answer: "No, multiple accounts are not allowed. Each person may only have one account, and violations of this rule may result in account suspension."
    },
    {
      question: "What types of offers can I promote?",
      answer: "You can promote any legitimate CPA offers that comply with our terms of service. We do not allow illegal or unethical offers, including adult content, gambling, or anything that violates laws or regulations."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">How ClickGenie Works</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          ClickGenie is a CPA click exchange platform designed to help marketers maximize their earnings through mutual engagement and collaboration.
        </p>
      </div>

      <Tabs defaultValue="process" className="max-w-4xl mx-auto mb-16">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="process">The Process</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="process" className="mt-6">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col md:flex-row items-start gap-6">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <Card className="flex-grow">
                  <CardHeader>
                    <CardTitle>{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      {step.details.map((detail, i) => (
                        <li key={i} className="text-gray-600">{detail}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="benefits" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="faqs" className="mt-6">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-8 text-white text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Earning?</h2>
        <p className="mb-6">Join thousands of marketers already benefiting from the ClickGenie platform.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Sign Up Now
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white/10">
              Explore Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
