/**
 * Erasmus+ Amsterdam 2027 | ZŠ MOLEKULA
 * Administration Portal Logic (admin.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  initAuth();
  initDashboard();
});

let applicationsState = [];
let activeStatusFilter = 'ALL';
let activeClassFilter = 'ALL';
let activeSearchQuery = '';

/* ==========================================================================
   1. Authentication Handling
   ========================================================================== */
function initAuth() {
  const authView = document.getElementById('authView');
  const dashboardView = document.getElementById('dashboardView');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');
  const passwordInput = document.getElementById('adminPassword');

  const token = sessionStorage.getItem('ams_admin_token');

  if (token) {
    showDashboard();
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');

    const password = passwordInput.value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem('ams_admin_token', data.token);
        showDashboard();
        showToast('Přihlášení do administrace proběhlo úspěšně.', 'success');
      } else {
        loginError.innerText = data.error || 'Nesprávné heslo.';
        loginError.classList.remove('hidden');
      }
    } catch (err) {
      loginError.innerText = 'Nepodařilo se připojit k serveru.';
      loginError.classList.remove('hidden');
    }
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('ams_admin_token');
    dashboardView.classList.add('hidden');
    authView.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    passwordInput.value = '';
    showToast('Byli jste odhlášeni.', 'info');
  });

  function showDashboard() {
    authView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    fetchApplications();
  }
}

/* ==========================================================================
   2. Data Fetching & State
   ========================================================================== */
async function fetchApplications() {
  try {
    const res = await fetch('/api/applications');
    const result = await res.json();

    if (res.ok && result.success) {
      applicationsState = result.data || [];
      updateKPIs();
      renderTable();
    } else {
      showToast('Nepodařilo se načíst data přihlášek.', 'error');
    }
  } catch (err) {
    showToast('Chyba při komunikaci se serverem.', 'error');
  }
}

/* ==========================================================================
   3. KPIs and Metrics
   ========================================================================== */
function updateKPIs() {
  const total = applicationsState.length;
  const accepted = applicationsState.filter(a => a.status === 'Přijat do týmu').length;
  const interview = applicationsState.filter(a => a.status === 'Pozván k rozhovoru').length;
  const newApps = applicationsState.filter(a => a.status === 'Nová').length;

  document.getElementById('statTotal').innerText = total;
  document.getElementById('statAccepted').innerText = accepted;
  document.getElementById('statInterview').innerText = interview;
  document.getElementById('statNew').innerText = newApps;
  document.getElementById('countAll').innerText = total;

  // Progress Bar for 18 students capacity
  const pct = Math.min(100, Math.round((accepted / 18) * 100));
  const progressBar = document.getElementById('capacityProgressBar');
  if (progressBar) {
    progressBar.style.width = `${pct}%`;
  }
}

/* ==========================================================================
   4. Table Rendering & Filters
   ========================================================================== */
function initDashboard() {
  const searchInput = document.getElementById('searchInput');
  const classFilterSelect = document.getElementById('classFilterSelect');
  const statusBtns = document.querySelectorAll('.filter-status-btn');
  const refreshBtn = document.getElementById('refreshDataBtn');

  searchInput.addEventListener('input', (e) => {
    activeSearchQuery = e.target.value.toLowerCase().trim();
    renderTable();
  });

  classFilterSelect.addEventListener('change', (e) => {
    activeClassFilter = e.target.value;
    renderTable();
  });

  statusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      statusBtns.forEach(b => {
        b.classList.remove('bg-neon-cyan/15', 'border-neon-cyan/40', 'text-neon-cyan', 'active');
        b.classList.add('bg-white/5', 'border-white/10', 'text-slate-300');
      });
      btn.classList.add('bg-neon-cyan/15', 'border-neon-cyan/40', 'text-neon-cyan', 'active');
      btn.classList.remove('bg-white/5', 'border-white/10', 'text-slate-300');

      activeStatusFilter = btn.getAttribute('data-status');
      renderTable();
    });
  });

  refreshBtn.addEventListener('click', () => {
    fetchApplications();
    showToast('Data byla aktualizována.', 'info');
  });

  initDetailModal();
}

function getStatusBadge(status) {
  switch (status) {
    case 'Přijat do týmu':
      return `<span class="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/30">Přijat do týmu</span>`;
    case 'Pozván k rozhovoru':
      return `<span class="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-neon-purple/20 text-neon-purple border border-neon-purple/30">K rozhovoru</span>`;
    case 'Náhradník':
      return `<span class="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-neon-amber/20 text-neon-amber border border-neon-amber/30">Náhradník</span>`;
    case 'Zamítnuto':
      return `<span class="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-red-500/20 text-red-400 border border-red-500/30">Zamítnuto</span>`;
    case 'Nová':
    default:
      return `<span class="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30">Nová</span>`;
  }
}

