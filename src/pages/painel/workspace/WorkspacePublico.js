import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './css/Workspaces.css';
import { IoIosArrowDown, IoMdTrendingDown, IoMdTrendingUp } from 'react-icons/io';
import { clearCookies, getCookie, setCookie } from '../../../firebase/cookies.js';
import { MdErrorOutline, MdOutlineDashboard, MdOutlineEdit } from 'react-icons/md';
import { createWorkspace, deleteWorkspace, getWorkspaces, getDataWorkspacePublic, saveWorkspace, saveDataWorkspacePublic } from '../../../firebase/workspaces.js';
import { NotificationContainer, notifyError, notifySuccess } from '../../../toastifyServer.js';
import { auth, firestore } from '../../../firebase/login/login.js';
import { LuExpand } from 'react-icons/lu';
import { BiExitFullscreen, BiFullscreen } from 'react-icons/bi';
import { FaEllipsisVertical } from 'react-icons/fa6';
import { FiTrash } from 'react-icons/fi';
import { addUserWorkspace, deleteUserWorkspace, validateUserNick } from '../../../firebase/users.js';


import Modal from '@mui/material/Modal';
import MenuWorkspace from './components/Menu.js';
import { FaRegTrashAlt, FaTrashAlt } from 'react-icons/fa';

