import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Folder, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectionDialog } from "./CollectionDialog";
import { useNavigate } from "react-router-dom";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  item_count?: number;
  thumbnail_images?: string[];
}

export const CollectionManager = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadCollections();
    }
  }, [user]);

  const loadCollections = async () => {
    const { data: collectionsData, error } = await supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading collections", variant: "destructive" });
      return;
    }

    // Get item counts and thumbnails for each collection
    const collectionsWithDetails = await Promise.all(
      (collectionsData || []).map(async (collection) => {
        const { data: favs } = await supabase
          .from("favorites")
          .select("generation_id")
          .eq("collection_id", collection.id);

        const item_count = favs?.length || 0;

        // Get up to 4 images for thumbnail mosaic
        if (favs && favs.length > 0) {
          const genIds = favs.slice(0, 4).map(f => f.generation_id);
          const { data: gens } = await supabase
            .from("generation_history")
            .select("image_data")
            .in("id", genIds);

          return {
            ...collection,
            item_count,
            thumbnail_images: gens?.map(g => g.image_data) || []
          };
        }

        return { ...collection, item_count, thumbnail_images: [] };
      })
    );

    setCollections(collectionsWithDetails);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", id);

    if (!error) {
      toast({ title: "Collection deleted" });
      loadCollections();
    } else {
      toast({ title: "Error deleting collection", variant: "destructive" });
    }
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingCollection(null);
    loadCollections();
  };

  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <Folder className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">No collections yet. Create one to organize your generations!</p>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Collection
        </Button>
        <CollectionDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          collection={editingCollection}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">My Collections</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Collection
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="glass-card p-4 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate(`/collection/${collection.id}`)}
          >
            <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-muted/30">
              {collection.thumbnail_images && collection.thumbnail_images.length > 0 ? (
                <div className="grid grid-cols-2 gap-1 h-full">
                  {collection.thumbnail_images.slice(0, 4).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Folder className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <h3 className="font-semibold text-foreground mb-1">{collection.name}</h3>
            {collection.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {collection.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {collection.item_count} {collection.item_count === 1 ? 'item' : 'items'}
              </span>
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(collection)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(collection.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CollectionDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        collection={editingCollection}
      />
    </div>
  );
};
