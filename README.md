# CountLife

>A minimalist, privacy-first Chrome Extension that replaces your New Tab with a mindful countdown of your life or upcoming milestones, paired with a GitHub-style progress grid and a draggable motivation photo.

---

### Some of the features:

- `Lifespan Countdown Mode` : Enter your Date of Birth to automatically calculate and visualize your remaining time lifespan.
- `Event Deadline Mode` : Track key milestones (exams, product launches, fitness goals, graduation) with precise start and end dates.
- `GitHub-Style Fullscreen Grid` : Squares automatically turn forest green as your time passes.
- `High-Precision Countdown` : Ticking countdown displaying Years, Months, Days, Hours, Minutes, Seconds, & Milliseconds.
- `Tilted Draggable Motivation Photo` : Upload a personal photo (up to 10 MB). Your photo position is remembered across every new tab.
- `100% Offline & Private` : Zero external servers, zero tracking, zero API calls. All dates and images are compressed and stored locally on your device.

---

### How to Install in Google Chrome (Free)

Follow these simple steps to install CountLife in less than 60 seconds:

### Step 1: Download the Extension
1. Go to the [Releases](https://github.com/Gauma-bless2u/CountLife.git) page of this repository.
2. Download **`CountLife.zip`** (or click the green **Code** button and select **Download ZIP**).
3. Unzip the file on your computer.

### Step 2: Load into Google Chrome
1. Open Google Chrome.
2. In the address bar, type `chrome://extensions` and press **Enter**.
3. In the top-right corner of the Extensions page, turn **ON** the toggle switch for **Developer mode**.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the unzipped folder containing the extension files (where `manifest.json` is located).
6. **Done!** Open a **New Tab** (`Ctrl + T` or `Cmd + T`) to see CountLife live!

---

## How to Use

### 1. Configure Your Countdown
1. Click the **☰ Settings icon** in the top-left corner of the screen.
2. Choose your preferred mode:
   - **Lifespan Countdown**: Select your Date of Birth.
   - **Event Deadline**: Enter your event title, start date, and target deadline.
3. Click **Start Countdown**.

### 2. Add Your Motivation Photo (Lifespan Mode)
1. Open **Settings (☰)** and make sure you are on the **Lifespan Countdown** tab.
2. Under **Personal Motivation Photo**, click to choose an image file (supports PNG, JPG, WebP up to 10 MB).
3. Your photo will automatically appear in a tilted 1:1 frame on the screen.
4. **Click and drag** the frame to position it anywhere on your screen (top-right, bottom-corner, next to the countdown).
5. The photo stays in that exact spot on every new tab you open!
6. To delete the photo, simply open Settings and click **Remove Photo**.

---

## Color Theme & Design

CountLife is designed with an intentional dark minimalist aesthetic:

| Color | Hex | Purpose |
| :--- | :--- | :--- |
| **Accent Indigo** | `#4A5CE5` | Countdown title badge, active tabs, buttons & photo frame |
| **Hover Indigo** | `#2D3DD7` | Interactive hover states on tabs and buttons |
| **Main Background** | `#121212` | Fullscreen background |
| **Modal Background** | `#222222` | Settings card background |
| **Future Grid** | `#333333` | Grid squares representing future time |
| **Passed Grid** | `#044f1e` | Forest green grid squares representing lived time |
| **Text & Numbers** | `#ffffff` | Primary text and countdown digits |
| **Typography** | `Departure Mono Regular` | Applied to countdown digits and time unit labels |

---

## Tech Stack & Structure

- **Platform**: Chrome Extension (Manifest V3)
- **Languages**: Pure HTML5, CSS3, Vanilla JavaScript (Zero external dependencies)
- **Storage**: Browser Local Storage & `chrome.storage.sync` with local auto-compression
- **File Structure**:
  ```text
  ├── manifest.json       # Manifest V3 extension configuration
  ├── index.html          # New tab dashboard & modal structure
  ├── styles.css          # Minimalist dark theme & animations
  ├── script.js           # Countdown logic, grid engine & drag mechanics
  ├── icon16.png          # 16x16 browser toolbar icon
  ├── icon48.png          # 48x48 extensions management icon
  ├── icon128.png         # 128x128 store & installation icon
  ├── chai.png            # New tab favicon
  └── README.md           # Documentation
  ```

# About Author

My Name is `Prince Kumar` and I build software.

My social media links:

- [Twitter / X](https://x.com/vayam_prince)
- [Discord](https://discord.com/@vayam_prince)



## 📄 License

This project is licensed under the [MIT License](LICENSE) - free to use, modify, and distribute.