export default function Workspaces() {

    // Dados
    const uidCookie = getCookie('uid') || '';
    const nickCookie = getCookie('nick') || '';
    const photoCookie = getCookie('photo') || '';
    const emailCookie = getCookie('email') || '';
    
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
        document.title = 'Workspace Público | Manage School';
        animacoes();
        window.addEventListener('scroll', animacoes);
        return () => {
        window.removeEventListener('scroll', animacoes);
        };
    }, []);

    
    const navigate = useNavigate();
    const params = useParams();
    const idWorkspace = params.id;

    // Modais
    const [carregando, setCarregando] = useState(false);

    // Datas Workspace
    const [infoWorkspace, setInfoWorkspace] = useState({});

    useEffect(() => {
        setCarregando(true);

        const unsubscribe = firestore
            .collection('workspaces')
            .doc(idWorkspace)
            .onSnapshot((workspaceDoc) => {
                setCarregando(true);
                if (workspaceDoc.exists) {
                    const workspaceData = workspaceDoc.data();
                    setInfoWorkspace(workspaceData);

                    if (workspaceData.dados && workspaceData.dados.length > 0 && Object.keys(workspaceData.dados[0]).length > 0) {
                        setDataWorkspace(workspaceData.dados);
                    }
                }
                setCarregando(false);
            }, (error) => {
                console.log(error);
                setCarregando(false);
            });

        return () => unsubscribe();
    }, [uidCookie, idWorkspace]);

    const truncateText = (text, maxLength) => {
        if (text && maxLength) {
            return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
        } else {
            return 'Inválido';
        }
    };

    const [dataWorkspace, setDataWorkspace] = useState([
        {
            "0": "Tarefa",
            "1": "Responsável",
            "2": "Data de Entrega",
            "3": "Status",
            "4": "Progresso (%)",
        },
        {
            "0": "Limpar a casa",
            "1": "Joãozinho",
            "2": "08/03/2009",
            "3": "Pendente",
            "4": "40%",
        }
    ]);

    const handleChange = (e, index, key) => {
        let updateData = [...dataWorkspace];
        updateData[index][key] = e.target.value;
        setDataWorkspace(updateData);
    };

    // Modal Btn Right
    const [modalOpen, setModalOpen] = useState(false);
    const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
    const [rowToDelete, setRowToDelete] = useState(null);

    
    const handleAddColumn = async () => {
        try {
        // Determina o índice da nova coluna como o comprimento das chaves do primeiro objeto
        const nextKey = Object.keys(dataWorkspace[0]).length.toString();
    
        const updatedData = dataWorkspace.map((obj, index) => {
            return { ...obj, [nextKey]: index === 0 ? `Nova Coluna ${Number(nextKey) + 1}` : "" }; // Adiciona a nova coluna
        });
    
        setDataWorkspace(updatedData);
        } catch (error) {
        console.error('Erro ao adicionar coluna:', error);
        }
    };

    const handleAddRow = async () => {
        try {
            const numCols = Object.keys(dataWorkspace[0]).length;

            const newRow = {};
            for (let i = 0; i < numCols; i++) {
                newRow[i] = "";
            }

            const updatedData = [...dataWorkspace, newRow];
            setDataWorkspace(updatedData);
        } catch (error) {
            console.error('Erro ao adicionar linha:', error);
        }
    };

    const deleteColumn = (columnIndex) => {
        try {
          const updatedData = dataWorkspace.map((obj) => {
            const newObj = { ...obj };
            delete newObj[columnIndex];
            return newObj;
          });
    
          // Reorganiza as chaves
          const reorganizedData = updatedData.map((obj) => {
            const newObj = {};
            Object.keys(obj).forEach((key, index) => {
              newObj[index.toString()] = obj[key];
            });
            return newObj;
          });
    
          setDataWorkspace(reorganizedData);
        } catch (error) {
          console.error('Erro ao deletar coluna:', error);
        }
    };

    const deleteRow = () => {
        try {
          const updatedData = dataWorkspace.filter((_, index) => index !== rowToDelete);
          setDataWorkspace(updatedData);
          setModalOpen(false);
        } catch (error) {
          console.error('Erro ao deletar linha:', error);
        }
    };

    const handleContextMenu = (event, index) => {
        event.preventDefault();
        setClickPosition({ x: event.clientX, y: event.clientY });
        setRowToDelete(index);
        setModalOpen(true);
    };

    const handleSaveDataWorkspace = async () => {
        setCarregando(true);
        try {
            const saving = await saveDataWorkspacePublic(idWorkspace, dataWorkspace);
            if (saving) {
                notifySuccess('Alterações salvas com sucesso');
                return true;
            }
            return false;
        } catch (error) {
            console.log(error);
            return false;
        } finally {
            setCarregando(false);
        }
    }
    

    return (
        <>
            <MenuWorkspace handleAddColumn={handleAddColumn} handleAddRow={handleAddRow} />

            <main className="container-workspace">
                <NotificationContainer />
                
                <section className='content-workspace'>
                        
                    {carregando ? (
                        <div className='loader loader-tabela'></div>
                    ) : (
                        <>        
                            <div className='tabela'>
                                {dataWorkspace && dataWorkspace.length > 0 ? (
                                    dataWorkspace.map((obj, i) => (
                                        <div 
                                            className={`linha ${i === 0 && 'primeira'}`} 
                                            key={i}
                                            onContextMenu={(event) => handleContextMenu(event, i)}
                                        >
                                            {Object.keys(obj).map((key, j) => (
                                                <div className='coluna' key={j}>
                                                    <input
                                                        type="text"
                                                        value={obj[key]}
                                                        onChange={(e) => handleChange(e, i, key)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                ) : (
                                    <h1>Nenhum dado encontrado</h1>
                                )}

                                {dataWorkspace && dataWorkspace.length > 0 && (
                                    <div className='linha'>
                                        {Object.keys(dataWorkspace[0]).map((_, index) => (
                                            <div className='coluna' key={index}>
                                                <FaTrashAlt
                                                    className='excluir'
                                                    onClick={() => deleteColumn(index)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                            </div>

                            <div className='btns-tabela'>
                                <button onClick={handleSaveDataWorkspace}>Salvar Alterações</button>
                            </div>
                        
                        </>
                    )}
                    
                </section>

                {/* Modal de confirmação para deletar linha */}
                <Modal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <div 
                        className='modal-mouse'
                        style={{
                            position: 'absolute',
                            top: clickPosition.y,
                            left: clickPosition.x,
                        }}
                    >
                        <button className='excluir' onClick={deleteRow}>
                            <FaTrashAlt className='icon' />
                            <p>Deletar Linha</p>
                        </button>
                        <button onClick={() => setModalOpen(false)}>
                            <p>Cancelar</p>
                        </button>
                    </div>
                </Modal>

            </main>

        </>
    )
}