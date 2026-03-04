const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
});

async function run() {
    try {
        console.log("Conectando ao banco happy...");
        const db = getFirestore(admin.app(), 'happy');
        const snap = await db.collection('settings').limit(1).get();
        console.log("Sucesso! Settings encontrados: " + snap.size);
    } catch (err) {
        console.error("Erro no teste happy:", err.message);
    }
}
run();
