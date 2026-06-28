import { auth } from './firebase';
import { SubscriptionTier, UserSubscription } from '../types';

export interface RazorpayOrderResponse {
  success: boolean;
  order_id: string;
  amount: number;
  currency: string;
  receipt: string;
  error?: string;
}

export interface RazorpayVerificationResponse {
  success: boolean;
  message: string;
  subscription?: UserSubscription;
  error?: string;
}

/**
 * Creates a Razorpay order via the Express backend API.
 * @param amount The order amount in smallest currency sub-unit (e.g., paise for INR, cents for USD)
 * @param currency The target currency (e.g. 'INR' or 'USD')
 */
export async function createRazorpayOrder(
  amount: number,
  currency: 'INR' | 'USD'
): Promise<RazorpayOrderResponse> {
  try {
    const receipt = `receipt_order_${Date.now()}`;
    const url = `/api/create-order?amount=${amount}&currency=${currency}&receipt=${encodeURIComponent(receipt)}`;
    const response = await fetch(url, {
      method: 'GET',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create Razorpay order');
    }

    return data as RazorpayOrderResponse;
  } catch (error: any) {
    console.error('Error in createRazorpayOrder:', error);
    throw error;
  }
}

/**
 * Verifies the Razorpay payment signature via the Express backend API.
 * @param orderId Razorpay order ID
 * @param paymentId Razorpay payment ID
 * @param signature Razorpay signature
 */
export async function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<RazorpayVerificationResponse> {
  try {
    const userId = auth.currentUser?.uid || 'usr_default_vikash';
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        userId,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify payment signature');
    }

    return data as RazorpayVerificationResponse;
  } catch (error: any) {
    console.error('Error in verifyPaymentSignature:', error);
    throw error;
  }
}

/**
 * Updates the user subscription tier in Firestore through the backend verification route.
 * @param userId The unique user ID
 * @param newTier The target SubscriptionTier
 */
export async function updateUserSubscription(
  userId: string,
  newTier: SubscriptionTier
): Promise<RazorpayVerificationResponse> {
  try {
    // We send an direct request to verify-payment with dummy/empty signatures but target tier to force/trigger state sync
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: 'bypass_direct_update',
        razorpay_payment_id: 'bypass_direct_update',
        razorpay_signature: 'bypass_direct_update',
        userId,
        tier: newTier,
      }),
    });

    const data = await response.json();
    return data as RazorpayVerificationResponse;
  } catch (error: any) {
    console.error('Error in updateUserSubscription:', error);
    throw error;
  }
}
