import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCyRojed8QV_dRWAGCwIHiu6NFxLiRqcN8",
    authDomain: "coffee-f12cd.firebaseapp.com",
    projectId: "coffee-f12cd",
    storageBucket: "coffee-f12cd.appspot.com",
    messagingSenderId: "1020621847486",
    appId: "1:1020621847486:web:28f96b67d2588876d057ef",
    measurementId: "G-Z0B2QM1WE6"
  };

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const auth = initializeAuth(firebase, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
})
const db = getFirestore(firebase);

export { firebase, auth, db };