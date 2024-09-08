/*
  Access
  0 - Público: Todos usuários com o link tem acesso a sala.
  1 - Privado: Somente usuários com o link e com o EMAIL adicionando pelo admin tem acesso a sala;
*/

import { clearCookies, deleteCookie, getCookie, setCookie } from "./cookies";
import firebase from 'firebase/compat/app';
import { firestore, auth } from "./login/login";
import { v4 as uuidv4 } from 'uuid';
import { notifyError } from "../toastifyServer";

// Dados
const uidCookie = getCookie('uid') || '';
const nickCookie = getCookie('nick') || '';
const nomeCookie = getCookie('nome') || '';
const emailCookie = getCookie('email') || '';
const photoCookie = getCookie('photo') || '';

// Funções
const getWorkspaces = async (uid) => {
  var list = [];
  var users = [];
  try {
    const workspaceDoc = await firestore.collection('private-users')
      .doc(uid).collection('workspaces').get();

      if (!workspaceDoc.empty) {
        await Promise.all( workspaceDoc.docs.map(async (doc) => {
          const data = doc.data();
      
          if (data.users && data.users.length > 0) {
            data.users = await Promise.all(data.users.map(async (obj, i) => {
              if (i !== 0) {
                Object.keys(obj).forEach((key, j) => {
                  const keyPrimary = String(data.users[0][j])
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
          
          list.push({ ...data, uid: doc.id });
        }));
      }
      

    return list;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const createWorkspace = async (dados) => {
    const { status, nome, descricao, uid } = dados;
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    var uuid = uuidv4();
    console.log(dados)
    try {
        const workspacesRef = await firestore.collection('private-users')
        .doc(uid).collection('workspaces').get();
        if (workspacesRef.size >= 3) {
          notifyError('Você já possui o limíte de Workspaces, atualize seu plano para mais funcionalidades!');
          return false;
        }
        const workspaceDoc = await firestore.collection('private-users')
        .doc(uid).collection('workspaces').doc(uuid).set({
            nome,
            descricao,
            status,
            data: dataAtual,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            users: [
              {
                0: "Foto",
                1: "Nick",
                2: "Email",
                3: "Cargo",
                4: "",
              },
              {
                0: `<img src="${photoCookie}" />`,
                1: nickCookie,
                2: emailCookie,
                3: 1,
              }
            ],
        });
        return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };


export { getWorkspaces, createWorkspace };