import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import admin from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Função para obter dados do usuário, incluindo o asaasCustomerId
async function getUserData(uid: string) {
  const firestore = getFirestore(admin.app(), 'happy');
  const userDoc = await firestore.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    return null;
  }
  return userDoc.data();
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
    const { asaasCustomerId } = userData || {};

    if (!paymentMethod || (paymentMethod !== 'POINTS' && !totalValue)) {
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
        if (!asaasCustomerId) {
          return NextResponse.json({ error: 'ID de cliente Asaas não encontrado.' }, { status: 404 });
        }
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
          description: `Pedido de ${userData?.fullName || 'Cliente'}`,
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
        console.log("DEBUG: Resposta da criação do pagamento:", paymentData);

        if (!paymentData.id) {
          return NextResponse.json({ error: 'ID do pagamento não retornado pelo Asaas.' }, { status: 500 });
        }

        // ETAPA 2: Salvar o estado inicial do pagamento no Firebase Firestore
        const firestore = getFirestore(admin.app(), 'happy');
        const paymentDocRef = firestore.collection('payments').doc();

        await paymentDocRef.set({
          id: paymentDocRef.id,
          asaasPaymentId: paymentData.id,
          userId: uid,
          status: 'PENDING',
          totalValue: totalValue,
          paymentMethod: 'PIX',
          createdAt: new Date().toISOString(),
          cart: body.cart,
        });

        const internalPaymentId = paymentDocRef.id;

        console.log("DEBUG: Buscando QR Code para pagamento ID:", paymentData.id);
        const getQrCodeResponse = await fetch(`${process.env.ASAAS_API_URL}/payments/${paymentData.id}/pixQrCode`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'access_token': process.env.ASAAS_API_KEY || '',
          },
        });
        
        const qrCodeData = await getQrCodeResponse.json();

        if (!getQrCodeResponse.ok) {
          console.error('Erro ao buscar QR Code PIX no Asaas (Etapa 3):', qrCodeData);
          // Atualiza o status no Firebase para falha
          await paymentDocRef.update({ status: 'FAILED_QR_CODE_FETCH', asaasError: qrCodeData });
          return NextResponse.json({ error: 'Falha ao obter QR Code do PIX.', details: qrCodeData }, { status: 500 });
        }

        const pixData = {
          qrCode: qrCodeData.encodedImage,
          payload: qrCodeData.payload,
          expirationDate: paymentData.dueDate,
          internalPaymentId: internalPaymentId, // Retorna nosso ID interno para o cliente
        };

        return NextResponse.json(pixData);
      }

      case 'CREDIT_CARD': {
        if (!asaasCustomerId) {
          return NextResponse.json({ error: 'ID de cliente Asaas não encontrado.' }, { status: 404 });
        }
        const { creditCard, creditCardToken } = body;

        if (!creditCard && !creditCardToken) {
          return NextResponse.json({ error: 'Dados do cartão ou token são obrigatórios.' }, { status: 400 });
        }

        const paymentPayload: any = {
          customer: asaasCustomerId,
          billingType: 'CREDIT_CARD',
          dueDate: formattedDueDate,
          value: totalValue,
          description: `Pedido de ${userData?.fullName || 'Cliente'}`,
        };

        if (creditCardToken) {
          paymentPayload.creditCardToken = creditCardToken;
        } else {
          paymentPayload.creditCard = {
            holderName: creditCard.holderName,
            number: creditCard.number,
            expiryMonth: creditCard.expiryMonth,
            expiryYear: creditCard.expiryYear,
            ccv: creditCard.ccv,
          };
          paymentPayload.creditCardHolderInfo = {
            name: userData?.fullName || '',
            email: userData?.email || '',
            cpfCnpj: userData?.cpfCnpj || '',
            postalCode: userData?.postalCode || '',
            addressNumber: userData?.addressNumber || '',
            phone: userData?.phone || '',
          };
        }

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

        // ETAPA 2: Salvar o estado inicial do pagamento no Firebase Firestore
        const firestore = getFirestore(admin.app(), 'happy');
        const paymentDocRef = firestore.collection('payments').doc();

        await paymentDocRef.set({
          id: paymentDocRef.id,
          asaasPaymentId: paymentData.id,
          userId: uid,
          status: 'PENDING',
          totalValue: totalValue,
          paymentMethod: 'CREDIT_CARD',
          createdAt: new Date().toISOString(),
          cart: body.cart,
        });

        return NextResponse.json(paymentData);
      }

      case 'POINTS': {
        const firestore = getFirestore(admin.app(), 'happy');
        
        // 1. Verificar saldo de pontos no servidor (SEGURANÇA)
        const loyaltyPointsRef = firestore.collection('loyalty_points');
        const pointsSnapshot = await loyaltyPointsRef.where('userId', '==', uid).get();
        let currentBalance = 0;
        pointsSnapshot.forEach(doc => {
          currentBalance += doc.data().points || 0;
        });

        // 2. Calcular custo (5 pontos por ingresso)
        const cartItems = body.cart || [];
        const ticketsInCart = cartItems.filter((item: any) => item.type === 'ticket' || item.type === 'wristband');
        
        if (ticketsInCart.length !== cartItems.length) {
          return NextResponse.json({ error: 'Pagamento com pontos disponível apenas para ingressos.' }, { status: 400 });
        }

        const totalTickets = ticketsInCart.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const costInPoints = totalTickets * 5;

        if (currentBalance < costInPoints) {
          return NextResponse.json({ error: `Saldo insuficiente. Você tem ${currentBalance} pontos e precisa de ${costInPoints}.` }, { status: 400 });
        }

        // 3. Processar resgate (Entrada negativa nos pontos)
        await loyaltyPointsRef.add({
          userId: uid,
          points: -costInPoints,
          description: `Resgate de pontos - ${totalTickets} ingresso(s)`,
          createdAt: new Date().toISOString(),
          type: 'REDEMPTION'
        });

        // 4. Criar registro de venda e pagamento CONFIRMADO
        const saleRef = firestore.collection('sales').doc();
        const saleId = saleRef.id;

        await saleRef.set({
          id: saleId,
          total_amount: 0,
          payment_method: 'POINTS',
          created_at: new Date().toISOString(),
          created_by: 'App (Pontos)',
          customer_id: uid,
          customer_name: userData?.fullName || 'Cliente App',
          items: cartItems.map((item: any) => ({
            item_id: item.id,
            title: item.name || 'Produto',
            quantity: item.quantity || 1,
            unit_price: 0,
            type: item.type || 'product',
            image_url: item.image_url || null,
            description: item.description || null
          }))
        });

        const paymentDocRef = firestore.collection('payments').doc();
        await paymentDocRef.set({
          id: paymentDocRef.id,
          userId: uid,
          status: 'CONFIRMED',
          totalValue: 0,
          paymentMethod: 'POINTS',
          createdAt: new Date().toISOString(),
          cart: cartItems,
          saleId: saleId
        });

        // 5. Gerar Ingressos (Cópia da lógica do webhook)
        const ticketsRef = firestore.collection('tickets');
        const createdAt = new Date();
        const expiresAtDate = new Date(createdAt);
        expiresAtDate.setDate(expiresAtDate.getDate() + 1);

        const generateTicketCode = () => {
          const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          const numbers = '0123456789';
          let result = '';
          for (let i = 0; i < 3; i++) result += letters.charAt(Math.floor(Math.random() * letters.length));
          for (let i = 0; i < 3; i++) result += numbers.charAt(Math.floor(Math.random() * numbers.length));
          return result;
        };

        for (const item of cartItems) {
          for (let i = 0; i < (item.quantity || 1); i++) {
            const ticketCode = generateTicketCode();
            const newTicketRef = ticketsRef.doc();
            await newTicketRef.set({
              id: newTicketRef.id,
              orderId: saleId,
              userId: uid,
              productId: String(item.id),
              eventId: String(item.id),
              itemName: item.name,
              itemDescription: item.description || '',
              code: ticketCode,
              qrCode: '',
              validated: false,
              validatedAt: null,
              createdAt: createdAt.toISOString(),
              startTime: item.start_time || null,
              endTime: item.end_time || null,
              expiresAt: item.end_time || expiresAtDate.toISOString(),
            });
          }
        }

        // 6. Notificações
        const notificationTitle = 'Resgate de Pontos Sucesso! ⭐️';
        const notificationBody = `Você resgatou ${costInPoints} pontos por ${totalTickets} ingresso(s). Bom divertimento!`;
        
        await firestore.collection('notifications').add({
          userId: uid,
          title: notificationTitle,
          description: notificationBody,
          type: 'points',
          createdAt: new Date().toISOString(),
          read: false,
          metadata: { saleId }
        });

        // Push Notification (se disponível)
        if (userData?.expoPushToken) {
          try {
            await fetch('https://exp.host/--/api/v2/push/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: userData.expoPushToken,
                title: notificationTitle,
                body: notificationBody,
                data: { type: 'points' }
              })
            });
          } catch (e) {
            console.error('Erro ao enviar push no resgate:', e);
          }
        }

        return NextResponse.json({ success: true, message: 'Resgate realizado com sucesso!', saleId });
      }

      default:
        return NextResponse.json({ error: 'Método de pagamento não suportado.' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Erro no checkout:', error);
    return NextResponse.json({ error: 'Ocorreu um erro interno durante o checkout.' }, { status: 500 });
  }
}
