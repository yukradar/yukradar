const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const SUPABASE_URL = "https://inqemiglfelvepxgjlod.supabase.co";
const SUPABASE_SERVICE_KEY = "sb_publishable_cqK2O5-DBEPzhqOmC4yFVg_WIQDBGys";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Gemini API Anahtarı
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "BURAYA_API_KEY_YAZIN";

app.post('/api/incoming-post', async (req, res) => {
  try {
    const { rawText, source, senderPhone } = req.body;

    if (!rawText || rawText.length < 5) {
      return res.status(400).json({ error: 'Geçersiz mesaj' });
    }

    console.log("Yeni mesaj işleniyor:", rawText);

    const prompt = `
    Aşağıdaki nakliye/yük ilan metnini analiz et. Yanıtı SADECE geçerli bir JSON formatında ver, başka hiçbir açıklama yazma.
    JSON Şeması:
    {
      "origin": "Çıkış şehri (Örn: Konya)",
      "destination": "Varış şehri (Örn: İstanbul)",
      "vehicle_type": "13.60 Tır, Kısa Dorse, Kamyon veya Ufak Araç",
      "tonnage": "Miktar veya ağırlık varsa yaz, yoksa null",
      "loading_date": "YYYY-MM-DD formatında tarih veya null",
      "price": "Fiyat veya ücret varsa sadece rakam/metin, yoksa null",
      "phone": "Metin içindeki telefon numarası"
    }

    Metin: "${rawText}"
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const aiResult = await response.json();
    
    if (!aiResult.candidates || !aiResult.candidates[0]) {
      throw new Error("Gemini API yanıt vermedi: " + JSON.stringify(aiResult));
    }

    const responseText = aiResult.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(422).json({ error: 'AI veriyi ayrıştıramadı' });
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    const loadRecord = {
      origin: parsedData.origin || 'Belirtilmedi',
      destination: parsedData.destination || 'Belirtilmedi',
      vehicle_type: parsedData.vehicle_type || '13.60 Tır',
      tonnage: parsedData.tonnage || null,
      loading_date: parsedData.loading_date || null,
      price: parsedData.price || null,
      phone: parsedData.phone || senderPhone || null,
      description: rawText,
      source: source || 'whatsapp'
    };

    const { data, error } = await supabase.from('yukler').insert([loadRecord]);

    if (error) throw error;

    console.log("✅ Yük başarıyla YükRadar'a eklendi:", parsedData.origin, "->", parsedData.destination);
    return res.status(200).json({ success: true, data: loadRecord });

  } catch (err) {
    console.error("İşlem Hatası:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 YükRadar Sunucusu ${PORT} portunda çalışıyor.`));
