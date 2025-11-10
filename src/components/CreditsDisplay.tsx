import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "./ui/textarea";

export const CreditsDisplay = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadCredits();
    }
  }, [user]);

  const loadCredits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setCredits(data?.credits || 0);
    } catch (error) {
      console.error('Error loading credits:', error);
    }
  };

  const handlePaymentRequest = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user.id,
          amount: 149,
          credits_requested: 9000,
          transaction_id: transactionId || null,
          payment_screenshot_url: screenshotUrl || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Payment Request Submitted",
        description: "Your payment request has been submitted for approval. Credits will be added once approved.",
      });

      setTransactionId("");
      setScreenshotUrl("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
        <Sparkles className="w-5 h-5 text-secondary" />
        <span className="font-semibold text-foreground">
          {credits !== null ? credits : '...'} Credits
        </span>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="rounded-full">
            Buy Credits
          </Button>
        </DialogTrigger>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="gradient-text text-2xl">Buy Credits</DialogTitle>
            <DialogDescription>
              Get 9000 credits for ₹149 via PhonePe
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Scan QR code to pay via PhonePe</p>
              <div className="bg-white p-4 rounded-lg inline-block">
                {/* Placeholder for QR code - user needs to upload their QR code */}
                <div className="w-48 h-48 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <p className="text-xs text-gray-500 text-center px-4">
                    Upload your PhonePe QR code
                  </p>
                </div>
              </div>
              <p className="text-lg font-bold text-primary">₹149 = 9000 Credits</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
              <Input
                id="transactionId"
                placeholder="Enter PhonePe transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="screenshotUrl">Payment Screenshot URL (Optional)</Label>
              <Textarea
                id="screenshotUrl"
                placeholder="Paste screenshot URL or upload to image hosting service"
                value={screenshotUrl}
                onChange={(e) => setScreenshotUrl(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handlePaymentRequest}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Submitting..." : "Submit Payment Request"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              After payment, submit the transaction ID. Admin will approve within 24 hours.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
