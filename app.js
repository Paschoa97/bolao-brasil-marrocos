import { initializeApp }
from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCwQ5gdmUYN1Kg2uXs2-jIQlRR4XLIOv2o",
  authDomain: "bolao-brasil-e-marrocos.firebaseapp.com",
  projectId: "bolao-brasil-e-marrocos",
  storageBucket: "bolao-brasil-e-marrocos.firebasestorage.app",
  messagingSenderId: "614526950041",
  appId: "1:614526950041:web:728309f1ae5f31934ef608"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ENCERRAMENTO =
new Date("2026-06-19T21:30:00-03:00");

const VALOR_APOSTA = 5;

function atualizarContador(){

    const agora = new Date();

    const diff =
        ENCERRAMENTO - agora;

    if(diff <= 0){

        document
        .getElementById("contador")
        .innerHTML =
        "<span class='fechado'>APOSTAS ENCERRADAS</span>";

        return;
    }

    const horas =
    Math.floor(diff/1000/60/60);

    const minutos =
    Math.floor(diff/1000/60)%60;

    const segundos =
    Math.floor(diff/1000)%60;

    document
    .getElementById("contador")
    .innerHTML =
    `Encerra em ${horas}h ${minutos}m ${segundos}s`;
}

setInterval(
    atualizarContador,
    1000
);

atualizarContador();

document
.getElementById("copiarPix")
.addEventListener("click", async ()=>{

    await navigator.clipboard.writeText(
        "39742558850"
    );

    alert("PIX copiado.");
});

document
.getElementById("btnSalvar")
.addEventListener("click", salvar);

async function salvar(){

    if(new Date() >= ENCERRAMENTO){

        alert("Apostas encerradas.");
        return;
    }

    const nome =
    document
    .getElementById("nome")
    .value
    .trim();

    const brasil =
    document
    .getElementById("brasil")
    .value;

    const haiti =
    document
    .getElementById("haiti")
    .value;

    if(!nome){

        alert("Informe seu nome.");
        return;
    }

    if(brasil === "" || haiti === ""){

        alert("Informe o placar.");
        return;
    }

    await addDoc(
        collection(db,"apostas"),
        {
            nome,
            brasil:Number(brasil),
            haiti:Number(haiti),
            criadoEm:serverTimestamp()
        }
    );

    alert(
        "Palpite registrado. Faça o PIX de R$ 5,00."
    );

    document.getElementById("brasil").value="";
    document.getElementById("haiti").value="";
}

const q =
query(
    collection(db,"apostas"),
    orderBy("criadoEm","desc")
);

onSnapshot(q,(snapshot)=>{

    let total = 0;

    let html = "";

    const ranking = {};

    snapshot.forEach(doc=>{

        total += VALOR_APOSTA;

        const a = doc.data();

        const chave =
        `${a.brasil}x${a.haiti}`;

        ranking[chave] =
        (ranking[chave] || 0) + 1;

        html += `
            <div class="aposta">
                <strong>${a.nome}</strong>
                → Brasil ${a.brasil}
                x
                ${a.haiti} Haiti
            </div>
        `;
    });

    document
    .getElementById("lista")
    .innerHTML = html;

    document
    .getElementById("qtd")
    .innerText = snapshot.size;

    document
    .getElementById("valor")
    .innerText =
    total.toLocaleString(
        "pt-BR",
        {
            style:"currency",
            currency:"BRL"
        }
    );

    const rankingDiv =
    document.getElementById("ranking");

    const rankingOrdenado =
    Object.entries(ranking)
    .sort((a,b)=>b[1]-a[1]);

    rankingDiv.innerHTML =
    rankingOrdenado
    .map(item =>
        `<div class="rank">${item[0]} - ${item[1]} aposta(s)</div>`
    )
    .join("");
});