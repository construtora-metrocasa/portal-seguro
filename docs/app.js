const API = "https://script.google.com/macros/s/AKfycbw6V56rEd-O91kstwz6tawb3O0gvFMT7W7hayDThZI5lrGUqotPNBqBIZTd8F2TVsHc/exec";

let currentUser = "";
let sessionEnd = 0;
let lastLogTime = "";

function showToast(msg){
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.style.opacity = 1;
  setTimeout(()=> t.style.opacity = 0, 4000);
}

function showLoader(show){
  document.getElementById("loader").hidden = !show;
}

async function login(){
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;
  const pass_hash = await sha256(pass);

  const res = await fetch(API,{
    method:"POST",
    body: JSON.stringify({action:"login", user, pass_hash})
  });

  const data = await res.json();
  if(data.error) return showToast("Login inválido");

  currentUser = user;
  sessionEnd = Date.now() + data.minutes*60000;

  document.getElementById("username").innerText = "👤 "+user;
  document.getElementById("loginBox").hidden = true;
  document.getElementById("panel").hidden = false;

  const cards = document.getElementById("cards");
  cards.innerHTML="";

  data.sites.forEach(s=>{
    const div = document.createElement("div");
    div.className="card";
    div.innerText = s.site;
    div.onclick = ()=> openSite(s.token, s.site);
    cards.appendChild(div);
  });

  startTimer();
  pollLogs();
}

function startTimer(){
  setInterval(()=>{
    const diff = sessionEnd - Date.now();
    if(diff<=0){
      showToast("Sessão expirada");
      logout();
    }
    document.getElementById("timer").innerText =
      "⏱ "+Math.floor(diff/60000)+" min";
  },1000);
}

async function openSite(token, site){
  showLoader(true);
  const res = await fetch(API,{
    method:"POST",
    body: JSON.stringify({
      action:"getSite",
      token,
      user:currentUser,
      site
    })
  });

  const html = await res.text();
  document.getElementById("viewer").srcdoc = html;
  document.getElementById("viewerBox").hidden = false;
  showLoader(false);
}

function logout(){
  location.reload();
}

async function pollLogs(){
  setInterval(async ()=>{
    const res = await fetch(API,{
      method:"POST",
      body: JSON.stringify({action:"getLastLog"})
    });
    const data = await res.json();

    if(data.timestamp && data.timestamp != lastLogTime){
      lastLogTime = data.timestamp;
      showToast(`👤 ${data.user} acessou ${data.site}`);
    }
  },5000);
}
