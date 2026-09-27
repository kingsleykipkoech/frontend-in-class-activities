/**
 * Canvas Assignment Scraper (Browser Console Version)
 * Course: https://alueducation.instructure.com/courses/3130
 * 
 * HOW TO USE:
 * 1. Open your browser and log into https://alueducation.instructure.com/courses/3130/assignments
 * 2. Press F12 (or right-click anywhere -> Inspect) and click the "Console" tab.
 * 3. Copy and paste this entire script into the Console, then press Enter.
 */

(async function scrapeCanvasAssignments() {
  console.log("🔍 Checking Canvas assignments...");

  try {
    // Canvas provides an internal API for the logged-in user:
    const response = await fetch('/api/v1/courses/3130/assignments?per_page=100&include[]=submission');
    
    if (response.ok) {
      const assignments = await response.json();
      const now = new Date();

      const results = assignments.map(item => {
        const dueDate = item.due_at ? new Date(item.due_at) : null;
        const submission = item.submission;
        const isSubmitted = submission && (submission.submitted_at || submission.workflow_state === 'submitted');

        let status = 'Active';
        if (isSubmitted) {
          status = '✅ Submitted';
        } else if (dueDate && dueDate < now) {
          status = '❌ Overdue / Not Submitted';
        } else if (dueDate && dueDate >= now) {
          status = '⏳ Due (Not Submitted)';
        } else {
          status = '⚪ Active (No Due Date)';
        }

        return {
          "Assignment Name": item.name,
          "Status": status,
          "Due Date": dueDate ? dueDate.toLocaleString() : "No Due Date"
        };
      });

      console.log("%c=== CANVAS ASSIGNMENT REPORT ===", "color: #4a90d9; font-size: 16px; font-weight: bold;");
      console.table(results);

      // Filter active / pending assignments specifically:
      const activePending = results.filter(r => r["Status"].includes("Due") || r["Status"].includes("Active"));
      console.log(`%c👉 Active / Incomplete Assignments (${activePending.length}):`, "color: #ff9800; font-size: 14px; font-weight: bold;");
      console.table(activePending);
      
      return results;
    }
  } catch (err) {
    console.log("Fetching API failed, falling back to DOM scraping on the page...", err);
  }

  // Fallback: Scrape HTML DOM elements on the page
  const rows = document.querySelectorAll('.ig-row, li.assignment');
  const results = [];
  const now = new Date();

  rows.forEach(row => {
    const titleEl = row.querySelector('.ig-title, a.ig-title, .assignment_title a');
    const title = titleEl ? titleEl.textContent.trim() : "Unknown Assignment";

    const dueEl = row.querySelector('.assignment-date-due, .due_date_display, .ig-details');
    const dueText = dueEl ? dueEl.textContent.replace(/Due:/i, '').trim() : "No Due Date";

    const textContent = row.textContent.toLowerCase();
    let status = '⏳ Due (Not Submitted)';

    if (textContent.includes('submitted')) {
      status = '✅ Submitted';
    } else if (textContent.includes('missing') || textContent.includes('late')) {
      status = '❌ Overdue / Not Submitted';
    }

    results.push({
      "Assignment Name": title,
      "Status": status,
      "Due Date": dueText
    });
  });

  console.table(results);
})();
