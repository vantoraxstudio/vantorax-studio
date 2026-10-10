/* Vantorax Studio — script.js
   Navigation · Scroll effects · Reveal · Project modal · Compare slider · FAQ · Pointer effects · Year */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;

  /* Navigation: mobile menu, scroll lock, ESC, close on link */
  var nav = $('.nav'), menu = $('.links'), burger = $('.burger');
  function setMenu(open) {
    if (!menu || !burger) return;
    menu.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    body.classList.toggle('locked', open);
  }
  if (burger) burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.classList.contains('open')) { setMenu(false); if (burger) burger.focus(); }
  });
  addEventListener('resize', function () { if (innerWidth > 960) setMenu(false); });

  /* Scroll: header state, progress bar, parallax (one rAF-throttled handler) */
  var bar = $('.progress'), heroBg = $('.hero-bg'), cta = $('.cta'), ticking = false;
  function update() {
    var y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle('solid', y > 40);
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (!reduce && innerWidth >= 768) {
      if (heroBg && y < innerHeight) heroBg.style.setProperty('--py', y * 0.08 + 'px');
      if (cta) {
        var r = cta.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) cta.style.setProperty('--py', (r.top * -0.08) + 'px');
      }
    }
    ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();

  /* Active navigation link */
  var links = $$('.links a[href^="#"]:not(.btn)');
  if ('IntersectionObserver' in window && links.length) {
    var navIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) navIO.observe(s); });
  }

  /* Reveal on scroll (+ process step activation) */
  var revs = $$('.rev'), steps = $$('.steps li');
  revs.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 0.08 + 's'; });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revs.forEach(function (el) { io.observe(el); });
    var stepIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); stepIO.unobserve(e.target); } });
    }, { threshold: 0.6 });
    steps.forEach(function (el) { stepIO.observe(el); });
  } else {
    revs.forEach(function (el) { el.classList.add('in'); });
    steps.forEach(function (el) { el.classList.add('on'); });
  }

  /* Before / after compare (keyboard and pointer through the range input) */
  var cmp = $('.compare'), range = cmp && $('input', cmp);
  if (range) {
    var setPos = function () { cmp.style.setProperty('--pos', range.value + '%'); range.setAttribute('aria-valuetext', range.value + '% of the page shows the after design'); };
    range.addEventListener('input', setPos); setPos();
  }

  /* FAQ accordion: one open at a time */
  var faq = $('.faq');
  if (faq) faq.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var wasOpen = b.getAttribute('aria-expanded') === 'true';
    $$('button', faq).forEach(function (x) {
      var open = x === b && !wasOpen;
      x.setAttribute('aria-expanded', open);
      var p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.classList.toggle('open', open);
    });
  });

  /* Pointer enhancements: magnetic buttons, hero tilt (fine pointers only) */
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    $$('.mag').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.15) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
    var hero = $('.hero'), fl = $('.hero .float');
    if (hero && fl) hero.addEventListener('pointermove', function (e) {
      fl.style.setProperty('--tx', ((e.clientX / innerWidth - 0.5) * -16) + 'px');
      fl.style.setProperty('--ty', ((e.clientY / innerHeight - 0.5) * -12) + 'px');
    });
  }

  /* Current year */
  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
})();
