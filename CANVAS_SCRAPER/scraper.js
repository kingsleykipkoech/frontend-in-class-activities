const { chromium } = require('playwright');
const { JSDOM } = require('jsdom');
const jquery = require('jquery/factory').jQueryFactory || require('jquery');

const $ = html => jquery(new JSDOM(html).window);

async function scrapeCanvas() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Opening ALU Canvas... Please log in.');
  await page.goto('https://alueducation.instructure.com');
  await page.waitForURL(
    url => url.href.includes('/courses') || (!url.href.includes('login') && url.hostname.includes('instructure.com')),
    { timeout: 0 }
  );

  try {
    await page.getByRole('link', { name: /Frontend Web development/i }).first().click();
    if (!page.url().includes('/assignments')) {
      await page.getByRole('link', { name: 'Assignments' }).click();
    }
  } catch {
    await page.goto('https://alueducation.instructure.com/courses/3130/assignments');
  }

  await page.waitForSelector('.assignment-list, .ig-row');

  const $list = $(await page.content());
  const links = [];
  $list('a[href*="/assignments/"]').each((_, el) => {
    const href = $list(el).attr('href')?.split('?')[0];
    if (href && /\/assignments\/\d+$/.test(href)) {
      const fullUrl = href.startsWith('http') ? href : `https://alueducation.instructure.com${href}`;
      if (!links.includes(fullUrl)) links.push(fullUrl);
    }
  });

  console.log(`\nFound ${links.length} assignments. Visiting each one...\n` + '='.repeat(70));

  const results = [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    console.log(`[${i + 1}/${links.length}] Checking: ${link}`);

    try {
      await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(1000);

      const $detail = $(await page.content());
      const bodyText = $detail('body').text();

      const title = $detail('h1.title').text().trim() || $detail('h1').first().text().trim() || 'Unknown';
      const dueDate = $detail('.date_text, .assignment_dates .ic-Table--condensed td, .due_date_display').first().text().trim()
        || bodyText.match(/Due\s+([A-Za-z]{3}\s+\d+\s+(?:at|by)\s+\d+:\d+[ap]m)/)?.[1]
        || 'No due date';

      let status = 'Not Submitted';
      if (bodyText.includes('Submitted!')) {
        const match = bodyText.match(/Submitted!\s*([A-Za-z]{3}\s+\d+\s+at\s+\d+:\d+[ap]m)/);
        status = match ? `Submitted (${match[1]})` : 'Submitted';
      } else if (bodyText.toLowerCase().includes('locked') && !bodyText.toLowerCase().includes('submitted')) {
        status = 'Locked / Not Submitted';
      }

      results.push({ title, status, dueDate, link });
      console.log(`  Title:    ${title}\n  Status:   ${status}\n  Due Date: ${dueDate}\n  Link:     ${link}\n` + '-'.repeat(70));
    } catch {
      console.log(`  (Skipping — network/timeout error)\n` + '-'.repeat(70));
    }
  }

  console.log('\n' + '='.repeat(70) + '\nSUMMARY — ALL ASSIGNMENTS\n' + '='.repeat(70));
  console.table(results.map(r => ({ Title: r.title, Status: r.status, 'Due Date': r.dueDate, Link: r.link })));

  const submitted = results.filter(r => r.status.startsWith('Submitted')).length;
  console.log(`\nTotal: ${results.length} | Submitted: ${submitted} | Pending: ${results.length - submitted}`);

  await page.waitForTimeout(2000);
  await browser.close();
}

scrapeCanvas();

