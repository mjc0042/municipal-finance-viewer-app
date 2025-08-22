import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "You are now subscribed!",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe} className="w-full bg-urban-orange hover:bg-urban-orange/90">
        Subscribe Now
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    try {
      const res = await apiRequest("POST", "/api/get-or-create-subscription");
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setShowPayment(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (showPayment && clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-charcoal">Complete Your Subscription</CardTitle>
              <CardDescription>
                Enter your payment information to upgrade to Professional plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscribeForm />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-charcoal mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the full potential of Urban Planner Pro with advanced features 
            and unlimited access to municipal data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Trial Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-charcoal">Free Trial</CardTitle>
              <div className="text-3xl font-bold text-charcoal">
                $0
                <span className="text-base font-normal text-gray-600">/month</span>
              </div>
              <CardDescription>Perfect for evaluation and testing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-teal mr-2" />
                  <span className="text-sm">Limited financial data access</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-teal mr-2" />
                  <span className="text-sm">10 AI generation credits</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-teal mr-2" />
                  <span className="text-sm">Basic mapping features</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-teal mr-2" />
                  <span className="text-sm">30-day trial period</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Professional Plan */}
          <Card className="relative border-teal shadow-lg">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Badge className="bg-urban-orange text-white px-4 py-1">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-charcoal">Professional</CardTitle>
              <div className="text-3xl font-bold text-charcoal">
                $49
                <span className="text-base font-normal text-gray-600">/month</span>
              </div>
              <CardDescription>For individual planners and small teams</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-teal mr-2" />
                  <span className="text-sm">Full financial data access</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-teal mr-2" />
                  <span className="text-sm">100 AI generation credits/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-teal mr-2" />
                  <span className="text-sm">Advanced mapping & analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-teal mr-2" />
                  <span className="text-sm">Export functionality</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-teal mr-2" />
                  <span className="text-sm">Email support</span>
                </li>
              </ul>
              <Button 
                onClick={handleSubscribe}
                className="w-full bg-urban-orange hover:bg-urban-orange/90"
              >
                Upgrade to Professional
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-charcoal">Enterprise</CardTitle>
              <div className="text-3xl font-bold text-charcoal">
                $199
                <span className="text-base font-normal text-gray-600">/month</span>
              </div>
              <CardDescription>For large organizations and governments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-teal mr-2" />
                  <span className="text-sm">Unlimited everything</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-teal mr-2" />
                  <span className="text-sm">Custom data integrations</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-teal mr-2" />
                  <span className="text-sm">Multi-user collaboration</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-teal mr-2" />
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-teal mr-2" />
                  <span className="text-sm">Custom training</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include access to our comprehensive municipal database and AI-powered design tools.
          </p>
          <p className="text-sm text-gray-500">
            Cancel anytime. No setup fees. 30-day money-back guarantee.
          </p>
        </div>
      </div>
    </div>
  );
}
