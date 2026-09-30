/**
 * Copy Link Module
 * Handles copying expedition link to user clipboard.
 */

import { showToast } from './toast.js';

export function initCopyLink() {
  const copyBtn = document.getElementById('copyLinkBtn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
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
