import { Navbar } from "@/components/Navbar";
import { PublicGallery } from "@/components/Gallery/PublicGallery";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Gallery() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUsePrompt = (prompt: string) => {
    // Store prompt in session storage to use on main page
    sessionStorage.setItem("selectedPrompt", prompt);
    navigate("/");
    toast({ title: "Prompt loaded! Ready to generate." });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Public Gallery
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover and use amazing AI art prompts created by the community
          </p>
        </div>
        <PublicGallery onUsePrompt={handleUsePrompt} />
      </div>
    </div>
  );
}
