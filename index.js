const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

// ⚠️ التوكن الجديد
const WHATSAPP_TOKEN = 'EAAS9d7VgIfcBSpgsEScIGrBXBj0hD9Mokf1QIkeG0sbULVODLBsR8mvZAMoUqjcbx3pXtHIjTPXBoQwtnrfwIFHKUR65Qtcki9NNH4wathZAZBLijCYmP1w9jVVwuUa0jG6GiB3w3J4ph2ZAtjhLcqvfR00mB2gkS9NavI8FiQrvJZCriutpxdhVZAPTznaMXMDIxsSFOayVZAws4PMZCg2qHZA7RmzGZCGjSJMaoJpDTx6T3ZAFFpAiIoLlDxmZBWJLWdKrISjRGAhLG7uUsK3ZB1Uc0e0fZClm0ZD';
const PHONE_NUMBER_ID = '1243069342230923';

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

// الصفحة الرئيسية (اختبار)
app.get('/', (req, res) => {
    res.json({
        status: 'LuxClean WhatsApp Worker is running ✅',
        time: new Date().toISOString()
    });
});

// إرسال كود التحقق
app.post('/', async (req, res) => {
    try {
        const { phone, code } = req.body;
        
        if (!phone || !code) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone and code required' 
            });
        }

        // تنسيق الرقم
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '967' + formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith('967')) {
            formattedPhone = '967' + formattedPhone;
        }

        // نص الرسالة
        const message = `🔐 *لوكس كلين*\n\nكود التحقق الخاص بك:\n\n*${code}*\n\n⏰ صالح لمدة 5 دقائق\n🔒 لا تشاركه مع أحد`;

        // إرسال عبر WhatsApp Cloud API
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
            console.error('WhatsApp API Error:', data);
            return res.status(500).json({ 
                success: false, 
                error: data.error?.message || 'Failed to send' 
            });
        }

        return res.status(200).json({ 
            success: true, 
            messageId: data.messages?.[0]?.id 
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('✅ Running on port ' + PORT));
