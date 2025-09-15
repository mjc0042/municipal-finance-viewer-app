import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Save, Sparkles, Lock } from "lucide-react";
import type { CrossSectionPanel } from "@/lib/designerUtils";
import { useAuth } from "@/hooks/useAuth";
//import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { designerApi } from "@/http/design/api";
import type { GeneratedImage } from "@/http/design/types";
import { useAuthStore } from "@/store/auth";

interface ImageGeneratorProps {
  panels: CrossSectionPanel[];
  units: string;
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
}

export default function ImageGenerator({ 
  panels, 
  units,
  selectedTheme, 
  setSelectedTheme 
}: ImageGeneratorProps) {

  

  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const user = useAuthStore().getUser();
  //const { toast } = useToast();
  //const queryClient = useQueryClient();

  const generateImageMutation = useMutation({
    mutationFn: async () => {
      //const prompt = `Urban street cross-section with ${panels.map(p => 
      //  `${p.width}ft ${p.name.toLowerCase()} (${p.material})`
      //).join(', ')}. Professional urban planning visualization.`;
      
      const resData = await designerApi.generateCrossSectionImage(
        units,
        selectedTheme,
        panels
      );
      
      return await resData;
    },
    onSuccess: (data) => {
      setGeneratedImage(data.image.imageUrl);
    },
    onError: (error: Error) => {
      console.log("Generation failed", error);
    },
  });

  const handleGenerate = () => {
    generateImageMutation.mutate();
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage.imageUrl;
    link.download = `urban-cross-section-${Date.now()}.png`;
    link.click();
  };

  const handleSave = async () => {
    try {
      if (generatedImage !== null) {
        designerApi.saveImage(generatedImage.id);
      }
    }
    catch (ex) {

    }
  };

  const themes = [
    { id: "modern", name: "Modern", description: "Clean, contemporary design" },
    { id: "traditional", name: "Traditional", description: "Classic urban planning" },
    { id: "sustainable", name: "Sustainable", description: "Green infrastructure focus" }
  ];

  return (
    <div className="w-1/2 bg-white border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-charcoal mb-2">Cross-Section Generator</h2>
        <p className="text-sm text-gray-600">Design urban cross-sections with AI-powered visualization</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Generated Image Display */}
        <div>
          <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
            {generateImageMutation.isPending ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-urban-orange mx-auto mb-4"></div>
                <p className="text-gray-600">Generating your design...</p>
                <p className="text-sm text-gray-500">This may take 30-60 seconds</p>
              </div>
            ) : generatedImage ? (
              <img 
                src={generatedImage.imageUrl} 
                alt="AI-generated urban cross-section" 
                className="w-full h-full object-cover rounded-lg" 
              />
            ) : (
              <div className="text-center">
                <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Your generated cross-section will appear here</p>
                <p className="text-sm text-gray-500">Configure your panels and click generate</p>
              </div>
            )}
          </div>
          
          {generatedImage && (
            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm text-gray-600">Generated just now</span>
              <div className="flex space-x-2">
                <Button onClick={handleDownload} size="sm" className="bg-teal hover:bg-teal/90">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button onClick={handleSave} variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-1" />
                  Save to Gallery
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Design Themes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Design Theme</label>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((theme) => (
              <Button
                key={theme.id}
                variant={selectedTheme === theme.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTheme(theme.id)}
                className={selectedTheme === theme.id ? 
                  "bg-teal hover:bg-teal/90 text-white" : 
                  "hover:border-teal hover:text-teal"
                }
              >
                {theme.name}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {themes.find(t => t.id === selectedTheme)?.description}
          </p>
        </div>

        {/* Credits Display */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">AI Generation Credits</span>
              <span className="font-medium text-charcoal">{user?.credits || 0} remaining</span>
            </div>
            <Progress 
              value={((user?.credits || 0) / 10) * 100} 
              className="h-2 mb-2"
            />
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-xs text-urban-orange hover:text-urban-orange/80"
            >
              Buy More Credits
            </Button>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate}
          disabled={generateImageMutation.isPending || !user || user.credits <= 0}
          className="w-full bg-urban-orange-500 hover:bg-urban-orange-700 py-3 font-medium"
        >
          {generateImageMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Cross-Section
            </>
          )}
        </Button>

        {/* Placeholder for Bird's Eye View */}
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <Lock className="h-4 w-4 text-gray-400 mr-2" />
              <CardTitle className="text-sm font-medium text-gray-600">
                Bird's Eye View Generator
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Generate aerial perspective renderings of urban developments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xs">
              Coming Soon
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
