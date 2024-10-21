import React, { useEffect, useState } from 'react';
import './css/SignIn.css';

// Imagens
import Logo from '../../icons/manage.png';

// Icones
import { IoIosCheckmark } from "react-icons/io";
import { FcGoogle } from 'react-icons/fc';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { getCookie, setCookie } from '../../firebase/cookies';
import { entrarComEmail, entrarComGoogle } from '../../firebase/login/login';

import { NotificationContainer, notifyError, notifySuccess } from '../../toastifyServer';

export default function SignIn() {

  // Animações
  function getTopPositionRelativeToPage(element) {
    var rect = element.getBoundingClientRect();
    var scrollTop = window.scrollY || window.pageYOffset;
    return rect.top + scrollTop;
  }

  const animacoes = () => {
      const elements = document.querySelectorAll('[data-animation]');
      const classAnimation = "animationClass";
      const windowTop = window.scrollY + ((window.innerHeight * 4.5) / 4);
      
      elements.forEach( async (element) => {
      const positionElemento = await getTopPositionRelativeToPage(element);
      if (Number(windowTop) >= positionElemento - 100) {
          element.classList.add(classAnimation);
      }
      });
  }

  useEffect(() => {
      document.title = 'Entrar | Manage School';
      animacoes();
      window.addEventListener('scroll', animacoes);
      return () => {
      window.removeEventListener('scroll', animacoes);
      };
  }, []);

  const navigate = useNavigate();
  
  // Dados
  const cepCookie = getCookie('cep') || '';
  const uidCookie = getCookie('uid') || '';
  const nickCookie = getCookie('nick') || '';
  const emailCookie = getCookie('email') || '';

  // Modais
  const [carregando, setCarregando] = useState(false);

  // Inputs
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [email, setEmail] = useState(emailCookie);
  const [senha, setSenha] = useState('');

  // Funções
  const entrarUsuario = async () => {
    setCarregando(true);
    try {
      if (carregando) {
        notifyError('Por favor, aguarde um momento');
        return;
      }
      if (!email || !senha) {
        notifyError('Por favor, insira suas informações corretamente');
        return;
      }
      if (senha && senha.length < 6) {
        notifyError('Por favor, insira uma senha com mais de 6 caracteres');
        return;
      }
      
      const entrando = await entrarComEmail(email, senha);
      if (entrando === 'sucesso') {
        notifySuccess('Usuário logado com sucesso');
        setTimeout(() => {
          window.location.href = "/painel";
        }, 3750);
        return;
      } else if (entrando === 'email-invalido') {
        notifyError('Email inválido');
        return;
      } else if (entrando === 'email-em-uso') {
        notifyError('Email já está em uso');
        return;
      } else if (entrando === 'nome-de-usuario-em-uso') {
        notifyError('Nome de usuário já está em uso');
        return;
      } else if (entrando === 'credenciais-invalidas') {
        notifyError('Credenciais Inválidas');
        return;
      } else {
        notifyError('Houve um erro');
        return;
      }
      
    } catch (error) {
      console.log(error);
      return;
    } finally {
      setCarregando(false);
    }
  }

  const entrarGoogle = async () => {
    setCarregando(true);
    try {
      if (carregando) {
        notifyError('Por favor, aguarde um momento');
        return;
      }
      
      const entrando = await entrarComGoogle();
      if (entrando === 'sucesso') {
        notifySuccess('Usuário logado com sucesso');
        setTimeout(() => {
          window.location.href = "/painel";
        }, 3750);
        return;
      } else if (entrando === 'email-invalido') {
        notifyError('Email inválido');
        return;
      } else if (entrando === 'email-em-uso') {
        notifyError('Email já está em uso');
        return;
      } else if (entrando === 'usuario-nao-existe') {
        notifyError('Usuário não existe ou conta não cadastrada em nosso servidor');
        return;
      } else if (entrando === 'nome-de-usuario-em-uso') {
        notifyError('Nome de usuário já está em uso');
        return;
      } else if (entrando === 'credenciais-invalidas') {
        notifyError('Credenciais Inválidas');
        return;
      } else if (entrando === 'popup-fechou') {
        notifyError('O Popup foi fechado, tente novamente');
        return;
      } else {
        notifyError('Houve um erro');
        return;
      }
      
    } catch (error) {
      console.log(error);
      return;
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className='container-signin'>
      <NotificationContainer />
      <section className='content-signin'>
        <h1 data-animation data-duration-animation="0.7s" className='logo'>
          <img onClick={() => navigate('/')} src={Logo} />
          Manage School
        </h1>
        <div data-animation data-duration-animation="0.9s" className='form'>
            <h1>Bem-Vindo ao Manage School</h1>
            <p>Entre na sua conta para continuar</p>
            <button onClick={entrarGoogle} className='btn-social-midia'>
              {carregando ? (
                <div className='loader'></div>
              ) : (
                <>
                  <FcGoogle className='icon' />
                  Entrar com Google
                </>
              )}
            </button>
            <div className='or'>
                <div></div>
                <p>Ou continue com</p>
                <div></div>
            </div>
            <div className='input'>
                <label>Email</label>
                <input onChange={(e) => setEmail(e.target.value)} placeholder='Digite seu email' type='text' />
            </div>
            <div className='input'>
                <label>Senha</label>
                <input onChange={(e) => setSenha(e.target.value)} placeholder='Digite sua senha' type='text' />
            </div>
            <button onClick={entrarUsuario}>
              {carregando ? (
                <div className='loader'></div>
              ) : (
                <>Entrar</>
              )}
            </button>
            <a>Não tem conta? <strong onClick={() => navigate('/cadastrar')}>Cadastrar</strong></a>
        </div>        
      </section>
    </main>
  )
}
