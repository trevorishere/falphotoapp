const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const JSZip = require('jszip');
const { fal } = require('@fal-ai/client');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Upload a buffer to fal storage via the official SDK
async function uploadToFal(apiKey, buffer, filename, mimetype) {
  fal.config({ credentials: apiKey });
  const blob = new Blob([buffer], { type: mimetype });
  const file = new File([blob], filename, { type: mimetype });
  const url = await fal.storage.upload(file);
  console.log('Upload URL:', url);
  return url;
}

// Train a LoRA on uploaded face photos
app.post('/api/train', upload.array('images', 30), async (req, res) => {
  const apiKey = req.headers['x-fal-key'];
  const { triggerWord = 'ohwx person' } = req.body;

  if (!apiKey) return res.status(400).json({ error: 'Missing API key' });
  if (!req.files || req.files.length < 5)
    return res.status(400).json({ error: 'Please upload at least 5 photos' });

  try {
    // Pack all images into a zip
    const zip = new JSZip();
    for (const file of req.files) {
      zip.file(file.originalname || `photo_${Date.now()}.jpg`, file.buffer);
    }
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    console.log(`Uploading zip of ${req.files.length} images...`);
    const zipUrl = await uploadToFal(apiKey, zipBuffer, 'training_images.zip', 'application/zip');
    console.log('Zip URL:', zipUrl);

    // Submit training job
    const trainRes = await fetch('https://fal.run/fal-ai/flux-lora-fast-training', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        images_data_url: zipUrl,
        trigger_word: triggerWord,
        steps: 1000,
        create_masks: true
      })
    });

    const trainData = await trainRes.json();
    console.log('Train response:', JSON.stringify(trainData).slice(0, 500));

    if (!trainRes.ok) {
      return res.status(trainRes.status).json({ error: trainData.detail || JSON.stringify(trainData) });
    }

    // Return the LoRA weights URL
    const loraUrl = trainData?.diffusers_lora_file?.url
      || trainData?.lora_file?.url
      || trainData?.weights_url;

    if (!loraUrl) {
      return res.status(500).json({ error: 'Training succeeded but no LoRA URL found', raw: trainData });
    }

    res.json({ loraUrl, triggerWord });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Generate image using trained LoRA
app.post('/api/generate', express.json(), async (req, res) => {
  const apiKey = req.headers['x-fal-key'];
  const { prompt, loraUrl, triggerWord = 'ohwx person' } = req.body;

  if (!apiKey) return res.status(400).json({ error: 'Missing API key' });
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
  if (!loraUrl) return res.status(400).json({ error: 'Missing LoRA URL — please train first' });

  try {
    const fullPrompt = `${triggerWord}, ${prompt}, photorealistic, high quality, sharp focus`;
    console.log('Generating with prompt:', fullPrompt);

    const genRes = await fetch('https://fal.run/fal-ai/flux-lora', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        loras: [{ path: loraUrl, scale: 1.0 }],
        num_inference_steps: 28,
        guidance_scale: 3.5,
        image_size: 'portrait_4_3',
        num_images: 1,
        enable_safety_checker: false
      })
    });

    const genData = await genRes.json();
    console.log('Generate response:', JSON.stringify(genData).slice(0, 400));

    if (!genRes.ok) {
      return res.status(genRes.status).json({ error: genData.detail || JSON.stringify(genData) });
    }

    const imgUrl = genData?.images?.[0]?.url;
    if (!imgUrl) return res.status(500).json({ error: 'No image in response', raw: genData });

    res.json({ url: imgUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n  fal photo app running at http://localhost:${PORT}\n`);
});
