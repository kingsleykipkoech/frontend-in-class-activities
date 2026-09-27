// Scraped Canvas assignments data (from Playwright)
const assignmentsData = [
  {
    "title": "Read and Watch : Week One Mandatory Resources",
    "category": "Reading / Resource",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/46800"
  },
  {
    "title": "Roll Call Attendance",
    "category": "Assignment",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/46811"
  },
  {
    "title": "Tech Forum One - Reflection Paper",
    "category": "Assignment",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/45852"
  },
  {
    "title": "Read and Watch : Week Two Mandatory Resources",
    "category": "Reading / Resource",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/46804"
  },
  {
    "title": "Quiz One - Test your HTML/CSS/JS Prowess",
    "category": "Assignment",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/45838"
  },
  {
    "title": "Read and Watch : Week Three Mandatory Resources",
    "category": "Reading / Resource",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/46803"
  },
  {
    "title": "Read and Watch : Week Four Mandatory Resources",
    "category": "Reading / Resource",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/46799"
  },
  {
    "title": "Read and Watch : Week Four Additional Resources",
    "category": "Reading / Resource",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/46798"
  },
  {
    "title": "Read and Watch : Week Five Mandatory Resources",
    "category": "Reading / Resource",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/46797"
  },
  {
    "title": "Read and Watch : Week Five Additional Resources",
    "category": "Reading / Resource",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/46796"
  },
  {
    "title": "Read and Watch : Week Six Mandatory Resources",
    "category": "Reading / Resource",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/46802"
  },
  {
    "title": "Read and Watch : Week Six Additional Resources",
    "category": "Reading / Resource",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/46801"
  },
  {
    "title": "CSS, advanced (Front-End Web Development) [synced from intranet]",
    "category": "Assignment",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/48378"
  },
  {
    "title": "CSS, basic (Front-End Web Development) [synced from intranet]",
    "category": "Assignment",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/48377"
  },
  {
    "title": "HTML, advanced (Front-End Web Development) [synced from intranet]",
    "category": "Assignment",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/48376"
  },
  {
    "title": "HTML, basic (Front-End Web Development) [synced from intranet]",
    "category": "Assignment",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/48374"
  },
  {
    "title": "JavaScript - Objects, Scopes and Closures (Front-End Web Development) [synced from intranet]",
    "category": "Assignment",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/48379"
  },
  {
    "title": "JavaScript - Warm up (Front-End Web Development) [synced from intranet]",
    "category": "Assignment",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/48381"
  },
  {
    "title": "JavaScript - Web jQuery (Front-End Web Development) [synced from intranet]",
    "category": "Assignment",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/48375"
  },
  {
    "title": "JavaScript - Web scraping (Front-End Web Development) [synced from intranet]",
    "category": "Assignment",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/48382"
  },
  {
    "title": "Regular expression (Front-End Web Development) [synced from intranet]",
    "category": "Assignment",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/48373"
  },
  {
    "title": "Responsive design (Front-End Web Development) [synced from intranet]",
    "category": "Assignment",
    "dueDate": "No due date",
    "status": "Not Submitted",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/48380"
  },
  {
    "title": "Regex Onboarding Hackathon",
    "category": "Assignment",
    "dueDate": "Sep 11 by 11:59pm",
    "status": "Submitted (Sep 6 at 12:32pm)",
    "url": "https://alueducation.instructure.com/courses/3130/assignments/46805"
  }
];

$(document).ready(function () {
  let currentFilter = 'all';
  let searchQuery = '';

  // Render cards dynamically using jQuery
  function renderCards() {
    const $container = $('#cards-container');
    $container.empty();

    // Filter array based on search and selected button
    const filtered = assignmentsData.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery);

      if (!matchesSearch) return false;

      if (currentFilter === 'assignment') return item.category === 'Assignment';
      if (currentFilter === 'reading') return item.category === 'Reading / Resource';
      if (currentFilter === 'completed') return item.status.includes('Submitted');

      return true;
    });

    if (filtered.length === 0) {
      $container.html('<div class="empty-state">No matching assignments found.</div>');
      return;
    }

    // Build each card using jQuery
    filtered.forEach(item => {
      const isCompleted = item.status.includes('Submitted');
      const badgeClass = isCompleted ? 'status-completed' : 'status-pending';
      const badgeText = isCompleted ? 'Completed' : 'Pending';

      const $card = $(`
        <div class="card-item">
          <div class="card-top">
            <span class="card-category">${item.category}</span>
            <span class="status-badge ${badgeClass}">${badgeText}</span>
          </div>
          <h3 class="card-title">${item.title}</h3>
          <div class="card-bottom">
            <span class="card-due">📅 ${item.dueDate}</span>
            <a href="${item.url}" target="_blank" class="card-link">Open in Canvas &rarr;</a>
          </div>
        </div>
      `);

      $container.append($card);
    });
  }

  // Real-time search filter with jQuery
  $('#search-input').on('keyup', function () {
    searchQuery = $(this).val().toLowerCase().trim();
    renderCards();
  });

  // Filter button clicks with jQuery
  $('.filter-btn').click(function () {
    $('.filter-btn').removeClass('active');
    $(this).addClass('active');

    currentFilter = $(this).data('filter');
    renderCards();
  });

  // Initial render
  renderCards();
});
