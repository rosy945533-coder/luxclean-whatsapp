const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        return res.json({ 
            status: 'LuxClean WhatsApp Worker running',
            time: new Date().toISOString()
        });
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { phone, code } = req.body;
        
        if (!phone || !code) {
            return res.status(400).json({ success: false, error: 'Phone and code required' });
        }
        
        const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
        const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
        
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
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};