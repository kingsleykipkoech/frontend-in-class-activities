const { chromium } = require('playwright');
const fs = require('fs');

async function scrapeCanvas() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Opening ALU Canvas...');
  await page.goto('https://alueducation.instructure.com');

  console.log('Please log in. Waiting for dashboard...');
  await page.waitForURL(url => url.href.includes('/courses') || (!url.href.includes('login') && url.hostname.includes('instructure.com')), { timeout: 0 });

  //It  Navigates to Frontend Web Development assignments
  try {
    await page.getByRole('link', { name: /Frontend Web development/i }).first().click();
  } catch {
    await page.goto('https://alueducation.instructure.com/courses/3130/assignments');
  }

  if (!page.url().includes('/assignments')) {
    await page.getByRole('link', { name: 'Assignments' }).click();
  }

  await page.waitForSelector('.assignment-list, .ig-row');

  // then Collects all assignments links
  const links = await page.locator('a[href*="/assignments/"]').evaluateAll(elements => {
    const urls = [];
    for (const el of elements) {
      const href = el.href.split('?')[0];
      if (/\/assignments\/\d+$/.test(href) && !urls.includes(href)) {
        urls.push(href);
      }
    }
    return urls;
  });

  console.log(`\nFound ${links.length} assignments. Visiting each one to inspect details...\n`);

  const results = [];

  //  then it  Visit each assignment individually to read inside details
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    console.log(`[${i + 1}/${links.length}] Checking: ${link}`);

    try {
      await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(1000);

      const bodyText = await page.locator('body').innerText();

    // Get Title
    let title = 'Unknown';
    try {
      title = await page.locator('h1.title, h1').innerText();
    } catch {}

    // Get Due Date
    const dueMatch = bodyText.match(/Due\s+([A-Za-z]{3}\s+\d+\s+(?:at|by)\s+\d+:\d+[ap]m)/);
    const dueDate = dueMatch ? dueMatch[1] : 'No due date';

    // Get real submission status from the inside page
    let status = 'Not Submitted';
    if (bodyText.includes('Submitted!')) {
      const subMatch = bodyText.match(/Submitted!\s*([A-Za-z]{3}\s+\d+\s+at\s+\d+:\d+[ap]m)/);
      status = subMatch ? `Submitted (${subMatch[1]})` : 'Submitted';
    } else if (bodyText.toLowerCase().includes('locked') && !bodyText.toLowerCase().includes('submitted')) {
      status = 'Locked / Not Submitted';
    }

    const category = title.toLowerCase().includes('read and watch') ? 'Reading / Resource' : 'Assignment';

    const item = {
      title: title.trim().replace(/\s+/g, ' '),
      category,
      dueDate,
      status,
      url: link
    };

    results.push(item);

    console.log(`  Title:    ${item.title}`);
    console.log(`  Category: ${item.category}`);
    console.log(`  Status:   ${item.status}`);
    console.log(`  Due date: ${item.dueDate}`);
    console.log('----------------------------------------');
    } catch (err) {
      console.log(`  (Skipping due to network/timeout error: ${link})`);
      continue;
    }
  }

  // then Display categorized summary
  const actualTasks = results.filter(r => r.category === 'Assignment');
  const readingTasks = results.filter(r => r.category === 'Reading / Resource');

  console.log('\n==================================================');
  console.log('ASSIGNMENTS & QUIZZES');
  console.log('==================================================');
  console.table(actualTasks.map(t => ({ title: t.title, status: t.status, dueDate: t.dueDate })));

  console.log('\n==================================================');
  console.log('READING & STUDY RESOURCES');
  console.log('==================================================');
  console.table(readingTasks.map(t => ({ title: t.title, status: t.status })));

  // Save to JSON
  fs.writeFileSync('canvas_assignments.json', JSON.stringify(results, null, 2));
  console.log('\nSaved full dataset to canvas_assignments.json');

  await page.waitForTimeout(3000);
  await browser.close();
}

scrapeCanvas();
