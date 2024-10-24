import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/storage';
import { firebaseConfig } from '../firebaseConfig';
import { clearCookies, getCookie, setCookie } from '../cookies';

const uidCookie = getCookie('uid') || null;
const nomeCookie = getCookie('nome') || null;
const emailCookie = getCookie('email') || null;

// Inicializando o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();
const auth = firebase.auth();

const formatarNomeDeUsuario = (valor) => {
    valor = valor.replace(/\s+/g, '');
    valor = valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    valor = valor.replace(/[^a-zA-Z0-9]/g, '');
    return valor;
};

export const entrarComRedeSocial = async (provedor) => {
    await clearCookies();
    return auth.signInWithPopup(provedor)
        .then((result) => {
            const user = result.user;
            const usuarioRef = firestore.collection('private-users').doc(user.uid);
            return usuarioRef.get()
            .then( async (doc) => {
                if (doc.exists) {
                    const dados = doc.data();
                    const camposCookies = ['nick', 'email', 'photo'];
                    camposCookies.forEach((campo) => {
                        if (dados[campo]) {
                            setCookie(campo, dados[campo]);
                        }
                    });
                    setCookie('uid', user.uid);
                    return 'sucesso';
                } else {
                    return 'usuario-nao-existe';
                }
            })
            .catch((error) => {
                console.log(error);
                return 'conta-nao-existe';
            });
        })
        .catch((error) => {
            if (error.code === 'auth/popup-closed-by-user') {
                return 'popup-fechou';
            }
            console.log(error);
            return 'erro';
        });
};

export const cadastrarComRedeSocial = async (provedor) => {
    await clearCookies();
    return auth.signInWithPopup(provedor)
        .then(async (result) => {
            const user = result.user;
            const nomeUsuario = await formatarNomeDeUsuario(user.displayName);
            const usuarioRef = firestore.collection('private-users').doc(user.uid);
            const amigosRef = firestore.collection('public-users').doc(nomeUsuario);
            
            if ((await amigosRef.get()).exists) {
                return 'nome-de-usuario-existe';
            }

            return usuarioRef.get()
                .then(async (doc) => {
                    if (doc.exists) {
                        return 'usuario-existe';
                    } else {
                        await amigosRef.set({
                            nick: nomeUsuario,
                            email: user.email,
                            photo: user.photoURL,
                        });

                        await usuarioRef.set({
                            nick: nomeUsuario,
                            email: user.email,
                            photo: user.photoURL,
                        });

                        await user.updateProfile({
                            displayName: nomeUsuario,
                        });

                        setCookie('nick', nomeUsuario);
                        setCookie('email', user.email);
                        setCookie('photo', user.photoURL);
                        setCookie('uid', user.uid);
                        
                        return 'sucesso';
                    }
                })
                .catch((error) => {
                    console.log(error, error.code);
                    return 'erro';
                });
        })
        .catch((error) => {
            if (error.code === 'auth/popup-closed-by-user') {
                return 'popup-fechou';
            }
            console.log(error, error.code);
            return 'erro';
        });
};

export const cadastrarComEmail = async (nome, email, senha) => {
    await clearCookies();
    try {
        const nomeUsuario = await formatarNomeDeUsuario(nome);
        const friendDocRef = firestore.collection('public-users').doc(nomeUsuario);
        const friendDoc = await friendDocRef.get();
        if (friendDoc.exists) {
            return 'nome-de-usuario-em-uso';
        }
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
        const user = userCredential.user;

        if (!user) {
            return 'erro';
        }

        const uid = user.uid;
        const userDocRef = firestore.collection('private-users').doc(uid);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
            return 'usuario-existe';
        } else {
            await userDocRef.set({
                nick: nomeUsuario,
                email: email,
            });
            
            await friendDocRef.set({
                nick: nomeUsuario,
                email: email,
            });
            
            await user.updateProfile({
                displayName: nomeUsuario
            });

            setCookie('nick', nomeUsuario);
            setCookie('email', email);
            setCookie('uid', uid);
            return 'sucesso';
        }
    } catch (error) {
        if (error.code === 'auth/invalid-email') {
            return 'email-invalido';
        } else if (error.code === 'auth/invalid-credential') {
            return 'credenciais-invalidas';
        } else if (error.code === 'auth/email-already-in-use') {
            return 'email-em-uso';
        }
        console.error('Erro ao cadastrar:', error, error.code);
        return 'erro';
    }
};

export const entrarComEmail = async (email, senha) => {
    await clearCookies();
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, senha);
        const user = userCredential.user;

        if (!user) {
            return 'credencial-invalida';
        }

        const uid = user.uid;
        const userDoc = await firestore.collection('private-users').doc(uid).get();

        if (userDoc.exists) {
            const dados = userDoc.data();
            const camposCookies = ['nick', 'email', 'photo'];

            camposCookies.forEach((campo) => {
                if (dados[campo]) {
                    setCookie(campo, dados[campo]);
                }
            });

            setCookie('uid', uid);
            return 'sucesso';
        } else {
            return 'usuario-nao-existe'; 
        }
    } catch (error) {
        if (error.code === 'auth/invalid-email') {
            return 'email-invalido';
        } else if (error.code === 'auth/invalid-credential') {
            return 'credenciais-invalidas';
        }
        console.error('Erro ao entrar:', error);
        return 'erro';
    }
};

export const enviarLinkEmail = (email) => {
    return auth.sendPasswordResetEmail(email)
    .then(() => {
        console.log('E-mail de redefinição de senha enviado com sucesso');
        return 'sucesso';
    })
    .catch((error) => {
        if (error.code === 'auth/invalid-email') {
            return 'email-invalido';
        }
        console.error('Erro ao enviar e-mail de redefinição de senha:', error);
        return 'erro';
    });
};

export const redefinirSenha = (codigoOOB, novaSenha) => {
    return firebase.auth().confirmPasswordReset(codigoOOB, novaSenha)
      .then(() => {
        // Senha definida com sucesso
        console.log('Senha definida com sucesso');
        return 'sucesso';
      })
      .catch((error) => {
        if (error.code === 'auth/invalid-email') {
            return 'email-invalido';
        }
        console.error('Erro ao definir a senha:', error);
        return 'erro';
      });
  };
  
  
export const entrarComGoogle = () => {
    const provedor = new firebase.auth.GoogleAuthProvider();
    return entrarComRedeSocial(provedor);
};

export const entrarComFacebook = () => {
    const provedor = new firebase.auth.FacebookAuthProvider();
    return entrarComRedeSocial(provedor);
};

export const cadastrarComGoogle = () => {
    const provedor = new firebase.auth.GoogleAuthProvider();
    return cadastrarComRedeSocial(provedor);
};

export const cadastrarComFacebook = () => {
    const provedor = new firebase.auth.FacebookAuthProvider();
    return cadastrarComRedeSocial(provedor);
};
  
export const sair = () => {
  return auth.signOut();
};

export { firebase, firestore, auth };