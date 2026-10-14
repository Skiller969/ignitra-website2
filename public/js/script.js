document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobile-menu');

  function closeMenu() {
    mobileMenu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  }

  menuButton.addEventListener('click', () => {
    const opening = mobileMenu.hidden;
    mobileMenu.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  const form = document.getElementById('registrationForm');
  const message = document.getElementById('formMessage');
  const button = form.querySelector('button[type="submit"]');
  const buttonText = document.getElementById('btnText');
  const loader = document.getElementById('btnLoader');

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    message.hidden = true;
    message.className = 'form-message';
    button.disabled = true;
    buttonText.textContent = 'Sending...';
    loader.hidden = false;

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not send your enquiry. Please try again.');
      message.textContent = 'Thanks for reaching out! Your enquiry has been received.';
      message.classList.add('success');
      form.reset();
    } catch (error) {
      message.textContent = error.message || 'Something went wrong. Please try again.';
      message.classList.add('error');
    } finally {
      message.hidden = false;
      button.disabled = false;
      buttonText.textContent = 'Send enquiry ↗';
      loader.hidden = true;
    }
  });
});
