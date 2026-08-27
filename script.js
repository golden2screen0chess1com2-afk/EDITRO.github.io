// ===== Timeline سینمایی: هماهنگ با موقعیت اسکرول (نه انیمیشن یک‌طرفه) =====
const cineFill = document.getElementById('cineFill');
const cineMarkersEl = document.getElementById('cineMarkers');
const cineMarkerEls = cineMarkersEl ? Array.from(cineMarkersEl.querySelectorAll('.cine-marker')) : [];
const navLinks = Array.from(document.querySelectorAll('.main-nav a[data-nav]'));

const timelineSectionIds = ['home', 'skills', 'services', 'order', 'reveal'];

function getTimelineBounds() {
  const first = document.getElementById(timelineSectionIds[0]);
  const last = document.getElementById(timelineSectionIds[timelineSectionIds.length - 1]);
  if (!first || !last) return null;
  const start = first.offsetTop;
  const end = last.offsetTop + last.offsetHeight;
  return { start, end: Math.max(end, start + 1) };
}

function layoutCineMarkers() {
  const bounds = getTimelineBounds();
  if (!bounds) return;
  cineMarkerEls.forEach((marker) => {
    const targetId = marker.getAttribute('data-target');
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;
    const center = targetEl.offsetTop + targetEl.offsetHeight / 2;
    const pct = ((center - bounds.start) / (bounds.end - bounds.start)) * 100;
    marker.style.setProperty('--pos', `${Math.min(Math.max(pct, 2), 98)}%`);
  });
}

function updateCineTimeline() {
  const bounds = getTimelineBounds();
  if (!bounds || !cineFill) return;
  const viewportRef = window.scrollY + window.innerHeight * 0.4;
  const progress = Math.min(Math.max((viewportRef - bounds.start) / (bounds.end - bounds.start), 0), 1);
  cineFill.style.setProperty('--fill', `${progress * 100}%`);
}

function updateActiveSection() {
  const viewportRef = window.scrollY + window.innerHeight * 0.4;
  let currentId = timelineSectionIds[0];

  timelineSectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.offsetTop <= viewportRef) {
      currentId = id;
    }
  });

  // بخش راه‌های ارتباطی هم برای منو در نظر گرفته شود (بعد از پایان Timeline)
  const contactEl = document.getElementById('contact');
  if (contactEl && contactEl.offsetTop <= viewportRef) {
    currentId = 'contact';
  }

  cineMarkerEls.forEach((marker) => {
    marker.classList.toggle('is-active', marker.getAttribute('data-target') === currentId);
  });

  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('data-nav') === currentId);
  });
}

function updateCineFx() {
  updateCineTimeline();
  updateActiveSection();
}

window.addEventListener('resize', layoutCineMarkers);
window.addEventListener('load', () => {
  layoutCineMarkers();
  updateCineFx();
});
layoutCineMarkers();

// ===== اسکرول نرم با احتساب ارتفاع هدر ثابت =====
const headerOffsetEl = document.querySelector('.site-header');
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href').slice(1);
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;
    e.preventDefault();
    const headerH = headerOffsetEl ? headerOffsetEl.offsetHeight + 12 : 0;
    const top = targetEl.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// سال جاری در فوتر
document.getElementById('year').textContent = new Date().getFullYear();

// منوی موبایل
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// نوار پیشرفت اسکرول + تایم‌کد نمادین (عناصر امضادار طراحی)
const tcDisplay = document.getElementById('tc-display');
const scrubHead = document.getElementById('scrubHead');

function pad(num) {
  return String(num).padStart(2, '0');
}

function updateScrollFx() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

  if (scrubHead) {
    const trackWidth = window.innerWidth;
    const headWidth = scrubHead.offsetWidth || 56;
    const maxLeft = Math.max(trackWidth - headWidth, 0);
    scrubHead.style.left = `${progress * maxLeft}px`;
  }

  if (tcDisplay) {
    const totalFrames = Math.floor(progress * 60 * 30); // شبیه‌سازی 30fps در بازه ۶۰ ثانیه
    const frames = totalFrames % 30;
    const totalSeconds = Math.floor(totalFrames / 30);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);
    tcDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
  }
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateScrollFx();
      updateCineFx();
      ticking = false;
    });
    ticking = true;
  }
});

window.addEventListener('resize', updateScrollFx);

updateScrollFx();
updateCineFx();

// انیمیشن ظاهرشدن بخش‌ها هنگام اسکرول
const revealEls = document.querySelectorAll('.reveal-up');

if ('IntersectionObserver' in window && revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => observer.observe(el));

  // اطمینان: اگر به هر دلیلی المانی هیچ‌وقت is-visible نشد، بعد از کمی تاخیر نمایش داده شود
  window.setTimeout(() => {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }, 2500);
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}
