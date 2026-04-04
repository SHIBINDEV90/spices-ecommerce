import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind
} from '@react-email/components';
import * as React from 'react';

interface ReceiptEmailProps {
  customerName: string;
  orderTotal: number;
}

export const ReceiptEmail = ({ customerName = 'Customer', orderTotal = 0 }: ReceiptEmailProps) => {
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(orderTotal);

  return (
    <Html>
      <Head />
      <Preview>Your Cinematic Spice Order Receipt</Preview>
      <Tailwind>
        <Body className="bg-zinc-900 text-zinc-100 font-sans">
          <Container className="mx-auto py-10 px-4">
            <Section className="mb-6">
              <Heading className="text-3xl font-bold tracking-tight text-orange-400 text-center">
                MALABAR COAST SPICES
              </Heading>
            </Section>

            <Section className="bg-zinc-800 p-8 rounded-lg shadow-xl shadow-black/50 border border-zinc-700">
              <Heading className="text-2xl font-semibold mb-6">
                Thank you for your order!
              </Heading>
              
              <Text className="text-zinc-300 text-base mb-4">
                Hi {customerName},
              </Text>
              
              <Text className="text-zinc-300 text-base mb-6 leading-relaxed">
                We've successfully processed your payment. Your hand-selected, premium spices are being prepared for dispatch. We will send you another update as soon as they are on their way.
              </Text>

              <Section className="bg-zinc-900 rounded p-6 mb-6">
                <Text className="font-semibold text-zinc-400 uppercase tracking-widest text-xs mb-2">
                  Order Total
                </Text>
                <Text className="text-3xl font-bold text-emerald-400 m-0">
                  {formattedTotal}
                </Text>
              </Section>
              
              <Hr className="border-zinc-700 my-6" />
              
              <Text className="text-zinc-400 text-sm italic">
                Experience the authentic flavors of Kerala.
              </Text>
            </Section>
            
            <Section className="mt-8 text-center text-zinc-500 text-xs">
              <Text>
                Malabar Coast Spices | Worldwide Delivery | Premium Quality
              </Text>
              <Text className="mt-2">
                If you have any questions, reply to this email or contact our support team.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ReceiptEmail;
