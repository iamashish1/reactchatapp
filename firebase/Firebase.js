import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCxmBRI4SoWSFr0D9SwyMcuAvtqIzfPd6o",
  authDomain: "carpoolapp-3b5c0.firebaseapp.com",
  projectId: "carpoolapp-3b5c0",
  storageBucket: "carpoolapp-3b5c0.appspot.com",
  messagingSenderId: "639317273644",
  appId: "1:639317273644:web:d942fa61a0290bdf8c7589",
  measurementId: "G-KBPE92BFQ5"
  };

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const auth = initializeAuth(firebase, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
})
const db = getFirestore(firebase);

export { firebase, auth, db };