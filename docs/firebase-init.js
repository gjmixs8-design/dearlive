import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCC2McOLYU0Pl7E4WVcpUOxt0gqvYG5_e8",
  authDomain: "dearlive-78af3.firebaseapp.com",
  databaseURL: "https://dearlive-78af3-default-rtdb.firebaseio.com",
  projectId: "dearlive-78af3",
  storageBucket: "dearlive-78af3.firebasestorage.app",
  messagingSenderId: "458855351006",
  appId: "1:458855351006:web:e729823d8f1cf8ad5d784f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
