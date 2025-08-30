import formidable from 'formidable';
import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const file = await new Promise((resolve, reject) => {
      const form = formidable({ multiples: false });
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        const f = files.file || files.image || Object.values(files)[0];
        if (!f) return reject(new Error('No file provided'));
        resolve(f);
      });
    });

    const arrayBuffer = await fsReadFile(file.filepath);
    const contentType = file.mimetype || 'application/octet-stream';
    const fileName = `${Date.now()}_${file.originalFilename || 'image'}`;

    const { url } = await put(`uploads/images/${fileName}`, arrayBuffer, {
      access: 'public',
      contentType,
    });

    return res.status(200).json({ success: true, provider: 'vercel-blob', url, fileName });
  } catch (error) {
    console.error('upload-image error', error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}

function fsReadFile(path) {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    fs.readFile(path, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

