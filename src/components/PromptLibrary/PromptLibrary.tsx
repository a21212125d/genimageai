import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PromptCard } from "./PromptCard";
import { BookOpen } from "lucide-react";

interface Prompt {
  id: string;
  user_id: string;
  prompt: string;
  description: string | null;
  style: string | null;
  is_public: boolean;
  likes_count: number;
  example_image_url: string | null;
  created_at: string;
}

interface PromptLibraryProps {
  onUsePrompt: (prompt: string) => void;
}

export const PromptLibrary = ({ onUsePrompt }: PromptLibraryProps) => {
  const [myPrompts, setMyPrompts] = useState<Prompt[]>([]);
  const [publicPrompts, setPublicPrompts] = useState<Prompt[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadMyPrompts();
    loadPublicPrompts();
  }, [user]);

  const loadMyPrompts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("prompt_library")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMyPrompts(data);
    }
  };

  const loadPublicPrompts = async () => {
    const { data, error } = await supabase
      .from("prompt_library")
      .select("*")
      .eq("is_public", true)
      .order("likes_count", { ascending: false })
      .limit(50);

    if (!error && data) {
      setPublicPrompts(data);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("prompt_library")
      .delete()
      .eq("id", id);

    if (!error) {
      toast({ title: "Prompt deleted" });
      loadMyPrompts();
    }
  };

  const handleLike = async (id: string, currentLikes: number) => {
    const { error } = await supabase
      .from("prompt_library")
      .update({ likes_count: currentLikes + 1 })
      .eq("id", id);

    if (!error) {
      loadPublicPrompts();
    }
  };

  if (!myPrompts.length && !publicPrompts.length) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No prompts saved yet. Generate an image and save the prompt!</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="my" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="my">My Prompts ({myPrompts.length})</TabsTrigger>
        <TabsTrigger value="public">Public Gallery ({publicPrompts.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="my" className="mt-6">
        {myPrompts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No prompts saved yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onUse={onUsePrompt}
                onDelete={handleDelete}
                onLike={handleLike}
                isOwner={true}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="public" className="mt-6">
        {publicPrompts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No public prompts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onUse={onUsePrompt}
                onDelete={handleDelete}
                onLike={handleLike}
                isOwner={prompt.user_id === user?.id}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
