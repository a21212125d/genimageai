import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  promptId: string;
  prompt: string;
}

export const ShareDialog = ({ open, onClose, promptId, prompt }: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/gallery?prompt=${promptId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: "Link copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const text = `Check out this AI art prompt: "${prompt.substring(0, 100)}..."`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(shareUrl);

    const urls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`
    };

    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Share Prompt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-foreground">Share Link</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={shareUrl}
                readOnly
                className="bg-background/50 border-border text-foreground"
              />
              <Button onClick={handleCopy} size="icon">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-foreground">Share on Social Media</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleShare("twitter")}
              >
                Twitter
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleShare("facebook")}
              >
                Facebook
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleShare("pinterest")}
              >
                Pinterest
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
