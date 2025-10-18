import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for your image",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt },
      });

      if (error) throw error;

      if (data?.image) {
        setGeneratedImage(data.image);
        toast({
          title: "Image generated!",
          description: "Your AI-generated image is ready",
        });
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Powered by Nano banana AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="gradient-text">AI Image Generator</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your imagination into stunning visuals with the power of AI. 
            Simply describe what you want to see and watch it come to life.
          </p>
        </div>

        {/* Generation Interface */}
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="p-6 glass-card border-border/50">
            <div className="space-y-4">
              <div>
                <label htmlFor="prompt" className="text-sm font-medium block mb-2">
                  Describe your image
                </label>
                <Textarea
                  id="prompt"
                  placeholder="A serene mountain landscape at sunset with purple and orange skies, reflection in a crystal clear lake, ultra realistic, 8k..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] bg-background/50 resize-none"
                  disabled={isGenerating}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                variant="hero"
                size="lg"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Image
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Generated Image Display */}
          {generatedImage && (
            <Card className="p-6 glass-card border-border/50 animate-in fade-in-50 duration-500">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Your Generated Image</h2>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
                
                <div className="relative rounded-lg overflow-hidden bg-muted">
                  <img
                    src={generatedImage}
                    alt="Generated AI artwork"
                    className="w-full h-auto"
                  />
                </div>

                <p className="text-sm text-muted-foreground italic">
                  "{prompt}"
                </p>
              </div>
            </Card>
          )}

          {/* Tips Section */}
          {!generatedImage && !isGenerating && (
            <Card className="p-6 glass-card border-border/50">
              <h3 className="text-lg font-semibold mb-3">Tips for better results</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Be specific and descriptive about what you want to see</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Include style keywords like "photorealistic", "oil painting", "digital art"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Mention lighting, colors, and mood for more control</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Add quality terms like "highly detailed", "8k", "professional"</span>
                </li>
              </ul>
            </Card>
          )}
        </div>

        {/* Credits Section */}
        <div className="mt-20 pt-8 border-t border-border/50">
          <Card className="p-6 glass-card border-border/50 text-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Developed by</p>
              <h3 className="text-2xl font-bold gradient-text">Pramit</h3>
              <p className="text-sm text-muted-foreground">Main Developer</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
