import { notifyError } from "../toastifyServer";
import { clearCookies, deleteCookie, getCookie, setCookie } from "./cookies";
import { firestore, auth } from "./login/login";

// Dados
const uidCookie = getCookie('uid') || '';
const nickCookie = getCookie('nick') || '';
const emailCookie = getCookie('email') || '';

const positions = [
  'Administrador',
  'Moderador',
  'Editor',
  'Contribuidor',
  'Leitor',
  'Membro',
];

// Funções
const validateUserNick = async (nick) => {
  if (!nick) {
    notifyError('Houve um erro');
    return;
  }
  try {
    const userDoc = await firestore.collection('public-users')
      .doc(nick).get();

    if (userDoc.exists) {
        const data = userDoc.data();
        const email = data.email;

        return {
            email,
        };
        
    } else {
      return {
        code: 'nick-invalido'
      };
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

const addUserWorkspace = async (dados, uid, nick, email, cargo, limit) => {
  if (!uid || !uidCookie || !nick || !cargo || !dados) {
    notifyError('Houve um erro');
    setTimeout(() => {
      window.location.reload();
    }, 3750);
    return;
  }
  
  try {
    const workspaceDoc = await firestore.collection('workspaces').doc(uid).get();

    if (workspaceDoc.exists) {
        const data = workspaceDoc.data();
        let usersList = data.users;

        if (usersList.length >= limit + 1) {
          notifyError('Você já atingiu o limite de usuários nesse workspace');
          return false;
        }

        const validando = await Promise.all(usersList.map((val, index) => {
          if (val[1] === nick && val[2] === email) {
            return false;
          } else {
            return true;
          }
        }));

        if (!validando.every(value => value === true)) {
          notifyError('Usuário já está nesse workspace');
          return false;
        }
        
        // Public
        const userDoc = await firestore.collection('public-users')
        .doc(nick).get();

        if (userDoc.exists) {
          const dataUser = userDoc.data();
          let imgUser = null;
          if (dataUser.photo) {
            imgUser = dataUser.photo;
          }
          usersList.push({
            0: `<img src="${imgUser}" />`,
            1: nick,
            2: email,
            3: cargo,
            4: 'Pendente'
          });
        }

        const userDocPublic = await firestore.collection('public-users')
        .doc(nick).collection('notifications').doc(uid).set({
          titulo: `Convite para ingressar no workspace "${dados.nome}" enviado por "${nickCookie}"`,
          descricao: `Você recebeu um convite do usuário ${nickCookie} para integrar o workspace denominado "${dados.nome}"`,
          foto: dados.foto,
          tipo: 'workspace',
        });

        // Private
        /* await firestore.collection('private-users')
        .doc(uidCookie).collection('workspaces').doc(uid).update({
          users: usersList,
        }); */

        // Public
        await firestore.collection('workspaces').doc(uid).update({
          users: usersList,
        });
        

        if (usersList && usersList.length > 0) {
          usersList = await Promise.all(usersList.map(async (obj, i) => {
            if (i !== 0) {
              Object.keys(obj).forEach((key, j) => {
                const keyPrimary = String(usersList[0][j])
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase();
      
                if (keyPrimary.includes('cargo')) {
                  if (obj[key] === 1) {
                    obj[key] = 'Administrador';
                  } else if (obj[key] === 2) {
                    obj[key] = 'Moderador';
                  } else if (obj[key] === 3) {
                    obj[key] = 'Editor';
                  } else if (obj[key] === 4) {
                    obj[key] = 'Contribuidor';
                  } else if (obj[key] === 5) {
                    obj[key] = 'Leitor';
                  } else if (obj[key] === 6) {
                    obj[key] = 'Membro';
                  }
                }
              });
            }
            return obj;
          }));
        }

        return {
          users: usersList,
        };

    } else {
      return {
        code: 'nick-invalido'
      };
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

const deleteUserWorkspace = async (uid, nick, email) => {
  if (!uid || !nick) {
    notifyError('Houve um erro');
    return;
  }
  try {
    const userDocPublic = await firestore.collection('public-users')
    .doc(nick).collection('notifications').doc(uid).delete();

    const workspaceDoc = await firestore.collection('private-users')
      .doc(uidCookie).collection('workspaces').doc(uid).get();

    if (workspaceDoc.exists) {
        const data = workspaceDoc.data();
        let usersList = data.users;

        let usersFilters = usersList.filter(val => {
          return val[1] !== nick && val[2] !== email;
        });
        
        await firestore.collection('private-users')
        .doc(uidCookie).collection('workspaces').doc(uid).update({
          users: usersFilters,
        });

        await firestore.collection('workspaces').doc(uid).update({
          users: usersFilters,
        });

        if (usersFilters && usersFilters.length > 0) {
          usersFilters = await Promise.all(usersFilters.map(async (obj, i) => {
            if (i !== 0) {
              Object.keys(obj).forEach((key, j) => {
                const keyPrimary = String(usersFilters[0][j])
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase();
      
                if (keyPrimary.includes('cargo')) {
                  if (obj[key] === 1) {
                    obj[key] = 'Administrador';
                  } else if (obj[key] === 2) {
                    obj[key] = 'Moderador';
                  } else if (obj[key] === 3) {
                    obj[key] = 'Editor';
                  } else if (obj[key] === 4) {
                    obj[key] = 'Contribuidor';
                  } else if (obj[key] === 5) {
                    obj[key] = 'Leitor';
                  } else if (obj[key] === 6) {
                    obj[key] = 'Membro';
                  }
                }
              });
            }
            return obj;
          }));
        }
        
        return {
          users: usersFilters,
        };

    } else {
      return {
        code: 'nick-invalido'
      };
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};


export { validateUserNick, addUserWorkspace, deleteUserWorkspace };