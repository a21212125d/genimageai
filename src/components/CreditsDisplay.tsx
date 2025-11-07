import { Coins } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { Badge } from "@/components/ui/badge";

export const CreditsDisplay = () => {
  const { credits, loading } = useCredits();

  if (loading) return null;

  return (
    <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5">
      <Coins className="w-4 h-4 text-yellow-400" />
      <span className="font-semibold">{credits}</span>
      <span className="text-xs opacity-70">/ 100</span>
    </Badge>
  );
};
