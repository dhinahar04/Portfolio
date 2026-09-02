/**
 * DHINAHAR M — PORTFOLIO JAVASCRIPT ENGINE
 * Features: Lenis Smooth Scroll, Cinematic Preloader, Custom Magnetic Cursor,
 * Dynamic Word Ticker, Interactive Project Modal, Audio Feedback & Confetti.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==================================================
     1. SOUND EFFECTS SYNTHESIZER (WEB AUDIO API)
     ================================================== */
  let audioCtx = null;
  let isMuted = localStorage.getItem('dhinahar_sound_muted') === 'true';

  const initAudio = () => {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  };

  const playHoverTick = () => {
    if (isMuted || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    } catch (e) {
      // Audio error ignored silently
    }
  };

  const playClickPop = () => {
    if (isMuted || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch (e) {
      // Audio error ignored silently
    }
  };

  // Sound toggle button setup
  const soundToggleBtn = document.getElementById('soundToggle');
  if (soundToggleBtn) {
    const soundOnIcon = soundToggleBtn.querySelector('.sound-icon-on');
    const soundOffIcon = soundToggleBtn.querySelector('.sound-icon-off');

    const updateSoundUI = () => {
      if (isMuted) {
        soundOnIcon?.classList.add('hidden');
        soundOffIcon?.classList.remove('hidden');
        soundToggleBtn.setAttribute('aria-label', 'Unmute sound effects');
      } else {
        soundOnIcon?.classList.remove('hidden');
        soundOffIcon?.classList.add('hidden');
        soundToggleBtn.setAttribute('aria-label', 'Mute sound effects');
      }
    };
    updateSoundUI();

    soundToggleBtn.addEventListener('click', () => {
      initAudio();
      isMuted = !isMuted;
      localStorage.setItem('dhinahar_sound_muted', isMuted);
      updateSoundUI();
      if (!isMuted) playClickPop();
    });
  }

  // First user interaction unblocks AudioContext
  window.addEventListener('click', initAudio, { once: true });
  window.addEventListener('touchstart', initAudio, { once: true });

  /* ==================================================
     2. LENIS SMOOTH SCROLLING
     ================================================== */
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      infinite: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Smooth anchor navigation
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          playClickPop();
          lenis.scrollTo(targetEl, { offset: -60 });
        }
      });
    });
  }

  /* ==================================================
     3. INTRO / CINEMATIC LOADING SCREEN
     ================================================== */
  const loaderOverlay = document.getElementById('loaderOverlay');
  const loaderPercent = document.getElementById('loaderPercent');
  const loaderFill = document.getElementById('loaderFill');
  const hasLoadedBefore = sessionStorage.getItem('dhinahar_portfolio_loaded');

  const startHeroAnimations = () => {
    const revealItems = document.querySelectorAll('.hero-section .reveal-item');
    revealItems.forEach((item, idx) => {
      setTimeout(() => {
        item.classList.add('revealed');
      }, 100 + idx * 120);
    });
  };

  if (hasLoadedBefore && loaderOverlay) {
    // Fast skip for subsequent navigations in the same session
    loaderOverlay.classList.add('is-loaded');
    startHeroAnimations();
  } else if (loaderOverlay && loaderPercent && loaderFill) {
    let currentPercent = 0;
    const duration = 1400; // ms
    const startTime = performance.now();

    const animateLoader = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quartic
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      currentPercent = Math.floor(easeProgress * 100);

      loaderPercent.textContent = `${currentPercent.toString().padStart(2, '0')}%`;
      loaderFill.style.width = `${currentPercent}%`;

      if (progress < 1) {
        requestAnimationFrame(animateLoader);
      } else {
        setTimeout(() => {
          loaderOverlay.classList.add('is-loaded');
          sessionStorage.setItem('dhinahar_portfolio_loaded', 'true');
          startHeroAnimations();
          if (!isMuted) playClickPop();
        }, 250);
      }
    };
    requestAnimationFrame(animateLoader);
  }

  /* ==================================================
     4. CUSTOM CURSOR (DESKTOP ONLY)
     ================================================== */
  const cursorDot = document.getElementById('cursorDot');
  const cursorFollower = document.getElementById('cursorFollower');

  if (cursorDot && cursorFollower && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    const renderCursor = () => {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px)`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    // Hover detection
    const attachCursorEvents = () => {
      document.querySelectorAll('a, button, [data-cursor="hover"]').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          cursorFollower.classList.add('is-hovering');
          playHoverTick();
        });
        el.addEventListener('mouseleave', () => {
          cursorFollower.classList.remove('is-hovering');
        });
      });

      document.querySelectorAll('[data-cursor="project"]').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          cursorFollower.classList.add('is-project');
          playHoverTick();
        });
        el.addEventListener('mouseleave', () => {
          cursorFollower.classList.remove('is-project');
        });
      });
    };
    attachCursorEvents();
  }

  /* ==================================================
     5. HERO DYNAMIC TICKER (ANIMATED WORDS)
     ================================================== */
  const dynamicTicker = document.getElementById('dynamicTicker');
  if (dynamicTicker) {
    const words = dynamicTicker.querySelectorAll('.ticker-word');
    let currentIndex = 0;

    setInterval(() => {
      const currentWord = words[currentIndex];
      currentWord.classList.remove('active');
      currentWord.classList.add('exiting');

      currentIndex = (currentIndex + 1) % words.length;
      const nextWord = words[currentIndex];
      nextWord.classList.remove('exiting');
      nextWord.classList.add('active');

      setTimeout(() => {
        currentWord.classList.remove('exiting');
      }, 500);
    }, 2400);
  }

  /* ==================================================
     6. 3D MOUSE PARALLAX ON HERO PORTRAIT
     ================================================== */
  const portraitWrap = document.getElementById('heroPortraitWrap');
  if (portraitWrap && window.matchMedia('(pointer: fine)').matches) {
    portraitWrap.addEventListener('mousemove', (e) => {
      const rect = portraitWrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      portraitWrap.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-4px)`;
    });

    portraitWrap.addEventListener('mouseleave', () => {
      portraitWrap.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0px)';
      portraitWrap.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    portraitWrap.addEventListener('mouseenter', () => {
      portraitWrap.style.transition = 'none';
    });
  }

  /* ==================================================
     7. NAVBAR SCROLL EFFECT & ACTIVE SPY
     ================================================== */
  const mainNavbar = document.getElementById('mainNavbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const onScroll = () => {
    const scrollY = window.scrollY;

    if (mainNavbar) {
      if (scrollY > 50) {
        mainNavbar.classList.add('scrolled');
      } else {
        mainNavbar.classList.remove('scrolled');
      }
    }

    // Active link highlighting
    let currentSectionId = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 180;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ==================================================
     8. MOBILE MENU DRAWER
     ================================================== */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuBtn && mobileDrawer) {
    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : !mobileMenuBtn.classList.contains('is-open');
      mobileMenuBtn.classList.toggle('is-open', isOpen);
      mobileDrawer.classList.toggle('is-open', isOpen);
      mobileMenuBtn.setAttribute('aria-expanded', isOpen.toString());
      mobileDrawer.setAttribute('aria-hidden', (!isOpen).toString());
      document.body.style.overflow = isOpen ? 'hidden' : '';
      if (isOpen && lenis) lenis.stop();
      if (!isOpen && lenis) lenis.start();
    };

    mobileMenuBtn.addEventListener('click', () => {
      playClickPop();
      toggleMenu();
    });

    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', () => {
        toggleMenu(false);
      });
    });
  }

  /* ==================================================
     9. INTERSECTION OBSERVER FOR SCROLL REVEALS & STATS
     ================================================== */
  // Generic scroll reveals
  const revealElements = document.querySelectorAll('.reveal-item:not(.hero-section .reveal-item)');
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealElements.forEach((el) => revealObserver.observe(el));

  // Animated numbers in stats boxes
  const statBoxes = document.querySelectorAll('.stat-box');
  const statObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const statBox = entry.target;
          const targetNum = parseInt(statBox.getAttribute('data-target') || '0', 10);
          const suffix = statBox.getAttribute('data-suffix') || '';
          const numEl = statBox.querySelector('.stat-number');

          if (numEl) {
            let start = 0;
            const countDuration = 1200;
            const startTime = performance.now();

            const countUp = (now) => {
              const progress = Math.min((now - startTime) / countDuration, 1);
              const currentVal = Math.floor(progress * targetNum);
              numEl.textContent = `${currentVal.toString().padStart(2, '0')}${suffix}`;
              if (progress < 1) {
                requestAnimationFrame(countUp);
              } else {
                numEl.textContent = `${targetNum.toString().padStart(2, '0')}${suffix}`;
              }
            };
            requestAnimationFrame(countUp);
          }
          observer.unobserve(statBox);
        }
      });
    },
    { threshold: 0.3 }
  );
  statBoxes.forEach((box) => statObserver.observe(box));

  /* ==================================================
     10. PROJECT DETAILS MODAL
     ================================================== */
  const projectDatabase = {
    health: {
      badge: 'PROJECT 01 // HEALTHCARE AI',
      title: 'AI Health Query',
      image: 'ai_health_query.jpg',
      desc: 'An intelligent clinical query and conversational medical intelligence platform. Empowers patients and healthcare practitioners with rapid symptom triage, vital sign risk assessment, and contextual clinical guidance powered by medical NLP models.',
      highlights: [
        'Real-time symptom semantic matching and vital trends monitoring',
        'Clinical intent classification with automated triage escalation protocols',
        'Secure patient telemetry interface with risk probability mapping',
        'Privacy-first design adhering to digital health data protection standards'
      ],
      tech: ['Python', 'NLP', 'FastAPI', 'PyTorch', 'Medical AI', 'React'],
      repo: 'https://github.com/dhinahar04'
    },
    consumer: {
      badge: 'PROJECT 02 // CONSUMER DEFENSE',
      title: 'AI Consumer Guardian',
      image: 'ai_consumer_guardian.jpg',
      desc: 'An autonomous digital consumer protection ecosystem engineered to detect deceptive UI patterns, fraudulent merchant activities, and unauthorized transaction anomalies in real-time. Protects consumers against digital financial threats.',
      highlights: [
        'Automated threat telemetry and multi-vector scam pattern detection',
        'Real-time transaction volume analysis and anomaly clustering',
        'Automated consumer dispute document and evidence generation',
        'Interactive incident feed with global threat vector visualization'
      ],
      tech: ['React', 'Next.js', 'Python', 'Fraud Detection', 'Cybersecurity', 'Tailwind CSS'],
      repo: 'https://github.com/dhinahar04'
    },
    biovision: {
      badge: 'PROJECT 03 // BIOMEDICAL VISION',
      title: 'BioVision AI',
      image: 'biovision_ai.jpg',
      desc: 'Deep learning computer vision platform for automated cellular microscopy analysis and tissue pathology segmentation. Accelerates biomedical research and clinical lab workflows by delivering sub-second cell classification and morphological anomaly heatmaps.',
      highlights: [
        'Convolutional neural network segmentation analyzing cellular microscopy slides',
        'High-confidence cell classification across epithelial, immune, and atypical types',
        'Interactive heatmap overlay with adjustable confidence thresholds',
        'Comprehensive pathology reporting interface for laboratory researchers'
      ],
      tech: ['Python', 'PyTorch', 'CNN', 'OpenCV', 'Biomedical ML', 'Deep Learning'],
      repo: 'https://github.com/dhinahar04'
    },
    leakage: {
      badge: 'PROJECT 04 // DIGITAL FORENSICS',
      title: 'Exam Paper Leakage Detection',
      image: 'exam_paper_leakage.jpg',
      desc: 'High-security academic integrity and examination document forensics ecosystem. Utilizes dynamic cryptographic steganography, invisible micro-watermarks, and anomaly access tracking to detect and trace confidential exam paper leaks instantaneously.',
      highlights: [
        'Dynamic cryptographic watermarking with unique recipient micro-signatures',
        'Anti-tampering file integrity validation and anomalous access detection',
        'Automated leak provenance tracking mapping leaks back to specific distribution nodes',
        'Live document forensic dashboard with real-time risk vulnerability indicators'
      ],
      tech: ['Python', 'Digital Forensics', 'Steganography', 'Cryptography', 'Flask', 'Audit Telemetry'],
      repo: 'https://github.com/dhinahar04'
    },
    hostel: {
      badge: 'PROJECT 05 // ENTERPRISE PLATFORM',
      title: 'Smart Hostel Leave System',
      image: 'smart_hostel.jpg',
      desc: 'An enterprise digital gatepass and leave approval ecosystem. Modernizes traditional paper-based campus permissions with a multi-tiered approval hierarchy between students, faculty wardens, security gates, and parents.',
      highlights: [
        'Dynamic QR code generation with cryptographic expiration for gate verification',
        'Multi-role permissions: Student, Warden, Security Staff, and Parent dashboards',
        'PostgreSQL schema with strict ACID compliance and audit logging',
        'Automated SMS / email triggers notifying parents on student exit and entry'
      ],
      tech: ['React', 'Node.js', 'Express.js', 'PostgreSQL', 'JWT Auth', 'QR Verification'],
      repo: 'https://github.com/dhinahar04'
    }
  };

  const projectModal = document.getElementById('projectModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBadge = document.getElementById('modalBadge');
  const modalTitle = document.getElementById('modalTitle');
  const modalImg = document.getElementById('modalImg');
  const modalDesc = document.getElementById('modalDesc');
  const modalHighlights = document.getElementById('modalHighlights');
  const modalTechStack = document.getElementById('modalTechStack');
  const modalLiveLink = document.getElementById('modalLiveLink');

  const openProjectModal = (projectId) => {
    const data = projectDatabase[projectId];
    if (!data || !projectModal) return;

    modalBadge.textContent = data.badge;
    modalTitle.textContent = data.title;
    modalImg.src = data.image;
    modalImg.alt = data.title;
    modalDesc.textContent = data.desc;

    // Highlights
    modalHighlights.innerHTML = '';
    data.highlights.forEach((h) => {
      const li = document.createElement('li');
      li.textContent = h;
      modalHighlights.appendChild(li);
    });

    // Tech Stack
    modalTechStack.innerHTML = '';
    data.tech.forEach((t) => {
      const span = document.createElement('span');
      span.className = 'tech-pill';
      span.textContent = t;
      modalTechStack.appendChild(span);
    });

    modalLiveLink.href = data.repo;

    projectModal.classList.add('is-open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
    playClickPop();
  };

  const closeProjectModal = () => {
    if (!projectModal) return;
    projectModal.classList.remove('is-open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  };

  document.querySelectorAll('[data-project-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const projectId = btn.getAttribute('data-project-id');
      if (projectId) openProjectModal(projectId);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      playClickPop();
      closeProjectModal();
    });
  }

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeProjectModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal && projectModal.classList.contains('is-open')) {
      closeProjectModal();
    }
  });

  /* ==================================================
     11. TOAST NOTIFICATIONS
     ================================================== */
  const toastNotice = document.getElementById('toastNotice');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimeout = null;

  const showToast = (message) => {
    if (!toastNotice || !toastMsg) return;
    toastMsg.textContent = message;
    toastNotice.classList.add('is-visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastNotice.classList.remove('is-visible');
    }, 3200);
  };

  /* ==================================================
     12. COPY EMAIL ACTION
     ================================================== */
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = copyEmailBtn.getAttribute('data-email') || 'dhinaharmurugesan@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast(`Copied ${email} to clipboard!`);
        playClickPop();
        // Trigger subtle confetti burst
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 25,
            spread: 40,
            origin: { y: 0.8 },
            colors: ['#22d3ee', '#38bdf8', '#818cf8']
          });
        }
      });
    });
  }

  /* ==================================================
     13. DOWNLOAD RESUME CELEBRATION
     ================================================== */
  const downloadResumeBtn = document.getElementById('downloadResumeBtn');
  if (downloadResumeBtn) {
    downloadResumeBtn.addEventListener('click', () => {
      playClickPop();
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#22d3ee', '#ffffff', '#818cf8', '#38bdf8']
        });
      }
      showToast('Opening Resume...');
      // Open print or prompt
      setTimeout(() => {
        window.print();
      }, 400);
    });
  }

  /* ==================================================
     14. BACK TO TOP BUTTON
     ================================================== */
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      playClickPop();
      if (lenis) {
        lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* ==================================================
     15. CONTACT FORM SUBMISSION
     ================================================== */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      // Let mailto or client handle, or provide visual feedback
      playClickPop();
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#22d3ee', '#a855f7', '#ffffff']
        });
      }
      showToast('Opening your email client to send message...');
    });
  }
});
