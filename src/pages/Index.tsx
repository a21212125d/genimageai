import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, Download, Upload, Image as ImageIcon, History, Shuffle, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { GenerationSettings } from "@/components/GenerationSettings";
import { PromptEnhancer } from "@/components/PromptEnhancer";
import { GenerationHistory } from "@/components/GenerationHistory";
import { BannerAd } from "@/components/BannerAd";
import { VoiceRecorder } from "@/components/VoiceRecorder";


const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Advanced settings
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [style, setStyle] = useState("photorealistic");
  
  // Image-to-image state
  const [editPrompt, setEditPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

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
      const enhancedPrompt = `${prompt}, ${style} style, ${aspectRatio} aspect ratio`;
      
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: enhancedPrompt },
      });

      if (error) throw error;

      if (data?.image) {
        setGeneratedImage(data.image);
        
        // Validate image size before storing (5MB limit for base64)
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
        if (data.image.length > MAX_IMAGE_SIZE) {
          toast({
            title: "Image too large to save",
            description: "The generated image exceeds the storage limit. You can still download it.",
            variant: "destructive",
          });
        } else {
          // Save to history
          await supabase.from("generation_history").insert({
            user_id: user!.id,
            prompt: prompt,
            image_data: data.image,
            generation_type: "text-to-image",
            settings: { aspectRatio, style },
          });
        }

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

  const handleSurpriseMe = () => {
    const surprisePrompts = [
      "A magical forest with glowing mushrooms and fairy lights at twilight",
      "A futuristic city skyline with flying cars and neon lights",
      "An underwater palace made of coral and seashells",
      "A steampunk airship soaring through cloudy skies",
      "A cozy library filled with ancient books and a fireplace",
      "A dragon perched on a mountain peak during a thunderstorm",
      "A cyberpunk street market with holographic vendors",
      "An enchanted garden with flowers that glow in the dark",
    ];
    const randomPrompt = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)];
    setPrompt(randomPrompt);
  };

  const handleDownload = (imageData: string, prefix: string = "generated") => {
    if (!imageData) return;

    const link = document.createElement("a");
    link.href = imageData;
    link.download = `ai-${prefix}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // Additional validation for base64 size
      if (result && result.length > MAX_FILE_SIZE) {
        toast({
          title: "Image too large",
          description: "Encoded image exceeds 5MB limit",
          variant: "destructive",
        });
        return;
      }
      
      setUploadedImage(result);
      setEditedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleEditImage = async () => {
    if (!uploadedImage || !editPrompt.trim()) {
      toast({
        title: "Input required",
        description: "Please upload an image and enter editing instructions",
        variant: "destructive",
      });
      return;
    }

    setIsEditing(true);
    setEditedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("edit-image", {
        body: { 
          prompt: editPrompt,
          imageUrl: uploadedImage 
        },
      });

      if (error) throw error;

      if (data?.image) {
        setEditedImage(data.image);
        
        // Validate image size before storing (5MB limit for base64)
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
        if (data.image.length > MAX_IMAGE_SIZE) {
          toast({
            title: "Image too large to save",
            description: "The edited image exceeds the storage limit. You can still download it.",
            variant: "destructive",
          });
        } else {
          // Save to history
          await supabase.from("generation_history").insert({
            user_id: user!.id,
            prompt: editPrompt,
            image_data: data.image,
            generation_type: "image-to-image",
            settings: {},
          });
        }

        toast({
          title: "Image edited!",
          description: "Your AI-edited image is ready",
        });
      }
    } catch (error: any) {
      console.error("Edit error:", error);
      toast({
        title: "Edit failed",
        description: error.message || "Failed to edit image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-24 md:py-28">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Powered by Nano banana AI</span>
          </div>
          
          <h1 className="flex justify-center items-center mb-4">
            <img 
              src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=900&size=45&pause=1000&color=F70000&width=600&lines=GenAi;Image+Generator;Free;Safe" 
              alt="GenAi - Animated Title"
              className="mx-auto"
            />
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your imagination into stunning visuals with the power of AI. 
            Simply describe what you want to see and watch it come to life.
          </p>
        </div>

        {/* Top Banner Ad */}
        <div className="max-w-6xl mx-auto mb-8">
          <BannerAd position="top" />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="generate" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 glass-card">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="download">
              <Smartphone className="w-4 h-4 mr-2" />
              Download
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-8 mt-8">
            <Card className="p-6 glass-card border-border/50">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <PromptEnhancer prompt={prompt} onEnhance={setPrompt} />
                  <Button
                    onClick={handleSurpriseMe}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Surprise Me
                  </Button>
                </div>

                <div>
                  <label htmlFor="prompt" className="text-sm font-medium block mb-2">
                    Describe your image
                  </label>
                  <div className="flex gap-2">
                    <Textarea
                      id="prompt"
                      placeholder="A serene mountain landscape at sunset with purple and orange skies, reflection in a crystal clear lake, ultra realistic, 8k..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[120px] bg-background/50 resize-none"
                      disabled={isGenerating}
                    />
                    <VoiceRecorder 
                      onTranscription={(text) => setPrompt(prev => prev ? `${prev} ${text}` : text)}
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                <GenerationSettings
                  aspectRatio={aspectRatio}
                  onAspectRatioChange={setAspectRatio}
                  style={style}
                  onStyleChange={setStyle}
                />

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
                    onClick={() => handleDownload(generatedImage, "generated")}
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

          {/* Middle Banner Ad */}
          {generatedImage && (
            <div className="animate-in fade-in-50 duration-500">
              <BannerAd position="middle" />
            </div>
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

          {/* Image-to-Image Section */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="gradient-text">Edit Your Images</span>
              </h2>
              <p className="text-muted-foreground">
                Upload an image and transform it with AI
              </p>
            </div>

            <Card className="p-6 glass-card border-border/50">
              <div className="space-y-4">
                {/* File Upload Area */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Upload Image
                  </label>
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full"
                      disabled={isEditing}
                    >
                      <Upload className="w-4 h-4" />
                      {uploadedImage ? "Change Image" : "Upload Image"}
                    </Button>
                  </div>
                </div>

                {/* Preview uploaded image */}
                {uploadedImage && (
                  <div className="relative rounded-lg overflow-hidden bg-muted">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                )}

                {/* Edit Instructions */}
                <div>
                  <label htmlFor="editPrompt" className="text-sm font-medium block mb-2">
                    How should we transform this image?
                  </label>
                  <div className="flex gap-2">
                    <Textarea
                      id="editPrompt"
                      placeholder="Make it look like a watercolor painting, add sunset lighting, make it rainy..."
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      className="min-h-[100px] bg-background/50 resize-none"
                      disabled={isEditing}
                    />
                    <VoiceRecorder 
                      onTranscription={(text) => setEditPrompt(prev => prev ? `${prev} ${text}` : text)}
                      disabled={isEditing}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleEditImage}
                  disabled={isEditing || !uploadedImage}
                  variant="hero"
                  size="lg"
                  className="w-full"
                >
                  {isEditing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Editing...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5" />
                      Edit Image
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Edited Image Display */}
            {editedImage && (
              <Card className="p-6 glass-card border-border/50 animate-in fade-in-50 duration-500 mt-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Your Edited Image</h2>
                    <Button
                      onClick={() => handleDownload(editedImage, "edited")}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="relative rounded-lg overflow-hidden bg-muted">
                    <img
                      src={editedImage}
                      alt="AI edited artwork"
                      className="w-full h-auto"
                    />
                  </div>

                  <p className="text-sm text-muted-foreground italic">
                    "{editPrompt}"
                  </p>
                </div>
              </Card>
            )}
          </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-8">
            <GenerationHistory />
          </TabsContent>

          {/* Download Tab */}
          <TabsContent value="download" className="mt-8">
            <Card className="p-8 glass-card border-border/50">
              <div className="text-center mb-8">
                <Smartphone className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h2 className="text-3xl font-bold mb-2 gradient-text">Download Mobile App</h2>
                <p className="text-muted-foreground">
                  Get the AI Image Generator on your Android device
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                <Card className="p-6 border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Smartphone className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">Android App</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Download and install the Android version of our app
                      </p>
                      <Button 
                        variant="hero" 
                        className="w-full"
                        asChild
                      >
                        <a href="/GenAI.zip" download>
                          <Download className="w-4 h-4 mr-2" />
                          Download App
                        </a>
                      </Button>
                      <p className="text-xs text-muted-foreground mt-3">
                        Compatible with Android 5.0 and above
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="text-center text-sm text-muted-foreground">
                  <p>iOS version coming soon</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom Banner Ad */}
        <div className="mt-16">
          <BannerAd position="bottom" />
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

        {/* Footer */}
        <footer className="mt-12 py-6 text-center text-sm text-muted-foreground">
          <a href="/privacy-policy" className="hover:text-primary transition-colors">
            Privacy Policy
          </a>
        </footer>
      </div>
    </div>
  );
};

export default Index;
