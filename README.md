# fal Photo Generator

AI-powered photo generator — train a model on your face, then place yourself in any scene or generate professional headshots.

Live: https://trevorishere.github.io/falphotoapp/

This is a fully static, client-side app. It talks directly to fal.ai from your browser — no server, no install required.

## Running the app

Just open `index.html` in your browser, or visit the live link above.

If your browser blocks the fal.ai module import when opened directly as a file (`file://...`), serve the folder instead:

```
npx serve .
```

or

```
python3 -m http.server 8000
```

Then open the URL it prints (e.g. `http://localhost:8000`).

## Using the app

1. Get an API key at https://fal.ai and paste it into the key field (the dot turns green)
2. Upload 10–20 photos of yourself — face should be clearly visible, in focus, from a variety of angles
3. Hit "Start training" (takes about 5–10 minutes, costs ~$2–4, only needed once per person)
4. Once trained, switch to "Generate images", pick a scene preset or write your own, and hit Generate
5. Download the result

## Tips for best results

- Use a variety of angles — front, side, 3/4 view
- Include different lighting conditions and backgrounds
- Avoid sunglasses, hats, or heavy filters
- If a generation fails, try again — fal.ai occasionally has timeouts

## Notes

- Your API key is only ever sent from your browser directly to fal.ai — it's never stored or sent anywhere else.
- Do not share this API key or commit it anywhere; treat it like a password.
