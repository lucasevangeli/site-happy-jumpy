import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import admin from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Esta é a sua chave secreta para verificar a autenticidade do webhook
// IMPORTANTE: O nome da variável deve ser ASAAS_WEBHOOK_TOKEN no seu .env.local
const ASAAS_WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN;

export async function POST(request: Request) {
  // 1. Verificar o token de segurança do webhook
  const headersList = headers();
  const asaasToken = headersList.get('Asaas-Access-Token');

  if (asaasToken !== ASAAS_WEBHOOK_TOKEN) {
    console.warn('Recebida tentativa de webhook com token inválido:', asaasToken);
    return NextResponse.json({ error: 'Token de webhook inválido.' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // 2. Verificar se é um evento de pagamento e se temos os dados necessários
    if (body.event && (body.event === 'PAYMENT_CONFIRMED' || body.event === 'PAYMENT_RECEIVED') && body.payment) {
      const { id: asaasPaymentId, status: asaasStatus } = body.payment;

      console.log(`Recebido webhook para pagamento Asaas ID: ${asaasPaymentId} com status: ${asaasStatus}`);

      // 3. Encontrar o pagamento correspondente no Firebase Firestore
      const firestore = getFirestore(admin.app(), 'happy');
      const paymentsRef = firestore.collection('payments');

      const snapshot = await paymentsRef.where('asaasPaymentId', '==', asaasPaymentId).limit(1).get();

      if (snapshot.empty) {
        console.warn(`Webhook recebido para asaasPaymentId ${asaasPaymentId}, mas não foi encontrado no Firebase.`);
        return NextResponse.json({ message: 'Pagamento não encontrado, mas webhook recebido.' });
      }

      // 4. Atualizar o status do pagamento no Firebase
      const paymentDoc = snapshot.docs[0];
      const firebasePaymentId = paymentDoc.id;

      await paymentDoc.ref.update({
        status: 'CONFIRMED',
        asaasStatus: asaasStatus,
        updatedAt: new Date().toISOString(),
      });

      console.log(`Pagamento ${firebasePaymentId} (Asaas: ${asaasPaymentId}) atualizado para CONFIRMED.`);

      // 5. Criar venda e ingressos no Firestore
      const paymentData = paymentDoc.data();
      const { userId, cart } = paymentData;

      if (!userId || !cart || !Array.isArray(cart) || cart.length === 0) {
        console.error(`Dados insuficientes (userId ou cart) no pagamento ${firebasePaymentId} para gerar ingressos.`);
      } else {
        // Buscar dados do usuário para ter o nome na venda
        const userSnapshot = await firestore.collection('users').doc(userId).get();
        const userData = userSnapshot.data() || {};

        // 6. Criar um registro central de venda
        const saleRef = firestore.collection('sales').doc();
        const saleId = saleRef.id;

        const totalAmount = paymentData.totalValue || 0;
        const paymentMethod = paymentData.paymentMethod || 'ASAAS';

        await saleRef.set({
          id: saleId,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          created_at: new Date().toISOString(),
          created_by: 'Site',
          customer_id: userId,
          customer_name: userData.fullName || 'Cliente Web',
          items: cart.map(item => ({
            item_id: item.id,
            title: item.name || 'Produto',
            quantity: item.quantity || 1,
            unit_price: item.price || 0,
            type: 'product'
          }))
        });

        const ticketsRef = firestore.collection('tickets');
        const createdAt = new Date();
        const expiresAt = new Date(createdAt);
        expiresAt.setDate(expiresAt.getDate() + 1);

        const generateTicketCode = (prefix: string) => {
          const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
          return `${prefix.substring(0, 4).toUpperCase()}-${randomPart}`;
        };

        // Itera sobre cada item do carrinho para criar os ingressos
        for (const item of cart) {
          const quantity = item.quantity || 1;
          const itemName = item.name || 'Ingresso';
          const itemDescription = item.description || `Acesso ao evento ${itemName}`;

          for (let i = 0; i < quantity; i++) {
            const newTicketRef = ticketsRef.doc();
            const ticketCode = generateTicketCode(item.id || 'TKT');

            await newTicketRef.set({
              id: newTicketRef.id,
              orderId: saleId,
              userId: userId,
              productId: item.id,
              eventId: item.id,
              itemName: itemName,
              itemDescription: itemDescription,
              code: ticketCode,
              qrCode: '',
              validated: false,
              createdAt: createdAt.toISOString(),
              validatedAt: null,
              expiresAt: expiresAt.toISOString(),
            });

            console.log(`Ingresso ${newTicketRef.id} (item: ${itemName}, ${i + 1}/${quantity}) criado para o usuário ${userId} com código ${ticketCode}.`);
          }
        }
      }
    } else {
      console.log('Webhook recebido, mas não é um evento de confirmação de pagamento:', body.event);
    }

    return NextResponse.json({ message: 'Webhook recebido com sucesso.' });

  } catch (error: any) {
    console.error('Erro ao processar webhook do Asaas:', error);
    return NextResponse.json({ error: 'Erro interno no processamento do webhook.' }, { status: 500 });
  }
}
