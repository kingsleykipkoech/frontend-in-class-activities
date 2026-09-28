$(function () {
  let allAssignments = [];
  let currentFilter = 'all';

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

  // Load JSON data
  function loadAssignments() {
    $('#loader-section').show();
    $('#cards-grid').empty();
    $('#empty-state').hide();

    $.getJSON('../canvas_assignments.json', function (data) {
      allAssignments = data || [];
      
      // Artificial slight delay so user can enjoy the 3D spinning pyramid
      setTimeout(function () {
        $('#loader-section').fadeOut(250, function () {
          updateMetrics();
          renderCards();
          bindEvents();
        });
      }, 350);
    }).fail(function () {
      $('#loader-section').html(`
        <div style="text-align: center; color: #ef4444; max-width: 400px; padding: 20px;">
          <h3 style="margin-bottom: 8px; font-weight: 700;">Could not load assignments</h3>
          <p style="font-size: 0.9rem; color: #94a3b8;">
            Please ensure you have generated <code style="color: #00ff75;">canvas_assignments.json</code> 
            by running <code style="color: #00ff75;">node scraper.js</code>.
          </p>
        </div>
      `);
    });
  }

  // Calculate and update metrics
  function updateMetrics() {
    const total = allAssignments.length;
    const coursework = allAssignments.filter(item => item.category === 'Assignment').length;
    const readings = allAssignments.filter(item => item.category === 'Reading / Resource').length;
    const submitted = allAssignments.filter(item => isSubmitted(item.status)).length;
    const pending = total - submitted;

    // Header stats
    $('#cnt-total').text(total);
    $('#cnt-cw').text(coursework);
    $('#cnt-rd').text(readings);
    $('#cnt-done').text(submitted);
    $('#cnt-pend').text(pending);

    // Filter pill count badges
    $('#pill-cnt-all').text(total);
    $('#pill-cnt-cw').text(coursework);
    $('#pill-cnt-rd').text(readings);
    $('#pill-cnt-done').text(submitted);
    $('#pill-cnt-pend').text(pending);

    // Progress bar
    const percent = total > 0 ? Math.round((submitted / total) * 100) : 0;
    $('#progress-fill').css('width', percent + '%');
    $('#progress-stat').text(`${percent}% Completed (${submitted}/${total})`);
  }

  // Filtered dataset based on search input and active pill
  function getFilteredAssignments() {
    const query = ($('#search-input').val() || '').trim().toLowerCase();

    return allAssignments.filter(item => {
      // Text search matching title or category
      const titleMatch = (item.title || '').toLowerCase().includes(query);
      const categoryMatch = (item.category || '').toLowerCase().includes(query);
      if (query && !titleMatch && !categoryMatch) {
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

  // Render cards to grid
  function renderCards() {
    const filtered = getFilteredAssignments();

    if (filtered.length === 0) {
      $('#cards-grid').empty();
      $('#empty-state').fadeIn(200);
      return;
    }

    $('#empty-state').hide();

    const cardsHtml = filtered.map(item => {
      const isReading = item.category === 'Reading / Resource';
      const catClass = isReading ? 'cat-reading' : 'cat-assignment';
      const dotClass = isReading ? 'dot-purple' : 'dot-blue';
      const catLabel = isReading ? 'Reading' : 'Coursework';

      const submitted = isSubmitted(item.status);
      let statusClass = 'status-pending';
      let statusLabel = 'Pending';

      if (submitted) {
        statusClass = 'status-done';
        statusLabel = 'Submitted';
      } else if (item.status && item.status.toLowerCase().includes('locked')) {
        statusClass = 'status-locked';
        statusLabel = 'Locked';
      } else {
        statusLabel = 'Pending';
      }

      return `
        <div class="card">
          <div class="card2">
            <div class="card-header-row">
              <span class="cyber-tag ${catClass}">
                <span class="dot ${dotClass}"></span>
                <span class="tag-txt">${catLabel}</span>
              </span>
              <span class="cyber-tag ${statusClass}">
                <span class="tag-txt">${statusLabel}</span>
              </span>
            </div>

            <h3 class="card-title">
              <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
                ${escapeHtml(item.title)}
              </a>
            </h3>

            <div class="card-footer-row">
              <div class="due-date">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>${escapeHtml(item.dueDate || 'No due date')}</span>
              </div>
              
              <!-- Sci-Fi HUD Action Button -->
              <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="cyber-btn card-action-cyber">
                <span class="btn-label">OPEN CANVAS</span>
                <div class="clip">
                  <div class="corner left-top"></div>
                  <div class="corner right-bottom"></div>
                  <div class="corner right-top"></div>
                  <div class="corner left-bottom"></div>
                </div>
                <span class="arrow right-arrow"></span>
                <span class="arrow left-arrow"></span>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    $('#cards-grid').html(cardsHtml);
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

    // Cyber filter buttons
    $('#filters-bar').off('click', '.cyber-btn').on('click', '.cyber-btn', function () {
      $('#filters-bar .cyber-btn').removeClass('active');
      $(this).addClass('active');
      currentFilter = $(this).data('filter');
      renderCards();
    });
  }

  // Start initialization
  loadAssignments();
});
