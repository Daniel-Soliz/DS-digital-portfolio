// Apenas a imagem de fundo acompanha o scroll e o cursor.
// Não altera as cores, os textos, os cards nem os demais links.
(() => {
  const backdrop = document.createElement('div');
  backdrop.className = 'ds-interactive-background';
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.prepend(backdrop);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;

  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  let pointerX = 0;
  let pointerY = 0;
  let queued = false;

  function render() {
    queued = false;
    const scroll = window.scrollY;
    // Movimento perceptível e limitado: a imagem desliza enquanto a página rola.
    const scrollOffset = Math.sin(scroll / 650) * 78;
    const scrollSide = Math.sin(scroll / 1100) * 30;
    backdrop.style.setProperty('--ds-bg-x', (scrollSide + pointerX).toFixed(1) + 'px');
    backdrop.style.setProperty('--ds-bg-y', (scrollOffset + pointerY).toFixed(1) + 'px');
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(render);
  }
  window.addEventListener('scroll', schedule, { passive:true });
  window.addEventListener('resize', schedule, { passive:true });
  if (!coarsePointer) {
    window.addEventListener('pointermove', event => {
      pointerX = ((event.clientX / window.innerWidth) - .5) * 38;
      pointerY = ((event.clientY / window.innerHeight) - .5) * 30;
      schedule();
    }, { passive:true });
  }
  schedule();
})();
