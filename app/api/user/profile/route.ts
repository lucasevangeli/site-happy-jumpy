// app/api/user/profile/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import admin from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { auth as firebaseAuth } from 'firebase-admin';

export async function GET(request: Request) {
  const headersList = headers();
  const authorization = headersList.get('authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token de autorização ausente.' }, { status: 401 });
  }

  const token = authorization.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid } = decodedToken;

    const db = getFirestore(admin.app(), 'happy');
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(userDoc.data());
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json({ error: 'Erro ao carregar dados do perfil.' }, { status: 403 });
  }
}

export async function POST(request: Request) {
  // 1. Autenticação do usuário via Firebase Auth
  const headersList = headers();
  const authorization = headersList.get('authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token de autorização ausente ou mal formatado.' }, { status: 401 });
  }
  const token = authorization.split('Bearer ')[1];

  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(token);
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 403 });
  }
  const { uid, email } = decodedToken;

  try {
    // 2. Obter os dados do perfil do corpo da requisição
    const {
      fullName,
      phone,
      cpfCnpj,
      address,
      addressNumber,
      complement,
      province,
      postalCode,
    } = await request.json();

    const requiredFields = { fullName, phone, cpfCnpj, address, addressNumber, province, postalCode };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return NextResponse.json({ error: `O campo ${key} é obrigatório.` }, { status: 400 });
      }
    }

    // 3. Salvar os dados iniciais no Firestore (banco 'happy')
    const db = getFirestore(admin.app(), 'happy');
    const userDocRef = db.collection('users').doc(uid);

    const userProfileData = {
      email,
      fullName,
      phone,
      cpfCnpj,
      address,
      addressNumber,
      complement,
      province,
      postalCode,
      profileComplete: true,
      updatedAt: new Date().toISOString(),
    };

    await userDocRef.set(userProfileData, { merge: true });

    // 4. Criar o cliente no Asaas
    let asaasCustomerId = null;
    try {
      const asaasPayload = {
        name: fullName,
        email,
        mobilePhone: phone,
        cpfCnpj,
        address,
        addressNumber,
        complement,
        province,
        postalCode,
      };

      const asaasResponse = await fetch(`${process.env.ASAAS_API_URL}/customers`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'access_token': process.env.ASAAS_API_KEY || '',
        },
        body: JSON.stringify(asaasPayload),
      });

      if (asaasResponse.ok) {
        const asaasData = await asaasResponse.json();
        asaasCustomerId = asaasData.id;
      } else {
        // Se a criação no Asaas falhar, loga o erro mas não impede o fluxo
        const errorData = await asaasResponse.json();
        console.error('Erro ao criar cliente no Asaas:', errorData);
      }
    } catch (asaasError) {
      console.error('Exceção ao chamar a API do Asaas:', asaasError);
    }

    // 5. Se o cliente Asaas foi criado, salva o ID no Firebase
    if (asaasCustomerId) {
      await userDocRef.update({ asaasCustomerId });
    }

    return NextResponse.json({ message: 'Perfil atualizado com sucesso!', asaasCustomerId });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ error: 'Ocorreu um erro interno ao atualizar o perfil.' }, { status: 500 });
  }
}
