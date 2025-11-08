import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GalleryCard } from "./GalleryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Prompt {
  id: string;
  user_id: string;
  prompt: string;
  description: string | null;
  style: string | null;
  likes_count: number;
  example_image_url: string | null;
  created_at: string;
}

interface PublicGalleryProps {
  onUsePrompt?: (prompt: string) => void;
}

export const PublicGallery = ({ onUsePrompt }: PublicGalleryProps) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [sortBy, setSortBy] = useState<"likes" | "recent">("likes");

  useEffect(() => {
    loadPrompts();
  }, [sortBy]);

  const loadPrompts = async () => {
    const orderBy = sortBy === "likes" ? "likes_count" : "created_at";
    const { data, error } = await supabase
      .from("prompt_library")
      .select("*")
      .eq("is_public", true)
      .order(orderBy, { ascending: false })
      .limit(100);

    if (!error && data) {
      setPrompts(data);
    }
  };

  const handleLike = async (id: string, currentLikes: number) => {
    const { error } = await supabase
      .from("prompt_library")
      .update({ likes_count: currentLikes + 1 })
      .eq("id", id);

    if (!error) {
      loadPrompts();
    }
  };

  return (
    <div>
      <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as "likes" | "recent")} className="mb-6">
        <TabsList>
          <TabsTrigger value="likes">Most Liked</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>
      </Tabs>

      {prompts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No public prompts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {prompts.map((prompt) => (
            <GalleryCard
              key={prompt.id}
              prompt={prompt}
              onLike={handleLike}
              onUsePrompt={onUsePrompt}
            />
          ))}
        </div>
      )}
    </div>
  );
};
