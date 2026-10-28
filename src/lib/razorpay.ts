import Razorpay from 'razorpay';

export function getRazorpayClient(): Razorpay {
  const rawKeys = [process.env.RAZORPAY_KEY_ID, process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID];
  const key_id = rawKeys.find(k => k && k !== 'rzp_test_placeholder' && !k.includes('YOUR_KEY_ID'));
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      'Razorpay credentials missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment.'
    );
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

