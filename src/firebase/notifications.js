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
const getNotifications = async (nick) => {
  var list = [];
  try {
    const notificationsDoc = await firestore.collection('public-users')
      .doc(nick).collection('notifications').get();

      if (!notificationsDoc.empty) {
        await Promise.all( notificationsDoc.docs.map(async (doc) => {
          const data = doc.data();
      
          list.push({ ...data, uid: doc.id });
        }));
      }

    return list;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const acceptInviteWorkspace = async (uidWorkspace) => {
  let workspaceData = null;
  try {
    const publicWorkspaceDoc = await firestore.collection('workspaces')
    .doc(uidWorkspace).get();

    if (publicWorkspaceDoc.exists) {
      const dataPublic = publicWorkspaceDoc.data();
      workspaceData = dataPublic;
    }

    const workspaceDoc = await firestore.collection('workspaces')
    .doc(uidWorkspace).get();

    if (workspaceDoc.exists) {
        const data = workspaceDoc.data();
        let usersList = data.users;

        let usersFilters = usersList.map(val => {
          if (val[1] === nickCookie && val[2] === emailCookie) {
            return { ...val, 4: "Aceito" };
          }
          return val;
        });

        // Public
        await firestore.collection('workspaces').doc(uidWorkspace).update({
          users: usersFilters,
        });
    }

    const privateWorkspaceDoc = await firestore.collection('private-users')
    .doc(uidCookie).collection('workspaces').doc(uidWorkspace).set(workspaceData);

    const userDocPublic = await firestore.collection('public-users')
    .doc(nickCookie).collection('notifications').doc(uidWorkspace).delete();

  } catch (error) {
    console.log(error);
    return false;
  }
};

const rejectInviteWorkspace = async (uidWorkspace) => {
  try {

    const workspaceDoc = await firestore.collection('workspaces')
    .doc(uidWorkspace).get();

    if (workspaceDoc.exists) {
        const data = workspaceDoc.data();
        let usersList = data.users;

        let usersFilters = usersList.map(val => {
          if (val[1] === nickCookie && val[2] === emailCookie) {
            return { ...val, 4: "Rejeitado" };
          }
          return val;
        });

        // Public
        await firestore.collection('workspaces').doc(uidWorkspace).update({
          users: usersFilters,
        });
    }

    const userDocPublic = await firestore.collection('public-users')
    .doc(nickCookie).collection('notifications').doc(uidWorkspace).delete();

  } catch (error) {
    console.log(error);
    return false;
  }
};

export { getNotifications, acceptInviteWorkspace, rejectInviteWorkspace };