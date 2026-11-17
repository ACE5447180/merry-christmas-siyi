(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = document.querySelector('main');
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const countdownClock = document.getElementById('countdownClock');
  const countdownNote = document.getElementById('countdownNote');
  const wishItems = Array.from(document.querySelectorAll('.wish-item'));
  const wishFeedback = document.getElementById('wishFeedback');
  const filmCards = Array.from(document.querySelectorAll('.film-card'));
  const photoViewer = document.getElementById('photoViewer');
  const closePhotoViewer = document.getElementById('closePhotoViewer');
  const viewerImage = document.getElementById('viewerImage');
  const viewerIndex = document.getElementById('viewerIndex');
  const viewerTitle = document.getElementById('photoViewerTitle');
  const viewerNote = document.getElementById('viewerNote');
  const openLetter = document.getElementById('openLetter');
  const letterViewer = document.getElementById('letterViewer');
  const closeLetter = document.getElementById('closeLetter');

  const christmasTimestamp = Date.parse('2026-12-25T00:00:00+08:00');
  let lastFocusedElement = null;
  let activeDialog = null;
  let countdownState = 'before';

  function pad(value, length) {
    return String(value).padStart(length || 2, '0');
  }

  function updateCountdown() {
    const remaining = christmasTimestamp - Date.now();

    if (remaining > 0) {
      const day = Math.floor(remaining / 86400000);
      const hour = Math.floor((remaining % 86400000) / 3600000);
      const minute = Math.floor((remaining % 3600000) / 60000);
      const second = Math.floor((remaining % 60000) / 1000);

      daysEl.textContent = pad(day, 2);
      hoursEl.textContent = pad(hour);
      minutesEl.textContent = pad(minute);
      secondsEl.textContent = pad(second);

      if (countdownState !== 'before') {
        countdownState = 'before';
        countdownNote.textContent = '圣诞不会提前，但我已经在期待了。';
      }
    } else {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';

      if (countdownState !== 'christmas') {
        countdownState = 'christmas';
        countdownNote.textContent = '圣诞快乐，小怡。今晚的每一秒，都想和你一起过。';
        countdownClock.setAttribute('aria-label', '圣诞节已经到了，圣诞快乐');
      }
    }
  }

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateCountdown();
  });

  function createSnow(container, count) {
    if (!container || reduceMotion) return;

    const fragment = document.createDocumentFragment();

    for (let index = 0; index < count; index += 1) {
      const flake = document.createElement('i');
      flake.className = 'snowflake';
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.setProperty('--snow-size', `${1 + Math.random() * 2.7}px`);
      flake.style.setProperty('--snow-alpha', (0.22 + Math.random() * 0.55).toFixed(2));
      flake.style.setProperty('--snow-blur', `${Math.random() > 0.72 ? 0.7 : 0}px`);
      flake.style.setProperty('--snow-duration', `${8 + Math.random() * 9}s`);
      flake.style.setProperty('--snow-delay', `${-Math.random() * 14}s`);
      flake.style.setProperty('--snow-drift', `${-22 + Math.random() * 45}px`);
      fragment.appendChild(flake);
    }

    container.appendChild(fragment);
  }

  createSnow(document.getElementById('heroSnow'), 30);
  createSnow(document.getElementById('finaleSnow'), 20);

  function setupReveals() {
    const targets = document.querySelectorAll('.reveal');

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -6% 0px'
    });

    targets.forEach((target) => observer.observe(target));
  }

  setupReveals();

  const wishMessages = [
    '点一点，让你的圣诞愿望亮起来。',
    '第一个愿望已点亮，我会记在心里。',
    '还有一件小事，想和你一起完成。',
    '三个都选好了——那今晚，我来接你。'
  ];

  wishItems.forEach((item) => {
    item.addEventListener('click', () => {
      const nextState = !item.classList.contains('is-active');
      item.classList.toggle('is-active', nextState);
      item.setAttribute('aria-pressed', String(nextState));

      const activeCount = wishItems.filter((entry) => entry.classList.contains('is-active')).length;
      wishFeedback.textContent = wishMessages[activeCount];
      wishFeedback.classList.toggle('is-ready', activeCount > 0);
    });
  });

  function openDialog(dialog, focusTarget, trigger) {
    lastFocusedElement = trigger || document.activeElement;
    activeDialog = dialog;
    dialog.classList.add('is-open');
    dialog.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    main.inert = true;
    main.setAttribute('aria-hidden', 'true');

    window.setTimeout(() => {
      focusTarget.focus({ preventScroll: true });
    }, 100);
  }

  function closeDialog(dialog) {
    dialog.classList.remove('is-open');
    dialog.setAttribute('aria-hidden', 'true');
    activeDialog = null;
    document.body.classList.remove('is-locked');
    main.inert = false;
    main.removeAttribute('aria-hidden');

    if (lastFocusedElement) {
      lastFocusedElement.focus({ preventScroll: true });
    }
  }

  filmCards.forEach((card) => {
    card.addEventListener('click', () => {
      const image = card.querySelector('img');
      const title = card.dataset.title;
      const note = card.dataset.note;

      viewerImage.src = image.currentSrc || image.src;
      viewerImage.alt = image.alt;
      viewerIndex.textContent = `${card.dataset.index} / 04`;
      viewerTitle.textContent = title;
      viewerNote.textContent = note;
      openDialog(photoViewer, closePhotoViewer, card);
    });
  });

  closePhotoViewer.addEventListener('click', () => closeDialog(photoViewer));
  photoViewer.addEventListener('click', (event) => {
    if (event.target === photoViewer) closeDialog(photoViewer);
  });

  openLetter.addEventListener('click', () => {
    openDialog(letterViewer, closeLetter, openLetter);
  });

  closeLetter.addEventListener('click', () => closeDialog(letterViewer));
  letterViewer.addEventListener('click', (event) => {
    if (event.target === letterViewer) closeDialog(letterViewer);
  });

  function trapDialogFocus(event) {
    if (!activeDialog || event.key !== 'Tab') return;

    const focusable = Array.from(activeDialog.querySelectorAll(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )).filter((element) => element.getClientRects().length > 0);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeDialog) {
      closeDialog(activeDialog);
      return;
    }

    trapDialogFocus(event);
  });
})();
