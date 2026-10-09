$(function () {
  let allAssignments = [];
  let currentFilter = 'all';
  let currentViewMode = 'decks'; // Default: 'decks' (Collections), 'grid', or 'list'

  // Helper to escape HTML characters
  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Proper submission check: distinguishes 'Not Submitted' from 'Submitted'
  function isSubmitted(status) {
    const s = (status || '').toLowerCase().trim();
    return s.includes('submitted') && !s.includes('not submitted');
  }

  // Extract module / topic metadata from assignment title
  function getModuleInfo(title) {
    const t = title || '';
    if (/quiz/i.test(t)) return { tag: 'QUIZ', type: 'quiz' };
    if (/hackathon/i.test(t)) return { tag: 'HACKATHON', type: 'special' };
    if (/week\s*one/i.test(t)) return { tag: 'WEEK 01', type: 'week' };
    if (/week\s*two/i.test(t)) return { tag: 'WEEK 02', type: 'week' };
    if (/week\s*three/i.test(t)) return { tag: 'WEEK 03', type: 'week' };
    if (/week\s*four/i.test(t)) return { tag: 'WEEK 04', type: 'week' };
    if (/week\s*five/i.test(t)) return { tag: 'WEEK 05', type: 'week' };
    if (/week\s*six/i.test(t)) return { tag: 'WEEK 06', type: 'week' };
    if (/javascript/i.test(t)) return { tag: 'JAVASCRIPT', type: 'code' };
    if (/css/i.test(t)) return { tag: 'CSS', type: 'code' };
    if (/html/i.test(t)) return { tag: 'HTML', type: 'code' };
    if (/regex|regular expression/i.test(t)) return { tag: 'REGEX', type: 'code' };
    if (/responsive/i.test(t)) return { tag: 'RESPONSIVE', type: 'code' };
    if (/attendance/i.test(t)) return { tag: 'SESSION', type: 'session' };
    return { tag: 'COURSEWORK', type: 'general' };
  }

  // Clean title for elegant card presentation
  function getCleanTitle(title) {
    if (!title) return '';
    return title
      .replace(/\s*\(Front-End Web Development\)\s*\[synced from intranet\]/i, '')
      .replace(/^Read and Watch\s*:\s*/i, '')
      .trim();
  }

  // Clean formatted due date
  function formatDueDate(item) {
    const d = item.dueDate || '';
    if (d && d !== 'No due date') {
      return { text: d, hasDate: true };
    }
    return { text: 'No due date', hasDate: false };
  }

  // Classify assignment into distinct collection groups
  function getCollectionKey(item) {
    const title = (item.title || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();

    if (title.includes('hackathon')) return 'hackathons';
    if (title.includes('quiz')) return 'quizzes';
    if (cat.includes('reading') || title.includes('read and watch') || title.includes('resources')) return 'readings';
    return 'coursework';
  }

  // Embedded assignment dataset for instant local file:// and CodePen preview
  const fallbackAssignments = [
    {
      "title": "Regex Onboarding Hackathon",
      "category": "Assignment",
      "dueDate": "Sep 11 by 11:59pm",
      "status": "Submitted (Sep 6 at 12:32pm)",
      "url": "https://alueducation.instructure.com/courses/3130/assignments/46805"
    },
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
    }
  ];

  // Sort assignments: submitted first (Regex Onboarding Hackathon at top)
  function sortAssignments(list) {
    return [...list].sort((a, b) => {
      const aSub = isSubmitted(a.status);
      const bSub = isSubmitted(b.status);
      if (aSub && !bSub) return -1;
      if (!aSub && bSub) return 1;
      return 0;
    });
  }

  // Load JSON data with automatic fallback
  function loadAssignments() {
    $('#loader-section').show();
    $('#cards-grid').empty();
    $('#empty-state').hide();

    function initData(data) {
      allAssignments = sortAssignments(data && data.length > 0 ? data : fallbackAssignments);
      setTimeout(function () {
        $('#loader-section').fadeOut(250, function () {
          updateMetrics();
          renderCards();
          bindEvents();
        });
      }, 350);
    }

    $.getJSON('./canvas_assignments.json')
      .done(initData)
      .fail(function () {
        $.getJSON('../canvas_assignments.json')
          .done(initData)
          .fail(function () {
            // Graceful fallback for local file:// protocol or CodePen preview
            initData(fallbackAssignments);
          });
      });
  }

  // Calculate and update metrics across dashboard
  function updateMetrics() {
    const total = allAssignments.length;
    const readings = allAssignments.filter(item => item.category === 'Reading / Resource').length;
    const submitted = allAssignments.filter(item => isSubmitted(item.status)).length;
    const pending = total - submitted;
    const percent = total > 0 ? Math.round((submitted / total) * 100) : 0;

    // Filter toolbar count badges
    const summatives = allAssignments.filter(item => getCollectionKey(item) === 'hackathons').length;
    const quizzes = allAssignments.filter(item => getCollectionKey(item) === 'quizzes').length;
    const intranet = allAssignments.filter(item => getCollectionKey(item) === 'coursework').length;

    $('#pill-cnt-all').text(total);
    $('#pill-cnt-sum').text(summatives);
    $('#pill-cnt-quiz').text(quizzes);
    $('#pill-cnt-cw').text(intranet);
    $('#pill-cnt-rd').text(readings);
    $('#pill-cnt-done').text(submitted);
    $('#pill-cnt-pend').text(pending);

    // Progress linear track
    $('#progress-fill').css('width', percent + '%');
    $('#progress-stat').text(`${percent}% (${submitted} of ${total} completed)`);
  }

  // Filtered dataset based on search input and active pill
  function getFilteredAssignments() {
    const query = ($('#search-input').val() || '').trim().toLowerCase();

    return allAssignments.filter(item => {
      // Text search matching title, category or module
      const titleMatch = (item.title || '').toLowerCase().includes(query);
      const categoryMatch = (item.category || '').toLowerCase().includes(query);
      const moduleInfo = getModuleInfo(item.title);
      const moduleMatch = moduleInfo.tag.toLowerCase().includes(query);

      if (query && !titleMatch && !categoryMatch && !moduleMatch) {
        return false;
      }

      // Category filter matching
      const submitted = isSubmitted(item.status);
      const colKey = getCollectionKey(item);

      if (currentFilter === 'all') return true;
      if (currentFilter === 'summatives') return colKey === 'hackathons';
      if (currentFilter === 'quizzes') return colKey === 'quizzes';
      if (currentFilter === 'coursework' || currentFilter === 'intranet') return colKey === 'coursework';
      if (currentFilter === 'reading' || currentFilter === 'readings') return colKey === 'readings';
      if (currentFilter === 'submitted') return submitted;
      if (currentFilter === 'pending') return !submitted;

      return true;
    });
  }

  // Render cards according to current view mode
  function renderCards() {
    const filtered = getFilteredAssignments();

    if (filtered.length === 0) {
      $('#cards-grid').empty();
      $('#empty-state').fadeIn(200);
      return;
    }

    $('#empty-state').hide();

    if (currentViewMode === 'decks') {
      renderCollectionsView(filtered);
    } else if (currentViewMode === 'list') {
      renderListView(filtered);
    } else {
      renderGridView(filtered);
    }
  }

  // Helper for generating assignment cards
  function createCardHtml(item, colTheme, rot = 0) {
    const submitted = isSubmitted(item.status);
    const module = getModuleInfo(item.title);
    const due = formatDueDate(item);

    let bottomText = '';
    if (submitted) {
      bottomText = '✓ Submitted';
    } else if (due.hasDate) {
      bottomText = `Due: ${due.text}`;
    } else if (colTheme === 'reading') {
      bottomText = 'Reading';
    } else if (colTheme === 'quiz') {
      bottomText = 'Quiz';
    } else if (colTheme === 'hackathon') {
      bottomText = 'Project';
    } else {
      bottomText = 'Assignment';
    }

    const rotStyle = rot !== 0 ? `style="--r: ${rot};"` : '';

    return `
      <a 
        href="${escapeHtml(item.url)}" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="card card-${colTheme} ${submitted ? 'card-submitted' : ''}" 
        ${rotStyle}
        title="Open ${escapeHtml(item.title)} in Canvas"
      >
        <div class="border"></div>
        <div class="content">
          <span class="card-tag">${escapeHtml(module.tag)}</span>
          <h4 class="card-title">${escapeHtml(getCleanTitle(item.title))}</h4>
          <span class="card-due">${escapeHtml(due.text)}</span>
        </div>
        <span class="bottom-text">${escapeHtml(bottomText)}</span>
      </a>
    `;
  }

  // 1. Render Categories View (Projects & Quizzes on top, Coursework & Readings below)
  function renderCollectionsView(items) {
    $('#cards-grid').removeClass('grid-view list-view').addClass('collections-view');

    const collections = {
      hackathons: {
        title: 'Major Projects & Hackathons',
        theme: 'hackathon',
        items: []
      },
      quizzes: {
        title: 'Quizzes & Practice',
        theme: 'quiz',
        items: []
      },
      coursework: {
        title: 'Coursework & Exercises',
        theme: 'coursework',
        items: []
      },
      readings: {
        title: 'Readings & Resources',
        theme: 'reading',
        items: []
      }
    };

    items.forEach(item => {
      const key = getCollectionKey(item);
      collections[key].items.push(item);
    });

    function buildCollectionBlock(key) {
      const col = collections[key];
      if (col.items.length === 0) return '';

      const totalItems = col.items.length;
      const cardsHtml = col.items.map((item, idx) => {
        let rot = 0;
        if (totalItems > 1) {
          const step = 28 / (totalItems - 1);
          rot = Math.round(-14 + idx * step);
        }
        return createCardHtml(item, col.theme, rot);
      }).join('');

      return `
        <div class="collection-block theme-${col.theme}">
          <div class="collection-header">
            <h3 class="collection-heading">${col.title}</h3>
            <div class="collection-meta">
              <span class="collection-counter">${totalItems} ${totalItems === 1 ? 'Item' : 'Items'}</span>
              <span class="deck-hint-pill">Hover cards to expand</span>
            </div>
          </div>
          <div class="glass-deck-scroll">
            <div class="glass-deck container">
              ${cardsHtml}
            </div>
          </div>
        </div>
      `;
    }

    // Top Row: Put Summatives and Quiz side by side so single cards don't waste full-width space!
    const summativeBlock = buildCollectionBlock('hackathons');
    const quizBlock = buildCollectionBlock('quizzes');
    let topRowHtml = '';
    if (summativeBlock || quizBlock) {
      topRowHtml = `
        <div class="collections-top-row">
          ${summativeBlock}
          ${quizBlock}
        </div>
      `;
    }

    const intranetBlock = buildCollectionBlock('coursework');
    const readingsBlock = buildCollectionBlock('readings');

    $('#cards-grid').html(topRowHtml + intranetBlock + readingsBlock);
  }

  // 2. RENDER GRID VIEW (Using user's exact .card design - NO bloated card2, NO extra icons)
  function renderGridView(items) {
    $('#cards-grid').removeClass('collections-view list-view').addClass('grid-view');

    const html = items.map(item => {
      const colKey = getCollectionKey(item);
      const themeMap = { hackathons: 'hackathon', quizzes: 'quiz', coursework: 'coursework', readings: 'reading' };
      return createCardHtml(item, themeMap[colKey] || 'coursework', 0);
    }).join('');

    $('#cards-grid').html(html);
  }

  // 3. RENDER LIST VIEW (Clean Assignment Title + Details Focus)
  function renderListView(items) {
    $('#cards-grid').removeClass('collections-view grid-view').addClass('list-view');

    const headerHtml = `
      <div class="list-table-header">
        <span class="th-title">Assignment Title</span>
        <span class="th-detail">Details</span>
        <span class="th-due">Due Date</span>
        <span class="th-status">Status</span>
        <span class="th-action">Canvas</span>
      </div>
    `;

    const rowsHtml = items.map(item => {
      let detailLabel = 'Coursework';
      const key = getCollectionKey(item);
      if (key === 'hackathons') detailLabel = 'Major Project';
      else if (key === 'quizzes') detailLabel = 'Quiz';
      else if (key === 'readings') detailLabel = 'Reading';

      const submitted = isSubmitted(item.status);
      const due = formatDueDate(item);

      return `
        <div class="hud-list-row ${submitted ? 'row-submitted' : ''}">
          <div class="col-title">
            <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
              ${escapeHtml(item.title)}
            </a>
          </div>

          <div class="col-detail">
            <span class="detail-label">${detailLabel}</span>
          </div>

          <div class="col-due ${due.hasDate ? 'has-date' : ''}">
            <span>${escapeHtml(due.text)}</span>
          </div>

          <div class="col-status">
            <span class="status-badge ${submitted ? 'submitted' : 'pending'}">
              ${submitted ? 'Submitted' : 'Pending'}
            </span>
          </div>

          <div class="col-action">
            <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="list-view-btn">
              View
            </a>
          </div>
        </div>
      `;
    }).join('');

    $('#cards-grid').html(headerHtml + rowsHtml);
  }

  // Bind interactive events
  function bindEvents() {
    // Realtime search typing
    $('#search-input').off('input').on('input', function () {
      renderCards();
    });

    // Clear search button / icon inside #poda
    $('#filter-icon').off('click').on('click', function () {
      const currentVal = $('#search-input').val();
      if (currentVal) {
        $('#search-input').val('').focus();
        renderCards();
      }
    });

    // Quick focus search on '/' keypress
    $(document).off('keydown').on('keydown', function (e) {
      if (e.key === '/' && !$(e.target).is('input, textarea')) {
        e.preventDefault();
        $('#search-input').focus().select();
      }
    });

    // Cyber filter buttons
    $('#filters-bar').off('click', '.cyber-btn').on('click', '.cyber-btn', function () {
      $('#filters-bar .cyber-btn').removeClass('active');
      $(this).addClass('active');
      currentFilter = $(this).data('filter');
      renderCards();
    });

    // View switcher buttons (Collections vs. Grid vs. List)
    $('#btn-view-decks').off('click').on('click', function () {
      if (currentViewMode !== 'decks') {
        currentViewMode = 'decks';
        $('.view-toggle-btn').removeClass('active');
        $(this).addClass('active');
        renderCards();
      }
    });

    $('#btn-view-grid').off('click').on('click', function () {
      if (currentViewMode !== 'grid') {
        currentViewMode = 'grid';
        $('.view-toggle-btn').removeClass('active');
        $(this).addClass('active');
        renderCards();
      }
    });

    $('#btn-view-list').off('click').on('click', function () {
      if (currentViewMode !== 'list') {
        currentViewMode = 'list';
        $('.view-toggle-btn').removeClass('active');
        $(this).addClass('active');
        renderCards();
      }
    });
  }

  // Start initialization
  loadAssignments();
});
