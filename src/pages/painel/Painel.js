import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Painel.css';
import { IoMdTrendingDown, IoMdTrendingUp } from 'react-icons/io';

export default function Painel() {

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
        document.title = 'Painel | Manage School';
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
        
        // Ler o arquivo como texto
        reader.readAsText(file);
        
        // Quando o arquivo é carregado
        reader.onload = async (e) => {
            const text = e.target.result;
            const parsedItems = await parseMsFile(text);
            console.log(parsedItems);
            setItems(parsedItems);
        };

        // Lidar com erros de leitura do arquivo
        reader.onerror = () => {
            console.error('Erro ao ler o arquivo.');
        };
        }
    };

    const parseMsFile = async (text) => {
        // Divida o conteúdo por linhas, removendo espaços em branco e linhas vazias
        const lines = text.split(';').map(line => line.trim()).filter(line => line);
        
        // Identificar os nomes das colunas dinamicamente
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
                    .toLowerCase();;
                    obj[key] = value;
                });
                json.push(obj);
            }
        }));
        if (formatando) {
            return json;
        }
    };

    return (
        <main className="container-painel">
            <section className='content-painel'>
                <div className='top'>
                    <h1>Painel de Controle</h1>
                </div>
                <div className='overview'>
                    <h1>Visão Geral</h1>
                    <p>Visualize os dados das suas principais atividades</p>
                    <div className='statistics'>
                        <li>
                            <div className='text'>
                                <h2>Workspaces</h2>
                                <h1>5/10</h1>
                            </div>
                            <div className='percentage green'>
                                <IoMdTrendingUp className="icon" />
                                <p>50%</p>
                            </div>
                        </li>
                        <li>
                            <div className='text'>
                                <h2>Times</h2>
                                <h1>6/10</h1>
                            </div>
                            <div className='percentage orange'>
                                <IoMdTrendingUp className="icon" />
                                <p>60%</p>
                            </div>
                        </li>
                        <li>
                            <div className='text'>
                                <h2>Minutos por dia</h2>
                                <h1>82/100</h1>
                            </div>
                            <div className='percentage red'>
                                <IoMdTrendingDown className="icon" />
                                <p>82%</p>
                            </div>
                        </li>
                    </div>
                </div>
                <input type="file" accept=".ms" onChange={handleFileChange} />
                {items.length > 0 && (
                    <div>
                    <h2>Itens do Arquivo</h2>
                        <ul>
                            {items.map((item, itemIndex) => (
                                <li key={itemIndex}>
                                    <ul>
                                        {Object.keys(item).map((key) => (
                                            <li key={key}>
                                                <strong>{key}:</strong> {item[key]}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>
        </main>
    )
}