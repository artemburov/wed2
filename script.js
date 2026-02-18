// ===== 100dvh коррекция для мобильных =====
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setVH();
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);

// ===== Глобальные переменные =====
let currentSection = 0;
let isAnimating = false;
let sections = [];
const ANIMATION_DURATION = 600;
const scrollHintState = new Map(); // Хранит состояние подсказок по индексам секций

// ===== Скрытие подсказки прокрутки для текущей секции =====
function hideScrollHintForCurrent() {
  const activePage = document.querySelector('.page.active');
  if (!activePage) return;
  const hint = activePage.querySelector('[data-page-scroll-hint]');
  const pageIndex = Array.from(sections).indexOf(activePage);
  if (hint && !scrollHintState.has(pageIndex)) {
    hint.classList.add('hidden');
    scrollHintState.set(pageIndex, true);
  }
}

// ===== Показ подсказки при переходе на секцию =====
function showScrollHintForSection(index) {
  if (index < 0 || index >= sections.length) return;
  const page = sections[index];
  const hint = page?.querySelector('[data-page-scroll-hint]');
  if (hint && !scrollHintState.has(index)) {
    hint.classList.remove('hidden');
  }
}

// ===== Инициализация =====
document.addEventListener('DOMContentLoaded', () => {
  sections = document.querySelectorAll('.page');
  if (sections.length > 0) {
    sections[0].classList.add('active');
  }
  updateScrollDots(0);

  // ===== Форма =====
  const radios = document.querySelectorAll('input[name="attending"]');
  const guests = document.getElementById('guestsSection');
  const wishesSection = document.getElementById('wishesSection');

  function toggleGuests() {
    const checked = document.querySelector('input[name="attending"]:checked');
    const isYes = checked?.value === 'yes';
    if (guests) guests.style.display = isYes ? 'block' : 'none';
    if (wishesSection) wishesSection.style.display = isYes ? 'block' : 'none';
  }

  radios.forEach(r => r.addEventListener('change', toggleGuests));
  toggleGuests();

  const form = document.getElementById('rsvpForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const firstName = name.split(' ')[0] || 'Друг';
    const attending = document.querySelector('input[name="attending"]:checked')?.value;

    document.querySelector('#thanks .thanks-title').textContent = `Спасибо, ${firstName}!`;
    const thanksText = document.querySelector('#thanks p');
    if (thanksText) {
      thanksText.textContent = attending === 'yes'
        ? 'До встречи на празднике 💕'
        : 'Спасибо за ответ 🙏';
    }

    scrollToSection(5); // Индекс секции #thanks = 5
    form.reset();
    toggleGuests();
  });

  // Плавные якорные ссылки
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#home') {
        e.preventDefault();
        scrollToSection(0);
        return;
      }
      const targetIndex = Array.from(sections).findIndex(s => s.id === targetId.substring(1));
      if (targetIndex !== -1) {
        e.preventDefault();
        scrollToSection(targetIndex);
      }
    });
  });

  // События для скрытия подсказок
  window.addEventListener('wheel', hideScrollHintForCurrent, { passive: true });
  window.addEventListener('touchstart', hideScrollHintForCurrent, { passive: true });
  window.addEventListener('keydown', hideScrollHintForCurrent);
});

// ===== Таймер =====
const weddingDate = new Date('August 8, 2026 17:00:00').getTime();
const timerInterval = setInterval(() => {
  const now = new Date().getTime();
  const distance = weddingDate - now;
  if (distance < 0) {
    clearInterval(timerInterval);
    const timer = document.getElementById("timer");
    if (timer) {
      timer.innerHTML = `<div style="font-family:'Pacifico',cursive;font-size:clamp(1.3rem,4vw,1.9rem);color:var(--primary);">Мы женимся! 💕</div>`;
    }
    return;
  }
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  const pad = n => String(n).padStart(2, '0');
  document.getElementById("days").textContent = pad(days);
  document.getElementById("hours").textContent = pad(hours);
  document.getElementById("minutes").textContent = pad(minutes);
  document.getElementById("seconds").textContent = pad(seconds);
}, 1000);

