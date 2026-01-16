"use server";
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { Shoe } from '@/lib/store';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckout(cart: Shoe[]) {
    const head = await headers();
    const host = head.get('origin');

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: cart.map(item => ({
            price_data: {
                currency: 'zar',
                product_data: { name: item.name, images: [item.image_url] },
                unit_amount: item.price * 100,
            },
            quantity: 1,
        })),
        mode: 'payment',
        success_url: `${host}/success`,
        cancel_url: `${host}/cart`,
    });

    return { url: session.url };
}