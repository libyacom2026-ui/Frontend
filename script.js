const menu = document.getElementById('menu');
const menuBtn = document.getElementById('menuBtn');

if (menu && menuBtn) {
  menuBtn.addEventListener('click', () => menu.classList.toggle('mobile'));
  document.querySelectorAll('.nav-link').forEach(a =>
    a.addEventListener('click', () => menu.classList.remove('mobile'))
  );
}

const slides = [...document.querySelectorAll('.hero-slide')];
const dots = [...document.querySelectorAll('.dots span')];
let current = 0;

function showSlide(i) {
  if (!slides.length) return;
  slides[current]?.classList.remove('active');
  dots[current]?.classList.remove('active');
  current = (i + slides.length) % slides.length;
  slides[current]?.classList.add('active');
  dots[current]?.classList.add('active');
}

const prevSlide = document.getElementById('prevSlide');
const nextSlide = document.getElementById('nextSlide');
if (prevSlide) prevSlide.onclick = () => showSlide(current - 1);
if (nextSlide) nextSlide.onclick = () => showSlide(current + 1);
if (slides.length > 1) setInterval(() => showSlide(current + 1), 6000);

const io = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

const sections = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.menu a');
window.addEventListener('scroll', () => {
  let active = 'home';
  sections.forEach(s => { if (scrollY >= s.offsetTop - 125) active = s.id; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + active));
});

const langBtn = document.getElementById('langBtn');
let lang = 'ar';
function setLang(next) {
  lang = next;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  if (langBtn) langBtn.textContent = lang === 'ar' ? 'EN' : 'AR';
  document.querySelectorAll('[data-ar]').forEach(el => {
    const value = el.dataset[lang];
    if (value !== undefined) el.innerHTML = value;
  });
}
if (langBtn) langBtn.addEventListener('click', () => setLang(lang === 'ar' ? 'en' : 'ar'));

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const statusBox = document.getElementById('formStatus');
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const old = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = document.documentElement.lang === 'ar' ? 'جارٍ الإرسال...' : 'Sending...';
    }
    if (statusBox) {
      statusBox.className = 'form-status';
      statusBox.textContent = '';
    }
    const payload = Object.fromEntries(new FormData(contactForm).entries());
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'failed');
      contactForm.reset();
      if (statusBox) {
        statusBox.className = 'form-status success';
        statusBox.textContent = document.documentElement.lang === 'ar'
          ? 'تم إرسال رسالتك بنجاح.'
          : 'Your message has been sent successfully.';
      }
    } catch (err) {
      if (statusBox) {
        statusBox.className = 'form-status error';
        statusBox.textContent = document.documentElement.lang === 'ar'
          ? 'تعذر إرسال الرسالة. يرجى المحاولة لاحقاً.'
          : 'Unable to send the message. Please try again later.';
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = old;
      }
    }
  });
}
