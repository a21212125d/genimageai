import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { CollectionDialog } from "./CollectionDialog";

interface Collection {
  id: string;
  name: string;
  description: string | null;
}

interface AddToCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  generationId: string;
}

export const AddToCollectionDialog = ({ open, onClose, generationId }: AddToCollectionDialogProps) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      loadCollections();
      loadExistingSelections();
    }
  }, [open, user, generationId]);

  const loadCollections = async () => {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCollections(data);
    }
  };

  const loadExistingSelections = async () => {
    const { data } = await supabase
      .from("favorites")
      .select("collection_id")
      .eq("generation_id", generationId)
      .not("collection_id", "is", null);

    if (data) {
      setSelectedIds(new Set(data.map(f => f.collection_id!)));
    }
  };

  const toggleCollection = (collectionId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setLoading(true);

    // Get current favorites for this generation
    const { data: existingFavs } = await supabase
      .from("favorites")
      .select("id, collection_id")
      .eq("generation_id", generationId);

    const existingCollectionIds = new Set(
      (existingFavs || [])
        .filter(f => f.collection_id)
        .map(f => f.collection_id!)
    );

    // Add to new collections
    const toAdd = Array.from(selectedIds).filter(id => !existingCollectionIds.has(id));
    if (toAdd.length > 0) {
      await Promise.all(
        toAdd.map(collectionId =>
          supabase.from("favorites").insert({
            user_id: user!.id,
            generation_id: generationId,
            collection_id: collectionId
          })
        )
      );
    }

    // Remove from unchecked collections
    const toRemove = Array.from(existingCollectionIds).filter(id => !selectedIds.has(id));
    if (toRemove.length > 0) {
      await supabase
        .from("favorites")
        .delete()
        .eq("generation_id", generationId)
        .in("collection_id", toRemove);
    }

    setLoading(false);
    toast({ title: "Collections updated" });
    onClose();
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    loadCollections();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add to Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {collections.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No collections yet</p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Collection
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer"
                      onClick={() => toggleCollection(collection.id)}
                    >
                      <Checkbox
                        checked={selectedIds.has(collection.id)}
                        onCheckedChange={() => toggleCollection(collection.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{collection.name}</p>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {collection.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Collection
                </Button>
              </>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave} disabled={loading || collections.length === 0}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CollectionDialog
        open={createDialogOpen}
        onClose={handleCreateDialogClose}
      />
    </>
  );
};
