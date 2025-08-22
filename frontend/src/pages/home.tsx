import { useEffect } from "react";
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp, Zap, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { financialApi } from "@/http/financial/api";

export default function Home() {
  const [, setLocation] = useLocation();
  //const { user } = useAuth();
  const user = null;


  //const { isPending, error, data } = useQuery({
  //  queryKey: ['repoData'],
  //  queryFn: financialApi.initSampleData
  //})
//
  //if (isPending) return 'Loading...'
//
  //if (error) return 'An error has occurred: ' + error.message

  const processedMunicipalities = 19495;

  // Initialize sample data on first load
  const initDataMutation = useMutation({
    mutationFn: financialApi.initSampleData,
    onSuccess: () => {},
    onError: (error) => {
      console.error("Failed to initialize sample data.", error);
    }
  })

  useEffect(() => {
    initDataMutation.mutate();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">
            Welcome {/*back, {user?.firstName || 'Planner'}! */}
          </h1>
          <p className="text-gray-600">
            Explore municipal financial data and urban planning tools.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => setLocation('/finance')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-teal/10 rounded-lg">
                    <MapPin className="h-6 w-6 text-teal" />
                  </div>
                  <div>
                    <CardTitle className="text-charcoal">Finance View</CardTitle>
                    <CardDescription>
                      Analyze municipal financial data with interactive GIS mapping
                    </CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>• Interactive mapping</span>
                <span>• Financial analytics</span>
                <span>• Data comparison</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => setLocation('/designer')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-urban-orange/10 rounded-lg">
                    <Zap className="h-6 w-6 text-urban-orange" />
                  </div>
                  <div>
                    <CardTitle className="text-charcoal">Designer View</CardTitle>
                    <CardDescription>
                      Generate AI-powered urban design visualizations
                    </CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>• AI image generation</span>
                <span>• Cross-section builder</span>
                <span>• Design themes</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Municipalities</p>
                  <p className="text-2xl font-bold text-charcoal">{processedMunicipalities}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-teal" />
              </div>
            </CardContent>
          </Card>
          {/*}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AI Credits</p>
                  <p className="text-2xl font-bold text-charcoal">{user?.credits || 0}</p>
                </div>
                <Zap className="h-8 w-8 text-urban-orange" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Subscription</p>
                  <p className="text-lg font-semibold text-teal">
                    {user?.subscriptionTier?.charAt(0).toUpperCase() + (user?.subscriptionTier?.slice(1) || 'trial')}
                  </p>
                </div>
                <div className="h-8 w-8 bg-teal/10 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-teal rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Trial Days Left</p>
                  <p className="text-2xl font-bold text-charcoal">23</p>
                </div>
                <Button 
                  size="sm"
                  className="bg-urban-orange hover:bg-urban-orange/90"
                  onClick={() => setLocation('/subscribe')}
                >
                  Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>*/}
        </div>

        {/* Recent Activity */}
        {/*
        <Card>
          <CardHeader>
            <CardTitle className="text-charcoal">Recent Activity</CardTitle>
            <CardDescription>
              Your latest actions and generated content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 bg-teal/10 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-teal" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-charcoal">Analyzed San Francisco financial data</p>
                  <p className="text-sm text-gray-600">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 bg-urban-orange/10 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-urban-orange" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-charcoal">Generated modern street cross-section</p>
                  <p className="text-sm text-gray-600">1 day ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 bg-teal/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-teal" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-charcoal">Compared Austin and Denver metrics</p>
                  <p className="text-sm text-gray-600">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
          */}
      </div>
    </div>
  );
}
