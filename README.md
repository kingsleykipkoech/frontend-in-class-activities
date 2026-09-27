# Frontend Web Development — In-Class Activities & Projects

This repository contains all practical coding activities, weekly challenges, and lab implementations for the **Frontend Web Development** course at the African Leadership University (ALU).

---

## 📂 Repository Structure

| Directory | Topic / Challenge | Key Technologies |
| :--- | :--- | :--- |
| **[`CANVAS_SCRAPER/`](./CANVAS_SCRAPER/)** | **Week 4 Feature:** Canvas Automated Web Scraper & Dashboard | Playwright, Node.js, Python, jQuery |
| **[`CURRENCY_CONVERTER/`](./CURRENCY_CONVERTER/)** | Interactive Two-Way Currency Converter Application | HTML5, CSS3, jQuery |
| **[`REGISTRATION_FORM/`](./REGISTRATION_FORM/)** | Semantic Form Design & Client-Side Validation | HTML5, CSS3 |
| **[`exercises/`](./exercises/)** | In-class hands-on drills and DOM practice | HTML, CSS, JavaScript |
| **[`figma_homework/`](./figma_homework/)** | Pixel-perfect Figma design implementation | Responsive HTML/CSS |

---

## 🌟 Featured Project: Canvas Assignment Scraper (Week 4)

Located in [`CANVAS_SCRAPER/`](./CANVAS_SCRAPER/).

An automated scraper built with **Node.js** and **Playwright** that interfaces with the **ALU Canvas Portal** to scrape all course assignments, reading resources, due dates, and exact submission statuses.

### Key Capabilities:
- **Resilient Authentication Hand-off:** Detects multi-factor and manual student authentication on Canvas before initiating scraping.
- **Deep 1-by-1 Inspection:** Traverses directly into individual assignment detail pages (`/assignments/\d+`) to capture exact submission timestamps (e.g. `"Submitted (Sep 6 at 12:32pm)"`) that Canvas outer tables fail to display.
- **Smart Categorization:** Automatically distinguishes actionable assignments/quizzes from static reading materials.
- **Structured JSON Export:** Saves parsed coursework to [`canvas_assignments.json`](./CANVAS_SCRAPER/canvas_assignments.json).
- **Bonus UI Dashboard:** Includes a responsive **jQuery** search and filter dashboard located in [`codepen_ui/`](./CANVAS_SCRAPER/codepen_ui/).

### Running the Scraper:
```bash
cd CANVAS_SCRAPER

# Install dependencies
npm install

# Ensure Playwright browser is ready
npx playwright install chromium

# Run the automated scraper
node scraper.js
```

---

## 💱 Currency Converter

Located in [`CURRENCY_CONVERTER/`](./CURRENCY_CONVERTER/).

A web app for real-time currency conversions between 7 global and regional currencies (USD, EUR, GBP, JPY, RUB, KSH, RWF) featuring full input validation and clean error handling.

---

## 👤 Author
**Kingsley Kipkoech**  
*African Leadership University (ALU)*  
GitHub: [@kingsleykipkoech](https://github.com/kingsleykipkoech)
