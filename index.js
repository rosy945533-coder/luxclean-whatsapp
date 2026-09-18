// ==================== LUXCLEAN WHATSAPP WORKER ====================
// Vercel Serverless Function
const fetch = require('node-fetch');

// ==================== CONFIG ====================
const WHATSAPP_TOKEN = 'EAAS9d7VgIfcBSjNTtsHwo50ZCdqMEVrvaa3POcMP7iR6pLZBfcOLeFQjNbqPlZCogJY9YJrtsVeSLH3KnkVbxoSgrPsx4X1ZAdAKorl50J80SMbFGZBY8R4wf8qVRxtJmpzZBnTQdmvUWayat4ArRioAuYqL5aUBwLlPrHoQnftTvpqvd1hpdqhJZA4Obu4rmLooAZDZD';
const PHONE_NUMBER_ID = '1243069342230923';

// ==================== MAIN HANDLER ====================
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // ========== GET / ==========
    if (req.method === 'GET' && req.url === '/') {
        return res.status(200).json({
            status: 'LuxClean WhatsApp Worker is running ✅',
            time: new Date().toISOString(),
            version: '1.0.0'
        });
    }
    
    // ========== GET /test ==========
    if (req.method === 'GET' && req.url.startsWith('/test')) {
        try {
            const url = new URL(req.url, 'http://localhost');
            const phone = url.searchParams.get('phone');
            const code = url.searchParams.get('code') || '1234';
            
            if (!phone) {
                return res.status(200).json({
                    error: 'أضف رقم هاتف: ?phone=771177843&code=1234'
                });
            }
            
            const result = await sendWhatsApp(phone, code);
            return res.status(200).json(result);
            
        } catch (error) {
            return res.status(200).json({
                success: false,
                error: error.message
            });
        }
    }
    
    // ========== POST / ==========
    if (req.method === 'POST') {
        try {
            // Parse body
            let body = req.body;
            if (typeof body === 'string') {
                body = JSON.parse(body);
            }
            
            const phone = body.phone;
            const code = body.code;
            
            if (!phone || !code) {
                return res.status(400).json({
                    success: false,
                    error: 'Phone and code required'
                });
            }
            
            const result = await sendWhatsApp(phone, code);
            
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(500).json(result);
            }
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    // ========== Not found ==========
    return res.status(404).json({
        error: 'Not found',
        method: req.method,
        url: req.url
    });
};

// ==================== SEND WHATSAPP MESSAGE ====================
async function sendWhatsApp(phone, code) {
    // Format phone number
    let formattedPhone = phone.toString().replace(/\D/g, '');
    
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '967' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('967')) {
        formattedPhone = '967' + formattedPhone;
    }
    
    // Message text
    const message = `🔐 *لوكس كلين*\n\nكود التحقق الخاص بك:\n\n*${code}*\n\n⏰ صالح لمدة 5 دقائق\n🔒 لا تشاركه مع أحد`;
    
    // Send via WhatsApp Cloud API
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
            details: data.error || null,
            formattedPhone: formattedPhone
        };
    }
    
    return {
        success: true,
        messageId: data.messages?.[0]?.id,
        formattedPhone: formattedPhone
    };
}
