import React, { useState } from 'react';
import '../css/Landing.css';

import Logo from '../icons/manage.png';

// Icones
import { IoIosArrowDown, IoIosArrowForward, IoIosCheckmark, IoIosLink } from "react-icons/io";
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { SiInstagram } from 'react-icons/si';
import { FaXTwitter } from 'react-icons/fa6';

export default function Landing() {

  const navigate = useNavigate();

  const [createWorkspaceCheckbox, setCreateWorkspaceCheckbox] = useState([false, false]);
  const handleCreateWorkspaceCheckbox = (i) => {
    setCreateWorkspaceCheckbox((prev) => {
        const list = prev.map((val, index) => {
            if (index === i) {
                return true;
            }
            return false;
        });
        return list;
    })
  }

  const [mdStatusTeam, setMdStatusTeam] = useState([false, false, false, false]);
  const status = [
    'Admin',
    'Moderador',
    'Editor',
    'Contribuidor',
    'Leitor',
  ];
  const [statusSelected, setStatusSelected] = useState(status[0]);
  const handleStatusTeam = (i) => {
    setMdStatusTeam((status) => {
        const list = status.map((val, index) => {
            if (index === i) {
                return !val;
            }
        })
        console.log(list);
        return list;
    })
  }

  return (
    <main className='container-landing'>
        <section className='content-landing'>
            
            {/* Navbar */}
            <header className='container-navbar'>
                <div className='content-navbar'>
                    <img onClick={() => window.location.href = "/"} className='logo' src={Logo} />
                    <div className='links'>
                        <a href='/#initial'>Início</a>
                        <a href='/#features'>Funcionalidades</a>
                        <a href='/#examples'>Exemplos</a>
                        <a href='/#updates'>Atualizações</a>
                    </div>
                    <button onClick={() => navigate('/sign-in')} className='btn-signin'>Entrar</button>
                    <button onClick={() => navigate('/sign-up')} className='btn-started'>Começar</button>
                </div>
            </header>

            {/* Initial */}
            <div id='initial' className='container-initial'>
                <div className='content-initial'>
                    <div onClick={() => window.location.href = "/#updates"} className='update-info'>
                        <a>Atualizações</a>
                        <p>Visualizar novos componentes</p>
                        <IoIosArrowForward className='icon' />
                    </div>
                    <h1>Transforme Seus Dados em Resultados</h1>
                    <p>Simplifique a gestão de informações, <strong>Edite</strong>, visualize e compartilhe seus dados com <strong>rapidez</strong> e eficiência, tudo em um <strong>só lugar</strong></p>
                    <button onClick={() => navigate('/sign-up')} className='btn-started'>Começar Agora</button>
                </div>
            </div>

            {/* Products */}
            <div id='features' className='container-products'>
                <div className='content-products'>

                    {/* Join Workspace */}
                    <div className='join-workspace'>
                        <h1>Junte-se a espaços de trabalho</h1>
                        <p>Manage School é o melhor em espaços de trabalho</p>
                        <div className='modal'>
                            <li>
                                <div style={{ background: '#1c2739' }} className='image'>
                                    <p style={{ color: '#93c5fd' }}>TA</p>
                                </div>
                                <div className='content'>
                                    <div className='text'>
                                        <h1>Telefones dos Alunos</h1>
                                        <p>4 Membros</p>
                                    </div>
                                    <button>Juntar-se</button>
                                </div>
                            </li>
                            <div className='linha'></div>
                            <li>
                                <div style={{ background: '#283317' }} className='image'>
                                    <p style={{ color: '#a4d056' }}>BE</p>
                                </div>
                                <div className='content'>
                                    <div className='text'>
                                        <h1>Biblioteca Escolar</h1>
                                        <p>12 Membros</p>
                                    </div>
                                    <button>Juntar-se</button>
                                </div>
                            </li>
                            <div className='linha'></div>
                            <li>
                                <div style={{ background: '#2d2039' }} className='image'>
                                    <p style={{ color: '#d8b4fe' }}>Am</p>
                                </div>
                                <div className='content'>
                                    <div className='text'>
                                        <h1>Atestados Médicos</h1>
                                        <p>6 Membros</p>
                                    </div>
                                    <button>Juntar-se</button>
                                </div>
                            </li>
                        </div>
                    </div>

                    {/* Create Workspaces */}
                    <div className='create-workspace'>
                        <h1>Crie espaços de trabalho</h1>
                        <p>Manage School possui um gerenciamento personalizado</p>
                        <div className='modal'>
                            <div className='form'>
                                <h1>Novo espaço de trabalho</h1>
                                <p>Crie um novo espaço de trabalho para seu gerenciamento</p>
                                <div className='linha'></div>
                                <div className='input'>
                                    <label>Nome do espaço de trabalho</label>
                                    <input placeholder='ex: Biblioteca Escolar 2024' type='text' />
                                </div>
                                <div className='checkbox'>
                                    <div tabIndex={0} onKeyDown={(event) => event.key === "Enter" && handleCreateWorkspaceCheckbox(0)} onClick={() => handleCreateWorkspaceCheckbox(0)} className={`input-checkbox ${createWorkspaceCheckbox[0] && 'selecionado'}`}></div>
                                    <div className='text'>
                                        <h1>Privado</h1>
                                        <p>Por ser um espaço de trabalho privado, somente administradores podem edita-lo</p>
                                    </div>
                                </div>
                                <div className='checkbox'>
                                    <div tabIndex={0} onKeyDown={(event) => event.key === "Enter" && handleCreateWorkspaceCheckbox(1)} onClick={() => handleCreateWorkspaceCheckbox(1)} className={`input-checkbox ${createWorkspaceCheckbox[1] && 'selecionado'}`}></div>
                                    <div className='text'>
                                        <h1>Público</h1>
                                        <p>Por ser um espaço de trabalho público, todos podem ter acesso</p>
                                    </div>
                                </div>
                                <div className='textarea'>
                                    <label>Descrição</label>
                                    <textarea placeholder='Adicione sua descrição para o espaço de trabalho'></textarea>
                                </div>
                            </div>
                            
                            {/* Buttons */}
                            <div className='btns'>
                                <button className='btn-cancel'>Cancel</button>
                                <button className='btn-create'>Create</button>
                            </div>
                        </div>
                    </div>

                    {/* Invite Team - Part 2 */}
                    <div className='create-workspace'>
                        <div className='modal'>
                            <div className='form'>
                                <h1>Seu Time</h1>
                                <p>Convide seu time para te ajudar no Manage School</p>
                                <div className='send'>
                                    <div className='input-with-select'>
                                        <input placeholder='Email' type='text' />
                                        <div className='select'>
                                            <button onClick={() => handleStatusTeam(0)}>
                                                {statusSelected}
                                                <IoIosArrowDown className='icon' />
                                            </button>
                                            {mdStatusTeam[0] && (
                                                <div className='list'>
                                                    {status.length > 0 && (
                                                        status.map((val, index) => (
                                                            <button onClick={() => {
                                                                handleStatusTeam(0);
                                                                setStatusSelected(val);
                                                            }}>
                                                                <p>{val}</p>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button>Adicionar</button>
                                </div>
                                <div className='response-send'>

                                </div>
                            </div>
                            
                            {/* Buttons */}
                            <div className='links'>
                                <button className='copiar'>
                                    <IoIosLink className='icon' />
                                    Copiar Link
                                </button>
                            </div>
                        </div>
                    </div>

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
                    <p className='made'>Criado por <strong onClick={() => window.open("https://instagram.com/tecvit_")}>TecVit Inc</strong></p>
                </div>
            </div>

        </section>
    </main>
  )
}
