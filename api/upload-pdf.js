import formidable from 'formidable';
import { put } from '@vercel/blob';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const file = await parseSingleFile(req);
    const arrayBuffer = await fsReadFile(file.filepath);
    const contentType = file.mimetype || 'application/pdf';
    const fileName = `${Date.now()}_${file.originalFilename || 'file.pdf'}`;
    const { url } = await put(`uploads/pdf/${fileName}`, arrayBuffer, { access: 'public', contentType });
    return res.status(200).json({ success: true, provider: 'vercel-blob', url, fileName });
  } catch (error) {
    console.error('upload-pdf error', error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}

function parseSingleFile(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      const f = files.file || files.pdf || Object.values(files)[0];
      if (!f) return reject(new Error('No file provided'));
      resolve(f);
    });
  });
}

function fsReadFile(path) {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    fs.readFile(path, (err, data) => (err ? reject(err) : resolve(data)));
  });
}

