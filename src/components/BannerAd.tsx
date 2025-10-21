import { Card } from "@/components/ui/card";

interface BannerAdProps {
  position?: "top" | "middle" | "bottom";
}

export const BannerAd = ({ position = "middle" }: BannerAdProps) => {
  return (
    <Card className="p-4 glass-card border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
      <div className="flex items-center justify-center gap-4">
        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Advertisement</p>
          <div className="bg-background/50 rounded-lg p-6 min-h-[100px] flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Your Ad Here - 728x90</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
