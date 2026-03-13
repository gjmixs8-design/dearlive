import { auth, db } from './firebase-init.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js';
import { ref, update, get } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js';

// Configuration
const dearSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'];
const jackpotSlots = ['11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'];

// Auth Guard
onAuthStateChanged(auth, user => { 
    if (!user) window.location.href = 'index.html'; 
});

// Helper: Generate random numeric string of length n
const rand = (n) => {
    return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
};

// Component: Create Input Group
function createInp(label, type, slot, max, val) {
    return `
        <div class="input-group">
            <label>${label}</label>
            <input type="text" data-slot="${slot}" data-type="${type}" maxlength="${max}" 
            inputmode="numeric" value="${val || ''}" placeholder="-" oninput="this.value=this.value.replace(/\\D/g,'')">
        </div>`;
}

// Main Render Function
async function render(shouldFetchData = true) {
    const date = document.getElementById('select-date').value;
    let cache = {};

    if (shouldFetchData && date) {
        document.getElementById('loader').style.display = 'flex';
        try {
            const snap = await get(ref(db, `lottery/${date}`));
            cache = snap.val() || {};
        } catch (e) {
            console.error("Fetch error:", e);
        }
        document.getElementById('loader').style.display = 'none';
    }

    // 1. Render DEAR Section
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

    // 2. Render KL Daily Section
    const klContainer = document.getElementById('kl-row');
    const klD = cache['Daily'] || {};
    klContainer.innerHTML = `
        <h3 style="color:var(--primary); margin-left:10px">KL Daily Result</h3>
        <div class="grid-row">
            ${createInp('KL Machine', 'kl_machine', 'Daily', 6, klD.kl_machine)}
            ${createInp('KL Result', 'kl_result', 'Daily', 6, klD.kl_result)}
            ${createInp('KL Guess', 'kl_guessing', 'Daily', 2, klD.kl_guessing)}
            <button class="dice-btn" onclick="rollDice('Daily', 'kl')">🎲</button>
        </div>`;

    // 3. Render Jackpot Section
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

/**
 * INDIVIDUAL ROLL LOGIC
 * Targets inputs specifically within the clicked row using data attributes.
 */
window.rollDice = (slot, category) => {
    // Select only inputs belonging to this specific time slot/ID
    const rowInputs = document.querySelectorAll(`input[data-slot="${slot}"]`);
    
    rowInputs.forEach(i => {
        const type = i.dataset.type;

        if (category === 'dear') {
            if (type === 'machine') i.value = rand(5);
            if (type === 'result') {
                const val = rand(5);
                i.value = val;
                // Sync the 3-digit box with the last 3 of the result
                const sync3 = document.querySelector(`input[data-slot="${slot}"][data-type="three_digit"]`);
                if (sync3) sync3.value = val.slice(-3);
            }
            if (type === 'guessing') i.value = rand(2);
        } 
        else if (category === 'kl') {
            if (type === 'kl_machine') i.value = rand(6);
            if (type === 'kl_result') i.value = rand(6);
            if (type === 'kl_guessing') i.value = rand(2);
        } 
        else if (category === 'jack') {
            if (type === 'jackpot') i.value = rand(3);
        }

        // Visual feedback for the roll
        i.style.borderColor = 'var(--dice-neon)';
        setTimeout(() => { i.style.borderColor = ''; }, 1000);
    });
};

// Tab Switching Navigation
document.querySelectorAll('.nav-tabs button').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.nav-tabs button, .page-content').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.id.replace('tab-', 'page-');
        document.getElementById(targetId).classList.add('active');
    };
});

// Submit/Update Database
document.getElementById('submit-data-btn').onclick = async () => {
    const date = document.getElementById('select-date').value;
    if (!date) return alert("Select Date First");
    
    document.getElementById('loader').style.display = 'flex';
    const updates = {};
    
    document.querySelectorAll('input[data-slot]').forEach(inp => {
        // Path: lottery/YYYY-MM-DD/SlotTime/FieldType
        updates[`lottery/${date}/${inp.dataset.slot}/${inp.dataset.type}`] = inp.value || null;
    });

    try {
        await update(ref(db), updates);
        alert("Live Database Updated!");
        render(true);
    } catch (e) { 
        alert("Save Failed. Check Connection."); 
    } finally { 
        document.getElementById('loader').style.display = 'none'; 
    }
};

// Initialization
const dateInput = document.getElementById('select-date');
if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
    dateInput.onchange = () => render(true);
}

// Initial Data Load
render(true);

// Logout
document.getElementById('logout-btn').onclick = () => signOut(auth);

// Clear View
document.getElementById('clear-btn').onclick = () => {
    if (confirm("Clear all data from this view?")) {
        render(false);
    }
};