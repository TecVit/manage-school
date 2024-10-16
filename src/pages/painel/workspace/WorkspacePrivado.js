import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './css/Workspaces.css';
import { IoIosArrowDown, IoMdTrendingDown, IoMdTrendingUp } from 'react-icons/io';
import { clearCookies, getCookie, setCookie } from '../../../firebase/cookies.js';
import { MdErrorOutline, MdOutlineDashboard, MdOutlineEdit } from 'react-icons/md';
import { createWorkspace, deleteWorkspace, getWorkspaces, getDataWorkspacePrivate, saveWorkspace, saveDataWorkspacePrivate } from '../../../firebase/workspaces.js';
import { NotificationContainer, notifyError, notifySuccess } from '../../../toastifyServer.js';
import { auth, firestore } from '../../../firebase/login/login.js';
import { LuExpand } from 'react-icons/lu';
import { BiExitFullscreen, BiFullscreen } from 'react-icons/bi';
import { FaArrowLeft, FaArrowRight, FaEllipsisVertical } from 'react-icons/fa6';
import { FiTrash } from 'react-icons/fi';
import { addUserWorkspace, deleteUserWorkspace, validateUserNick } from '../../../firebase/users.js';


import Modal from '@mui/material/Modal';
import MenuWorkspace from './components/Menu.js';
import { FaRegTrashAlt, FaTrashAlt } from 'react-icons/fa';
import { updateDoc } from 'firebase/firestore';

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
        document.title = 'Workspace Privado | Manage School';
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
            .collection('private-users')
            .doc(uidCookie)
            .collection('workspaces')
            .doc(idWorkspace)
            .onSnapshot((workspaceDoc) => {
                setCarregando(true);
                if (workspaceDoc.exists) {
                    const workspaceData = workspaceDoc.data();
                    setInfoWorkspace(workspaceData);

                    if (workspaceData.dados && Object.keys(workspaceData.dados).length > 0 && Object.keys(workspaceData.dados[Object.keys(workspaceData.dados)[0]][0]).length > 0) {
                        const sortedData = {};
                        Object.keys(workspaceData.dados).sort().forEach(key => {
                            sortedData[key] = workspaceData.dados[key];
                        });

                        setDataWorkspace(sortedData);
                        setCurrentTableIndex(Object.keys(sortedData)[0]);
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

    const [dataWorkspace, setDataWorkspace] = useState({});
    
    const [currentTableIndex, setCurrentTableIndex] = useState(Object.keys(dataWorkspace)[0]);

    const changeTable = (direction) => {
        setCurrentTableIndex((prevKey) => {
            const keys = Object.keys(dataWorkspace);
            const currentIndex = keys.indexOf(prevKey);
    
            let newIndex;
            
            if (direction === 'next') {
                newIndex = currentIndex < keys.length - 1 ? currentIndex + 1 : currentIndex;
            } else if (direction === 'prev') {
                newIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
            }
    
            return keys[newIndex];
        });
    };

    const handleChange = (e, index, key) => {
        let updateData = [...dataWorkspace[currentTableIndex]];
        updateData[index][key] = e.target.value;
        setDataWorkspace({ ...dataWorkspace, [currentTableIndex]: updateData });
    };

    // Modal Btn Right
    const [modalOpen, setModalOpen] = useState(false);
    const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
    const [rowToDelete, setRowToDelete] = useState(null);

    
    const handleAddColumn = async () => {
        try {
            const currentTable = dataWorkspace[currentTableIndex];
            const nextKey = Object.keys(currentTable[0]).length.toString();
            const updatedTable = currentTable.map((row, rowIndex) => {
                return { 
                    ...row, 
                    [nextKey]: rowIndex === 0 ? `Nova Coluna ${Number(nextKey) + 1}` : ""
                };
            });
            setDataWorkspace({ 
                ...dataWorkspace, 
                [currentTableIndex]: updatedTable 
            });
        } catch (error) {
            console.error('Erro ao adicionar coluna:', error);
        }
    };

    const handleAddRow = async () => {
        try {
            const currentTable = dataWorkspace[currentTableIndex];
            const numCols = Object.keys(currentTable[0]).length;
            const newRow = {};
            for (let i = 0; i < numCols; i++) {
                newRow[i] = ""; 
            }
            const updatedTable = [...currentTable, newRow];
            setDataWorkspace({
                ...dataWorkspace,
                [currentTableIndex]: updatedTable
            });
        } catch (error) {
            console.error('Erro ao adicionar linha:', error);
        }
    };

    const deleteColumn = (columnIndex) => {
        try {
            if (!dataWorkspace[currentTableIndex]) {
                console.error("Tabela não encontrada.");
                return;
            }
    
            const rearrangeColumns = (data) => {
                return data.map((row) => {
                    const rearrangedRow = {};
                    let index = 0;
    
                    Object.keys(row).forEach((key) => {
                        rearrangedRow[index] = row[key];
                        index++;
                    });
    
                    return rearrangedRow;
                });
            };
    
            let organizedData = rearrangeColumns(dataWorkspace[currentTableIndex]);
    
            const updatedData = organizedData.map((row) => {
                const newRow = { ...row };
                delete newRow[columnIndex];
                return newRow;
            });
    
            const rearrangedData = rearrangeColumns(updatedData);
    
            setDataWorkspace((prevData) => ({
                ...prevData,
                [currentTableIndex]: rearrangedData
            }));
    
            setDataWorkspace({ ...dataWorkspace, [currentTableIndex]: updatedData });
    
            console.log(`Coluna ${columnIndex} removida com sucesso`);
        } catch (error) {
            console.error("Erro ao deletar coluna:", error);
        }
    };

    const deleteRow = () => {
        try {
            const currentTable = dataWorkspace[currentTableIndex];
            const updatedTable = currentTable.filter((_, index) => index !== rowToDelete);
            setDataWorkspace({
                ...dataWorkspace,
                [currentTableIndex]: updatedTable
            });
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
            const saving = await saveDataWorkspacePrivate(uidCookie, idWorkspace, dataWorkspace);
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
    
    const handleUpdateData = (list) => {
        setCarregando(true);
        try {
            setDataWorkspace(prevData => {
                const updatedData = { ...prevData };
            
                if (updatedData[currentTableIndex]) {
                    updatedData[currentTableIndex] = [...updatedData[currentTableIndex], ...list];
                } else {
                    console.error(`Tabela no índice ${currentTableIndex} não encontrada.`);
                }
            
                return updatedData;
            });

            notifySuccess('Dados adicionados com sucesso');
            return true;
        } catch (error) {
            console.log(error);
            return false;
        } finally {
            setCarregando(false);
        }
    }

    const getTableNameByIndex = (dataWorkspace, index) => {
        const keys = Object.keys(dataWorkspace);
        if (index >= 0 && index < keys.length) {
            return keys[index];
        } else {
            console.error('Índice fora do intervalo.');
            return null;
        }
    };

    const handleAddTable = async (name, type) => {
        setCarregando(true);
        try {
            setDataWorkspace((prevData) => {
                const updateWorkspace = { ...prevData };
                updateWorkspace[name] = type;
                return updateWorkspace;
            })
            setCurrentTableIndex(name);
        } catch (error) {
            console.log(error);
            return false;
        } finally {
            setCarregando(false);
        }
    }

    const handleDeleteTable = async () => {
        setCarregando(true);
        try {
            const tableKeys = Object.keys(dataWorkspace);
            
            if (tableKeys.length === 0 || currentTableIndex === null) return;
    
            let lastIndex = currentTableIndex;
    
            let updatedDataWorkspace = { ...dataWorkspace };
            
            delete updatedDataWorkspace[lastIndex];
    
            const newTableKeys = Object.keys(updatedDataWorkspace);
    
            if (newTableKeys.length === 0) {
                setCurrentTableIndex(null);
            } else {
                let nextIndex = tableKeys.findIndex(key => key === lastIndex);
    
                if (nextIndex >= newTableKeys.length - 1) {
                    setCurrentTableIndex(newTableKeys[nextIndex - 1]);
                } else {
                    setCurrentTableIndex(newTableKeys[nextIndex]);
                }
            }
    
            const res = await saveDataWorkspacePrivate(uidCookie, idWorkspace, updatedDataWorkspace);
            
            if (res) {
                notifySuccess(`${lastIndex} excluída com sucesso`);
                setDataWorkspace(updatedDataWorkspace);
                return true;
            }
    
            return false;
        } catch (error) {
            console.log('Erro ao excluir a tabela:', error);
            return false;
        } finally {
            setCarregando(false);
        }
    };
    

    return (
        <>
            <NotificationContainer />

            <MenuWorkspace handleAddColumn={handleAddColumn} handleAddRow={handleAddRow} handleUpdateData={handleUpdateData} handleAddTable={handleAddTable} />

            <main className="container-workspace">
                <section className='content-workspace'>

                    {dataWorkspace && dataWorkspace[currentTableIndex] ? (
                        <>
                            <div className='tabela'>
                                {dataWorkspace[currentTableIndex].map((obj, i) => (
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
                                ))}

                                <div className='linha'>
                                    {Object.keys(dataWorkspace[currentTableIndex][0]).map((_, index) => (
                                        <div className='coluna' key={index}>
                                            <FaTrashAlt
                                                className='excluir'
                                                onClick={() => deleteColumn(index)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className='btns-tabela'>
                                <button onClick={handleSaveDataWorkspace}>Salvar Alterações</button>
                                <button className='excluir' onClick={handleDeleteTable}>Excluir Tabela Atual</button>
                                <div className='navigation'>
                                    <p>{currentTableIndex}</p>
                                    {currentTableIndex !== Object.keys(dataWorkspace)[0] && (
                                        <FaArrowLeft onClick={() => changeTable('prev')} className='icon' />
                                    )}
                                    {currentTableIndex !== Object.keys(dataWorkspace)[Object.keys(dataWorkspace).length - 1] && (
                                        <FaArrowRight onClick={() => changeTable('next')} className='icon' />
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <h1>Nenhuma tabela disponível</h1>
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