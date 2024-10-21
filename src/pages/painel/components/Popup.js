import React, { Children, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './css/Popup.css';
import { IoMdClose } from 'react-icons/io';

export default function Popup({ children, title, handleClose, handleSave, handleAdd, handleSend, handleDelete }) {

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
        <main className='container-popup'>
            <section className='content-popup'>
                <div className='bar'>
                    <h1>{title}</h1>
                    <IoMdClose onClick={handleClose} className="icon" />
                </div>
                <div className='popup'>
                    {children}
                    <div className='btns'>
                        {handleDelete && (
                            <button className='delete' onClick={handleDelete}>Excluir</button>
                        )}
                        {handleSave && (
                            <button className='save' onClick={handleSave}>Salvar</button>
                        )}
                        {handleAdd && (
                            <button className='save' onClick={handleAdd}>Adicionar</button>
                        )}
                        {handleSend && (
                            <button className='save' onClick={handleSend}>Enviar</button>
                        )}
                    </div>
                </div>
            </section>
        </main>
    )
}