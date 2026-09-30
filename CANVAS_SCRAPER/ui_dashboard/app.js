$(function () {
  let data = [];
  let activeFilter = 'all';

  $.getJSON('./canvas_assignments.json')
    .fail(() => $.getJSON('../canvas_assignments.json'))
    .done(function (json) {
      data = json;
      render();
      bind();
    }).fail(function () {
      $('#grid').html(
        '<p class="empty">Could not load <strong>canvas_assignments.json</strong>.<br>Run <code>node scraper.js</code> first, then refresh.</p>'
      );
    });

  function counts() {
    const total = data.length;
    const cw = data.filter(d => d.category === 'Assignment').length;
    const rd = data.filter(d => d.category === 'Reading / Resource').length;
    const done = data.filter(d => d.status.toLowerCase().includes('submitted')).length;
    const pend = total - done;
    return { total, cw, rd, done, pend };
  }

  function render() {
    const c = counts();

    // Stats
    $('#stats').html(`
      <div class="s-card sc-total"><div class="s-val">${c.total}</div><div class="s-lbl">Total</div></div>
      <div class="s-card sc-cw"><div class="s-val">${c.cw}</div><div class="s-lbl">Coursework</div></div>
      <div class="s-card sc-rd"><div class="s-val">${c.rd}</div><div class="s-lbl">Readings</div></div>
      <div class="s-card sc-done"><div class="s-val">${c.done}</div><div class="s-lbl">Submitted</div></div>
      <div class="s-card sc-pend"><div class="s-val">${c.pend}</div><div class="s-lbl">Pending</div></div>
    `);

    // Progress bar
    const pct = c.total > 0 ? Math.round((c.done / c.total) * 100) : 0;
    $('#progress-fill').css('width', pct + '%');
    $('#progress-label').text(pct + '% complete (' + c.done + '/' + c.total + ')');

    renderCards();
  }

  function filtered() {
    const q = $('#search').val().toLowerCase();
    return data.filter(item => {
      if (!item.title.toLowerCase().includes(q)) return false;
      if (activeFilter === 'all') return true;
      if (activeFilter === 'assignment') return item.category === 'Assignment';
      if (activeFilter === 'reading') return item.category === 'Reading / Resource';
      if (activeFilter === 'submitted') return item.status.toLowerCase().includes('submitted');
      if (activeFilter === 'pending') return !item.status.toLowerCase().includes('submitted');
      return true;
    });
  }

  function renderCards() {
    const list = filtered();

    if (!list.length) {
      $('#grid').html('');
      $('#empty').show();
      return;
    }
    $('#empty').hide();

    const html = list.map(item => {
      const isReading = item.category === 'Reading / Resource';
      const catLabel = isReading ? 'Reading' : 'Assignment';

      let badgeCls = 'badge-pending', badgeTxt = 'Pending';
      if (item.status.toLowerCase().includes('submitted')) {
        badgeCls = 'badge-done';
        badgeTxt = item.status;
      } else if (item.status.toLowerCase().includes('locked')) {
        badgeCls = 'badge-locked';
        badgeTxt = 'Locked';
      }

      return `
        <div class="card">
          <div class="card-header">
            <a href="${item.url}" target="_blank" rel="noopener" class="card-title">${item.title}</a>
            <span class="badge ${badgeCls}">${badgeTxt}</span>
          </div>
          <div class="card-meta">
            <span class="card-cat">${catLabel}</span>
            <span class="card-sep">•</span>
            <span class="card-due">Due: ${item.dueDate}</span>
          </div>
        </div>`;
    }).join('');

    $('#grid').html(html);
  }

  function bind() {
    $('#search').on('input', renderCards);

    $(document).on('click', '.pill', function () {
      $('.pill').removeClass('active');
      $(this).addClass('active');
      activeFilter = $(this).data('f');
      renderCards();
    });
  }
});
