import crypto from 'crypto';
import Razorpay from 'razorpay';

export function getRazorpayCredentials() {
  const key_id = (
    process.env.RAZORPAY_KEY_ID || 
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 
    ''
  ).trim().replace(/^["']|["']$/g, '');

  const key_secret = (
    process.env.RAZORPAY_KEY_SECRET || 
    ''
  ).trim().replace(/^["']|["']$/g, '');

  if (!key_id || !key_secret) {
    throw new Error(
      'Razorpay credentials missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment.'
    );
  }

  return { key_id, key_secret };
}

export function getRazorpayClient(): Razorpay {
  const { key_id, key_secret } = getRazorpayCredentials();

  return new Razorpay({
    key_id,
    key_secret,
  });
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const { key_secret } = getRazorpayCredentials();
  const generatedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (generatedSignature.length !== signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature, 'utf-8'),
    Buffer.from(signature, 'utf-8')
  );
}
