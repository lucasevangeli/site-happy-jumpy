// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    // Cria o usuário no Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Cria um registro inicial para o usuário no Realtime Database
    const db = admin.database();
    const userRef = db.ref(`users/${userRecord.uid}`);
    await userRef.set({
      email: userRecord.email,
      createdAt: new Date().toISOString(),
      profileComplete: false, // Flag para indicar que o perfil detalhado não foi preenchido
    });

    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    return NextResponse.json({
      uid: userRecord.uid,
      email: userRecord.email,
      token: customToken,
    });
  } catch (error: any) {
    console.error('Erro no registro:', error);
    // Mapeia códigos de erro do Firebase para mensagens amigáveis
    let errorMessage = 'Ocorreu um erro ao registrar o usuário.';
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'Este endereço de e-mail já está em uso.';
    } else if (error.code === 'auth/invalid-password') {
      errorMessage = 'A senha deve ter no mínimo 6 caracteres.';
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
