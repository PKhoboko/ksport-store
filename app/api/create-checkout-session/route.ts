// app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
    try {
        const { items } = await req.json();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map((item: any) => ({
                price_data: {
                    currency: 'zar',
                    product_data: { name: item.name },
                    unit_amount: item.price * 100,
                },
                quantity: 1,
            })),
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/cart`,
        });

        // RETURN THE URL INSTEAD OF JUST THE ID
        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}