import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Zap, 
  Building2, 
  User, 
  Lock, 
  CreditCard, 
  Sparkles, 
  TrendingUp, 
  X, 
  ShieldCheck,
  Info,
  Clock
} from 'lucide-react';
import { SubscriptionTier, UserSubscription } from '../types';
import { databaseService } from '../services/db';
import { auth } from '../services/firebase';
import { PRICING_CONFIG, detectDefaultCurrency } from '../pricingConfig';
import { razorpayService } from '../services/razorpay';

interface PricingSectionProps {
  subscription: UserSubscription;
  onSubscriptionUpdate: (updated: UserSubscription) => void;
}

export default function PricingSection({ subscription, onSubscriptionUpdate }: PricingSectionProps) {
  const [checkoutTier, setCheckoutTier] = useState<SubscriptionTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [payerName, setPayerName] = useState('Jane Doe');
  const [payerEmail, setPayerEmail] = useState('user@example.com');
  const [selectedCurrency, setSelectedCurrency] = useState<'INR' | 'USD'>(() => detectDefaultCurrency());
  const [isSimulated, setIsSimulated] = useState(false);
  const [resetCountdown, setResetCountdown] = useState('');

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setResetCountdown(`${diffHrs}h ${diffMins}m`);
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setPayerEmail(user.email || 'user@example.com');
      setPayerName(user.displayName || 'Client User');
    }
  }, []);

  const plans = PRICING_CONFIG.plans.map(p => {
    const iconMap = {
      User: User,
      TrendingUp: TrendingUp,
      Building2: Building2
    };
    return {
      ...p,
      icon: iconMap[p.iconName as 'User' | 'TrendingUp' | 'Building2'] || User,
      price: selectedCurrency === 'INR' ? p.prices.INR.formatted : p.prices.USD.formatted
    };
  });

  const handleOpenCheckout = (tier: SubscriptionTier) => {
    if (tier === subscription.tier) return;
    if (tier === 'Free') {
      // Direct downgrade confirmation
      if (confirm('Are you sure you want to revert to the Free plan? Your query limits will immediately adjust.')) {
        setIsProcessing(true);
        databaseService.updateSubscription('Free').then(updated => {
          onSubscriptionUpdate(updated);
          setIsProcessing(false);
        });
      }
      return;
    }
    setCheckoutTier(tier);
    setPaymentSuccess(false);
    setPaymentError(null);
    setIsSimulated(false);
  };

  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutTier) return;
    
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const planConfig = PRICING_CONFIG.plans.find(p => p.tier === checkoutTier);
      if (!planConfig) {
        throw new Error('Invalid tier configuration selected.');
      }

      const currency = selectedCurrency;
      const amount = currency === 'INR' 
        ? planConfig.prices.INR.amount * 100 
        : planConfig.prices.USD.amount * 100;

      // 1. Create order using service file
      const receiptId = `receipt_${checkoutTier.toLowerCase()}_${Date.now()}`;
      const orderData = await razorpayService.createOrder(amount, currency, receiptId, checkoutTier);

      const isSim = !!(orderData as any).isSimulated || orderData.order_id.startsWith('sim_') || currency === 'USD';
      if (isSim) {
        setIsSimulated(true);
        console.log('Detected simulated sandbox mode. Bypassing Razorpay Checkout widget.');
        
        // Simulating loading duration before completing upgrade
        setTimeout(async () => {
          try {
            const verifyData = await razorpayService.verifyPayment(
              orderData.order_id,
              `pay_sim_${Math.random().toString(36).substring(2, 11)}`,
              'simulated_signature_bypass',
              checkoutTier
            );

            if (verifyData.success) {
              if (verifyData.subscription) {
                localStorage.setItem('localshop_ai_subscription', JSON.stringify(verifyData.subscription));
                onSubscriptionUpdate(verifyData.subscription);
              } else {
                const updated = await databaseService.updateSubscription(checkoutTier);
                onSubscriptionUpdate(updated);
              }
              setPaymentSuccess(true);
            } else {
              throw new Error(verifyData.error || 'Simulated verification failed');
            }
          } catch (verifyErr: any) {
            console.error('Simulated verification error:', verifyErr);
            setPaymentError(verifyErr.message || 'Simulated payment verification failed.');
          } finally {
            setIsProcessing(false);
          }
        }, 1500);
        return;
      }

      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_T7LdYbLjLmpXEx';

      // 2. Open official Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LocalShopAI',
        description: `Upgrade to ${checkoutTier} Plan`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            setIsProcessing(true);
            
            // 3. Verify Payment Signature & update Firestore using service file
            const verifyData = await razorpayService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              checkoutTier
            );

            if (verifyData.success) {
              // Read from verified backend response and sync state
              if (verifyData.subscription) {
                // Update local storage and app state
                localStorage.setItem('localshop_ai_subscription', JSON.stringify(verifyData.subscription));
                onSubscriptionUpdate(verifyData.subscription);
              } else {
                // Fallback to local sync if backend didn't return
                const updated = await databaseService.updateSubscription(checkoutTier);
                onSubscriptionUpdate(updated);
              }
              setPaymentSuccess(true);
            } else {
              throw new Error(verifyData.error || 'Signature verification failed');
            }
          } catch (verifyErr: any) {
            console.error('Payment signature verification error:', verifyErr);
            setPaymentError(verifyErr.message || 'Payment signature verification failed.');
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

  const isAgency = subscription.tier === 'Agency';
  const limit = isAgency ? 'Unlimited' : subscription.tier === 'Starter' ? 20 : 5;
  const used = subscription.searchesToday || 0;
  const remaining = isAgency ? 'Unlimited' : Math.max(0, (subscription.tier === 'Starter' ? 20 : 5) - used);
  const percentage = isAgency ? 100 : Math.min(100, Math.max(0, (used / (subscription.tier === 'Starter' ? 20 : 5)) * 100));

  return (
    <div id="pricing-section" className="w-full max-w-7xl mx-auto py-14 px-6 border-t border-slate-100 dark:border-slate-850 mt-16 font-sans">
      <div className="text-center mb-6 max-w-2xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 tracking-wider inline-block border border-indigo-150/20 dark:border-indigo-900/10">
          Flexible Pricing Models
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
          Accelerate Your Sales Pipeline
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Choose the membership level built to match your client acquisition goals. Pay zero onboarding fee, scale or cancel any time with instant Razorpay billing.
        </p>
      </div>

      {/* Currency Selector Toggle Switch */}
      <div className="flex justify-center items-center gap-3 mb-10">
        <span className={`text-xs font-bold tracking-wider uppercase transition-colors ${selectedCurrency === 'USD' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>USD ($)</span>
        <button
          type="button"
          onClick={() => setSelectedCurrency(prev => prev === 'USD' ? 'INR' : 'USD')}
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 bg-slate-200 dark:bg-slate-800"
          aria-label="Toggle currency"
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${selectedCurrency === 'INR' ? 'translate-x-5 bg-indigo-600 dark:bg-indigo-500' : 'translate-x-0'}`}
          />
        </button>
        <span className={`text-xs font-bold tracking-wider uppercase transition-colors ${selectedCurrency === 'INR' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>INR (₹)</span>
      </div>

      {/* Current Usage Card */}
      <div className="mb-12 max-w-3xl mx-auto">
        <div className="relative overflow-hidden bg-white dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
          {/* Decorative background gradients */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/5 dark:bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            {/* Top row: Plan Info and Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-900">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl shrink-0 ${
                  subscription.tier === 'Agency' 
                    ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400' 
                    : subscription.tier === 'Starter' 
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
                }`}>
                  {subscription.tier === 'Agency' ? (
                    <Building2 className="w-5 h-5" />
                  ) : subscription.tier === 'Starter' ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Your Account Usage
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                      <span className="w-1.5 h-1.5 mr-1 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-50">
                    {subscription.tier} Plan
                  </h3>
                </div>
              </div>

              {/* Status and Reset indicators */}
              <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:gap-6">
                <div>
                  <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Subscription Status
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Active</span>
                  </span>
                </div>
                <div className="sm:border-l sm:border-slate-150 sm:dark:border-slate-900 sm:pl-6">
                  <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Next Reset Time
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>12:00 AM Daily</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Middle part: Progress indicator and numbers */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <span>Searches Remaining:</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold">
                    {isAgency ? 'Unlimited' : `${remaining} of ${limit}`}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-500">
                  <span>Used Today: </span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{used}</span>
                  <span className="text-slate-400"> / </span>
                  <span className="font-mono">{isAgency ? '∞' : limit}</span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="relative h-2.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                {isAgency ? (
                  /* Animated gradient bar for Agency */
                  <div className="h-full w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 rounded-full animate-pulse" />
                ) : (
                  <div 
                    className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                      percentage >= 90 
                        ? 'from-rose-500 to-rose-400' 
                        : percentage >= 60 
                          ? 'from-indigo-500 to-amber-500' 
                          : 'from-indigo-600 to-indigo-400 dark:from-indigo-500 dark:to-indigo-300'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                )}
              </div>

              {/* Bottom labels */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                <span>
                  {isAgency ? 'Unlimited capacity unlocked' : `${Math.round(percentage)}% of daily quota used`}
                </span>
                <span>
                  {isAgency ? 'No daily caps apply' : `Resets in ${resetCountdown || '--h --m'}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
        {plans.map((p) => {
          const isCurrent = subscription.tier === p.tier;
          const PlanIcon = p.icon;

          return (
            <div 
              key={p.tier}
              className={`p-6 sm:p-8 rounded-2xl border bg-white dark:bg-slate-950/40 relative flex flex-col justify-between h-full transition-all shadow-xs overflow-hidden ${p.accent} ${isCurrent ? 'ring-4 ring-indigo-500/15 dark:ring-indigo-400/15' : ''}`}
            >
              {isCurrent && (
                <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-sm flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Active Plan</span>
                </span>
              )}

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${p.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' : p.color === 'purple' ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400' : 'bg-slate-105 text-slate-600 dark:bg-slate-900 dark:text-slate-450'}`}>
                    <PlanIcon className="w-5 h-5" />
                  </div>
                  {p.tier === 'Agency' && (
                    <span className="px-2.5 py-1 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 text-[10px] font-black uppercase tracking-widest leading-none">
                      Best Value
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-905 dark:text-slate-50">{p.tier}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-semibold min-h-8">
                    {p.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">{p.price}</span>
                  <span className="text-xs text-slate-450 dark:text-slate-500 font-bold">/{p.period}</span>
                </div>

                <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-900">
                  <span className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest block">
                    What is Included
                  </span>
                  <ul className="space-y-2.5">
                    {p.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span className="p-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 mt-0.5 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {p.notIncluded.map((feature, idx) => (
                      <li key={`not_${idx}`} className="flex items-start gap-2.5 text-xs font-semibold text-slate-400 dark:text-slate-600">
                        <span className="p-0.5 rounded bg-slate-50 text-slate-350 dark:bg-slate-900/20 dark:text-slate-700 mt-0.5 shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </span>
                        <span className="line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-2">
                <button
                  type="button"
                  disabled={isCurrent || isProcessing}
                  onClick={() => handleOpenCheckout(p.tier)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${isCurrent ? 'bg-slate-100 dark:bg-slate-900 text-slate-450 dark:text-slate-500 border border-slate-200 dark:border-slate-800 cursor-default' : p.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none' : p.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200 dark:shadow-none' : 'bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold border border-slate-950 dark:border-transparent'}`}
                >
                  {isCurrent ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />}
                  <span>{isCurrent ? 'Active Plan' : p.btnText}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {checkoutTier && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            {paymentSuccess ? (
              <div className="p-8 text-center space-y-6 relative">
                {/* Decorative background gradients */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 dark:bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-900 mx-auto animate-bounce">
                  <Sparkles className="w-8 h-8 fill-current text-emerald-500" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    🎉 Welcome to {checkoutTier}!
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
                    {checkoutTier === 'Starter' ? (
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
                    setCheckoutTier(null);
                    setIsSimulated(false);
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Start Searching</span>
                </button>
              </div>
            ) : (
              <>
                {/* Razorpay-Ready Visual Sidebar style Header bar */}
                <div className="bg-[#635bff] text-white p-6 relative overflow-hidden flex justify-between items-start">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-indigo-600 to-indigo-900" />
                  <div className="relative z-10 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded">
                        RAZORPAY BILLING
                      </span>
                      <span className="p-0.5 rounded-full bg-white text-emerald-500">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <h3 className="text-xl font-bold flex items-center gap-1">
                      <span>Pay with Razorpay</span>
                    </h3>
                    <p className="text-xs text-indigo-100 font-medium">To activate LocalShop {checkoutTier} Plan subscription</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setCheckoutTier(null)}
                    className="relative z-10 p-1.5 rounded-lg text-indigo-100 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close Checkout"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Price Details */}
                <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-900/80 flex justify-between items-center text-slate-800 dark:text-slate-10s">
                  <span className="text-xs font-bold">Standard Recurring Fee:</span>
                  <span className="text-lg font-black text-slate-950 dark:text-white">
                    {checkoutTier === 'Starter' ? '₹750/month' : '₹4,100/month'}
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  <form onSubmit={handleRazorpayPayment} className="space-y-4">
                    {/* Test Data help prompt */}
                    <div className="p-3.5 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/30 rounded-xl flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase font-black tracking-wider text-indigo-600 dark:text-indigo-400">Razorpay Payment Environment</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                          Specify your billing details below. On the next screen, you can choose mock credit card, UPI, or Netbanking in the Razorpay sandbox.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        placeholder="Jane Doe"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-805 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={payerEmail}
                        onChange={(e) => setPayerEmail(e.target.value)}
                        placeholder="user@example.com"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-805 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {paymentError && (
                      <div className="p-3 text-[11px] bg-rose-50 border border-rose-100 text-rose-800 rounded-lg dark:bg-rose-950/20 dark:border-rose-900 font-semibold leading-relaxed">
                        ⚠️ {paymentError}
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-3 bg-[#635bff] hover:bg-[#4d44db] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Verifying Payment...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-current" />
                            <span>Unlock {checkoutTier} Plan with Razorpay</span>
                          </>
                        )}
                      </button>
                      <p className="text-[10px] font-medium text-slate-400 text-center mt-2.5 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-500" />
                        <span>🔒 Fully encrypted 256-bit SSL transaction via Razorpay API</span>
                      </p>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
