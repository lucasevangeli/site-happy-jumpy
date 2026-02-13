import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import admin from '@/lib/firebase-admin';

// Esta é a sua chave secreta para verificar a autenticidade do webhook
// IMPORTANTE: O nome da variável deve ser ASAAS_WEBHOOK_TOKEN no seu .env.local
const ASAAS_WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN;

export async function POST(request: Request) {
  // 1. Verificar o token de segurança do webhook
  const headersList = headers();
  // O cabeçalho correto enviado pelo Asaas é 'Asaas-Access-Token'
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

      // 3. Encontrar o pagamento correspondente no Firebase
      const db = admin.database();
      const paymentsRef = db.ref('payments');
      
      const snapshot = await paymentsRef.orderByChild('asaasPaymentId').equalTo(asaasPaymentId).once('value');

      if (!snapshot.exists()) {
        console.warn(`Webhook recebido para asaasPaymentId ${asaasPaymentId}, mas não foi encontrado no Firebase.`);
        // Retorna 200 para o Asaas não continuar tentando enviar um webhook para um pagamento que não nos interessa
        return NextResponse.json({ message: 'Pagamento não encontrado, mas webhook recebido.' });
      }

      // 4. Atualizar o status do pagamento no Firebase
      // O snapshot contém um objeto onde as chaves são os IDs únicos do Firebase
      const firebasePaymentId = Object.keys(snapshot.val())[0];
      const paymentToUpdateRef = db.ref(`payments/${firebasePaymentId}`);

      await paymentToUpdateRef.update({
        status: 'CONFIRMED',
        asaasStatus: asaasStatus, // Opcional: guardar o status exato do Asaas
        updatedAt: new Date().toISOString(),
      });

      console.log(`Pagamento ${firebasePaymentId} (Asaas: ${asaasPaymentId}) atualizado para CONFIRMED.`);

      // 5. Criar ingressos no Firebase Realtime Database para cada item no carrinho
      const paymentData = snapshot.val()[firebasePaymentId];
      const { userId, cart } = paymentData;

      if (!userId || !cart || !Array.isArray(cart) || cart.length === 0) {
        console.error(`Dados insuficientes (userId ou cart) no pagamento ${firebasePaymentId} para gerar ingressos.`);
      } else {
        const ticketsRef = db.ref('tickets');
        const createdAt = new Date();
        const expiresAt = new Date(createdAt);
        expiresAt.setDate(expiresAt.getDate() + 1); // Adiciona 1 dia para a expiração

        const generateTicketCode = (prefix: string) => {
          const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
          return `${prefix.substring(0, 4).toUpperCase()}-${randomPart}`;
        };

        // Itera sobre cada item do carrinho para criar os ingressos
        for (const item of cart) {
          const quantity = item.quantity || 1; // Garante que a quantidade seja pelo menos 1
          const itemName = item.name || 'Ingresso';
          const itemDescription = item.description || `Acesso ao evento ${itemName}`;
          
          // Cria um ingresso para cada unidade do item
          for (let i = 0; i < quantity; i++) {
            const newTicketRef = ticketsRef.push(); // Gera uma chave única para o novo ingresso
            const ticketCode = generateTicketCode(item.id || 'TKT');
      
            await newTicketRef.set({
              orderId: firebasePaymentId,      // Referência ao nosso ID de pagamento interno
              userId: userId,
              productId: item.id,              // << O ID do produto que você pediu
              eventId: item.id,                // Mantido para compatibilidade
              itemName: itemName,
              itemDescription: itemDescription,
              code: ticketCode,
              qrCode: '',
              validated: false,
              createdAt: createdAt.toISOString(),
              validatedAt: null,
              expiresAt: expiresAt.toISOString(),
            });
      
            console.log(`Ingresso ${newTicketRef.key} (item: ${itemName}, ${i+1}/${quantity}) criado para o usuário ${userId} com código ${ticketCode}.`);
          }
        }
      }
    } else {
      console.log('Webhook recebido, mas não é um evento de confirmação de pagamento:', body.event);
    }

    // 5. Retornar uma resposta de sucesso para o Asaas
    return NextResponse.json({ message: 'Webhook recebido com sucesso.' });

  } catch (error: any) {
    console.error('Erro ao processar webhook do Asaas:', error);
    return NextResponse.json({ error: 'Erro interno no processamento do webhook.' }, { status: 500 });
  }
}
