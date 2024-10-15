import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/Menu.css';
import * as XLSX from 'xlsx';

import Logo from '../../../../icons/manage.png';
import { GoCheck, GoHome, GoPeople, GoPerson, GoQuestion, GoSignOut } from 'react-icons/go';
import { IoPricetagsOutline, IoSettingsOutline } from 'react-icons/io5';
import { IoIosArrowDown, IoIosArrowUp, IoMdClose } from 'react-icons/io';
import { MdFileUpload, MdMonitor, MdWorkspacePremium } from 'react-icons/md';
import { clearCookies, deleteCookie, getCookie, setCookie } from '../../../../firebase/cookies';
import { BiSupport } from 'react-icons/bi';
import { FaRegCreditCard } from 'react-icons/fa';
import { RxColumns, RxRows } from 'react-icons/rx';
import { NotificationContainer, notifyError } from '../../../../toastifyServer';

export default function App({ handleAddRow, handleAddColumn, handleUpdateData }) {

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
    const mdLimitStorageCookie = getCookie('mdLimitStorage') || false;
    const [mdLimitStorage, setMdLimitStorage] = useState(mdLimitStorageCookie);

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

    // Limits
    const qtdWorkspaces = Number(getCookie('qtdWorkspaces')) || 0;
    var maxQtdWorkspaces = 3;
    var limitStorage = parseInt((qtdWorkspaces / maxQtdWorkspaces) * 100);

    const [inputFile, setInputFile] = useState(null);

    const handleInputFile = async (e) => {
        const arquivo = e.target.files[0];
        setInputFile(arquivo);
        uploadArquivo(arquivo);
    }

    const uploadArquivo = async (file) => {
        
        if (!file) {
            notifyError('Nenhum arquívo encontrado');
            return false;
        }

        const reader = new FileReader();

        reader.onload = async function (e) {
            const arrayBuffer = e.target.result;
            
            const fileType = file.name.split('.').pop().toLowerCase();

            if (fileType === 'xlsx') {
                const list = await processarXLSX(arrayBuffer);
                if (list && list.length > 0) {
                    handleUpdateData(list);
                }
            } else {
                notifyError('Só é aceito arquívos XLSX (Exel)');
                return false;
            }
        };

        reader.readAsArrayBuffer(file);
    }

    const processarXLSX = async (arrayBuffer, banco) => {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const primeiraFolha = workbook.SheetNames[0];
        const dadosJson = XLSX.utils.sheet_to_json(workbook.Sheets[primeiraFolha]);
        
        const res = await arrumarDadosPlanilhas(dadosJson);
        return res;
    };

    /*const arrumarDadosPlanilhas = async (data) => {
        let lista = [];
    
        if (data.length > 0) {
            data.forEach((row) => {
                let obj = {};
                let index = 0;
    
                Object.entries(row).forEach(([key, value]) => {
                    obj[index] = value;
                    index++;
                });
    
                lista.push(obj);
            });
    
            return lista;
        }
    };*/

    const arrumarDadosPlanilhas = async (data) => {
        let lista = [];
        let maxColumns = 0;
    
        // Encontra o número máximo de colunas entre todos os objetos
        data.forEach((row) => {
            const columnCount = Object.keys(row).length;
            if (columnCount > maxColumns) {
                maxColumns = columnCount;
            }
        });
    
        data.forEach((row) => {
            let obj = {};
            let index = 0;
    
            // Preenche os valores de cada coluna
            Object.entries(row).forEach(([key, value]) => {
                obj[index] = value;  // Atribui o valor ao índice correspondente
                index++;
            });
    
            // Adiciona campos que estão faltando
            for (let i = index; i < maxColumns; i++) {
                obj[i] = null;  // Adiciona o valor padrão (aqui estou usando `null`)
            }
    
            lista.push(obj);
        });
    
        console.log(lista);
        return lista;
    };
    
    
    

    return (
        <main className="container-menu-workspace">
            <section className='content-menu'>
                <img onClick={() => navigate('/painel/workspaces')} src={Logo} className='logo' />
                <div className='list'>
                    <li tabIndex={0} onKeyDown={(event) => event.key === "Enter" && handleAddColumn()} onClick={() => handleAddColumn()} className={router === '/painel' && 'selecionado'}>
                        <RxColumns className='icon' />
                    </li>
                    <li tabIndex={0} onKeyDown={(event) => event.key === "Enter" && handleAddRow()} onClick={() => handleAddRow()} className={router === '/painel' && 'selecionado'}>
                        <RxRows className='icon' />
                    </li>
                    <li onChange={(e) => handleInputFile(e)} className={router === '/painel' && 'selecionado'}>
                        <MdFileUpload className='icon' />
                        <input type='file' accept='.xlsx' />
                    </li>
                </div>
            </section>
        </main>
    )
}