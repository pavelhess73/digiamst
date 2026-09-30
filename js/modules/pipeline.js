/**
 * Pipeline Steps Switcher Module
 * Handles selection process terminal step tabs and detail views.
 */

import { PIPELINE_STEPS } from '../data/pipelineData.js';

export function initPipeline() {
  const tabs = document.querySelectorAll('.pipeline-tab');
  const detailContainer = document.getElementById('pipelineStepDetail');

  if (!tabs.length || !detailContainer) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const step = tab.getAttribute('data-step');
      const data = PIPELINE_STEPS[step];
      if (!data) return;

      // Update tab styles
      tabs.forEach(t => {
        t.classList.remove('bg-neon-cyan/10', 'border-neon-cyan/40', 'bg-neon-purple/10', 'border-neon-purple/40', 'bg-neon-magenta/10', 'border-neon-magenta/40');
        t.classList.add('bg-white/5', 'border-white/10');
      });

      if (step === '1') {
        tab.classList.remove('bg-white/5', 'border-white/10');
        tab.classList.add('bg-neon-cyan/10', 'border-neon-cyan/40');
      } else if (step === '2') {
        tab.classList.remove('bg-white/5', 'border-white/10');
        tab.classList.add('bg-neon-purple/10', 'border-neon-purple/40');
      } else {
        tab.classList.remove('bg-white/5', 'border-white/10');
        tab.classList.add('bg-neon-magenta/10', 'border-neon-magenta/40');
      }

      // Render Step Details with animated fade
      detailContainer.style.opacity = '0';
      setTimeout(() => {
        detailContainer.innerHTML = `
          <div class="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div class="space-y-4 max-w-2xl">
              <div class="flex items-center gap-2 text-${data.color} font-mono text-xs uppercase">
                <span class="w-2 h-2 rounded-full bg-${data.color}"></span>
                <span>${data.tag}</span>
              </div>
              <h3 class="text-2xl font-bold text-white">${data.title}</h3>
              <p class="text-slate-300 text-sm leading-relaxed">
                ${data.description}
              </p>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div class="flex items-start gap-2.5 text-xs text-slate-300">
                  <i data-lucide="check-circle-2" class="w-4 h-4 text-${data.color} shrink-0 mt-0.5"></i>
                  <span>${data.bullet1}</span>
                </div>
                <div class="flex items-start gap-2.5 text-xs text-slate-300">
                  <i data-lucide="check-circle-2" class="w-4 h-4 text-${data.color} shrink-0 mt-0.5"></i>
                  <span>${data.bullet2}</span>
                </div>
              </div>
            </div>

            <div class="bg-cyber-900 border border-white/10 rounded-xl p-4 w-full md:w-64 font-mono text-xs space-y-2 shrink-0">
              <div class="text-slate-400">${data.tipTitle}</div>
              <p class="text-slate-200">
                ${data.tipText}
              </p>
              <div class="pt-2 text-${data.color} flex items-center gap-1 font-semibold">
                <i data-lucide="help-circle" class="w-3.5 h-3.5"></i>
                <span>${data.supportNote}</span>
              </div>
            </div>
          </div>
        `;

        if (window.lucide) {
          window.lucide.createIcons();
        }

        detailContainer.style.opacity = '1';
      }, 150);
    });
  });
}
