import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sparkles } from "lucide-react";

interface CreateVariationsProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  originalPrompt: string;
  onComplete: () => void;
}

export const CreateVariations = ({
  open,
  onClose,
  imageUrl,
  originalPrompt,
  onComplete
}: CreateVariationsProps) => {
  const [count, setCount] = useState(2);
  const [creativity, setCreativity] = useState(50);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);

    const creativityLabels = ["subtle variation", "moderate variation", "creative variation"];
    const creativityIndex = creativity < 33 ? 0 : creativity < 66 ? 1 : 2;
    const variationPrompt = `${originalPrompt}, ${creativityLabels[creativityIndex]}, alternative version`;

    try {
      for (let i = 0; i < count; i++) {
        const { data, error } = await supabase.functions.invoke("edit-image", {
          body: {
            prompt: variationPrompt,
            imageUrl: imageUrl
          }
        });

        if (error) throw error;

        if (data?.imageUrl) {
          await supabase.from("generation_history").insert({
            user_id: user!.id,
            prompt: `Variation: ${originalPrompt}`,
            image_data: data.imageUrl,
            generation_type: "variation",
            settings: { creativity, originalPrompt }
          });
        }
      }

      toast({ title: `${count} variations created!` });
      onComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error creating variations",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Create Variations
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label className="text-foreground">Number of Variations</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[count]}
                onValueChange={(v) => setCount(v[0])}
                min={2}
                max={4}
                step={1}
                className="flex-1"
              />
              <span className="text-foreground font-semibold w-8">{count}</span>
            </div>
          </div>

          <div>
            <Label className="text-foreground">Creativity Level</Label>
            <div className="space-y-2 mt-2">
              <Slider
                value={[creativity]}
                onValueChange={(v) => setCreativity(v[0])}
                min={0}
                max={100}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtle</span>
                <span>Moderate</span>
                <span>Creative</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              This will create {count} unique variation{count > 1 ? 's' : ''} of your image
              with a {creativity < 33 ? 'subtle' : creativity < 66 ? 'moderate' : 'creative'} level
              of change.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? "Creating..." : "Generate Variations"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
