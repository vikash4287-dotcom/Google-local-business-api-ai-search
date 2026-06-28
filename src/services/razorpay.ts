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

export const razorpayService = {
  /**
   * Creates a Razorpay order via the Express backend API.
   * @param amount The order amount in smallest currency sub-unit (e.g. paise for INR, cents for USD)
   * @param currency The target currency (e.g. 'INR' or 'USD')
   * @param receipt An optional custom receipt ID
   */
  async createOrder(
    amount: number,
    currency: 'INR' | 'USD',
    receipt: string
  ): Promise<RazorpayOrderResponse> {
    try {
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
      console.error('Error in razorpayService.createOrder:', error);
      throw error;
    }
  },

  /**
   * Verifies the Razorpay payment signature and updates the subscription on the backend.
   * @param orderId Razorpay order ID
   * @param paymentId Razorpay payment ID
   * @param signature Razorpay payment signature
   * @param tier Subscription tier being upgraded to
   */
  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    tier: SubscriptionTier
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
          tier,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify Razorpay signature');
      }

      return data as RazorpayVerificationResponse;
    } catch (error: any) {
      console.error('Error in razorpayService.verifyPayment:', error);
      throw error;
    }
  },
};
