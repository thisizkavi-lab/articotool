
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
    console.log('Testing connection to:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Key prefix:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5));

    try {
        // Just try to get the session, no network call needed for initial client check, 
        // but we want to fail if key is malformed.
        // Actually, createClient doesn't throw on invalid key immediately, it throws on request.
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Connection failed:', error.message);
            process.exit(1);
        } else {
            console.log('Connection successful!');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

testConnection();
