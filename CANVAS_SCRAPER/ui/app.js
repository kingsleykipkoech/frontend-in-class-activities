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

    $.getJSON('../canvas_assignments.json', function (data) {
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
    const coursework = allAssignments.filter(item => item.category === 'Assignment').length;
    const readings = allAssignments.filter(item => item.category === 'Reading / Resource').length;
    const submitted = allAssignments.filter(item => isSubmitted(item.status)).length;
    const pending = total - submitted;
    const percent = total > 0 ? Math.round((submitted / total) * 100) : 0;

    // Filter toolbar count badges
    $('#pill-cnt-all').text(total);
    $('#pill-cnt-cw').text(coursework);
    $('#pill-cnt-rd').text(readings);
    $('#pill-cnt-done').text(submitted);
    $('#pill-cnt-pend').text(pending);

    // Hero quick chips
    $('#hero-chip-cw').text(coursework);
    $('#hero-chip-rd').text(readings);
    $('#hero-chip-due').text(submitted);

    // Progress linear track
    $('#progress-fill').css('width', percent + '%');
    $('#progress-stat').text(`${percent}% Completed`);
    $('#progress-chip').text(`${submitted} / ${total} Tasks`);

    // Radial gauge meter
    $('#radial-progress-val').attr('stroke-dasharray', `${percent}, 100`);
    $('#gauge-center-text').text(`${percent}%`);

    // Metadata breakdown dots
    $('#meta-submitted-cnt').text(submitted);
    $('#meta-pending-cnt').text(pending);
    $('#meta-readings-cnt').text(readings);
    $('#meta-cw-cnt').text(coursework);
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
      if (currentFilter === 'all') return true;
      if (currentFilter === 'assignment') return item.category === 'Assignment';
      if (currentFilter === 'reading') return item.category === 'Reading / Resource';
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

  // Helper for generating collection icons
  function getCollectionIcon(key) {
    if (key === 'readings') {
      return `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        <path d="M8 7h8m-8 4h6"></path>
      </svg>`;
    }
    if (key === 'quizzes') {
      return `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 11l3 3L22 4"></path>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
      </svg>`;
    }
    if (key === 'hackathons') {
      return `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>`;
    }
    // Default: coursework / coding
    return `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="16 18 22 12 16 6"></polyline>
      <polyline points="8 6 2 12 8 18"></polyline>
      <line x1="14" y1="4" x2="10" y2="20"></line>
    </svg>`;
  }

  // 1. RENDER COLLECTIONS VIEW (User's Requested Fanned Glass Decks)
  function renderCollectionsView(items) {
    $('#cards-grid').removeClass('grid-view list-view').addClass('collections-view');

    // Group items into distinct collections
    const collections = {
      readings: {
        title: 'Mandatory Readings & Video Guides',
        subtitle: 'Official course literature, documentation and mandatory study resources',
        emoji: '📚',
        theme: 'reading',
        items: []
      },
      quizzes: {
        title: 'Quizzes & Concept Checkpoints',
        subtitle: 'Formative assessments testing core HTML, CSS and JS prowess',
        emoji: '📝',
        theme: 'quiz',
        items: []
      },
      hackathons: {
        title: 'Hackathons & Milestones',
        subtitle: 'High-intensity coding hackathons and evaluated deliverables',
        emoji: '⚡',
        theme: 'hackathon',
        items: []
      },
      coursework: {
        title: 'Programming Labs & Core Coursework',
        subtitle: 'Hands-on practical development tasks synced from intranet',
        emoji: '💻',
        theme: 'coursework',
        items: []
      }
    };

    items.forEach(item => {
      const key = getCollectionKey(item);
      collections[key].items.push(item);
    });

    // Generate HTML for each collection with matching items
    let collectionsHtml = '';

    const collectionKeys = ['readings', 'coursework', 'quizzes', 'hackathons'];

    collectionKeys.forEach(key => {
      const col = collections[key];
      if (col.items.length === 0) return;

      const totalItems = col.items.length;

      // Build fanned cards with custom calculated --r rotation angles
      const cardsHtml = col.items.map((item, idx) => {
        const submitted = isSubmitted(item.status);
        const module = getModuleInfo(item.title);
        const due = formatDueDate(item);

        // Calculate smooth fan rotation between -16deg and +16deg
        let rot = 0;
        if (totalItems > 1) {
          const step = 32 / (totalItems - 1);
          rot = Math.round(-16 + idx * step);
        }

        // Bottom label for user's requested data-text attribute
        let bottomText = '';
        if (submitted) {
          bottomText = '✓ SUBMITTED';
        } else if (due.hasDate) {
          bottomText = `DUE: ${due.text}`;
        } else if (col.theme === 'reading') {
          bottomText = 'RESOURCE GUIDE';
        } else {
          bottomText = 'PENDING';
        }

        return `
          <a 
            href="${escapeHtml(item.url)}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="glass glass-${col.theme} ${submitted ? 'glass-submitted' : ''}" 
            style="--r: ${rot};" 
            data-text="${escapeHtml(bottomText)}"
            title="${escapeHtml(item.title)} &bull; Click to open in Canvas"
          >
            <!-- Top tag & indicator -->
            <div class="glass-top">
              <span class="glass-tag tag-${module.type}">${module.tag}</span>
              <span class="glass-dot ${submitted ? 'dot-submitted' : 'dot-pending'}"></span>
            </div>

            <!-- Center icon -->
            <div class="glass-icon">
              ${getCollectionIcon(key)}
            </div>

            <!-- Title & Info -->
            <div class="glass-info">
              <h4 class="glass-title">${escapeHtml(getCleanTitle(item.title))}</h4>
              <span class="glass-due">${escapeHtml(due.text)}</span>
            </div>

            <!-- Hover quick hint -->
            <div class="glass-hover-hint">
              <span>Open in Canvas &rarr;</span>
            </div>
          </a>
        `;
      }).join('');

      collectionsHtml += `
        <div class="collection-block theme-${col.theme}">
          <!-- Collection Header -->
          <div class="collection-header">
            <div class="collection-title-wrap">
              <span class="collection-badge-icon">${col.emoji}</span>
              <div>
                <h3 class="collection-heading">${col.title}</h3>
                <p class="collection-sub">${col.subtitle}</p>
              </div>
            </div>
            <div class="collection-meta">
              <span class="collection-counter">${totalItems} ${totalItems === 1 ? 'Item' : 'Items'}</span>
              <span class="deck-hint-pill">Hover deck to expand</span>
            </div>
          </div>

          <!-- Uiverse Fanned Glass Deck Container -->
          <div class="glass-deck-scroll">
            <div class="glass-deck container">
              ${cardsHtml}
            </div>
          </div>
        </div>
      `;
    });

    $('#cards-grid').html(collectionsHtml);
  }

  // 2. RENDER GRID VIEW (Spacious Cards Grid)
  function renderGridView(items) {
    $('#cards-grid').removeClass('collections-view list-view').addClass('grid-view');

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
        <div class="card ${submitted ? 'card-submitted' : 'card-pending'}">
          <div class="card2">
            <!-- Top Card Header: Category + Module + Status -->
            <div class="card-header-row">
              <div class="card-tags-group">
                <span class="badge-tag ${catClass}">
                  <span class="dot ${dotClass}"></span>
                  <span class="tag-txt">${catLabel}</span>
                </span>
                <span class="module-chip chip-${module.type}">${module.tag}</span>
              </div>
              <span class="badge-tag ${statusClass}">
                ${submitted 
                  ? '<svg class="badge-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' 
                  : '<span class="status-pulse"></span>'
                }
                <span class="tag-txt">${statusLabel}</span>
              </span>
            </div>

            <!-- Card Body: Title with clean link -->
            <div class="card-body">
              <h3 class="card-title" title="${escapeHtml(item.title)}">
                <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
                  ${escapeHtml(item.title)}
                </a>
              </h3>
            </div>

            <!-- Card Footer: Due Date & Sleek Action Button -->
            <div class="card-footer-row">
              <div class="due-date ${due.hasDate ? 'has-date' : ''}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>${escapeHtml(due.text)}</span>
              </div>
              
              <!-- Sleek High-Tech Launch Action -->
              <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="card-action-btn" title="Open assignment in Canvas">
                <span>Launch</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </div>
      `;
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
