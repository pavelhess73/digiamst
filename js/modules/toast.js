/**
 * Toast Notification System
 * Displays temporary feedback notifications.
 */

export function showToast(message, type = 'info') {
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
