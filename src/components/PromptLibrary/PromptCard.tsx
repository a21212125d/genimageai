import { Heart, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Prompt {
  id: string;
  prompt: string;
  description: string | null;
  style: string | null;
  is_public: boolean;
  likes_count: number;
  example_image_url: string | null;
}

interface PromptCardProps {
  prompt: Prompt;
  onUse: (prompt: string) => void;
  onDelete: (id: string) => void;
  onLike: (id: string, currentLikes: number) => void;
  isOwner: boolean;
}

export const PromptCard = ({ prompt, onUse, onDelete, onLike, isOwner }: PromptCardProps) => {
  return (
    <div className="glass-card p-4 flex flex-col">
      {prompt.example_image_url && (
        <div className="aspect-square mb-3 overflow-hidden rounded-lg">
          <img
            src={prompt.example_image_url}
            alt={prompt.prompt}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex-1">
        <p className="text-sm text-foreground line-clamp-3 mb-2">{prompt.prompt}</p>
        {prompt.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{prompt.description}</p>
        )}
        {prompt.style && (
          <Badge variant="secondary" className="mb-3">
            {prompt.style}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <Button
          size="sm"
          variant="default"
          onClick={() => onUse(prompt.prompt)}
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Use
        </Button>

        <div className="flex gap-2">
          {prompt.is_public && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onLike(prompt.id, prompt.likes_count)}
            >
              <Heart className="w-4 h-4 mr-1" />
              {prompt.likes_count}
            </Button>
          )}
          {isOwner && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(prompt.id)}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
