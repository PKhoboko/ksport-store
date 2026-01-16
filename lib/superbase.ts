import { createClient } from '@supabase/supabase-js';
// Placeholder for when you are ready to connect the database
export const supabase = {
    auth: {
        signInWithOAuth: () => console.log("Auth disabled: Database not connected"),
        signOut: () => console.log("Auth disabled"),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: async () => ({ data: { session: null }, error: null }),
    },
    from: () => ({
        select: () => ({
            gt: () => Promise.resolve({ data: [], error: null }),
            order: () => Promise.resolve({ data: [], error: null }),
        }),
    }),
    storage: {
        from: () => ({
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
            upload: async () => ({ data: null, error: new Error("Database not connected") }),
        }),
    }
} as any;
//const supabaseUrl = 'process.env.NEXT_PUBLIC_SUPABASE_URL';
// supabaseKey = 'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY';

//if (!supabaseUrl || !supabaseKey) {
  //  throw new Error(
   //     'Missing Supabase environment variables. Check your .env.local file.'
   // );
//}

//export const supabase = createClient(supabaseUrl, supabaseKey);