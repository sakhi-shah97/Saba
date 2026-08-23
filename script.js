(function () {
  'use strict';

  /* ---------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------
     Smooth-scroll helpers
     --------------------------------------------------------- */
  function scrollToId(id) {
    var target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  var beginBtn = document.getElementById('beginBtn');
  if (beginBtn) beginBtn.addEventListener('click', function () { scrollToId('prompt'); });

  var continueBtn = document.getElementById('continueBtn');
  if (continueBtn) continueBtn.addEventListener('click', function () { scrollToId('story'); });

  /* ---------------------------------------------------------
     Interactive prompt: the one honest question
     --------------------------------------------------------- */
  var choiceA = document.getElementById('choiceA');
  var choiceB = document.getElementById('choiceB');
  var choicesWrap = document.getElementById('promptChoices');
  var promptReveal = document.getElementById('promptReveal');
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var dodged = false;

  if (choiceB && canHover) {
    choiceB.addEventListener('mouseenter', function () {
      if (dodged) return;
      dodged = true;
      var dx = (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 30);
      var dy = -(10 + Math.random() * 14);
      choiceB.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      setTimeout(function () { choiceB.style.transform = ''; }, 550);
    });
  }

  function answerPrompt() {
    if (!choicesWrap || !promptReveal) return;
    choicesWrap.classList.add('is-answered');
    promptReveal.classList.add('is-open');
  }
  if (choiceA) choiceA.addEventListener('click', answerPrompt);
  if (choiceB) choiceB.addEventListener('click', answerPrompt);

  /* ---------------------------------------------------------
     The letter — seal reveal
     --------------------------------------------------------- */
  var sealBtn = document.getElementById('sealBtn');
  var letterNote = document.getElementById('letterNote');
  if (sealBtn && letterNote) {
    sealBtn.addEventListener('click', function () {
      var opening = !letterNote.classList.contains('is-open');
      letterNote.classList.toggle('is-open', opening);
      sealBtn.classList.toggle('is-open', opening);
      if (opening) {
        setTimeout(function () {
          letterNote.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    });
  }

  /* ---------------------------------------------------------
     Countdown to next anniversary (June 14)
     --------------------------------------------------------- */
  var cdDays = document.getElementById('cdDays');
  var cdHours = document.getElementById('cdHours');
  var cdMins = document.getElementById('cdMins');
  var cdSecs = document.getElementById('cdSecs');

  function nextAnniversary() {
    var now = new Date();
    var year = now.getFullYear();
    var target = new Date(year, 5, 14, 0, 0, 0); // June is month index 5
    if (target.getTime() <= now.getTime()) {
      target = new Date(year + 1, 5, 14, 0, 0, 0);
    }
    return target;
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function tickCountdown() {
    if (!cdDays) return;
    var diff = nextAnniversary().getTime() - Date.now();
    if (diff < 0) diff = 0;
    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var mins = Math.floor((totalSeconds % 3600) / 60);
    var secs = totalSeconds % 60;

    cdDays.textContent = days;
    cdHours.textContent = pad(hours);
    cdMins.textContent = pad(mins);
    cdSecs.textContent = pad(secs);
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------------------------------------------------------
     Gallery lightbox
     --------------------------------------------------------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var galleryItems = document.querySelectorAll('.gallery__item');

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('is-open');
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
  }

  galleryItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var img = item.querySelector('img');
      openLightbox(item.getAttribute('data-full'), img ? img.alt : '');
    });
  });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ---------------------------------------------------------
     Ambient sound toggle
     Standard external-file audio (served over HTTP once deployed).
     Requires a user gesture to start, per iOS Safari / Android
     Chrome autoplay policy — play() is called synchronously inside
     the click handler, which satisfies that requirement on both.
     --------------------------------------------------------- */
  var soundToggle = document.getElementById('soundToggle');
  var bgm = document.getElementById('bgm');

  function setToggleState(state) {
    // state: 'idle' | 'playing' | 'error'
    if (!soundToggle) return;
    soundToggle.setAttribute('aria-pressed', state === 'playing' ? 'true' : 'false');
    soundToggle.classList.toggle('has-error', state === 'error');
    var label = soundToggle.querySelector('.sound-toggle__label');
    if (label) {
      label.textContent = state === 'error' ? "Tap doesn't work? Open in Safari/Chrome" : 'Our song';
    }
  }

  if (soundToggle && bgm) {
    soundToggle.addEventListener('click', function () {
      if (bgm.paused) {
        var playPromise = bgm.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(function () {
            setToggleState('playing');
          }).catch(function (err) {
            console.error('Audio playback failed:', err);
            setToggleState('error');
          });
        } else {
          // very old browsers with no promise-returning play()
          setToggleState('playing');
        }
      } else {
        bgm.pause();
        setToggleState('idle');
      }
    });

    bgm.addEventListener('error', function () {
      var mediaError = bgm.error;
      console.error('Audio element error:', mediaError && mediaError.code, mediaError && mediaError.message);
      setToggleState('error');
    });
    bgm.addEventListener('ended', function () { /* loop handles replay; nothing to do */ });
  }

  /* ---------------------------------------------------------
     Let's Make Plans — pick a date + an activity
     --------------------------------------------------------- */
  var planDate = document.getElementById('planDate');
  var planChoicesWrap = document.getElementById('planChoices');
  var lockBtn = document.getElementById('lockPlanBtn');
  var plansBody = document.getElementById('plansBody');
  var plansResult = document.getElementById('plansResult');
  var resultDate = document.getElementById('resultDate');
  var resultActivity = document.getElementById('resultActivity');
  var planReset = document.getElementById('planReset');
  var selectedActivity = null;

  function updateLockState() {
    if (!lockBtn) return;
    lockBtn.disabled = !(planDate && planDate.value && selectedActivity);
  }

  if (planChoicesWrap) {
    planChoicesWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.plan-chip');
      if (!btn) return;
      var chips = planChoicesWrap.querySelectorAll('.plan-chip');
      for (var i = 0; i < chips.length; i++) chips[i].classList.remove('is-selected');
      btn.classList.add('is-selected');
      selectedActivity = btn.getAttribute('data-activity');
      updateLockState();
    });
  }
  if (planDate) planDate.addEventListener('change', updateLockState);

  if (lockBtn) {
    lockBtn.addEventListener('click', function () {
      if (!planDate.value || !selectedActivity) return;
      var d = new Date(planDate.value + 'T00:00:00');
      var formatted = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      resultDate.textContent = formatted;
      resultActivity.textContent = selectedActivity;
      if (plansBody) plansBody.classList.add('is-hidden');
      if (plansResult) plansResult.classList.add('is-open');
      setTimeout(function () {
        if (plansResult) plansResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    });
  }

  if (planReset) {
    planReset.addEventListener('click', function () {
      if (plansResult) plansResult.classList.remove('is-open');
      if (plansBody) plansBody.classList.remove('is-hidden');
      selectedActivity = null;
      if (planChoicesWrap) {
        var chips2 = planChoicesWrap.querySelectorAll('.plan-chip');
        for (var j = 0; j < chips2.length; j++) chips2[j].classList.remove('is-selected');
      }
      if (planDate) planDate.value = '';
      updateLockState();
    });
  }
})();
