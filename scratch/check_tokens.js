const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
}

const db = getFirestore(admin.app(), 'happy');

async function checkTokens() {
    const snapshot = await db.collection('users').get();
    console.log(`Encontrados ${snapshot.size} usuários.`);
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.expoPushToken) {
            console.log(`Usuário: ${doc.id} | Nome: ${data.fullName || 'N/A'} | Token: ${data.expoPushToken}`);
        } else {
            // Se o documento estiver vazio ou não tiver campos, não mostramos nada muito grande
            if (Object.keys(data).length > 0) {
                console.log(`Usuário: ${doc.id} | Nome: ${data.fullName || 'N/A'} | SEM TOKEN`);
            }
        }
    });
}

checkTokens().catch(console.error);
