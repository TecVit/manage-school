import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Notifications.css';
import { IoMdTrendingDown, IoMdTrendingUp } from 'react-icons/io';
import { auth, firestore } from '../../firebase/login/login';
import { clearCookies, getCookie, setCookie } from '../../firebase/cookies';

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

    useEffect(() => {
        document.title = 'Notificações | Manage School';
        animacoes();
        window.addEventListener('scroll', animacoes);
        return () => {
        window.removeEventListener('scroll', animacoes);
        };
    }, []);
    
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.readAsText(file);
            
            reader.onload = async (e) => {
                const text = e.target.result;
                const parsedItems = await parseMsFile(text);
                console.log(parsedItems);
                setItems(parsedItems);
            };

            reader.onerror = () => {
                console.error('Erro ao ler o arquivo.');
            };
        }
    };

    const parseMsFile = async (text) => {
        const lines = text.split(';').map(line => line.trim()).filter(line => line);
        
        const result = lines.map(line => {
          const values = line.split('|').map(value => value.trim());
          return values;
        });
        
        const json = await transformDataInJson(result);

        return json;
    };

    const transformDataInJson = async (data) => {
        var json = [];
        const formatando = await Promise.all(data.map((arr, i) => {
            if (i !== 0) {
                var obj = {};
                arr.map((value, j) => {
                    var key = String(data[0][j])
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase();
                    obj[key] = value;
                });
                json.push(obj);
            } else {
                var obj = {};
                arr.map((value, j) => {
                    obj[j] = value;
                });
                
                // Adicionar essa linha apenas para olhar os Primeiros Index
                json.push(obj);
            }
        }));
        if (formatando) {
            return json;
        }
    };
    


    

    return (
        <main className="container-notifications">
            <section className='content-notifications'>
                <div className='top'>
                    <h1>Notificações</h1>
                </div>
                <div className='notificacoes'>

                </div>
            </section>
        </main>
    )
}