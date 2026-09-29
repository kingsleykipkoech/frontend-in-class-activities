const fs = require('fs');
const { JSDOM } = require('jsdom');
const jquery = require('jquery/factory').jQueryFactory || require('jquery');

function scrapeData() {
  if (!fs.existsSync('dom.html')) {
    console.error('Error: "dom.html" not found.');
    console.log('Please save your Canvas assignments page (Ctrl+S) as "dom.html" in this folder, then run again.');
    process.exit(1);
  }

  const dom = fs.readFileSync('dom.html', 'utf-8');
  const $ = jquery(new JSDOM(dom).window);

  const assignments = [];
  $('.ig-title, a[href*="/assignments/"]').each(function () {
    const title = $(this).text().trim();
    const rawLink = $(this).attr('href');

    if (title && rawLink && !rawLink.includes('#')) {
      const link = rawLink.startsWith('http') ? rawLink : `https://alueducation.instructure.com${rawLink}`;
      if (!assignments.some(a => a.link === link)) {
        assignments.push({ title, link });
      }
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('                        CANVAS ASSIGNMENTS');
  console.log('='.repeat(80) + '\n');

  assignments.forEach((item, index) => {
    const num = String(index + 1).padStart(2, ' ');
    console.log(`  [${num}] ${item.title}`);
    console.log(`       ${item.link}\n`);
  });

  console.log('-'.repeat(80));
  console.log(`  Total Scraped: ${assignments.length} assignments`);
  console.log('='.repeat(80) + '\n');
}

scrapeData();



