const API = "https://script.google.com/macros/s/AKfycbw6V56rEd-O91kstwz6tawb3O0gvFMT7W7hayDThZI5lrGUqotPNBqBIZTd8F2TVsHc/exec";

async function login(){
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;
  const pass_hash = await sha256(pass);

  const res = await fetch(API,{
    method:"POST",
    body: JSON.stringify({
      action:"login",
      user,
      pass_hash
    })
  });

  const data = await res.json();
  if(data.error) return alert("Login inválido");

  document.getElementById("loginBox").hidden = true;
  document.getElementById("panel").hidden = false;

  document.getElementById("sites").innerHTML="";
  data.sites.forEach(s=>{
    const btn = document.createElement("button");
    btn.innerText = s.site;
    btn.onclick = ()=> openSite(s.token, s.site);
    document.getElementById("sites").appendChild(btn);
  });
}

async function openSite(token, site){
  const res = await fetch(API,{
    method:"POST",
    body: JSON.stringify({
      action:"getSite",
      token,
      user: document.getElementById("user").value,
      site
    })
  });

  const html = await res.text();
  document.getElementById("viewer").srcdoc = html;
}
