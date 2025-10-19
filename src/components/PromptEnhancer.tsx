import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PromptEnhancerProps {
  prompt: string;
  onEnhance: (enhancedPrompt: string) => void;
}

export const PromptEnhancer = ({ prompt, onEnhance }: PromptEnhancerProps) => {
  const { toast } = useToast();

  const handleEnhance = async () => {
    if (!prompt.trim()) {
      toast({ title: "Please enter a prompt first", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("enhance-prompt", {
        body: { prompt },
      });

      if (error) throw error;
      onEnhance(data.enhancedPrompt);
      toast({ title: "Prompt enhanced!" });
    } catch (error: any) {
      toast({
        title: "Error enhancing prompt",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleEnhance}
      variant="outline"
      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
    >
      <Sparkles className="w-4 h-4 mr-2" />
      Enhance Prompt
    </Button>
  );
};