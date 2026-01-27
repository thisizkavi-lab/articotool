
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Note: Creating buckets usually requires Service Role key if RLS is strict, but let's try with Anon or ask user for Service Role if needed. 
// Actually, creating buckets via client usually fails with Anon key unless policies allow it. 
// BUT, the SQL I gave assumed they ran it in Dashboard SQL Editor which bypasses this.
// If I can't create it here, I must ask user to run SQL or create bucket in Dashboard.

// Let's try.
if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase keys in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBucket() {
    console.log('Checking storage buckets...');

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('Error listing buckets:', listError);
        // If we can't list, we probably can't create.
        return;
    }

    const bucket = buckets.find(b => b.name === 'recordings');
    if (bucket) {
        console.log('✅ Bucket "recordings" already exists.');
    } else {
        console.log('Bucket "recordings" not found. Attempting to create...');
        const { data, error } = await supabase.storage.createBucket('recordings', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['audio/webm', 'video/webm', 'audio/wav', 'audio/mp3']
        });

        if (error) {
            console.error('❌ Failed to create bucket:', error);
            console.log('NOTE: You may need to create the "recordings" bucket manually in the Supabase Dashboard if "anon" key permissions are restricted.');
        } else {
            console.log('✅ Bucket "recordings" created successfully.');
        }
    }
}

setupBucket();
