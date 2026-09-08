const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Manuel Yük Gönderme ve Test Paneli Endpoint'i
app.post('/api/manual-post', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await axios.post('http://localhost:3000/api/incoming-post', {
      rawText: message,
      source: 'whatsapp',
      senderPhone: '05074440455'
    });
    res.json({ success: true, result: response.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("✅ Yük Entegrasyon Servisi 3001 portunda hazır!"));