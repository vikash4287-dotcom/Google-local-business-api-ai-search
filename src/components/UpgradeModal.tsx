import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  X, 
  Lock, 
  ShieldAlert, 
  Sparkles, 
  Zap, 
  CreditCard,
  ShieldCheck,
  Check,
  Info,
  Clock
} from 'lucide-react';
import { SubscriptionTier, UserSubscription } from '../types';
import { databaseService } from '../services/db';
import { auth } from '../services/firebase';
import { PRICING_CONFIG, detectDefaultCurrency } from '../pricingConfig';
import { razorpayService } from '../services/razorpay';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onSubscriptionUpdate: (updated: UserSubscription) => void;
}

export default function UpgradeModal({ isOpen, onClose, subscription, onSubscriptionUpdate }: UpgradeModalProps) {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('Starter');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [payerName, setPayerName] = useState('Jane Doe');
  const [payerEmail, setPayerEmail] = useState('user@example.com');
  const [selectedCurrency, setSelectedCurrency] = useState<'INR' | 'USD'>(() => detectDefaultCurrency());
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const user = auth.currentUser;
      if (user) {
        setPayerEmail(user.email || 'user@example.com');
        setPayerName(user.displayName || 'Client User');
      }
      setIsSimulated(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const planConfig = PRICING_CONFIG.plans.find(p => p.tier === selectedTier);
      if (!planConfig) {
        throw new Error('Invalid tier configuration selected.');
      }

      const currency = selectedCurrency;
      const amount = currency === 'INR' 
        ? planConfig.prices.INR.amount * 100 
        : planConfig.prices.USD.amount * 100;

      // 1. Create order using service file
      const receiptId = `receipt_${selectedTier.toLowerCase()}_${Date.now()}`;
      const orderData = await razorpayService.createOrder(amount, currency, receiptId, selectedTier);

      const keyId = localStorage.getItem('custom_razorpay_key_id') || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_T7LdYbLjLmpXEx';

      // 2. Open official Razorpay Checkout Modal
      const options: any = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LocalShopAI',
        description: `Upgrade to ${selectedTier} Plan`,
        handler: async function (response: any) {
          try {
            setIsProcessing(true);
            
            // 3. Verify Payment Signature & update Firestore using service file
            // Use simulated fallback if order was simulated and signature is missing
            const verifyData = await razorpayService.verifyPayment(
              response.razorpay_order_id || orderData.order_id,
              response.razorpay_payment_id,
              response.razorpay_signature || 'simulated_signature_bypass',
              selectedTier
            );

            if (verifyData.success) {
              if (verifyData.subscription) {
                localStorage.setItem('localshop_ai_subscription', JSON.stringify(verifyData.subscription));
                onSubscriptionUpdate(verifyData.subscription);
              } else {
                const updated = await databaseService.updateSubscription(selectedTier);
                onSubscriptionUpdate(updated);
              }
              setPaymentSuccess(true);
              toast.success(`Successfully upgraded to ${selectedTier} Plan!`);
            } else {
              throw new Error(verifyData.error || 'Signature verification failed');
            }
          } catch (verifyErr: any) {
            console.error('Payment signature verification error:', verifyErr);
            const errMsg = verifyErr.message || 'Payment signature verification failed.';
            setPaymentError(errMsg);
            toast.error(errMsg);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: payerName,
          email: payerEmail,
        },
        theme: {
          color: '#635bff',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setPaymentError('Payment was cancelled by the user.');
          }
        }
      };

      // Only pass order_id to options if it is a real order and not simulated
      if (orderData.order_id && !orderData.order_id.startsWith('sim_')) {
        options.order_id = orderData.order_id;
      } else {
        console.log('Using direct checkout mode in UpgradeModal because order ID is simulated.');
      }

      if (!(window as any).Razorpay) {
        throw new Error('Razorpay SDK is not loaded. Please check your internet connection.');
      }

      const rzp = new (window as any).Razorpay(options);

      rzp.on('payment.failed', function (response: any) {
        console.warn('Payment failed event:', response);
        const errorDetails = response?.error || {};
        const errorDescription = errorDetails.description || errorDetails.message || response?.message || 'The transaction could not be completed.';
        setPaymentError(`Payment Failed: ${errorDescription}`);
        setIsProcessing(false);
      });

      rzp.open();
    } catch (err: any) {
      console.error('Razorpay initialization failed:', err);
      setPaymentError(err.message || 'Failed to initialize payment.');
      setIsProcessing(false);
    }
  };

  const getLimitText = () => {
    if (subscription.tier === 'Free') {
      return {
        reached: 'You have reached the Free Plan daily limit of 5 searches.',
        starterBenefit: 'Starter unlocks 20 searches/day & up to 20 leads/search.',
        agencyBenefit: 'Agency unlocks Unlimited searches, custom proposals, and full outreach toolkits.'
      };
    }
    return {
      reached: 'You have reached the Starter Plan daily limit of 20 searches.',
      starterBenefit: `You are currently on the Starter Plan (${selectedCurrency === 'INR' ? '₹750' : '$9'}/mo).`,
      agencyBenefit: 'Agency unlocks Unlimited searches, custom proposals, and full outreach toolkits.'
    };
  };

  const text = getLimitText();

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-8 relative overflow-hidden animate-in zoom-in-95 duration-200 text-center space-y-6">
          {/* Confetti/Sparkle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 dark:bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-900 mx-auto animate-bounce">
            <Sparkles className="w-8 h-8 fill-current text-emerald-500" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              🎉 Welcome to {selectedTier}!
            </h3>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Your account has been successfully upgraded.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-900/80 rounded-xl p-5 text-left space-y-3">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              You now have:
            </span>
            <ul className="space-y-2.5">
              {selectedTier === 'Starter' ? (
                <>
                  <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span>20 searches per day</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span>SEO Audits</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span>Proposal Builder</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span>AI Outreach</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    <span>Unlimited reports & searches</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    <span>SEO Audits & custom reports</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    <span>Unlimited custom proposal builds</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    <span>Tailored AI Outreach templates</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    <span>Unlimited lead exports to CSV</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => {
              setPaymentSuccess(false);
              onClose();
            }}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Start Searching</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-950 border border-slate-155 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col md:flex-row h-auto md:h-[520px]">
        
        {/* Left Side: Limit Notification / Benefits */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 md:p-8 text-white flex flex-col justify-between w-full md:w-[45%] text-left">
          <div className="space-y-6">
            <div className="p-3 w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-450 block">LIMIT REACHED</span>
              <h3 className="text-lg md:text-xl font-black text-white tracking-snug">
                Expand Your Local Sales Search
              </h3>
              <p className="text-xs text-indigo-200/90 leading-relaxed font-semibold">
                {text.reached} Turn more local businesses into high-paying web and marketing clients by unlocking premium search and lead pipelines.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-indigo-150">
                <span className="p-0.5 rounded bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5 border border-indigo-400/10">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>{text.starterBenefit}</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-indigo-150">
                <span className="p-0.5 rounded bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5 border border-indigo-400/10">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>{text.agencyBenefit}</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-indigo-350/80 font-semibold pt-4">
            Secured by Razorpay Checkout API. Scale or cancel subscription at any point.
          </div>
        </div>

        {/* Right Side: Simple Payments Forms */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between overflow-y-auto max-h-[500px] md:max-h-full relative">
          {/* Header Close check */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-900 relative z-30">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Checkout</h4>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {paymentSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3.5 animate-in fade-in duration-300">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-900 animate-bounce">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-950 dark:text-slate-50">Activation Successful!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold max-w-xs">
                  Your profile has been upgraded to **{selectedTier} plan**. Your higher search daily quotas and leads views are instantly active!
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRazorpayPayment} className="space-y-4 pt-4">
              
              {/* Currency selector inside form */}
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-900">
                <span className="text-[9px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Currency Selection</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCurrency('USD')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${selectedCurrency === 'USD' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-900 text-slate-450 hover:text-slate-700 dark:hover:text-slate-350'}`}
                  >
                    USD ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCurrency('INR')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${selectedCurrency === 'INR' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-900 text-slate-450 hover:text-slate-700 dark:hover:text-slate-350'}`}
                  >
                    INR (₹)
                  </button>
                </div>
              </div>

              {/* Plan Choice Select Button Toggles */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">
                  Select Billing Option
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTier('Starter')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${selectedTier === 'Starter' ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'}`}
                  >
                    <span className="text-xs font-black">Starter</span>
                    <span className="text-[11px] font-semibold mt-1 opacity-90">
                      {selectedCurrency === 'INR' ? '₹750/mo' : '$9/mo'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTier('Agency')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${selectedTier === 'Agency' ? 'border-purple-500 bg-purple-50/10 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 font-bold' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'}`}
                  >
                    <span className="text-xs font-black">Agency</span>
                    <span className="text-[11px] font-semibold mt-1 opacity-90">
                      {selectedCurrency === 'INR' ? '₹4,100/mo' : '$49/mo'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Secure sandbox help */}
              <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-900/20 rounded-xl">
                <div className="flex gap-2">
                  <Info className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                    Razorpay Checkout prefill details can be configured below.
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-800 dark:text-white font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-800 dark:text-white font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {paymentError && (
                <div className="p-2.5 text-[10px] bg-rose-50 border border-rose-100 text-rose-800 rounded-lg dark:bg-rose-950/20 dark:border-rose-900 font-semibold leading-relaxed">
                  ⚠️ {paymentError}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Payment...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 animate-bounce fill-current" />
                      <span>Unlock {selectedTier} Access with Razorpay</span>
                    </>
                  )}
                </button>
                <div className="text-[9px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1 font-semibold">
                  <span>🔒 Secure checkout via Razorpay Standard Gateway</span>
                </div>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
