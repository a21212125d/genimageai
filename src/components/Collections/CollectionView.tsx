import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Generation {
  id: string;
  prompt: string;
  image_data: string;
  created_at: string;
  favorite_id?: string;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
}

export const CollectionView = () => {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id && user) {
      loadCollection();
      loadGenerations();
    }
  }, [id, user]);

  const loadCollection = async () => {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast({ title: "Collection not found", variant: "destructive" });
      navigate("/");
      return;
    }

    setCollection(data);
  };

  const loadGenerations = async () => {
    const { data: favs, error } = await supabase
      .from("favorites")
      .select("id, generation_id")
      .eq("collection_id", id);

    if (error || !favs || favs.length === 0) {
      setGenerations([]);
      return;
    }

    const genIds = favs.map(f => f.generation_id);
    const { data: gens } = await supabase
      .from("generation_history")
      .select("*")
      .in("id", genIds)
      .order("created_at", { ascending: false });

    if (gens) {
      const gensWithFavId = gens.map(gen => ({
        ...gen,
        favorite_id: favs.find(f => f.generation_id === gen.id)?.id
      }));
      setGenerations(gensWithFavId);
    }
  };

  const handleRemove = async (favoriteId: string) => {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", favoriteId);

    if (!error) {
      toast({ title: "Removed from collection" });
      loadGenerations();
    }
  };

  const handleDownload = (imageData: string, prompt: string) => {
    const link = document.createElement("a");
    link.href = imageData;
    link.download = `${prompt.substring(0, 30)}.png`;
    link.click();
  };

  if (!collection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 p-8">
        <div className="container mx-auto">
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 p-8">
      <div className="container mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{collection.name}</h1>
          {collection.description && (
            <p className="text-muted-foreground">{collection.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {generations.length} {generations.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {generations.length === 0 ? (
          <div className="text-center py-12 glass-card">
            <p className="text-muted-foreground">This collection is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {generations.map((gen) => (
              <div key={gen.id} className="glass-card p-4">
                <div className="relative aspect-square mb-2 overflow-hidden rounded-lg">
                  <img
                    src={gen.image_data}
                    alt={gen.prompt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{gen.prompt}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(gen.image_data, gen.prompt)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => gen.favorite_id && handleRemove(gen.favorite_id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
