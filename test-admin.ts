import admin from './lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

async function test() {
    try {
        const db = getFirestore(admin.app(), 'happy');
        console.log("Banco de dados instanciado com sucesso:", db.databaseId);

        // Testa uma pequena operacao so pra ver se nao da 5 NOT FOUND
        const doc = await db.collection('users').limit(1).get();
        console.log("Sucesso ao ler. Encontrados:", doc.size);
    } catch (error) {
        console.error("Erro:", error);
    }
}

test();
