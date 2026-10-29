// DS Digital — efeitos de scroll progressivos, sem dependências pesadas.
(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches) return;

  const targets = [
    '.about-intro', '.designer-mark', '.collection-index > h2',
    '.index-frame a', '.projects .section-heading', '.portfolio-card',
    '#servicos .section-heading', '.service-grid article', '.contact > h2',
    '.contact > p', '.social-actions'
  ];
  const elements = document.querySelectorAll(targets.join(','));
  if ('IntersectionObserver' in window) {
    elements.forEach((element, index) => {
      element.dataset.dsReveal = '';
      element.style.setProperty('--ds-delay', ((index % 3) * 75) + 'ms');
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('ds-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin:'0px 0px -8% 0px',threshold:0.08 });
    elements.forEach(element => observer.observe(element));
    document.documentElement.classList.add('ds-motion-ready');
  }

  const progress = document.createElement('div');
  progress.className = 'ds-scroll-progress';
  progress.setAttribute('aria-hidden','true');
  document.body.appendChild(progress);
  const hero = document.querySelector('.hero');
  const mark = document.querySelector('.designer-mark');
  let queued = false;

  function render() {
    queued = false;
    const scrollY = window.scrollY;
    const maxScroll = Math.max(1,document.documentElement.scrollHeight - window.innerHeight);
    progress.style.setProperty('--ds-scroll-progress',Math.min(1,scrollY / maxScroll).toFixed(4));
    if (hero && scrollY < hero.offsetTop + hero.offsetHeight + window.innerHeight) {
      const relative = Math.max(0,scrollY - hero.offsetTop);
      hero.style.setProperty('--ds-hero-shift',Math.min(110,relative * .16).toFixed(1)+'px');
      hero.style.setProperty('--ds-hero-top',Math.min(32,relative * .06).toFixed(1)+'px');
    }
    if (mark) {
      const rect = mark.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const center = rect.top + rect.height/2 - window.innerHeight/2;
        mark.style.setProperty('--ds-mark-shift',Math.max(-22,Math.min(22,-center * .045)).toFixed(1)+'px');
      }
    }
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(render);
  }
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  motion.addEventListener?.('change',() => window.location.reload());
  schedule();
})();
