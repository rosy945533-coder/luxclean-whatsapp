// ==================== LUXCLEAN WHATSAPP API ====================
const TOKEN = 'EAAS9d7VgIfcBSlL4MhCoaoV3Qvs2voAmk48POmy1LPOQvE3m7RbOlNQcIX4Y8AloCywWiXY5GOr1zB99vUNUKVtR5gZAFDJ4lAoxM5aYQdj8VTHmQmODtgupUOBnTbZCyZCA0qQnujPk6SQfUpDL71KMcpYZB0T7Uc0jg44Oe74y3Xq5XZAuwCgWPZAziHekMekgZDZD';
const PHONE_ID = '1243069342230923';

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    let phone = '';
    let code = '';
    
    // GET (اختبار من المتصفح)
    if (req.method === 'GET') {
        const url = new URL(req.url, 'http://x');
        phone = url.searchParams.get('phone') || '';
        code = url.searchParams.get('code') || '1234';
        
        if (!phone) {
            return res.json({
                status: 'LuxClean WhatsApp API ✅',
                usage: 'أضف: /api?phone=780008063&code=1234',
                version: '2.0'
            });
        }
    }
    // POST (من التطبيق)
    else if (req.method === 'POST') {
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch(e) { body = {}; }
        }
        body = body || {};
        phone = body.phone || '';
        code = body.code || '';
    }
    
    // فحص البيانات
    if (!phone || !code) {
        return res.status(400).json({
            success: false,
            error: 'Phone and code required'
        });
    }
    
    // تنسيق الرقم
    let formatted = phone.toString().replace(/\D/g, '');
    if (formatted.startsWith('0')) {
        formatted = '967' + formatted.substring(1);
    } else if (!formatted.startsWith('967')) {
        formatted = '967' + formatted;
    }
    
    // نص الرسالة
    const message = `🔐 *لوكس كلين*\n\nكود التحقق الخاص بك:\n\n*${code}*\n\n⏰ صالح لمدة 5 دقائق\n🔒 لا تشاركه مع أحد`;
    
    try {
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: formatted,
                    type: 'text',
                    text: { body: message }
                })
            }
        );
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.json({
                success: false,
                error: data.error ? data.error.message : 'Failed to send',
                phone: formatted
            });
        }
        
        return res.json({
            success: true,
            messageId: data.messages ? data.messages[0].id : 'sent',
            phone: formatted
        });
        
    } catch (error) {
        return res.json({
            success: false,
            error: error.message
        });
    }
};
