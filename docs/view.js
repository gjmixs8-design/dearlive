import { auth, db } from './firebase-init.js';

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import {
  ref,
  get,
  update
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

/* === CONFIGURATION === */

const timeSlots = [
  '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'
];

const fieldConfigs = {
  machine: 5,
  result: 5,
  three_digit: 3,
  kl_machine: 5,
  kl_result: 5,
  guessing: 2,
  jackpot: 3
};

/* === DOM ELEMENTS === */

const datePicker = document.getElementById('datePicker');
const logoutBtn = document.getElementById('logoutBtn');
const rowsWrap = document.getElementById('rows');
const saveBtn = document.getElementById('saveChangesBtn');
const resetBtn = document.getElementById('resetBtn');

/* === STATE === */

let loadedSnapshot = {};
let currentDateKey = '';
let inputsMap = new Map();

/* === AUTH CHECK === */

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = 'index.html';
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'index.html';
});

/* === BUILD INPUT ROWS === */

function buildRows() {
  rowsWrap.innerHTML = '';
  inputsMap.clear();

  timeSlots.forEach(slot => {
    const row = document.createElement('div');
    row.className = 'row grid-layout';

    let innerHTML = `<div class="slot">${slot}</div>`;

    Object.keys(fieldConfigs).forEach(type => {
      const maxLen = fieldConfigs[type];
      innerHTML += `
        <input type="text"
          inputmode="numeric"
          placeholder="${maxLen} digits"
          data-slot="${slot}"
          data-type="${type}"
          maxlength="${maxLen}" />
      `;
    });

    row.innerHTML = innerHTML;

    const inputs = row.querySelectorAll('input');

    inputs.forEach(inp => {
      const type = inp.dataset.type;
      const requiredLen = fieldConfigs[type];

      // numeric only
      inp.addEventListener('input', () => {
        inp.value = inp.value.replace(/\D/g, '').slice(0, requiredLen);
        markDirtyIfChanged(inp);
      });

      inp.addEventListener('blur', () => {
        if (inp.value && inp.value.length !== requiredLen) {
          alert(`${inp.dataset.slot} (${type}): Must be exactly ${requiredLen} digits`);
        }
      });

      inputsMap.set(`${slot}::${type}`, inp);
    });

    rowsWrap.appendChild(row);
  });
}

/* === LOAD DATA === */

async function loadForDate(dateKey) {
  if (!dateKey) return;

  currentDateKey = dateKey;
  buildRows();

  try {
    const snap = await get(ref(db, `lottery/${dateKey}`));
    const data = snap.val() || {};

    loadedSnapshot = data;

    timeSlots.forEach(slot => {
      Object.keys(fieldConfigs).forEach(type => {
        const val = data?.[slot]?.[type] ?? '';
        const inp = inputsMap.get(`${slot}::${type}`);
        if (inp) {
          inp.value = val;
          inp.classList.remove('dirty');
        }
      });
    });

  } catch (error) {
    console.error("Load failed:", error);
  }
}

/* === DIRTY TRACKING === */

function isDifferent(slot, type, val) {
  const prev = loadedSnapshot?.[slot]?.[type] ?? '';
  return String(prev) !== String(val);
}

function markDirtyIfChanged(inp) {
  const { slot, type } = inp.dataset;
  inp.classList.toggle('dirty', isDifferent(slot, type, inp.value));
}

/* === SAVE CHANGES === */

async function saveChanges() {
  if (!currentDateKey) return alert('Select a date first.');

  const updates = {};
  let hasValidationError = false;

  for (const [key, el] of inputsMap) {
    const type = el.dataset.type;
    const requiredLen = fieldConfigs[type];

    if (el.value && el.value.length !== requiredLen) {
      alert(`${el.dataset.slot} (${type}): Must be exactly ${requiredLen} digits`);
      el.focus();
      hasValidationError = true;
      break;
    }

    const [slot, fieldType] = key.split('::');

    if (isDifferent(slot, fieldType, el.value)) {
      updates[`lottery/${currentDateKey}/${slot}/${fieldType}`] = el.value || null;
    }
  }

  if (hasValidationError) return;

  if (Object.keys(updates).length === 0) {
    alert('No changes to save.');
    return;
  }

  try {
    await update(ref(db), updates);
    alert('Changes saved successfully!');

    // update local snapshot
    Object.entries(updates).forEach(([path, val]) => {
      const parts = path.split('/');
      const slot = parts[2];
      const type = parts[3];

      if (!loadedSnapshot[slot]) loadedSnapshot[slot] = {};
      loadedSnapshot[slot][type] = val ?? '';
    });

    inputsMap.forEach(el => markDirtyIfChanged(el));

  } catch (e) {
    console.error(e);
    alert('Failed to save.');
  }
}

/* === RESET === */

function resetToLoaded() {
  if (!currentDateKey) return;

  inputsMap.forEach((el, key) => {
    const [slot, type] = key.split('::');
    const val = loadedSnapshot?.[slot]?.[type] ?? '';
    el.value = val;
    el.classList.remove('dirty');
  });
}

/* === EVENTS === */

saveBtn.addEventListener('click', saveChanges);
resetBtn.addEventListener('click', resetToLoaded);

datePicker.addEventListener('change', () => {
  loadForDate(datePicker.value);
});

/* === SET DEFAULT TO TODAY === */

(function setToday() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  const today = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  datePicker.value = today;
  loadForDate(today);
})();