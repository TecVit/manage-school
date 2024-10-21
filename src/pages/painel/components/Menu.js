import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/Menu.css';

import Logo from '../../../icons/manage.png';
import { v4 as uuidv4 } from 'uuid';
import { GoCheck, GoHome, GoPeople, GoPerson, GoQuestion, GoSignOut } from 'react-icons/go';
import { IoNotificationsOutline, IoPricetagsOutline, IoSettingsOutline } from 'react-icons/io5';
import { IoIosArrowDown, IoIosArrowUp, IoMdClose } from 'react-icons/io';
import { MdMonitor, MdWorkspacePremium } from 'react-icons/md';
import { clearCookies, deleteCookie, getCookie, setCookie } from '../../../firebase/cookies';
import { auth, firestore, firebase } from '../../../firebase/login/login';
import { BiSupport } from 'react-icons/bi';
import { FaRegCreditCard } from 'react-icons/fa';
import { notifySuccess, notifyError, NotificationContainer } from '../../../toastifyServer';
import Popup from './Popup';

export default function App() {

    // Dados
    const uidCookie = getCookie('uid') || '';
    const nickCookie = getCookie('nick') || '';
    const photoCookie = getCookie('photo') || '';
    const emailCookie = getCookie('email') || '';
    const mdLimitStorageCookie = getCookie('mdLimitStorage') || false;
    const [mdLimitStorage, setMdLimitStorage] = useState(mdLimitStorageCookie);


    // Limites do usuário
    const [numMaxWorkspaces, setNumMaxWorkspaces] = useState(2);
    const [numMaxTimes, setNumMaxTimes] = useState(2);
    let qtdTimes = Number(getCookie('qtdTimes')) || 0;

    // Limits
    const qtdWorkspaces = Number(getCookie('qtdWorkspaces')) || 0;
    var limitStorage = parseInt((qtdWorkspaces / numMaxWorkspaces) * 100);

    var percentageWorkspaces = parseInt(parseFloat(qtdWorkspaces / numMaxWorkspaces) * 100);
    var percentageTimes = parseInt(parseFloat(qtdTimes / numMaxTimes) * 100);
    
    const checkLimitUser = async (user) => {
        if (user) {
            try {
                const token = await user.getIdToken(true);
                const decodedToken = await auth.currentUser.getIdTokenResult();
                
                if (decodedToken.claims.plan === 'premium') {
                    return 10;
                } else if (decodedToken.claims.plan === 'custom') {
                    return decodedToken.claims.planLimit;
                } else {
                    return 2;
                }
                
            } catch (error) {
                return false;
            }
        }
    };

    useEffect(() => {
        if (uidCookie && emailCookie && nickCookie) {
            const unsubscribe = auth.onAuthStateChanged(async function(user) {
                if (!user) {
                    await clearCookies();
                    localStorage.clear();
                    window.location.href = "/entrar";
                } else {
                    if (emailCookie !== user.email || uidCookie !== user.uid || nickCookie !== user.displayName) {
                        await clearCookies();
                        localStorage.clear();
                        window.location.href = "/entrar";
                    } else {
                        const limit = await checkLimitUser(user);
                        if (limit > 2) {
                            setMdLimitStorage(true);
                        }

                        if (!limit) {
                            await clearCookies();
                            localStorage.clear();
                            window.location.href = "/entrar";
                        }

                        setNumMaxWorkspaces(limit);
                        setNumMaxTimes(limit);
                    }
                }
            });

            return () => unsubscribe();
        }
    }, [uidCookie, emailCookie, nickCookie]);

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

    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const router = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

    // Modais
    const [carregando, setCarregando] = useState(false);
    const [mdPerfil, setMdPerfil] = useState(false);
    const [mdEditarPerfil, setMdEditarPerfil] = useState(false);
    const [mdAjuda, setMdAjuda] = useState(false);

    // Suporte
    const [mdSuporte, setMdSuporte] = useState(false);
    const [dataSuporte, setDataSuporte] = useState({});

    const handleSendSupporte = async () => {
        setCarregando(true);
        try {
            var uuid = uuidv4();
            const dataAtual = new Date().toLocaleDateString('pt-BR');
            
            if (!('motivo' in dataSuporte) || !('mensagem' in dataSuporte)) {
                notifyError('Complete o formulário corretamente');
                return false;
            }
            
            await firestore.collection('support')
            .doc(uuid).set({
                ...dataSuporte,
                data: dataAtual,
                date: firebase.firestore.FieldValue.serverTimestamp(),
            });
            
            setDataSuporte({});
            notifySuccess('Mensagem enviada com sucesso');
            return true;
        } catch (error) {
            console.log(error);
            return false;
        } finally {
            setCarregando(false);
        }
    }

    const sairDaConta = async () => {
        await clearCookies();
        window.location.href = "/";
    }

    const faqs = [
        {
          pergunta: "O que é o Manage School?",
          resposta: "Manage School é uma plataforma de gerenciamento de dados que permite aos usuários organizar, formatar e analisar dados de maneira eficiente. Com uma interface intuitiva, você pode importar, editar e exportar seus dados com facilidade."
        },
        {
          pergunta: "Como posso me inscrever no Manage School?",
          resposta: `Para se inscrever, basta visitar nosso site e clicar em <strong> "Começar" </strong>. Preencha o formulário com suas informações e siga as instruções para criar sua conta.`
        },
        {
          pergunta: "Quais tipos de dados posso gerenciar com o Manage School?",
          resposta: "Você pode gerenciar diversos tipos de dados, incluindo planilhas, arquivos MSF (Manage School File), CSV, XLSX, JSON e muito mais. Nossa plataforma suporta a importação e exportação de múltiplos formatos."
        },
        {
          pergunta: "O Manage School oferece ferramentas de formatação de dados?",
          resposta: "Sim! Nossa plataforma inclui ferramentas para formatação de dados, como limpeza, normalização, conversão de tipos de dados, e a aplicação de regras específicas para garantir a consistência e qualidade dos dados."
        },
        {
          pergunta: "Existe um período de teste gratuito?",
          resposta: `Sim, oferecemos um período de teste gratuito de 7 dias para o plano <strong> "Premium" </strong>. Durante este período, você pode explorar todas as funcionalidades do nosso SaaS sem compromissos.`
        },
        {
          pergunta: "Como posso entrar em contato com o suporte?",
          resposta: "Você pode entrar em contato com nossa equipe de suporte através do e-mail <strong> support@manageschool.tech </strong>, enviando uma mensagem ao Whatsapp <strong> +55 (16) 997569308 </strong> ou pelo formulário de suporte disponível em nosso site durante o horário comercial."
        },
        {
          pergunta: "O Manage School é seguro?",
          resposta: `Sim, levamos a segurança a sério. Utilizamos criptografia de ponta a ponta para proteger seus dados e estamos em conformidade com os principais regulamentos de proteção de dados <strong> "LGPD" </strong>.`
        },
        {
          pergunta: "Como posso cancelar minha assinatura?",
          resposta: "Para cancelar sua assinatura, acesse sua conta, vá até a seção de 'Configurações' e clique em 'Cancelar Assinatura'. Você também pode entrar em contato com o suporte para assistência."
        },
        {
          pergunta: "Posso importar dados de outras plataformas?",
          resposta: "Sim, nossa plataforma suporta a importação de dados de várias fontes, incluindo Excel, Google Sheets, e bancos de dados JSON (MongoDB, Firebase Database). Verifique nossa documentação para saber mais sobre os formatos suportados."
        },
        {
          pergunta: "Onde posso encontrar tutoriais ou guias de uso?",
          resposta: "Oferecemos uma ampla gama de tutoriais e guias em nosso centro de ajuda. Visite a seção 'Recursos' em nosso site para acessar vídeos, artigos e documentação detalhada."
        }
    ];
    
    // Input Perfil
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

    return (
        <>
            <NotificationContainer />
            <main className="container-menu">
                <section className='content-menu'>
                    <img onClick={() => navigate('/')} src={Logo} className='logo' />
                    <div className='list'>
                        <li tabIndex={0} onKeyDown={(event) => event.key === "Enter" && navigate('/painel')} onClick={() => navigate('/painel')} className={router === '/painel' && 'selecionado'}>
                            <MdMonitor className='icon' />
                            <p>Painel</p>
                        </li>
                        <li tabIndex={0} onKeyDown={(event) => event.key === "Enter" && navigate('/painel/workspaces')} onClick={() => navigate('/painel/workspaces')} className={router === '/painel/workspaces' && 'selecionado'}>
                            <MdWorkspacePremium className='icon' />
                            <p>Workspaces</p>
                        </li>
                        <li tabIndex={0} onKeyDown={(event) => event.key === "Enter" && navigate('/painel/notificacoes')} onClick={() => navigate('/painel/notificacoes')} className={router === '/painel/notificacoes' && 'selecionado'}>
                            <IoNotificationsOutline className='icon' />
                            <p>Notificações</p>
                        </li>
                        <li tabIndex={0} onKeyDown={(event) => event.key === "Enter" && navigate('/painel/times')} onClick={() => navigate('/painel/times')} className={router === '/painel/times' && 'selecionado'}>
                            <GoPeople className='icon' />
                            <p>Times</p>
                        </li>
                        <li tabIndex={0} onKeyDown={(event) => event.key === "Enter" && navigate('/painel/configuracoes')} onClick={() => navigate('/painel/configuracoes')}>
                            <IoSettingsOutline className='icon' />
                            <p>Configurações</p>
                        </li>
                        

                        {!mdLimitStorage && (
                            <div className='limit-storage'>
                                <h1>
                                    Armazenamento
                                    <IoMdClose onClick={() => {
                                        setMdLimitStorage(true)
                                        setCookie('mdLimitStorage', true);
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            setMdLimitStorage(true); 
                                            setCookie('mdLimitStorage', true);
                                        }
                                    }}
                                    tabIndex={0} className='icon' />
                                </h1>
                                <p>Atualize seu plano para obter mais espaço livre</p>
                                <div className='progress-bar'>
                                    <div style={{
                                        width: `${Math.max(5, limitStorage)}%`,
                                    }} className={`progress ${limitStorage >= 80 ? 'red' : limitStorage >= 60 ? 'orange' : 'green'}`}></div>
                                </div>
                                <button onClick={() => window.location.href = "/#planos"}>Atualizar plano</button>
                            </div>
                        )}

                        {/* Perfil do Usúario */}
                        <li tabIndex={0} onKeyDown={(event) => event.key === "Enter" && setMdPerfil(!mdPerfil)} onClick={() => setMdPerfil(!mdPerfil)} className={`profile ${mdPerfil && 'selecionado'}`}>
                            {photoCookie ? (
                                <img src={photoCookie} />
                            ) : (
                                <GoPerson className='icon' />
                            )}
                            <p>{nickCookie ? nickCookie.slice(0, 20) : 'Perfil'} {nickCookie.length >= 20 ? '..' : ''}</p>
                            {mdPerfil ? (
                                <IoIosArrowDown className='seta' />
                            ) : (
                                <IoIosArrowUp className='seta' />
                            )}
                        </li>

                        {mdPerfil && (
                            <div className='md-perfil'>
                                <li tabIndex={0} onClick={() => {
                                    setMdPerfil(false);
                                    setMdEditarPerfil(true);
                                }}>
                                    {photoCookie ? (
                                        <img src={photoCookie} />
                                    ) : (
                                        <GoPerson className='icon' />
                                    )}
                                    <p>{nickCookie ? nickCookie.slice(0, 20) : 'Perfil'} {nickCookie.length >= 20 ? '..' : ''}</p>
                                    <GoCheck className='seta' />
                                </li>
                                <div className='linha'></div>
                                <li onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        window.location.href = "/#planos";
                                    }
                                }} onClick={() => window.location.href = "/#planos"} tabIndex={0}>
                                    <IoPricetagsOutline className='icon' />
                                    <p>Atualizar Plano</p>
                                </li>
                                <div className='linha'></div>
                                <li tabIndex={0} onClick={() => {
                                    setMdPerfil(false);
                                    setMdAjuda(true);
                                }}>
                                    <GoQuestion className='icon' />
                                    <p>Ajuda</p>
                                </li>
                                <li tabIndex={0} onClick={() => {
                                    setMdPerfil(false);
                                    setMdSuporte(true);
                                }}>
                                    <BiSupport className='icon' />
                                    <p>Suporte</p>
                                </li>
                                <div className='linha'></div>
                                <li tabIndex={0} onClick={() => {
                                    setMdPerfil(false);
                                    sairDaConta();
                                }} onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        setMdPerfil(false);
                                        sairDaConta();
                                    }
                                }}>
                                    <GoSignOut className='icon' />
                                    <p>Sair da Conta</p>
                                </li>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        
            {/* Popups */}
            {mdAjuda && (
                <Popup handleClose={() => setMdAjuda(false)} title="Precisando de Ajuda?">
                    <div className='form'>
                        <ul className='faq'>
                            {faqs.map((val, i) => (
                                <li>
                                    <h1>
                                        <div className='number'>
                                            <p>{i + 1}</p>
                                        </div> 
                                        {val.pergunta}
                                    </h1>
                                    <div className='desc' dangerouslySetInnerHTML={{ __html: val.resposta }} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </Popup>
            )}

            {mdEditarPerfil && (
                <Popup handleClose={() => setMdEditarPerfil(false)} handleSave={() => notifySuccess('Em Breve...')} title="Editar Perfil">
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
                            <label>Nome do Usuário</label>
                            <input maxLength={60} value={nickCookie} disabled placeholder='ex: Biblioteca Escolar 2024' type='text' />
                        </div>

                    </div>
                </Popup>
            )}

            {/* Suporte */}
            {mdSuporte && (
                <Popup handleClose={() => setMdSuporte(false)} handleSend={() => {
                    handleSendSupporte(); 
                    setMdSuporte();
                }} title="Entre em contato com o suporte">
                    <div className='form'>
                        <div className='input'>
                            <label>Motivo do contato</label>
                            <input value={dataSuporte['motivo']} onChange={(e) => setDataSuporte((prev) => ({
                                ...prev,
                                motivo: e.target.value
                            }))} maxLength={75} placeholder='ex: Preciso de ajuda com o pagamento' type='text' />
                        </div>

                        <div className='textarea'>
                            <label>Mensagem</label>
                            <textarea value={dataSuporte['mensagem']} onChange={(e) => setDataSuporte((prev) => ({
                                ...prev,
                                mensagem: e.target.value
                            }))} maxLength={500} placeholder='ex: Necessito do passo a passo de como realizar o pagamento de forma correta'></textarea>
                        </div>
                    </div>
                </Popup>
            )}

        </>
    )
}