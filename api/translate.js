export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'API is running', message: 'POST { text, targetLanguage, sourceLanguage }' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, targetLanguage, sourceLanguage = 'de' } = req.body || {};
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

    const deeplApiKey = process.env.DEEPL_API_KEY;
    if (!deeplApiKey) {
      return res.status(503).json({ error: 'DeepL API key not configured on server' });
    }

    const deeplLanguages = { de: 'DE', en: 'EN', fr: 'FR' };
    const form = new URLSearchParams();
    form.set('text', text);
    form.set('source_lang', deeplLanguages[sourceLanguage] || 'DE');
    form.set('target_lang', deeplLanguages[targetLanguage] || 'EN');
    form.set('auth_key', deeplApiKey);

    const resp = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const data = await resp.json();

    if (!resp.ok) {
      return res.status(resp.status).json({ error: 'DeepL error', details: data });
    }

    const translatedText = data?.translations?.[0]?.text;
    if (!translatedText) {
      return res.status(500).json({ error: 'Invalid DeepL response' });
    }

    return res.status(200).json({ translatedText, sourceLanguage, targetLanguage });
  } catch (error) {
    console.error('translate API error', error);
    return res.status(500).json({ error: 'Translation failed', details: error.message });
  }
}

