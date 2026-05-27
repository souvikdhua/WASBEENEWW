/* ========================================
   WASABEE - Oriental Cuisine
   Interactive Scripts & Animations
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  // === INJECT MENU IMAGES ===
  const popupItems = document.querySelectorAll('.popup-item');
  popupItems.forEach(item => {
    const nameEl = item.querySelector('.pi-name');
    if (!nameEl) return;
    const itemName = nameEl.textContent.trim();
    const savedImg = localStorage.getItem('menu_image_' + itemName);
    const imgSrc = savedImg ? savedImg : 'images/placeholder-food.jpg?v=19';

    const imgContainer = document.createElement('div');
    imgContainer.className = 'pi-image-container';
    imgContainer.innerHTML = `<img class="pi-image" src="${imgSrc}" alt="${itemName}" loading="lazy">`;
    item.prepend(imgContainer);
  });

  // Start animations
  setTimeout(initAnimations, 100);

  // === THEME TOGGLE ===
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('wasabeeTheme') || 'light';
  
  const navLogoImg = document.getElementById('navLogoImg');
  const heroLogoImg = document.getElementById('heroLogoImg');

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (navLogoImg) navLogoImg.src = 'images/wasabeelogo.png';
      if (heroLogoImg) heroLogoImg.src = 'images/graphic 5.jpg';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (navLogoImg) navLogoImg.src = 'images/wasabeelogo.png';
      if (heroLogoImg) heroLogoImg.src = 'images/graphic 5.jpg';
    }
  }

  // Apply on load
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      localStorage.setItem('wasabeeTheme', newTheme);
      applyTheme(newTheme);
    });
  }


  // === NAVIGATION ===
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.hamburger');
  const menuOverlay = document.querySelector('.menu-overlay');
  const menuLinks = document.querySelectorAll('.menu-overlay-links a');
  
  // Scroll detection logic removed so the navbar stays absolute and scrolls away
  
  // Hamburger toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      menuOverlay.classList.toggle('active');
      
      if (menuOverlay.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  // Scroll Detection for Waveline
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  });
  
  // Close overlay on link click
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      menuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // === HERO TITLE CHARACTER ANIMATION ===
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    const text = heroTitle.textContent;
    heroTitle.innerHTML = '';
    
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.animationDelay = `${2 + i * 0.08}s`;
      heroTitle.appendChild(span);
    });
  }

  // === SMOOTH SCROLL FOR NAV LINKS ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: top,
          behavior: 'smooth'
        });
      }
    });
  });

  // === MAIN ANIMATIONS INIT ===
  function initAnimations() {
    // Scroll Reveal (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .img-reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Don't unobserve so we can add stagger delay
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach((el, i) => {
      // Add stagger delay for sibling elements
      if (el.dataset.delay) {
        el.style.transitionDelay = el.dataset.delay + 's';
      }
      revealObserver.observe(el);
    });

    // === PARALLAX ===
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    function updateParallax() {
      const scrollY = window.scrollY;
      
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        const rect = el.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const offset = (centerY - window.innerHeight / 2) * speed;
        el.style.setProperty('--parallax-y', offset + 'px');
      });
    }
    
    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();

    // === COUNTER ANIMATION ===
    const counters = document.querySelectorAll('[data-count]');
    
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          const duration = 2000;
          const start = performance.now();
          
          function updateCounter(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out expo
            const ease = 1 - Math.pow(2, -10 * progress);
            
            const isDecimal = target % 1 !== 0;
            const current = isDecimal 
              ? (ease * target).toFixed(1) 
              : Math.floor(ease * target);
            
            el.textContent = current + suffix;
            
            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = target + suffix;
            }
          }
          
          requestAnimationFrame(updateCounter);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    
    counters.forEach(el => counterObserver.observe(el));

    // === SAKURA PETALS ===
    const sakuraContainer = document.getElementById('sakuraContainer');
    if (sakuraContainer) {
      function createPetal() {
        const petal = document.createElement('div');
        petal.className = 'sakura-petal';
        
        const size = 6 + Math.random() * 8; /* Smaller, delicate petals */
        const startX = Math.random() * 100;
        const duration = 10 + Math.random() * 14; /* Slower, gentler fall */
        const delay = Math.random() * 15;
        const drift = -60 + Math.random() * 120;
        
        petal.style.cssText = `
          left: ${startX}%;
          top: -20px;
          width: ${size}px;
          height: ${size}px;
          --sakura-drift: ${drift}px;
          animation-duration: ${duration}s;
          animation-delay: ${delay}s;
        `;
        
        sakuraContainer.appendChild(petal);

        // Remove and recreate after animation completes
        setTimeout(() => {
          petal.remove();
          createPetal();
        }, (delay + duration) * 1000);
      }

      // Create initial batch of petals - rarer for a delicate atmosphere
      const petalCount = window.innerWidth < 768 ? 6 : 14;
      for (let i = 0; i < petalCount; i++) {
        createPetal();
      }
    }

    // === ENSO CIRCLE REVEAL ===
    const ensoCircle = document.querySelector('.enso-circle');
    if (ensoCircle) {
      const ensoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            ensoCircle.style.animationPlayState = 'running';
            ensoObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      ensoObserver.observe(ensoCircle.closest('.philosophy') || ensoCircle);
    }
  }

  // === GALLERY LIGHTBOX ===
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img && lightboxImg && lightbox) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });
  
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.closest('.lightbox-close')) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Menu category filtering handled by Advanced Menu System below

  // === MARQUEE DUPLICATE ===
  const marqueeTracks = document.querySelectorAll('.marquee-track');
  marqueeTracks.forEach(track => {
    const clone = track.innerHTML;
    track.innerHTML += clone;
  });

  // Scroll progress handled in updateBrandingScroll below

  // === IMAGE LAZY LOADING ===
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '200px'
  });
  
  lazyImages.forEach(img => imageObserver.observe(img));

  // === MAGNETIC BUTTON EFFECT ===
  const magneticBtns = document.querySelectorAll('.cta-btn');
  
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  // === TEXT SPLIT FOR SECTION TITLES (add stagger) ===
  document.querySelectorAll('.stagger-words').forEach(el => {
    const words = el.textContent.split(' ');
    el.innerHTML = words.map((word, i) => 
      `<span class="word" style="animation-delay: ${i * 0.1}s">${word}</span>`
    ).join(' ');
  });


  // === HERO BACKGROUND REVEAL (STATIC) ===
  const heroSlide = document.querySelector('#hero .hero-bg img');
  if (heroSlide) {
    heroSlide.classList.add('active');
  }

  // === BRANDING SCROLL MOTION ===
  const heroScrollText = document.querySelector('.hero-scroll-text');
  function updateBrandingScroll() {
    const scrollY = window.scrollY;
    
    // Parallax branding text: slides left as user scrolls down
    if (heroScrollText) {
      const xOffset = scrollY * 0.35;
      heroScrollText.style.transform = `translate(calc(-50% - ${xOffset}px), -55%)`;
    }
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateBrandingScroll);
  }, { passive: true });


  // === ADVANCED MENU SYSTEM (TABS & SEARCH) ===
  const menuSearch = document.getElementById('menu-search');
  const menuTabs = document.querySelectorAll('.menu-cat-btn');
  const menuGrid = document.querySelector('.menu-grid');
  const allMenuItems = document.querySelectorAll('.menu-item');

  function filterMenu() {
    const searchTerm = menuSearch ? menuSearch.value.toLowerCase().trim() : '';
    const activeCategory = document.querySelector('.menu-cat-btn.active').getAttribute('data-category');

    allMenuItems.forEach(item => {
      const itemTitle = item.querySelector('h4').textContent.toLowerCase();
      const itemDesc = item.querySelector('p').textContent.toLowerCase();
      const itemCat = item.getAttribute('data-category');
      
      const matchesSearch = itemTitle.includes(searchTerm) || itemDesc.includes(searchTerm);
      const matchesCategory = activeCategory === 'all' || itemCat === activeCategory;

      if (matchesSearch && matchesCategory) {
        item.style.display = 'flex';
        item.classList.add('visible');
      } else {
        item.style.display = 'none';
        item.classList.remove('visible');
      }
    });

    // Show/hide category graphic header cards based on active category
    const graphicCards = document.querySelectorAll('.menu-cat-graphic-card');
    graphicCards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      const matchesCategory = activeCategory === 'all' || cardCat === activeCategory;
      // If searching, hide all graphic cards to show flat list
      card.style.display = (matchesCategory && !searchTerm) ? 'flex' : 'none';
    });

    // Cleanup empty sections or empty grid state
    const visibleItems = Array.from(allMenuItems).filter(i => i.style.display !== 'none');
    if (visibleItems.length === 0) {
      // Could show a 'No items found' message here if desired
    }
  }


  // Tab Filtering logic
  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Animation sequence
      menuGrid.classList.add('switching');
      
      setTimeout(() => {
        menuTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        filterMenu();
        
        // Reset animation
        menuGrid.classList.remove('switching');
        
        // Mobile: Scroll tab into view if overflowing
        tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }, 300);
    });
  });

  // Search logic
  if (menuSearch) {
    menuSearch.addEventListener('input', filterMenu);
  }

  // Initialize menu on page load — ensure all items are visible
  if (allMenuItems.length > 0) {
    filterMenu();
  }

  // === MENU CINEMATIC HOVER REVEAL ===
  const menuBg = document.querySelector('.menu-cinematic-bg');
  const menuSection = document.querySelector('.menu-section');
  
  // Mapping categories to high-res images
  const categoryImages = {
    'dumplings': 'images/slide 1.jpg',
    'sushi': 'images/slide 2.jpg',
    'korean-sushi': 'images/slide. 3.jpg',
    'default': 'images/slide 1.jpg'
  };

  allMenuItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const cat = item.getAttribute('data-category');
      const imgPath = categoryImages[cat] || categoryImages['default'];
      if (menuBg) {
        menuBg.style.backgroundImage = `url('${imgPath}')`;
        menuBg.style.opacity = '0.15';
        if (menuSection) menuSection.classList.add('hover-active');
      }
    });
    
    item.addEventListener('mouseleave', () => {
      if (menuBg) menuBg.style.opacity = '0';
      if (menuSection) menuSection.classList.remove('hover-active');
    });
  });

  // === LIVE INSTAGRAM FEED PARSER ===
  async function loadInstagramFeed() {
    const grid = document.querySelector('.insta-grid');
    if (!grid) return;
    
    try {
      // Bypassing brutal CORS/Graph blocks securely via proxy
      const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.instagram.com/wasabeekolkata/?__a=1&__d=dis'));
      const data = await response.json();
      const igData = JSON.parse(data.contents);
      
      const user = igData.graphql.user;
      const edges = user.edge_owner_to_timeline_media.edges.slice(0, 4);
      
      if (edges.length > 0) {
        grid.innerHTML = ''; // Clear fallback SVGs
        edges.forEach(edge => {
          const imgUrl = edge.node.thumbnail_src;
          const postUrl = `https://www.instagram.com/p/${edge.node.shortcode}/`;
          grid.innerHTML += `
            <a href="${postUrl}" target="_blank" class="insta-item">
              <img src="${imgUrl}" alt="Wasabee Instagram Post">
              <div class="insta-overlay"><svg viewBox="0 0 24 24" width="32" height="32" fill="#FAF7F2"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></div>
            </a>
          `;
        });
      }
    } catch(err) {
      console.log('Instagram strict token blockage intercepted the fetch. Retaining high-end placeholders.');
    }
  }
  
  loadInstagramFeed();

  // ═══════════════════════════════════════════════════════
  // MENU POSTER → POPUP DRAWER SYSTEM
  // ═══════════════════════════════════════════════════════
  const popupOverlay  = document.getElementById('menu-popup-overlay');
  const posterCards   = document.querySelectorAll('.menu-poster-card');
  let activePopup     = null;

  function openPopup(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup || !popupOverlay) return;

    // Close any currently open popup first
    if (activePopup && activePopup !== popup) {
      activePopup.classList.remove('is-active');
    }

    popupOverlay.classList.add('is-open');
    popupOverlay.setAttribute('aria-hidden', 'false');
    popup.classList.add('is-active');
    document.body.classList.add('popup-open');

    // Scroll popup body back to top each open
    const body = popup.querySelector('.popup-body');
    if (body) body.scrollTop = 0;

    activePopup = popup;
  }

  function closePopup() {
    if (!activePopup || !popupOverlay) return;
    activePopup.classList.remove('is-active');
    popupOverlay.classList.remove('is-open');
    popupOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('popup-open');
    activePopup = null;
  }

  // Poster card clicks → open popup
  posterCards.forEach(card => {
    card.addEventListener('click', () => {
      const popupId = card.getAttribute('data-popup');
      if (popupId) openPopup(popupId);
    });
    // Keyboard: Enter / Space
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const popupId = card.getAttribute('data-popup');
        if (popupId) openPopup(popupId);
      }
    });
  });

  // Backdrop click → close
  const backdrop = popupOverlay ? popupOverlay.querySelector('.menu-popup-backdrop') : null;
  if (backdrop) backdrop.addEventListener('click', closePopup);

  // Close button clicks
  document.querySelectorAll('.popup-close').forEach(btn => {
    btn.addEventListener('click', closePopup);
  });

  // Escape key → close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && activePopup) closePopup();
  });



  // === PREMIUM TABLE BOOKING MODAL HANDLERS ===
  const bookingModal = document.getElementById('bookingModal');
  const closeBookingModalBtn = document.getElementById('closeBookingModal');
  const bookingForm = document.getElementById('bookingModalForm');
  const bookingDateInput = document.getElementById('bookingDate');

  // Trigger modal display on clicking any "Book a Table" button
  const bookTableButtons = document.querySelectorAll('a[href="#reservation"]');
  bookTableButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Initialize Date restrictions on click
      if (bookingDateInput) {
        const today = new Date().toISOString().split('T')[0];
        bookingDateInput.setAttribute('min', today);
        if (!bookingDateInput.value) {
          bookingDateInput.value = today;
        }
      }
      
      if (bookingModal) {
        bookingModal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Lock body scrolling
      }
    });
  });

  // Close modal logic
  function closeBookingModal() {
    if (bookingModal) {
      bookingModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (closeBookingModalBtn) {
    closeBookingModalBtn.addEventListener('click', closeBookingModal);
  }

  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        closeBookingModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookingModal && bookingModal.classList.contains('open')) {
      closeBookingModal();
    }
  });

  // WhatsApp form checkout logic
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const date = document.getElementById('bookingDate').value;
      const time = document.getElementById('bookingTime').value;
      const guests = document.querySelector('input[name="guests"]:checked')?.value || '2 Guests';
      const name = document.getElementById('bookingName').value;
      
      // Beautiful direct booking summary for WhatsApp
      const message = `Hi Wasabee! 🍣\nI would like to book a table at your restaurant.\n\n👤 *Name:* ${name}\n👥 *Party Size:* ${guests}\n📅 *Date:* ${date}\n⏰ *Time Slot:* ${time}\n\nPlease confirm my reservation. Thank you!`;
      
      const waUrl = `https://wa.me/919163764444?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
      
      closeBookingModal();
    });
  }

});

// === FADE IN UP KEYFRAME (used by JS) ===
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

// (WebGL point animation removed)

// === OPEN/CLOSED STATUS BADGE ===
(function() {
  const badge = document.getElementById('statusBadge');
  if (!badge) return;

  function updateStatus() {
    // Use IST (UTC+5:30)
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const ist = new Date(utc + 5.5 * 3600000);
    const h = ist.getHours();
    const m = ist.getMinutes();
    const t = h * 60 + m; // minutes since midnight IST

    // Restaurant hours: 12:00-15:00 and 18:00-22:30
    const isOpen = (t >= 720 && t < 900) || (t >= 1080 && t < 1350);

    if (isOpen) {
      badge.className = 'status-badge open';
      badge.textContent = 'Open Now';
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }

  updateStatus();
  setInterval(updateStatus, 60000); // Update every minute
})();

// === CART BACKDROP HANDLER ===
(function() {
  const backdrop = document.getElementById('cartBackdrop');
  const cartWidget = document.getElementById('waCartWidget');
  if (!backdrop || !cartWidget) return;

  // Watch for cart open/close and toggle backdrop & body shift
  const observer = new MutationObserver(function() {
    if (cartWidget.classList.contains('open')) {
      backdrop.classList.add('active');
      document.body.classList.add('cart-open');
    } else {
      backdrop.classList.remove('active');
      document.body.classList.remove('cart-open');
    }
  });

  observer.observe(cartWidget, { attributes: true, attributeFilter: ['class'] });

  // Close cart when clicking backdrop
  backdrop.addEventListener('click', function() {
    cartWidget.classList.remove('open');
    backdrop.classList.remove('active');
  });
})();

// === HORIZONTAL SCROLL BUTTONS ===
(function() {
  const groups = document.querySelectorAll('.unified-category-group');
  groups.forEach(group => {
    const list = group.querySelector('.unified-items-list');
    if (!list) return;

    // Create Left Button
    const leftBtn = document.createElement('button');
    leftBtn.className = 'category-scroll-btn left';
    leftBtn.setAttribute('aria-label', 'Scroll left');
    leftBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
    
    // Create Right Button
    const rightBtn = document.createElement('button');
    rightBtn.className = 'category-scroll-btn right';
    rightBtn.setAttribute('aria-label', 'Scroll right');
    rightBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

    // Click logic
    leftBtn.addEventListener('click', () => {
      list.scrollBy({ left: -300, behavior: 'smooth' });
    });
    rightBtn.addEventListener('click', () => {
      list.scrollBy({ left: 300, behavior: 'smooth' });
    });

    // Append to group
    group.appendChild(leftBtn);
    group.appendChild(rightBtn);

    // Toggle visibility based on scroll position
    function updateBtnVisibility() {
      const scrollLeft = list.scrollLeft;
      const maxScroll = list.scrollWidth - list.clientWidth;
      
      leftBtn.style.opacity = scrollLeft > 10 ? '1' : '0';
      leftBtn.style.pointerEvents = scrollLeft > 10 ? 'auto' : 'none';
      
      rightBtn.style.opacity = scrollLeft < maxScroll - 10 ? '1' : '0';
      rightBtn.style.pointerEvents = scrollLeft < maxScroll - 10 ? 'auto' : 'none';
    }

    list.addEventListener('scroll', updateBtnVisibility);
    window.addEventListener('resize', updateBtnVisibility);
    // Initial check after content loads
    setTimeout(updateBtnVisibility, 600);
  });
})();

// === UNIFIED MENU TAB SWITCHING ===
(function() {
  const navLinks = document.querySelectorAll('.unified-nav-link');
  const categories = document.querySelectorAll('.unified-category-group');
  if (navLinks.length === 0 || categories.length === 0) return;

  function switchTab(targetId) {
    // Hide all categories
    categories.forEach(cat => {
      cat.style.display = 'none';
    });

    // Show selected category
    const activeCat = document.getElementById(targetId);
    if (activeCat) {
      activeCat.style.display = 'block';
    }

    // Update active class on nav links
    navLinks.forEach(link => {
      if (link.getAttribute('href') === '#' + targetId) {
        link.classList.add('active');
        link.style.color = 'var(--color-brand)';
      } else {
        link.classList.remove('active');
        link.style.removeProperty('color');
      }
    });

    // Reset horizontal scroll button visibilities inside the newly shown category
    const list = activeCat ? activeCat.querySelector('.unified-items-list') : null;
    if (list) {
      const leftBtn = activeCat.querySelector('.category-scroll-btn.left');
      const rightBtn = activeCat.querySelector('.category-scroll-btn.right');
      if (leftBtn && rightBtn) {
        // Delay slightly to allow element display to layout before checking dimensions
        setTimeout(() => {
          const scrollLeft = list.scrollLeft;
          const maxScroll = list.scrollWidth - list.clientWidth;
          leftBtn.style.opacity = scrollLeft > 10 ? '1' : '0';
          leftBtn.style.pointerEvents = scrollLeft > 10 ? 'auto' : 'none';
          rightBtn.style.opacity = scrollLeft < maxScroll - 10 ? '1' : '0';
          rightBtn.style.pointerEvents = scrollLeft < maxScroll - 10 ? 'auto' : 'none';
        }, 50);
      }
    }
  }

  // Bind clicks
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      switchTab(targetId);
      
      // Auto-scroll the active chip to the center of the horizontal container for premium mobile UX
      this.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      
      // Scroll the menu container into view smoothly
      const menuSection = document.getElementById('menu');
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Initialize: activate the default active category from HTML markup
  const activeLink = document.querySelector('.unified-nav-link.active');
  const firstId = activeLink ? activeLink.getAttribute('href').substring(1) : navLinks[0].getAttribute('href').substring(1);
  switchTab(firstId);
})();

// === AUTO-SCROLL GALLERY ===
(function() {
  const gallery = document.querySelector('.gallery-grid');
  if (!gallery) return;

  const speed = 0.8; // Speed in pixels per frame (~50px per second)
  let scrollPos = gallery.scrollLeft; // Accumulate sub-pixel updates
  let autoScrollActive = true;

  function startAutoScroll() {
    setInterval(() => {
      if (!autoScrollActive) {
        scrollPos = gallery.scrollLeft; // Keep synced when manual scrolling
        return;
      }
      
      scrollPos += speed;
      gallery.scrollLeft = Math.round(scrollPos);
      
      // Reset scroll when reaching the end of contents
      const maxScroll = gallery.scrollWidth - gallery.clientWidth;
      if (gallery.scrollLeft >= maxScroll - 5) {
        scrollPos = 0;
        gallery.scrollLeft = 0;
      }
    }, 16); // ~60fps smooth rendering
  }

  // Intercept and pause auto-scroll during hover or manual touch scroll
  gallery.addEventListener('mouseenter', () => { autoScrollActive = false; });
  gallery.addEventListener('mouseleave', () => { 
    autoScrollActive = true; 
    scrollPos = gallery.scrollLeft; // Reset position pointer on exit
  });
  gallery.addEventListener('touchstart', () => { autoScrollActive = false; }, { passive: true });
  gallery.addEventListener('touchend', () => { 
    autoScrollActive = true; 
    scrollPos = gallery.scrollLeft; // Reset position pointer on exit
  });

  startAutoScroll();
})();
