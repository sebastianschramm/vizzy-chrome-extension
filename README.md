# Vizzy - Making Visual Data Inclusive

<img src="vizzy_icon.png" alt="Vizzy Icon" width="150px">

**Vizzy** is a Chrome extension that makes graphs and visual data more accessible for visually impaired and colorblind users.  
It can:
- 🎨 Recolor graphs for colorblind-friendly viewing  
- 📝 Generate text descriptions of graphs  
- 🔊 Narrate graphs with AI-generated audio  

---

## 🚀 Features
- **Graph recoloring**: Automatically adjusts colors to be accessible for different types of colorblindness.  
- **Smart descriptions**: Uses Google Gemini to generate concise, meaningful explanations of graphs.  
- **Audio narration**:  
  - Uses [ElevenLabs](https://elevenlabs.io) for natural-sounding voices (if API key is provided).  
  - Falls back to Google Gemini’s audio capabilities if ElevenLabs is not configured.  

---

## 🛠 Installation

1. **Clone this repository**  
   ```bash
   git clone https://github.com/sebastianschramm/vizzy-chrome-extension.git
   cd vizzy-chrome-extension
   ```

2. **Open Chrome Extensions Manager**  
   - Go to `chrome://extensions/` in Chrome.  
   - Enable **Developer Mode** (toggle in the top right).  

3. **Load Vizzy locally**  
   - Click **"Load unpacked"**.  
   - Select the cloned `vizzy-chrome-extension` folder.  

4. **Confirm installation**  
   - The Vizzy icon should now appear in your Chrome toolbar.  

---

## ⚙️ Configuration

1. Click on the Vizzy extension icon in Chrome.  
2. Enter your **Google API Key** (required).  
   - This is needed for graph descriptions and fallback audio.  
3. (Optional) Enter your **ElevenLabs API Key** for higher-quality narration.  
   - If not provided, Vizzy will use Google Gemini for audio output.  

---

## 📖 Usage

1. Navigate to a webpage with a graph or chart.  
2. Right-Click and click on **Make graph accessible**.

---

## 🧩 Requirements
- Chrome browser  
- A valid **Google API Key**  
- (Optional) An **ElevenLabs API Key**  

---

## 📜 License
Apache 2.0
