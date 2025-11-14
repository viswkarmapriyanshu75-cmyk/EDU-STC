class LittleGeniusApp {
  constructor() {
    this.navLinks = document.querySelectorAll('.nav-link:not(.dropdown-toggle)');
    this.dropdownToggle = document.querySelector('.dropdown-toggle');
    this.dropdownContent = document.querySelector('.dropdown-content');
    this.sections = document.querySelectorAll('section[id]');
    this.menuToggle = document.getElementById('menuToggle');
    this.navContainer = document.querySelector('.nav-container');
    this.isScrolling = false;
    this.lastScrollTop = 0;
    this.scrollDebounced = this.debounce(this.updateActiveNavLink.bind(this), 100);
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupObservers();
    this.setupAccessibility();
    this.setupPerformanceOptimizations();
    this.setupLazyLoading();
    this.setupThemeToggle();
    this.setupAnalytics();
    this.injectStyles();
    console.log('%c🚀 Little Genius App Initialized - Responsive & Mobile-Friendly', 'color: #00d4ff; font-weight: bold;');
  }

  setupEventListeners() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', this.handleNavClick.bind(this));
      link.addEventListener('mouseenter', this.handleNavHover.bind(this));
    });

    if (this.dropdownToggle) {
      this.dropdownToggle.addEventListener('click', this.handleDropdownToggle.bind(this));
      document.addEventListener('click', this.handleClickOutsideDropdown.bind(this));
    }

    if (this.menuToggle && this.navContainer) {
      this.menuToggle.addEventListener('click', this.handleMenuToggle.bind(this));
    }

    this.setupFormHandlers();
    this.setupCTAButtons();

    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250), { passive: true });

    document.addEventListener('touchstart', e => this.touchStartX = e.changedTouches[0].screenX, { passive: true });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
  }

  handleNavClick(e) {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    if (!targetSection) return;

    this.setActiveNavLink(e.currentTarget);
    this.closeMobileMenu();
    this.smoothScrollTo(targetSection, window.innerWidth <= 768 ? 60 : 100);
    this.trackEvent('navigation_click', { target: targetId });
  }

  handleNavHover(link) { if (window.innerWidth > 768) link.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'; }

  setActiveNavLink(activeLink) {
    this.navLinks.forEach(link => link.classList.remove('active'));
    if (activeLink) activeLink.classList.add('active');
  }

  updateActiveNavLink() {
    if (this.isScrolling) return;
    const offset = window.innerWidth <= 768 ? 80 : 150;
    const scrollPosition = window.scrollY + offset;
    let activeSectionId = null;

    this.sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        activeSectionId = section.getAttribute('id');
      }
    });
    if (activeSectionId) {
      const activeLink = document.querySelector(`.nav-link[href="#${activeSectionId}"]`);
      this.setActiveNavLink(activeLink);
    }
  }

  handleDropdownToggle(e) {
    e.stopPropagation();
    this.dropdownContent.classList.toggle('active');
    this.dropdownToggle.classList.toggle('active');
  }

  handleClickOutsideDropdown(e) {
    if (!this.dropdownToggle.contains(e.target)) {
      this.dropdownContent.classList.remove('active');
      this.dropdownToggle.classList.remove('active');
    }
  }

  handleMenuToggle() {
    const isActive = this.navContainer.classList.toggle('active');
    this.menuToggle.classList.toggle('active');
    document.body.style.overflow = isActive ? 'hidden' : '';
    document.body.classList.toggle('menu-open', isActive);
    this.trackEvent('mobile_menu_toggle', { state: isActive ? 'open' : 'closed' });
  }

  closeMobileMenu() {
    if (this.navContainer.classList.contains('active')) {
      this.handleMenuToggle();
    }
  }

  handleTouchEnd(e) {
    this.touchEndX = e.changedTouches[0].screenX;
    if (this.touchStartX - this.touchEndX > 50) {
      this.closeMobileMenu();
    }
  }

  setupObservers() {
    const observerOptions = { threshold: 0.2, rootMargin: '0px 0px -100px 0px' };
    this.intersectionObserver = new IntersectionObserver(this.handleIntersection.bind(this), observerOptions);

    document.querySelectorAll('.about-card, .product-card, .course-card, .stat-card, .info-card, .faq-item, .bundle-card, .path-step')
      .forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        this.intersectionObserver.observe(el);
      });

    this.mutationObserver = new MutationObserver(this.handleMutation.bind(this));
    this.mutationObserver.observe(document.body, { childList: true, subtree: true });

    this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
    this.resizeObserver.observe(document.body);
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        const el = entry.target;
        const siblings = Array.from(el.parentNode.children);
        const index = siblings.indexOf(el);
        const delay = index * 100;
        setTimeout(() => {
          el.style.opacity = 1;
          el.style.transform = 'translateY(0)';
          el.classList.add('animated');
        }, delay);
        this.intersectionObserver.unobserve(el);
      }
    });
  }

  handleMutation(mutations) {
    mutations.forEach(mutation => {
      if(mutation.addedNodes.length){
        mutation.addedNodes.forEach(node => {
          if(node.nodeType === 1 && node.matches('.about-card, .product-card')) {
            this.intersectionObserver.observe(node);
          }
        });
      }
    });
  }

  handleResize() {
    if(window.innerWidth > 768) {
      this.closeMobileMenu();
    }
  }

  setupCTAButtons() {
    document.querySelectorAll('.cta-button').forEach(button => {
      button.addEventListener('click', e => this.handleCTAClick(e, button));
      button.addEventListener('pointerdown', e => this.createRipple(e, button));
    });
  }

  handleCTAClick(e, button) {
    if(button.classList.contains('btn-submit')) return;
    e.preventDefault();
    const targetId = button.getAttribute('href') || button.dataset.target || '#create';
    const targetSection = document.querySelector(targetId);
    if(targetSection) {
      this.smoothScrollTo(targetSection, window.innerWidth <= 768 ? 60 : 100);
      this.trackEvent('cta_click', { label: button.textContent.trim(), target: targetId });
    }
  }

  createRipple(e, button) {
    if(window.innerWidth <= 768) return; // disable ripple on mobile for performance
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
  }

  setupFormHandlers() {
    const forms = {
      enrollment: document.getElementById('enrollmentForm'),
      contact: document.getElementById('contactForm')
    };
    Object.values(forms).forEach(form => {
      if(form) {
        form.addEventListener('submit', e => this.handleFormSubmit(e, form));
        form.querySelectorAll('input, select, textarea').forEach(field => {
          field.addEventListener('blur', () => this.validateFormField(field));
          field.addEventListener('input', this.debounce(() => this.validateFormField(field), 300));
        });
      }
    });
  }

  handleFormSubmit(e, form) {
    e.preventDefault();
    if(!this.validateForm(form)){
      this.showNotification('⚠️ Please correct the highlighted fields.', 'error');
      form.querySelector(':invalid')?.focus();
      return;
    }
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Submitting...';

    setTimeout(() => {
      this.showNotification('✅ Submission successful! We\'ll be in touch soon.', 'success');
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      this.trackEvent('form_submission', { formId: form.id });
    }, 1200);
  }

  validateForm(form) {
    let isValid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if(!this.validateFormField(field)) isValid = false;
    });
    return isValid;
  }

  validateFormField(field) {
    field.setCustomValidity('');
    if(field.required && !field.value.trim()) {
      field.setCustomValidity('This field is required');
      field.classList.add('invalid');
      return false;
    }
    if(field.type === 'email' && field.value.trim()) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if(!emailRegex.test(field.value.trim())) {
        field.setCustomValidity('Please enter a valid email address');
        field.classList.add('invalid');
        return false;
      }
    }
    if(field.type === 'tel' && field.value.trim()) {
      const phoneRegex = /^[+]?[\d\s()-]{10,}$/;
      if(!phoneRegex.test(field.value.trim())){
        field.setCustomValidity('Please enter a valid phone number');
        field.classList.add('invalid');
        return false;
      }
    }
    field.classList.toggle('invalid', !field.validity.valid);
    return field.validity.valid;
  }

  handleScroll() {
    this.scrollDebounced();

    const header = document.querySelector('.header');
    const scrollTop = window.scrollY;
    header.classList.toggle('scrolled', scrollTop > 50);

    if(this.lastScrollTop !== undefined && scrollTop > this.lastScrollTop && scrollTop > 100){
      header.style.transform = 'translateY(-100%)';
    }
    else{
      header.style.transform = 'translateY(0)';
    }
    this.lastScrollTop = scrollTop;
  }

  smoothScrollTo(element, offset = 100) {
    this.isScrolling = true;
    const startPosition = window.pageYOffset;
    const targetPosition = element.getBoundingClientRect().top + startPosition - offset;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let startTime = null;

    const animation = currentTime => {
      if(startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = this.ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if(timeElapsed < duration) requestAnimationFrame(animation);
      else this.isScrolling = false;
    };
    requestAnimationFrame(animation);
  }

  ease(t, b, c, d) {
    t /= d/2;
    if(t < 1) return c/2*t*t + b;
    t--;
    return -c/2*(t*(t-2)-1) + b;
  }

  setupAccessibility() {
    this.navLinks.forEach(link => {
      link.setAttribute('role', 'menuitem');
      link.setAttribute('aria-label', `Navigate to ${link.textContent}`);
    });
    if(this.menuToggle) {
      this.menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
      this.menuToggle.setAttribute('aria-expanded', 'false');
    }
    const skipLink = document.createElement('a');
    skipLink.href = '#home';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to content';
    document.body.prepend(skipLink);
    if(this.navContainer){
      this.navContainer.setAttribute('role', 'navigation');
      this.navContainer.setAttribute('aria-label', 'Main navigation');
    }
  }

  handleKeyboardNavigation(e) {
    if(e.key === 'Escape' && this.navContainer.classList.contains('active')){
      this.closeMobileMenu();
    }
  }

  setupThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '🌙';
    themeToggle.setAttribute('aria-label', 'Toggle dark mode');
    document.querySelector('.header .container').appendChild(themeToggle);

    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      themeToggle.innerHTML = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
      this.trackEvent('theme_toggle', { mode: document.body.classList.contains('dark-mode') ? 'dark' : 'light' });
    });

    if(window.matchMedia('(prefers-color-scheme: dark)').matches){
      document.body.classList.add('dark-mode');
      themeToggle.innerHTML = '☀️';
    }
  }

  setupLazyLoading() {
    document.querySelectorAll('img:not([loading])').forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
  }

  setupAnalytics() {
    this.trackEvent('page_view', { path: window.location.pathname });
  }

  trackEvent(eventName, eventData = {}) {
    const event = {
      name: eventName,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...eventData
    };
    console.log('%c📊 Event Tracked:', 'color: #00c853;', event);
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      padding: 20px 30px;
      border-radius: 12px;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
      background: ${type === 'success' ? 'linear-gradient(135deg, #00c853, #00a84d)' :
        type === 'error' ? 'linear-gradient(135deg, #ff1744, #d81b60)' : 'linear-gradient(135deg, #00d4ff, #0099cc)'};
      color: white;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      setTimeout(() => notification.remove(), 400);
    }, 4000);
  }

  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Inject CSS keyframes and styles for animations, ripple, notifications, etc
  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      .ripple {
        position: absolute;
        background: rgba(255,255,255,0.8);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-animation 0.8s ease-out;
        pointer-events: none;
      }
      @keyframes ripple-animation {
        to { transform: scale(5); opacity: 0; }
      }
      .notification {
        min-width: 300px;
        max-width: 80vw;
      }
      .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: #1a2a4a;
        color: white;
        padding: 8px;
        z-index: 10000;
      }
      .skip-link:focus { top: 0; }
      .invalid {
        border-color: #ff1744 !important;
        background-color: #ffe6e6 !important;
      }
      body.menu-open { overflow: hidden; }
      .dark-mode {
        --light-bg: hsl(210, 20%, 10%);
        --card-bg: hsl(210, 20%, 15%);
        --text-dark: white;
        --text-light: hsl(210, 10%, 70%);
        --border-color: hsl(210, 20%, 25%);
      }
      .theme-toggle {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        transition: transform 0.3s;
      }
      .theme-toggle:hover {
        transform: rotate(20deg);
      }
      @media (max-width: 768px) {
        .notification {
          top: 80px !important;
          left: 50%;
          transform: translateX(-50%);
          right: auto !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.littleGeniusApp = new LittleGeniusApp();
});
