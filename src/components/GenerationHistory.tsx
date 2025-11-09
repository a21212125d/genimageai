import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Download, Star, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Generation {
  id: string;
  prompt: string;
  image_data: string;
  generation_type: string;
  created_at: string;
  is_favorite?: boolean;
}

const ITEMS_PER_PAGE = 12;

export const GenerationHistory = () => {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    setIsLoading(true);
    await Promise.all([loadGenerations(0), loadFavorites()]);
    setIsLoading(false);
  };

  const loadGenerations = async (pageNum: number) => {
    const { data, error } = await supabase
      .from("generation_history")
      .select("id, prompt, generation_type, created_at, image_data")
      .order("created_at", { ascending: false })
      .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

    if (error) {
      toast({ title: "Error loading history", variant: "destructive" });
      return;
    }
    
    if (data) {
      setGenerations(prev => pageNum === 0 ? data : [...prev, ...data]);
      setHasMore(data.length === ITEMS_PER_PAGE);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    const nextPage = page + 1;
    await loadGenerations(nextPage);
    setPage(nextPage);
    setIsLoadingMore(false);
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card p-4">
            <Skeleton className="aspect-square mb-2 rounded-lg" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-400">No generations yet. Start creating!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {generations.map((gen) => (
          <div key={gen.id} className="glass-card p-4 group">
            <div className="relative aspect-square mb-2 overflow-hidden rounded-lg bg-muted">
              <img
                src={gen.image_data}
                alt={gen.prompt}
                className="w-full h-full object-cover"
                loading="lazy"
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

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={loadMore}
            disabled={isLoadingMore}
            variant="outline"
            size="lg"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};