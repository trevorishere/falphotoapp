# fal Photo Generator

AI-powered photo generator — place yourself in any scene or generate professional headshots.

## Setup (one time)

**1. Install Node.js** if you don't have it:
→ https://nodejs.org — download the LTS version and install it

**2. Open Terminal (Mac) or Command Prompt (Windows)**

On Mac: press Cmd+Space, type "Terminal", hit Enter
On Windows: press Win+R, type "cmd", hit Enter

**3. Navigate to this folder**

```
cd path/to/fal-photo-app
```

Replace `path/to/fal-photo-app` with the actual folder location, e.g.:
```
cd ~/Downloads/fal-photo-app
```

**4. Install dependencies**

```
npm install
```

Wait for it to finish (30–60 seconds).

## Running the app

```
npm start
```

You'll see:
```
  fal photo app running at http://localhost:3000
```

Open your browser and go to **http://localhost:3000**

## Using the app

1. Paste your fal.ai API key into the key field (the dot turns green)
2. Upload a photo of yourself — face should be clearly visible
3. Choose a scene preset or write your own description
4. Pick a model:
   - **FLUX Dev** — best for general scene swaps
   - **PhotoMaker** — better face consistency
   - **InstantID** — best face identity preservation
5. Hit Generate and wait 15–30 seconds

## Stopping the app

Press `Ctrl+C` in the terminal window.

## Tips for best results

- Use a clear, well-lit face photo as your source
- Front-facing photos work better than side profiles
- InstantID tends to give the most consistent likeness
- If a generation fails, try again — fal.ai occasionally has timeouts
