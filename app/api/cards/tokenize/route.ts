import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import admin from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

async function getUserData(uid: string) {
    const firestore = getFirestore(admin.app(), 'happy');
    const userDoc = await firestore.collection('users').doc(uid).get();
    if (!userDoc.exists) {
        return null;
    }
    return userDoc.data();
}

export async function POST(request: Request) {
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
        const body = await request.json();
        const { creditCard } = body;

        if (!creditCard) {
            return NextResponse.json({ error: 'Dados do cartão são obrigatórios.' }, { status: 400 });
        }

        const userData = await getUserData(uid);
        if (!userData || !userData.asaasCustomerId) {
            return NextResponse.json({ error: 'Perfil de usuário ou ID de cliente Asaas não encontrado.' }, { status: 404 });
        }

        const { asaasCustomerId } = userData;

        // Lógica para tokenizar o cartão no Asaas
        const tokenizationPayload = {
            customer: asaasCustomerId,
            creditCard: {
                holderName: creditCard.holderName,
                number: creditCard.number,
                expiryMonth: creditCard.expiryMonth,
                expiryYear: creditCard.expiryYear,
                ccv: creditCard.ccv,
            },
            creditCardHolderInfo: {
                name: userData.fullName || creditCard.holderName,
                email: userData.email,
                cpfCnpj: userData.cpfCnpj,
                postalCode: userData.postalCode,
                addressNumber: userData.addressNumber,
                phone: userData.phone,
            },
        };

        const asaasResponse = await fetch(`${process.env.ASAAS_API_URL}/creditCard/tokenize`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'access_token': process.env.ASAAS_API_KEY || '',
            },
            body: JSON.stringify(tokenizationPayload),
        });

        if (!asaasResponse.ok) {
            const errorData = await asaasResponse.json();
            console.error('Erro ao tokenizar cartão no Asaas:', errorData);
            return NextResponse.json({ error: 'Falha ao tokenizar cartão.', details: errorData }, { status: 500 });
        }

        const tokenData = await asaasResponse.json();

        // Salvar o token no Firebase para o usuário (Firestore banco padrão)
        const firestore = getFirestore(admin.app(), 'happy');
        const userCardsRef = firestore.collection(`users/${uid}/cards`);
        const newCardRef = userCardsRef.doc();

        const cardToSave = {
            id: newCardRef.id,
            creditCardToken: tokenData.creditCardToken,
            lastFourDigits: tokenData.creditCardNumber.slice(-4),
            brand: tokenData.creditCardBrand,
            createdAt: new Date().toISOString(),
        };

        await newCardRef.set(cardToSave);

        return NextResponse.json({ success: true, card: cardToSave });

    } catch (error: any) {
        console.error('Erro na tokenização:', error);
        return NextResponse.json({ error: 'Ocorreu um erro interno durante a tokenização.' }, { status: 500 });
    }
}
