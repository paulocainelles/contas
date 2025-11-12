// ---------------- Firebase Setup ----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBb5dSqb1zTduDXgRKi4GeFUvG3J4Vr_wU",
  authDomain: "rastreadorcontas-f4274.firebaseapp.com",
  projectId: "rastreadorcontas-f4274",
  storageBucket: "rastreadorcontas-f4274.firebasestorage.app",
  messagingSenderId: "521030963391",
  appId: "1:521030963391:web:7c1246a5dcbcf06a92360a",
  measurementId: "G-W75BJCGJ1M"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ---------------- Proteção da página ----------------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html"; // volta para login
  } else {
    console.log("Usuário logado:", user.email);
  }
});

// ---------------- Botão de Logout ----------------
const btnLogout = document.createElement('button');
btnLogout.textContent = "Sair";
btnLogout.style.margin = "10px";
btnLogout.onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};
document.body.prepend(btnLogout);

// ---------------- Dados iniciais ----------------
let contas = JSON.parse(localStorage.getItem("contas") || "[]");
let entradas = JSON.parse(localStorage.getItem("entradas") || "[]");

// ---------------- Funções ----------------

// Atualiza a tabela de contas
function atualizarTabela() {
  const tbody = document.querySelector("#tabelaContas tbody");
  tbody.innerHTML = "";
  let totalNaoPagas = 0;
  let totalPagas = 0;

  contas.forEach((conta, index) => {
    const tr = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = conta.nome;

    const tdValor = document.createElement("td");
    tdValor.textContent = conta.valor.toFixed(2);

    const tdStatus = document.createElement("td");
    tdStatus.textContent = conta.paga ? "Paga" : "Não Paga";
    tdStatus.className = conta.paga ? "paga" : "nao-paga";

    const tdAcoes = document.createElement("td");

    // Botão alternar status
    const btnStatus = document.createElement("button");
    btnStatus.textContent = conta.paga ? "Marcar como Não Paga" : "Marcar como Paga";
    btnStatus.className = conta.paga ? "btn-nao-paga btn-status" : "btn-paga btn-status";
    btnStatus.onclick = () => {
      conta.paga = !conta.paga;
      localStorage.setItem("contas", JSON.stringify(contas));
      atualizarTabela();
      atualizarEntradas();
      atualizarGrafico();
    };

    // Botão remover
    const btnRemover = document.createElement("button");
    btnRemover.textContent = "Remover";
    btnRemover.className = "btn-remover";
    btnRemover.onclick = () => {
      contas.splice(index, 1);
      localStorage.setItem("contas", JSON.stringify(contas));
      atualizarTabela();
      atualizarEntradas();
      atualizarGrafico();
    };

    tdAcoes.appendChild(btnStatus);
    tdAcoes.appendChild(btnRemover);

    tr.appendChild(tdNome);
    tr.appendChild(tdValor);
    tr.appendChild(tdStatus);
    tr.appendChild(tdAcoes);

    tbody.appendChild(tr);

    if (conta.paga) totalPagas += conta.valor;
    else totalNaoPagas += conta.valor;
  });

  document.getElementById("totalDespesas").textContent = totalNaoPagas.toFixed(2);
  document.getElementById("totalEmConta").textContent = (entradas.reduce((acc, e) => acc + e.valor, 0) - totalPagas).toFixed(2);
}

// Adicionar nova conta
window.adicionarConta = function() {
  const nome = document.getElementById("contaNome").value.trim();
  const valor = parseFloat(document.getElementById("contaValor").value);

  if (!nome || isNaN(valor)) return alert("Preencha nome e valor corretamente.");

  contas.push({ nome, valor, paga: false });
  localStorage.setItem("contas", JSON.stringify(contas));
  document.getElementById("contaNome").value = "";
  document.getElementById("contaValor").value = "";

  atualizarTabela();
  atualizarEntradas();
  atualizarGrafico();
};

// Atualiza lista de entradas
function atualizarEntradas() {
  const lista = document.getElementById("listaEntradas");
  lista.innerHTML = "";
  let totalEntradas = 0;

  entradas.forEach((entrada, index) => {
    const li = document.createElement("li");
    li.textContent = `${entrada.nome} - R$ ${entrada.valor.toFixed(2)}`;

    const btnRemover = document.createElement("button");
    btnRemover.textContent = "Remover";
    btnRemover.className = "btn-remover";
    btnRemover.onclick = () => {
      entradas.splice(index, 1);
      localStorage.setItem("entradas", JSON.stringify(entradas));
      atualizarEntradas();
      atualizarTabela();
    };

    li.appendChild(btnRemover);
    lista.appendChild(li);
    totalEntradas += entrada.valor;
  });

  document.getElementById("totalEntradas").textContent = totalEntradas.toFixed(2);

  // Atualiza saldo
  const totalNaoPagas = contas.reduce((acc, c) => acc + (!c.paga ? c.valor : 0), 0);
  document.getElementById("saldo").textContent = (totalEntradas - totalNaoPagas).toFixed(2);
}

// Adicionar nova entrada
window.adicionarEntrada = function() {
  const nome = document.getElementById("entradaNome").value.trim();
  const valor = parseFloat(document.getElementById("entradaValor").value);

  if (!nome || isNaN(valor)) return alert("Preencha nome e valor corretamente.");

  entradas.push({ nome, valor });
  localStorage.setItem("entradas", JSON.stringify(entradas));
  document.getElementById("entradaNome").value = "";
  document.getElementById("entradaValor").value = "";

  atualizarEntradas();
  atualizarTabela();
  atualizarGrafico();
};

// ---------------- Gráfico ----------------
let chart = null;
function atualizarGrafico() {
  const ctx = document.getElementById('chartGastos').getContext('2d');
  const totalPagas = contas.filter(c => c.paga).reduce((acc, c) => acc + c.valor, 0);
  const totalNaoPagas = contas.filter(c => !c.paga).reduce((acc, c) => acc + c.valor, 0);

  const data = {
    labels: ['Pagas', 'Não Pagas'],
    datasets: [{
      label: 'Contas em R$',
      data: [totalPagas, totalNaoPagas],
      backgroundColor: ['#34c759', '#ff3b30']
    }]
  };

  if (chart) {
    chart.data = data;
    chart.update();
  } else {
    chart = new Chart(ctx, {
      type: 'pie',
      data: data,
      options: {
        responsive: true
      }
    });
  }
}

// ---------------- Inicialização ----------------
atualizarTabela();
atualizarEntradas();
atualizarGrafico();
