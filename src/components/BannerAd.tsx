import { Card } from "@/components/ui/card";
import { useEffect } from "react";

interface BannerAdProps {
  position?: "top" | "middle" | "bottom";
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const BannerAd = ({ position = "middle" }: BannerAdProps) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <Card className="p-4 glass-card border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
      <div className="flex items-center justify-center gap-4">
        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Advertisement</p>
          <ins 
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-6793804296748712"
            data-ad-slot="6744452497"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </Card>
  );
};
