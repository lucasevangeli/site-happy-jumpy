// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import admin from '@/lib/firebase-admin';

// Função para obter dados do usuário, incluindo o asaasCustomerId
async function getUserData(uid: string) {
  const db = admin.database();
  const userRef = db.ref(`users/${uid}`);
  const snapshot = await userRef.once('value');
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.val();
}

export async function POST(request: Request) {
  // 1. Autenticar o usuário
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
  const { uid } = decodedToken;

  try {
    // 2. Obter dados da requisição e do usuário do nosso DB
    const body = await request.json();
    const { paymentMethod, totalValue, creditCard } = body;

    const userData = await getUserData(uid);
    if (!userData || !userData.asaasCustomerId) {
      return NextResponse.json({ error: 'Perfil de usuário ou ID de cliente Asaas não encontrado.' }, { status: 404 });
    }
    const { asaasCustomerId } = userData;

    if (!paymentMethod || !totalValue) {
      return NextResponse.json({ error: 'Método de pagamento e valor total são obrigatórios.' }, { status: 400 });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    const year = dueDate.getFullYear();
    const month = String(dueDate.getMonth() + 1).padStart(2, '0');
    const day = String(dueDate.getDate()).padStart(2, '0');
    const formattedDueDate = `${year}-${month}-${day}`;

    // 4. Lógica para criar a cobrança no Asaas
    switch (paymentMethod) {
      case 'PIX': {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1); // Vencimento em 1 dia
        const year = dueDate.getFullYear();
        const month = String(dueDate.getMonth() + 1).padStart(2, '0');
        const day = String(dueDate.getDate()).padStart(2, '0');
        const formattedDueDate = `${year}-${month}-${day}`;

        const paymentPayload = {
          customer: asaasCustomerId,
          billingType: 'PIX',
          value: totalValue,
          dueDate: formattedDueDate,
          description: `Pedido de ${userData.fullName}`,
        };

        // ETAPA 1: Criar a cobrança
        const createPaymentResponse = await fetch(`${process.env.ASAAS_API_URL}/payments`, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'access_token': process.env.ASAAS_API_KEY || '',
          },
          body: JSON.stringify(paymentPayload),
        });

        if (!createPaymentResponse.ok) {
          const errorData = await createPaymentResponse.json();
          console.error('Erro ao criar cobrança PIX no Asaas (Etapa 1):', errorData);
          return NextResponse.json({ error: 'Falha ao gerar cobrança PIX.', details: errorData }, { status: 500 });
        }

        const paymentData = await createPaymentResponse.json();
        console.log("DEBUG: Resposta da criação do pagamento:", paymentData); // Log para depuração

        if (!paymentData.id) {
          return NextResponse.json({ error: 'ID do pagamento não retornado pelo Asaas.' }, { status: 500 });
        }

        // ETAPA 2: Buscar o QR Code usando o ID do pagamento
        const getQrCodeResponse = await fetch(`${process.env.ASAAS_API_URL}/payments/${paymentData.id}/pixQrCode`, {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'access_token': process.env.ASAAS_API_KEY || '',
            },
        });

        if (!getQrCodeResponse.ok) {
            const errorData = await getQrCodeResponse.json();
            console.error('Erro ao buscar QR Code PIX no Asaas (Etapa 2):', errorData);
            return NextResponse.json({ error: 'Falha ao obter QR Code do PIX.', details: errorData }, { status: 500 });
        }

        const qrCodeData = await getQrCodeResponse.json();
        
        const pixData = {
          qrCode: qrCodeData.encodedImage,
          payload: qrCodeData.payload,
          expirationDate: paymentData.dueDate,
        };

        return NextResponse.json(pixData);
      }
        
      case 'CREDIT_CARD': {
        if (!creditCard) {
          return NextResponse.json({ error: 'Dados do cartão de crédito são obrigatórios.' }, { status: 400 });
        }

        const paymentPayload = {
            customer: asaasCustomerId,
            billingType: 'CREDIT_CARD',
            dueDate: formattedDueDate,
            value: totalValue,
            description: `Pedido de ${userData.fullName}`,
            creditCard: {
                holderName: creditCard.holderName,
                number: creditCard.number,
                expiryMonth: creditCard.expiryMonth,
                expiryYear: creditCard.expiryYear,
                ccv: creditCard.ccv,
            },
            creditCardHolderInfo: {
                name: userData.fullName,
                email: userData.email,
                cpfCnpj: userData.cpfCnpj,
                postalCode: userData.postalCode,
                addressNumber: userData.addressNumber,
                phone: userData.phone,
            },
        };

        const asaasResponse = await fetch(`${process.env.ASAAS_API_URL}/payments`, {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'content-type': 'application/json',
              'access_token': process.env.ASAAS_API_KEY || '',
            },
            body: JSON.stringify(paymentPayload),
        });

        if (!asaasResponse.ok) {
            const errorData = await asaasResponse.json();
            console.error('Erro ao criar cobrança com Cartão de Crédito no Asaas:', errorData);
            return NextResponse.json({ error: 'Falha ao processar pagamento com cartão.', details: errorData }, { status: 500 });
        }
        
        const paymentData = await asaasResponse.json();
        return NextResponse.json(paymentData);
      }
        
      default:
        return NextResponse.json({ error: 'Método de pagamento não suportado.' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Erro no checkout:', error);
    return NextResponse.json({ error: 'Ocorreu um erro interno durante o checkout.' }, { status: 500 });
  }
}
