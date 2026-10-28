// The couple's guest admin: copying a guest's link, and showing a send at once.
(() => {
  'use strict';
  document.documentElement.classList.add('js');

  // "Copy link": the guest's full link, ready to paste into any message.
  document.addEventListener('click', async event => {
    const button = event.target.closest('.copy-link');
    if (!button) return;
    const link = new URL(button.dataset.link, location.origin).href;
    const use = button.querySelector('use'), words = button.querySelector('span');
    button.label ??= button.getAttribute('aria-label');
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt('Copy this link:', link);
      return;
    }
    use.setAttribute('href', '#i-check');
    if (words) words.textContent = 'Copied';
    button.setAttribute('aria-label', 'Copied');
    clearTimeout(button.reset);
    button.reset = setTimeout(() => {
      use.setAttribute('href', '#i-copy');
      if (words) words.textContent = 'Copy link';
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
    const button = form.querySelector('button'), words = button.querySelector('span');
    const reminder = form.querySelector('[name=kind]');
    setTimeout(() => {
      button.classList.add('is-done');
      if (words) words.textContent = button.dataset.done;
      button.querySelector('use').setAttribute('href', '#i-check');
      const stage = form.closest('tr, li, .invitation-panel')?.querySelector('[data-stage]');
      if (!stage || reminder) return;
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
