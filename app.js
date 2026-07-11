import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (id)=>document.getElementById(id);

function msg(text,type="notice"){
  const box=$("message");
  if(box){box.className="notice "+type;box.textContent=text;}
}

export async function registerMember(){
  const name=$("name").value.trim();
  const email=$("email").value.trim();
  const password=$("password").value;
  const university=$("university").value.trim();
  const chapter=$("chapter").value;
  if(!name||!email||!password){msg("Please fill all required fields.","error");return;}
  try{
    const cred=await createUserWithEmailAndPassword(auth,email,password);
    await updateProfile(cred.user,{displayName:name});
    await setDoc(doc(db,"members",cred.user.uid),{
      name,email,university,chapter,
      role:"member",
      status:"pending",
      createdAt:serverTimestamp()
    });
    msg("Account created. Your membership is pending approval.","success");
    setTimeout(()=>location.href="dashboard.html",1200);
  }catch(e){msg(e.message,"error");}
}

export async function loginMember(){
  const email=$("email").value.trim();
  const password=$("password").value;
  try{
    await signInWithEmailAndPassword(auth,email,password);
    location.href="dashboard.html";
  }catch(e){msg(e.message,"error");}
}

export async function logoutMember(){
  await signOut(auth);
  location.href="login.html";
}

export function protectPage(){
  onAuthStateChanged(auth, async (user)=>{
    if(!user){location.href="login.html";return;}
    const profile=$("profile");
    const snap=await getDoc(doc(db,"members",user.uid));
    const data=snap.exists()?snap.data():{};
    if(profile){
      profile.innerHTML=`
      <h2>${data.name || user.email}</h2>
      <p><b>Email:</b> ${user.email}</p>
      <p><b>University:</b> ${data.university || "-"}</p>
      <p><b>Chapter:</b> ${data.chapter || "-"}</p>
      <p><b>Status:</b> ${data.status || "pending"}</p>
      <p><b>Role:</b> ${data.role || "member"}</p>`;
    }
    loadDashboardData();
  });
}

async function loadDashboardData(){
  const ann=$("announcements");
  if(ann){
    const qs=await getDocs(collection(db,"announcements"));
    ann.innerHTML="";
    qs.forEach(d=>{
      const x=d.data();
      ann.innerHTML += `<div class="card"><span class="tag">Announcement</span><h3>${x.title||"Untitled"}</h3><p>${x.text||""}</p></div>`;
    });
    if(!ann.innerHTML) ann.innerHTML="<p>No announcements yet.</p>";
  }
  const projects=$("projectList");
  if(projects){
    const qs=await getDocs(collection(db,"projects"));
    projects.innerHTML="";
    qs.forEach(d=>{
      const x=d.data();
      projects.innerHTML += `<div class="card"><span class="tag">${x.status||"Active"}</span><h3>${x.title||"Project"}</h3><p>${x.description||""}</p></div>`;
    });
    if(!projects.innerHTML) projects.innerHTML="<p>No private projects yet.</p>";
  }
}

export async function addAnnouncement(){
  const title=$("title").value.trim();
  const text=$("text").value.trim();
  if(!title||!text){msg("Enter title and text.","error");return;}
  await addDoc(collection(db,"announcements"),{title,text,createdAt:serverTimestamp()});
  msg("Announcement added.","success");
}

window.registerMember=registerMember;
window.loginMember=loginMember;
window.logoutMember=logoutMember;
window.protectPage=protectPage;
window.addAnnouncement=addAnnouncement;
