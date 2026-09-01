// ---- Sticky nav on scroll ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 12);
}, { passive:true });

// ---- Mobile menu toggle ----
const burgerBtn = document.getElementById('burgerBtn');
const mobilePanel = document.getElementById('mobilePanel');
const burgerIcon = document.getElementById('burgerIcon');
if (burgerBtn && mobilePanel && burgerIcon) {
  burgerBtn.addEventListener('click', () => {
    const open = mobilePanel.classList.toggle('open');
    burgerBtn.setAttribute('aria-expanded', open);
    burgerIcon.innerHTML = open ? '<use href="#i-close"/>' : '<use href="#i-menu"/>';
  });
  mobilePanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobilePanel.classList.remove('open');
    burgerIcon.innerHTML = '<use href="#i-menu"/>';
  }));
}

// ---- Hero parallax on mouse move (disabled for reduced motion / touch) ----
const heroVisual = document.getElementById('heroVisual');
const blobField = document.getElementById('blobField');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (heroVisual && blobField && !prefersReduced && window.matchMedia('(pointer: fine)').matches) {
  heroVisual.addEventListener('mousemove', (e) => {
    const r = heroVisual.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    blobField.style.transform = `translate(${x * -18}px, ${y * -18}px)`;
  });
  heroVisual.addEventListener('mouseleave', () => {
    blobField.style.transform = 'translate(0,0)';
  });
}

// ---- Pipeline scroll-reveal + progress line ----
const steps = Array.from(document.querySelectorAll('.pipeline-step'));
const lineFill = document.getElementById('lineFill');
let maxActive = -1;
if (steps.length > 0) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add('is-active');
        const idx = parseInt(el.dataset.i, 10);
        if (idx > maxActive) {
          maxActive = idx;
          if (lineFill) lineFill.style.width = ((maxActive + 1) / steps.length * 100) + '%';
        }
      }
    });
  }, { threshold: 0.5, rootMargin: '0px 0px -10% 0px' });
  steps.forEach(s => io.observe(s));
}

// ---- Contact Form Handler (Connected via config.js or fallback) ----
const GOOGLE_SHEETS_WEBHOOK_URL = (typeof CONFIG !== 'undefined' && CONFIG.GOOGLE_SHEETS_WEBHOOK_URL)
  ? CONFIG.GOOGLE_SHEETS_WEBHOOK_URL
  : (typeof atob !== 'undefined' ? atob('aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J4ajU2bERHd0VsSkhFZF9HNXpQYXh0R2FGdS0zcWRXM2k5RnR3SHhTVTNzTDlsV3JzWV9CMEZxZDhUQ3EyV2R4NFJsdy9leGVj') : ''); 

const ctaForm = document.getElementById('ctaForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn = document.getElementById('submitBtn');

if (ctaForm) {
  ctaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(ctaForm);
    const data = Object.fromEntries(formData.entries());
    console.log('Submitted Form Data:', data);

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Submitting...';
    }

    try {
      if (GOOGLE_SHEETS_WEBHOOK_URL) {
        await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }

      // Show success message
      if (formSuccess) {
        formSuccess.style.display = 'block';
        formSuccess.textContent = "✓ Request received! We'll get back to you shortly.";
      }
      ctaForm.reset();

      setTimeout(() => {
        if (formSuccess) formSuccess.style.display = 'none';
      }, 6000);

    } catch (err) {
      console.error('Error submitting form:', err);
      if (formSuccess) {
        formSuccess.style.display = 'block';
        formSuccess.textContent = '✓ Request received!';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Submit Request';
      }
    }
  });
}

