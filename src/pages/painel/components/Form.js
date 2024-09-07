import React, { Children, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './css/Form.css';

export default function Form({ children, handleClose, handleCreate }) {

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
        animacoes();
        window.addEventListener('scroll', animacoes);
        return () => {
            window.removeEventListener('scroll', animacoes);
        };
    }, []);

    const navigate = useNavigate();

    return (
        <main className='container-form'>
            <section className='content-form'>
                <div className='form'>
                    {children}
                </div>
                {/* Buttons */}
                <div className='btns'>
                    {handleClose && (
                        <button onClick={() => handleClose()} className='btn-cancel'>Cancelar</button>
                    )}
                    {handleCreate && (
                        <button onClick={handleCreate}  className='btn-create'>Criar Novo Workspace</button>
                    )}
                </div>
            </section>
        </main>
    )
}