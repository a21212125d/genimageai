import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useCredits = () => {
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCredits = async () => {
    if (!user) {
      setCredits(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-credits', {
        body: { action: 'check', creditsNeeded: 0 }
      });

      if (error) throw error;
      setCredits(data.credits || 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
      setCredits(0);
    } finally {
      setLoading(false);
    }
  };

  const deductCredits = async (amount: number = 5) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase.functions.invoke('check-credits', {
        body: { action: 'deduct', creditsNeeded: amount }
      });

      if (error) throw error;
      
      if (data.error) {
        return { success: false, error: data.error, credits: data.credits };
      }

      setCredits(data.credits);
      return { success: true, credits: data.credits };
    } catch (error) {
      console.error('Error deducting credits:', error);
      return { success: false, error: 'Failed to deduct credits' };
    }
  };

  useEffect(() => {
    fetchCredits();
    
    const interval = setInterval(fetchCredits, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [user]);

  return { credits, loading, fetchCredits, deductCredits };
};
