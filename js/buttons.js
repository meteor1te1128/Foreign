/* Foreign · buttons.js */

export function initRipple(btn) {
  btn.addEventListener('click', function(e) {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const r = document.createElement('span');
    r.className = 'ripple';
    r.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });
}

export function initMagnetic(btn, strength = 0.32) {
  btn.addEventListener('mousemove', function(e) {
    const rect = btn.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  btn.addEventListener('mouseleave', function() {
    btn.style.transition = 'transform .4s cubic-bezier(.25,.46,.45,.94)';
    btn.style.transform = '';
    setTimeout(() => { btn.style.transition = ''; }, 420);
  });
}

export function initParticleBurst(btn) {
  btn.addEventListener('click', function(e) {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const dist = 38 + Math.random() * 38;
      const size = 3 + Math.random() * 4;
      const p = document.createElement('div');
      p.style.cssText = `
        position:fixed;border-radius:50%;pointer-events:none;z-index:9999;
        width:${size}px;height:${size}px;
        left:${cx - size/2}px;top:${cy - size/2}px;
        background:rgba(255,255,255,.85);
        transition:transform .5s cubic-bezier(.2,.8,.4,1),opacity .5s ease;
      `;
      document.body.appendChild(p);
      requestAnimationFrame(() => {
        p.style.transform = `translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px) scale(0)`;
        p.style.opacity = '0';
      });
      setTimeout(() => p.remove(), 560);
    }
  });
}

export function initAllButtons() {
  document.querySelectorAll('.btn-primary,.btn-secondary,.btn-nav-ghost,.btn-nav-solid,.btn-modal,.tb').forEach(b => initRipple(b));
  document.querySelectorAll('.btn-nav-ghost,.btn-nav-solid').forEach(b => initMagnetic(b));
  document.querySelectorAll('.btn-primary').forEach(b => initParticleBurst(b));
}
