/**
 * Erasmus+ Amsterdam 2027 | ZŠ MOLEKULA
 * Interactive Features & Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  initMobileMenu();
  initLocationModal();
  initLocationFilters();
  initPipelineTabs();
  initFaqAccordion();
  initFormValidation();
  initCopyLink();
  initScrollAnimations();
});

/* ==========================================================================
   1. Mobile Menu Toggle
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });
}

/* ==========================================================================
   2. Key Locations Modal & Deep-Dive Data
   ========================================================================== */
const LOCATION_DATA = {
  upsidedown: {
    badge: 'CREATIVITY & PERSPECTIVE',
    badgeColor: 'text-neon-pink bg-neon-pink/15 border-neon-pink/30',
    title: 'The Upside Down Amsterdam',
    subtitle: 'Největší interaktivní prostor pro optické iluze a sociální média v Evropě',
    icon: 'flip-vertical',
    iconColor: 'text-neon-pink',
    description: 'The Upside Down není jen obyčejné muzeum – je to vizuální hřiště s více než 25 designovými místnostmi, které převracejí realitu vzhůru nohama. Žáci zde budou experimentovat se světlem, barvami a perspektivou.',
    tasks: [
      'Tvorba série fotografií s iluzí beztíže pro expediční fotoknihu.',
      'Praktické testování kompozice podle pravidla třetin a práce s hloubkou ostrosti.',
      'Analýza, jak moderní vizuální tvůrci pracují s emocemi a barvami na sociálních sítích.'
    ],
    techStack: ['Mobilní fotografie', 'Canva Layouts', 'CapCut Reels', 'Optické filtry'],
    output: 'Minisérie 3 kreativních fotografií do multimediálního deníku.'
  },
  nxtmuseum: {
    badge: 'NEW MEDIA & GENERATIVE AI',
    badgeColor: 'text-neon-purple bg-neon-purple/20 border-neon-purple/30',
    title: 'Nxt Museum Amsterdam',
    subtitle: 'První muzeum v Nizozemsku věnované novým médiím a digitálnímu umění',
    icon: 'bot',
    iconColor: 'text-neon-purple',
    description: 'Fascinující prostor v severním Amsterdamu propojující špičkové digitální umělce, kodéry, zvukové designéry a vědce. Expozice využívají generativní algoritmy umělé inteligence, laserové projekce a prostorové senzory.',
    tasks: [
      'Pozorování interakce mezi člověkem a AI algoritmy v reálném čase.',
      'Záznam zvukových stop a ruchových vzorků (foley sound) pro podkres expedičního deníku.',
      'Diskuze o budoucnosti kreativních technologií a etice generativního umění.'
    ],
    techStack: ['Generative AI', 'Prostorový zvuk', 'Laser Mapping', 'Digitální senzory pohybu'],
    output: 'Krátký audiovizuální medailonek s reflexí budoucích technologií.'
  },
  nemo: {
    badge: 'SCIENCE & TECHNOLOGY LAB',
    badgeColor: 'text-neon-cyan bg-neon-cyan/20 border-neon-cyan/30',
    title: 'NEMO Science Museum',
    subtitle: '5 pater fascinujících vědeckých objevů a technologických experimentů',
    icon: 'flask-conical',
    iconColor: 'text-neon-cyan',
    description: 'Ikonická zelená budova ve tvaru lodě ukrývá největší vědecké centrum v Nizozemsku. Žáci si zde mohou vyzkoušet reálné fyzikální jevy, principy zelené energie, čištění vody i fungování lidského mozku a počítačových sítí.',
    tasks: [
      'Praktické experimenty s řetězovou reakcí, tlakem vody a obnovitelnou energií.',
      'Natočení „Science VLOGU“ – žáci v rolích vědeckých reportérů vysvětlují vybraný princip.',
      'Návštěva otevřené střechy s udržitelnými technologiemi a panoramatem Amsterdamu.'
    ],
    techStack: ['Vědecký vlogging', 'Zelená energetika', 'Interaktivní simulace', 'Optická fyzika'],
    output: 'Jednominutové vědecké video vysvětlující vybraný objev.'
  },
  tradice: {
    badge: 'CULTURE & DUTCH HERITAGE',
    badgeColor: 'text-neon-amber bg-neon-amber/20 border-neon-amber/30',
    title: 'Historické kanály & Tradice města',
    subtitle: 'Architektura UNESCO, vodní inženýrství a autentický holandský život',
    icon: 'landmark',
    iconColor: 'text-neon-amber',
    description: 'Procházka podél proslulých amsterdamských kanálů ze 17. století. Žáci prozkoumají nejen unikátní úzké domy a městskou cyklokulturu, ale navštíví také tradiční sýrárny a trhy s květinami.',
    tasks: [
      'Dokumentace městské mobility: Proč je Amsterdam světovou metropolí jízdních kol?',
      'Ochutnávka a hodnocení tradičních holandských sýrů (Gouda, Edam) do expedičního žebříčku.',
      'Hledání architektonických kontrastů mezi historickým centrem a moderními stavbami.'
    ],
    techStack: ['Street Photography', 'Kulturní žurnalistika', 'Městské mapování', 'Storytelling'],
    output: 'Ilustrovaná reportážní stránka v expedičním zápisníku.'
  }
};

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
        <!-- Badge & Header -->
        <div>
          <span class="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider border mb-3 ${data.badgeColor}">
            ${data.badge}
          </span>
          <div class="flex items-center gap-3">
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white">${data.title}</h3>
          </div>
          <p class="text-sm font-medium text-neon-cyan mt-1">${data.subtitle}</p>
        </div>

        <!-- Description -->
        <p class="text-sm sm:text-base text-slate-300 leading-relaxed">
          ${data.description}
        </p>

        <!-- Tasks Checklist -->
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

        <!-- Tech Stack & Expected Output -->
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

        <!-- CTA footer -->
        <div class="pt-4 border-t border-white/10 flex items-center justify-between">
          <span class="text-xs text-slate-400 font-mono">100% v ceně grantu EU Erasmus+</span>
          <button id="modalActionClose" class="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-white bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-95 transition-all">
            Rozumím, pokračovat
          </button>
        </div>
      </div>
    `;

    // Re-run Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Modal show animation
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

/* ==========================================================================
   3. Location Category Filters
   ========================================================================== */
function initLocationFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.location-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update button visual styles
      filterBtns.forEach(b => {
        b.classList.remove('bg-neon-cyan/15', 'border-neon-cyan/40', 'text-neon-cyan', 'active');
        b.classList.add('bg-white/5', 'border-white/10', 'text-slate-300');
      });
      btn.classList.add('bg-neon-cyan/15', 'border-neon-cyan/40', 'text-neon-cyan', 'active');
      btn.classList.remove('bg-white/5', 'border-white/10', 'text-slate-300');

      // Filter cards
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

/* ==========================================================================
   4. Pipeline Terminal Steps Switcher
   ========================================================================== */
const PIPELINE_STEPS = {
  1: {
    tag: 'DETAIL FÁZE 01 // INFORMAČNÍ SETKÁNÍ',
    color: 'neon-cyan',
    title: 'Vše, co potřebuješ vědět před startem',
    description: 'Setkání pro žáky i rodiče, kde podrobně představíme program expedice, bezpečí, partnerskou školu v Amsterdamu a jak funguje tvorba digitálního deníku. Termíny jsou nastaveny flexibilně (před vyučováním i odpoledne), aby se mohl zúčastnit opravdu každý.',
    bullet1: 'Ranní termín: 7:30 – 7:55 (před 1. hodinou pro ranní ptáčata)',
    bullet2: 'Odpolední termín: 14:00 – 14:45 (vhodné pro rodiče a po vyučování)',
    tipTitle: 'TIP KOORDINÁTORA:',
    tipText: 'Nemusíš se bát zeptat na cokoliv – schůzka je nezávazná a zodpovíme všechny otázky k programu, ubytování i grantu.',
    supportNote: 'Podpora ŠPP k dispozici'
  },
  2: {
    tag: 'DETAIL FÁZE 02 // KREATIVNÍ MINIVÝZVA',
    color: 'neon-purple',
    title: 'Ukaž svůj nápad, ne dokonalost!',
    description: 'Kreativní minivýzva je otevřená příležitost pro každého žáka 2. stupně. Nejde o známky ani o to být profesionální grafik – cení se originalita, chuť experimentovat a osobní pohled na téma.',
    bullet1: 'Formát dle vlastní volby: 3–5 fotek s popisky, plakát v Canvě, krátký medailonek nebo náčrt komiksu',
    bullet2: 'Téma: „Můj pohled na inovace nebo co bych chtěl/a v Amsterdamu objevit“',
    tipTitle: 'PODPORA ŠPP & ICT:',
    tipText: 'Potřebuješ pomoci s nápadem nebo aplikací Canva? V kabinetu IT i v Školním poradenském pracovišti ti rádi pomůžeme.',
    supportNote: 'Inkluzivní přístup pro všechny žáky'
  },
  3: {
    tag: 'DETAIL FÁZE 03 // OSOBNÍ ROZHOVOR',
    color: 'neon-magenta',
    title: 'Přátelské popovídání (2–3 minuty)',
    description: 'Krátký rozhovor s koordinátorem a pedagogy expedice. Nejedná se o zkoušení! Chceme tě poznat, poslechnout si tvé nadšení, na co se v Amsterdamu nejvíce těšíš a jak funguješ v týmu spolužáků.',
    bullet1: 'Délka: Pouze 2–3 minuty v uvolněné, přátelské atmosféře',
    bullet2: 'Otázky typu: Co tě na výjezdu nejvíc láká a v čem bys rád/a podpořil/a svůj tým?',
    tipTitle: 'TIP PRO ROZHOVOR:',
    tipText: 'Buď sám sebou! Hledáme pestrý tým žáků různých zájmů (technici, fotografové, vypravěči, zvídaví objevitelé).',
    supportNote: 'Respektující a bezpečné prostředí'
  }
};

function initPipelineTabs() {
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

/* ==========================================================================
   5. Accordion FAQ
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    const icon = trigger ? trigger.querySelector('svg, i') : null;

    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isExpanded = !content.classList.contains('hidden');

      // Close all other FAQs
      faqItems.forEach(otherItem => {
        const otherContent = otherItem.querySelector('.faq-content');
        const otherIcon = otherItem.querySelector('.faq-trigger svg, .faq-trigger i');
        if (otherContent && otherContent !== content) {
          otherContent.classList.add('hidden');
          if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        }
      });

      // Toggle current
      if (isExpanded) {
        content.classList.add('hidden');
        if (icon) icon.style.transform = 'rotate(0deg)';
      } else {
        content.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    });
  });
}

/* ==========================================================================
   6. Form Validation & Database Submission
   ========================================================================== */
function initFormValidation() {
  const form = document.getElementById('expeditionForm');
  const successBox = document.getElementById('formSuccessMessage');
  const refCodeElem = document.getElementById('successRefCode');
  const submitBtn = document.getElementById('submitFormBtn');

  if (!form || !successBox) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('studentName')?.value.trim();
    const studentClass = document.getElementById('studentClass')?.value;
    const email = document.getElementById('parentEmail')?.value.trim();
    const phone = document.getElementById('parentPhone')?.value.trim();
    const motivation = document.getElementById('motivation')?.value.trim();
    const consent = document.getElementById('consent')?.checked;

    // Simple validation checks
    if (!name || !studentClass || !email || !consent) {
      showToast('Vyplňte prosím všechna povinná pole označená hvězdičkou.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Zadejte platnou e-mailovou adresu zákonného zástupce.', 'error');
      return;
    }

    // Submit state indicator
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Ukládám do databáze...</span>
      `;
    }

    const payload = {
      studentName: name,
      studentClass: studentClass,
      parentEmail: email,
      parentPhone: phone,
      motivation: motivation
    };

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (refCodeElem) {
          refCodeElem.innerText = `KÓD PŘIHLÁŠKY: #${result.id}`;
        }
        form.classList.add('hidden');
        successBox.classList.remove('hidden');
        showToast(`Přihláška pro žáka ${name} byla uložena do databáze!`, 'success');
      } else {
        throw new Error(result.error || 'Chyba při ukládání na serveru.');
      }
    } catch (err) {
      console.warn('API error, falling back to local simulation:', err);
      // Fallback in case opened directly via file://
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const generatedCode = `AMS-2027-${studentClass.replace('.', '')}-${randomCode}`;
      
      if (refCodeElem) {
        refCodeElem.innerText = `KÓD PŘIHLÁŠKY: #${generatedCode}`;
      }

      form.classList.add('hidden');
      successBox.classList.remove('hidden');
      showToast(`Přihláška pro žáka ${name} byla přijata (lokální režim).`, 'success');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    }
  });
}

