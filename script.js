// Arrays locais para armazenar dados temporariamente (para cálculos rápidos)
let contas = [];
let entradas = [];
let chart;

// Função para carregar dados do Firestore
async function carregarDados() {
    try {
        const contasSnapshot = await getDocs(collection(window.db, "contas"));
        contas = contasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const entradasSnapshot = await getDocs(collection(window.db, "entradas"));
        entradas = entradasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        atualizarListaContas();
        atualizarListaEntradas();
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

// Função para adicionar uma conta
async function adicionarConta() {
    const nome = document.getElementById('contaNome').value.trim();
    const valor = parseFloat(document.getElementById('contaValor').value);
    const data = document.getElementById('contaData').value;
    if (nome && !isNaN(valor) && valor > 0 && data) {
        try {
            await addDoc(collection(window.db, "contas"), { nome, valor, data, paga: false });
            await carregarDados(); // Recarrega tudo
            limparCampos('contaNome', 'contaValor', 'contaData');
        } catch (error) {
            console.error("Erro ao adicionar conta:", error);
        }
    } else {
        alert('Preencha nome, valor e data válidos!');
    }
}

// Função para adicionar uma entrada
async function adicionarEntrada() {
    const nome = document.getElementById('entradaNome').value.trim();
    const valor = parseFloat(document.getElementById('entradaValor').value);
    if (nome && !isNaN(valor) && valor > 0) {
        try {
            await addDoc(collection(window.db, "entradas"), { nome, valor });
            await carregarDados();
            limparCampos('entradaNome', 'entradaValor');
        } catch (error) {
            console.error("Erro ao adicionar entrada:", error);
        }
    } else {
        alert('Preencha nome e valor válidos!');
    }
}

// Função para marcar/desmarcar conta como paga
async function marcarPaga(index) {
    const conta = contas[index];
    try {
        await updateDoc(doc(window.db, "contas", conta.id), { paga: !conta.paga });
        await carregarDados();
    } catch (error) {
        console.error("Erro ao atualizar conta:", error);
    }
}

// Função para remover conta
async function removerConta(index) {
    const conta = contas[index];
    try {
        await deleteDoc(doc(window.db, "contas", conta.id));
        await carregarDados();
    } catch (error) {
        console.error("Erro ao remover conta:", error);
    }
}

// Função para remover entrada
async function removerEntrada(index) {
    const entrada = entradas[index];
    try {
        await deleteDoc(doc(window.db, "entradas", entrada.id));
        await carregarDados();
    } catch (error) {
        console.error("Erro ao remover entrada:", error);
    }
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
        chart.destroy();
    }

    const ctx = document.getElementById('chartGastos').getContext('2d');
    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Pagas (R$)', 'Não Pagas (R$)'],
            datasets: [{
                data: [totalPagas, totalNaoPagas],
                backgroundColor: ['#34c759', '#ff3b30'],
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

// Função auxiliar para limpar campos de input
function limparCampos(...ids) {
    ids.forEach(id => document.getElementById(id).value = '');
}

// Inicializar carregando dados do Firestore
carregarDados();