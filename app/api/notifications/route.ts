import { NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tokens, title, body: message, data, imageUrl } = body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return NextResponse.json({ error: 'Nenhum token fornecido.' }, { status: 400 });
    }

    console.log(`[API Notifications] Enviando push com imagem para ${tokens.length} dispositivos...`);

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokens.map(token => ({
        to: token,
        title: title,
        body: message,
        data: data || { type: 'admin_notification' },
        sound: 'default',
        priority: 'high',
        attachments: imageUrl ? [{ url: imageUrl }] : [], // Para iOS
        android: {
          channelId: 'high_priority',
          priority: 'high',
          image: imageUrl, // Imagem grande (expandível)
          largeIcon: imageUrl // Ícone lateral
        },
      }))),
    });

    const result = await response.json();
    console.log('[API Notifications] Resposta completa da Expo:', JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error('[API Notifications] Erro na Expo:', result);
      return NextResponse.json({ error: 'Erro ao enviar via Expo', details: result }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, result },
      { 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );

  } catch (error: any) {
    console.error('[API Notifications] Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno ao processar notificações' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
