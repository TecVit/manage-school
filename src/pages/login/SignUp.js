import React from 'react';
import './css/SignUp.css';

// Images
import Logo from '../../icons/manage.png';

// Icones
import { IoIosCheckmark } from "react-icons/io";
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {

  const navigate = useNavigate();

  return (
    <main className='container-signup'>
        <section className='content-signup'>
            <div className='info'>
                <h1 className='logo'>
                    <img onClick={() => navigate('/')} src={Logo} />
                    Manage School
                </h1>
                <div className='list'>
                    <li>
                        <IoIosCheckmark className='icon' />
                        <div className='text'>
                            <h1>Introdução</h1>
                            <p>O Manage School simplifica a gestão de dados. Ideal para escolas, empresas e instituições de saúde.</p>
                        </div>
                    </li>
                    <li>
                        <IoIosCheckmark className='icon' />
                        <div className='text'>
                            <h1>Funcionalidades Poderosas</h1>
                            <p>Edite planilhas Excel, visualize dados interativos, baixe prints para impressão e compartilhe facilmente.</p>
                        </div>
                    </li>
                    <li>
                        <IoIosCheckmark className='icon' />
                        <div className='text'>
                            <h1>Maximize Seus Resultados</h1>
                            <p>Aumente a eficiência, melhore a colaboração e tome decisões informadas com nossa solução ágil.</p>
                        </div>
                    </li>
                </div>
                <div className='news'>
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

            <div className='form'>
                <h1>Bem-Vindo ao Manage School</h1>
                <p>Cadastre-se para continuar</p>
                <button className='btn-social-midia'>
                    <FcGoogle className='icon' />
                    Cadastrar com Google
                </button>
                <div className='or'>
                    <div></div>
                    <p>Ou continue com</p>
                    <div></div>
                </div>
                <div className='input'>
                    <label>Nome de Usuário</label>
                    <input placeholder='Digite seu nome de usuário' type='text' />
                </div>
                <div className='input'>
                    <label>Email</label>
                    <input placeholder='Digite seu email' type='text' />
                </div>
                <div className='input'>
                    <label>Senha</label>
                    <input placeholder='Digite sua senha' type='text' />
                </div>
                <button>Cadastrar</button>
                <a>Já possúi tem conta? <strong onClick={() => navigate('/sign-in')}>Entrar</strong></a>
            </div>        
        </section>
    </main>
  )
}
