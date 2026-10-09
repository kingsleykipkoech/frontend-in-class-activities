document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const categoryBlocks = document.querySelectorAll('.category-block');
  const langBtn = document.getElementById('lang-btn');
  const langMenu = document.getElementById('lang-menu');
  const currentLangText = document.getElementById('current-lang-text');
  const langItems = document.querySelectorAll('.lang-item');

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();

      categoryBlocks.forEach(block => {
        const links = block.querySelectorAll('.service-link');
        let visibleCount = 0;

        links.forEach(link => {
          const text = link.textContent.toLowerCase();
          if (query === '' || text.includes(query)) {
            link.style.display = 'inline-block';
            visibleCount++;
          } else {
            link.style.display = 'none';
          }
        });

        if (visibleCount === 0 && query !== '') {
          block.style.display = 'none';
        } else {
          block.style.display = 'block';
        }
      });
    });
  }

  // Language selector
  if (langBtn && langMenu) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langMenu.classList.toggle('open');
    });

    langItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        langItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentLangText.textContent = item.textContent;
        langMenu.classList.remove('open');
      });
    });

    document.addEventListener('click', () => {
      langMenu.classList.remove('open');
    });
  }
});
