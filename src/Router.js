import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Components
import Menu from './pages/painel/components/Menu';

// Pages
import Landing from './pages/Landing';
import SignIn from './pages/login/SignIn';
import SignUp from './pages/login/SignUp';

import JoinRoom from './pages/painel/JoinRoom';
import Painel from './pages/painel/Painel';
import Workspaces from './pages/painel/Workspaces';

// Erros
import Error404 from './pages/errors/404';

// Toastify
import { notifySuccess, notifyError, NotificationContainer } from './toastifyServer';
import 'react-toastify/dist/ReactToastify.css';
import './css/customToastify.css';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from './firebase/login/login';
import { clearCookies, deleteCookie, getCookie, setCookie } from './firebase/cookies';


const RouterApp = () => {

  // Dados
  const uidCookie = getCookie('uid') || '';
  const nickCookie = getCookie('nick') || '';
  const emailCookie = getCookie('email') || '';
  
  if (uidCookie && emailCookie && nickCookie) {
    auth.onAuthStateChanged( async function(user) {
      if (!user) {
        await clearCookies();
        localStorage.clear();
        window.location.href = "/entrar";
      } else {
        if (emailCookie !== user.email || uidCookie !== user.uid || nickCookie !== user.displayName) {
          await clearCookies();
          localStorage.clear();
          window.location.href = "/entrar";
        }
      }
    });
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/entrar" element={<SignIn />} />
        <Route path="/cadastrar" element={<SignUp />} />

        <Route path="/sala/:uid" element={<JoinRoom />} />
        
        <Route path="/painel/*" element={
          <>
            <Menu />
            <div className='painel'>
              <Routes>
                <Route path="/" element={<Painel />} />
                <Route path="/workspaces" element={<Workspaces />} />
                <Route path="/*" element={<Error404 painel={true} />} />
              </Routes>
            </div>
          </>
        } />
        
        <Route path="/*" element={<Error404 />} />
      </Routes>
    </Router>
  );

}

export default RouterApp;