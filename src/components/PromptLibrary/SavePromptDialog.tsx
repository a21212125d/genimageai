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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SavePromptDialogProps {
  open: boolean;
  onClose: () => void;
  prompt: string;
  imageUrl?: string;
  style?: string;
}

export const SavePromptDialog = ({ open, onClose, prompt, imageUrl, style }: SavePromptDialogProps) => {
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!prompt.trim()) {
      toast({ title: "No prompt to save", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("prompt_library")
      .insert({
        user_id: user!.id,
        prompt: prompt.trim(),
        description: description.trim() || null,
        style: style || null,
        is_public: isPublic,
        example_image_url: imageUrl || null,
        likes_count: 0
      });

    if (error) {
      toast({ title: "Error saving prompt", variant: "destructive" });
    } else {
      toast({ title: isPublic ? "Prompt shared to public gallery!" : "Prompt saved" });
      setDescription("");
      setIsPublic(false);
      onClose();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Save Prompt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-foreground">Prompt</Label>
            <p className="text-sm text-muted-foreground line-clamp-3 p-3 bg-muted/30 rounded-lg mt-1">
              {prompt}
            </p>
          </div>

          <div>
            <Label htmlFor="description" className="text-foreground">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this prompt..."
              className="bg-background/50 border-border text-foreground"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <Label htmlFor="public" className="text-foreground font-semibold">
                Share to Public Gallery
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Let others discover and use your prompt
              </p>
            </div>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Prompt"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
