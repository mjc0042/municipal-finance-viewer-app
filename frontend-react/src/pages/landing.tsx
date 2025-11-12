import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, TrendingUp, Zap, Users, Shield, Globe } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-charcoal">Urban Planner Pro</h1>
            </div>
            <Button onClick={handleLogin} className="bg-teal hover:bg-teal/90 text-white">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-charcoal mb-6">
              Advanced GIS & AI Toolkit
              <span className="block text-teal">for Urban Planners</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Visualize municipal financial data, analyze urban development patterns, 
              and generate AI-powered design solutions all in one comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleLogin} 
                size="lg" 
                className="bg-urban-orange hover:bg-urban-orange/90 text-white px-8 py-3"
              >
                Start Free Trial
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-teal text-teal hover:bg-teal hover:text-white px-8 py-3"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-charcoal mb-4">
              Everything You Need for Modern Urban Planning
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From financial analysis to AI-powered design generation, 
              our platform streamlines your urban planning workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <MapPin className="h-10 w-10 text-teal mb-2" />
                <CardTitle className="text-charcoal">GIS Mapping</CardTitle>
                <CardDescription>
                  Interactive maps displaying US municipalities with comprehensive financial and demographic data.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-teal mb-2" />
                <CardTitle className="text-charcoal">Financial Analytics</CardTitle>
                <CardDescription>
                  Advanced charts and metrics for municipal financial health analysis and comparison.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-10 w-10 text-urban-orange mb-2" />
                <CardTitle className="text-charcoal">AI Design Tools</CardTitle>
                <CardDescription>
                  Generate urban cross-sections and design visualizations with cutting-edge AI technology.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-teal mb-2" />
                <CardTitle className="text-charcoal">Collaborative Platform</CardTitle>
                <CardDescription>
                  Share insights, compare municipalities, and collaborate with planning teams.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-10 w-10 text-teal mb-2" />
                <CardTitle className="text-charcoal">Enterprise Security</CardTitle>
                <CardDescription>
                  Bank-level security with role-based access controls for government organizations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="h-10 w-10 text-teal mb-2" />
                <CardTitle className="text-charcoal">Nationwide Coverage</CardTitle>
                <CardDescription>
                  Access data for over 19,000 US municipalities with regular updates and new features.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Planning Process?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of planners and city officials who trust Urban Planner Pro 
            for their data-driven urban development decisions.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="bg-urban-orange hover:bg-urban-orange/90 text-white px-8 py-3"
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 Urban Planner Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
