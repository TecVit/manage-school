import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Workspaces.css';
import { IoIosArrowDown, IoMdTrendingDown, IoMdTrendingUp } from 'react-icons/io';
import { clearCookies, getCookie, setCookie } from '../../firebase/cookies';
import { MdErrorOutline, MdOutlineDashboard, MdOutlineEdit } from 'react-icons/md';
import Form from './components/Form';
import { createWorkspace, getWorkspaces } from '../../firebase/workspaces.js';
import { NotificationContainer, notifyError, notifySuccess } from '../../toastifyServer';
import { auth } from '../../firebase/login/login.js';
import { LuExpand } from 'react-icons/lu';
import { BiExitFullscreen, BiFullscreen } from 'react-icons/bi';
import { FaEllipsisVertical } from 'react-icons/fa6';
import { FiTrash } from 'react-icons/fi';
import { validateUserNick } from '../../firebase/users.js';

export default function Workspaces() {

    // Dados
    const uidCookie = getCookie('uid') || '';
    const nickCookie = getCookie('nick') || '';
    const photoCookie = getCookie('photo') || '';
    const emailCookie = getCookie('email') || '';
    const qtdWorkspaces = Number(getCookie('qtdWorkspaces')) || 0;
    
    useEffect(() => {
        auth.onAuthStateChanged( async function(user) {
            if (!user) {
                await clearCookies();
                localStorage.clear();
                window.location.href = "/entrar";
            } else {
                if (emailCookie !== user.email || uidCookie !== user.uid || nickCookie !== user.displayName) {
                await clearCookies();
                localStorage.clear();
                window.location.href = "/entrar";
                }
            }
        });
    }, []);
    
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
        document.title = 'Workspaces | Manage School';
        animacoes();
        window.addEventListener('scroll', animacoes);
        return () => {
        window.removeEventListener('scroll', animacoes);
        };
    }, []);

    
    const navigate = useNavigate();

    // Modais
    const [carregando, setCarregando] = useState(false);
    const [mdPopup, setMdPopup] = useState(true);

    // Pages
    const [pageWorkspaces, setPageWorkspaces] = useState(true);
    const [pageEditWorkspace, setPageEditWorkspace] = useState(false);

    // Inputs
    const [inputNomeWorkspace, setInputNomeWorkspace] = useState('');
    const [inputDescricaoWorkspace, setInputDescricaoWorkspace] = useState('');
    const [inputAccessWorkspace, setInputAccessWorkspace] = useState(0);
    const [inputFotoWorkspace, setInputFotoWorkspace] = useState(null);


    // Form - Checkboxs
    const [createWorkspaceCheckbox, setCreateWorkspaceCheckbox] = useState([true, false]);
    const handleCreateWorkspaceCheckbox = (i) => {
        setCreateWorkspaceCheckbox((prev) => {
            const list = prev.map((val, index) => {
                if (index === i) {
                    return true;
                }
                return false;
            });
            return list;
        });
    }

    // Datas Workspaces
    const [workspacesData, setWorkspacesData] = useState([]);
    const [infoWorkspace, setInfoWorkspace] = useState({});
    
    const [mdUsersWorkspace, setMdUsersWorkspace] = useState([false]);
    // const [mdUsersWorkspace, setMdUsersWorkspace] = useState(Array(10).fill(false));
    const handleMdUsersWorkspace = (i) => {
        if (i >= mdUsersWorkspace.length) {
            setMdUsersWorkspace(Array(i+1).fill(false));
        }
        setMdUsersWorkspace((prev) => {
            const list = prev.map((val, index) => {
                if (index === i) {
                    return !val;
                }
                return false;
            });
            return list;
        });
    }
    

    useEffect(() => {
        const consultarWorkspaces = async () => {
            setCarregando(true);
            try {
                const listWorkspaces = await getWorkspaces(uidCookie) || [];
                if (listWorkspaces.length > 0) {
                    setCookie('qtdWorkspaces', listWorkspaces.length);
                    setWorkspacesData(listWorkspaces);
                    return true;
                }
            } catch (error) {
                console.log(error);
                return;
            } finally {
                setCarregando(false);
            }
        }
        consultarWorkspaces();
    }, []);
    
    
    const handleCreateWorkspace = async () => {
        try {
            if (!inputNomeWorkspace || !inputDescricaoWorkspace || inputAccessWorkspace < 0) {
                notifyError('Complete o formulário corretamente');
                return false;
            }
            const criando = await createWorkspace({
                nome: inputNomeWorkspace,
                descricao: inputDescricaoWorkspace,
                status: inputAccessWorkspace,
                uid: uidCookie,
            });
            if (criando) {
                notifySuccess('Workspace criado com sucesso');
                const list = await getWorkspaces(uidCookie) || [];
                if (list.length > 0) {
                    setCookie('qtdWorkspaces', list.length);
                    setWorkspacesData(list);
                    return true;
                }
            }
        } catch (error) {
            console.log(error);
            return;
        } finally {
            setCarregando(false);
        }
    }

    // Expand Screen
    const [statusExpanded, setStatusExpanded] = useState(false);
    const handleExpandScreen = () => {
        if (statusExpanded) {
            document.querySelector('.container-menu').classList.remove('none');
            document.querySelector('.painel').classList.remove('expanded');
            document.querySelector('.container-workspaces .top').classList.remove('expanded');
            document.querySelector('.container-workspaces .top').classList.remove('border-radius-none');
            document.querySelector('.content-workspaces').classList.remove('border-radius-none');
        } else {
            document.querySelector('.container-menu').classList.add('none');
            document.querySelector('.painel').classList.add('expanded');
            document.querySelector('.container-workspaces .top').classList.add('expanded');
            document.querySelector('.container-workspaces .top').classList.add('border-radius-none');
            document.querySelector('.content-workspaces').classList.add('border-radius-none');
        }
        setStatusExpanded(!statusExpanded);
    }

    // Position User
    const [mdPositionUser, setMdPositionUser] = useState(false);
    const positions = [
        'Administrador',
        'Moderador',
        'Editor',
        'Contribuidor',
        'Leitor',
        'Membro',
    ];

    const [positionSelect, setpositionSelect] = useState(positions[0]);
    const handlePositionUser = () => {
        setMdPositionUser(!mdPositionUser);
    }

    const [inputUserNick, setInputUserNick] = useState('');
    const [statusUserNick, setStatusUserNick] = useState(null);
    const handleValidateUserNick = async () => {
        if (inputUserNick.length >= 5) {
            const response = await validateUserNick(inputUserNick);
            if (response.email) {
                setStatusUserNick(true);
            } else if (response.code === 'nick-invalido') {
                setStatusUserNick(false);
            } else {
                setStatusUserNick(false);
            }
        } else {
            setStatusUserNick(null);
        }
    }

    // positions.indexOf(positionSelect) => Usado para definir o cargo do usuário em forma de Número


    return (
        <>
            <main className="container-workspaces">
                <NotificationContainer />
                
                {/* Página Inicial */}
                {pageWorkspaces && (
                    <section className='content-workspaces'>
                        <div className='top'>
                            <h1>Workspaces</h1>
                        </div>
                        <div className='list-workspaces'>
                            {carregando ? (
                                Array.from({ length: qtdWorkspaces }, (_, i) => i).map((val, index) => (
                                    <div key={index} className='workspace loading'>
                                    </div>
                                ))
                            ) : (
                                <>
                                    {workspacesData.length > 0 ? (
                                        workspacesData.map((val, index) => (
                                            <div tabIndex={0} onClick={() => {
                                                setInfoWorkspace(val);
                                                setPageEditWorkspace(true);
                                                setPageWorkspaces(false);
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    setInfoWorkspace(val);
                                                    setPageEditWorkspace(true);
                                                    setPageWorkspaces(false);
                                                }
                                            }}
                                            key={index} className='workspace'>
                                                {val.foto ? (
                                                    <img src={val.foto} />
                                                ) : (
                                                    <MdOutlineDashboard className='icon' />
                                                )}
                                                <div className='text'>
                                                    <h2>{val.data}</h2>
                                                    <h1>{val.nome}</h1>
                                                    <p>{val.descricao}</p>
                                                    <a>{val.users ? val.users.length-1 : 0} Membros</a>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <h1>
                                            <MdErrorOutline className='icon' />
                                            Nenhum workspace encontrado
                                        </h1>
                                    )}
                                </>
                            )}
                        </div>
                        <div className='linha'></div>
                        <Form handleCreate={handleCreateWorkspace}>
                            <h1>Novo espaço de trabalho</h1>
                            <p>Crie um novo espaço de trabalho para seu gerenciamento</p>
                            <div className='linha'></div>
                            <div className='input'>
                                <label>Nome do espaço de trabalho</label>
                                <input onChange={(e) => setInputNomeWorkspace(e.target.value)} placeholder='ex: Biblioteca Escolar 2024' type='text' />
                            </div>
                            <div className='checkbox'>
                                <div tabIndex={0} onKeyDown={(event) => {event.key === "Enter" && handleCreateWorkspaceCheckbox(0); setInputAccessWorkspace(0)}} onClick={() => {handleCreateWorkspaceCheckbox(0); setInputAccessWorkspace(0)}} className={`input-checkbox ${createWorkspaceCheckbox[0] && 'selecionado'}`}></div>
                                <div className='text'>
                                    <h1>Privado</h1>
                                    <p>Por ser um espaço de trabalho privado, somente administradores podem edita-lo</p>
                                </div>
                            </div>
                            <div className='checkbox'>
                                <div tabIndex={0} onKeyDown={(event) => {event.key === "Enter" && handleCreateWorkspaceCheckbox(1); setInputAccessWorkspace(1)}} onClick={() => {handleCreateWorkspaceCheckbox(1); setInputAccessWorkspace(1)}} className={`input-checkbox ${createWorkspaceCheckbox[1] && 'selecionado'}`}></div>
                                <div className='text'>
                                    <h1>Público</h1>
                                    <p>Por ser um espaço de trabalho público, todos podem ter acesso</p>
                                </div>
                            </div>
                            <div className='textarea'>
                                <label>Descrição</label>
                                <textarea onChange={(e) => setInputDescricaoWorkspace(e.target.value)} placeholder='Adicione sua descrição para o espaço de trabalho'></textarea>
                            </div>
                        </Form>
                    </section>      
                )}


                {/* Página para Editar Workspace */}
                {pageEditWorkspace && (
                    <section className='content-workspaces'>
                        <div className='top'>
                            {infoWorkspace.foto ? (
                                <img src={infoWorkspace.foto} />
                            ) : (
                                <MdOutlineDashboard className='icon' />
                            )}
                            <div className='text'>
                                <h1>{infoWorkspace.nome}</h1>
                                <p>{infoWorkspace.descricao}</p>
                            </div>
                            {statusExpanded ? (
                                <BiExitFullscreen onClick={() => handleExpandScreen()} className='expand' />
                            ) : (
                                <BiFullscreen onClick={() => handleExpandScreen()} className='expand' />
                            )}
                            <button>Editar Workspace</button>
                        </div>

                        {/* Users Workspace */}
                        <div className='users-workspace'>
                            <h1>Usuários do Workspace</h1>
                            <p>Informações sobre os usuários com acesso ao <strong>Workspace {infoWorkspace.status === 0 ? 'Público' : infoWorkspace.status === 1 ? 'Privado' : ''}</strong></p>
                            
                            <div className='add-user'>
                                <div className='send'>
                                    <div className={`input-with-select ${statusUserNick === true ? 'green' : statusUserNick === false ? 'red' : ''}`}>
                                        <input onChange={(e) => setInputUserNick(e.target.value)} onBlur={() => handleValidateUserNick()} placeholder='Nick do Usuário' type='text' />
                                        <div className='select'>
                                            <button onClick={handlePositionUser}>
                                                {positionSelect}
                                                <IoIosArrowDown className='icon' />
                                            </button>
                                            {mdPositionUser && (
                                                <div className='list'>
                                                    {positions.length > 0 && (
                                                        positions.map((val, index) => (
                                                            <button key={index} onClick={() => {
                                                                handlePositionUser(0);
                                                                setpositionSelect(val);
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
                            </div>
                            
                            <div className='tabela'>
                                {infoWorkspace.users && infoWorkspace.users.length > 0 ? (
                                    infoWorkspace.users.map((obj, i) => (
                                        <div className={`linha ${i === 0 && 'primeira'}`} key={i}>
                                            {Object.keys(obj).map((key, j) => (
                                                <div className='coluna' key={j}>
                                                    <div className='paragrafo' dangerouslySetInnerHTML={{ __html: obj[key] }} />
                                                </div>
                                            ))}
                                            {i !== 0 && (
                                                <div className='coluna'>
                                                    {infoWorkspace.users[i][2] !== emailCookie && (
                                                        <FaEllipsisVertical onClick={() => handleMdUsersWorkspace(i-1)} 
                                                        onKeyDown={(event) => {
                                                            if (event.key === "Enter") {
                                                                handleMdUsersWorkspace(i-1);
                                                            }
                                                        }} tabIndex={0} className='icon' />
                                                    )}
                                                </div>
                                            )}
                                            {mdUsersWorkspace[i-1] && (
                                                <div className='md-user'>
                                                    <div className='list'>
                                                        <button>
                                                            <MdOutlineEdit className='icon' />
                                                            Editar
                                                        </button>
                                                        <button className='deletar'>
                                                            <FiTrash className='icon' />
                                                            Deletar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <h1>Nenhum usuário encontrado</h1>
                                )}
                            </div>
                        </div>

                    </section>      
                )}


            </main>
        </>
    )
}