import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// 1. Force dynamic behavior to prevent build-time errors
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.PAYSTACK_SECRET_KEY!);

export async function POST(req: Request) {
    try {
        const { items } = await req.json();

        // 2. Validate that items exist
        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items provided' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map((item: any) => ({
                price_data: {
                    currency: 'zar',
                    product_data: {
                        name: item.name,
                        images: item.image ? [item.image] : [], // Pass your shoe image here!
                    },
                    // 3. Rounding to prevent floating point errors
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity || 1,
            })),
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}/cart`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}