import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/Menu.css';

import Logo from '../../../icons/manage.png';
import { GoCheck, GoHome, GoPeople, GoPerson, GoQuestion, GoSignOut } from 'react-icons/go';
import { IoPricetagsOutline, IoSettingsOutline } from 'react-icons/io5';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { MdMonitor, MdWorkspacePremium } from 'react-icons/md';
import { clearCookies, deleteCookie, getCookie, setCookie } from '../../../firebase/cookies';
import { BiSupport } from 'react-icons/bi';
import { FaRegCreditCard } from 'react-icons/fa';

export default function App() {

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

    // Dados
    const uidCookie = getCookie('uid') || '';
    const nickCookie = getCookie('nick') || '';
    const photoCookie = getCookie('photo') || '';
    const emailCookie = getCookie('email') || '';

    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const router = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

    // Modais
    const [mdPerfil, setMdPerfil] = useState(false);

    const sairDaConta = async () => {
        await clearCookies();
        window.location.href = "/";
    }
    

    return (
        <main className="container-menu">
            <section className='content-menu'>
                <img onClick={() => navigate('/')} src={Logo} className='logo' />
                <div className='list'>
                    <li tabIndex={0} onClick={() => navigate('/painel')} className={router === '/painel' && 'selecionado'}>
                        <MdMonitor className='icon' />
                        <p>Painel</p>
                    </li>
                    <li tabIndex={0} onClick={() => navigate('/painel/workspaces')} className={router === '/painel/workspaces' && 'selecionado'}>
                        <MdWorkspacePremium className='icon' />
                        <p>Workspaces</p>
                    </li>
                    <li tabIndex={0} onClick={() => navigate('/painel/times')} className={router === '/painel/times' && 'selecionado'}>
                        <GoPeople className='icon' />
                        <p>Times</p>
                    </li>
                    <li tabIndex={0} onClick={() => navigate('/painel/configuracoes')}>
                        <IoSettingsOutline className='icon' />
                        <p>Configurações</p>
                    </li>

                    <li tabIndex={0} onClick={() => setMdPerfil(!mdPerfil)} className={`profile ${mdPerfil && 'selecionado'}`}>
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
                            <li tabIndex={0} onClick={() => setMdPerfil(false)}>
                                <IoPricetagsOutline className='icon' />
                                <p>Atualizar Plano</p>
                            </li>
                            <div className='linha'></div>
                            <li tabIndex={0} onClick={() => setMdPerfil(false)}>
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
                            }}>
                                <GoSignOut className='icon' />
                                <p>Sair da Conta</p>
                            </li>
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}