import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCbNLP1tNrUVZFeKtdCV_jWSTC3i2GUUkQ",
    authDomain: "just-us-8c275.firebaseapp.com",
    projectId: "just-us-8c275",
    storageBucket: "just-us-8c275.appspot.com",
    messagingSenderId: "109163002325",
    appId: "1:109163002325:web:fd7119118257fdf234655c",
    measurementId: "G-B7K091Q0ZL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { auth, db, storage };
