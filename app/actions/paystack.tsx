"use server";

export async function verifyAndRecordOrder(reference: string, items: any[], userEmail: string) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${secretKey}` },
    });

    const data = await response.json();

    if (data.status && data.data.status === 'success') {
        // Here you would use your Supabase Server Client to insert the order
        // await supabase.from('orders').insert({ email: userEmail, items, reference });
        return { success: true };
    }
    return { success: false };
}