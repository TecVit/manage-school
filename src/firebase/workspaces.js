/*
  Access
  0 - Público: Todos usuários com o link tem acesso a sala.
  1 - Privado: Somente usuários com o link e com o EMAIL adicionando pelo admin tem acesso a sala;
*/

import { clearCookies, deleteCookie, getCookie, setCookie } from "./cookies";
import firebase from 'firebase/compat/app';
import { firestore, auth } from "./login/login";
import { v4 as uuidv4 } from 'uuid';

// Dados
const uidCookie = getCookie('uid') || '';
const nomeCookie = getCookie('nome') || '';
const emailCookie = getCookie('email') || '';

// Funções
const getWorkspaces = async (uid) => {
  var list = [];
  try {
    const workspaceDoc = await firestore.collection('private-users')
      .doc(uid).collection('workspaces').get();

    if (!workspaceDoc.empty) {
        workspaceDoc.docs.map((doc, index) => {
            const data = doc.data();
            data.uid = doc.id;
            list.push(data);
        });
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
    try {
        const workspaceDoc = await firestore.collection('private-users')
        .doc(uid).collection('workspaces').doc(uuid).set({
            nome,
            descricao,
            status,
            data: dataAtual,
            date: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };


export { getWorkspaces, createWorkspace };