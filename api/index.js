module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({
        status: 'API is working ✅',
        method: req.method,
        url: req.url,
        time: new Date().toISOString()
    });
};
