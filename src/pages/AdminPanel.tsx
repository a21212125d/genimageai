import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Gift } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentRequest {
  id: string;
  user_id: string;
  amount: number;
  credits_requested: number;
  transaction_id: string | null;
  payment_screenshot_url: string | null;
  status: string;
  created_at: string;
  user_email?: string;
  user_display_name?: string;
}

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [creditsAmount, setCreditsAmount] = useState("");
  const [givingCredits, setGivingCredits] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (error) throw error;

        if (!data) {
          navigate('/');
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page.",
            variant: "destructive",
          });
          return;
        }

        setIsAdmin(true);
        loadPaymentRequests();
      } catch (error: any) {
        console.error('Error checking admin:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAdmin();
    }
  }, [user, authLoading, navigate, toast]);

  const loadPaymentRequests = async () => {
    try {
      const { data: requests, error: requestsError } = await supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch profiles separately
      const userIds = requests?.map(r => r.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Merge data
      const mergedData = requests?.map(request => {
        const profile = profiles?.find(p => p.id === request.user_id);
        return {
          ...request,
          user_email: profile?.email || 'Unknown',
          user_display_name: profile?.display_name || 'Unknown User'
        };
      }) || [];

      setPaymentRequests(mergedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load payment requests",
        variant: "destructive",
      });
    }
  };

  const approvePayment = async (paymentId: string) => {
    if (!user) return;
    
    setProcessingId(paymentId);
    try {
      const { error } = await supabase.rpc('approve_payment_and_add_credits', {
        _payment_id: paymentId,
        _admin_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment approved and credits added",
      });

      loadPaymentRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const rejectPayment = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      const { error } = await supabase
        .from('payment_requests')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment request rejected",
      });

      loadPaymentRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleGiveCredits = async () => {
    if (!userEmail.trim() || !creditsAmount.trim()) {
      toast({
        title: "Input required",
        description: "Please enter both email and credits amount",
        variant: "destructive",
      });
      return;
    }

    const credits = parseInt(creditsAmount);
    if (isNaN(credits) || credits <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    setGivingCredits(true);
    try {
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail.trim())
        .single();

      if (profileError || !profile) {
        toast({
          title: "User not found",
          description: "No user found with this email address",
          variant: "destructive",
        });
        return;
      }

      // Get current credits
      const { data: currentCredits, error: creditsError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', profile.id)
        .single();

      if (creditsError) throw creditsError;

      // Update credits
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          credits: (currentCredits?.credits || 0) + credits,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `Added ${credits} credits to ${userEmail}`,
      });

      setUserEmail("");
      setCreditsAmount("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGivingCredits(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 border-b border-white pb-4">Admin Panel</h1>

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="bg-black border-white border-2">
            <TabsTrigger value="payments" className="data-[state=active]:bg-white data-[state=active]:text-black">
              Payment Requests
            </TabsTrigger>
            <TabsTrigger value="credits" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <Gift className="w-4 h-4 mr-2" />
              Give Credits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <Card className="bg-black border-white border-2">
              <CardHeader>
                <CardTitle className="text-white">Payment Requests</CardTitle>
              </CardHeader>
              <CardContent>
              {paymentRequests.length === 0 ? (
                <p className="text-gray-400">No payment requests</p>
              ) : (
                <div className="space-y-4">
                  {paymentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border border-white p-4 rounded-lg space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">
                            {request.user_display_name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-400">{request.user_email}</p>
                        </div>
                        <Badge 
                          variant={
                            request.status === 'approved' ? 'default' :
                            request.status === 'rejected' ? 'destructive' :
                            'secondary'
                          }
                          className={
                            request.status === 'pending' ? 'bg-white text-black' : ''
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Amount:</span>
                          <span className="ml-2 text-white">₹{request.amount}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Credits:</span>
                          <span className="ml-2 text-white">{request.credits_requested}</span>
                        </div>
                        {request.transaction_id && (
                          <div className="col-span-2">
                            <span className="text-gray-400">Transaction ID:</span>
                            <span className="ml-2 text-white">{request.transaction_id}</span>
                          </div>
                        )}
                      </div>

                      {request.payment_screenshot_url && (
                        <div>
                          <p className="text-sm text-gray-400 mb-2">Payment Screenshot:</p>
                          <img
                            src={request.payment_screenshot_url}
                            alt="Payment proof"
                            className="max-w-md border border-white rounded"
                          />
                        </div>
                      )}

                      {request.status === 'pending' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => approvePayment(request.id)}
                            disabled={processingId === request.id}
                            className="bg-white text-black hover:bg-gray-200"
                          >
                            {processingId === request.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => rejectPayment(request.id)}
                            disabled={processingId === request.id}
                            variant="outline"
                            className="border-white text-white hover:bg-white hover:text-black"
                          >
                            {processingId === request.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="credits">
            <Card className="bg-black border-white border-2">
              <CardHeader>
                <CardTitle className="text-white">Give Credits to User</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="userEmail" className="text-white">User Email</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      placeholder="user@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="bg-black border-white text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creditsAmount" className="text-white">Credits Amount</Label>
                    <Input
                      id="creditsAmount"
                      type="number"
                      placeholder="100"
                      value={creditsAmount}
                      onChange={(e) => setCreditsAmount(e.target.value)}
                      className="bg-black border-white text-white placeholder:text-gray-500"
                    />
                  </div>

                  <Button
                    onClick={handleGiveCredits}
                    disabled={givingCredits}
                    className="w-full bg-white text-black hover:bg-gray-200"
                  >
                    {givingCredits ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4 mr-2" />
                        Give Credits
                      </>
                    )}
                  </Button>

                  <div className="pt-4 border-t border-white">
                    <p className="text-sm text-gray-400">
                      Enter the user's email address and the amount of credits to add to their account.
                      The credits will be added immediately.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
