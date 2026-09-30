/**
 * Form Validation & Submission Module
 * Validates expedition form inputs and submits registration to database endpoint.
 * Security layers: honeypot, school PIN, Cloudflare Turnstile.
 */

import { showToast } from './toast.js';

// ---------------------------------------------------------------------------
// Inline error banner helpers
// ---------------------------------------------------------------------------
function showFormError(message) {
  const banner = document.getElementById('formErrorBanner');
  const text   = document.getElementById('formErrorText');
  if (!banner || !text) {
    showToast(message, 'error');
    return;
  }
  text.textContent = message;
  banner.classList.remove('hidden');
  banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideFormError() {
  const banner = document.getElementById('formErrorBanner');
  if (banner) banner.classList.add('hidden');
}

// ---------------------------------------------------------------------------
// Main form init
// ---------------------------------------------------------------------------
export function initFormValidation() {
  const form        = document.getElementById('expeditionForm');
  const successBox  = document.getElementById('formSuccessMessage');
  const refCodeElem = document.getElementById('successRefCode');
  const submitBtn   = document.getElementById('submitFormBtn');

  if (!form || !successBox) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormError();

    const name         = document.getElementById('studentName')?.value.trim();
    const studentClass = document.getElementById('studentClass')?.value;
    const email        = document.getElementById('parentEmail')?.value.trim();
    const phone        = document.getElementById('parentPhone')?.value.trim();
    const motivation   = document.getElementById('motivation')?.value.trim();
    const consent      = document.getElementById('consent')?.checked;
    const schoolPin    = document.getElementById('schoolPin')?.value.trim();
    const honeypot     = document.getElementById('website')?.value;

    // --- Honeypot check (frontendová vrstva) ---
    if (honeypot) {
      // Potichu simulujeme úspěch – bot si myslí, že uspěl
      form.classList.add('hidden');
      successBox.classList.remove('hidden');
      return;
    }

    // --- Základní validace ---
    if (!name || !studentClass || !email || !consent) {
      showFormError('Vyplňte prosím všechna povinná pole označená hvězdičkou.');
      return;
    }

    if (!schoolPin) {
      showFormError('Zadejte školní PIN kód. Získáš ho od učitele IT nebo v Bakalářích.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFormError('Zadejte platnou e-mailovou adresu zákonného zástupce.');
      return;
    }

    // --- Turnstile token ---
    const turnstileToken = document.querySelector('[name="cf-turnstile-response"]')?.value || '';

    // --- Submit stav tlačítka ---
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
      studentName:    name,
      studentClass:   studentClass,
      parentEmail:    email,
      parentPhone:    phone,
      motivation:     motivation,
      schoolPin:      schoolPin,
      website:        honeypot || '',
      turnstileToken: turnstileToken
    };

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        // Zobrazit serverovou chybu inline v banneru
        showFormError(result.error || 'Chyba při ukládání přihlášky. Zkuste to prosím znovu.');
        showToast(result.error || 'Chyba serveru.', 'error');
      }
    } catch (err) {
      console.error('Chyba při odesílání formuláře:', err);
      showFormError('Nepodařilo se připojit k serveru. Zkontrolujte připojení k internetu a zkuste to znovu.');
      showToast('Chyba připojení k serveru.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    }
  });
}
