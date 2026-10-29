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

  // The garden on Home: one flower per invitation (overview.html, _flowers.html).
  const garden = document.querySelector('.garden');
  if (garden) {
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    const words = flower => ({
      coming: `coming, ${flower.people} of ${flower.seats}`, declined: "can't come",
      opened: 'opened, no reply yet', sent: 'sent, not opened yet', unsent: 'not sent yet',
    })[flower.stage];

    // It grows in once a visit, not every time Home is opened.
    let grown = null;
    try { grown = sessionStorage.getItem('garden-grown'); sessionStorage.setItem('garden-grown', '1'); } catch {}
    if (!grown && !still.matches) {
      garden.classList.add('is-growing');
      setTimeout(() => garden.classList.remove('is-growing'), 700 + 40 * 18 + 200);
    }

    // A name near either edge of the screen is nudged back inside it.
    const place = event => {
      const tip = event.target.closest?.('.flower')?.querySelector('.flower-tip');
      if (!tip) return;
      tip.style.setProperty('--nudge', '0px');
      const box = tip.getBoundingClientRect(), room = document.documentElement.clientWidth - 12;
      const nudge = box.left < 12 ? 12 - box.left : box.right > room ? room - box.right : 0;
      tip.style.setProperty('--nudge', `${Math.round(nudge)}px`);
    };
    garden.addEventListener('pointerover', place);
    garden.addEventListener('focusin', place);

    // A reply that comes in while the page is open: the flower blooms where it stands, and a card in
    // the corner says who it was.
    const news = document.querySelector('.garden-news');
    const say = flower => {
      if (!news) return;
      const card = document.createElement('div');
      card.className = 'news';
      card.innerHTML = '<svg class="swatch" viewBox="0 0 40 60" aria-hidden="true"><use/></svg><p><b></b> just replied: <span></span>.<br>'
        + '<button type="button" class="text-button">Refresh for the new numbers</button></p>'
        + '<button type="button" class="news-close" aria-label="Close"><svg class="icon"><use href="#i-x"/></svg></button>';
      card.querySelector('.swatch').classList.add(`is-${flower.stage}`);
      card.querySelector('.swatch use').setAttribute('href', `#f-${flower.stage}`);
      card.querySelector('b').textContent = flower.name;
      card.querySelector('p span').textContent = flower.stage === 'coming' ? `coming, ${flower.people}` : "can't come";
      card.querySelector('.text-button').addEventListener('click', () => location.reload());
      let timer;
      const leave = () => { card.classList.add('is-leaving'); setTimeout(() => card.remove(), 200); };
      const wait = () => { clearTimeout(timer); timer = setTimeout(leave, 14000); };
      card.querySelector('.news-close').addEventListener('click', leave);
      card.addEventListener('pointerenter', () => clearTimeout(timer));
      card.addEventListener('pointerleave', wait);
      news.append(card);
      while (news.children.length > 3) news.firstElementChild.remove();
      wait();
    };
    const bloom = (item, flower) => {
      item.className = `flower is-${flower.stage}`;
      item.querySelector('svg use').setAttribute('href', `#f-${flower.stage}`);
      item.querySelector('.flower-stage').textContent = words(flower);
      if (still.matches) return;
      item.querySelector('svg').animate(
        [{scale: .7, opacity: .4, filter: 'blur(2px)'}, {scale: 1.08, opacity: 1, filter: 'blur(0)', offset: .6}, {scale: 1}],
        {duration: 900, easing: 'cubic-bezier(.23,1,.32,1)'});
      item.classList.add('is-blooming');
      setTimeout(() => item.classList.remove('is-blooming'), 2400);
    };
    const look = async () => {
      if (document.hidden) return;
      let flowers;
      try {
        const answer = await fetch(garden.dataset.garden, {headers: {Accept: 'application/json'}, cache: 'no-store'});
        if (!answer.ok || !answer.headers.get('Content-Type')?.includes('json')) return;
        ({flowers} = await answer.json());
      } catch { return; }
      flowers.forEach(flower => {
        const item = garden.querySelector(`.flower[data-pk="${flower.pk}"]`);
        if (!item || item.classList.contains(`is-${flower.stage}`)) return;
        bloom(item, flower);
        if (flower.stage === 'coming' || flower.stage === 'declined') say(flower);
      });
    };
    setInterval(look, 15000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) look(); });
  }
})();
