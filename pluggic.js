/**
 * PLUGIC Landing Page Responsive & Accessible JavaScript Enhancements
 * Enhanced to support seamless UI/UX on mobile, tablet, and desktop devices
 */

(function () {
  'use strict';

  // Configuration with reactive defaults and dynamic updates
  const CONFIG = new Proxy({
    animationThreshold: 0.1,
    scrollOffset: 80,
    navToggleBreakpoint: 768,
    transitionDuration: '0.3s',
    prefetchDistance: 200, // Pixels to prefetch animations
    hapticIntensity: 0.5,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    profiling: {
      enabled: true,
      logLevel: 'info',
      exportOnUnload: true,
      webVitalsThresholds: { LCP: 2500, FID: 100, CLS: 0.1 }
    }
  }, {
    set(target, prop, value) {
      Reflect.set(target, prop, value);
      if (prop === 'transitionDuration') {
        document.documentElement.style.setProperty('--transition-duration', value);
      }
      return true;
    }
  });

  // Utility module with enhanced responsive helpers
  const utils = (() => {
    const cache = new WeakMap();

    const prefersReducedMotion = () => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    const debounce = (func, wait) => {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    };

    const throttleRaf = (fn) => {
      let called = false;
      return (...args) => {
        if (!called) {
          called = true;
          requestAnimationFrame(() => {
            fn(...args);
            called = false;
          });
        }
      };
    };

    const safeAddClass = (el, className) => {
      if (el && !el.classList.contains(className)) el.classList.add(className);
    };

    const safeRemoveClass = (el, className) => {
      if (el) el.classList.remove(className);
    };

    const safeToggleClass = (el, className) => {
      if (el) el.classList.toggle(className);
    };

    const smoothScrollTo = (target, offset = CONFIG.scrollOffset) => {
      const targetEl = typeof target === 'string' ? document.querySelector(target) : target;
      if (!targetEl) return;
      const start = window.pageYOffset;
      const targetPos = targetEl.getBoundingClientRect().top + start - offset;
      const distance = targetPos - start;
      const duration = 600;
      let startTime = null;

      function animate(time) {
        if (!startTime) startTime = time;
        const timeElapsed = time - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        window.scrollTo(0, start + distance * ease);
        if (timeElapsed < duration) requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    };

    const closest = (el, selector) => el?.closest(selector);

    const trapFocus = (container) => {
      if (!container) return;
      const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusables = container.querySelectorAll(focusableSelectors);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      function onKeydown(e) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
      container.addEventListener('keydown', onKeydown);
      cache.set(container, () => container.removeEventListener('keydown', onKeydown));
    };

    const releaseTrap = (container) => {
      const cleanup = cache.get(container);
      if (typeof cleanup === 'function') cleanup();
    };

    const hapticFeedback = (intensity = CONFIG.hapticIntensity) => {
      if ('vibrate' in navigator) navigator.vibrate(intensity * 50);
    };

    return {
      prefersReducedMotion,
      debounce,
      throttleRaf,
      safeAddClass,
      safeRemoveClass,
      safeToggleClass,
      smoothScrollTo,
      closest,
      trapFocus,
      releaseTrap,
      hapticFeedback,
      cache
    };
  })();

  // Reactive Navigation State and Handlers
  const navState = new Proxy({
    isMobile: window.innerWidth <= CONFIG.navToggleBreakpoint,
    isOpen: false,
    activeLink: null
  }, {
    set(target, prop, value) {
      Reflect.set(target, prop, value);
      if (prop === 'isMobile') {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return true;
        if (value) utils.safeAddClass(navMenu, 'mobile');
        else utils.safeRemoveClass(navMenu, 'mobile');
      }
      return true;
    }
  });

  const navHandler = {
    navMenu: null,
    navToggle: null,
    overlay: null,
    touchStartX: 0,
    touchCurrentX: 0,
    init: () => {
      navHandler.navMenu = document.querySelector('.nav-menu');

      if (!navHandler.navMenu) return;

      // Ensure nav menu has an id for aria-controls
      if (!navHandler.navMenu.id) navHandler.navMenu.id = 'nav-menu';

      // Create or find toggle
      navHandler.navToggle = document.querySelector('.nav-toggle');
      if (!navHandler.navToggle) {
        navHandler.navToggle = document.createElement('button');
        navHandler.navToggle.className = 'nav-toggle';
        navHandler.navToggle.type = 'button';
        navHandler.navToggle.setAttribute('aria-label', 'Toggle navigation');
        navHandler.navToggle.setAttribute('aria-expanded', 'false');
        navHandler.navToggle.setAttribute('aria-controls', navHandler.navMenu.id);
        navHandler.navToggle.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';
        navHandler.navMenu.parentNode.insertBefore(navHandler.navToggle, navHandler.navMenu);
      } else {
        // ensure proper attributes
        navHandler.navToggle.setAttribute('aria-controls', navHandler.navMenu.id);
        if (!navHandler.navToggle.hasAttribute('aria-label')) navHandler.navToggle.setAttribute('aria-label', 'Toggle navigation');
        navHandler.navToggle.type = navHandler.navToggle.type || 'button';
      }

      // Create overlay to block background and close on click
      navHandler.overlay = document.querySelector('.nav-overlay');
      if (!navHandler.overlay) {
        navHandler.overlay = document.createElement('div');
        navHandler.overlay.className = 'nav-overlay';
        navHandler.overlay.setAttribute('aria-hidden', 'true');
        navHandler.navMenu.parentNode.insertBefore(navHandler.overlay, navHandler.navMenu.nextSibling);
      }

      // Toggle handlers
      navHandler.openMenu = () => {
        if (navState.isOpen) return;
        navState.isOpen = true;
        navHandler.navToggle.setAttribute('aria-expanded', 'true');
        utils.safeAddClass(navHandler.navToggle, 'active');
        utils.safeAddClass(navHandler.navMenu, 'open');
        utils.safeAddClass(navHandler.overlay, 'visible');
        document.documentElement.classList.add('nav-open');
        document.body.classList.add('no-scroll'); // lock background scroll
        utils.trapFocus(navHandler.navMenu);
        navHandler.previouslyFocused = document.activeElement;
        // move focus into menu
        const firstFocusable = navHandler.navMenu.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) firstFocusable.focus();
        utils.hapticFeedback(0.6);
      };

      navHandler.closeMenu = () => {
        if (!navState.isOpen) return;
        navState.isOpen = false;
        navHandler.navToggle.setAttribute('aria-expanded', 'false');
        utils.safeRemoveClass(navHandler.navToggle, 'active');
        utils.safeRemoveClass(navHandler.navMenu, 'open');
        utils.safeRemoveClass(navHandler.overlay, 'visible');
        document.documentElement.classList.remove('nav-open');
        document.body.classList.remove('no-scroll');
        utils.releaseTrap(navHandler.navMenu);
        // restore focus
        if (navHandler.previouslyFocused) navHandler.previouslyFocused.focus();
      };

      navHandler.toggleMenu = () => {
        if (navState.isOpen) navHandler.closeMenu();
        else navHandler.openMenu();
      };

      navHandler.navToggle.addEventListener('click', navHandler.toggleMenu);

      // Close on overlay click
      navHandler.overlay.addEventListener('click', navHandler.closeMenu);

      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navState.isOpen) {
          navHandler.closeMenu();
        }
      });

      // Improve link handling: close on small screens, smooth scroll
      document.querySelectorAll('.nav-menu a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          const target = link.getAttribute('href');
          utils.smoothScrollTo(target);
          if (navState.isMobile && navState.isOpen) {
            // small delay so scroll starts then close
            setTimeout(() => navHandler.closeMenu(), 150);
          }
          navState.activeLink = target;
          navHandler.updateActiveLink();
        });
      });

      // Close menu if clicking outside the menu while open (desktop fallback)
      document.addEventListener('click', (e) => {
        if (!navState.isOpen) return;
        if (navHandler.navMenu.contains(e.target) || navHandler.navToggle.contains(e.target) || navHandler.overlay.contains(e.target)) return;
        navHandler.closeMenu();
      }, { passive: true });

      // Touch gesture: swipe left to close on mobile
      navHandler.navMenu.addEventListener('touchstart', (e) => {
        if (!navState.isMobile) return;
        navHandler.touchStartX = e.touches[0].clientX;
        navHandler.touchCurrentX = navHandler.touchStartX;
      }, { passive: true });

      navHandler.navMenu.addEventListener('touchmove', (e) => {
        if (!navState.isMobile) return;
        navHandler.touchCurrentX = e.touches[0].clientX;
      }, { passive: true });

      navHandler.navMenu.addEventListener('touchend', () => {
        if (!navState.isMobile) return;
        const delta = navHandler.touchCurrentX - navHandler.touchStartX;
        // If user swiped left substantially, close
        if (delta < -50) navHandler.closeMenu();
        navHandler.touchStartX = 0;
        navHandler.touchCurrentX = 0;
      });

      // Update responsive state on resize
      window.addEventListener('resize', utils.debounce(() => {
        const wasMobile = navState.isMobile;
        navState.isMobile = window.innerWidth <= CONFIG.navToggleBreakpoint;
        if (!navState.isMobile && navState.isOpen) {
          // Convert to desktop: ensure menu remains visible but not locked
          navHandler.closeMenu();
        }
      }, 160));

      window.addEventListener('scroll', utils.throttleRaf(() => navHandler.onScroll()));

      navHandler.updateActiveLink();
    },

    onScroll: () => {
      if (!navHandler.navMenu) return;
      const scrollPos = window.scrollY + CONFIG.scrollOffset;
      let currentActive = null;
      document.querySelectorAll('.nav-menu a[href^="#"]').forEach(link => {
        const section = document.querySelector(link.getAttribute('href'));
        if (section && section.offsetTop <= scrollPos) currentActive = link.getAttribute('href');
      });
      if (currentActive !== navState.activeLink) {
        navState.activeLink = currentActive;
        navHandler.updateActiveLink();
      }
    },

    updateActiveLink: () => {
      document.querySelectorAll('.nav-menu a.active').forEach(el => el.classList.remove('active'));
      if (navState.activeLink) {
        const activeLink = navHandler.navMenu.querySelector(`a[href="${navState.activeLink}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    }
  };

  // Setup Intersection Observer for Animations and Prefetch
  const scrollAnimations = {
    observer: null,

    init: () => {
      if (utils.prefersReducedMotion()) {
        document.documentElement.classList.add('reduced-motion');
        return;
      }

      scrollAnimations.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.animate([
              { opacity: 0, transform: 'translateY(40px)' },
              { opacity: 1, transform: 'translateY(0)' }
            ], { duration: 800, easing: CONFIG.easing, fill: 'forwards' });
            scrollAnimations.observer.unobserve(el);
            // Prefetch images inside
            el.querySelectorAll('img[data-src]').forEach(img => {
              img.src = img.dataset.src;
              delete img.dataset.src;
            });
          }
        });
      }, { threshold: CONFIG.animationThreshold, rootMargin: `0px 0px -${CONFIG.prefetchDistance}px 0px` });

      document.querySelectorAll('[data-animate]').forEach(el => scrollAnimations.observer.observe(el));
    }
  };

  // Initialization on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    navHandler.init();
    scrollAnimations.init();
    // Add other module initializations similarly
  });

})();
