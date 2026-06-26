import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import { SubscriptionTier, UserSubscription } from '../types';
import { databaseService } from '../services/db';

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

  const plans = [
    {
      tier: 'Free' as SubscriptionTier,
      price: '$0',
      period: 'forever',
      description: 'Foundational access for freelancers testing the waters.',
      features: [
        '5 searches per day',
        'Only 10 leads shown per search',
        'Basic business info (Address, Phone)',
        'Opportunity Score calculator',
        'Basic local search simulation'
      ],
      notIncluded: [
        'Advanced website audits',
        'Growth sales proposal generator',
        'Personalized Outreach templates',
        'Direct leads export to CSV'
      ],
      icon: User,
      color: 'slate',
      btnText: 'Current Plan',
      accent: 'border-slate-200 dark:border-slate-800'
    },
    {
      tier: 'Starter' as SubscriptionTier,
      price: '$9',
      period: 'month',
      description: 'Ideal for specialized local consultants launching their pipeline.',
      features: [
        '20 searches per day',
        'Up to 20 leads shown per search',
        'Advanced Website SEO Auditing',
        'Custom Opportunity ranks',
        'Full review & reputation stats',
        'Interactive service packages builder',
        'Save unlimited qualified leads'
      ],
      notIncluded: [
        'Cold email and pitch templates',
        'Google Places native routing',
        'Custom reports download'
      ],
      icon: TrendingUp,
      color: 'indigo',
      btnText: 'Upgrade to Starter',
      accent: 'border-indigo-500 ring-2 ring-indigo-500/10 dark:ring-indigo-400/10'
    },
    {
      tier: 'Agency' as SubscriptionTier,
      price: '$49',
      period: 'month',
      description: 'Uncensored access for fully scaled digital marketing agencies.',
      features: [
        'Unlimited reports & searches',
        'Unlimited custom proposal builds',
        'Unlimited tailored outreach copy',
        'Unlimited lead exports to CSV',
        'Enterprise Google Places lookup',
        'Full custom email & WhatsApp kits',
        'Priority customer support'
      ],
      notIncluded: [],
      icon: Building2,
      color: 'purple',
      btnText: 'Upgrade to Agency',
      accent: 'border-purple-500 ring-2 ring-purple-500/10 dark:ring-purple-400/10'
    }
  ];

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
  };

  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutTier) return;
    
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Starter: $9.00 -> ₹750 (75000 paise)
      // Agency: $49.00 -> ₹4100 (410000 paise)
      const amountInPaise = checkoutTier === 'Starter' ? 75000 : 410000;
      const currency = 'INR';

      // 1. Create order on server-side
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt: `receipt_${checkoutTier.toLowerCase()}_${Date.now()}`
        }),
      });

      if (!orderResponse.ok) {
        const errData = await orderResponse.json();
        throw new Error(errData.error || 'Failed to create payment order');
      }

      const orderData = await orderResponse.json();
      if (!orderData.success || !orderData.order_id) {
        throw new Error('Invalid response from payment order creator');
      }

      const keyId = (import.meta as any).env.VITE_RAZORPAY_KEY_ID || 'rzp_test_T6BQv8610PFQxC';

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
            
            // 3. Verify Payment Signature on server-side
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (verifyResponse.ok && verifyData.success) {
              const updated = await databaseService.updateSubscription(checkoutTier);
              onSubscriptionUpdate(updated);
              setPaymentSuccess(true);
              setTimeout(() => {
                setPaymentSuccess(false);
                setCheckoutTier(null);
              }, 2500);
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
        console.error('Payment failed event:', response.error);
        setPaymentError(`Payment Failed: ${response.error.description}`);
        setIsProcessing(false);
      });

      rzp.open();
    } catch (err: any) {
      console.error('Razorpay initialization failed:', err);
      setPaymentError(err.message || 'Failed to initialize payment.');
      setIsProcessing(false);
    }
  };

  return (
    <div id="pricing-section" className="w-full max-w-7xl mx-auto py-14 px-6 border-t border-slate-100 dark:border-slate-850 mt-16 font-sans">
      <div className="text-center mb-12 max-w-2xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 tracking-wider inline-block border border-indigo-150/20 dark:border-indigo-900/10">
          Flexible Pricing Models
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
          Accelerate Your Sales Pipeline
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Choose the membership level built to match your client acquisition goals. Pay zero onboarding fee, scale or cancel any time with instant Stripe billing.
        </p>
      </div>

      {/* Plans Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
        {plans.map((p) => {
          const isCurrent = subscription.tier === p.tier;
          const PlanIcon = p.icon;

          return (
            <div 
              key={p.tier}
              className={`p-6 sm:p-8 rounded-2xl border bg-white dark:bg-slate-950/40 relative flex flex-col justify-between h-full transition-all shadow-xs ${p.accent} ${isCurrent ? 'ring-4 ring-indigo-500/15 dark:ring-indigo-400/15' : ''}`}
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
              {paymentSuccess ? (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-3.5 animate-in fade-in duration-300">
                  <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-900 animate-bounce">
                    <Check className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-950 dark:text-slate-50">Subscription Approved!</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs font-semibold">
                      Your LocalShop profile has been successfully upgraded to **{checkoutTier}**. Your quota is updated!
                    </p>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
