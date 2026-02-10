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