// ===== Слайдер =====
let slideIndex = 1;
showSlides(slideIndex);
function moveSlide(n) { showSlides(slideIndex += n); }
function currentSlide(n) { showSlides(slideIndex = n); }
function showSlides(n) {
  const slides = document.getElementsByClassName("slide");
  const dots = document.getElementsByClassName("dot");
  if (!slides.length) return;
  if (n > slides.length) slideIndex = 1;
  if (n < 1) slideIndex = slides.length;
  const wrapper = document.querySelector('.slider-wrapper');
  if (wrapper) {
    wrapper.style.transform = `translateX(-${(slideIndex - 1) * 100}%)`;
  }
  for (let i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  if (dots[slideIndex - 1]) {
    dots[slideIndex - 1].className += " active";
  }
}

// Авто-слайдер
let slideInterval;
function startAuto() { slideInterval = setInterval(() => moveSlide(1), 6000); }
function stopAuto() { clearInterval(slideInterval); }
const slider = document.querySelector('.slider-container');
if (slider) {
  slider.addEventListener('touchstart', stopAuto, { passive: true });
  slider.addEventListener('mouseenter', stopAuto);
  slider.addEventListener('mouseleave', startAuto);
  slider.addEventListener('touchend', startAuto, { passive: true });
  startAuto();
}

// ===== Переход к секции =====
function scrollToSection(index) {
  if (!sections.length) return;
  if (isAnimating) return;
  if (index < 0) index = 0;
  if (index >= sections.length) index = sections.length - 1;
  if (index === currentSection) return;

  isAnimating = true;
  sections[currentSection].classList.remove('active');

  setTimeout(() => {
    currentSection = index;
    sections.forEach((sec, i) => {
      sec.classList.remove('active');
      if (i === index) sec.classList.add('active');
    });
    updateScrollDots(index);
    showScrollHintForSection(index); // 👈 Показываем подсказку на новой секции

    setTimeout(() => {
      isAnimating = false;
    }, ANIMATION_DURATION);
  }, 100);
}

// ===== Колесо мыши =====
let wheelTimeout;
window.addEventListener('wheel', (e) => {
  if (!sections.length || isAnimating) return;
  clearTimeout(wheelTimeout);
  wheelTimeout = setTimeout(() => {
    const deltaY = e.deltaY;
    const target = e.target.closest('.content-wrapper');
    if (target && target.scrollHeight > target.clientHeight) {
      const atTop = target.scrollTop === 0;
      const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight;
      if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
        if (deltaY > 0) scrollToSection(currentSection + 1);
        else scrollToSection(currentSection - 1);
        return;
      }
    }
    if (deltaY > 0) scrollToSection(currentSection + 1);
    else scrollToSection(currentSection - 1);
  }, 50);
}, { passive: true });

// ===== Свайпы =====
let touchStartY = 0;
let touchEndY = 0;
const SWIPE_THRESHOLD = 50;
window.addEventListener('touchstart', (e) => {
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });
window.addEventListener('touchend', (e) => {
  if (!sections.length || isAnimating) return;
  touchEndY = e.changedTouches[0].screenY;
  const diff = touchStartY - touchEndY;
  if (Math.abs(diff) < SWIPE_THRESHOLD) return;
  const target = e.target.closest('.content-wrapper');
  if (target && target.scrollHeight > target.clientHeight) {
    const atTop = target.scrollTop === 0;
    const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight;
    if ((diff < 0 && atTop) || (diff > 0 && atBottom)) {
      if (diff > 0) scrollToSection(currentSection + 1);
      else scrollToSection(currentSection - 1);
      return;
    }
  }
  if (diff > 0) scrollToSection(currentSection + 1);
  else scrollToSection(currentSection - 1);
}, { passive: true });

// ===== Клавиатура =====
window.addEventListener('keydown', (e) => {
  if (!sections.length || isAnimating) return;
  if (e.key === 'ArrowDown' || e.key === 'PageDown') {
    e.preventDefault();
    scrollToSection(currentSection + 1);
  } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
    e.preventDefault();
    scrollToSection(currentSection - 1);
  }
});

// ===== Индикаторы секций =====
const scrollDots = document.querySelectorAll('.scroll-dot');
function updateScrollDots(index) {
  if (!scrollDots.length) return;
  scrollDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}
scrollDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    scrollToSection(index);
  });
});