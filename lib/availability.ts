import { db } from './firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

export interface Slot {
  start: Date;
  end: Date;
  occupancy: number;
  capacity: number;
}

export async function getGlobalSettings() {
  const settingsRef = doc(db, 'settings', 'global');
  const snapshot = await getDoc(settingsRef);
  if (snapshot.exists()) {
    return snapshot.data();
  }
  return null;
}

export async function generateAvailableSlots(product: any, selectedDate: Date) {
  const settings = await getGlobalSettings();
  if (!settings || !settings.openingTime || !settings.closingTime) return [];

  // Em site-happy-jumpy, a duração vem como string "60 min" ou similar na UI, 
  // mas o objeto do Firestore tem o duration_minutes.
  // Vamos tentar pegar o duration_minutes do objeto se existir, senão parsear da string.
  let duration = product.duration_minutes;
  if (!duration && product.duration) {
    duration = parseInt(product.duration.replace(/\D/g, ''));
  }
  
  if (!duration) duration = 60; // fallback

  const [openH, openM] = settings.openingTime.split(':').map(Number);
  const [closeH, closeM] = settings.closingTime.split(':').map(Number);

  const startOfSelectedDay = new Date(selectedDate);
  startOfSelectedDay.setHours(openH, openM, 0, 0);

  let endOfSelectedDay = new Date(selectedDate);
  endOfSelectedDay.setHours(closeH, closeM, 0, 0);

  if (endOfSelectedDay < startOfSelectedDay) {
    endOfSelectedDay.setDate(endOfSelectedDay.getDate() + 1);
  }

  // Buscar ocupações
  const activeWbRef = collection(db, 'active_wristbands');
  const activeWbSnapshot = await getDocs(activeWbRef);
  const activeWbList = activeWbSnapshot.docs.map(doc => doc.data());

  const sessionConfig = (settings.sessionConfigs || []).find((c: any) => c.duration === duration);
  const capacity = sessionConfig?.capacity || settings.maxCapacity || 50;

  const slots: Slot[] = [];
  let current = new Date(startOfSelectedDay);

  const now = new Date();

  while (current < endOfSelectedDay) {
    const slotEnd = new Date(current.getTime() + duration * 60000);
    
    const occupancy = activeWbList.filter(wb => 
      wb.wristband_id === product.id && 
      wb.end_time > current.toISOString() &&
      wb.start_time < slotEnd.toISOString()
    ).length;

    slots.push({
      start: new Date(current),
      end: slotEnd,
      occupancy,
      capacity
    });

    current = new Date(slotEnd);
  }

  return slots;
}
