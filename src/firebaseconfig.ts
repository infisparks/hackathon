// firebaseconfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
const firebaseConfig = {
  apiKey: "AIzaSyA1NcURyeelMcIKyqM4znyXl6DsURaLGg0",
  authDomain: "hackthon-ba0db.firebaseapp.com",
  databaseURL: "https://hackthon-ba0db-default-rtdb.firebaseio.com",
  projectId: "hackthon-ba0db",
  storageBucket: "hackthon-ba0db.firebasestorage.app",
  messagingSenderId: "556475652646",
  appId: "1:556475652646:web:45c993e10579d58cc264e7",
  measurementId: "G-N465YT7ZJG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
export { auth , db};
