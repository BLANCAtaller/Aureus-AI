// Firebase Configuration & Bootstrap
// Assumes firebase-app.js, firebase-auth.js, and firebase-firestore.js are loaded via CDN in index.html

(function () {
    console.log("🔥 Configuring Firebase...");

    if (typeof firebase === 'undefined') {
        console.error("❌ Firebase SDK not loaded! Check index.html script tags.");
        return;
    }

    // Expose modules wrapper for compatibility with existing code
    window.firebaseModules = {
        // App
        initializeApp: firebase.initializeApp.bind(firebase),
        // Auth
        getAuth: () => firebase.auth(),
        GoogleAuthProvider: firebase.auth.GoogleAuthProvider,
        signInWithPopup: (auth, provider) => auth.signInWithPopup(provider),
        signOut: (auth) => auth.signOut(),
        // Firestore
        getFirestore: () => firebase.firestore(),
        doc: (db, collection, docId) => db.collection(collection).doc(docId),
        setDoc: (docRef, data) => docRef.set(data),
        getDoc: (docRef) => docRef.get().then(snap => ({
            exists: () => snap.exists,
            data: () => snap.data()
        }))
    };

    console.log("✅ Firebase Configured & Wrapper Exposed");
    window.dispatchEvent(new CustomEvent('firebaseReady'));
})();
