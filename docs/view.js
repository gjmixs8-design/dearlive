import { db } from './firebase-init.js';
import { ref, get, update } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js';

const DEAR_SLOTS = ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'];
const JACK_SLOTS = ['11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'];
let cache = {};

function createBox(slot, type, len, val) {
    const i = document.createElement('input');
    i.value = val || '';
    i.maxLength = len;
    i.dataset.slot = slot;
    i.dataset.type = type;
    i.oninput = () => {
        i.value = i.value.replace(/\D/g, '');
        i.classList.toggle('changed', i.value !== (cache[slot]?.[type] || ''));
    };
    return i;
}

async function sync() {
    const date = document.getElementById('viewDate').value;
    if(!date) return;
    const snap = await get(ref(db, `lottery/${date}`));
    cache = snap.val() || {};

    const dv = document.getElementById('dear-view'); dv.innerHTML = '';
    DEAR_SLOTS.forEach(s => {
        const d = document.createElement('div'); d.className = 'grid dear-grid';
        d.innerHTML = `<div>${s}</div>`;
        d.appendChild(createBox(s, 'machine', 5, cache[s]?.machine));
        d.appendChild(createBox(s, 'result', 5, cache[s]?.result));
        d.appendChild(createBox(s, 'three_digit', 3, cache[s]?.three_digit));
        d.appendChild(createBox(s, 'guessing', 2, cache[s]?.guessing));
        dv.appendChild(d);
    });

    const kv = document.getElementById('kl-view'); kv.innerHTML = '';
    const kd = document.createElement('div'); kd.className = 'grid kl-grid';
    kd.appendChild(createBox('Daily', 'kl_machine', 5, cache['Daily']?.kl_machine));
    kd.appendChild(createBox('Daily', 'kl_result', 5, cache['Daily']?.kl_result));
    kd.appendChild(createBox('Daily', 'kl_guessing', 3, cache['Daily']?.kl_guessing));
    kv.appendChild(kd);

    const jv = document.getElementById('jack-view'); jv.innerHTML = '';
    JACK_SLOTS.forEach(s => {
        const d = document.createElement('div'); d.className = 'grid jack-grid';
        d.innerHTML = `<div>${s}</div>`;
        d.appendChild(createBox(s, 'jackpot', 3, cache[s]?.jackpot));
        jv.appendChild(d);
    });
}

document.getElementById('viewDate').onchange = sync;
document.getElementById('saveChanges').onclick = async () => {
    const date = document.getElementById('viewDate').value;
    const updates = {};
    document.querySelectorAll('input.changed').forEach(i => {
        updates[`lottery/${date}/${i.dataset.slot}/${i.dataset.type}`] = i.value || null;
    });
    await update(ref(db), updates);
    alert("Database Updated!");
    sync();
};

document.getElementById('viewDate').value = new Date().toISOString().split('T')[0];
sync();