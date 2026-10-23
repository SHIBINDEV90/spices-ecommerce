import { redirect } from 'next/navigation';

export default function AccountOrderTrackPage({
  params,
}: {
  params: { orderId: string };
}) {
  const orderId = params.orderId || '';
  redirect(`/track-order?orderId=${encodeURIComponent(orderId)}`);
}
