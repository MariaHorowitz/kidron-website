// Navigation, biographies, portfolio paging and campaign attribution.
const bar = document.querySelector('.topbar');
const toggle = document.querySelector('.menu-toggle');
function closeMenu() {
  bar?.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Open menu');
}
toggle?.addEventListener('click', () => {
  const open = bar.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && bar?.classList.contains('open')) { closeMenu(); toggle.focus(); }
});
document.addEventListener('click', event => { if (bar && !bar.contains(event.target)) closeMenu(); });
matchMedia('(min-width:1121px)').addEventListener('change', closeMenu);

document.querySelectorAll('[data-dialog]').forEach(link => {
  const dialog = document.getElementById(link.dataset.dialog);
  if (!dialog?.showModal) return;
  link.addEventListener('click', event => { event.preventDefault(); dialog.showModal(); });
  dialog.querySelector('.bio__close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
});

document.querySelectorAll('.carousel').forEach(carousel => {
  const track = carousel.querySelector('.carousel__track');
  const dots = carousel.querySelector('.carousel__dots');
  const prev = carousel.querySelector('.carousel__prev');
  const next = carousel.querySelector('.carousel__next');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let positions = [];
  let current = 0;
  const go = index => track.scrollTo({left:positions[Math.max(0,Math.min(index,positions.length - 1))],behavior:reduced.matches?'instant':'smooth'});
  function sync() {
    current = positions.reduce((best,pos,i) => Math.abs(pos-track.scrollLeft) < Math.abs(positions[best]-track.scrollLeft) ? i : best,0);
    [...dots.children].forEach((dot,i) => dot.setAttribute('aria-current',String(i === current)));
    prev.disabled = track.scrollLeft < 2;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  }
  function render() {
    const max = Math.max(0,track.scrollWidth-track.clientWidth);
    const cards = [...track.children];
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const perPage = Math.max(1,Math.floor((track.clientWidth + gap) / (cards[0].getBoundingClientRect().width + gap)));
    positions = [...new Set(cards.filter((_,i)=>i%perPage===0).map(card=>Math.min(card.offsetLeft-cards[0].offsetLeft,max)))];
    dots.replaceChildren(...positions.map((_,i) => {
      const b = document.createElement('button'); b.type='button';
      b.setAttribute('aria-label',`Portfolio page ${i+1}`); b.addEventListener('click',()=>go(i)); return b;
    }));
    sync();
  }
  prev.addEventListener('click',()=>go(current-1));
  next.addEventListener('click',()=>go(current+1));
  track.addEventListener('scroll',()=>requestAnimationFrame(sync),{passive:true});
  track.addEventListener('keydown',event=>{
    if (event.target !== track || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();go(current+(event.key==='ArrowRight'?1:-1));
  });
  new ResizeObserver(render).observe(track);
});

const params = new URLSearchParams(location.search);
document.querySelectorAll('[data-from-param]').forEach(field => { field.value = params.get(field.dataset.fromParam) || ''; });
