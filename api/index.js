// لا نحتاج أي مكتبات — Node 18+ فيه fetch مدمج
const WHATSAPP_TOKEN = 'EAAS9d7VgIfcBSjNTtsHwo50ZCdqMEVrvaa3POcMP7iR6pLZBfcOLeFQjNbqPlZCogJY9YJrtsVeSLH3KnkVbxoSgrPsx4X1ZAdAKorl50J80SMbFGZBY8R4wf8qVRxtJmpzZBnTQdmvUWayat4ArRioAuYqL5aUBwLlPrHoQnftTvpqvd1hpdqhJZA4Obu4rmLooAZDZD';
const PHONE_NUMBER_ID = '1243069342230923';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    let phone, code;
    
    if (req.method === 'GET') {
        const url = new URL(req.url, 'http://x');
        phone = url.searchParams.get('phone');
        code = url.searchParams.get('code') || '1234';
        
        if (!phone) {
            return res.json({
                status: 'LuxClean WhatsApp Worker ✅',
                usage: 'أضف: ?phone=771177843&code=1234'
            });
        }
    } else if (req.method === 'POST') {
        const body = req.body || {};
        phone = body.phone;
        code = body.code;
    }
    
    if (!phone || !code) {
        return res.status(400).json({ success: false, error: 'phone & code required' });
    }
    
    let p = phone.toString().replace(/\D/g, '');
    if (p.startsWith('0')) p = '967' + p.slice(1);
    else if (!p.startsWith('967')) p = '967' + p;
    
    const text = `🔐 *لوكس كلين*\n\nكود التحقق:\n\n*${code}*\n\n⏰ صالح 5 دقائق`;
    
    try {
        const r = await fetch(
            `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: p,
                    type: 'text',
                    text: { body: text }
                })
            }
        );
        
        const data = await r.json();
        
        if (!r.ok) {
            return res.json({ success: false, error: data.error?.message, details: data.error });
        }
        
        return res.json({ success: true, messageId: data.messages?.[0]?.id });
        
    } catch (e) {
        return res.json({ success: false, error: e.message });
    }
};            details: data.error,
            formattedPhone: formattedPhone
        };
    }
    
    return {
        success: true,
        messageId: data.messages?.[0]?.id,
        formattedPhone: formattedPhone
    };
}
