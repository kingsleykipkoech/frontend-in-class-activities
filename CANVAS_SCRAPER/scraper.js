const { chromium } = require('playwright');
const { JSDOM } = require('jsdom');

/**
 * Canvas Assignment Scraper
 * Uses Playwright to fetch pages (login required), then jQuery + JSDOM to parse the DOM.
 * Output: Terminal only — no JSON, no UI.
 * Displays: Assignment Title, Status, Due Date, Link
 */
async function scrapeCanvas() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Opening ALU Canvas...');
  await page.goto('https://alueducation.instructure.com');

  console.log('Please log in. Waiting for dashboard...');
  await page.waitForURL(
    url => url.href.includes('/courses') || (!url.href.includes('login') && url.hostname.includes('instructure.com')),
    { timeout: 0 }
  );

  // Navigate to Frontend Web Development assignments
  try {
    await page.getByRole('link', { name: /Frontend Web development/i }).first().click();
  } catch {
    await page.goto('https://alueducation.instructure.com/courses/3130/assignments');
  }

  if (!page.url().includes('/assignments')) {
    await page.getByRole('link', { name: 'Assignments' }).click();
  }

  await page.waitForSelector('.assignment-list, .ig-row');

  // Get the full page HTML and parse it with JSDOM + jQuery
  const assignmentsPageHtml = await page.content();
  const assignmentsDom = new JSDOM(assignmentsPageHtml);
  const $assignments = require('jquery')(assignmentsDom.window);

  // Use jQuery to extract all assignment links from the page
  const links = [];
  $assignments('a[href*="/assignments/"]').each(function () {
    const href = $assignments(this).attr('href');
    if (href) {
      const cleanHref = href.split('?')[0];
      // Only keep direct assignment links (ending in /assignments/<number>)
      if (/\/assignments\/\d+$/.test(cleanHref)) {
        const fullUrl = cleanHref.startsWith('http')
          ? cleanHref
          : `https://alueducation.instructure.com${cleanHref}`;
        if (!links.includes(fullUrl)) {
          links.push(fullUrl);
        }
      }
    }
  });

  console.log(`\nFound ${links.length} assignments. Visiting each one...\n`);
  console.log('='.repeat(70));

  const results = [];

  // Visit each assignment page individually, parse with JSDOM + jQuery
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    console.log(`[${i + 1}/${links.length}] Checking: ${link}`);

    try {
      await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(1000);

      // Get the assignment detail page HTML
      const detailHtml = await page.content();

      // Parse with JSDOM + jQuery
      const detailDom = new JSDOM(detailHtml);
      const $ = require('jquery')(detailDom.window);

      // --- Extract Assignment Title using jQuery ---
      let title = $('h1.title').text().trim() || $('h1').first().text().trim() || 'Unknown';

      // --- Extract Due Date using jQuery ---
      let dueDate = 'No due date';
      const dueDateEl = $('.date_text, .assignment_dates .ic-Table--condensed td, .due_date_display');
      if (dueDateEl.length) {
        const dueDateText = dueDateEl.first().text().trim();
        if (dueDateText) dueDate = dueDateText;
      }
      // Fallback: search page text with regex
      if (dueDate === 'No due date') {
        const bodyText = $('body').text();
        const dueMatch = bodyText.match(/Due\s+([A-Za-z]{3}\s+\d+\s+(?:at|by)\s+\d+:\d+[ap]m)/);
        if (dueMatch) dueDate = dueMatch[1];
      }

      // --- Extract Submission Status using jQuery ---
      let status = 'Not Submitted';
      const bodyText = $('body').text();

      if (bodyText.includes('Submitted!')) {
        const subMatch = bodyText.match(/Submitted!\s*([A-Za-z]{3}\s+\d+\s+at\s+\d+:\d+[ap]m)/);
        status = subMatch ? `Submitted (${subMatch[1]})` : 'Submitted';
      } else if (
        bodyText.toLowerCase().includes('locked') &&
        !bodyText.toLowerCase().includes('submitted')
      ) {
        status = 'Locked / Not Submitted';
      }

      results.push({ title, status, dueDate, link });

      // Print to terminal
      console.log(`  Title:    ${title}`);
      console.log(`  Status:   ${status}`);
      console.log(`  Due Date: ${dueDate}`);
      console.log(`  Link:     ${link}`);
      console.log('-'.repeat(70));

      // Clean up JSDOM instance
      detailDom.window.close();
    } catch (err) {
      console.log(`  (Skipping — network/timeout error)`);
      console.log('-'.repeat(70));
      continue;
    }
  }

  // Clean up assignments page DOM
  assignmentsDom.window.close();

  // Final summary table
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY — ALL ASSIGNMENTS');
  console.log('='.repeat(70));
  console.table(
    results.map(r => ({
      Title: r.title,
      Status: r.status,
      'Due Date': r.dueDate,
      Link: r.link
    }))
  );

  console.log(`\nTotal: ${results.length} assignments found.`);
  const submitted = results.filter(r => r.status.startsWith('Submitted'));
  const pending = results.filter(r => !r.status.startsWith('Submitted'));
  console.log(`  Submitted: ${submitted.length}`);
  console.log(`  Pending:   ${pending.length}`);

  await page.waitForTimeout(2000);
  await browser.close();
}

scrapeCanvas();
