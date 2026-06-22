document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================================================
  // 1. Menu Responsivo (Mobile Navigation Toggle)
  // ==========================================================================
  const toggleBtn = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', !expanded);
      navMenu.classList.toggle('active');
      
      // Simples toggle visual no CSS de mobile
      if (navMenu.style.display === 'flex') {
        navMenu.style.display = 'none';
      } else {
        navMenu.style.display = 'flex';
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.width = '100%';
        navMenu.style.backgroundColor = 'var(--bg-glass)';
        navMenu.style.backdropFilter = 'blur(10px)';
        navMenu.style.padding = '2rem';
        navMenu.style.borderBottom = '1px solid var(--border-glass)';
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
  
  // Mapeamento dos caminhos das imagens
  const sliderImages = [
    'images/interno-casasg-1.jpg',
    'images/detalhes-img-casa-sg.jpg',
    'images/inner_projects_background_casasg-2025.jpg'
  ];
  let activeLightboxIndex = 0;
  let lastActiveElement = null;

  if (lightbox && lightboxImg && zoomBtns.length > 0) {
    
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

    // Abre o lightbox ao clicar no botão zoom
    zoomBtns.forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(index);
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

});
