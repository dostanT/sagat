(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // A hairline under the header once the page has moved.
  const header = document.querySelector('[data-header]');
  if (header) {
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  // Sections ease in as they scroll into view.
  const revealables = document.querySelectorAll('[data-reveal]');
  if (revealables.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealables.forEach((el) => el.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
      );
      revealables.forEach((el) => observer.observe(el));
    }
  }

  // The timer on the phone is derived from an end time, the way the app does it:
  // nothing is counted, so a hidden tab or a slow frame can't make it drift.
  const demo = document.querySelector('[data-demo-timer]');
  if (demo && !reduceMotion) {
    const LENGTH = 25 * 60 * 1000;
    let end = Date.now() + (24 * 60 + 37) * 1000;
    let shown = '';

    const paint = () => {
      if (document.hidden) return;
      let left = end - Date.now();
      if (left <= 0) {
        end = Date.now() + LENGTH;
        left = LENGTH;
      }
      const total = Math.ceil(left / 1000);
      const text = String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
      if (text !== shown) {
        demo.textContent = text;
        shown = text;
      }
    };

    paint();
    window.setInterval(paint, 250);
  }

  // Legal pages: mark the section that is in view in the table of contents.
  const toc = document.querySelector('[data-toc]');
  if (toc && 'IntersectionObserver' in window) {
    const links = new Map(
      [...toc.querySelectorAll('a[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), a]),
    );
    const sections = [...links.keys()].map((id) => document.getElementById(id)).filter(Boolean);

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => a.classList.remove('is-active'));
          const active = links.get(entry.target.id);
          if (active) active.classList.add('is-active');
        });
      },
      { rootMargin: '-25% 0px -65% 0px' },
    );
    sections.forEach((section) => spy.observe(section));
  }
})();
