import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCVIGlYqFf1AktnPXflEFjewAl7oNJQXrE",
    authDomain: "dearlive-97ef5.firebaseapp.com",
    projectId: "dearlive-97ef5",
    storageBucket: "dearlive-97ef5.firebasestorage.app",
    messagingSenderId: "28322305982",
    appId: "1:28322305982:web:aeb257a85ff8213436cbef"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
