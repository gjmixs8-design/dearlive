import { auth, db } from './firebase-init.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js';
import { ref, update } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js';

const timeSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'];

// Column Selectors
const machineCol = document.getElementById('machine-column');
const resultCol = document.getElementById('result-column');
const threedigitCol = document.getElementById('three_digit-column');
const klMachineCol = document.getElementById('kl-machine-column');
const klResultCol = document.getElementById('kl-result-column');
const guessingCol = document.getElementById('guessing-column');
const jackpotCol = document.getElementById('jackpot-column');

const dateInput = document.getElementById('select-date');
const submitBtn = document.getElementById('submit-data-btn');

// Authentication Guard
onAuthStateChanged(auth, user => {
  if (!user) window.location.href = 'index.html';
});

document.getElementById('logout-btn').onclick = () => {
  signOut(auth).then(() => window.location.href = 'index.html');
};

/**
 * Creates a card with specific validation rules based on the type
 */
function createCard(slot, type) {
  const card = document.createElement('div');
  card.className = 'card';

  // Set Max Lengths based on field type
  let maxLength = 5; // Default for Machine/Result
  if (type === 'three_digit' || type === 'jackpot') {
    maxLength = 3;
  } else if (type === 'guessing' ) {
    maxLength = 2;
  }

  card.innerHTML = `
    <h3>${slot}</h3>
    <input 
      type="text" 
      placeholder="${type}" 
      data-slot="${slot}" 
      class="${type}-input"
      maxlength="${maxLength}"
      inputmode="numeric"
    />
  `;

  const input = card.querySelector('input');
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, ''); // Numeric only
  });

  return card;
}

/**
 * Renders all columns based on the timeSlots array
 */
function renderCards() {
  const columns = [
    { el: machineCol, type: 'machine' },
    { el: resultCol, type: 'result' },
    { el: threedigitCol, type: 'three_digit' },
    { el: klMachineCol, type: 'kl_machine' },
    { el: klResultCol, type: 'kl_result' },
    { el: guessingCol, type: 'guessing' },
    { el: jackpotCol, type: 'jackpot' }
  ];

  columns.forEach(col => {
    if (col.el) {
      col.el.innerHTML = '';
      timeSlots.forEach(slot => {
        col.el.appendChild(createCard(slot, col.type));
      });
    }
  });
}

renderCards();

// Handle Submit
submitBtn.addEventListener('click', async () => {
  const selectedDate = dateInput.value;

  if (!selectedDate) {
    alert('Please select a date first.');
    return;
  }

  const updates = {};
  const fieldTypes = [
    'machine', 'result', 'three_digit',
    'kl_machine', 'kl_result', 'guessing', 'jackpot'
  ];

  // Loop through each field type to collect data
  fieldTypes.forEach(type => {
    const inputs = document.querySelectorAll(`.${type}-input`);
    inputs.forEach(input => {
      const slot = input.dataset.slot;
      const value = input.value.trim();
      if (value) {
        // Path: lottery/YYYY-MM-DD/10:00 AM/machine
        updates[`${selectedDate}/${slot}/${type}`] = value;
      }
    });
  });

  if (Object.keys(updates).length === 0) {
    alert("No data entered to submit.");
    return;
  }

  try {
    await update(ref(db, 'lottery'), updates);
    alert('All data submitted successfully!');
  } catch (error) {
    console.error("Firebase Error:", error);
    alert('Error saving data. Check console for details.');
  }
});