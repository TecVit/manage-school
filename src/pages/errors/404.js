import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './css/404.css';

export default function Error404() {


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
        document.title = 'Error 404 | Manage School';
        animacoes();
        window.addEventListener('scroll', animacoes);
        return () => {
        window.removeEventListener('scroll', animacoes);
        };
    }, []);

    const navigate = useNavigate();

    return (
    <main className="container-error404">
        <section className='content-error404'>
            <div className='center'>
                <h1 data-animation="top" data-duration-animation="0.7s">404</h1>
                <h2 data-animation="top" data-duration-animation="0.8s">Página não encontrada</h2>
                <p data-animation="top" data-duration-animation="0.9s">O recurso solicitado não foi encontrado neste servidor!</p>
            </div>
        </section>
    </main>
    )
}