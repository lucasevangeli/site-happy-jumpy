// app/api/user/profile/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import admin from '@/lib/firebase-admin';

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
      birthDate,
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

    // 3. Salvar os dados iniciais no Firebase Realtime Database
    const db = admin.database();
    const userRef = db.ref(`users/${uid}`);
    const userProfileData = {
      email,
      fullName,
      phone,
      birthDate,
      cpfCnpj,
      address,
      addressNumber,
      complement,
      province,
      postalCode,
      profileComplete: true,
      updatedAt: new Date().toISOString(),
    };
    
    await userRef.update(userProfileData);

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

      // console.log("DEBUG: Asaas API URL:", process.env.ASAAS_API_URL);
      // console.log("!!! DEBUG - FULL KEY (REMOVE AFTER) !!! ASAAS API Key:", process.env.ASAAS_API_KEY);

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
      await userRef.update({ asaasCustomerId });
    }

    return NextResponse.json({ message: 'Perfil atualizado com sucesso!', asaasCustomerId });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ error: 'Ocorreu um erro interno ao atualizar o perfil.' }, { status: 500 });
  }
}
