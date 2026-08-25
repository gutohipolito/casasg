document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 0. Tracking — WhatsApp + proposta (GA4 + Formspree)
  // ==========================================================================
  // Mesmo endpoint do formulário de oferta; filtre no Formspree pelo campo "tipo".
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/meajbggp';

  const trackEvent = (name, params = {}) => {
    if (typeof gtag === 'function') {
      gtag('event', name, params);
    }
  };

  const logToFormspree = (payload) => {
    if (!FORMSPREE_ENDPOINT) return;
    const body = JSON.stringify({
      _subject: payload.tipo === 'whatsapp_click'
        ? `Clique WhatsApp (${payload.placement || 'site'}) — casasg.com`
        : 'Evento — casasg.com',
      pagina: window.location.href,
      caminho: window.location.pathname || '/',
      ...payload,
    });

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(FORMSPREE_ENDPOINT, new Blob([body], { type: 'application/json' }));
        return;
      }
      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body,
        keepalive: true,
      }).catch(() => {});
    } catch (_) {
      // Tracking não deve bloquear o clique.
    }
  };

  const whatsappPlacement = (el) => {
    if (el.closest('.whatsapp-float')) return 'float';
    if (el.closest('.hero') || el.closest('.hero-actions')) return 'hero';
    if (el.closest('.exit-popup') || el.closest('#exitPopup')) return 'exit_popup';
    if (el.closest('.site-footer') || el.closest('footer')) return 'footer';
    if (el.classList.contains('btn-whatsapp') || el.closest('.btn-whatsapp')) return 'cta_button';
    if (el.closest('.ficha-section') || el.closest('.ficha')) return 'ficha';
    return 'other';
  };

  document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"], a[href*="whatsapp.com/send"]').forEach((link) => {
    link.addEventListener('click', () => {
      const placement = whatsappPlacement(link);
      trackEvent('whatsapp_click', {
        event_category: 'contact',
        event_label: placement,
        placement,
        link_url: link.href,
        page_path: window.location.pathname || '/',
      });
      logToFormspree({
        tipo: 'whatsapp_click',
        placement,
        link_url: link.href,
      });
    });
  });
  
  // ==========================================================================
  // 1. Menu Responsivo (Mobile Navigation Toggle)
  // ==========================================================================
  const toggleBtn = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (toggleBtn && navMenu) {
    const navLinks = navMenu.querySelectorAll('a');

    const openMenu = () => {
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Fechar menu de navegação');
      navMenu.classList.add('active');
      if (navLinks.length > 0) {
        navLinks[0].focus();
      }
    };

    const closeMenu = () => {
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Abrir menu de navegação');
      navMenu.classList.remove('active');
      toggleBtn.focus();
    };

    toggleBtn.addEventListener('click', () => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Fechar menu com a tecla Escape e gerenciar Trap Focus via teclado
    document.addEventListener('keydown', (e) => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      if (!expanded) return;

      if (e.key === 'Escape') {
        closeMenu();
        e.preventDefault();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = [toggleBtn, ...Array.from(navLinks)];
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else { // Tab apenas
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    });

    // Fechar menu móvel se clicar fora dele ou do botão de controle
    document.addEventListener('click', (e) => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      if (expanded && !toggleBtn.contains(e.target) && !navMenu.contains(e.target)) {
        closeMenu();
      }
    });
  }

  // ==========================================================================
  // 2. Carrossel de Imagens (Seção Estrutura)
  // ==========================================================================
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  let currentSlide = 0;

  if (slides.length > 0) {
    const showSlide = (index) => {
      slides.forEach(slide => slide.classList.remove('active'));
      
      currentSlide = (index + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
      const counter = document.getElementById('sliderCounter');
      if (counter) {
        counter.textContent = `${currentSlide + 1} / ${slides.length}`;
      }
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
    }

    // Autoplay opcional suave
    let slideInterval = setInterval(() => showSlide(currentSlide + 1), 6000);

    const resetAutoplay = () => {
      clearInterval(slideInterval);
      slideInterval = setInterval(() => showSlide(currentSlide + 1), 6000);
    };

    [prevBtn, nextBtn].forEach(btn => {
      if (btn) btn.addEventListener('click', resetAutoplay);
    });
  }

  // ==========================================================================
  // 3. Sistema de Abas (Tabs) - Planta e Vídeo
  // ==========================================================================
  const tabTriggers = document.querySelectorAll('.tab-trigger');
  const tabPanels = document.querySelectorAll('.tab-panel');

  if (tabTriggers.length > 0) {
    tabTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        // Remover estado ativo de todos os botões e painéis
        tabTriggers.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
          t.setAttribute('tabindex', '-1');
        });
        tabPanels.forEach(p => p.classList.remove('active'));

        // Ativar a aba atual
        trigger.classList.add('active');
        trigger.setAttribute('aria-selected', 'true');
        trigger.removeAttribute('tabindex');

        const targetPanelId = trigger.getAttribute('aria-controls');
        const targetPanel = document.getElementById(targetPanelId);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });

      // Navegação por teclado nas abas
      trigger.addEventListener('keydown', (e) => {
        const triggersArray = Array.from(tabTriggers);
        const index = triggersArray.indexOf(trigger);

        if (e.key === 'ArrowRight') {
          const nextIndex = (index + 1) % triggersArray.length;
          triggersArray[nextIndex].focus();
          triggersArray[nextIndex].click();
        } else if (e.key === 'ArrowLeft') {
          const prevIndex = (index - 1 + triggersArray.length) % triggersArray.length;
          triggersArray[prevIndex].focus();
          triggersArray[prevIndex].click();
        }
      });
    });
  }

  // ==========================================================================
  // 4. FAQ Accordion (Dúvidas Frequentes)
  // ==========================================================================
  const faqTriggers = document.querySelectorAll('.faq-trigger');

  if (faqTriggers.length > 0) {
    faqTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const panel = trigger.nextElementSibling;
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

        // Fecha outros itens abertos (opcional - comportamento de acordeon rígido)
        faqTriggers.forEach(otherTrigger => {
          if (otherTrigger !== trigger) {
            otherTrigger.setAttribute('aria-expanded', 'false');
            otherTrigger.classList.remove('active');
            const otherPanel = otherTrigger.nextElementSibling;
            if (otherPanel) otherPanel.style.maxHeight = null;
          }
        });

        // Alterna o estado atual
        trigger.setAttribute('aria-expanded', !isExpanded);
        trigger.classList.toggle('active');

        if (panel) {
          if (isExpanded) {
            panel.style.maxHeight = null;
          } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
          }
        }
      });
    });
  }

  // ==========================================================================
  // 5. Interação do Mapa (Pins e Cards Laterais)
  // ==========================================================================
  const pinBtns = document.querySelectorAll('.pin-btn');
  const locationCards = document.querySelectorAll('.location-card');

  if (pinBtns.length > 0 && locationCards.length > 0) {
    
    // Função para desativar todos os pins e cards
    const deactivateAllMapItems = () => {
      pinBtns.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      });
      locationCards.forEach(card => card.classList.remove('active'));
    };

    // Clique nos pins do mapa
    pinBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pinId = btn.id;
        const isActive = btn.classList.contains('active');

        deactivateAllMapItems();

        if (!isActive) {
          btn.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
          
          // Achar o card correspondente na lista
          const matchingCard = document.querySelector(`.location-card[data-pin="${pinId}"]`);
          if (matchingCard) {
            matchingCard.classList.add('active');
            matchingCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      });
    });

    // Clique nos cards laterais da lista
    locationCards.forEach(card => {
      const handleCardActivation = () => {
        const pinId = card.getAttribute('data-pin');
        deactivateAllMapItems();
        
        card.classList.add('active');
        const matchingPin = document.getElementById(pinId);
        if (matchingPin) {
          matchingPin.classList.add('active');
          matchingPin.setAttribute('aria-expanded', 'true');
          
          // Rolagem visual suave no mapa para o pin em telas menores
          matchingPin.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      };

      card.addEventListener('click', handleCardActivation);
      
      // Acessibilidade por teclado no card
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardActivation();
        }
      });
    });

    // Clicar fora desativa pins ativos do mapa
    document.addEventListener('click', () => {
      deactivateAllMapItems();
    });
  }

  // ==========================================================================
  // 6. Funcionalidade de Lightbox (Tela Cheia para Galeria)
  // ==========================================================================
  const lightbox = document.getElementById('imageLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevLightboxBtn = document.querySelector('.lightbox-prev');
  const nextLightboxBtn = document.querySelector('.lightbox-next');
  const zoomBtns = document.querySelectorAll('.slide-zoom-btn');
  
  // Preferir src das imagens da galeria (grid + slides); fallback para lista estática
  const galleryNodes = Array.from(document.querySelectorAll('[data-gallery-src], .slide img, .galeria-item img'));
  const sliderImages = [];
  const seen = new Set();
  galleryNodes.forEach((el) => {
    const src = el.getAttribute('data-gallery-src') || el.getAttribute('src');
    if (src && !seen.has(src)) {
      seen.add(src);
      sliderImages.push(src);
    }
  });
  if (sliderImages.length === 0) {
    sliderImages.push(
      'images/interno-casasg-1.jpg',
      'images/detalhes-img-casa-sg.jpg',
      'images/inner_projects_background_casasg-2025.jpg'
    );
  }
  let activeLightboxIndex = 0;
  let lastActiveElement = null;

  if (lightbox && lightboxImg && (zoomBtns.length > 0 || document.querySelector('.galeria-item'))) {
    
    const openLightbox = (index) => {
      lastActiveElement = document.activeElement;
      activeLightboxIndex = index;
      lightboxImg.src = sliderImages[activeLightboxIndex];
      lightbox.classList.add('active');
      lightbox.setAttribute('tabindex', '0');
      lightbox.focus();
      
      // Impede rolagem do fundo
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      lightbox.setAttribute('tabindex', '-1');
      document.body.style.overflow = '';
      
      if (lastActiveElement) {
        lastActiveElement.focus();
      }
    };

    const navigateLightbox = (direction) => {
      activeLightboxIndex = (activeLightboxIndex + direction + sliderImages.length) % sliderImages.length;
      lightboxImg.src = sliderImages[activeLightboxIndex];
    };

    const openFromSrc = (src) => {
      const index = sliderImages.indexOf(src);
      openLightbox(index >= 0 ? index : 0);
    };

    // Abre o lightbox ao clicar no botão zoom do slider
    zoomBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const img = btn.closest('.slide')?.querySelector('img');
        const src = img?.getAttribute('data-gallery-src') || img?.getAttribute('src');
        if (src) openFromSrc(src);
      });
    });

    // Galeria completa (showcase) — não abrir lightbox após arrastar;
    // clique em slide inativo só navega até ele
    document.querySelectorAll('.galeria-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (btn.dataset.dragged === '1') {
          e.preventDefault();
          btn.dataset.dragged = '0';
          return;
        }
        if (btn.classList.contains('galeria-slide') && !btn.classList.contains('is-active')) {
          e.preventDefault();
          return;
        }
        const img = btn.querySelector('img');
        const src = img?.getAttribute('data-gallery-src') || img?.getAttribute('src');
        if (src) openFromSrc(src);
      });
    });

    // Fechar botão
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    
    // Navegar
    if (prevLightboxBtn) {
      prevLightboxBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox(-1);
      });
    }
    if (nextLightboxBtn) {
      nextLightboxBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox(1);
      });
    }

    // Clique fora do conteúdo da imagem para fechar
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
        closeLightbox();
      }
    });

    // Eventos de Teclado
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        navigateLightbox(-1);
      } else if (e.key === 'ArrowRight') {
        navigateLightbox(1);
      } else if (e.key === 'Tab') {
        // Trap Focus
        const focusableElements = lightbox.querySelectorAll('button, [tabindex="0"]');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

  // ==========================================================================
  // 6. Exit Intent Pop-up
  // ==========================================================================
  const exitPopup = document.getElementById('exitPopup');
  const exitPopupClose = document.getElementById('exitPopupClose');

  if (exitPopup && exitPopupClose) {
    const STORAGE_KEY = 'casasg_exit_popup_shown';
    let popupShown = false;
    let mobileTimer = null;

    // Exibir o pop-up (apenas 1x por sessão)
    const showExitPopup = () => {
      if (popupShown || sessionStorage.getItem(STORAGE_KEY)) return;
      popupShown = true;
      sessionStorage.setItem(STORAGE_KEY, '1');
      exitPopup.classList.add('active');
      exitPopup.focus();
      document.body.style.overflow = 'hidden';
    };

    // Fechar o pop-up
    const closeExitPopup = () => {
      exitPopup.classList.remove('active');
      document.body.style.overflow = '';
      if (mobileTimer) clearTimeout(mobileTimer);
    };

    // --- Trigger Desktop: mouse saindo pelo topo da janela ---
    // Aguarda 5s antes de ativar o listener para não irritar o usuário ao entrar
    let exitIntentReady = false;
    setTimeout(() => { exitIntentReady = true; }, 5000);

    document.addEventListener('mouseleave', (e) => {
      if (exitIntentReady && e.clientY < 10) {
        showExitPopup();
      }
    });

    // --- Trigger Mobile: timer de 10 segundos em dispositivos touch ---
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      mobileTimer = setTimeout(showExitPopup, 10000);
    }

    // --- Fechar: botão X ---
    exitPopupClose.addEventListener('click', closeExitPopup);

    // --- Fechar: clicar no overlay (fora do card) ---
    exitPopup.addEventListener('click', (e) => {
      if (e.target === exitPopup) closeExitPopup();
    });

    // --- Fechar: tecla Escape (apenas quando o lightbox não está ativo) ---
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && exitPopup.classList.contains('active')) {
        closeExitPopup();
      }
    });
  }

  // ==========================================================================
  // 6b. Galeria completa — showcase GSAP (scroll scrub + drag + snap)
  // ==========================================================================
  (function initGaleriaShowcase() {
    const root = document.getElementById('galeriaShowcase');
    const track = document.getElementById('galeriaShowcaseTrack');
    const viewport = root?.querySelector('.galeria-showcase-viewport');
    const prevBtn = document.getElementById('galeriaShowcasePrev');
    const nextBtn = document.getElementById('galeriaShowcaseNext');
    const counter = document.getElementById('galeriaShowcaseCounter');
    if (!root || !track || !viewport) return;

    const slides = Array.from(track.querySelectorAll('.galeria-slide'));
    if (slides.length === 0) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasGsap = typeof gsap !== 'undefined' && typeof Draggable !== 'undefined';

    if (!hasGsap) {
      root.classList.add('no-gsap');
      slides.forEach((s) => s.classList.add('is-active'));
      return;
    }

    gsap.registerPlugin(Draggable);
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    let activeIndex = 0;
    let didDrag = false;
    let userTookControl = false;
    let draggable = null;
    let scrubTrigger = null;

    const isCompact = () => window.matchMedia('(max-width: 700px)').matches;
    const scrubSlideCount = () => Math.min(isCompact() ? 3 : 4, Math.max(slides.length - 1, 0));

    const getOffsetForIndex = (index) => {
      const slide = slides[index];
      if (!slide) return 0;
      const viewportWidth = viewport.clientWidth;
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      return Math.round(viewportWidth / 2 - slideCenter);
    };

    const updateActive = (index) => {
      activeIndex = Math.max(0, Math.min(index, slides.length - 1));
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === activeIndex);
        slide.setAttribute('aria-current', i === activeIndex ? 'true' : 'false');
      });
      if (counter) counter.textContent = `${activeIndex + 1} / ${slides.length}`;
    };

    const setTrackX = (x) => {
      gsap.set(track, { x });
      if (draggable) draggable.update();
    };

    const applyScrubProgress = (progress) => {
      const max = scrubSlideCount();
      const exact = Math.max(0, Math.min(progress, 1)) * max;
      const a = Math.floor(exact);
      const b = Math.min(a + 1, max);
      const t = exact - a;
      const x = getOffsetForIndex(a) + (getOffsetForIndex(b) - getOffsetForIndex(a)) * t;
      setTrackX(x);
      updateActive(Math.round(exact));
    };

    const goTo = (index, animate = true) => {
      const next = Math.max(0, Math.min(index, slides.length - 1));
      updateActive(next);
      const x = getOffsetForIndex(next);
      if (!animate || reduceMotion) {
        setTrackX(x);
        return;
      }
      gsap.to(track, {
        x,
        duration: 0.75,
        ease: 'power3.out',
        onUpdate: () => { if (draggable) draggable.update(); },
        onComplete: () => { if (draggable) draggable.update(); },
      });
    };

    const nearestIndex = (x) => {
      let best = 0;
      let bestDist = Infinity;
      slides.forEach((_, i) => {
        const dist = Math.abs(x - getOffsetForIndex(i));
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      return best;
    };

    const killScrub = () => {
      if (!scrubTrigger) return;
      scrubTrigger.kill();
      scrubTrigger = null;
      root.classList.remove('is-scrubbing');
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    };

    const takeControl = () => {
      if (userTookControl) return;
      userTookControl = true;
      root.classList.add('is-manual');
      killScrub();
    };

    const setupDraggable = () => {
      if (draggable) {
        draggable.kill();
        draggable = null;
      }
      if (reduceMotion) return;

      draggable = Draggable.create(track, {
        type: 'x',
        inertia: false,
        dragClickables: true,
        allowContextMenu: true,
        edgeResistance: 0.85,
        bounds: {
          minX: getOffsetForIndex(slides.length - 1) - 40,
          maxX: getOffsetForIndex(0) + 40,
        },
        onPress() {
          didDrag = false;
          takeControl();
          viewport.classList.add('is-dragging');
          gsap.killTweensOf(track);
        },
        onDrag() {
          if (Math.abs(this.x - this.startX) > 8 || Math.abs(this.y - this.startY) > 8) {
            didDrag = true;
          }
          updateActive(nearestIndex(this.x));
        },
        onRelease() {
          viewport.classList.remove('is-dragging');
          if (didDrag) {
            slides.forEach((slide) => { slide.dataset.dragged = '1'; });
            setTimeout(() => {
              slides.forEach((slide) => { slide.dataset.dragged = '0'; });
            }, 50);
          }
          goTo(nearestIndex(this.x));
        },
      })[0];
    };

    const setupScrollScrub = () => {
      killScrub();
      if (reduceMotion || userTookControl || typeof ScrollTrigger === 'undefined') return;
      if (scrubSlideCount() < 1) return;

      const compact = isCompact();
      root.classList.add('is-scrubbing');

      scrubTrigger = ScrollTrigger.create({
        trigger: root,
        start: 'top 65%',
        end: 'bottom 45%',
        pin: false,
        scrub: compact ? 0.9 : 0.65,
        invalidateOnRefresh: true,
        onUpdate(self) {
          if (userTookControl) return;
          applyScrubProgress(self.progress);
        },
        onEnter() {
          root.classList.add('is-in-view');
        },
        onLeave() {
          root.classList.remove('is-in-view');
        },
        onLeaveBack() {
          root.classList.remove('is-in-view');
        },
      });
    };

    updateActive(0);
    gsap.set(track, { x: getOffsetForIndex(0) });
    setupDraggable();
    setupScrollScrub();

    const manualGoTo = (index) => {
      takeControl();
      goTo(index);
    };

    prevBtn?.addEventListener('click', () => manualGoTo(activeIndex - 1));
    nextBtn?.addEventListener('click', () => manualGoTo(activeIndex + 1));

    slides.forEach((slide, i) => {
      slide.addEventListener('click', () => {
        if (slide.dataset.dragged === '1') return;
        if (!slide.classList.contains('is-active')) manualGoTo(i);
      });
    });

    viewport.setAttribute('tabindex', '0');
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        manualGoTo(activeIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        manualGoTo(activeIndex + 1);
      }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setupDraggable();
        if (userTookControl) {
          goTo(activeIndex, false);
        } else {
          setupScrollScrub();
          if (scrubTrigger) applyScrubProgress(scrubTrigger.progress);
          else goTo(activeIndex, false);
        }
      }, 160);
    });

    if (!reduceMotion && typeof ScrollTrigger !== 'undefined') {
      gsap.from(viewport, {
        opacity: 0,
        y: 28,
        duration: 0.85,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: root,
          start: 'top 82%',
          once: true,
        },
      });
    }
  })();

  // ==========================================================================
  // 7. Botão flutuante + formulário multi-step — Enviar proposta
  // ==========================================================================
  // Cadastre em https://formspree.io (grátis) e cole a URL do formulário abaixo.
  // Alternativas: Web3Forms (e-mail), Google Sheets + Apps Script, Neon + Worker.
  // Endpoint compartilhado com tracking de WhatsApp (campo "tipo").
  const PROPOSAL_FORM_ENDPOINT = FORMSPREE_ENDPOINT;

  (function initProposalForm() {
    const whatsappFloat = document.querySelector('.whatsapp-float');
    if (!whatsappFloat) return;

    if (!document.querySelector('.site-float-stack')) {
      const stack = document.createElement('div');
      stack.className = 'site-float-stack';
      whatsappFloat.parentNode.insertBefore(stack, whatsappFloat);
      stack.appendChild(whatsappFloat);
    }

    if (!document.querySelector('.proposal-float')) {
      const proposalAside = document.createElement('aside');
      proposalAside.className = 'proposal-float';
      proposalAside.setAttribute('aria-label', 'Enviar proposta de compra');
      proposalAside.hidden = true;
      proposalAside.innerHTML = `
        <div class="proposal-chat" id="proposalChat">
          <div class="proposal-chat-panel" id="proposalChatPanel">
            <button type="button" class="proposal-chat-dismiss" id="proposalChatDismiss" aria-label="Minimizar">&#10005;</button>
            <button type="button" class="proposal-chat-bubble" id="proposalFloatBtn" aria-haspopup="dialog" aria-controls="proposalModal">
            <span class="proposal-chat-copy">
              <span class="proposal-chat-text">Fazer oferta?</span>
            </span>
            </button>
          </div>
          <button type="button" class="proposal-chat-launcher" id="proposalChatLauncher" aria-label="Abrir oferta" aria-expanded="true" aria-controls="proposalChatPanel">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>
          </button>
        </div>`;
      document.querySelector('.site-float-stack').prepend(proposalAside);

      const chatRoot = document.getElementById('proposalChat');
      const chatDismiss = document.getElementById('proposalChatDismiss');
      const chatLauncher = document.getElementById('proposalChatLauncher');
      const COLLAPSE_KEY = 'casasg_proposal_chat_collapsed';
      let revealed = false;

      const setCollapsed = (collapsed) => {
        chatRoot.classList.toggle('is-collapsed', collapsed);
        chatLauncher.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        chatLauncher.setAttribute('aria-label', collapsed ? 'Abrir oferta' : 'Enviar proposta');
        if (collapsed) sessionStorage.setItem(COLLAPSE_KEY, '1');
        else sessionStorage.removeItem(COLLAPSE_KEY);
      };

      const getRevealThreshold = () => Math.max(280, Math.round(window.innerHeight * 0.5));

      const onScrollReveal = () => {
        if (revealed) return;
        if (window.scrollY < getRevealThreshold()) return;
        revealed = true;
        if (sessionStorage.getItem(COLLAPSE_KEY) === '1') setCollapsed(true);
        proposalAside.hidden = false;
        requestAnimationFrame(() => proposalAside.classList.add('is-visible'));
        window.removeEventListener('scroll', onScrollReveal);
      };

      chatDismiss.addEventListener('click', (e) => {
        e.stopPropagation();
        setCollapsed(true);
      });

      chatLauncher.addEventListener('click', () => {
        if (chatRoot.classList.contains('is-collapsed')) {
          setCollapsed(false);
          return;
        }
        document.getElementById('proposalFloatBtn')?.click();
      });

      window.addEventListener('scroll', onScrollReveal, { passive: true });
      onScrollReveal();
    }

    if (document.getElementById('proposalModal')) return;

    document.body.insertAdjacentHTML('beforeend', `
      <div class="proposal-modal-overlay" id="proposalModal" role="dialog" aria-modal="true" aria-labelledby="proposalModalTitle" tabindex="-1">
        <div class="proposal-modal">
          <button type="button" class="proposal-modal-close" id="proposalModalClose" aria-label="Fechar formulário">&#10005;</button>
          <div class="proposal-modal-header">
            <p class="proposal-modal-kicker">Casa no Felicità</p>
            <h2 class="proposal-modal-title" id="proposalModalTitle">Enviar proposta</h2>
            <div class="proposal-steps" aria-hidden="true">
              <span class="proposal-step-dot is-active" data-step-dot="0"></span>
              <span class="proposal-step-dot" data-step-dot="1"></span>
              <span class="proposal-step-dot" data-step-dot="2"></span>
            </div>
          </div>
          <div class="proposal-modal-body">
            <form id="proposalForm" novalidate>
              <div class="proposal-honeypot" aria-hidden="true">
                <label>Não preencha<input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label>
              </div>
              <input type="hidden" name="_subject" value="Nova proposta — casasg.com">
              <input type="hidden" name="pagina_origem" id="proposalPageOrigin">

              <div class="proposal-panel is-active" data-step="0">
                <p class="proposal-panel-title">Seus dados de contato</p>
                <div class="proposal-field">
                  <label for="proposalName">Nome completo *</label>
                  <input type="text" id="proposalName" name="nome" required autocomplete="name">
                </div>
                <div class="proposal-field">
                  <label for="proposalPhone">WhatsApp / telefone *</label>
                  <input type="tel" id="proposalPhone" name="telefone" required autocomplete="tel" placeholder="(54) 99999-9999">
                </div>
                <div class="proposal-field">
                  <label for="proposalEmail">E-mail <span class="proposal-optional">(opcional)</span></label>
                  <input type="email" id="proposalEmail" name="email" autocomplete="email" placeholder="seuhome@email.com">
                </div>
              </div>

              <div class="proposal-panel" data-step="1">
                <p class="proposal-panel-title">Sua oferta</p>
                <div class="proposal-field">
                  <label for="proposalValue">Valor proposto (R$) *</label>
                  <input type="text" id="proposalValue" name="valor_proposta" required inputmode="decimal" placeholder="Ex.: 900.000">
                </div>
                <div class="proposal-field">
                  <label for="proposalPayment">Forma de pagamento *</label>
                  <select id="proposalPayment" name="forma_pagamento" required>
                    <option value="">Selecione...</option>
                    <option value="A vista">À vista</option>
                    <option value="Financiamento">Financiamento bancário</option>
                    <option value="Financiamento + FGTS">Financiamento + FGTS</option>
                    <option value="Permuta">Permuta (troca por outro imóvel)</option>
                    <option value="Combinacao">Combinação / outra forma</option>
                  </select>
                </div>
                <div class="proposal-field" id="proposalPermutaField" hidden>
                  <label for="proposalPermuta">Detalhes da permuta</label>
                  <textarea id="proposalPermuta" name="detalhes_permuta" placeholder="Descreva o imóvel ou condição oferecida"></textarea>
                </div>
              </div>

              <div class="proposal-panel" data-step="2">
                <p class="proposal-panel-title">Confirmação</p>
                <div class="proposal-summary" id="proposalSummary" aria-live="polite"></div>
                <div class="proposal-field">
                  <label for="proposalMessage">Mensagem (opcional)</label>
                  <textarea id="proposalMessage" name="mensagem" placeholder="Prazo, condições ou observações"></textarea>
                </div>
                <label class="proposal-check">
                  <input type="checkbox" id="proposalConsent" name="consentimento_lgpd" value="sim" required>
                  <span>Autorizo o uso dos meus dados para contato sobre esta proposta, conforme a finalidade informada neste site.</span>
                </label>
              </div>

              <div class="proposal-panel" data-step="success" hidden>
                <div class="proposal-success">
                  <div class="proposal-success-icon" aria-hidden="true">&#10003;</div>
                  <p class="proposal-panel-title">Proposta enviada!</p>
                  <p>Recebemos sua oferta. Entraremos em contato em breve pelo WhatsApp ou e-mail informado.</p>
                </div>
              </div>

              <p class="proposal-error" id="proposalError" role="alert"></p>

              <div class="proposal-actions" id="proposalActions">
                <button type="button" class="btn btn-ghost" id="proposalPrev" hidden>Voltar</button>
                <button type="button" class="btn btn-primary" id="proposalNext">Continuar</button>
                <button type="submit" class="btn btn-primary" id="proposalSubmit" hidden>Enviar proposta</button>
              </div>
            </form>
          </div>
        </div>
      </div>`);

    const modal = document.getElementById('proposalModal');
    const openBtn = document.getElementById('proposalFloatBtn');
    const closeBtn = document.getElementById('proposalModalClose');
    const form = document.getElementById('proposalForm');
    const panels = Array.from(form.querySelectorAll('.proposal-panel[data-step="0"], .proposal-panel[data-step="1"], .proposal-panel[data-step="2"]'));
    const successPanel = form.querySelector('.proposal-panel[data-step="success"]');
    const dots = Array.from(document.querySelectorAll('[data-step-dot]'));
    const prevBtn = document.getElementById('proposalPrev');
    const nextBtn = document.getElementById('proposalNext');
    const submitBtn = document.getElementById('proposalSubmit');
    const actions = document.getElementById('proposalActions');
    const errorEl = document.getElementById('proposalError');
    const summaryEl = document.getElementById('proposalSummary');
    const paymentSelect = document.getElementById('proposalPayment');
    const permutaField = document.getElementById('proposalPermutaField');
    const pageOrigin = document.getElementById('proposalPageOrigin');
    let currentStep = 0;
    let lastFocus = null;

    const formatCurrency = (value) => {
      const digits = value.replace(/\D/g, '');
      if (!digits) return '';
      const num = Number(digits);
      return num.toLocaleString('pt-BR');
    };

    const setBtnVisible = (btn, visible) => {
      btn.hidden = !visible;
      btn.setAttribute('aria-hidden', visible ? 'false' : 'true');
      if (!visible) btn.tabIndex = -1;
      else btn.removeAttribute('tabindex');
    };

    const openModal = () => {
      lastFocus = document.activeElement;
      currentStep = 0;
      form.reset();
      permutaField.hidden = true;
      errorEl.classList.remove('is-visible');
      errorEl.textContent = '';
      actions.hidden = false;
      successPanel.hidden = true;
      successPanel.classList.remove('is-active');
      panels.forEach((p) => p.classList.remove('is-active'));
      panels[0].classList.add('is-active');
      updateControls();
      pageOrigin.value = window.location.href;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    };

    const updateControls = () => {
      const isLast = currentStep === 2;
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === currentStep);
        dot.classList.toggle('is-done', i < currentStep);
      });
      setBtnVisible(prevBtn, currentStep > 0);
      setBtnVisible(nextBtn, !isLast);
      setBtnVisible(submitBtn, isLast);
      actions.classList.toggle('is-last-step', isLast);
    };

    const showError = (msg) => {
      errorEl.textContent = msg;
      errorEl.classList.add('is-visible');
    };

    const validateStep = (step) => {
      errorEl.classList.remove('is-visible');
      if (step === 0) {
        const name = document.getElementById('proposalName');
        const email = document.getElementById('proposalEmail');
        const phone = document.getElementById('proposalPhone');
        if (!name.value.trim()) return showError('Informe seu nome.'), false;
        if (!phone.value.trim()) return showError('Informe telefone ou WhatsApp.'), false;
        if (email.value.trim() && !email.checkValidity()) {
          return showError('Se informar e-mail, use um endereço válido.'), false;
        }
      }
      if (step === 1) {
        const value = document.getElementById('proposalValue');
        const payment = document.getElementById('proposalPayment');
        if (!value.value.trim()) return showError('Informe o valor da proposta.'), false;
        if (!payment.value) return showError('Selecione a forma de pagamento.'), false;
      }
      if (step === 2) {
        const consent = document.getElementById('proposalConsent');
        if (!consent.checked) return showError('Confirme o uso dos dados para contato.'), false;
      }
      return true;
    };

    const buildSummary = () => {
      const name = document.getElementById('proposalName').value.trim();
      const email = document.getElementById('proposalEmail').value.trim();
      const phone = document.getElementById('proposalPhone').value.trim();
      const value = document.getElementById('proposalValue').value.trim();
      const payment = document.getElementById('proposalPayment').value;
      const permuta = document.getElementById('proposalPermuta').value.trim();
      const contactLine = email ? `${phone} · ${email}` : phone;
      summaryEl.innerHTML = `
        <strong>${name}</strong><br>
        ${contactLine}<br><br>
        <strong>Oferta:</strong> R$ ${value}<br>
        <strong>Pagamento:</strong> ${payment}${permuta ? `<br><strong>Permuta:</strong> ${permuta}` : ''}`;
    };

    const goToStep = (step) => {
      panels.forEach((p) => p.classList.remove('is-active'));
      successPanel.classList.remove('is-active');
      successPanel.hidden = true;
      panels[step].classList.add('is-active');
      currentStep = step;
      updateControls();
    };

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    paymentSelect.addEventListener('change', () => {
      const isPermuta = paymentSelect.value === 'Permuta' || paymentSelect.value === 'Combinacao';
      permutaField.hidden = !isPermuta;
    });

    document.getElementById('proposalValue').addEventListener('input', (e) => {
      e.target.value = formatCurrency(e.target.value);
    });

    prevBtn.addEventListener('click', () => {
      if (currentStep > 0) goToStep(currentStep - 1);
    });

    nextBtn.addEventListener('click', () => {
      if (!validateStep(currentStep)) return;
      if (currentStep === 1) buildSummary();
      if (currentStep < 2) goToStep(currentStep + 1);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (currentStep !== 2) return;
      if (!validateStep(2)) return;

      if (!PROPOSAL_FORM_ENDPOINT) {
        showError('Formulário em configuração. Por enquanto, envie sua proposta pelo WhatsApp.');
        return;
      }

      submitBtn.disabled = true;
      nextBtn.disabled = true;
      errorEl.classList.remove('is-visible');

      try {
        const data = Object.fromEntries(new FormData(form));
        if (!String(data.email || '').trim()) delete data.email;
        data.tipo = 'proposal_submit';

        const response = await fetch(PROPOSAL_FORM_ENDPOINT, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Não foi possível enviar. Tente novamente.');
        }

        trackEvent('proposal_submit', {
          event_category: 'lead',
          event_label: 'proposal_form',
          page_path: window.location.pathname || '/',
        });

        panels.forEach((p) => p.classList.remove('is-active'));
        successPanel.hidden = false;
        successPanel.classList.add('is-active');
        actions.hidden = true;
        setBtnVisible(nextBtn, false);
        setBtnVisible(submitBtn, false);
        setBtnVisible(prevBtn, false);
        dots.forEach((d) => d.classList.add('is-done'));
      } catch (err) {
        showError(err.message || 'Erro ao enviar. Tente pelo WhatsApp.');
      } finally {
        submitBtn.disabled = false;
        nextBtn.disabled = false;
      }
    });
  })();

  // ==========================================================================
  // 8. Correção de Links Locais para o protocolo file:// (Duplo clique offline)
  // ==========================================================================
  if (window.location.protocol === 'file:') {
    const localLinks = document.querySelectorAll('a[href]');
    localLinks.forEach(link => {
      let href = link.getAttribute('href');
      // Evita links externos, âncoras, links do whatsapp e a raiz
      if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto') && !href.startsWith('tel') && href !== '/' && href !== './') {
        // Se o link não termina com .html, adiciona
        if (!href.endsWith('.html')) {
          // Remove a barra inicial se houver
          if (href.startsWith('/')) {
            href = href.substring(1);
          }
          link.setAttribute('href', href + '.html');
        }
      } else if (href === '/') {
        link.setAttribute('href', 'index.html');
      }
    });
  }

});

