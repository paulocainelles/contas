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
// Redireciona se usuário não estiver logado
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

// ---------------- Lógica do Rastreador ----------------
// Exemplo de lógica do seu rastreador (substitua pelo seu código real)
const contas = JSON.parse(localStorage.getItem("contas") || "[]");
const lista = document.createElement('ul');
document.body.appendChild(lista);

function atualizarLista() {
  lista.innerHTML = "";
  contas.forEach((conta, index) => {
    const li = document.createElement('li');
    li.textContent = `${conta.nome} - R$ ${conta.valor.toFixed(2)}`;
    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = "Excluir";
    btnExcluir.onclick = () => {
      contas.splice(index, 1);
      localStorage.setItem("contas", JSON.stringify(contas));
      atualizarLista();
    };
    li.appendChild(btnExcluir);
    lista.appendChild(li);
  });
}

atualizarLista();

// Adicionar nova conta
const inputNome = document.createElement('input');
inputNome.placeholder = "Nome da conta";
const inputValor = document.createElement('input');
inputValor.placeholder = "Valor";
inputValor.type = "number";
const btnAdicionar = document.createElement('button');
btnAdicionar.textContent = "Adicionar Conta";

btnAdicionar.onclick = () => {
  const nome = inputNome.value.trim();
  const valor = parseFloat(inputValor.value);
  if (nome && !isNaN(valor)) {
    contas.push({ nome, valor });
    localStorage.setItem("contas", JSON.stringify(contas));
    atualizarLista();
    inputNome.value = "";
    inputValor.value = "";
  }
};

document.body.appendChild(inputNome);
document.body.appendChild(inputValor);
document.body.appendChild(btnAdicionar);
