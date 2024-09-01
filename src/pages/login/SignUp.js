import React, { useEffect, useState } from 'react';
import './css/SignUp.css';

// Images
import Logo from '../../icons/manage.png';

// Icones
import { IoIosCheckmark } from "react-icons/io";
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import { getCookie, setCookie } from '../../firebase/cookies';
import { NotificationContainer, notifyError, notifySuccess } from '../../toastifyServer';
import { cadastrarComEmail, cadastrarComGoogle } from '../../firebase/login/login';

export default function SignUp() {

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
      document.title = 'Cadastrar | Manage School';
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
  const nomeCookie = getCookie('nome') || '';
  const emailCookie = getCookie('email') || '';

  // Modais
  const [carregando, setCarregando] = useState(false);

  // Inputs
  const [nick, setNick] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Funções
  const cadastrarUsuario = async () => {
    setCarregando(true);
    try {
      if (carregando) {
        notifyError('Por favor, aguarde um momento');
        return;
      }
      if (!nick || !email || !senha) {
        notifyError('Por favor, insira suas informações corretamente');
        return;
      }
      if (senha && senha.length < 6) {
        notifyError('Por favor, insira uma senha com mais de 6 caracteres');
        return;
      }
      
      const cadastrando = await cadastrarComEmail(nick, email, senha);
      if (cadastrando === 'sucesso') {
        notifySuccess('Usuário cadastrado com sucesso');
        return;
      } else if (cadastrando === 'email-invalido') {
        notifyError('Email inválido');
        return;
      } else if (cadastrando === 'email-em-uso') {
        notifyError('Email já está em uso');
        return;
      } else if (cadastrando === 'nome-de-usuario-em-uso') {
        notifyError('Nome de usuário já está em uso');
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

  const cadastrarGoogle = async () => {
    setCarregando(true);
    try {
      if (carregando) {
        notifyError('Por favor, aguarde um momento');
        return;
      }
      
      const cadastrando = await cadastrarComGoogle();
      if (cadastrando === 'sucesso') {
        notifySuccess('Usuário cadastrado com sucesso');
        return;
      } else if (cadastrando === 'email-em-uso') {
        notifyError('Email já está em uso');
        return;
      } else if (cadastrando === 'nome-de-usuario-em-uso') {
        notifyError('Nome de usuário já está em uso');
        return;
      } else if (cadastrando === 'popup-fechou') {
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
    <main className='container-signup'>
        <NotificationContainer />
        <section className='content-signup'>
            <div className='info'>
                <h1 data-animation data-duration-animation="0.6s" className='logo'>
                    <img onClick={() => navigate('/')} src={Logo} />
                    Manage School
                </h1>
                <div className='list'>
                    <li data-animation data-duration-animation="0.7s">
                        <IoIosCheckmark className='icon' />
                        <div className='text'>
                            <h1>Introdução</h1>
                            <p>O Manage School simplifica a gestão de dados. Ideal para escolas, empresas e instituições de saúde.</p>
                        </div>
                    </li>
                    <li data-animation data-duration-animation="0.8s">
                        <IoIosCheckmark className='icon' />
                        <div className='text'>
                            <h1>Funcionalidades Poderosas</h1>
                            <p>Edite planilhas Excel, visualize dados interativos, baixe prints para impressão e compartilhe facilmente.</p>
                        </div>
                    </li>
                    <li data-animation data-duration-animation="0.9s">
                        <IoIosCheckmark className='icon' />
                        <div className='text'>
                            <h1>Maximize Seus Resultados</h1>
                            <p>Aumente a eficiência, melhore a colaboração e tome decisões informadas com nossa solução ágil.</p>
                        </div>
                    </li>
                </div>
                <div data-animation data-duration-animation="1.0s" className='news'>
                    <div className='paragraph'>
                        <p>O <strong>Modelo 2.0</strong> da plataforma está no ar! Esta atualização traz um design moderno e novas funcionalidades para melhorar sua experiência.</p>
                    </div>
                    <div className='made'>
                        <img src='https://avatars.githubusercontent.com/u/156000975?v=4' />
                        <div className='text'>
                            <h1>TecVit Inc</h1>
                            <p>Desenvolvedor</p>
                        </div>
                    </div>
                </div>
            </div>

            <div data-animation data-duration-animation="0.8s" className='form'>
                <h1>Bem-Vindo ao Manage School</h1>
                <p>Cadastre-se para continuar</p>
                <button onClick={cadastrarGoogle} className='btn-social-midia'>
                    {carregando ? (
                        <div className='loader'></div>
                    ) : (
                        <>
                            <FcGoogle className='icon' />
                            Cadastrar com Google
                        </>
                    )}
                </button>
                <div className='or'>
                    <div></div>
                    <p>Ou continue com</p>
                    <div></div>
                </div>
                <div className='input'>
                    <label>Nome de Usuário</label>
                    <input onChange={(e) => setNick(e.target.value)} placeholder='Digite seu nome de usuário' type='text' />
                </div>
                <div className='input'>
                    <label>Email</label>
                    <input onChange={(e) => setEmail(e.target.value)} placeholder='Digite seu email' type='text' />
                </div>
                <div className='input'>
                    <label>Senha</label>
                    <input onChange={(e) => setSenha(e.target.value)} placeholder='Digite sua senha' type='text' />
                </div>
                <button onClick={cadastrarUsuario}>
                    {carregando ? (
                        <div className='loader'></div>
                    ) : (
                        <>Cadastrar</>
                    )}
                </button>
                <a>Já possúi tem conta? <strong onClick={() => navigate('/entrar')}>Entrar</strong></a>
            </div>        
        </section>
    </main>
  )
}
