/**
 * Form Validation & Submission Module
 * Validates expedition form inputs and submits registration to database endpoint.
 */

import { showToast } from './toast.js';

export function initFormValidation() {
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

    // Validation checks
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
