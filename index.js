const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

// ==================== CONFIG ====================
const WHATSAPP_TOKEN = 'EAAS9d7VgIfcBSjNTtsHwo50ZCdqMEVrvaa3POcMP7iR6pLZBfcOLeFQjNbqPlZCogJY9YJrtsVeSLH3KnkVbxoSgrPsx4X1ZAdAKorl50J80SMbFGZBY8R4wf8qVRxtJmpzZBnTQdmvUWayat4ArRioAuYqL5aUBwLlPrHoQnftTvpqvd1hpdqhJZA4Obu4rmLooAZDZD';
const PHONE_NUMBER_ID = '1243069342230923';
const VERIFY_TOKEN = 'luxclean_verify_2026';

// ==================== CORS ====================
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

// ==================== SEND FUNCTION ====================
async function sendWhatsApp(phone, code) {
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '967' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('967')) {
        formattedPhone = '967' + formattedPhone;
    }

    const message = `🔐 *لوكس كلين*\n\nكود التحقق الخاص بك:\n\n*${code}*\n\n⏰ صالح لمدة 5 دقائق\n🔒 لا تشاركه مع أحد`;

    const response = await fetch(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: formattedPhone,
                type: 'text',
                text: { body: message }
            })
        }
    );

    const data = await response.json();
    
    if (!response.ok) {
        return {
            success: false,
            error: data.error?.message || 'Failed',
            fullError: data.error,
            formattedPhone: formattedPhone
        };
    }

    return {
        success: true,
        messageId: data.messages?.[0]?.id,
        formattedPhone: formattedPhone
    };
}

// ==================== HOME ====================
app.get('/', (req, res) => {
    res.json({
        status: 'LuxClean WhatsApp Worker is running ✅',
        time: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ==================== TEST ENDPOINT (GET) ====================
app.get('/test', async (req, res) => {
    const phone = req.query.phone;
    const code = req.query.code || '1234';
    
    if (!phone) {
        return res.json({ 
            error: 'أضف رقم هاتف: ?phone=773643236&code=1234' 
        });
    }
    
    try {
        const result = await sendWhatsApp(phone, code);
        res.json(result);
    } catch (error) {
        res.json({ 
            success: false, 
            error: error.message,
            stack: error.stack
        });
    }
});

// ==================== WEBHOOK ====================
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

app.post('/webhook', (req, res) => {
    console.log('📩 Webhook:', JSON.stringify(req.body));
    res.status(200).send('EVENT_RECEIVED');
});

// ==================== SEND OTP (POST) ====================
app.post('/', async (req, res) => {
    try {
        const { phone, code } = req.body;
        
        if (!phone || !code) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone and code required' 
            });
        }
        
        const result = await sendWhatsApp(phone, code);
        
        if (result.success) {
            console.log('✅ Sent:', result.formattedPhone);
            return res.status(200).json(result);
        } else {
            console.error('❌ Failed:', result.error);
            return res.status(500).json(result);
        }
        
    } catch (error) {
        console.error('❌ Server Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ==================== START ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ LuxClean WhatsApp Worker on port ${PORT}`);
});    }
});

// ==================== RECEIVE WEBHOOK EVENTS ====================
app.post('/webhook', async (req, res) => {
    try {
        const body = req.body;
        console.log('📩 Webhook received:', JSON.stringify(body));
        
        // Handle incoming messages, status updates, etc.
        if (body.object === 'whatsapp_business_account') {
            // Process events here if needed
        }
        
        res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
        console.error('Webhook Error:', error);
        res.sendStatus(500);
    }
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ LuxClean WhatsApp Worker running on port ${PORT}`);
    console.log(`📱 Phone Number ID: ${PHONE_NUMBER_ID}`);
});
