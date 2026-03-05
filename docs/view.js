import { db } from './firebase-init.js';
import { ref, get, update } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

const dearSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'];
const jackpotSlots = ['11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'];
let cache = {};

function createBox(slot, type, max, val) {
    const i = document.createElement('input');
    i.value = val || '';
    i.dataset.slot = slot;
    i.dataset.type = type;
    i.maxLength = max;
    i.inputMode = "numeric";
    i.placeholder = "Empty";
    
    i.oninput = () => {
        i.value = i.value.replace(/\D/g, '');
        // Dirty checking: Highlight if different from original database value
        const originalVal = cache[slot]?.[type] || '';
        i.classList.toggle('dirty', i.value !== originalVal);
    };
    return i;
}

async function render() {
    const date = document.getElementById('datePicker').value;
    if(!date) return;

    const snap = await get(ref(db, `lottery/${date}`));
    cache = snap.val() || {};

    // Render DEAR
    const dv = document.getElementById('dear-view'); dv.innerHTML = '';
    dearSlots.forEach(s => {
        const d = document.createElement('div'); d.className = 'grid-row grid-dear';
        d.innerHTML = `<div class="time-cell">${s}</div>`;
        d.appendChild(createBox(s, 'machine', 5, cache[s]?.machine));
        d.appendChild(createBox(s, 'result', 5, cache[s]?.result));
        d.appendChild(createBox(s, 'three_digit', 3, cache[s]?.three_digit));
        d.appendChild(createBox(s, 'guessing', 2, cache[s]?.guessing));
        dv.appendChild(d);
    });

    // Render KL
    const kv = document.getElementById('kl-view'); kv.innerHTML = '';
    const kd = document.createElement('div'); kd.className = 'grid-row grid-kl';
    kd.appendChild(createBox('Daily', 'kl_machine', 5, cache['Daily']?.kl_machine));
    kd.appendChild(createBox('Daily', 'kl_result', 5, cache['Daily']?.kl_result));
    kd.appendChild(createBox('Daily', 'kl_guessing', 2, cache['Daily']?.kl_guessing));
    kv.appendChild(kd);

    // Render Jackpot
    const jv = document.getElementById('jack-view'); jv.innerHTML = '';
    jackpotSlots.forEach(s => {
        const d = document.createElement('div'); d.className = 'grid-row grid-jack';
        d.innerHTML = `<div class="time-cell">${s}</div>`;
        d.appendChild(createBox(s, 'jackpot', 3, cache[s]?.jackpot));
        jv.appendChild(d);
    });
}

document.getElementById('datePicker').onchange = render;

document.getElementById('saveBtn').onclick = async () => {
    const updates = {};
    const date = document.getElementById('datePicker').value;
    const dirtyInputs = document.querySelectorAll('input.dirty');

    if(dirtyInputs.length === 0) return alert("No changes detected.");

    dirtyInputs.forEach(i => {
        // If empty, set to null to delete the field in Firebase
        updates[`lottery/${date}/${i.dataset.slot}/${i.dataset.type}`] = i.value || null;
    });

    try {
        await update(ref(db), updates);
        alert("Success! Changes are live.");
        render(); // Refresh to reset dirty states
    } catch (e) {
        alert("Error saving. Please try again.");
    }
};

// Auto-load Today's Date
document.getElementById('datePicker').value = new Date().toISOString().split('T')[0];
render();