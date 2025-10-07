// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "studio-7625668114-17a40",
  "appId": "1:629206608253:web:153a54a197cfda478e8414",
  "apiKey": "AIzaSyBoVCNKTe8qgtB8BwTNAr0u8Ec7eO3GCKM",
  "authDomain": "studio-7625668114-17a40.firebaseapp.com",
  "measurementId": "",
  "storageBucket": "studio-7625668114-17a40.appspot.com",
  "messagingSenderId": "629206608253"
};

export function getFirebaseConfig() {
  if (!firebaseConfig || !firebaseConfig.apiKey) {
    throw new Error('Firebase config is not set');
  }
  return firebaseConfig;
}
