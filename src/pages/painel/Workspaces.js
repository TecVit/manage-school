import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Workspaces.css';
import { IoIosArrowDown, IoMdTrendingDown, IoMdTrendingUp } from 'react-icons/io';
import { clearCookies, getCookie, setCookie } from '../../firebase/cookies';
import { MdErrorOutline, MdOutlineDashboard, MdOutlineEdit } from 'react-icons/md';
import Form from './components/Form';
import { createWorkspace, deleteWorkspace, getWorkspaces, saveWorkspace } from '../../firebase/workspaces.js';
import { NotificationContainer, notifyError, notifySuccess } from '../../toastifyServer';
import { auth } from '../../firebase/login/login.js';
import { LuExpand } from 'react-icons/lu';
import { BiExitFullscreen, BiFullscreen } from 'react-icons/bi';
import { FaEllipsisVertical } from 'react-icons/fa6';
import { FiTrash } from 'react-icons/fi';
import { addUserWorkspace, deleteUserWorkspace, validateUserNick } from '../../firebase/users.js';
import Popup from './components/Popup.js';

export default function Workspaces() {

    function deepEqual(obj1, obj2) {
        if (typeof obj1 === "object" && obj1 !== null && typeof obj2 === "object" && obj2 !== null) {
          if (Object.keys(obj1).length !== Object.keys(obj2).length) {
            return false;
          }
      
          for (let key in obj1) {
            if (!obj2.hasOwnProperty(key) || !deepEqual(obj1[key], obj2[key])) {
              return false;
            }
          }
          return true;
        } else {
          return obj1 === obj2;
        }
    }

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
    const [mdPopupEditar, setMdPopupEditar] = useState(false);

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
    const [editInfoWorkspace, setEditInfoWorkspace] = useState({});
    
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

    const handleDeleteWorkspace = async () => {
        try {
            const deletando = await deleteWorkspace({
                uid: uidCookie,
                uuid: infoWorkspace.uid,
            });
            if (deletando) {
                notifySuccess('Workspace excluído com sucesso');
                const list = await getWorkspaces(uidCookie) || [];
                if (list.length > 0) {
                    setCookie('qtdWorkspaces', list.length);
                    setWorkspacesData(list);
                    setMdPopupEditar(false);
                    setInfoWorkspace({});
                    setPageEditWorkspace(false);
                    setPageWorkspaces(true);
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
    const [userEmail, setUserEmail] = useState('');
    const [statusUserNick, setStatusUserNick] = useState(null);
    const handleValidateUserNick = async () => {
        if (inputUserNick.length >= 5) {
            const response = await validateUserNick(inputUserNick);
            if (response.email) {
                setStatusUserNick(true);
                setUserEmail(response.email);
            } else if (response.code === 'nick-invalido') {
                setStatusUserNick(false);
            } else {
                setStatusUserNick(false);
            }
        } else {
            setStatusUserNick(null);
        }
    }
    
    const handleAddUser = async () => {
        try {
            let positionUser = positions.indexOf(positionSelect)+1;
            if (!infoWorkspace.uid || !inputUserNick || positionUser < 1) {
                notifyError('Complete os dados necessários para adicionar um usuário');
                return false;
            }
            if (!statusUserNick) {
                notifyError('Nick do usuário inválido');
                return false;
            }
            const adding = await addUserWorkspace(infoWorkspace, infoWorkspace.uid, inputUserNick, userEmail, positionUser);
            if (adding.users) {
                notifySuccess('Usuário adicionado com sucesso');
                setInfoWorkspace((prev) => ({
                    ...prev,
                    users: adding.users,
                }));
                return true;
            }
        } catch (error) {
            console.log(error);
            return;
        } finally {
            setCarregando(false);
        }
    }

    const handleDeleteUser = async (index, nickUser, emailUser) => {
        try {
            handleMdUsersWorkspace(index);
            if (!infoWorkspace.uid || !nickUser || !emailUser) {
                notifyError('Não encontramos os dados desse usuário, tente novamente mais tarde');
                return false;
            }
            const removing = await deleteUserWorkspace(infoWorkspace.uid, nickUser, emailUser);
            if (removing.users) {
                notifySuccess('Usuário deletado com sucesso');
                setInfoWorkspace((prev) => ({
                    ...prev,
                    users: removing.users,
                }));
                return true;
            }
        } catch (error) {
            console.log(error);
            return;
        } finally {
            setCarregando(false);
        }
    }

    // Input File
    const [inputFile, setInputFile] = useState(false);
    const handleInputFile = (event) => {
        const file = event.target.files[0];
        if (file) {
            setInputFile({
              name: file.name,
              type: file.type,
              fileObject: file,
            });
        }
    }

    const handleEditKeyWorkspace = (key, value) => {
        setEditInfoWorkspace({
            ...editInfoWorkspace,
            [key]: value,
        });
    }

    const handleSaveWorkspace = async () => {
        try {
            const naoEditado = await deepEqual(infoWorkspace, editInfoWorkspace);
            if (naoEditado && !inputFile) {
                notifyError('Nenhuma alteração feita');
                return false;
            }
            const saving = await saveWorkspace(editInfoWorkspace, inputFile.fileObject);
            if (saving.uid) {
                notifySuccess('Mudanças salvas com sucesso');
                setInfoWorkspace(saving);
                return true;
            }
        } catch (error) {
            console.log(error);
            return;
        } finally {
            setCarregando(false);
        }
    }

    const truncateText = (text, maxLength) => {
        if (text && maxLength) {
            return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
        } else {
            return 'Inválido';
        }
    };

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
                                                setEditInfoWorkspace(val);
                                                setPageEditWorkspace(true);
                                                setPageWorkspaces(false);
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    setInfoWorkspace(val);
                                                    setEditInfoWorkspace(val);
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
                                                    <h1>{truncateText(val.nome, 30)}</h1>
                                                    <p>{truncateText(val.descricao, 30)}</p>
                                                    <a>{val.users ? val.users.length-1 : 0} Membro{val.users.length-1 > 1 ? 's' : ''}</a>
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
                            <h1>Novo Workspace</h1>
                            <p>Crie um novo workspace para seu gerenciamento</p>
                            <div className='linha'></div>
                            <div className='input'>
                                <label>Nome do Workspace</label>
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
                                <h1>{truncateText(infoWorkspace.nome, 40)}</h1>
                                <p>{truncateText(infoWorkspace.descricao, 40)}</p>
                            </div>
                            {statusExpanded ? (
                                <BiExitFullscreen onClick={() => handleExpandScreen()} className='expand' />
                            ) : (
                                <BiFullscreen onClick={() => handleExpandScreen()} className='expand' />
                            )}
                            <button onClick={() => setMdPopupEditar(true)}>Editar Workspace</button>
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
                                    <button onClick={handleAddUser}>Adicionar</button>
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
                                                        <button onClick={() => handleDeleteUser(i-1, infoWorkspace.users[i][1], infoWorkspace.users[i][2])} className='deletar'>
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

            {/* Popups */}
            {mdPopupEditar && (
                <Popup handleClose={() => setMdPopupEditar(false)} handleSave={handleSaveWorkspace} handleDelete={handleDeleteWorkspace} title="Editar Workspace">
                    <div className='form'>
                        <div className='file'>
                            <div className='input-file'>
                                <input onChange={handleInputFile} accept='image/*' type='file' />
                                {inputFile ? (
                                    <img className='content' src={URL.createObjectURL(inputFile.fileObject)} />
                                ) : (
                                    <div className='content'>
                                        <p>Arquívo</p>
                                    </div>
                                )}
                            </div>
                            <div className='text'>
                                <h1>
                                    {inputFile ? (
                                        <>Foto de Perfil: {inputFile.name}</>
                                    ) : (
                                        <>Selecione um arquivo</>
                                    )}
                                </h1>
                                <p>
                                    {inputFile ? (
                                        <>{inputFile.type}</>
                                    ) : (
                                        <>Nenhum tipo de arquivo encontrado</>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className='input'>
                            <label>Nome do Workspace</label>
                            <input maxLength={60} onChange={(e) => handleEditKeyWorkspace('nome', e.target.value)} value={editInfoWorkspace.nome} placeholder='ex: Biblioteca Escolar 2024' type='text' />
                        </div>
                        <div className='textarea'>
                            <label>Descrição do Workspace</label>
                            <textarea maxLength={300} onChange={(e) => handleEditKeyWorkspace('descricao', e.target.value)} value={editInfoWorkspace.descricao} placeholder='Adicione sua descrição para o espaço de trabalho'></textarea>
                        </div>
                    </div>
                </Popup>
            )}
        </>
    )
}