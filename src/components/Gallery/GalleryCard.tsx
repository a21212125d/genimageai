import { Heart, Wand2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShareDialog } from "./ShareDialog";
import { useState } from "react";

interface Prompt {
  id: string;
  prompt: string;
  description: string | null;
  style: string | null;
  likes_count: number;
  example_image_url: string | null;
}

interface GalleryCardProps {
  prompt: Prompt;
  onLike: (id: string, currentLikes: number) => void;
  onUsePrompt?: (prompt: string) => void;
}

export const GalleryCard = ({ prompt, onLike, onUsePrompt }: GalleryCardProps) => {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <div className="glass-card p-4 flex flex-col group">
        <div className="relative aspect-square mb-3 overflow-hidden rounded-lg">
          {prompt.example_image_url ? (
            <img
              src={prompt.example_image_url}
              alt={prompt.prompt}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted/30 flex items-center justify-center">
              <Wand2 className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
        </div>

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
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onLike(prompt.id, prompt.likes_count)}
            >
              <Heart className="w-4 h-4 mr-1" />
              {prompt.likes_count}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShareOpen(true)}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {onUsePrompt && (
            <Button
              size="sm"
              variant="default"
              onClick={() => onUsePrompt(prompt.prompt)}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Use
            </Button>
          )}
        </div>
      </div>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        promptId={prompt.id}
        prompt={prompt.prompt}
      />
    </>
  );
};
