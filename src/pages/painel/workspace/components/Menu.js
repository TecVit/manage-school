import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/Menu.css';
import * as XLSX from 'xlsx';

import Logo from '../../../../icons/manage.png';
import { GoCheck, GoHome, GoPeople, GoPerson, GoQuestion, GoSignOut } from 'react-icons/go';
import { IoPricetagsOutline, IoSettingsOutline } from 'react-icons/io5';
import { IoIosArrowDown, IoIosArrowUp, IoMdAdd, IoMdClose } from 'react-icons/io';
import { MdFileUpload, MdMonitor, MdWorkspacePremium } from 'react-icons/md';
import { clearCookies, deleteCookie, getCookie, setCookie } from '../../../../firebase/cookies';
import { BiSupport } from 'react-icons/bi';
import { FaRegCreditCard } from 'react-icons/fa';
import { RxColumns, RxRows } from 'react-icons/rx';
import { NotificationContainer, notifyError } from '../../../../toastifyServer';
import Popup from '../../components/Popup';

export default function App({ handleAddRow, handleAddColumn, handleUpdateData, handleAddTable }) {

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

    const arrumarDadosPlanilhas = async (data) => {
        let lista = [];
        let maxColumns = 0;
    
        data.forEach((row) => {
            const columnCount = Object.keys(row).length;
            if (columnCount > maxColumns) {
                maxColumns = columnCount;
            }
        });
    
        data.forEach((row) => {
            let obj = {};
            let index = 0;
    
            Object.entries(row).forEach(([key, value]) => {
                obj[index] = value;
                index++;
            });
    
            for (let i = index; i < maxColumns; i++) {
                obj[i] = null;
            }
    
            lista.push(obj);
        });
    
        console.log(lista);
        return lista;
    };
    
    // Popups
    const [mdPopupAddTabela, setMdPopupAddTabela] = useState(false); 
    
    const [nameTable, setNameTable] = useState('');
    const [typeTable, setTypeTable] = useState('');

    const tiposTabela = {
        "Biblioteca": [
            { "0": "Nome do Livro", "1": "Autor", "2": "Data de Coleta", "3": "Data de Entrega", "4": "Status" },
            { "0": "O Senhor dos Anéis", "1": "J.R.R. Tolkien", "2": "01/09/2024", "3": "30/09/2024", "4": "Emprestado" },
            { "0": "Dom Quixote", "1": "Miguel de Cervantes", "2": "01/11/2024", "3": "15/11/2024", "4": "Reservado" }
        ] , "Campanhas de Marketing 2024": [
            { "0": "Campanha", "1": "Responsável", "2": "Data de Início", "3": "Data de Término", "4": "Status" },
            { "0": "Promoção de Verão", "1": "Carlos Silva", "2": "01/12/2024", "3": "31/12/2024", "4": "Ativa" },
            { "0": "Lançamento de Produto", "1": "Ana Costa", "2": "15/01/2024", "3": "15/02/2024", "4": "Planejada" }
        ],
        "Relatórios Financeiros Q1 2024": [
            { "0": "Descrição", "1": "Valor", "2": "Data", "3": "Categoria", "4": "Status" },
            { "0": "Vendas Totais", "1": "$50,000", "2": "31/03/2024", "3": "Receita", "4": "Finalizado" },
            { "0": "Despesas Operacionais", "1": "$20,000", "2": "31/03/2024", "3": "Custo", "4": "Pendente" }
        ],
        "Projetos de Desenvolvimento de Software": [
            { "0": "Projeto", "1": "Responsável", "2": "Data de Início", "3": "Data de Término", "4": "Status" },
            { "0": "App de Gestão Financeira", "1": "Fernanda Lima", "2": "01/03/2024", "3": "30/06/2024", "4": "Em Andamento" },
            { "0": "Plataforma de E-commerce", "1": "Lucas Martins", "2": "15/01/2024", "3": "30/04/2024", "4": "Planejada" }
        ],
        "Atividades de Vendas 2024": [
            { "0": "Cliente", "1": "Produto", "2": "Valor da Venda", "3": "Data da Venda", "4": "Status" },
            { "0": "Cliente A", "1": "Serviço de Consultoria", "2": "$2,000", "3": "05/01/2024", "4": "Concluído" },
            { "0": "Cliente B", "1": "Treinamento de Vendas", "2": "$1,500", "3": "10/02/2024", "4": "Pendente" }
        ],
        "Agenda de Reuniões": [
            { "0": "Data", "1": "Hora", "2": "Participantes", "3": "Assunto", "4": "Status" },
            { "0": "12/10/2024", "1": "10:00", "2": "Equipe de Marketing", "3": "Planejamento de Campanhas", "4": "Confirmada" },
            { "0": "15/10/2024", "1": "14:00", "2": "Diretoria", "3": "Revisão de Orçamento", "4": "Agendada" }
        ]
    };


    return (
        <>
            <main className="container-menu-workspace">
                <section className='content-menu'>
                    <img onClick={() => navigate('/painel/workspaces')} src={Logo} className='logo' />
                    <div className='list'>
                        <li tabIndex={0} onKeyDown={(event) => event.key === "Enter" && handleAddColumn()} onClick={() => handleAddColumn()}>
                            <RxColumns className='icon' />
                        </li>
                        <li tabIndex={0} onKeyDown={(event) => event.key === "Enter" && handleAddRow()} onClick={() => handleAddRow()}>
                            <RxRows className='icon' />
                        </li>
                        <li onChange={(e) => handleInputFile(e)}>
                            <MdFileUpload className='icon' />
                            <input type='file' accept='.xlsx' />
                        </li>
                        <li tabIndex={0} onKeyDown={(event) => event.key === "Enter" && setMdPopupAddTabela(true)} onClick={() => setMdPopupAddTabela(true)}>
                            <IoMdAdd className='icon' />
                        </li>
                    </div>
                </section>
            </main>

            {/* Popups */}
            {mdPopupAddTabela && (
                <Popup handleClose={() => setMdPopupAddTabela(false)} handleAdd={() => {
                    handleAddTable(nameTable, tiposTabela[typeTable]);
                    setMdPopupAddTabela(false);
                }} title="Adicionar nova tabela">
                    <div className='form'>

                        <div className='input'>
                            <label>Nome da Tabela</label>
                            <input maxLength={45} onChange={(e) => setNameTable(e.target.value)} placeholder='ex: Livros da Biblioteca' type='text' />
                        </div>

                        <div className='input'>
                            <label>Tipo da Tabela</label>
                            <select onChange={(e) => setTypeTable(e.target.value)}>
                                <option>Selecione um tipo</option>
                                {Object.keys(tiposTabela).map((key, i) => (
                                    <option>{key}</option>
                                ))}
                            </select>    
                        </div>

                    </div>
                </Popup>
            )}
        </>
    )
}