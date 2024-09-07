import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Workspaces.css';
import { IoMdTrendingDown, IoMdTrendingUp } from 'react-icons/io';
import { getCookie, setCookie } from '../../firebase/cookies';
import { GoPerson } from 'react-icons/go';
import { MdOutlineDashboard } from 'react-icons/md';
import { IoAdd } from 'react-icons/io5';
import Popup from './components/Form';
import Form from './components/Form';
import { createWorkspace, getWorkspaces } from '../../firebase/workspaces.js';
import { NotificationContainer, notifyError, notifySuccess } from '../../toastifyServer';

export default function Workspaces() {

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

    // Dados
    const uidCookie = getCookie('uid') || '';
    const nickCookie = getCookie('nick') || '';
    const photoCookie = getCookie('photo') || '';
    const emailCookie = getCookie('email') || '';
    const qtdWorkspaces = Number(getCookie('qtdWorkspaces')) || 0;

    const navigate = useNavigate();

    // Modais
    const [carregando, setCarregando] = useState(false);
    const [mdPopup, setMdPopup] = useState(true);

    // Inputs
    const [inputNomeWorkspace, setInputNomeWorkspace] = useState('');
    const [inputDescricaoWorkspace, setInputDescricaoWorkspace] = useState('');
    const [inputStatusWorkspace, setInputStatusWorkspace] = useState(0);
    const [inputFotoWorkspace, setInputFotoWorkspace] = useState(null);


    // Form - Checkboxs
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

    const [workspacesData, setWorkspacesData] = useState([]);
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
            if (!inputNomeWorkspace || !inputDescricaoWorkspace || !inputStatusWorkspace) {
                notifyError('Complete o formulário corretamente');
                return false;
            }
            const criando = await createWorkspace({
                nome: inputNomeWorkspace,
                descricao: inputDescricaoWorkspace,
                status: inputStatusWorkspace,
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


    return (
        <>
            <main className="container-workspaces">
                <NotificationContainer />
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
                                        <div key={index} className='workspace'>
                                            {val.foto ? (
                                                <img src={val.foto} />
                                            ) : (
                                                <MdOutlineDashboard className='icon' />
                                            )}
                                            <div className='text'>
                                                <h2>{val.data}</h2>
                                                <h1>{val.nome}</h1>
                                                <p>{val.descricao}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <h1>Nenhum workspace encontrado</h1>
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
                            <div tabIndex={0} onKeyDown={(event) => {event.key === "Enter" && handleCreateWorkspaceCheckbox(0); setInputStatusWorkspace(1)}} onClick={() => handleCreateWorkspaceCheckbox(0)} className={`input-checkbox ${createWorkspaceCheckbox[0] && 'selecionado'}`}></div>
                            <div className='text'>
                                <h1>Privado</h1>
                                <p>Por ser um espaço de trabalho privado, somente administradores podem edita-lo</p>
                            </div>
                        </div>
                        <div className='checkbox'>
                            <div tabIndex={0} onKeyDown={(event) => {event.key === "Enter" && handleCreateWorkspaceCheckbox(1); setInputStatusWorkspace(1)}} onClick={() => handleCreateWorkspaceCheckbox(1)} className={`input-checkbox ${createWorkspaceCheckbox[1] && 'selecionado'}`}></div>
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
            </main>
        </>
    )
}