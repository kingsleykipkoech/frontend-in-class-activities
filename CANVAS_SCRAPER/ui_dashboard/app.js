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

  // Load JSON data
  function loadAssignments() {
    $('#loader-section').show();
    $('#cards-grid').empty();
    $('#empty-state').hide();

    const jsonPath = fs_exists_url => './canvas_assignments.json';
    $.getJSON('./canvas_assignments.json')
      .fail(() => $.getJSON('../canvas_assignments.json'))
      .done(function (data) {
      allAssignments = data || [];
      
      // Artful slight delay so the 3D spinning pyramid loader is enjoyed
      setTimeout(function () {
        $('#loader-section').fadeOut(250, function () {
          updateMetrics();
          renderCards();
          bindEvents();
        });
      }, 350);
    }).fail(function () {
      $('#loader-section').html(`
        <div style="text-align: center; color: #ef4444; max-width: 420px; padding: 24px; background: rgba(239, 68, 68, 0.08); border-radius: 16px; border: 1px solid rgba(239, 68, 68, 0.2);">
          <h3 style="margin-bottom: 8px; font-weight: 700;">Could not load assignments</h3>
          <p style="font-size: 0.9rem; color: #94a3b8; line-height: 1.5;">
            Please ensure you have generated <code style="color: #00ff75; background: rgba(0,0,0,0.4); padding: 2px 6px; border-radius: 4px;">canvas_assignments.json</code> 
            by running <code style="color: #00ff75; background: rgba(0,0,0,0.4); padding: 2px 6px; border-radius: 4px;">node scraper.js</code>.
          </p>
        </div>
      `);
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

    // Progress linear track from screenshot
    $('#progress-fill').css('width', percent + '%');
    $('#progress-stat').text(`${percent}% Completed (${submitted}/${total})`);
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

  // Helper for generating user's exact .card component (NO extra icons, NO fluff)
  function createCardHtml(item, colTheme, rot = 0) {
    const submitted = isSubmitted(item.status);
    const module = getModuleInfo(item.title);
    const due = formatDueDate(item);

    let bottomText = '';
    if (submitted) {
      bottomText = '✓ SUBMITTED';
    } else if (due.hasDate) {
      bottomText = `DUE: ${due.text}`;
    } else if (colTheme === 'reading') {
      bottomText = 'COMPLEMENTARY';
    } else if (colTheme === 'quiz') {
      bottomText = 'QUIZ';
    } else if (colTheme === 'hackathon') {
      bottomText = 'SUMMATIVE';
    } else {
      bottomText = 'INTRANET';
    }

    const rotStyle = rot !== 0 ? `style="--r: ${rot};"` : '';

    return `
      <a 
        href="${escapeHtml(item.url)}" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="card card-${colTheme} ${submitted ? 'card-submitted' : ''}" 
        ${rotStyle}
        title="${escapeHtml(item.title)} &bull; Click to open in Canvas"
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

  // 1. RENDER COLLECTIONS VIEW (Ordered: Summatives & Quiz on top, Intranet, Readings last)
  function renderCollectionsView(items) {
    $('#cards-grid').removeClass('grid-view list-view').addClass('collections-view');

    // Group items into distinct collections with user requested titles & order (no fluff)
    const collections = {
      hackathons: {
        title: 'Summatives & Formatives',
        theme: 'hackathon',
        items: []
      },
      quizzes: {
        title: 'Quiz',
        theme: 'quiz',
        items: []
      },
      coursework: {
        title: 'Intranet',
        theme: 'coursework',
        items: []
      },
      readings: {
        title: 'Complementary Readings',
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
              <span class="deck-hint-pill">Hover deck to expand</span>
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

  // 3. RENDER LIST VIEW (Compact Sci-Fi HUD Rows)
  function renderListView(items) {
    $('#cards-grid').removeClass('collections-view grid-view').addClass('list-view');

    const html = items.map(item => {
      const isReading = item.category === 'Reading / Resource';
      const catClass = isReading ? 'cat-reading' : 'cat-assignment';
      const dotClass = isReading ? 'dot-purple' : 'dot-blue';
      const catLabel = isReading ? 'Reading' : 'Coursework';

      const submitted = isSubmitted(item.status);
      const statusClass = submitted ? 'status-done' : 'status-pending';
      const statusLabel = submitted ? 'Submitted' : 'Pending';

      const module = getModuleInfo(item.title);
      const due = formatDueDate(item);

      return `
        <div class="hud-list-row ${submitted ? 'row-submitted' : ''}">
          <div class="col-module">
            <span class="module-chip chip-${module.type}">${module.tag}</span>
          </div>

          <div class="col-cat">
            <span class="badge-tag ${catClass}">
              <span class="dot ${dotClass}"></span>
              <span class="tag-txt">${catLabel}</span>
            </span>
          </div>

          <div class="col-title">
            <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
              ${escapeHtml(item.title)}
            </a>
          </div>

          <div class="col-due">
            <div class="due-date ${due.hasDate ? 'has-date' : ''}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${escapeHtml(due.text)}</span>
            </div>
          </div>

          <div class="col-status">
            <span class="badge-tag ${statusClass}">
              ${submitted 
                ? '<svg class="badge-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' 
                : '<span class="status-pulse"></span>'
              }
              <span class="tag-txt">${statusLabel}</span>
            </span>
          </div>

          <div class="col-action">
            <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="card-action-btn compact">
              <span>Canvas</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </a>
          </div>
        </div>
      `;
    }).join('');

    $('#cards-grid').html(html);
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
