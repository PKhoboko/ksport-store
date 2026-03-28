export default function ReturnsPage() {
    return (
        <>
            <h1 className="text-4xl font-black italic tracking-tighter mb-8 uppercase">Return Policy</h1>
            <section className="space-y-6 text-zinc-600 text-sm leading-relaxed">
                <h2 className="text-black font-black uppercase tracking-widest text-xs">Returns & Exchanges</h2>
                <p>You have 14 days from the date of delivery to return your unworn shoes for an exchange or refund.</p>

                <h2 className="text-black font-black uppercase tracking-widest text-xs mt-8">Conditions</h2>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Shoes must be in original, unworn condition.</li>
                    <li>Items must include original packaging.</li>
                    <li>Sale items are eligible for exchange only.</li>
                </ul>

                <h2 className="text-black font-black uppercase tracking-widest text-xs mt-8">Shipping</h2>
                <p>For size exchanges, the customer covers the cost of returning the pair to our Cape Town studio. We will ship the new size back to you free of charge (limited to one exchange per order).</p>
            </section>
        </>
    );
}