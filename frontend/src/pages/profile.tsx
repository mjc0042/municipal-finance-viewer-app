import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
//import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
//import { GeneratedImage } from "@shared/schema";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Profile() {
  const user = useAuthStore((state) => state.user)
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    organization: "",
    subscriptionTier: ""
  });

  // Load user data into form
  useEffect(() => {
    console.log("user: ", user)
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        organization: user.organization || "", // This would come from user profile if extended
        subscriptionTier: user.subscriptionTier || "None",
      });
    }
  }, [user]);

const userImages = null;
const imagesLoading = false;

  /*const { data: userImages, isLoading: imagesLoading } = useQuery({
    queryKey: ["/api/user/images"],
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });*/

  const handleSaveProfile = async () => {
    // TODO: Implement profile update API
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const getSubscriptionStatus = () => {
    if (user?.subscriptionTier === "trial") {
      return { label: "Professional Trial", color: "bg-teal", days: 23 };
    } else if (user?.subscriptionTier === "professional") {
      return { label: "Professional", color: "bg-green-500", days: null };
    } else {
      return { label: "Free", color: "bg-gray-500", days: null };
    }
  };

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">Profile & Settings</h1>
          <p className="text-gray-600">Manage your account, subscription, and generated content.</p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-charcoal">Account Information</CardTitle>
                <CardDescription>Update your personal information and organization details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData({...formData, organization: e.target.value})}
                      placeholder="e.g., Seattle Planning Department"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveProfile} className="bg-teal hover:bg-teal/90">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-charcoal">Current Plan</CardTitle>
                <CardDescription>Manage your subscription and billing information.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={`${subscriptionStatus.color} text-white`}>
                        {subscriptionStatus.label}
                      </Badge>
                      {subscriptionStatus.days && (
                        <span className="text-sm text-gray-600">
                          {subscriptionStatus.days} days remaining
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">Full access to all features</p>
                  </div>
                  <Button 
                    className="bg-urban-orange hover:bg-urban-orange/90"
                    onClick={() => setLocation('/subscribe')}
                  >
                    Upgrade Now
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-charcoal">{user?.credits || 0}</p>
                        <p className="text-sm text-gray-600">AI Generation Credits</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <Button 
                          variant="outline" 
                          className="w-full border-urban-orange text-urban-orange hover:bg-urban-orange hover:text-white"
                          onClick={() => setLocation('/subscribe')}
                        >
                          Buy More Credits
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-charcoal">Generated Images</CardTitle>
                <CardDescription>View and manage your AI-generated urban design images.</CardDescription>
              </CardHeader>
              <CardContent>
                {imagesLoading ? (
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : userImages && userImages.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {userImages.map((image: GeneratedImage) => (
                      <div key={image.id} className="group relative">
                        <img
                          src={image.imageUrl}
                          alt="Generated urban design"
                          className="w-full aspect-square object-cover rounded-lg border border-gray-200 hover:shadow-md cursor-pointer transition-all"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="secondary">
                              View
                            </Button>
                            <Button size="sm" variant="secondary">
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No generated images yet.</p>
                    <Button 
                      onClick={() => setLocation('/designer')}
                      className="bg-urban-orange hover:bg-urban-orange/90"
                    >
                      Create Your First Design
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-charcoal">Security Settings</CardTitle>
                <CardDescription>Manage your account security and authentication preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <div>
                      <p className="font-medium text-charcoal">Password</p>
                      <p className="text-sm text-gray-600">Last updated 2 months ago</p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b">
                    <div>
                      <p className="font-medium text-charcoal">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add extra security to your account</p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-medium text-charcoal">Account Deletion</p>
                      <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
