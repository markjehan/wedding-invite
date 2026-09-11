(() => {
  const root = document.documentElement;
  root.classList.add("js-ready");
  const body = document.body;
  const openingScreen = document.getElementById("opening-screen");
  const siteFrame = document.getElementById("site-frame");
  const openButton = document.getElementById("open-invitation");
  const skipButton = document.getElementById("skip-opening");
  const skipLink = document.querySelector(".skip-link");
  const replayButton = document.getElementById("replay-button");
  const pageBook = document.getElementById("page-book");
  const pages = [...document.querySelectorAll(".page-sheet")];
  const pageSteps = [...document.querySelectorAll(".page-step")];
  const chapterLinks = [...document.querySelectorAll(".ribbon-nav a")];
  const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
  const reducesMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supports3d = typeof CSS === "undefined" || !CSS.supports || CSS.supports("transform-style", "preserve-3d");
  const focusableSelector = "a[href], button, input, select, textarea, [tabindex]";
  let bookStart = 0;
  let pageStepHeight = window.innerHeight;
  let pageTurnFrame = 0;
  let pageTurnRunning = false;

  root.classList.toggle("no-3d", !supports3d);
  siteFrame.setAttribute("aria-hidden", "true");
  if ("inert" in siteFrame) siteFrame.inert = true;

  pages.forEach((page) => {
    const reverse = document.createElement("div");
    reverse.className = "page-back";
    reverse.setAttribute("aria-hidden", "true");
    reverse.innerHTML = '<span>N<i>&amp;</i>D</span><small>Naveen &amp; Dulanjani</small>';
    page.appendChild(reverse);
  });

  const measureBook = () => {
    const firstStep = pageSteps[0];
    if (!firstStep) return;
    const bounds = firstStep.getBoundingClientRect();
    bookStart = bounds.top + window.scrollY;
    pageStepHeight = Math.max(1, bounds.height);
  };

  const goToPage = (index, behavior = "smooth") => {
    const safeIndex = Math.round(clamp(index, 0, pages.length - 1));
    measureBook();
    const marker = pageSteps[safeIndex];
    if (behavior === "smooth" && !reducesMotion) {
      window.cancelAnimationFrame(pageTurnFrame);
      const start = window.scrollY;
      const target = bookStart + safeIndex * pageStepHeight;
      const started = performance.now();
      pageTurnRunning = true;
      root.style.scrollSnapType = "none";
      root.style.scrollBehavior = "auto";
      const animateTurn = (now) => {
        const t = Math.min(1, (now - started) / 1150);
        const eased = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        window.scrollTo(0, start + (target - start) * eased);
        requestScrollMotion();
        if (t < 1) pageTurnFrame = requestAnimationFrame(animateTurn);
        else {
          pageTurnRunning = false;
          root.style.removeProperty("scrollSnapType");
          root.style.removeProperty("scrollBehavior");
        }
      };
      pageTurnFrame = requestAnimationFrame(animateTurn);
      return;
    }
    window.cancelAnimationFrame(pageTurnFrame);
    pageTurnRunning = false;
    root.style.removeProperty("scrollSnapType");
    root.style.removeProperty("scrollBehavior");
    if (marker && typeof marker.scrollIntoView === "function") {
      marker.scrollIntoView({ block: "start", behavior });
    } else {
      window.scrollTo({ top: bookStart + (safeIndex * pageStepHeight), behavior });
    }
    window.setTimeout(requestScrollMotion, 0);
  };

  const finishOpening = (animate = true) => {
    if (body.classList.contains("opening") || body.classList.contains("opened") || body.classList.contains("seal-breaking")) return;
    body.classList.remove("pre-open");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shouldAnimate = animate && !reducedMotion;

    if (shouldAnimate) {
      body.classList.add("seal-breaking");
      window.setTimeout(() => body.classList.add("opening"), 520);
    } else {
      body.classList.add("opening");
    }

    const delay = shouldAnimate ? 2370 : 20;
    window.setTimeout(() => {
      body.classList.add("opened");
      body.classList.remove("opening", "seal-breaking");
      openingScreen.setAttribute("aria-hidden", "true");
      siteFrame.removeAttribute("aria-hidden");
      if ("inert" in siteFrame) siteFrame.inert = false;

      const requestedId = window.location.hash.slice(1);
      const requestedIndex = pages.findIndex((page) => page.id === requestedId);
      const destination = requestedIndex >= 0 ? requestedIndex : 0;
      setActivePage(destination, true);
      goToPage(destination, "auto");
      window.setTimeout(() => {
        const focusTarget = pages[destination];
        focusTarget.setAttribute("tabindex", "-1");
        focusTarget.focus({ preventScroll: true });
      }, 80);
    }, delay);
  };

  openButton.addEventListener("click", () => finishOpening(true));
  skipButton.addEventListener("click", () => finishOpening(false));
  skipLink.addEventListener("click", (event) => {
    event.preventDefault();
    window.history.replaceState(null, "", "#welcome");
    finishOpening(false);
  });

  replayButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "auto" });
    openingScreen.removeAttribute("aria-hidden");
    body.classList.remove("opened", "opening", "seal-breaking");
    body.classList.add("pre-open");
    siteFrame.setAttribute("aria-hidden", "true");
    if ("inert" in siteFrame) siteFrame.inert = true;
    window.setTimeout(() => openButton.focus(), 40);
  });

  openingScreen.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const x = ((event.clientX / window.innerWidth) - 0.5) * 8;
    const y = ((event.clientY / window.innerHeight) - 0.5) * 5;
    openButton.style.setProperty("--seal-tilt-x", x.toFixed(2));
    openButton.style.setProperty("--seal-tilt-y", y.toFixed(2));
  });

  openingScreen.addEventListener("pointerleave", () => {
    openButton.style.removeProperty("--seal-tilt-x");
    openButton.style.removeProperty("--seal-tilt-y");
  });

  const query = new URLSearchParams(window.location.search);
  const isPreview = query.get("preview") === "1";
  const requestedGuest = (query.get("guest") || "Guest").trim().slice(0, 60);
  const guestName = requestedGuest || "Guest";
  document.querySelectorAll("[data-guest]").forEach((element) => {
    element.textContent = guestName;
  });
  document.getElementById("guest-name").value = guestName;

  const rsvpCase = document.getElementById("rsvp");
  const rsvpToggle = document.getElementById("rsvp-toggle");
  const rsvpPanel = document.getElementById("rsvp-panel");
  const rsvpToggleHint = rsvpToggle.querySelector("small");

  const setRsvpOpen = (isOpen) => {
    rsvpCase.classList.toggle("rsvp-open", isOpen);
    rsvpToggle.setAttribute("aria-expanded", String(isOpen));
    rsvpPanel.inert = !isOpen;
    rsvpToggleHint.textContent = isOpen ? "Close drawer" : "Pull to open";
  };

  rsvpToggle.addEventListener("click", () => {
    setRsvpOpen(rsvpToggle.getAttribute("aria-expanded") !== "true");
  });

  const weddingDate = new Date("2026-10-18T16:00:00+05:30");
  const countdownFields = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
  };

  const updateCountdown = () => {
    const difference = Math.max(0, weddingDate.getTime() - Date.now());
    const totalSeconds = Math.floor(difference / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    countdownFields.days.textContent = String(days).padStart(3, "0");
    countdownFields.hours.textContent = String(hours).padStart(2, "0");
    countdownFields.minutes.textContent = String(minutes).padStart(2, "0");
    countdownFields.seconds.textContent = String(seconds).padStart(2, "0");
  };

  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  const kineticHeadings = document.querySelectorAll("[data-kinetic]");
  kineticHeadings.forEach((heading) => {
    const label = heading.textContent.trim();
    heading.setAttribute("aria-label", label);
    heading.innerHTML = label
      .split(/\s+/)
      .map((word, index) => `<span class="kinetic-word" aria-hidden="true" style="--word-index:${index}">${word}</span>`)
      .join(" ");
  });

  const revealItems = [...document.querySelectorAll(".reveal")];
  const venueSection = document.getElementById("venue");
  const venueDrawing = venueSection.querySelector(".venue-engraving-wrap");
  const venueInkImage = venueDrawing.querySelector(".venue-masked-art");
  const drawingPercent = document.getElementById("drawing-percent");
  const mobileVenueMedia = window.matchMedia("(max-width: 700px)");
  let motionFrame;
  let venueAnimationFrame;
  let venueHasPlayed = false;
  let lastDrawingPercent = -1;

  const selectVenueArtwork = () => {
    const source = mobileVenueMedia.matches
      ? "assets/avenra-lineart-transparent-mobile.png"
      : "assets/avenra-lineart-transparent.png";
    venueInkImage.setAttribute("href", source);
    venueInkImage.setAttributeNS("http://www.w3.org/1999/xlink", "href", source);
  };

  selectVenueArtwork();
  if (typeof mobileVenueMedia.addEventListener === "function") {
    mobileVenueMedia.addEventListener("change", selectVenueArtwork);
  } else if (typeof mobileVenueMedia.addListener === "function") {
    mobileVenueMedia.addListener(selectVenueArtwork);
  }

  const renderVenueDrawing = (drawProgress, isAnimating = false) => {
    venueDrawing.style.setProperty("--draw-progress", drawProgress.toFixed(4));
    venueDrawing.classList.toggle("drawing-active", isAnimating && drawProgress < 1);
    venueDrawing.classList.toggle("drawing-complete", drawProgress >= 1);

    const nextPercent = Math.round(drawProgress * 100);
    if (nextPercent !== lastDrawingPercent) {
      drawingPercent.textContent = `${nextPercent}%`;
      lastDrawingPercent = nextPercent;
    }
  };

  const startVenueDrawing = () => {
    if (venueHasPlayed) return;
    venueHasPlayed = true;

    if (isPreview || reducesMotion) {
      renderVenueDrawing(1, false);
      return;
    }

    renderVenueDrawing(0, false);
    void venueDrawing.offsetWidth;
    venueDrawing.classList.add("drawing-active");

    const duration = 4350;
    let startedAt;
    const drawFrame = (timestamp) => {
      startedAt ??= timestamp;
      const elapsed = clamp((timestamp - startedAt) / duration);
      const easedProgress = elapsed * elapsed * (3 - (2 * elapsed));
      renderVenueDrawing(easedProgress, elapsed < 1);
      if (elapsed < 1) venueAnimationFrame = window.requestAnimationFrame(drawFrame);
      else {
        renderVenueDrawing(1, false);
        venueAnimationFrame = undefined;
      }
    };

    venueAnimationFrame = window.requestAnimationFrame(drawFrame);
  };

  const venuePageIndex = pages.indexOf(venueSection);
  const rsvpPageIndex = pages.indexOf(rsvpCase);
  const revealedPages = new WeakSet();
  let activePageIndex = -1;
  let rsvpAutoOpened = false;

  const revealPage = (page) => {
    // The welcome page sits in view the instant the script runs (before the
    // guest has opened the invitation), and updateScrollMotion() below reveals
    // whatever page is current on that very first call. Without this guard,
    // page 0's line-by-line "writing" reveal plays out and finishes while it
    // is still hidden behind the closed doors, so the guest never sees it.
    if (!page || revealedPages.has(page)) return;
    if (page === pages[0] && !isPreview && !body.classList.contains("opened")) return;
    revealedPages.add(page);
    page.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
    page.querySelectorAll("[data-kinetic]").forEach((heading) => heading.classList.add("kinetic-in"));
  };

  const setPageInteractive = (page, isActive) => {
    if ("inert" in page) {
      page.inert = !isActive;
      return;
    }

    page.querySelectorAll(focusableSelector).forEach((control) => {
      if (!isActive) {
        if (!control.hasAttribute("data-page-tabindex")) {
          control.setAttribute("data-page-tabindex", control.getAttribute("tabindex") ?? "");
        }
        control.setAttribute("tabindex", "-1");
      } else if (control.hasAttribute("data-page-tabindex")) {
        const savedTabindex = control.getAttribute("data-page-tabindex");
        if (savedTabindex) control.setAttribute("tabindex", savedTabindex);
        else control.removeAttribute("tabindex");
        control.removeAttribute("data-page-tabindex");
      }
    });
  };

  const setActivePage = (index, force = false) => {
    if (index === activePageIndex && !force) return;
    activePageIndex = index;
    document.getElementById("previous-leaf").disabled = index === 0;
    document.getElementById("next-leaf").disabled = index === pages.length - 1;
    document.getElementById("leaf-position").textContent = `${String(index + 1).padStart(2, "0")} / 06 · ${pages[index].dataset.pageLabel || pages[index].id}`;

    pages.forEach((page, pageIndex) => {
      const isActive = pageIndex === index;
      page.classList.toggle("is-current", isActive);
      setPageInteractive(page, isActive);
      page.setAttribute("aria-hidden", String(!isActive));
      if (isActive) revealPage(page);
    });

    const activeChapterId = pages[Math.min(index, chapterLinks.length - 1)]?.id;
    chapterLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeChapterId}`;
      link.classList.toggle("active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });

    pageBook.classList.toggle("is-last", index === pages.length - 1);
    if (index === rsvpPageIndex && !rsvpAutoOpened) {
      rsvpAutoOpened = true;
      setRsvpOpen(true);
    }
  };

  const updateScrollMotion = () => {
    motionFrame = undefined;
    const lastPageIndex = pages.length - 1;
    const rawPage = clamp((window.scrollY - bookStart) / pageStepHeight, 0, lastPageIndex);
    const pageProgress = lastPageIndex > 0 ? rawPage / lastPageIndex : 0;
    const restingIndex = Math.round(rawPage);
    const isSettled = Math.abs(rawPage - restingIndex) < .001;
    const outgoingPage = Math.floor(rawPage);
    const incomingPage = Math.ceil(rawPage);
    const turnProgress = isSettled ? 0 : rawPage - outgoingPage;
    const easedTurn = turnProgress * turnProgress * (3 - (2 * turnProgress));
    const nextActivePage = isSettled
      ? restingIndex
      : (turnProgress >= .58 ? incomingPage : outgoingPage);
    const maximumAngle = window.innerWidth <= 700 ? 168 : 174;

    document.documentElement.style.setProperty("--scroll-progress", pageProgress.toFixed(4));
    document.documentElement.style.setProperty("--ambient-y", `${Math.round(pageProgress * window.innerHeight * 1.35)}px`);

    pages.forEach((page, index) => {
      const isActive = index === nextActivePage;
      const isOutgoing = !isSettled && index === outgoingPage;
      const isIncoming = !isSettled && index === incomingPage;
      const shouldRender = isSettled ? index === restingIndex : (isOutgoing || isIncoming);
      // Prepare the sheet underneath before the outgoing paper exposes it.
      if (isIncoming) revealPage(page);
      const fold = isOutgoing ? Math.sin(easedTurn * Math.PI) : 0;
      const incomingScale = isIncoming ? .992 + (easedTurn * .008) : 1;
      const incomingLift = isIncoming ? (1 - easedTurn) * 12 : 0;
      const outgoingLift = isOutgoing ? -Math.sin(easedTurn * Math.PI) * 7 : 0;

      page.classList.toggle("is-rendered", shouldRender);
      page.classList.toggle("is-flipping", !reducesMotion && shouldRender && !isSettled);
      page.classList.toggle("is-outgoing", isOutgoing);
      page.classList.toggle("is-incoming", isIncoming);
      page.style.setProperty("--book-fold", (fold * .96).toFixed(3));
      page.style.setProperty("--fold-y", `${(-54 + (easedTurn * 112)).toFixed(1)}px`);
      page.style.setProperty("--book-lift", `${(isOutgoing ? outgoingLift : incomingLift).toFixed(2)}px`);
      page.style.setProperty("--under-scale", incomingScale.toFixed(4));
      page.style.setProperty("--under-shade", (isIncoming ? (1 - easedTurn) * .12 : 0).toFixed(3));

      if (reducesMotion) {
        page.style.setProperty("--book-angle", "0deg");
        page.style.opacity = isActive ? "1" : "0";
        page.style.visibility = isActive ? "visible" : "hidden";
      } else if (!supports3d) {
        const fallbackOpacity = isSettled
          ? (isActive ? 1 : 0)
          : (isOutgoing ? 1 - easedTurn : (isIncoming ? easedTurn : 0));
        const fallbackY = isOutgoing ? -easedTurn * 18 : incomingLift;
        page.style.setProperty("--book-angle", "0deg");
        page.style.setProperty("--fallback-y", `${fallbackY.toFixed(2)}px`);
        page.style.setProperty("--fallback-opacity", fallbackOpacity.toFixed(3));
        page.style.opacity = fallbackOpacity.toFixed(3);
        page.style.visibility = shouldRender ? "visible" : "hidden";
      } else {
        page.style.setProperty("--book-angle", `${(isOutgoing ? -easedTurn * maximumAngle : 0).toFixed(2)}deg`);
        page.style.opacity = "1";
        page.style.visibility = shouldRender ? "visible" : "hidden";
      }

      page.style.zIndex = String((pages.length - index) * 10);
      page.style.pointerEvents = isActive && shouldRender ? "auto" : "none";
    });

    setActivePage(nextActivePage);
    if (body.classList.contains("opened") && !venueHasPlayed && Math.abs(rawPage - venuePageIndex) <= .08) {
      startVenueDrawing();
    }
  };

  const requestScrollMotion = () => {
    if (motionFrame) return;
    motionFrame = window.requestAnimationFrame(updateScrollMotion);
  };

  const refreshBookGeometry = () => {
    measureBook();
    requestScrollMotion();
  };

  window.addEventListener("scroll", requestScrollMotion, { passive: true });
  let wheelAmount = 0;
  let wheelTime = 0;
  window.addEventListener("wheel", (event) => {
    if (!body.classList.contains("opened") || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    let node = event.target instanceof Element ? event.target : null;
    while (node && node !== document.body) {
      const style = getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 2) {
        if ((event.deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 2) || (event.deltaY < 0 && node.scrollTop > 2)) return;
      }
      node = node.parentElement;
    }
    event.preventDefault();
    if (pageTurnRunning) return;
    const now = performance.now();
    if (now - wheelTime > 180) wheelAmount = 0;
    wheelTime = now;
    wheelAmount += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (Math.abs(wheelAmount) >= 45) {
      goToPage(activePageIndex + Math.sign(wheelAmount));
      wheelAmount = 0;
    }
  }, { passive: false });
  window.addEventListener("scrollend", updateScrollMotion);
  window.addEventListener("resize", refreshBookGeometry, { passive: true });
  window.addEventListener("orientationchange", () => window.setTimeout(refreshBookGeometry, 120));
  window.visualViewport?.addEventListener("resize", refreshBookGeometry, { passive: true });
  window.addEventListener("pageshow", refreshBookGeometry);
  renderVenueDrawing(isPreview || reducesMotion ? 1 : 0, false);
  if (isPreview || reducesMotion) {
    venueHasPlayed = true;
  }

  chapterLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href").slice(1);
      const index = pages.findIndex((page) => page.id === targetId);
      if (index < 0) return;
      event.preventDefault();
      if (index === rsvpPageIndex) setRsvpOpen(true);
      window.history.replaceState(null, "", `#${targetId}`);
      goToPage(index);
    });
  });

  document.querySelectorAll(".scroll-cue[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href").slice(1);
      const index = pages.findIndex((page) => page.id === targetId);
      if (index < 0) return;
      event.preventDefault();
      window.history.replaceState(null, "", `#${targetId}`);
      goToPage(index);
    });
  });

  window.addEventListener("hashchange", () => {
    if (!body.classList.contains("opened")) return;
    const targetId = window.location.hash.slice(1);
    const index = pages.findIndex((page) => page.id === targetId);
    if (index >= 0) goToPage(index);
  });

  document.addEventListener("keydown", (event) => {
    if (!body.classList.contains("opened")) return;
    const tagName = event.target.tagName;
    if (["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(tagName)) return;
    if (["ArrowDown", "PageDown"].includes(event.key)) {
      event.preventDefault();
      goToPage(Math.min(pages.length - 1, activePageIndex + 1));
    } else if (["ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      goToPage(Math.max(0, activePageIndex - 1));
    }
  });

  measureBook();
  updateScrollMotion();
  document.getElementById("previous-leaf").addEventListener("click", () => goToPage(activePageIndex - 1));
  document.getElementById("next-leaf").addEventListener("click", () => goToPage(activePageIndex + 1));

  if (isPreview) {
    body.classList.add("preview-mode");
    revealItems.forEach((item) => item.classList.add("is-visible"));
    kineticHeadings.forEach((heading) => heading.classList.add("kinetic-in"));
    setRsvpOpen(true);
    finishOpening(false);
    const requestedPage = Number.parseInt(query.get("page") || "0", 10);
    if (Number.isFinite(requestedPage) && requestedPage > 0) {
      window.setTimeout(() => goToPage(requestedPage, "auto"), 80);
    }
  }

  const musicButton = document.getElementById("music-button");
  const musicLabel = musicButton.querySelector("span");
  let audioContext;
  let soundTimer;
  let soundIsOn = false;

  const playTone = (frequency, startsAt, duration, gainValue = 0.035) => {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startsAt);
    gain.gain.setValueAtTime(0.0001, startsAt);
    gain.gain.exponentialRampToValueAtTime(gainValue, startsAt + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startsAt);
    oscillator.stop(startsAt + duration + 0.05);
  };

  const playChime = () => {
    if (!audioContext || !soundIsOn) return;
    const now = audioContext.currentTime;
    playTone(261.63, now, 2.8, 0.025);
    playTone(329.63, now + 0.42, 2.6, 0.022);
    playTone(392.0, now + 0.84, 2.5, 0.02);
    playTone(523.25, now + 1.4, 2.2, 0.014);
  };

  const stopSoundscape = () => {
    soundIsOn = false;
    window.clearInterval(soundTimer);
    soundTimer = undefined;
    musicButton.setAttribute("aria-pressed", "false");
    musicButton.setAttribute("aria-label", "Turn soundscape on");
    musicLabel.textContent = "Soundscape off";
    body.classList.remove("music-on");
  };

  musicButton.addEventListener("click", async () => {
    if (soundIsOn) {
      stopSoundscape();
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      musicLabel.textContent = "Sound unavailable";
      musicButton.disabled = true;
      return;
    }

    audioContext = audioContext || new AudioContext();
    if (audioContext.state === "suspended") await audioContext.resume();
    soundIsOn = true;
    musicButton.setAttribute("aria-pressed", "true");
    musicButton.setAttribute("aria-label", "Turn soundscape off");
    musicLabel.textContent = "Soundscape on";
    body.classList.add("music-on");
    playChime();
    soundTimer = window.setInterval(playChime, 9000);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && soundIsOn) stopSoundscape();
  });

  const form = document.getElementById("rsvp-form");
  const formMessage = document.getElementById("form-message");
  const preparedReply = document.getElementById("prepared-reply");
  const replyText = document.getElementById("reply-text");
  const copyReply = document.getElementById("copy-reply");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    formMessage.textContent = "";
    const submitButton = form.querySelector("button[type='submit']");
    const nameInput = form.elements.name;
    const attendance = form.querySelector("input[name='attendance']:checked");

    nameInput.removeAttribute("aria-invalid");
    form.querySelectorAll("input[name='attendance']").forEach((input) => input.removeAttribute("aria-invalid"));

    if (!nameInput.value.trim()) {
      nameInput.setAttribute("aria-invalid", "true");
      formMessage.textContent = "Please add your name so the response can be prepared.";
      nameInput.focus();
      return;
    }

    if (!attendance) {
      form.querySelectorAll("input[name='attendance']").forEach((input) => input.setAttribute("aria-invalid", "true"));
      formMessage.textContent = "Please choose whether you’ll be joining the celebration.";
      form.querySelector("input[name='attendance']").focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.querySelector("span").textContent = "Preparing…";

    window.setTimeout(() => {
      const data = new FormData(form);
      const note = String(data.get("note") || "").trim();
      const lines = [
        `Wedding RSVP — Naveen & Dulanjani`,
        `${String(data.get("name")).trim()} ${data.get("attendance")}.`,
        `Party size: ${data.get("partySize")}.`
      ];
      if (note) lines.push(`Note: ${note}`);
      replyText.textContent = lines.join("\n");
      preparedReply.hidden = false;
      formMessage.textContent = "Your demo response is ready. Connect a real destination before launch.";
      submitButton.disabled = false;
      submitButton.querySelector("span").textContent = "Update my reply";
      preparedReply.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 520);
  });

  const fallbackCopy = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  };

  copyReply.addEventListener("click", async () => {
    const text = replyText.textContent;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else fallbackCopy(text);
      copyReply.textContent = "Copied";
    } catch {
      copyReply.textContent = "Select and copy the message above";
    }
  });
})();
