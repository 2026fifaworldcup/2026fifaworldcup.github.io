(() => {
  const root = document.documentElement;
  const preferred = localStorage.getItem('wc-lang') || root.lang || 'en';
  const current = preferred === 'ko' ? 'ko' : 'en';

  function apply(lang) {
    const safeLang = lang === 'ko' ? 'ko' : 'en';
    root.lang = safeLang;
    document.body.dataset.lang = safeLang;
    localStorage.setItem('wc-lang', safeLang);

    document.querySelectorAll('[data-en], [data-ko]').forEach((el) => {
      const value = el.dataset[safeLang];
      if (value !== undefined) el.textContent = value;
    });

    document.querySelectorAll('[data-label-en], [data-label-ko]').forEach((el) => {
      const value = el.dataset[`label${safeLang === 'ko' ? 'Ko' : 'En'}`];
      if (value !== undefined) el.setAttribute('aria-label', value);
    });

    const title = document.body.dataset[`title${safeLang === 'ko' ? 'Ko' : 'En'}`];
    if (title) document.title = title;

    const desc = document.body.dataset[`description${safeLang === 'ko' ? 'Ko' : 'En'}`];
    if (desc) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
    }

    document.querySelectorAll('.lang-btn').forEach((btn) => {
      const active = btn.dataset.lang === safeLang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('.lang-btn');
    if (!btn) return;
    apply(btn.dataset.lang);
  });

  apply(current);
})();
