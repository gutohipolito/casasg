document.addEventListener('DOMContentLoaded', () => {
  
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

    // Galeria em grade
    document.querySelectorAll('.galeria-item').forEach((btn) => {
      btn.addEventListener('click', () => {
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
  // 7. Botão flutuante + formulário multi-step — Enviar proposta
  // ==========================================================================
  // Cadastre em https://formspree.io (grátis) e cole a URL do formulário abaixo.
  // Alternativas: Web3Forms (e-mail), Google Sheets + Apps Script, Neon + Worker.
  const PROPOSAL_FORM_ENDPOINT = 'https://formspree.io/f/meajbggp';

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
      proposalAside.innerHTML = `
        <button type="button" class="proposal-float-btn" id="proposalFloatBtn" aria-haspopup="dialog" aria-controls="proposalModal">
          <span class="proposal-float-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </span>
          <span class="proposal-float-label">Fazer oferta?</span>
        </button>`;
      document.querySelector('.site-float-stack').prepend(proposalAside);
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
                  <label for="proposalEmail">E-mail *</label>
                  <input type="email" id="proposalEmail" name="email" required autocomplete="email">
                </div>
                <div class="proposal-field">
                  <label for="proposalPhone">WhatsApp / telefone *</label>
                  <input type="tel" id="proposalPhone" name="telefone" required autocomplete="tel" placeholder="(54) 99999-9999">
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
                  <p>Recebemos sua oferta. Entraremos em contato em breve pelo e-mail ou WhatsApp informado.</p>
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
    const panels = Array.from(form.querySelectorAll('.proposal-panel[data-step]'));
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

    const openModal = () => {
      lastFocus = document.activeElement;
      currentStep = 0;
      form.reset();
      permutaField.hidden = true;
      errorEl.classList.remove('is-visible');
      errorEl.textContent = '';
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
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === currentStep);
        dot.classList.toggle('is-done', i < currentStep);
      });
      prevBtn.hidden = currentStep === 0;
      nextBtn.hidden = currentStep === 2;
      submitBtn.hidden = currentStep !== 2;
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
        if (!email.checkValidity()) return showError('Informe um e-mail válido.'), false;
        if (!phone.value.trim()) return showError('Informe telefone ou WhatsApp.'), false;
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
      summaryEl.innerHTML = `
        <strong>${name}</strong><br>
        ${email} · ${phone}<br><br>
        <strong>Oferta:</strong> R$ ${value}<br>
        <strong>Pagamento:</strong> ${payment}${permuta ? `<br><strong>Permuta:</strong> ${permuta}` : ''}`;
    };

    const goToStep = (step) => {
      panels.forEach((p) => p.classList.remove('is-active'));
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
      if (!validateStep(2)) return;

      if (!PROPOSAL_FORM_ENDPOINT) {
        showError('Formulário em configuração. Por enquanto, envie sua proposta pelo WhatsApp.');
        return;
      }

      submitBtn.disabled = true;
      nextBtn.disabled = true;
      errorEl.classList.remove('is-visible');

      try {
        const response = await fetch(PROPOSAL_FORM_ENDPOINT, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Não foi possível enviar. Tente novamente.');
        }

        panels.forEach((p) => p.classList.remove('is-active'));
        form.querySelector('[data-step="success"]').classList.add('is-active');
        form.querySelector('[data-step="success"]').hidden = false;
        actions.hidden = true;
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

