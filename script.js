// Arrays para armazenar contas e entradas (carregados do localStorage)
let contas = JSON.parse(localStorage.getItem('contas')) || [];
let entradas = JSON.parse(localStorage.getItem('entradas')) || [];
let chart; // Variável para o gráfico

// Função para adicionar uma conta
function adicionarConta() {
    const nome = document.getElementById('contaNome').value.trim();
    const valor = parseFloat(document.getElementById('contaValor').value);
    const data = document.getElementById('contaData').value;
    if (nome && !isNaN(valor) && valor > 0 && data) {
        contas.push({ nome, valor, data, paga: false });
        salvarDados();
        atualizarListaContas();
        limparCampos('contaNome', 'contaValor', 'contaData');
    } else {
        alert('Preencha nome, valor e data válidos!');
    }
}

// Função para adicionar uma entrada
function adicionarEntrada() {
    const nome = document.getElementById('entradaNome').value.trim();
    const valor = parseFloat(document.getElementById('entradaValor').value);
    if (nome && !isNaN(valor) && valor > 0) {
        entradas.push({ nome, valor });
        salvarDados();
        atualizarListaEntradas();
        limparCampos('entradaNome', 'entradaValor');
    } else {
        alert('Preencha nome e valor válidos!');
    }
}

// Função para marcar/desmarcar conta como paga
function marcarPaga(index) {
    contas[index].paga = !contas[index].paga;
    salvarDados();
    atualizarListaContas();
}

// Função para remover conta
function removerConta(index) {
    contas.splice(index, 1);
    salvarDados();
    atualizarListaContas();
}

// Função para remover entrada
function removerEntrada(index) {
    entradas.splice(index, 1);
    salvarDados();
    atualizarListaEntradas();
}

// Função para atualizar a tabela de contas na tela
function atualizarListaContas() {
    const tbody = document.querySelector('#tabelaContas tbody');
    tbody.innerHTML = '';
    let totalDespesas = 0;
    contas.forEach((conta, index) => {
        const tr = document.createElement('tr');
        tr.className = conta.paga ? 'paga' : 'nao-paga';
        tr.innerHTML = `
            <td>${conta.nome}</td>
            <td>R$ ${conta.valor.toFixed(2)}</td>
            <td>${conta.data}</td>
            <td>${conta.paga ? 'Pago' : 'Não Pago'}</td>
            <td>
                <button onclick="marcarPaga(${index})">${conta.paga ? 'Desmarcar' : 'Marcar Paga'}</button>
                <button onclick="removerConta(${index})">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
        if (!conta.paga) totalDespesas += conta.valor;
    });
    document.getElementById('totalDespesas').textContent = totalDespesas.toFixed(2);
    atualizarSaldo();
    atualizarGrafico();
}

// Função para atualizar a lista de entradas na tela
function atualizarListaEntradas() {
    const lista = document.getElementById('listaEntradas');
    lista.innerHTML = '';
    let totalEntradas = 0;
    entradas.forEach((entrada, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${entrada.nome}: R$ ${entrada.valor.toFixed(2)}
            <button onclick="removerEntrada(${index})">Remover</button>
        `;
        lista.appendChild(li);
        totalEntradas += entrada.valor;
    });
    document.getElementById('totalEntradas').textContent = totalEntradas.toFixed(2);
    atualizarSaldo();
}

// Função para calcular e atualizar o saldo e o total em conta
function atualizarSaldo() {
    const totalEntradas = entradas.reduce((sum, e) => sum + e.valor, 0);
    const totalDespesas = contas.filter(c => !c.paga).reduce((sum, c) => sum + c.valor, 0);
    const totalPagas = contas.filter(c => c.paga).reduce((sum, c) => sum + c.valor, 0);
    document.getElementById('saldo').textContent = (totalEntradas - totalDespesas).toFixed(2);
    const totalEmConta = totalEntradas - totalPagas;
    const spanTotalEmConta = document.getElementById('totalEmConta');
    spanTotalEmConta.textContent = totalEmConta.toFixed(2);
    // Muda a cor baseado no valor
    if (totalEmConta > 1000) {
        spanTotalEmConta.style.color = 'green';
    } else {
        spanTotalEmConta.style.color = 'orange';
    }
}

// Função para atualizar o gráfico de porcentagem de contas pagas
function atualizarGrafico() {
    const totalPagas = contas.filter(c => c.paga).reduce((sum, c) => sum + c.valor, 0);
    const totalNaoPagas = contas.filter(c => !c.paga).reduce((sum, c) => sum + c.valor, 0);

    if (chart) {
        chart.destroy(); // Destroi o gráfico anterior
    }

    const ctx = document.getElementById('chartGastos').getContext('2d');
    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Pagas (R$)', 'Não Pagas (R$)'],
            datasets: [{
                data: [totalPagas, totalNaoPagas],
                backgroundColor: ['#34c759', '#ff3b30'], // Verde para pagas, vermelho para não pagas
                borderColor: ['#ffffff', '#ffffff'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = totalPagas + totalNaoPagas;
                            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                            return `${context.label}: R$ ${context.parsed.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Função para salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('contas', JSON.stringify(contas));
    localStorage.setItem('entradas', JSON.stringify(entradas));
}

// Função auxiliar para limpar campos de input
function limparCampos(...ids) {
    ids.forEach(id => document.getElementById(id).value = '');
}

// Inicializar a página carregando listas
atualizarListaContas();
atualizarListaEntradas();