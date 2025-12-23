// netlify/functions/api.js
import serverless from 'serverless-http';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

// 1. Initialize External Connections
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Initialize Sui Client
const suiClient = new SuiClient({ url: getFullnodeUrl('mainnet') });

/**
 * Helper function to retrieve the actual NFT Collection Name from the Sui blockchain
 */
async function fetchPackageNameFromSui(packageId) {
    try {
        const objectResponse = await suiClient.getObject({
            id: packageId,
            options: { showDisplay: true } 
        });
        
        const name = objectResponse.data?.display?.data?.name;
        
        if (name) {
            return name.replace(/[{}]/g, ''); 
        }
        return `Package ID: ${packageId.substring(2, 8)}...`;
        
    } catch (error) {
        console.warn(`Sui RPC failed to fetch name for ${packageId}:`, error.message);
        return `Error fetching name`;
    }
}

// 3. Setup the Express Server
const app = express();
app.use(cors()); 
app.use(express.json());

// 4. Test Route
app.get('/', (req, res) => {
    res.json({ message: 'Sui-Wallet-App Backend is running and secure.' });
});

// 5. Decision Logic
const determineStatus = (scamScore) => {
    if (scamScore < -50) {
        return { status: 'SCAM_VERIFIED', confidence: 95 };
    } else if (scamScore < -5) {
        return { status: 'DUBIOUS', confidence: 50 };
    } else if (scamScore > 50) {
        return { status: 'LEGIT_VERIFIED', confidence: 95 };
    } else {
        return { status: 'UNKNOWN', confidence: 10 };
    }
};

// 6. API Endpoints

// Check Reputation
app.post('/check-reputation', async (req, res) => {
    const { packageId } = req.body;
    if (!packageId) return res.status(400).json({ error: 'Missing packageId' });

    try {
        const { data, error } = await supabase
            .from('packages')
            .select('scam_score, is_verified, name')
            .eq('package_id', packageId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
            if (data.is_verified) {
                return res.json({ status: 'LEGIT_OFFICIAL', confidence: 100, packageId, name: data.name });
            }
            const reputation = determineStatus(data.scam_score);
            return res.json({ ...reputation, packageId, name: data.name });
        } else {
            return res.json({ status: 'UNKNOWN', confidence: 0, packageId, name: 'Unrecorded Package' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Submit Votes
app.post('/votes', async (req, res) => {
    const { packageId, userAddress, voteType } = req.body; 

    if (!packageId || !userAddress || !['scam', 'legit'].includes(voteType)) {
        return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    try {
        const packageName = await fetchPackageNameFromSui(packageId);

        await supabase.from('packages').upsert({ package_id: packageId, name: packageName }, { onConflict: 'package_id' });

        const { error: voteError } = await supabase
            .from('votes')
            .insert([{ package_id: packageId, user_address: userAddress, vote_type: voteType }]);

        if (voteError) {
            if (voteError.code === '23505') return res.status(409).json({ message: 'User already voted.' });
            throw voteError;
        }

        res.json({ success: true, message: `Vote recorded for: ${packageName}` });
    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Admin Verify
app.post('/verify', async (req, res) => {
    const { packageId, source } = req.body;
    if (!packageId || !source) return res.status(400).json({ error: 'Missing fields' });

    try {
        const packageName = await fetchPackageNameFromSui(packageId);
        await supabase.from('trusted_list').upsert({ package_id: packageId, name: packageName, source }, { onConflict: 'package_id' });
        await supabase.from('packages').upsert({ package_id: packageId, is_verified: true, name: packageName }, { onConflict: 'package_id' });

        res.json({ success: true, message: `Package ${packageName} verified by ${source}.` });
    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 7. Netlify Export (ESM Style)
export const handler = serverless(app);
