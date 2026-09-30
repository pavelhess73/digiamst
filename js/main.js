/**
 * Erasmus+ Amsterdam 2027 | ZŠ MOLEKULA
 * Main JavaScript Entry Point (js/main.js)
 */

import { initNavigation } from './modules/navigation.js';
import { initLocations } from './modules/locations.js';
import { initPipeline } from './modules/pipeline.js';
import { initFaqAccordion } from './modules/faq.js';
import { initFormValidation } from './modules/form.js';
import { initCopyLink } from './modules/copyLink.js';
import { initScrollAnimations } from './modules/animations.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Initialize Modules
  initNavigation();
  initLocations();
  initPipeline();
  initFaqAccordion();
  initFormValidation();
  initCopyLink();
  initScrollAnimations();
});
