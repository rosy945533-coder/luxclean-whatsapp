const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

app.get('/', (req, res) => {
    res.json({
        status: 'LuxClean WhatsApp Worker is running ✅',
        time: new Date().toISOString()
    });
});

app.post('/', async (req, res) => {
    try {
        const { phone, code } = req.body;
        if (!phone || !code) {
            return res.status(400).json({ success: false, error: 'Phone and code required' });
        }

        const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
        const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

        if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
            return res.status(500).json({ success: false, error: 'Server configuration error' });
        }

        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '967' + formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith('967')) {
            formattedPhone = '967' + formattedPhone;
        }

        const message = `🔐 *لوكس كلين*\n\nكود التحقق:\n\n*${code}*\n\n⏰ صالح 5 دقائق`;

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
            return res.status(500).json({ success: false, error: data.error?.message || 'Failed' });
        }

        return res.status(200).json({ success: true, messageId: data.messages?.[0]?.id });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('✅ Running on port ' + PORT));
