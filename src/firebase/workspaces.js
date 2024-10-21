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
const uidCookie = getCookie('uid') || null;
const nickCookie = getCookie('nick') || null;
const emailCookie = getCookie('email') || null;
const photoCookie = getCookie('photo') || null;

const reloadCookies = async () => {
  if (!uidCookie) {
    return;
  }
  try {
    const userDoc = await firestore.collection('private-users')
    .doc(uidCookie).get();
    if (userDoc.exists) {
      const data = userDoc.data();
      setCookie('nick', data.nick);
      setCookie('email', data.email);
      return true;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

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

// Workspace Private
const getDataWorkspacePrivate = async (uid, id) => {
  try {
    const workspaceDoc = await firestore.collection('private-users')
    .doc(uid).collection('workspaces').doc(id).get();

    if (workspaceDoc.exists) {
      const data = workspaceDoc.data();
      return data;
    }
    
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};


const saveDataWorkspacePrivate = async (uid, id, dados) => {
  try {
    await firestore.collection('private-users')
    .doc(uid)
    .collection('workspaces')
    .doc(id)
    .update({ dados: dados });
      
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// Workspace Public
const getDataWorkspacePublic = async (id) => {
  try {
    const workspaceDoc = await firestore.collection('workspaces')
    .doc(id).get();

    if (workspaceDoc.exists) {
      const data = workspaceDoc.data();
      return data;
    }
    
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};


const saveDataWorkspacePublic = async (id, dados) => {
  try {
    await firestore.collection('workspaces')
    .doc(id).set({ dados: dados }, { merge: true });
      
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};


const upadteDataWorkspacePublic = async (uid, id) => {
  try {
    const workspaceDoc = await firestore.collection('workspaces')
    .doc(id).get();

    if (workspaceDoc.exists) {
      const data = workspaceDoc.data();

      await firestore.collection('private-users')
      .doc(uid).collection('workspaces')
      .doc(id).set(data, { merge: true });

      return {
        data: data,
        status: true,
      };
    }
      
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const createWorkspace = async (dados, limit) => {
    if (!nickCookie || !emailCookie || !uidCookie) {
      await reloadCookies();
      notifyError('Atualize a página e tente novamente');
      return;
    }
    const { status, nome, descricao, uid } = dados;
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    var uuid = uuidv4();
    
    try {
        const workspacesRef = await firestore.collection('private-users')
        .doc(uid).collection('workspaces').get();
        if (workspacesRef.size >= limit) {
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
            dados: {
              "Agenda de Reuniões": [
                  { "0": "Data", "1": "Hora", "2": "Participantes", "3": "Assunto", "4": "Status" },
                  { "0": "12/10/2024", "1": "10:00", "2": "Equipe de Marketing", "3": "Planejamento de Campanhas", "4": "Confirmada" },
                  { "0": "15/10/2024", "1": "14:00", "2": "Diretoria", "3": "Revisão de Orçamento", "4": "Agendada" }
              ], 
              "Atividades de Vendas 2024": [
                  { "0": "Cliente", "1": "Produto", "2": "Valor da Venda", "3": "Data da Venda", "4": "Status" },
                  { "0": "Cliente A", "1": "Serviço de Consultoria", "2": "$2,000", "3": "05/01/2024", "4": "Concluído" },
                  { "0": "Cliente B", "1": "Treinamento de Vendas", "2": "$1,500", "3": "10/02/2024", "4": "Pendente" }
              ],
              "Campanhas de Marketing 2024": [
                  { "0": "Campanha", "1": "Responsável", "2": "Data de Início", "3": "Data de Término", "4": "Status" },
                  { "0": "Promoção de Verão", "1": "Carlos Silva", "2": "01/12/2024", "3": "31/12/2024", "4": "Ativa" },
                  { "0": "Lançamento de Produto", "1": "Ana Costa", "2": "15/01/2024", "3": "15/02/2024", "4": "Planejada" }
              ],
              "Projetos de Desenvolvimento de Software": [
                  { "0": "Projeto", "1": "Responsável", "2": "Data de Início", "3": "Data de Término", "4": "Status" },
                  { "0": "App de Gestão Financeira", "1": "Fernanda Lima", "2": "01/03/2024", "3": "30/06/2024", "4": "Em Andamento" },
                  { "0": "Plataforma de E-commerce", "1": "Lucas Martins", "2": "15/01/2024", "3": "30/04/2024", "4": "Planejada" }
              ],
              "Relatórios Financeiros Q1 2024": [
                  { "0": "Descrição", "1": "Valor", "2": "Data", "3": "Categoria", "4": "Status" },
                  { "0": "Vendas Totais", "1": "$50,000", "2": "31/03/2024", "3": "Receita", "4": "Finalizado" },
                  { "0": "Despesas Operacionais", "1": "$20,000", "2": "31/03/2024", "3": "Custo", "4": "Pendente" }
              ],
            },
        });
        return true;
    } catch (error) {
      console.log(error);
      return false;
    }
};

const deleteWorkspace = async (dados) => {
  const { uid, uuid } = dados;
  if (!nickCookie || !emailCookie || !uidCookie || !uuid || !uid) {
    await reloadCookies();
    notifyError('Atualize a página e tente novamente');
    return;
  }
  try {
    const workspaceDocPrivate = firestore.collection('private-users')
    .doc(uid).collection('workspaces').doc(uuid);
    const workspaceDocPublic = firestore.collection('workspaces')
    .doc(uuid);

    const workspaceDocGetPrivate = await workspaceDocPrivate.get();
    const workspaceDocGetPublic = await workspaceDocPublic.get();
      if (workspaceDocGetPrivate.exists || workspaceDocGetPublic.exists) {
        const res1 = await workspaceDocPrivate.delete();
        const res2 = await workspaceDocPublic.delete();
      }
      return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const saveWorkspace = async (obj, file) => {
  if (!nickCookie || !emailCookie || !uidCookie) {
    notifyError('Atualize a página e tente novamente');
    return;
  }
  
  try {
    let workspaceDoc;
    

    if (obj['status'] === 0) {
      workspaceDoc = await firestore
        .collection('workspaces')
        .doc(obj.uid)
        .set(obj, { merge: true });
    } else if (obj['status'] === 1) {
      workspaceDoc = await firestore
        .collection('workspaces')
        .doc(obj.uid).delete();
    }
    
    const workspacesRef = await firestore
    .collection('private-users')
    .doc(uidCookie)
    .collection('workspaces')
    .get();

    if (!workspacesRef.empty) {
      if (file) {
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`workspaces/${obj.uid}/${file.name}`);
        
        const snapshot = await fileRef.put(file);
        const url = await snapshot.ref.getDownloadURL();
        obj.foto = url;
      }

      workspaceDoc = await firestore
        .collection('private-users')
        .doc(uidCookie)
        .collection('workspaces')
        .doc(obj.uid)
        .update(obj);
    } else {
      return false;
    }

    return obj;
  } catch (error) {
    console.log(error);
    return false;
  }
};



export { getWorkspaces, getDataWorkspacePrivate, getDataWorkspacePublic, createWorkspace, saveWorkspace, saveDataWorkspacePrivate, saveDataWorkspacePublic, deleteWorkspace, upadteDataWorkspacePublic };