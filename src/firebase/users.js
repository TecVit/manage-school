import { clearCookies, deleteCookie, getCookie, setCookie } from "./cookies";
import { firestore, auth } from "./login/login";

// Dados
const uidCookie = getCookie('uid') || '';
const nomeCookie = getCookie('nome') || '';
const emailCookie = getCookie('email') || '';

// Funções
const validateUserNick = async (nick) => {
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


export { validateUserNick };