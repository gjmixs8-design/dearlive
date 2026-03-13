import { auth, db } from './firebase-init.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js';
import { ref, update, get } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js';

const dearSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'];
const jackpotSlots = ['11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'];

onAuthStateChanged(auth, user => { if (!user) window.location.href = 'index.html'; });

const rand = (n) => Math.floor(Math.pow(10, n-1) + Math.random() * 9 * Math.pow(10, n-1)).toString();

function createInp(label, type, slot, max, val) {
    return `
        <div class="input-group">
            <label>${label}</label>
            <input type="text" data-slot="${slot}" data-type="${type}" maxlength="${max}" 
            inputmode="numeric" value="${val || ''}" placeholder="-" oninput="this.value=this.value.replace(/\\D/g,'')">
        </div>`;
}

async function render(forceEmpty = false) {
    const date = document.getElementById('select-date').value;
    let cache = {};

    // Only fetch data if we are NOT forcing an empty form
    if (!forceEmpty && date) {
        const snap = await get(ref(db, `lottery/${date}`));
        cache = snap.val() || {};
    }

    // Render DEAR Page
    const dearContainer = document.getElementById('dear-rows');
    dearContainer.innerHTML = '';
    dearSlots.forEach(s => {
        const d = cache[s] || {};
        const row = document.createElement('div');
        row.className = 'grid-row';
        row.innerHTML = `
            <div class="time-tag">${s}</div>
            ${createInp('Machine', 'machine', s, 5, d.machine)}
            ${createInp('Result', 'result', s, 5, d.result)}
            ${createInp('3Digit', 'three_digit', s, 3, d.three_digit)}
            ${createInp('Guessing', 'guessing', s, 2, d.guessing)}
            <button class="dice-btn" onclick="rollDice('${s}', 'dear')">🎲</button>
        `;
        dearContainer.appendChild(row);
    });

    // Render KL & Jackpot Page
    const klContainer = document.getElementById('kl-row');
    const klD = cache['Daily'] || {};
    klContainer.innerHTML = `
        <h3 style="color:var(--primary); margin-left:10px">KL Daily Result</h3>
        <div class="grid-row">
            ${createInp('KL Machine', 'kl_machine', 'Daily', 5, klD.kl_machine)}
            ${createInp('KL Result', 'kl_result', 'Daily', 5, klD.kl_result)}
            ${createInp('KL Guess', 'kl_guessing', 'Daily', 2, klD.kl_guessing)}
            <button class="dice-btn" onclick="rollDice('Daily', 'kl')">🎲</button>
        </div>`;

    const jackContainer = document.getElementById('jackpot-rows');
    jackContainer.innerHTML = '<h3 style="color:var(--primary); margin-left:10px">Jackpot Slots</h3>';
    jackpotSlots.forEach(s => {
        const jD = cache[s] || {};
        const row = document.createElement('div');
        row.className = 'grid-row';
        row.innerHTML = `
            <div class="time-tag">${s}</div>
            ${createInp('Jackpot', 'jackpot', s, 3, jD.jackpot)}
            <button class="dice-btn" onclick="rollDice('${s}', 'jack')">🎲</button>
        `;
        jackContainer.appendChild(row);
    });
}

window.rollDice = (slot, category) => {
    const rowInputs = document.querySelectorAll(`input[data-slot="${slot}"]`);
    rowInputs.forEach(i => {
        const type = i.dataset.type;
        if(category === 'dear') {
            if(type === 'machine') i.value = rand(5);
            if(type === 'result') {
                const val = rand(5);
                i.value = val;
                const sync3 = document.querySelector(`input[data-slot="${slot}"][data-type="three_digit"]`);
                if(sync3) sync3.value = val.slice(-3);
            }
            if(type === 'guessing') i.value = rand(2);
        } else if(category === 'kl') {
            if(type.includes('machine')) i.value = rand(5);
            if(type.includes('result')) i.value = rand(5);
            if(type.includes('guessing')) i.value = rand(2);
        } else {
            i.value = rand(3);
        }
        i.style.borderColor = 'var(--dice-neon)';
    });
};

// Tab logic
document.querySelectorAll('.nav-tabs button').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.nav-tabs button, .page-content').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.id.replace('tab-', 'page-');
        document.getElementById(targetId).classList.add('active');
    };
});

// Submit Logic
document.getElementById('submit-data-btn').onclick = async () => {
    const date = document.getElementById('select-date').value;
    if(!date) return alert("Select Date First");
    
    document.getElementById('loader').style.display = 'flex';
    const updates = {};
    document.querySelectorAll('input[data-slot]').forEach(inp => {
        updates[`lottery/${date}/${inp.dataset.slot}/${inp.dataset.type}`] = inp.value || null;
    });

    try {
        await update(ref(db), updates);
        alert("Live Database Updated!");
        render(false); // Refreshes view with the data just submitted
    } catch (e) { 
        alert("Save Failed. Check Connection."); 
    } finally { 
        document.getElementById('loader').style.display = 'none'; 
    }
};

// Date Change: Load data if exists
document.getElementById('select-date').onchange = () => render(false);

// Initial Load: Set current date and fetch existing data
const today = new Date().toISOString().split('T')[0];
document.getElementById('select-date').value = today;
render(false); // Fetch today's data automatically on open

document.getElementById('logout-btn').onclick = () => signOut(auth);

// Clear Form: Force all fields to empty without fetching
document.getElementById('clear-btn').onclick = () => { 
    if(confirm("Reset current form to empty?")) {
        render(true); 
    }
};