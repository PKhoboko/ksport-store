import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";

const BUCKET = "shoe-images";

function adminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

function unauthorised() {
    return NextResponse.json({ error: "Your admin session has expired. Please sign in again." }, { status: 401 });
}

function numberField(value: FormDataEntryValue | null, fallback = 0) {
    const valueAsNumber = Number(value);
    return Number.isFinite(valueAsNumber) ? valueAsNumber : fallback;
}

function slugify(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "zikiano-product";
}

function storagePathFromPublicUrl(url: string) {
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const index = url.indexOf(marker);
    return index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : null;
}

export async function GET(request: NextRequest) {
    if (!hasAdminSession(request)) return unauthorised();

    const { data, error } = await adminClient()
        .from("shoes")
        .select("id, name, brand, price, original_price, stock, description, category, color_label, size, image_url, created_at")
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ products: data ?? [] });
}

export async function POST(request: NextRequest) {
    if (!hasAdminSession(request)) return unauthorised();

    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const price = numberField(form.get("price"));
    const originalPrice = numberField(form.get("original_price"));
    const stock = Math.max(0, Math.floor(numberField(form.get("stock"))));
    const files = form.getAll("images").filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (!name || price <= 0 || files.length === 0) {
        return NextResponse.json({ error: "Add a product name, a valid price, and at least one image." }, { status: 400 });
    }
    if (originalPrice > 0 && originalPrice <= price) {
        return NextResponse.json({ error: "The original price must be higher than the sale price." }, { status: 400 });
    }
    if (files.some((file) => !file.type.startsWith("image/"))) {
        return NextResponse.json({ error: "Only image files can be uploaded." }, { status: 400 });
    }

    const brand = String(form.get("brand") ?? "ZIKIANO").trim() || "ZIKIANO";
    const description = String(form.get("description") ?? "").trim();
    const category = String(form.get("category") ?? "Footwear").trim() || "Footwear";
    const colour = String(form.get("color_label") ?? "Default").trim() || "Default";
    const size = String(form.get("size") ?? "").trim() || null;
    const variantSlug = `${slugify(name)}-${slugify(colour)}`;
    const client = adminClient();
    const uploadedPaths: string[] = [];

    try {
        const rows = [];
        for (const file of files) {
            const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
            const path = `${variantSlug}/${crypto.randomUUID()}.${extension}`;
            const { error: uploadError } = await client.storage.from(BUCKET).upload(path, file, {
                contentType: file.type,
                upsert: false,
            });
            if (uploadError) throw new Error(uploadError.message);
            uploadedPaths.push(path);

            const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(path);
            rows.push({
                name,
                brand,
                price,
                original_price: originalPrice || null,
                stock,
                description,
                category,
                color_label: colour,
                size,
                variant_slug: variantSlug,
                view_type: "PRODUCT IMAGE",
                image_url: urlData.publicUrl,
            });
        }

        const { error: insertError } = await client.from("shoes").insert(rows);
        if (insertError) throw new Error(insertError.message);
        return NextResponse.json({ ok: true });
    } catch (error) {
        if (uploadedPaths.length) await client.storage.from(BUCKET).remove(uploadedPaths);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save this product." }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    if (!hasAdminSession(request)) return unauthorised();
    const body = await request.json().catch(() => ({}));
    const id = body.id;
    const price = Number(body.price);
    const originalPrice = body.original_price === "" || body.original_price == null ? null : Number(body.original_price);
    const stock = Math.max(0, Math.floor(Number(body.stock)));

    if (!id || !Number.isFinite(price) || price <= 0 || !Number.isFinite(stock)) {
        return NextResponse.json({ error: "Enter a valid price and stock quantity." }, { status: 400 });
    }
    if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice <= price)) {
        return NextResponse.json({ error: "The original price must be higher than the sale price." }, { status: 400 });
    }

    const client = adminClient();
    const { data: item, error: lookupError } = await client
        .from("shoes")
        .select("variant_slug")
        .eq("id", id)
        .single();
    if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 });

    const { error } = await client.from("shoes").update({
        price,
        original_price: originalPrice,
        stock,
    }).eq(item.variant_slug ? "variant_slug" : "id", item.variant_slug || id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
    if (!hasAdminSession(request)) return unauthorised();
    const body = await request.json().catch(() => ({}));
    if (!body.id) return NextResponse.json({ error: "Missing image id." }, { status: 400 });

    const client = adminClient();
    const { data: item, error: lookupError } = await client.from("shoes").select("image_url").eq("id", body.id).single();
    if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 });

    const { error: deleteError } = await client.from("shoes").delete().eq("id", body.id);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    const path = item?.image_url ? storagePathFromPublicUrl(item.image_url) : null;
    if (path) await client.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ ok: true });
}
