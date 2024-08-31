import React from 'react';
import '../css/Landing.css';

import Logo from '../icons/manage.png';

// Icones
import { IoIosArrowForward, IoIosCheckmark } from "react-icons/io";
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { SiInstagram } from 'react-icons/si';
import { FaXTwitter } from 'react-icons/fa6';

export default function Landing() {

  const navigate = useNavigate();

  return (
    <main className='container-landing'>
        <section className='content-landing'>
            
            {/* Navbar */}
            <header className='container-navbar'>
                <div className='content-navbar'>
                    <img onClick={() => window.location.href = "/"} className='logo' src={Logo} />
                    <div className='links'>
                        <a>Preços</a>
                        <a>Funções</a>
                        <a>Exemplos</a>
                        <a>Atualizações</a>
                    </div>
                    <button onClick={() => navigate('/sign-in')} className='btn-signin'>Entrar</button>
                    <button onClick={() => navigate('/sign-up')} className='btn-started'>Começar</button>
                </div>
            </header>

            {/* Initial */}
            <div className='container-initial'>
                <div className='content-initial'>
                    <div className='update-info'>
                        <a>Atualizações</a>
                        <p>Visualizar novos componentes</p>
                        <IoIosArrowForward className='icon' />
                    </div>
                    <h1>Transforme Seus Dados em Resultados</h1>
                    <p>Simplifique a gestão de informações, <strong>Edite</strong>, visualize e compartilhe seus dados com <strong>rapidez</strong> e eficiência, tudo em um <strong>só lugar</strong></p>
                    <button className='btn-started'>Começar Agora</button>
                </div>
            </div>

            {/* Contact */}
            <div className='container-contact'>
                <div className='content-contact'>
                    <div className='social-media'>
                        <h1 className='logo'>
                            <img src={Logo} />
                            Manage School
                        </h1>
                        <div className='icons'>
                            <FaGithub className='icon' />
                            <FaInstagram className='icon' />
                            <FaWhatsapp className='icon' />
                            <FaXTwitter className='icon' />
                        </div>
                    </div>
                    <div className='row'></div>
                    <div className='links'>
                        <li>
                            <h1>Páginas</h1>
                            <a href='/'>Início</a>
                            <a href='/sign-in'>Entrar</a>
                            <a href='/sign-up'>Cadastrar</a>
                        </li>
                        <li>
                            <h1>UI Kits</h1>
                            <a>React</a>
                            <a>HTML</a>
                            <a>Astro</a>
                            <a>Symfony</a>
                        </li>
                        <li>
                            <h1>Templates</h1>
                            <a>Ampire</a>
                            <a>Radiant</a>
                            <a>Astrolus</a>
                            <a>All templates</a>
                        </li>
                        <li>
                            <h1>Redes Sociais</h1>
                            <a href='https://github.com'>GitHub</a>
                            <a href='https://instagram.com'>Instagram</a>
                            <a href='https://whatsapp.com'>Whatsapp</a>
                            <a href='https://x.com'>X / Twitter</a>
                        </li>
                    </div>
                    <p className='made'>Criado por <strong onClick={() => window.open("https://instagram.com/tecvit_")}>TecVit</strong></p>
                </div>
            </div>

        </section>
    </main>
  )
}
