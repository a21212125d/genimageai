import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Download, Star, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Generation {
  id: string;
  prompt: string;
  image_data: string;
  generation_type: string;
  created_at: string;
  is_favorite?: boolean;
}

export const GenerationHistory = () => {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadGenerations();
      loadFavorites();
    }
  }, [user]);

  const loadGenerations = async () => {
    const { data, error } = await supabase
      .from("generation_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      toast({ title: "Error loading history", variant: "destructive" });
      return;
    }
    setGenerations(data || []);
  };

  const loadFavorites = async () => {
    const { data } = await supabase
      .from("favorites")
      .select("generation_id");

    if (data) {
      setFavorites(new Set(data.map(f => f.generation_id)));
    }
  };

  const handleDownload = (imageData: string, prompt: string) => {
    const link = document.createElement("a");
    link.href = imageData;
    link.download = `${prompt.substring(0, 30)}.png`;
    link.click();
  };

  const handleToggleFavorite = async (generationId: string) => {
    if (favorites.has(generationId)) {
      await supabase
        .from("favorites")
        .delete()
        .eq("generation_id", generationId);
      setFavorites(prev => {
        const next = new Set(prev);
        next.delete(generationId);
        return next;
      });
    } else {
      await supabase
        .from("favorites")
        .insert({ generation_id: generationId, user_id: user!.id });
      setFavorites(prev => new Set(prev).add(generationId));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("generation_history")
      .delete()
      .eq("id", id);

    if (!error) {
      setGenerations(prev => prev.filter(g => g.id !== id));
      toast({ title: "Deleted successfully" });
    }
  };

  if (generations.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-400">No generations yet. Start creating!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {generations.map((gen) => (
        <div key={gen.id} className="glass-card p-4 group">
          <div className="relative aspect-square mb-2 overflow-hidden rounded-lg">
            <img
              src={gen.image_data}
              alt={gen.prompt}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm text-gray-300 line-clamp-2 mb-2">{gen.prompt}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleToggleFavorite(gen.id)}
              className={favorites.has(gen.id) ? "text-yellow-400" : "text-white"}
            >
              <Star className={`w-4 h-4 ${favorites.has(gen.id) ? "fill-current" : ""}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDownload(gen.image_data, gen.prompt)}
              className="text-white"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(gen.id)}
              className="text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};