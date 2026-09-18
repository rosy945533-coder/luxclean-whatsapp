// ==================== LUXCLEAN WHATSAPP API ====================
const fetch = require('node-fetch');

const WHATSAPP_TOKEN = 'EAAS9d7VgIfcBSjNTtsHwo50ZCdqMEVrvaa3POcMP7iR6pLZBfcOLeFQjNbqPlZCogJY9YJrtsVeSLH3KnkVbxoSgrPsx4X1ZAdAKorl50J80SMbFGZBY8R4wf8qVRxtJmpzZBnTQdmvUWayat4ArRioAuYqL5aUBwLlPrHoQnftTvpqvd1hpdqhJZA4Obu4rmLooAZDZD';
const PHONE_NUMBER_ID = '1243069342230923';

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // ========== GET ==========
    if (req.method === 'GET') {
        const url = new URL(req.url, 'http://localhost');
        const phone = url.searchParams.get('phone');
        const code = url.searchParams.get('code') || '1234';
        
        if (!phone) {
            return res.status(200).json({
                status: 'LuxClean WhatsApp Worker is running ✅',
                time: new Date().toISOString(),
                usage: 'أضف: ?phone=771177843&code=1234 للاختبار'
            });
        }
        
        // Test send
        try {
            const result = await sendWhatsApp(phone, code);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(200).json({
                success: false,
                error: error.message
            });
        }
    }
    
    // ========== POST ==========
    if (req.method === 'POST') {
        try {
            let body = req.body;
            if (typeof body === 'string') body = JSON.parse(body);
            
            const phone = body.phone;
            const code = body.code;
            
            if (!phone || !code) {
                return res.status(400).json({
                    success: false,
                    error: 'Phone and code required'
                });
            }
            
            const result = await sendWhatsApp(phone, code);
            return res.status(result.success ? 200 : 500).json(result);
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    return res.status(404).json({ error: 'Not found' });
};

// ==================== SEND FUNCTION ====================
async function sendWhatsApp(phone, code) {
    let formattedPhone = phone.toString().replace(/\D/g, '');
    
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
            error: data.error?.message || 'Failed to send',
            details: data.error,
            formattedPhone: formattedPhone
        };
    }
    
    return {
        success: true,
        messageId: data.messages?.[0]?.id,
        formattedPhone: formattedPhone
    };
}
