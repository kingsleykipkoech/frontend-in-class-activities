# Canvas Assignment Scraper

A lightweight Node.js web scraper that extracts assignment titles and links from an ALU Canvas assignments page using **JSDOM** and **jQuery**.

Built according to course requirements:
- **Zero UI dependency** (pure terminal output)
- **Zero JSON output dependency**
- **Powered by jQuery & JSDOM**

---

## Folder Structure

```
CANVAS_SCRAPER/
├── scraper.js              # Main scraping script (JSDOM + jQuery)
├── dom.html                # Saved Canvas assignments page HTML
├── package.json            # Node.js project configuration & dependencies
├── canvas_assignments.json # (Optional) Reference dataset
└── ui/                     # (Optional) Interactive dashboard preview
    ├── index.html
    ├── style.css
    └── app.js
```

---

## Prerequisites

- Node.js (v18 or higher recommended)
- Dependencies installed:
  ```bash
  npm install
  ```

---

## How to Use

### 1. Save the Canvas Page
1. Navigate to your course assignments page on Canvas:
   ```
   https://alueducation.instructure.com/courses/3130/assignments
   ```
2. Press **Ctrl + S** (or right-click → **Save Page As...**).
3. Save as **`dom.html`** in this directory (`CANVAS_SCRAPER/dom.html`).

### 2. Run the Scraper
Execute the script using either:
```bash
node scraper.js
```
or
```bash
npm start
```

---

## Output Format

The scraper extracts all unique assignments (`.ig-title`) and outputs a clean, numbered list:

```text
================================================================================
                        CANVAS ASSIGNMENTS
================================================================================

  [ 1] Syllabus
       https://alueducation.instructure.com/courses/3130/assignments/syllabus

  [ 2] Read and Watch : Week One Mandatory Resources
       https://alueducation.instructure.com/courses/3130/assignments/46800

  ...

--------------------------------------------------------------------------------
  Total Scraped: 24 assignments
================================================================================
```
