/**
 * Key Locations Module
 * Handles dynamic rendering of location cards, filtering, and detail modal logic.
 */

import { LOCATION_DATA } from '../data/locationsData.js';

export function initLocations() {
  renderLocationCards();
  initLocationFilters();
  initLocationModal();
}

/**
 * Render location cards dynamically into the grid
 */
function renderLocationCards() {
  const container = document.getElementById('locationsGrid');
  if (!container) return;

  const locKeys = Object.keys(LOCATION_DATA);
  container.innerHTML = locKeys.map((key, idx) => {
    const loc = LOCATION_DATA[key];
    const locNum = String(idx + 1).padStart(2, '0');

    let gradientClasses = '';
    let hoverBorder = '';

    switch (loc.category) {
      case 'art':
        if (key === 'upsidedown') {
          gradientClasses = 'from-pink-900/40 via-purple-900/20 to-cyber-900';
          hoverBorder = 'group-hover:border-neon-pink/40';
        } else {
          gradientClasses = 'from-purple-950 via-cyber-900 to-indigo-950/40';
          hoverBorder = 'group-hover:border-neon-purple/40';
        }
        break;
      case 'science':
        gradientClasses = 'from-cyan-950 via-cyber-900 to-teal-950/40';
        hoverBorder = 'group-hover:border-neon-cyan/40';
        break;
      case 'culture':
      default:
        gradientClasses = 'from-amber-950/40 via-cyber-900 to-orange-950/30';
        hoverBorder = 'group-hover:border-neon-amber/40';
        break;
    }

    return `
      <div class="location-card glass-panel rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer group"
        data-category="${loc.category}" data-loc-id="${key}">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="font-mono text-xs uppercase px-2.5 py-1 rounded ${loc.cardBadgeColor} font-semibold">
              ${loc.cardBadge}
            </span>
            <span class="text-slate-500 font-mono text-xs">#LOC_${locNum}</span>
          </div>

          <div class="h-36 rounded-xl bg-gradient-to-br ${gradientClasses} border border-white/10 flex items-center justify-center mb-6 relative overflow-hidden ${hoverBorder} transition-colors">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
            <div class="text-center z-10 transition-transform duration-300 group-hover:scale-110">
              <i data-lucide="${loc.icon}" class="w-12 h-12 ${loc.iconColor} mx-auto mb-2"></i>
              <span class="text-[10px] font-mono text-slate-400 uppercase tracking-widest">${loc.cardSubtext}</span>
            </div>
          </div>

          <h3 class="text-xl font-bold text-white group-hover:${loc.iconColor} transition-colors mb-2">
            ${loc.cardTitle}
          </h3>
          <p class="text-slate-300 text-sm leading-relaxed">
            ${loc.cardDesc}
          </p>
        </div>

        <div class="px-6 pb-6 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono ${loc.iconColor}">
          <span>Prozkoumat úkoly</span>
          <i data-lucide="external-link" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Filter cards by category button click
 */
function initLocationFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.location-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => {
        b.classList.remove('bg-neon-cyan/15', 'border-neon-cyan/40', 'text-neon-cyan', 'active');
        b.classList.add('bg-white/5', 'border-white/10', 'text-slate-300');
      });
      btn.classList.add('bg-neon-cyan/15', 'border-neon-cyan/40', 'text-neon-cyan', 'active');
      btn.classList.remove('bg-white/5', 'border-white/10', 'text-slate-300');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.classList.add('hidden');
          }, 200);
        }
      });
    });
  });
}

/**
 * Location details modal dialog
 */
function initLocationModal() {
  const modal = document.getElementById('locationModal');
  const modalContent = document.getElementById('modalContent');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const locationCards = document.querySelectorAll('.location-card');

  if (!modal || !modalContent) return;

  function openModal(locId) {
    const data = LOCATION_DATA[locId];
    if (!data) return;

    modalContent.innerHTML = `
      <div class="space-y-6">
        <div>
          <span class="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider border mb-3 ${data.badgeColor}">
            ${data.badge}
          </span>
          <div class="flex items-center gap-3">
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white">${data.title}</h3>
          </div>
          <p class="text-sm font-medium text-neon-cyan mt-1">${data.subtitle}</p>
        </div>

        <p class="text-sm sm:text-base text-slate-300 leading-relaxed">
          ${data.description}
        </p>

        <div class="bg-cyber-900/80 rounded-xl p-5 border border-white/10">
          <h4 class="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-2">
            <i data-lucide="check-square" class="w-4 h-4 text-neon-cyan"></i>
            Co zde budeme tvořit a zkoumat:
          </h4>
          <ul class="space-y-2.5 text-xs sm:text-sm text-slate-200">
            ${data.tasks.map(task => `
              <li class="flex items-start gap-2.5">
                <i data-lucide="chevron-right" class="w-4 h-4 text-neon-cyan shrink-0 mt-0.5"></i>
                <span>${task}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div class="glass-panel p-4 rounded-xl border border-white/10">
            <div class="text-[11px] font-mono uppercase text-slate-400 mb-2">Využité digitální nástroje:</div>
            <div class="flex flex-wrap gap-1.5">
              ${data.techStack.map(tech => `
                <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                  ${tech}
                </span>
              `).join('')}
            </div>
          </div>

          <div class="glass-panel p-4 rounded-xl border border-white/10">
            <div class="text-[11px] font-mono uppercase text-slate-400 mb-1">Výstup do deníku:</div>
            <p class="text-xs text-white font-medium">${data.output}</p>
          </div>
        </div>

        <div class="pt-4 border-t border-white/10 flex items-center justify-between">
          <span class="text-xs text-slate-400 font-mono">100% v ceně grantu EU Erasmus+</span>
          <button id="modalActionClose" class="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-white bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-95 transition-all">
            Rozumím, pokračovat
          </button>
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      const box = document.getElementById('locationModalBox');
      if (box) {
        box.classList.remove('scale-95');
        box.classList.add('scale-100');
      }
    }, 10);

    const modalActionClose = document.getElementById('modalActionClose');
    if (modalActionClose) {
      modalActionClose.addEventListener('click', closeModal);
    }
  }

  function closeModal() {
    modal.classList.add('opacity-0');
    const box = document.getElementById('locationModalBox');
    if (box) {
      box.classList.remove('scale-100');
      box.classList.add('scale-95');
    }
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 250);
  }

  locationCards.forEach(card => {
    card.addEventListener('click', () => {
      const locId = card.getAttribute('data-loc-id');
      openModal(locId);
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}
