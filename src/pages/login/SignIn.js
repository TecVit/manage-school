import React from 'react';
import './css/SignIn.css';

// Icones
import { IoIosCheckmark } from "react-icons/io";
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';

export default function SignIn() {

  const navigate = useNavigate();

  return (
    <main className='container-signin'>
        <section className='content-signin'>
            <div className='form'>
                <h1>Bem-Vindo ao Manage School</h1>
                <p>Entre na sua conta para continuar</p>
                <button className='btn-social-midia'>
                    <FcGoogle className='icon' />
                    Entrar com Google
                </button>
                <div className='or'>
                    <div></div>
                    <p>Ou continue com</p>
                    <div></div>
                </div>
                <div className='input'>
                    <label>Email</label>
                    <input placeholder='Digite seu email' type='text' />
                </div>
                <div className='input'>
                    <label>Senha</label>
                    <input placeholder='Digite sua senha' type='text' />
                </div>
                <button>Entrar</button>
                <a>Não tem conta? <strong onClick={() => navigate('/sign-up')}>Cadastrar</strong></a>
            </div>        
        </section>
    </main>
  )
}
