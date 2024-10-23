import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Notifications.css';
import { IoMdTrendingDown, IoMdTrendingUp } from 'react-icons/io';
import { auth, firestore } from '../../firebase/login/login';
import { clearCookies, getCookie, setCookie } from '../../firebase/cookies';
import { MdOutlineDashboard, MdErrorOutline, MdNotificationAdd, MdNotifications } from 'react-icons/md';

export default function Notifications() {

    // Dados
    const uidCookie = getCookie('uid') || '';
    const nickCookie = getCookie('nick') || '';
    const photoCookie = getCookie('photo') || '';
    const emailCookie = getCookie('email') || '';

    // Limites do usuário
    const [numMaxWorkspaces, setNumMaxWorkspaces] = useState(2);
    const [numMaxTimes, setNumMaxTimes] = useState(2);
    let qtdWorkspaces = Number(getCookie('qtdWorkspaces')) || 0;
    let qtdTimes = Number(getCookie('qtdTimes')) || 0;

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
    }, [uidCookie, emailCookie, nickCookie]);

    
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

    const truncateText = (text, maxLength) => {
        if (text && maxLength) {
            return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
        } else {
            return 'Inválido';
        }
    };

    useEffect(() => {
        document.title = 'Notificações | Manage School';
        animacoes();
        window.addEventListener('scroll', animacoes);
        return () => {
        window.removeEventListener('scroll', animacoes);
        };
    }, []);
    
    const navigate = useNavigate();

    // Modais
    const [carregando, setCarregando] = useState(false);

    // Datas Workspaces
    const [notificationsData, setNotificationsData] = useState([
        {
            tipo: 'workspace',
            foto: 'https://firebasestorage.googleapis.com/v0/b/web-manage-school.appspot.com/o/workspaces%2Ff8f449fc-a246-4730-ab92-d3810996254b%2FTECVIT%20LOGO%20512px.png?alt=media&token=5af8bf2d-faa4-4dad-805b-45aaa587f1c0',
            titulo: `Convite para entrar no workspace "Biblioteca Escolar" de "EscolaLeticia"`,
            descricao: `Olá VitorFreelancer, o usuário "EscolaLeticia" te enviou um convite para fazer parte do workspace chamado "Biblioteca Escolar"`,
        }
    ]);

    const [infoNotification, setInfoNotification] = useState({});


    return (
        <main className="container-notifications">
            <section className='content-notifications'>

                <div className='top'>
                    <h1>Notificações</h1>
                </div>

                <div className='notificacoes'>
                    
                    {carregando ? (
                        Array.from({ length: qtdWorkspaces }, (_, i) => i).map((val, index) => (
                            <div key={index} className='workspace loading'>
                            </div>
                        ))
                    ) : (
                        <>
                            {notificationsData.length > 0 ? (
                                notificationsData.map((val, index) => (
                                    <div tabIndex={0} onClick={() => {
                                        
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            
                                        }
                                    }}
                                    key={index} className='card'>
                                        {val.foto ? (
                                            <img src={val.foto} />
                                        ) : (
                                            <MdOutlineDashboard className='icon' />
                                        )}
                                        <div className='text'>
                                            <h1>{truncateText(val.titulo, 500)}</h1>
                                            <p>{truncateText(val.descricao, 500)}</p>
                                            <div className='btns'>
                                                <button className='accept'>Aceitar Convite</button>
                                                <button className='reject'>Rejeitar Convite</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <h1>
                                    <MdNotifications className='icon' />
                                    Nenhum workspace encontrado
                                </h1>
                            )}
                        </>
                    )}

                </div>

            </section>
        </main>
    )
}