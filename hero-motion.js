// Fundo cinematográfico interativo para a capa do portfólio DS Digital.
// Canvas 2D: sem bibliotecas, vídeos externos ou arquivos pesados.
(() => {
  const hero = document.querySelector('.hero');
  const layer = hero?.querySelector('.hero-motion-layer');
  const canvas = document.getElementById('hero-motion-canvas');
  if (!hero || !layer || !canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobilePointer = window.matchMedia('(pointer: coarse)').matches;
  const pointer = { x: 0.68, y: 0.5, targetX: 0.68, targetY: 0.5, inside: false };
  let width = 1;
  let height = 1;
  let rafId = null;
  let lastFrame = 0;
  let inView = true;

  const noise = n => {
    const value = Math.sin(n * 127.1 + 38.23) * 43758.5453;
    return value - Math.floor(value);
  };

  function paint(seconds) {
    ctx.clearRect(0, 0, width, height);
    const time = motionQuery.matches ? 0 : seconds;
    const lines = mobilePointer ? 17 : 29;
    const speed = mobilePointer ? 0.65 : 1;

    // Tramas de luz fluidas, com deslocamento suave ao aproximar o mouse.
    for (let i = 0; i < lines; i++) {
      const v = i / (lines - 1);
      const distance = Math.abs(v - 0.5);
      const opacity = (0.055 + (1 - distance * 1.2) * 0.085).toFixed(3);
      ctx.beginPath();
      for (let x = -18; x <= width + 18; x += 9) {
        const u = x / width;
        const nearPointer = Math.exp(-Math.pow((u - pointer.x) * 4.2, 2));
        const wave = Math.sin(u * 4.7 - time * 0.28 * speed + v * 2.45) * height * 0.082
          + Math.sin(u * 9.8 + time * 0.39 * speed + v * 5.3) * height * 0.017;
        const displacement = pointer.inside
          ? (pointer.y - 0.5) * height * 0.14 * nearPointer
          : 0;
        const y = height * (0.45 + (v - 0.5) * 0.48) + wave + displacement;
        if (x === -18) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = i % 6 === 0
        ? 'rgba(160,218,255,' + (Number(opacity) + 0.055).toFixed(3) + ')'
        : 'rgba(65,151,225,' + opacity + ')';
      ctx.lineWidth = i % 6 === 0 ? 1.25 : 0.8;
      ctx.stroke();
    }

    // Fios mais vivos sugerem movimento de vídeo, sem comprometer legibilidade.
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 3; i++) {
      const phase = i * 1.35;
      ctx.beginPath();
      for (let x = -12; x < width + 16; x += 8) {
        const u = x / width;
        const pointerPull = pointer.inside
          ? Math.exp(-Math.pow((u - pointer.x) * 3.7, 2)) * (pointer.y - 0.5) * height * 0.13
          : 0;
        const y = height * (0.54 + i * 0.062)
          + Math.sin(u * 4.0 - time * 0.32 + phase) * height * 0.13
          + Math.sin(u * 10 + time * 0.27 + phase) * height * 0.018
          + pointerPull;
        if (x === -12) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = ['rgba(90,183,255,.25)', 'rgba(134,206,255,.18)', 'rgba(42,143,236,.17)'][i];
      ctx.lineWidth = 1.15;
      ctx.shadowColor = '#55aaff';
      ctx.shadowBlur = mobilePointer ? 6 : 12;
      ctx.stroke();
    }
    ctx.restore();

    // Pontos sutis ao fundo, reproduzíveis sem Math.random por frame.
    const specks = mobilePointer ? 20 : 48;
    for (let i = 0; i < specks; i++) {
      const x = noise(i + 1) * width;
      const y = (noise(i + 81) * height + Math.sin(time * 0.19 + i) * 6 + height) % height;
      const alpha = 0.08 + noise(i + 147) * 0.25;
      ctx.fillStyle = 'rgba(163,216,250,' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(x, y, 0.5 + noise(i + 208) * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function resize() {
    const rect = layer.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    const ratio = Math.min(window.devicePixelRatio || 1, mobilePointer ? 1.35 : 1.7);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    paint(0);
  }

  function frame(timestamp) {
    rafId = requestAnimationFrame(frame);
    const interval = mobilePointer ? 1000 / 30 : 1000 / 45;
    if (timestamp - lastFrame < interval) return;
    lastFrame = timestamp;
    pointer.x += (pointer.targetX - pointer.x) * 0.075;
    pointer.y += (pointer.targetY - pointer.y) * 0.075;
    layer.style.setProperty('--hero-x', (pointer.x * 100).toFixed(2) + '%');
    layer.style.setProperty('--hero-y', (pointer.y * 100).toFixed(2) + '%');
    paint(timestamp / 1000);
  }

  function updateAnimation() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (motionQuery.matches || document.hidden || !inView) {
      paint(0);
      return;
    }
    lastFrame = 0;
    rafId = requestAnimationFrame(frame);
  }

  if (!mobilePointer) {
    hero.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const bounds = layer.getBoundingClientRect();
      pointer.inside = true;
      pointer.targetX = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      pointer.targetY = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
    }, { passive: true });

    hero.addEventListener('pointerleave', () => {
      pointer.inside = false;
      pointer.targetX = 0.68;
      pointer.targetY = 0.5;
    });
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(layer);
  } else {
    window.addEventListener('resize', resize, { passive: true });
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0]?.isIntersecting ?? false;
      updateAnimation();
    }, { threshold: 0.01 }).observe(hero);
  }
  document.addEventListener('visibilitychange', updateAnimation);
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', updateAnimation);
  else motionQuery.addListener(updateAnimation);

  resize();
  updateAnimation();
})();
