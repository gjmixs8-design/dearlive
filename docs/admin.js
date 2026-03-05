import { auth, db } from './firebase-init.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js';
import { ref, update } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js';

const dearSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'];
const jackpotSlots = ['11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'];

// Auth Guard
onAuthStateChanged(auth, user => { if (!user) window.location.href = 'index.html'; });

// Tab Switching logic
document.querySelectorAll('.nav-tabs button').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.nav-tabs button, .page-content').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.id.replace('tab-', 'page-')).classList.add('active');
    };
});

function createInp(label, type, slot, max) {
    return `
        <div class="input-group">
            <label>${label}</label>
            <input type="text" data-slot="${slot}" data-type="${type}" maxlength="${max}" inputmode="numeric" placeholder="-">
        </div>`;
}

function init() {
    const dearBox = document.getElementById('dear-rows');
    dearSlots.forEach(s => {
        const div = document.createElement('div');
        div.className = 'grid-row grid-dear';
        div.innerHTML = `<div class="time-tag"><b>${s}</b></div>` + 
            createInp('Machine', 'machine', s, 5) +
            createInp('Result', 'result', s, 5) +
            createInp('3D Res', 'three_digit', s, 3) +
            createInp('2D Guess', 'guessing', s, 2);
        dearBox.appendChild(div);
    });

    const klBox = document.getElementById('kl-row');
    const klDiv = document.createElement('div');
    klDiv.className = 'grid-row grid-kl';
    klDiv.innerHTML = 
        createInp('KL Machine', 'kl_machine', 'Daily', 5) +
        createInp('KL Result', 'kl_result', 'Daily', 5) +
        createInp('KL Guess', 'kl_guessing', 'Daily', 2);
    klBox.appendChild(klDiv);

    const jackBox = document.getElementById('jackpot-rows');
    jackpotSlots.forEach(s => {
        const div = document.createElement('div');
        div.className = 'grid-row grid-jackpot';
        div.innerHTML = `<div class="time-tag"><b>${s}</b></div>` + createInp('Jackpot', 'jackpot', s, 3);
        jackBox.appendChild(div);
    });

    // Restriction: Numbers only
    document.querySelectorAll('input').forEach(i => {
        i.oninput = () => i.value = i.value.replace(/\D/g, '');
    });
}

init();

document.getElementById('submit-data-btn').onclick = async () => {
    const date = document.getElementById('select-date').value;
    if(!date) return alert("Please select a date first");
    
    document.getElementById('loader').style.display = 'flex';
    const updates = {};
    document.querySelectorAll('input').forEach(i => {
        if(i.value) updates[`lottery/${date}/${i.dataset.slot}/${i.dataset.type}`] = i.value;
    });

    try {
        await update(ref(db), updates);
        alert("Success! All data is live.");
    } catch (e) { 
        alert("Database Error: Check connection."); 
    } finally {
        document.getElementById('loader').style.display = 'none';
    }
};

document.getElementById('logout-btn').onclick = () => signOut(auth);