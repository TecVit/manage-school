import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/Menu.css';

import Logo from '../../../icons/manage.png';
import { GoCheck, GoHome, GoPeople, GoPerson, GoQuestion, GoSignOut } from 'react-icons/go';
import { IoNotificationsOutline, IoPricetagsOutline, IoSettingsOutline } from 'react-icons/io5';
import { IoIosArrowDown, IoIosArrowUp, IoMdClose } from 'react-icons/io';
import { MdMonitor, MdWorkspacePremium } from 'react-icons/md';
import { clearCookies, deleteCookie, getCookie, setCookie } from '../../../firebase/cookies';
import { auth, firestore } from '../../../firebase/login/login';
import { BiSupport } from 'react-icons/bi';
import { FaRegCreditCard } from 'react-icons/fa';
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
    const [numMaxWorkspaces, setNumMaxWorkspaces] = useState(3);
    const [numMaxTimes, setNumMaxTimes] = useState(3);
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
                    return 3;
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
                        if (limit > 3) {
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
    const [mdPerfil, setMdPerfil] = useState(false);
    const [mdAjuda, setMdAjuda] = useState(false);

    const sairDaConta = async () => {
        await clearCookies();
        window.location.href = "/";
    }

    

    return (
        <>
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
                        <li tabIndex={0} onKeyDown={(event) => event.key === "Enter" && navigate('/painel/configuracoes')} onClick={() => navigate('/painel/configuracoes')}>
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
                                <li tabIndex={0} onClick={() => setMdPerfil(false)}>
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
                                <li tabIndex={0} onClick={() => setMdPerfil(false)}>
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
                        <h1>Em construção</h1>
                    </div>
                </Popup>
            )}
        </>
    )
}