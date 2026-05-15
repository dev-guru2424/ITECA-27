/* ============================================
   ITECA'27 - Firebase Configuration & Helpers
   ============================================
   
   This file initializes Firebase and provides
   helper functions for Firestore operations.
   
   SETUP:
   1. Go to https://console.firebase.google.com
   2. Create a new project (name: ITECA27)
   3. Go to Project Settings → General → Your apps
   4. Click "Add app" → Web → Register app
   5. Copy the firebaseConfig object below
   6. Enable Firestore Database in Firebase Console
   ============================================ */

// ⚠️ REPLACE THIS with your Firebase project config
// Get this from: Firebase Console → Project Settings → Your apps → Config
const firebaseConfig = {
  apiKey: "AIzaSyA-XaRmidTLo6ZUAzMLmTWM-VffGNY5gJY",
  authDomain: "iteca-27.firebaseapp.com",
  projectId: "iteca-27",
  storageBucket: "iteca-27.firebasestorage.app",
  messagingSenderId: "67237612360",
  appId: "1:67237612360:web:238e15a4127aba8412017d"
};

// ==========================================
// INITIALIZE FIREBASE
// ==========================================

// Initialize Firebase App
firebase.initializeApp(firebaseConfig);

// Initialize Firestore Database
const db = firebase.firestore();

// Collection name for registrations
const COLLECTION_NAME = 'registrations';

console.log('🔥 Firebase initialized successfully');

// ==========================================
// FIRESTORE HELPER FUNCTIONS
// ==========================================

/**
 * Check if a participant is already registered for a competition
 * @param {string} competition - Competition name
 * @param {string} rollNumber - Participant roll number
 * @returns {Promise<boolean>} - true if duplicate exists
 */
async function checkDuplicate(competition, rollNumber) {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('competition', '==', competition)
      .where('rollNumber', '==', rollNumber)
      .get();

    return !snapshot.empty; // true = duplicate found
  } catch (error) {
    console.error('Duplicate check error:', error);
    return false; // Allow registration if check fails
  }
}

/**
 * Add a new registration to Firestore
 * @param {Object} data - Registration data
 * @returns {Promise<string>} - Document ID of the new registration
 */
async function addRegistration(data) {
  try {
    const docRef = await db.collection(COLLECTION_NAME).add({
      competition: data.competition,
      rollNumber: data.rollNumber,
      name: data.name,
      email: data.email,
      teamMembers: data.teamMembers,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toLocaleString() // Human-readable fallback
    });

    console.log('✅ Registration saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving registration:', error);
    throw error;
  }
}

/**
 * Get all registrations from Firestore (for admin panel)
 * @returns {Promise<Array>} - Array of registration objects with doc IDs
 */
async function getAllRegistrations() {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .orderBy('timestamp', 'desc')
      .get();

    const registrations = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      registrations.push({
        id: doc.id, // Firestore document ID (needed for delete)
        competition: data.competition || '',
        rollNumber: data.rollNumber || '',
        name: data.name || '',
        email: data.email || '',
        teamMembers: data.teamMembers || 'N/A',
        timestamp: data.createdAt || 'N/A'
      });
    });

    console.log(`📊 Loaded ${registrations.length} registrations from Firestore`);
    return registrations;
  } catch (error) {
    console.error('❌ Error fetching registrations:', error);
    throw error;
  }
}

/**
 * Delete a registration from Firestore (admin only)
 * @param {string} docId - Firestore document ID to delete
 * @returns {Promise<void>}
 */
async function deleteRegistrationById(docId) {
  try {
    await db.collection(COLLECTION_NAME).doc(docId).delete();
    console.log('🗑️ Deleted registration:', docId);
  } catch (error) {
    console.error('❌ Error deleting registration:', error);
    throw error;
  }
}

/**
 * Get registration count per competition (for admin stats)
 * @returns {Promise<Object>} - { competitionName: count }
 */
async function getCompetitionCounts() {
  try {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    const counts = {};

    snapshot.forEach(doc => {
      const comp = doc.data().competition;
      counts[comp] = (counts[comp] || 0) + 1;
    });

    return counts;
  } catch (error) {
    console.error('Error getting counts:', error);
    return {};
  }
}
