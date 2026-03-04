import { auth, db } from './firebase-init.js';
import { ref, update } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js';

const DEAR_SLOTS = ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'];
const JACKPOT_SLOTS = ['11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'];
const DAILY_SLOTS = ['02:30 PM'];

// Tab Logic
document.querySelectorAll('.nav-tabs button').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.nav-tabs button, .page-content').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.id.replace('tab-', 'page-')).classList.add('active');
    };
});

function createInp(slot, type, len) {
    const input = document.createElement('input');
    input.placeholder = `${len} Digits`;
    input.maxLength = len;
    input.dataset.slot = slot;
    input.dataset.type = type;
    input.oninput = () => input.value = input.value.replace(/\D/g, '');
    return input;
}

function init() {
    const dearRows = document.getElementById('dear-rows');
    DEAR_SLOTS.forEach(slot => {
        const div = document.createElement('div');
        div.className = 'row-card dear-grid';
        div.innerHTML = `<div class="time-label">${slot}</div>`;
        div.appendChild(createInp(slot, 'machine', 5));
        div.appendChild(createInp(slot, 'result', 5));
        div.appendChild(createInp(slot, 'three_digit', 3));
        div.appendChild(createInp(slot, 'guessing', 2));
        dearRows.appendChild(div);
    });

    const klRow = document.getElementById('kl-row');
    DAILY_SLOTS.forEach(slot => {
      const klDiv = document.createElement('div');
      klDiv.className = 'row-card kl-grid';
      klDiv.appendChild(createInp(slot, 'kl_machine', 5));
      klDiv.appendChild(createInp(slot, 'kl_result', 5));
      klDiv.appendChild(createInp(slot, 'kl_guessing', 3));
      klRow.appendChild(klDiv);
      });

    const jackRows = document.getElementById('jackpot-rows');
    JACKPOT_SLOTS.forEach(slot => {
        const div = document.createElement('div');
        div.className = 'row-card jackpot-grid';
        div.innerHTML = `<div class="time-label">${slot}</div>`;
        div.appendChild(createInp(slot, 'jackpot', 3));
        jackRows.appendChild(div);
    });
}

init();

document.getElementById('submit-btn').onclick = async () => {
    const date = document.getElementById('select-date').value;
    if(!date) return alert("Select Date");
    const updates = {};
    document.querySelectorAll('input[data-type]').forEach(i => {
        if(i.value) updates[`lottery/${date}/${i.dataset.slot}/${i.dataset.type}`] = i.value;
    });
    await update(ref(db), updates);
    alert("Data Saved Successfully!");
};