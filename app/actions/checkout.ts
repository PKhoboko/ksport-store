"use server";
import Stripe from 'stripe';

export async function createStripeSession(cart: any[], email: string) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as any });
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: cart.map(item => ({
            price_data: {
                currency: 'zar',
                product_data: { name: item.name },
                unit_amount: item.price * 100,
            },
            quantity: 1,
        })),
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
        customer_email: email,
    });
    return { url: session.url };
}