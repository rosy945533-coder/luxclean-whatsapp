const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

// CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || 'ضع_التوكن_هنا_كقيمة_افتراضية';
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '1243069342230923';

app.post('/', async (req, res) => {
    try {
        const { phone, code } = req.body;

        if (!phone || !code) {
            return res.status(400).json({ success: false, error: 'Phone and code required' });
        }

        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '967' + formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith('967')) {
            formattedPhone = '967' + formattedPhone;
        }

        const message = `🔐 *لوكس كلين*\n\nكود التحقق الخاص بك:\n\n*${code}*\n\n⏰ صالح لمدة 5 دقائق\n🔒 لا تشاركه مع أحد`;

        const response = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
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
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(500).json({ success: false, error: data.error?.message || 'Failed to send' });
        }

        return res.status(200).json({ success: true, messageId: data.messages?.[0]?.id });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ LuxClean WhatsApp server is running on port ${PORT}`);
});