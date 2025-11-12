// --- Importações Firebase ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// --- Configuração Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyBb5dSqb1zTduDXgRKi4GeFUvG3J4Vr_wU",
  authDomain: "rastreadorcontas-f4274.firebaseapp.com",
  projectId: "rastreadorcontas-f4274",
  storageBucket: "rastreadorcontas-f4274.firebasestorage.app",
  messagingSenderId: "521030963391",
  appId: "1:521030963391:web:7c1246a5dcbcf06a92360a",
  measurementId: "G-W75BJCGJ1M"
};

// --- Inicialização Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Variáveis globais ---
let contas = [];
let entradas = [];
let chart;

// --- Carregar dados ---
async function carregarDados() {
    try {
        const contasSnapshot = await getDocs(collection(db, "contas"));
        contas = contasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const entradasSnapshot = await getDocs(collection(db, "entradas"));
        entradas = entradasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        atualizarListaContas();
        atualizarListaEntradas();
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

// --- Adicionar conta ---
async function adicionarConta() {
    const nome = document.getElementById('contaNome').value.trim();
    const valor = parseFloat(document.getElementById('contaValor').value);
    const data = document.getElementById('contaData').value;

    if (nome && !isNaN(valor) && valor > 0 && data) {
        try {
            await addDoc(collection(db, "contas"), { nome, valor, data, paga: false });
            await carregarDados();
            limparCampos('contaNome', 'contaValor', 'contaData');
        } catch (error) {
            console.error("Erro ao adicionar conta:", error);
        }
    } else {
        alert('Preencha nome, valor e data válidos!');
    }
}

// --- Adicionar entrada ---
async function adicionarEntrada() {
    const nome = document.getElementById('entradaNome').value.trim();
    const valor = parseFloat(document.getElementById('entradaValor').value);

    if (nome && !isNaN(valor) && valor > 0) {
        try {
            await addDoc(collection(db, "entradas"), { nome, valor });
            await carregarDados();
            limparCampos('entradaNome', 'entradaValor');
        } catch (error) {
            console.error("Erro ao adicionar entrada:", error);
        }
    } else {
        alert('Preencha nome e valor válidos!');
    }
}

// --- Marcar conta como paga/não paga ---
async function marcarPaga(index) {
    const conta = contas[index];
    try {
        await updateDoc(doc(db, "contas", conta.id), { paga: !conta.paga });
        await carregarDados();
    } catch (error) {
        console.error("Erro ao atualizar conta:", error);
    }
}

// --- Remover conta ---
async function removerConta(index) {
    const conta = contas[index];
    try {
        await deleteDoc(doc(db, "contas", conta.id));
        await carregarDados();
    } catch (error) {
        console.error("Erro ao remover conta:", error);
    }
}

// --- Remover entrada ---
async function removerEntrada(index) {
    const entrada = entradas[index];
    try {
        await deleteDoc(doc(db, "entradas", entrada.id));
        await carregarDados();
    } catch (error) {
        console.error("Erro ao remover entrada:", error);
    }
}

// --- Atualizar lista de contas ---
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

// --- Atualizar lista de entradas ---
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

// --- Atualizar saldos ---
function atualizarSaldo() {
    const totalEntradas = entradas.reduce((sum, e) => sum + e.valor, 0);
    const totalDespesas = contas.filter(c => !c.paga).reduce((sum, c) => sum + c.valor, 0);
    const totalPagas = contas.filter(c => c.paga).reduce((sum, c) => sum + c.valor, 0);

    document.getElementById('saldo').textContent = (totalEntradas - totalDespesas).toFixed(2);

    const totalEmConta = totalEntradas - totalPagas;
    const spanTotalEmConta = document.getElementById('totalEmConta');
    spanTotalEmConta.textContent = totalEmConta.toFixed(2);
    spanTotalEmConta.style.color = totalEmConta > 1000 ? 'green' : 'orange';
}

// --- Atualizar gráfico ---
function atualizarGrafico() {
    const totalPagas = contas.filter(c => c.paga).reduce((sum, c) => sum + c.valor, 0);
    const totalNaoPagas = contas.filter(c => !c.paga).reduce((sum, c) => sum + c.valor, 0);

    if (chart) chart.destroy();

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
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const total = totalPagas + totalNaoPagas;
                            const perc = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                            return `${ctx.label}: R$ ${ctx.parsed.toFixed(2)} (${perc}%)`;
                        }
                    }
                }
            }
        }
    });
}

// --- Função auxiliar ---
function limparCampos(...ids) {
    ids.forEach(id => document.getElementById(id).value = '');
}

// --- Inicializar ---
window.adicionarConta = adicionarConta;
window.adicionarEntrada = adicionarEntrada;
window.marcarPaga = marcarPaga;
window.removerConta = removerConta;
window.removerEntrada = removerEntrada;

carregarDados();
