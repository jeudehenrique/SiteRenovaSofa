/* =========================================================
   Renova Sofá — interações
   ========================================================= */

// WhatsApp: número (DDI + DDD + número, só dígitos) e mensagem padrão de todos os botões
const WHATSAPP_NUMBER = '5538999024095';
const WHATSAPP_MESSAGE = 'Olá, vim do site da Renova Sofá e gostaria de solicitar um orçamento. Pode me ajudar?';

document.addEventListener('DOMContentLoaded', () => {
  // Todos os botões de WhatsApp/orçamento abrem a mesma conversa
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  document.querySelectorAll('.js-wa').forEach(el => {
    el.href = waLink;
    el.target = '_blank';
    el.rel = 'noopener';
  });

  // Header ao rolar
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menu mobile
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    menu.classList.remove('open');
    document.body.style.overflow = '';
  }));

  // Animação de entrada (com leve atraso em cascata)
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = [...entry.target.parentElement.children].filter(c => c.classList.contains('reveal'));
      entry.target.style.transitionDelay = `${Math.min(siblings.indexOf(entry.target), 5) * 90}ms`;
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Linha do tempo do método: desenha a linha dourada ao aparecer
  const method = document.querySelector('.method');
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    method.classList.add('drawn');
    obs.disconnect();
  }, { threshold: 0.4 }).observe(method);

  // Contadores
  const counterIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target, target = +el.dataset.count, start = performance.now(), dur = 1800;
      const tick = now => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${el.dataset.prefix || ''}${Math.round(target * eased).toLocaleString('pt-BR')}${el.dataset.suffix || ''}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => counterIO.observe(el));

  // Bolhas no hero
  const bubbles = document.getElementById('bubbles');
  for (let i = 0; i < 18; i++) {
    const b = document.createElement('span');
    const size = 8 + Math.random() * 34;
    Object.assign(b.style, {
      width: `${size}px`, height: `${size}px`,
      left: `${Math.random() * 100}%`,
      animationDuration: `${10 + Math.random() * 14}s`,
      animationDelay: `${-Math.random() * 20}s`,
    });
    bubbles.appendChild(b);
  }

  // Antes / depois
  const ba = document.getElementById('heroBA');
  const range = ba.querySelector('.ba-range');
  const setPos = v => ba.style.setProperty('--pos', `${v}%`);
  range.addEventListener('input', e => setPos(e.target.value));
  // pequena demonstração automática ao carregar
  let demo = 0;
  const demoAnim = setInterval(() => {
    demo += 0.04;
    const v = 50 + Math.sin(demo) * 22;
    setPos(v); range.value = v;
    if (demo > Math.PI * 2) { clearInterval(demoAnim); setPos(50); range.value = 50; }
  }, 16);
  range.addEventListener('pointerdown', () => clearInterval(demoAnim), { once: true });

  // Carrossel de trabalhos realizados — faixa infinita
  const carousel = document.getElementById('carousel');
  const track = carousel.querySelector('.car-track');
  const slides = [...track.children];
  slides.forEach((s, n) => s.dataset.i = n);
  // duplica as fotos para o loop não ter emenda
  slides.forEach(s => {
    const clone = s.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
  // velocidade constante (px por segundo), independente do tamanho da tela
  const SPEED = 45;
  const setSpeed = () => carousel.style.setProperty('--dur', `${track.scrollWidth / 2 / SPEED}s`);
  track.querySelectorAll('img').forEach(img => img.addEventListener('load', setSpeed));
  window.addEventListener('resize', setSpeed);
  setSpeed();
  track.addEventListener('click', e => {
    const slide = e.target.closest('.car-slide');
    if (slide) open(+slide.dataset.i);
  });

  // Lightbox (fotos dos trabalhos realizados)
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('img');
  const lbCap = lb.querySelector('figcaption');
  let current = 0;
  const show = i => {
    current = (i + slides.length) % slides.length;
    const img = slides[current].querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    const cap = slides[current].querySelector('figcaption');
    lbCap.textContent = `${cap.querySelector('strong').textContent} · ${cap.querySelector('span').textContent}`;
  };
  function open(i) { show(i); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); carousel.classList.add('paused'); }
  const close = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); carousel.classList.remove('paused'); };
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => show(current - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => show(current + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // Carrossel de cards de serviço
  const sc = document.getElementById('svcCarousel');
  const scTrack = sc.querySelector('.sc-track');
  const scCards = [...scTrack.children];
  const scDots = sc.querySelector('.sc-dots');
  const SC_INTERVAL = 3800;
  let scStep = 0, scMax = 0, scPaused = false, scVisible = false;

  const scSync = () => {
    const i = Math.round(scTrack.scrollLeft / scStep);
    [...scDots.children].forEach((d, n) => d.classList.toggle('active', n === i));
  };
  const scMeasure = () => {
    const gap = parseFloat(getComputedStyle(scTrack).columnGap) || 0;
    scStep = scCards[0].offsetWidth + gap;
    scMax = scTrack.scrollWidth - scTrack.clientWidth;
    const pages = Math.round(scMax / scStep) + 1;
    if (scDots.children.length !== pages) {
      scDots.innerHTML = '';
      for (let i = 0; i < pages; i++) {
        const b = document.createElement('button');
        b.setAttribute('aria-label', `Ir para o card ${i + 1}`);
        b.addEventListener('click', () => scTrack.scrollTo({ left: i * scStep }));
        scDots.appendChild(b);
      }
    }
    scSync();
  };
  const scNext = () => {
    if (scPaused || !scVisible || document.hidden) return;
    if (scTrack.scrollLeft >= scMax - 5) scTrack.scrollTo({ left: 0 });
    else scTrack.scrollTo({ left: Math.round(scTrack.scrollLeft / scStep + 1) * scStep });
  };

  scTrack.addEventListener('scroll', scSync, { passive: true });
  sc.addEventListener('mouseenter', () => scPaused = true);
  sc.addEventListener('mouseleave', () => scPaused = false);
  sc.addEventListener('touchstart', () => scPaused = true, { passive: true });
  sc.addEventListener('touchend', () => setTimeout(() => scPaused = false, 4000));
  new IntersectionObserver(([e]) => scVisible = e.isIntersecting, { threshold: 0.3 }).observe(sc);
  setInterval(scNext, SC_INTERVAL);

  // arrastar com o mouse
  let dragX = null, dragLeft = 0, dragMoved = false;
  scTrack.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    dragX = e.clientX; dragLeft = scTrack.scrollLeft; dragMoved = false;
  });
  window.addEventListener('pointermove', e => {
    if (dragX === null) return;
    const dx = e.clientX - dragX;
    if (Math.abs(dx) > 5) { dragMoved = true; scTrack.classList.add('dragging'); }
    if (dragMoved) scTrack.scrollLeft = dragLeft - dx;
  });
  window.addEventListener('pointerup', () => {
    if (dragX === null) return;
    dragX = null;
    if (dragMoved) {
      scTrack.classList.remove('dragging');
      scTrack.scrollTo({ left: Math.round(scTrack.scrollLeft / scStep) * scStep });
    }
  });
  scTrack.addEventListener('click', e => { if (dragMoved) { e.preventDefault(); dragMoved = false; } }, true);

  window.addEventListener('resize', scMeasure);
  scCards.forEach(c => c.querySelector('img').addEventListener('load', scMeasure, { once: true }));
  scMeasure();

  // Depoimentos — faixa infinita
  const rvBox = document.getElementById('reviews');
  const rvTrack = rvBox.querySelector('.rv-track');
  [...rvTrack.children].forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    rvTrack.appendChild(clone);
  });
  const RV_SPEED = 40; // px por segundo
  const rvSetSpeed = () => rvBox.style.setProperty('--dur', `${rvTrack.scrollWidth / 2 / RV_SPEED}s`);
  window.addEventListener('resize', rvSetSpeed);
  rvSetSpeed();

  // Balão do WhatsApp aparece por alguns segundos
  const waFloat = document.querySelector('.wa-float');
  setTimeout(() => { waFloat.classList.add('peek'); setTimeout(() => waFloat.classList.remove('peek'), 4000); }, 3500);

  document.getElementById('year').textContent = new Date().getFullYear();
});
