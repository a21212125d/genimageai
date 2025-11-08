import { useState, useEffect } from "react";
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

interface CollectionDialogProps {
  open: boolean;
  onClose: () => void;
  collection?: { id: string; name: string; description: string | null } | null;
}

export const CollectionDialog = ({ open, onClose, collection }: CollectionDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setDescription(collection.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [collection, open]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Please enter a collection name", variant: "destructive" });
      return;
    }

    setLoading(true);

    if (collection) {
      // Update existing
      const { error } = await supabase
        .from("collections")
        .update({ name: name.trim(), description: description.trim() || null })
        .eq("id", collection.id);

      if (error) {
        toast({ title: "Error updating collection", variant: "destructive" });
      } else {
        toast({ title: "Collection updated" });
        onClose();
      }
    } else {
      // Create new
      const { error } = await supabase
        .from("collections")
        .insert({
          user_id: user!.id,
          name: name.trim(),
          description: description.trim() || null
        });

      if (error) {
        toast({ title: "Error creating collection", variant: "destructive" });
      } else {
        toast({ title: "Collection created" });
        onClose();
      }
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {collection ? "Edit Collection" : "Create Collection"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-foreground">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Collection"
              className="bg-background/50 border-border text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-foreground">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your collection..."
              className="bg-background/50 border-border text-foreground"
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
