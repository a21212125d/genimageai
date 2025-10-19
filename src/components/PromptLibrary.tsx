import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Copy } from "lucide-react";

interface Prompt {
  id: string;
  prompt: string;
  description: string;
  style: string;
  likes_count: number;
}

interface PromptLibraryProps {
  onSelectPrompt: (prompt: string) => void;
}

export const PromptLibrary = ({ onSelectPrompt }: PromptLibraryProps) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadPrompts();
  }, [search]);

  const loadPrompts = async () => {
    let query = supabase
      .from("prompt_library")
      .select("*")
      .eq("is_public", true)
      .order("likes_count", { ascending: false })
      .limit(12);

    if (search) {
      query = query.ilike("prompt", `%${search}%`);
    }

    const { data } = await query;
    setPrompts(data || []);
  };

  const handleCopy = (prompt: string) => {
    onSelectPrompt(prompt);
    toast({ title: "Prompt copied to generator!" });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prompts..."
          className="pl-10 bg-white/10 border-white/20 text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="glass-card p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded">
                {prompt.style}
              </span>
              <span className="text-xs text-gray-400">❤️ {prompt.likes_count}</span>
            </div>
            <p className="text-sm text-gray-300 mb-2 line-clamp-3">{prompt.prompt}</p>
            {prompt.description && (
              <p className="text-xs text-gray-400 mb-2">{prompt.description}</p>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(prompt.prompt)}
              className="w-full bg-white/10 border-white/20 text-white"
            >
              <Copy className="w-3 h-3 mr-2" />
              Use This Prompt
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};