function renderTable() {
  const tbody = document.getElementById('applicationsTableBody');
  const emptyMsg = document.getElementById('emptyTableMessage');
  if (!tbody) return;

  const filtered = applicationsState.filter(item => {
    // Status filter
    if (activeStatusFilter !== 'ALL' && item.status !== activeStatusFilter) {
      return false;
    }
    // Class filter
    if (activeClassFilter !== 'ALL' && !item.studentClass.startsWith(activeClassFilter)) {
      return false;
    }
    // Search query
    if (activeSearchQuery) {
      const matchName = item.studentName.toLowerCase().includes(activeSearchQuery);
      const matchClass = item.studentClass.toLowerCase().includes(activeSearchQuery);
      const matchEmail = (item.parentEmail || '').toLowerCase().includes(activeSearchQuery);
      const matchPhone = (item.parentPhone || '').toLowerCase().includes(activeSearchQuery);
      const matchId = (item.id || '').toLowerCase().includes(activeSearchQuery);
      if (!matchName && !matchClass && !matchEmail && !matchPhone && !matchId) {
        return false;
      }
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyMsg.classList.remove('hidden');
    return;
  }

  emptyMsg.classList.add('hidden');

  tbody.innerHTML = filtered.map(app => {
    const dateFormatted = app.createdAt 
      ? new Date(app.createdAt).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '-';

    const motivationPreview = app.motivation 
      ? (app.motivation.length > 55 ? app.motivation.substring(0, 52) + '...' : app.motivation)
      : '<span class="text-slate-500 italic">Neuvedeno</span>';

    return `
      <tr class="hover:bg-white/[0.02] transition-colors group">
        <td class="py-4 px-6 font-mono text-[11px]">
          <div class="font-bold text-neon-cyan">${app.id}</div>
          <div class="text-slate-400 mt-0.5">${dateFormatted}</div>
        </td>
        <td class="py-4 px-6">
          <div class="font-bold text-white text-sm">${app.studentName}</div>
          <div class="text-[11px] font-mono text-slate-400 mt-0.5">
            Třída: <span class="text-slate-200 font-semibold">${app.studentClass || '-'}</span>
          </div>
        </td>
        <td class="py-4 px-6 font-mono text-xs">
          <div class="text-slate-300 flex items-center gap-1.5">
            <i data-lucide="mail" class="w-3.5 h-3.5 text-slate-500"></i>
            <span>${app.parentEmail}</span>
          </div>
          <div class="text-slate-400 text-[11px] mt-1 flex items-center gap-1.5">
            <i data-lucide="phone" class="w-3.5 h-3.5 text-slate-500"></i>
            <span>${app.parentPhone || '-'}</span>
          </div>
        </td>
        <td class="py-4 px-6 max-w-xs text-xs text-slate-300">
          <div class="truncate" title="${app.motivation || ''}">
            ${motivationPreview}
          </div>
          ${app.notes ? `<div class="text-[10px] font-mono text-neon-purple mt-1 flex items-center gap-1"><i data-lucide="sticky-note" class="w-3 h-3"></i><span>Poznámka koordinátora</span></div>` : ''}
        </td>
        <td class="py-4 px-6">
          ${getStatusBadge(app.status)}
        </td>
        <td class="py-4 px-6 text-right">
          <button class="open-detail-btn px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-neon-cyan/20 hover:border-neon-cyan/40 text-xs font-mono text-slate-300 hover:text-neon-cyan transition-all" data-id="${app.id}">
            Spravovat
          </button>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Attach detail listeners
  document.querySelectorAll('.open-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openDetailModal(id);
    });
  });
}

/* ==========================================================================
   5. Detail & Status Edit Modal
   ========================================================================== */
function initDetailModal() {
  const modal = document.getElementById('detailModal');
  const closeBtn = document.getElementById('closeDetailModalBtn');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', closeDetailModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeDetailModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeDetailModal();
      }
    });
  }
}

function openDetailModal(id) {
  const modal = document.getElementById('detailModal');
  const content = document.getElementById('detailModalContent');
  const app = applicationsState.find(a => a.id === id);
  if (!app || !content || !modal) return;

  const dateFormatted = app.createdAt 
    ? new Date(app.createdAt).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-';

  content.innerHTML = `
    <!-- Top Header -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="font-mono text-xs text-neon-cyan font-bold">${app.id}</span>
        <span class="text-xs text-slate-400 font-mono">${dateFormatted}</span>
      </div>
      <h3 class="text-2xl font-bold text-white">${app.studentName}</h3>
      <p class="text-sm font-mono text-slate-400">Třída: <span class="text-white font-semibold">${app.studentClass}</span></p>
    </div>

    <!-- Contact Info Box -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 glass-panel p-4 rounded-xl border border-white/10 font-mono text-xs">
      <div>
        <div class="text-slate-400 text-[10px] uppercase">Email zákonného zástupce:</div>
        <div class="text-white font-medium select-all">${app.parentEmail}</div>
      </div>
      <div>
        <div class="text-slate-400 text-[10px] uppercase">Telefon:</div>
        <div class="text-white font-medium select-all">${app.parentPhone || 'Neuvedeno'}</div>
      </div>
    </div>

    <!-- Motivation Text -->
    <div>
      <h4 class="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">Motivace / Nápad žáka:</h4>
      <div class="bg-cyber-900 border border-white/10 rounded-xl p-4 text-xs sm:text-sm text-slate-200 leading-relaxed max-h-40 overflow-y-auto">
        ${app.motivation ? app.motivation : '<span class="text-slate-500 italic">Žák nevyplnil doplňující motivaci.</span>'}
      </div>
    </div>

    <!-- Status & Notes Controls -->
    <div class="space-y-4 pt-2 border-t border-white/10">
      
      <!-- Status selector -->
      <div>
        <label for="modalStatusSelect" class="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-bold">
          Aktuální stav přihlášky:
        </label>
        <select id="modalStatusSelect" class="w-full px-4 py-2.5 rounded-xl bg-cyber-900 border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-neon-cyan">
          <option value="Nová" ${app.status === 'Nová' ? 'selected' : ''}>Nová (čeká na posouzení)</option>
          <option value="Pozván k rozhovoru" ${app.status === 'Pozván k rozhovoru' ? 'selected' : ''}>Pozván k rozhovoru</option>
          <option value="Přijat do týmu" ${app.status === 'Přijat do týmu' ? 'selected' : ''}>Přijat do týmu (schváleno)</option>
          <option value="Náhradník" ${app.status === 'Náhradník' ? 'selected' : ''}>Náhradník</option>
          <option value="Zamítnuto" ${app.status === 'Zamítnuto' ? 'selected' : ''}>Zamítnuto</option>
        </select>
      </div>

      <!-- Internal notes textarea -->
      <div>
        <label for="modalNotesInput" class="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-bold">
          Interní poznámka koordinátora &amp; ŠPP:
        </label>
        <textarea id="modalNotesInput" rows="3" placeholder="Záznam z rozhovoru, hodnocení Canvy, specifické potřeby..." class="w-full px-4 py-2.5 rounded-xl bg-cyber-900 border border-white/20 text-white font-sans text-xs focus:outline-none focus:border-neon-cyan">${app.notes || ''}</textarea>
      </div>

    </div>

    <!-- Action Buttons -->
    <div class="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
      <button id="deleteAppBtn" class="px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-mono text-red-300 transition-all flex items-center gap-1.5">
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        <span>Smazat</span>
      </button>

      <div class="flex items-center gap-3">
        <button id="cancelModalBtn" class="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 transition-all">
          Zrušit
        </button>
        <button id="saveAppBtn" class="px-6 py-2.5 rounded-xl font-mono text-xs font-bold text-white bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-95 transition-all shadow-lg shadow-neon-cyan/20 flex items-center gap-1.5">
          <i data-lucide="save" class="w-3.5 h-3.5"></i>
          <span>Uložit změny</span>
        </button>
      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Hook save and delete actions
  document.getElementById('cancelModalBtn').addEventListener('click', closeDetailModal);
  
  document.getElementById('saveAppBtn').addEventListener('click', async () => {
    const newStatus = document.getElementById('modalStatusSelect').value;
    const newNotes = document.getElementById('modalNotesInput').value.trim();

    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: app.id,
          status: newStatus,
          notes: newNotes
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        app.status = newStatus;
        app.notes = newNotes;
        updateKPIs();
        renderTable();
        closeDetailModal();
        showToast(`Přihláška ${app.id} byla aktualizována.`, 'success');
      } else {
        showToast(data.error || 'Chyba při ukládání změn.', 'error');
      }
    } catch (err) {
      showToast('Nepodařilo se uložit změny na server.', 'error');
    }
  });

  document.getElementById('deleteAppBtn').addEventListener('click', async () => {
    if (!confirm(`Opravdu chcete smazat přihlášku žáka ${app.studentName} (${app.id})?`)) {
      return;
    }

    try {
      const res = await fetch('/api/applications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: app.id })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        applicationsState = applicationsState.filter(a => a.id !== app.id);
        updateKPIs();
        renderTable();
        closeDetailModal();
        showToast(`Přihláška žáka ${app.studentName} byla smazána.`, 'info');
      } else {
        showToast(data.error || 'Chyba při mazání.', 'error');
      }
    } catch (err) {
      showToast('Nepodařilo se smazat přihlášku.', 'error');
    }
  });

  // Show modal
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    const box = document.getElementById('detailModalBox');
    if (box) {
      box.classList.remove('scale-95');
      box.classList.add('scale-100');
    }
  }, 10);
}

function closeDetailModal() {
  const modal = document.getElementById('detailModal');
  if (!modal) return;
  modal.classList.add('opacity-0');
  const box = document.getElementById('detailModalBox');
  if (box) {
    box.classList.remove('scale-100');
    box.classList.add('scale-95');
  }
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 250);
}

/* ==========================================================================
   6. Toast Notifications
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

  setTimeout(() => {
    toast.classList.remove('translate-y-3', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}
