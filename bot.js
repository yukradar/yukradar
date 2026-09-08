const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});

// Terminalde QR Kod Gösterimi
client.on('qr', (qr) => {
  console.log('\n📱 Lütfen WhatsApp uygulamanızdan bu QR kodu okutun:\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp Botu Başarıyla Bağlandı! Gruplar dinleniyor...');
});

// Gruplara Gelen Mesajları Dinleme
client.on('message', async (msg) => {
  const text = msg.body ? msg.body.toLowerCase() : '';

  // Sadece gruplardan gelen ve nakliye ile ilgili anahtar kelime içeren mesajları yakala
  const isGroup = msg.from.endsWith('@g.us');
  const isLoadPost = text.includes('lazım') || text.includes('yük') || text.includes('tır') || text.includes('kamyon') || text.includes('aranıyor');

  if (isGroup && isLoadPost) {
    console.log("📩 Gruptan Yeni Yük İlanı Yakalandı!");

    try {
      await axios.post('http://localhost:3000/api/incoming-post', {
        rawText: msg.body,
        source: 'whatsapp',
        senderPhone: msg.author ? msg.author.split('@')[0] : null
      });
    } catch (err) {
      console.error("Sunucuya gönderme hatası:", err.message);
    }
  }
});

client.initialize();