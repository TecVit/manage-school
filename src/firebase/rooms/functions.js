/* 
  Hierarquia de Status na Sala
  Os níveis de status são representados por números, onde um número menor
  indica mais privilégios, e um número maior indica menos funcionalidades.
  
  1 - Admin: Tem acesso total a todas as funcionalidades e configurações na Sala.
  2 - Moderador: Pode gerenciar usuários e conteúdo, mas não tem acesso a configurações críticas.
  3 - Editor: Pode editar e publicar conteúdo, mas não pode gerenciar usuários.
  4 - Contribuidor: Pode criar conteúdo, mas precisa de aprovação para publicação.
  5 - Leitor: Pode apenas visualizar o conteúdo, sem capacidades de edição ou gerenciamento.
  6 - Membro: Tem acesso muito limitado, principalmente aos recursos básicos.
  
  Essa hierarquia garante que maiores privilégios estão associados a números menores.
*/

/*
  Access
  0 - Público: Todos usuários com o link tem acesso a sala.
  1 - Privado: Somente usuários com o link e com o EMAIL adicionando pelo admin tem acesso a sala;
*/

import { clearCookies, deleteCookie, getCookie, setCookie } from "../cookies";
import { firestore, auth } from "../login/login";

// Dados
const uidCookie = getCookie('uid') || '';
const nomeCookie = getCookie('nome') || '';
const emailCookie = getCookie('email') || '';

// Funções
const getRoom = async (uid) => {
  try {
    const roomDoc = await firestore.collection('rooms')
      .doc(uid).get();

    if (roomDoc.exists) {
      const data = roomDoc.data();
      const access = data.access;

      if (access === 0) {
        return {
          ...data,
          code: 'sucesso',
        };
      } else if (access === 1) {
        if (data.users) {
          const users = data.users;
          const userFound = users.find(val => val.email === emailCookie);

          if (userFound) {
            delete data.users;
            return {
              ...data,
              code: 'sucesso',
            };
          } else {
            return {
              code: 'sala-privada',
            };
          }
        } else {
          return {
            code: 'sala-privada',
          };
        }
      }

      return false;
    } else {
      return {
        code: 'uid-invalido'
      };
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};


export { getRoom };