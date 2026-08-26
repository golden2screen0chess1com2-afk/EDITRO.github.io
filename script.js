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
      ticking = false;
    });
    ticking = true;
  }
});

window.addEventListener('resize', updateScrollFx);

updateScrollFx();

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
