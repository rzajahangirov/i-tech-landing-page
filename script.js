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
  const closeMenu = () => {
    mobilePanel.classList.remove('open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    burgerIcon.innerHTML = '<use href="#i-menu"/>';
  };

  burgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = mobilePanel.classList.toggle('open');
    burgerBtn.setAttribute('aria-expanded', open);
    burgerIcon.innerHTML = open ? '<use href="#i-close"/>' : '<use href="#i-menu"/>';
  });

  mobilePanel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (mobilePanel.classList.contains('open') && !mobilePanel.contains(e.target) && !burgerBtn.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobilePanel.classList.contains('open')) {
      closeMenu();
    }
  });
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

// ---- Contact Form Handler ----
const GOOGLE_SHEETS_WEBHOOK_URL = (typeof CONFIG !== 'undefined' && CONFIG.GOOGLE_SHEETS_WEBHOOK_URL)
  ? CONFIG.GOOGLE_SHEETS_WEBHOOK_URL
  : 'https://script.google.com/macros/s/AKfycbzjlyNKca6ZhONnbYCCgMjKTb85gypXm6p-fdExK6dITyIY86JXYCMmRikREsaC6LldqA/exec'; 

const ctaForm = document.getElementById('ctaForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn = document.getElementById('submitBtn');

async function sendToGoogleSheets(url, data) {
  if (!url) return;

  const params = new URLSearchParams();
  params.append('fullName', data.fullName || '');
  params.append('contactInfo', data.contactInfo || '');
  params.append('projectNote', data.projectNote || '');

  // 1. Send via POST (application/x-www-form-urlencoded)
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString(),
      mode: 'no-cors'
    });
  } catch (err) {
    // 2. Fallback: Send via GET query parameters
    try {
      await fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        mode: 'no-cors'
      });
    } catch (e) {
      console.error('Google Sheets submission failed:', e);
    }
  }
}

if (ctaForm) {
  ctaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(ctaForm);
    const data = Object.fromEntries(formData.entries());

    if (submitBtn) {
      submitBtn.disabled = true;
      const btnSpan = submitBtn.querySelector('span');
      if (btnSpan) btnSpan.textContent = 'Submitting...';
    }

    try {
      await sendToGoogleSheets(GOOGLE_SHEETS_WEBHOOK_URL, data);

      if (formSuccess) {
        formSuccess.style.display = 'block';
        formSuccess.textContent = "✓ Request received! We'll get back to you shortly.";
      }
      ctaForm.reset();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        if (formSuccess) formSuccess.style.display = 'none';
      }, 6000);

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          const btnSpan = submitBtn.querySelector('span');
          if (btnSpan) btnSpan.textContent = 'Submit Request';
        }
      }, 1000);
    }
  });
}

