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
      const db = getFirestore(admin.app(), 'happy');
    const firestore = db;
      const paymentsRef = firestore.collection('payments');

      const snapshot = await paymentsRef.where('asaasPaymentId', '==', asaasPaymentId).limit(1).get();

      if (snapshot.empty) {
        console.log(`ERRO: Webhook recebido para asaasPaymentId ${asaasPaymentId}, mas não foi encontrado no Firebase.`);
        return NextResponse.json({ message: 'Pagamento não encontrado, mas webhook recebido.' });
      }

      console.log(`Pagamento encontrado! Firebase ID: ${snapshot.docs[0].id}`);

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
        console.log(`ERRO: Dados insuficientes (userId ou cart) no pagamento ${firebasePaymentId} para gerar ingressos.`);
        console.error(`Dados insuficientes (userId ou cart) no pagamento ${firebasePaymentId} para gerar ingressos.`);
      } else {
        console.log(`Dados extraídos: User: ${userId} | Itens no carrinho: ${cart.length}`);
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
            type: item.type || 'product'
          }))
        });

        const ticketsRef = firestore.collection('tickets');
        const createdAt = new Date();
        const expiresAt = new Date(createdAt);
        expiresAt.setDate(expiresAt.getDate() + 1);

        const generateTicketCode = () => {
          const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          const numbers = '0123456789';
          let result = '';
          for (let i = 0; i < 3; i++) {
            result += letters.charAt(Math.floor(Math.random() * letters.length));
          }
          for (let i = 0; i < 3; i++) {
            result += numbers.charAt(Math.floor(Math.random() * numbers.length));
          }
          return result;
        };

        // Itera sobre cada item do carrinho para criar os ingressos e identificar itens de cozinha
        const foodItemsForKitchen = [];

        for (const item of cart) {
          const quantity = item.quantity || 1;
          const itemName = item.name || 'Ingresso';
          const itemType = item.type || 'undefined';
          const itemDescription = item.description || `Acesso ao evento ${itemName}`;


          // Identificar itens de cardápio (Incluindo o tipo 'menu' que foi identificado no teste)
          // EXCEÇÃO: Se for 'wristband' ou 'ticket', NÃO vai para a cozinha.
          const isKitchenItem = 
            item.type === 'product' || 
            item.type === 'food' || 
            item.type === 'pizza' || 
            item.type === 'combo' || 
            item.type === 'menu' ||
            item.type === 'lanche' ||
            (!item.type) ||
            (item.type !== 'wristband' && item.type !== 'ticket');
          
          if (isKitchenItem) {
            foodItemsForKitchen.push({
              product_id: item.id,
              product_title: item.name || item.title || 'Produto',
              quantity: item.quantity || 1,
              addons_selected: item.addons || [],
              customer_notes: item.notes || '',
            });
          }

          // SÓ criar ingressos se o item for 'wristband' ou 'ticket'
          if (item.type === 'wristband' || item.type === 'ticket') {
            for (let i = 0; i < quantity; i++) {
              const newTicketRef = ticketsRef.doc();
              const ticketCode = generateTicketCode();

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
                startTime: item.start_time || item.startTime || null,
                endTime: item.end_time || item.endTime || null,
                expiresAt: item.end_time || item.endTime || expiresAt.toISOString(),
              });

              console.log(`Ingresso ${newTicketRef.id} (item: ${itemName}, ${i + 1}/${quantity}) criado para o usuário ${userId} com código ${ticketCode}.`);
            }

            // --- LÓGICA DE PONTOS DE FIDELIDADE ---
            // Regra: 30 min = 0.5 ponto, 1h = 1 ponto, 2h = 2 pontos (duration_minutes / 60)
            const duration = item.duration_minutes || 0;
            if (duration > 0) {
              const pointsEarned = (duration / 60) * quantity;
              const loyaltyPointsRef = firestore.collection('loyalty_points');
              const now = new Date();
              const expiresAtPoints = new Date(now);
              expiresAtPoints.setDate(expiresAtPoints.getDate() + 90);

              await loyaltyPointsRef.add({
                userId: userId,
                orderId: saleId,
                points: pointsEarned,
                description: `Acúmulo de pontos - ${itemName}`,
                createdAt: now.toISOString(),
                expiresAt: expiresAtPoints.toISOString(),
              });
              
              console.log(`Concedidos ${pointsEarned} pontos para o usuário ${userId} pela compra de ${itemName}.`);
            }
          }
        }

        // 7. Criar pedido na cozinha se houver itens de cardápio
        if (foodItemsForKitchen.length > 0) {
          const orderCode = `P${Math.floor(Math.random() * 9000) + 1000}`;
          const kitchenOrdersRef = firestore.collection('kitchen_orders');
          
          await kitchenOrdersRef.add({
            sale_id: saleId,
            order_code: orderCode,
            status: 'pending',
            created_at: new Date().toISOString(),
            items: foodItemsForKitchen,
            customer_name: userData?.fullName || 'Cliente App',
            userId: userId
          });
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
