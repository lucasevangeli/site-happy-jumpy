const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

const privateKey = `-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQCX8OEdkisLeEKQ\nIjFhpVp94qE/2ivPII1FEpL+lkamWG9Dr88QT21GxVKdctK+ymC6ZcYTOc4H0KiL\nA1yrjmnVT47jqmDE2wSv6etvrZhSTeasaZM8IWcbHBFqnqcd3v3+lYMSlfGCnQYO\n6zqRbDNSUvUCjxspWit4+pAOu+tksFUUl0OE2GtuFbMcNE8e8J6eVjuKEY21OarB\nAu6wXSy/NTJsFqGwDsqvjRPDLrao46sW0WdjnFPFuWEzvI9UaNjO86N+ennW8Tr/\nh/jDB/+2oBJNi/+hBaKJDZa0fMD6c26W16F0WNc4JDofTvst5ouiaOYp1EGpQr2d\nmrINyv+zAgMBAAECggEABST/ykuHr5S71DuEJoU9wiNpSEsvzoyQm/UcCwi1ja5S\n3hzWyvuVfJ7zxCb+Ib2ids05Xq9HXZZgDoznl1t0E+fks6qyKhgsWXR3J0nebXL7\ny3yroo6S+iUCJfUHPYiuWu9fB8MR8VU1vk2SpxfdyPzMFPEZf1XxQOBi/ky4lKki\naGxPCR5dVGNBGz8HwTQY05lxPtzB9CAPEBf5z4LBp2b8qVxiB39U9BUSVPkUAYOc\n/026cs2hvquRXczYn3A6szW9lN3A14ujCSiYejiwKjIVxp9XW+jU/SORRO+qldYQ\Lrbo4B5fUjF9ngl1IvcMjxTVKW2fBkqVPwSQZkBBEQKBgQDQCZDkDmSMs2QsYDqE\nmkyaSoMZVrhtcLVAgyqic1SAObo+rvWCVZr33cusU31VLMQLdNPproGqqcoKKePO\nldAYB2JY6Z+T6ZuxfACSGOpd5kC6uIGZLxkSIDH1cvN6QeUFrm9cUxeLqNnuq9eD\ZL2SOsDsGBG+Qk05m3KGN08OywKBgQC6+HvDjV1SWxobgBWYMOayGwhzf9YXDUE/\n4lqsg5K/4oH7baLdm5fhp2mtV/7LcGZma5GJLs6viOvCZyd//ZqyxPqHxYBeVghK\FdtuLzsBlQt5MBSrhWYsRi7+TJ5xlF8baBu2peYasbD+Uye6pmnADWTOFZeLX2Pc\nMfDct5sNuQJ/dQTse1udM4e00UFPqUchz6gaFiaxlt3PFnqxgK9e2MGgAaJoduew\Q7x+1HAiD8cef1M34DpItbbL7uuhOJMMenes2laPbKP679rQd12Md0UNI/qk64WS\nlJ+Heokua5alPIziFwymMejIrXf7wezotVhXLHZdhKfGyKCnytdRoQKBgQC0b0SR\nLYWYCs8hJvSwENExpKD9RatIR8RmcH1s6vTeNSuXhvCbyKJEZJm5bag4kFpiEQE8\nUG2qPQq4a3BVNlrqlunnyRPe9ku9o2ZF6VKabknKRDpOZMh7haeoRizKE5PNESVd\nmLB9pmnWpk069Yosi0BzGadMG1x1jcSSXKZIEQKBgBDHW5Sng0NWPsg4gaHoWchP\nZuw7WrB+4fMJHJDV0FHdVdphYgT3p25AOKjgfX829fe7geM3BXT/mJm5RiZfwWSD\nduISWyBeDsd5nRH+Qp3b/oIRcP+3PvPsbGpDPYiveB3Z7Z9rYyXux1zUkGJn+NRU\n/sQ3bZHMA2YdkVfE4UK7\n-----END PRIVATE KEY-----\n`.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "happy-jumpy",
      clientEmail: "firebase-adminsdk-fbsvc@happy-jumpy.iam.gserviceaccount.com",
      privateKey: privateKey,
    }),
    databaseURL: "https://happy-jumpy-default-rtdb.firebaseio.com",
  });
}

const db = getFirestore(admin.app(), 'happy');

async function debugTokens() {
  console.log('--- DIAGNÓSTICO DE TOKENS PUSH ---');
  const snapshot = await db.collection('users').get();
  
  if (snapshot.empty) {
    console.log('Nenhum usuário encontrado.');
    return;
  }

  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`\nUsuário: ${data.fullName || 'Sem Nome'} (${doc.id})`);
    console.log(`- Token Push: ${data.expoPushToken ? 'SIM (' + data.expoPushToken.substring(0, 20) + '...)' : 'NÃO (Vazio)'}`);
  });
}

debugTokens().catch(console.error);