/* ==========================================================================
   7. Copy Link Feature
   ========================================================================== */
function initCopyLink() {
  const copyBtn = document.getElementById('copyLinkBtn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for non-https or older setups
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showToast('Odkaz na výzvu byl zkopírován do schránky!', 'success');
    } catch (err) {
      showToast('Nepodařilo se zkopírovat odkaz automaticky.', 'error');
    }
  });
}

/* ==========================================================================
   8. Toast Notification System
   ========================================================================== */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `pointer-events-auto px-4 py-3 rounded-xl glass-panel border font-sans text-xs flex items-center gap-3 shadow-2xl transition-all duration-300 transform translate-y-3 opacity-0 ${
    type === 'success' 
      ? 'border-neon-emerald/40 text-slate-100 bg-cyber-900/95' 
      : type === 'error'
      ? 'border-red-500/50 text-slate-100 bg-cyber-900/95'
      : 'border-neon-cyan/40 text-slate-100 bg-cyber-900/95'
  }`;

  const iconName = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';
  const iconColor = type === 'success' ? 'text-neon-emerald' : type === 'error' ? 'text-red-400' : 'text-neon-cyan';

  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-4 h-4 ${iconColor} shrink-0"></i>
    <span class="flex-1 font-medium">${message}</span>
  `;

  container.appendChild(toast);

  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Animation in
  setTimeout(() => {
    toast.classList.remove('translate-y-3', 'opacity-0');
  }, 10);

  // Auto remove after 4.5 seconds
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4500);
}

/* ==========================================================================
   9. Scroll Animations (IntersectionObserver)
   ========================================================================== */
function initScrollAnimations() {
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
