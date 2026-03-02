import { auth } from './firebase-init.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login-btn');

  if (!loginBtn) {
    console.error("Login button not found.");
    return;
  }

  loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value.trim();
    const errorBox = document.getElementById('login-error');

    if (!email || !password) {
      errorBox.innerText = "Email and password required.";
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = 'admin.html';
    } catch (err) {
      console.error(err);
      errorBox.innerText = err.message;
    }
  });
});