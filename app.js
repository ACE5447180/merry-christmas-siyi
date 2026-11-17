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
  const treeSection = document.getElementById('particleTreeSection');
  const treeCanvas = document.getElementById('particleTreeCanvas');
  const treePulseBtn = document.getElementById('treePulseBtn');
  const treeMessage = document.getElementById('treeMessage');

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

  function setupParticleTree() {
    if (!treeCanvas || !treeSection) return;

    const context = treeCanvas.getContext('2d');
    if (!context) return;

    const palette = [
      [234, 203, 139],
      [255, 241, 210],
      [174, 73, 61]
    ];
    const messages = [
      '每个粒子，都是想靠近你一点的心情。',
      '第一束光，已经偷偷寄给小怡。',
      '再亮一点，像每次见到你时的眼睛。',
      '整棵树都亮了，今晚也要想我。',
      '这棵树会旋转，但我看向你时不会。'
    ];

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let motes = [];
    let sprites = [];
    let rotation = 0;
    let lastTimestamp = 0;
    let pulse = 0;
    let pulseCount = 0;
    let treeVisible = false;
    let animationFrame = 0;
    let resizeFrame = 0;
    const pointer = { x: 0, y: 0, active: false };

    function makeGlowSprite(rgb) {
      const sprite = document.createElement('canvas');
      const size = 44;
      const spriteContext = sprite.getContext('2d');
      sprite.width = size;
      sprite.height = size;

      const gradient = spriteContext.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
      gradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`);
      gradient.addColorStop(.12, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, .95)`);
      gradient.addColorStop(.36, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, .32)`);
      gradient.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`);
      spriteContext.fillStyle = gradient;
      spriteContext.fillRect(0, 0, size, size);
      return sprite;
    }

    sprites = palette.map(makeGlowSprite);

    function buildParticles() {
      const count = width < 360 ? 330 : width < 480 ? 430 : 520;
      particles = Array.from({ length: count }, (_, index) => {
        const h = Math.pow(Math.random(), .72);
        const shell = .79 + Math.random() * .21;
        const colorIndex = index % 29 === 0 ? 2 : index % 4 === 0 ? 1 : 0;

        return {
          h,
          radius: width * .31 * (.075 + h * .925) * shell,
          angle: Math.random() * Math.PI * 2 + h * 7,
          size: .65 + Math.random() * 1.35 + (index % 37 === 0 ? 1.1 : 0),
          colorIndex,
          phase: Math.random() * Math.PI * 2,
          speed: .75 + Math.random() * 2.2,
          sparkle: index % 17 === 0,
          berry: colorIndex === 2
        };
      });

      motes = Array.from({ length: 34 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: .35 + Math.random() * 1.25,
        speed: 2 + Math.random() * 6,
        alpha: .12 + Math.random() * .34,
        phase: Math.random() * Math.PI * 2
      }));
    }

    function drawBackground() {
      const centerX = width / 2;
      const centerY = height * .58;
      const halo = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * .6);
      halo.addColorStop(0, 'rgba(189, 154, 91, .09)');
      halo.addColorStop(.34, 'rgba(112, 105, 68, .045)');
      halo.addColorStop(1, 'rgba(2, 9, 7, 0)');
      context.fillStyle = halo;
      context.fillRect(0, 0, width, height);

      const floor = context.createRadialGradient(centerX, height * .84, 0, centerX, height * .84, width * .42);
      floor.addColorStop(0, 'rgba(217, 186, 120, .12)');
      floor.addColorStop(.4, 'rgba(217, 186, 120, .035)');
      floor.addColorStop(1, 'rgba(217, 186, 120, 0)');
      context.fillStyle = floor;
      context.fillRect(0, height * .68, width, height * .32);
    }

    function drawMotes(time) {
      context.save();
      context.globalCompositeOperation = 'lighter';

      motes.forEach((mote) => {
        const floatY = (mote.y - time * mote.speed) % (height + 20);
        const floatX = mote.x + Math.sin(time * .35 + mote.phase) * 8;
        const alpha = mote.alpha * (.6 + .4 * Math.sin(time * .8 + mote.phase));
        context.globalAlpha = Math.max(0, alpha);
        context.drawImage(
          sprites[1],
          floatX - mote.size * 3,
          (floatY + height + 20) % (height + 20) - mote.size * 3,
          mote.size * 6,
          mote.size * 6
        );
      });

      context.restore();
    }

    function drawStar(centerX, topY, time) {
      const pulseWave = .82 + Math.sin(time * 2.4) * .12 + pulse * .18;
      const size = 14 + pulse * 6;

      context.save();
      context.translate(centerX, topY);
      context.globalCompositeOperation = 'lighter';

      const glow = context.createRadialGradient(0, 0, 0, 0, 0, size * 4.8);
      glow.addColorStop(0, `rgba(255, 236, 184, ${.36 * pulseWave})`);
      glow.addColorStop(.25, `rgba(238, 204, 132, ${.12 * pulseWave})`);
      glow.addColorStop(1, 'rgba(238, 204, 132, 0)');
      context.fillStyle = glow;
      context.fillRect(-size * 5, -size * 5, size * 10, size * 10);

      context.fillStyle = `rgba(255, 240, 198, ${.72 + pulse * .2})`;
      context.beginPath();
      context.moveTo(0, -size);
      context.lineTo(size * .2, -size * .2);
      context.lineTo(size, 0);
      context.lineTo(size * .2, size * .2);
      context.lineTo(0, size);
      context.lineTo(-size * .2, size * .2);
      context.lineTo(-size, 0);
      context.lineTo(-size * .2, -size * .2);
      context.closePath();
      context.fill();

      context.strokeStyle = `rgba(255, 242, 205, ${.2 + pulse * .25})`;
      context.lineWidth = .7;
      context.beginPath();
      context.moveTo(-size * 1.65, 0);
      context.lineTo(size * 1.65, 0);
      context.moveTo(0, -size * 1.65);
      context.lineTo(0, size * 1.65);
      context.stroke();
      context.restore();
    }

    function drawTree(time) {
      context.clearRect(0, 0, width, height);
      drawBackground();
      drawMotes(time);

      const treeHeight = Math.min(height * .67, 360);
      const topY = (height - treeHeight) / 2 - 10;
      const centerX = width / 2;

      if (!reduceMotion) rotation += .0018;

      context.save();
      context.globalCompositeOperation = 'lighter';

      particles.forEach((particle) => {
        const angle = particle.angle + rotation;
        const localX = Math.cos(angle) * particle.radius;
        const localZ = Math.sin(angle) * particle.radius;
        const perspective = 1 + localZ / (width * 1.8);
        let x = centerX + localX * perspective;
        let y = topY + particle.h * treeHeight + Math.cos(angle * 1.6) * 1.1;

        if (pointer.active) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < 88) {
            const force = (1 - distance / 88) * 7.5;
            x += (dx / distance) * force;
            y += (dy / distance) * force;
          }
        }

        if (pulse > .005) {
          const direction = particle.radius || 1;
          x += (localX / direction) * pulse * 8;
          y += Math.sin(particle.phase + time * 3) * pulse * 2;
        }

        const twinkle = .68 + Math.sin(time * particle.speed + particle.phase) * .32;
        const depthAlpha = .48 + Math.max(0, perspective - .5) * .46;
        const alpha = Math.max(.12, Math.min(1, twinkle * depthAlpha));
        const size = particle.size * (.78 + perspective * .32) * (1 + pulse * .42);
        const sprite = sprites[particle.colorIndex];
        const glowSize = particle.sparkle || particle.berry ? size * 10 : size * 6.5;

        context.globalAlpha = alpha * (particle.berry ? .95 : .82);
        context.drawImage(sprite, x - glowSize / 2, y - glowSize / 2, glowSize, glowSize);

        context.globalAlpha = Math.min(1, alpha * 1.15);
        context.fillStyle = particle.colorIndex === 2
          ? 'rgba(237, 143, 122, .92)'
          : particle.colorIndex === 1
            ? 'rgba(255, 248, 226, .86)'
            : 'rgba(246, 220, 161, .88)';
        context.beginPath();
        context.arc(x, y, Math.max(.42, size * .52), 0, Math.PI * 2);
        context.fill();
      });

      context.restore();
      drawStar(centerX, topY - 4, time);

      context.save();
      context.globalCompositeOperation = 'lighter';
      context.globalAlpha = .24 + pulse * .18;
      context.fillStyle = 'rgba(221, 190, 126, .3)';
      context.beginPath();
      context.ellipse(centerX, topY + treeHeight + 23, width * .15, 2.5, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    function animateTree(timestamp) {
      animationFrame = 0;
      if (!treeVisible || document.hidden) return;

      const seconds = timestamp * .001;
      const delta = lastTimestamp ? Math.min((timestamp - lastTimestamp) / 1000, .05) : .016;
      lastTimestamp = timestamp;
      pulse *= Math.exp(-2.8 * delta);
      drawTree(seconds);
      animationFrame = window.requestAnimationFrame(animateTree);
    }

    function startTreeAnimation() {
      if (reduceMotion || !treeVisible || document.hidden || animationFrame) return;
      lastTimestamp = 0;
      animationFrame = window.requestAnimationFrame(animateTree);
    }

    function stopTreeAnimation() {
      if (!animationFrame) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    function resizeTree() {
      const rect = treeCanvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      treeCanvas.width = Math.round(width * dpr);
      treeCanvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
      if (reduceMotion || !animationFrame) drawTree(performance.now() * .001);
      startTreeAnimation();
    }

    function requestResize() {
      if (resizeFrame) return;
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        resizeTree();
      });
    }

    treeCanvas.addEventListener('pointermove', (event) => {
      const rect = treeCanvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    }, { passive: true });

    treeCanvas.addEventListener('pointerleave', () => {
      pointer.active = false;
    });

    treePulseBtn.addEventListener('click', () => {
      pulse = 1;
      pulseCount += 1;
      treeMessage.textContent = messages[pulseCount % messages.length];
      treeMessage.classList.add('is-glowing');
      treePulseBtn.classList.add('is-pulsing');

      window.setTimeout(() => {
        treePulseBtn.classList.remove('is-pulsing');
      }, 650);

      if (reduceMotion || !treeVisible) {
        drawTree(performance.now() * .001);
      } else {
        startTreeAnimation();
      }
    });

    if ('IntersectionObserver' in window) {
      const treeObserver = new IntersectionObserver((entries) => {
        treeVisible = entries[0].isIntersecting;
        if (treeVisible) startTreeAnimation();
        else stopTreeAnimation();
      }, { threshold: .08 });
      treeObserver.observe(treeSection);
    } else {
      treeVisible = true;
      startTreeAnimation();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopTreeAnimation();
      } else if (treeVisible) {
        startTreeAnimation();
      }
    });

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(requestResize);
      resizeObserver.observe(treeCanvas);
    } else {
      window.addEventListener('resize', requestResize, { passive: true });
    }

    requestResize();
  }

  setupParticleTree();

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
