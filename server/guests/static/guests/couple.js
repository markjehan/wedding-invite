// The couple's guest admin: copying a guest's link, and showing a send at once.
(() => {
  'use strict';
  document.documentElement.classList.add('js');

  // A button's words change through a short blur, so the old and new label never sit on top of
  // each other for a frame.
  const relabel = (button, text, icon) => {
    const words = button.querySelector('span'), use = button.querySelector('use');
    button.classList.add('is-swapping');
    setTimeout(() => {
      if (words && text) words.textContent = text;
      if (use && icon) use.setAttribute('href', icon);
      button.classList.remove('is-swapping');
    }, 120);
  };

  // "Copy link": the guest's full link, ready to paste into any message.
  document.addEventListener('click', async event => {
    const button = event.target.closest('.copy-link');
    if (!button) return;
    const link = new URL(button.dataset.link, location.origin).href;
    button.label ??= button.getAttribute('aria-label');
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt('Copy this link:', link);
      return;
    }
    relabel(button, 'Copied', '#i-check');
    button.setAttribute('aria-label', 'Copied');
    clearTimeout(button.reset);
    button.reset = setTimeout(() => {
      relabel(button, 'Copy link', '#i-copy');
      if (button.label) button.setAttribute('aria-label', button.label);
      else button.removeAttribute('aria-label');
    }, 1600);
  });

  // Send and Remind open WhatsApp in a new tab and the server notes it. The row says so straight
  // away rather than waiting for the next visit: the button settles into what was done, and the
  // guest's step softens over to its new words.
  document.addEventListener('submit', event => {
    const form = event.target.closest('.send-form');
    if (!form) return;
    const button = form.querySelector('button');
    const reminder = form.querySelector('[name=kind]');
    setTimeout(() => {
      button.classList.add('is-done');
      relabel(button, button.dataset.done, '#i-check');
      const stage = form.closest('tr, li, .invitation-panel')?.querySelector('[data-stage]');
      if (!stage || reminder || form.classList.contains('is-resend')) return;  // sending again moves no one back
      stage.classList.add('is-changing');
      setTimeout(() => {
        stage.className = 'stage is-sent';
        stage.innerHTML = '<span class="diamond" aria-hidden="true"></span>Sent today, not opened yet';
        stage.setAttribute('data-stage', '');
        requestAnimationFrame(() => stage.classList.remove('is-changing'));
      }, 200);
    }, 0);
  });

  // The Excel picker shows which file was chosen.
  const sheet = document.querySelector('.drop-zone input[type=file]');
  if (sheet) sheet.addEventListener('change', () => {
    document.querySelector('.file-name').textContent = sheet.files[0]?.name || '';
  });
})();
