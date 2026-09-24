/**
 * Scroll Animations Module
 * Observes elements with IntersectionObserver to trigger smooth reveal animations.
 */

export function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    '.location-card, .pipeline-tab, .faq-item, #harmonogram .glass-panel'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  animatedElements.forEach(el => {
    el.classList.add('reveal-item');
    observer.observe(el);
  });
}
