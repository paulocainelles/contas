// --- Firebase imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// --- Configuração do Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyBb5dSqb1zTduDXgRKi4GeFUvG3J4Vr_wU",
  authDomain: "rastreadorcontas-f4274.firebaseapp.com",
  projectId: "rastreadorcontas-f4274",
  storageBucket: "rastreadorcontas-f4274.firebasestorage.app",
  messagingSenderId: "521030963391",
  appId: "1:521030963391:web:7c1246a5dcbcf06a92360a",
  measurementId: "G-W75BJCGJ1M"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- Elementos da tela ---
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const msg = document.getElementById('mensagem');
const btnLogin = document.getElementById('btnLogin');
const btnCadastro = document.getElementById('btnCadastro');

// --- Função de login ---
btnLogin.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    msg.textContent = "Login bem-sucedido! Redirecionando...";
    msg.style.color = "green";
    setTimeout(() => window.location.href = "rastreador.html", 1000);
  } catch (error) {
    msg.textContent = "Erro ao fazer login: " + traduzErro(error.code);
    msg.style.color = "red";
  }
});

// --- Função de cadastro ---
btnCadastro.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();

  try {
    await createUserWithEmailAndPassword(auth, email, senha);
    msg.textContent = "Conta criada com sucesso! Faça login.";
    msg.style.color = "green";
  } catch (error) {
    msg.textContent = "Erro ao cadastrar: " + traduzErro(error.code);
    msg.style.color = "red";
  }
});

// --- Mantém usuário logado (se já estiver autenticado) ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "rastreador.html";
  }
});

// --- Traduz erros comuns ---
function traduzErro(code) {
  switch (code) {
    case "auth/user-not-found": return "Usuário não encontrado.";
    case "auth/wrong-password": return "Senha incorreta.";
    case "auth/email-already-in-use": return "E-mail já cadastrado.";
    case "auth/invalid-email": return "E-mail inválido.";
    case "auth/weak-password": return "Senha muito fraca (mínimo 6 caracteres).";
    default: return "Erro desconhecido.";
  }
}
