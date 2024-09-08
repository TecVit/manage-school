import React, { useEffect, useState } from 'react';
import './css/JoinRoom.css';

// Imagens
import Logo from '../../icons/manage.png';

// Icones
import { IoIosCheckmark } from "react-icons/io";
import { FcCancel, FcGoogle } from 'react-icons/fc';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { getCookie, setCookie } from '../../firebase/cookies';
import { entrarComEmail, entrarComGoogle } from '../../firebase/login/login';

import { NotificationContainer, notifyError, notifySuccess } from '../../toastifyServer';
import { getRoom } from '../../firebase/rooms.js';

export default function JoinRoom() {

    function coletarIniciais(str) {
        str = str.trim();
        const palavras = str.split(/\s+/);
        if (palavras.length === 0) {
            return '';
        }
        if (palavras.length === 1) {
            const palavra = palavras[0];
            return palavra.charAt(0) + palavra.charAt(palavra.length - 1);
        }
        const primeiraPalavra = palavras[0];
        const ultimaPalavra = palavras[palavras.length - 1];
        return primeiraPalavra.charAt(0) + ultimaPalavra.charAt(0);
    }

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
      document.title = 'Juntar-se | Manage School';
      animacoes();
      window.addEventListener('scroll', animacoes);
      return () => {
      window.removeEventListener('scroll', animacoes);
      };
  }, []);

  const navigate = useNavigate();
  
  // Dados
  const uidCookie = getCookie('uid') || '';
  const nomeCookie = getCookie('nome') || '';
  const emailCookie = getCookie('email') || '';

  // Modais
  const [carregando, setCarregando] = useState(true);
  const [textErro, setTextErro] = useState('');

  // Inputs
  const [dados, setDados] = useState({});

  // Uid Sala
  const params = useParams();
  const uidSala = params.uid;
  
  const consultarSala = async () => {
    setCarregando(true);
    try {
        const response = await getRoom(uidSala);
        if (response.code === 'sucesso') {
            setDados(response);
            return true;
        } else if (response.code === 'uid-invalido') {
            notifyError('O link acessado é inválido');
            setTextErro('A sala não foi encontrada!');
            return false;
        } else if (response.code === 'sala-privada') {
            notifyError('O acesso dessa sala está privado');
            setTextErro('Essa sala é privada');
            return false;
        } else {
            notifyError('Houve algum erro');
            return false;
        }
    } catch (error) {
        console.log(error);
        return;
    } finally {
        setCarregando(false);
    }
  };

  useEffect(() => {
    consultarSala();
  }, [uidSala]);


  return (
    <main className='container-join-room'>
        <NotificationContainer />
        <section className='content-join-room'>
            <div className='content'>
                {carregando ? (
                    <div className="form">
                        <h1 className='loading'></h1>
                        <p className='loading'></p>
                        <div className='list'>
                            {[0, 1, 2].map((val, index) => (
                                <li className='loading'>
                                </li>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {dados.name ? (
                            <div className="form">
                                <h1>Junte seu time no Manage School!</h1>
                                {dados.access === 0 && (
                                    <p>Esse espaço de trabalho permite que qualquer pessoa com o link participe.</p>
                                )}
                                {dados.access === 1 && (
                                    <>
                                        <p>Esse espaço de trabalho permite que apenas pessoas com o link e com o email adicionado pelo administrador participe.</p>
                                        <a>Seu email: <strong>{emailCookie}</strong></a>
                                    </>
                                )}
                                <div className='list'>
                                    {[0].map((val, index) => (
                                        <li key={index}>
                                            {dados.photo ? (
                                                <img src={dados.photo} />
                                            ) : (
                                                <div style={{ background: '#2d1037' }} className='image'>
                                                    <p style={{ color: '#d894fa' }}>{dados.name ? coletarIniciais(dados.name) : 'TM'}</p>
                                                </div>
                                            )}
                                            <div className='text'>
                                                <h1>{dados.name ? dados.name : 'Team'}</h1>
                                                <p>{dados.users && dados.users.length} Member {dados.users && dados.users.length > 1 && 's'}</p>
                                            </div>
                                            <button>Juntar-se</button>
                                        </li>
                                    ))}
                                </div>
                            </div>    
                        ) : (
                            <div className='error'>
                                <FcCancel className='icon' />
                                <h1>{textErro ? textErro : 'Erro'}</h1>
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className='details'>
                <p>"A ignorância de uma nação é uma ameaça à segurança de todos. Só através da educação podemos assegurar que nosso futuro será livre e próspero."</p>
                <h2>John F. Kennedy</h2>
            </div>
        </section>
    </main>
  )
}
