/* Vibrant Assistant – chat widget.
   Default mode: built-in answers (no server needed).
   AI mode: set window.VIBRANT_CHAT_ENDPOINT (see README + worker/chat-worker.js). Falls back to built-in answers if the endpoint is unreachable. */
(function(){
'use strict';
var ENDPOINT=window.VIBRANT_CHAT_ENDPOINT||'';
var PHONE='+1 (214) 764-1992',EMAIL='Info@VibrantRiskManagement.Com';
var $=function(s){return document.querySelector(s)};
var open=$('#chatOpen'),box=$('#chat'),log=$('#chatLog'),quick=$('#chatQuick'),form=$('#chatForm'),input=$('#chatInput'),closeBtn=$('#chatClose');
var history=[],greeted=false,awaiting=null;

var MAIN=[
  {label:'Get a quote',go:'quote'},
  {label:'Health insurance',send:'Tell me about health insurance'},
  {label:'Auto insurance',send:'Tell me about auto insurance'},
  {label:'Home insurance',send:'Tell me about home insurance'},
  {label:'Find a doctor or lab',send:'I need to find a doctor'},
  {label:'Talk to a person',send:'I want to talk to a person'}
];

function carriers(k){return (window.VIBRANT_CARRIERS||{})[k]||[]}
function list(a){return a.join(', ')}

var KB=[
  {k:/\b(hi|hello|hey|salam|assalam|good (morning|afternoon|evening))\b/i,
   a:function(){return {t:"Hello, welcome to Vibrant Risk Management Services. I can answer questions about our health, auto and home insurance, the carriers we work with, and help you find a doctor, lab or clinic. What would you like to know?",q:MAIN}}},
  {k:/(talk|speak|call|agent|person|human|representative|phone|contact|email|reach)/i,
   a:function(){return {t:"You can reach our team directly:\n\nPhone: [ "+PHONE+" ](tel:+12147641992)\nEmail: [ "+EMAIL+" ](mailto:"+EMAIL+")\n\nOr leave your details in the quote form and we'll get back to you.",q:[{label:'Open quote form',go:'quote'}]}}},
  {k:/(doctor|physician|specialist|lab\b|laborator|clinic|urgent care|hospital|dentist|provider|in.?network|pcp)/i,
   a:function(t){
     var type=/dentist/i.test(t)?'dentist':/specialist/i.test(t)?'specialist':/lab/i.test(t)?'medical lab':/urgent/i.test(t)?'urgent care':/hospital/i.test(t)?'hospital':/clinic/i.test(t)?'clinic':'doctor';
     var z=(t.match(/\b\d{5}\b/)||[])[0];
     if(z)return {t:"Here is a map search for a "+type+" near "+z+":\n[Open the map](https://www.google.com/maps/search/"+encodeURIComponent(type+' near '+z)+")\n\nTo confirm they accept your specific plan, our team can verify the network with the carrier before you enroll.",q:[{label:'Ask our team to verify',go:'quote',pick:'Care'}]};
     awaiting=type;
     return {t:"Happy to help you look for a "+type+". What is your 5-digit ZIP code? I'll open a map search near you. Our team can also confirm a provider is in-network before you choose a plan."};
   }},
  {k:/(quote|price|pricing|cost|how much|rate|premium|estimate|apply|sign.?up|enroll now|get started)/i,
   a:function(t){
     if(/(how much|cost|price|pricing|fee|charge|free)/i.test(t)&&!/(health|auto|car\b|vehicle|home|house)/i.test(t))
       return {t:"Our service is free to you. Carriers compensate agencies, and your premium is the same whether you buy through us or directly. Actual plan prices depend on the carrier, your ZIP code and your details, so a licensed agent prepares those for you.",q:[{label:'Get a free quote',go:'quote'}]};
     return {t:"Prices depend on the carrier, your ZIP code and your details, so a licensed agent prepares a personal quote for you at no cost. Which coverage are you interested in?",q:[{label:'Health',go:'quote',pick:'Health'},{label:'Auto',go:'quote',pick:'Auto'},{label:'Home',go:'quote',pick:'Home'}]}}},
  {k:/(group|employer|business|employees|small business)/i,
   a:function(){return {t:"Yes, we can help with group health insurance for businesses. Tell us your company size and ZIP code and we'll compare options for you.",q:[{label:'Request a group quote',go:'quote',pick:'Health'}]}}},
  {k:/(travel|abroad|visitor|overseas)/i,
   a:function(){return {t:"Travel medical coverage is available on request. Contact our team with your travel dates and destination and we'll go over options.",q:[{label:'Ask our team',go:'quote',pick:'Health'}]}}},
  {k:/(enrollment|enroll|open enrol|special enrol|deadline|qualifying|life event)/i,
   a:function(){return {t:"Marketplace health plans have an annual open enrollment period, and special enrollment may be available after a qualifying life event such as moving, losing coverage, marriage or a new baby. Contact us and we'll confirm the exact window that applies to you.",q:[{label:'Check my eligibility',go:'quote',pick:'Health'}]}}},
  {k:/(carrier|company|companies|insurer|who do you (work|partner)|partners|brands)/i,
   a:function(t){
     if(/health|medical/i.test(t))return {t:"Health carriers: "+list(carriers('health'))+".\n\nAvailability varies by state, county and plan year."};
     if(/auto|car\b|vehicle/i.test(t))return {t:"Auto carriers: "+list(carriers('auto'))+"."};
     if(/home|house/i.test(t))return {t:"Home carriers: "+list(carriers('home'))+".\n\nAvailability varies by location."};
     return {t:"We compare 40+ carriers across health, auto and home. Which line would you like to see?",q:[{label:'Health carriers',send:'Health carriers'},{label:'Auto carriers',send:'Auto carriers'},{label:'Home carriers',send:'Home carriers'}]}}},
  {k:/(health|aca|obama|marketplace|medical|medicare|medicaid|plan)/i,
   a:function(){return {t:"We offer Marketplace (ACA) health plans from 12 leading carriers, plus group and travel medical options. We match plans to your doctors, medications and budget, and we can help you find in-network doctors, labs and clinics.\n\nWould you like a quote?",q:[{label:'Get a health quote',go:'quote',pick:'Health'},{label:'Health carriers',send:'Health carriers'},{label:'Find a doctor',send:'I need to find a doctor'}]}}},
  {k:/(auto|car\b|vehicle|driver|driving)/i,
   a:function(){return {t:"For auto insurance we compare National General, State Farm, Progressive and GEICO side by side, covering liability and full coverage, multi-car households and bundle savings.",q:[{label:'Get an auto quote',go:'quote',pick:'Auto'},{label:'Can I bundle?',send:'Can I bundle auto and home?'}]}}},
  {k:/(bundle|together|multi.?policy|discount|save|saving)/i,
   a:function(){return {t:"Many carriers offer multi-policy discounts when you bundle auto and home. We'll compare bundled and separate pricing so you can see which is cheaper for you.",q:[{label:'Get a bundle quote',go:'quote',pick:'Auto'}]}}},
  {k:/(home|house|homeowner|dwelling|property|renter|condo)/i,
   a:function(){return {t:"For home insurance we work with 25 carriers, from household names to modern digital insurers, covering your dwelling, belongings and liability. Bundling with auto can save money.",q:[{label:'Get a home quote',go:'quote',pick:'Home'},{label:'Home carriers',send:'Home carriers'}]}}},
  {k:/(claim|file a claim|accident|damage|accident)/i,
   a:function(){return {t:"For a new claim, contact your carrier's claims line (it's on your policy documents or insurance card) so it is logged right away. If you bought your policy through us and need help understanding the process, call us at [ "+PHONE+" ](tel:+12147641992).",q:MAIN.slice(5)}}},
  {k:/(where|location|area|state|texas|dallas|dfw|richardson|outside|virtual|office|address)/i,
   a:function(){return {t:"We are a virtual agency based in Richardson, TX, serving the Dallas–Fort Worth Metroplex. We help by phone and online, and clients outside DFW can ask about availability since carrier and licensing rules vary by state."}}},
  {k:/(about|who are you|experience|how long|years)/i,
   a:function(){return {t:"Vibrant Risk Management Services is a DFW-based virtual insurance agency with over four years of experience. We let carriers compete for your coverage so you get the right plan at a fair price, with personal service throughout."}}},
  {k:/(document|need to (apply|provide)|what do i need|information needed)/i,
   a:function(){return {t:"For a quote we typically need your name, contact details and ZIP code, plus a few coverage details. For health, the household members and any doctors or medications that matter to you. Please don't send SSN or medical details through the website; our agent will collect anything sensitive securely by phone.",q:[{label:'Start my quote',go:'quote'}]}}},
  {k:/(thank|thanks|shukria|great|ok(ay)?$)/i,
   a:function(){return {t:"You're welcome. Is there anything else I can help you with?",q:MAIN}}}
];
var FALLBACK=function(){return {t:"I'm not sure I have that detail. A licensed agent can answer it properly: call [ "+PHONE+" ](tel:+12147641992), or send your details and we'll get back to you.",q:[{label:'Open quote form',go:'quote'}].concat(MAIN.slice(1,4))}};

function localReply(text){
  if(awaiting){
    var z=(text.match(/\b\d{5}\b/)||[])[0];
    if(z){var type=awaiting;awaiting=null;
      return {t:"Here is a map search for a "+type+" near "+z+":\n[Open the map](https://www.google.com/maps/search/"+encodeURIComponent(type+' near '+z)+")\n\nWe can also confirm whether they accept a specific plan before you enroll.",q:[{label:'Ask our team to verify',go:'quote',pick:'Care'}]};}
    awaiting=null;
  }
  for(var i=0;i<KB.length;i++){if(KB[i].k.test(text))return KB[i].a(text)}
  return FALLBACK();
}

/* rendering */
function linkify(el,text){
  var re=/\[\s*([^\]]+?)\s*\]\(([^)\s]+)\)/g,last=0,m;
  while((m=re.exec(text))){
    el.appendChild(document.createTextNode(text.slice(last,m.index)));
    var url=m[2];
    if(/^(https:\/\/www\.google\.com\/maps\/|tel:|mailto:|#)/.test(url)){
      var a=document.createElement('a');a.href=url;a.textContent=m[1];
      if(url.indexOf('http')===0){a.target='_blank';a.rel='noopener'}
      el.appendChild(a);
    }else el.appendChild(document.createTextNode(m[1]));
    last=re.lastIndex;
  }
  el.appendChild(document.createTextNode(text.slice(last)));
}
function add(role,text){
  var d=document.createElement('div');d.className='msg '+(role==='me'?'me':'bot');
  if(role==='me')d.textContent=text;else linkify(d,text);
  log.appendChild(d);log.scrollTop=log.scrollHeight;return d;
}
function setQuick(items){
  quick.innerHTML='';
  (items||[]).forEach(function(it){
    var b=document.createElement('button');b.type='button';b.className='qr';b.textContent=it.label;
    b.addEventListener('click',function(){
      if(it.go==='quote'){
        if(it.pick&&window.vibrantPick)window.vibrantPick(it.pick);
        if(window.matchMedia('(max-width:560px)').matches)toggle(false);
        var c=document.getElementById('contact');if(c)c.scrollIntoView({behavior:'smooth'});
        add('bot',"I've taken you to the quote form. Fill in your details and we'll come back to you with options.");
        setQuick(MAIN);
      }else if(it.send){send(it.send)}
    });
    quick.appendChild(b);
  });
}
function typing(){
  var d=document.createElement('div');d.className='msg bot typing';d.innerHTML='<i></i><i></i><i></i>';
  log.appendChild(d);log.scrollTop=log.scrollHeight;return d;
}

/* sending */
function remote(){
  var ctrl=('AbortController' in window)?new AbortController():null;
  var to=setTimeout(function(){if(ctrl)ctrl.abort()},20000);
  return fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history.slice(-12)}),signal:ctrl?ctrl.signal:undefined})
    .then(function(r){clearTimeout(to);if(!r.ok)throw new Error('bad');return r.json()})
    .then(function(j){if(!j||!j.reply)throw new Error('empty');return {t:String(j.reply).slice(0,1500),q:MAIN.slice(0,1).concat(MAIN.slice(5))}});
}
function send(text){
  text=(text||'').trim();if(!text)return;
  add('me',text);history.push({role:'user',content:text});setQuick([]);
  var t=typing();
  var p=ENDPOINT?remote().catch(function(){return localReply(text)}):Promise.resolve(localReply(text));
  var wait=new Promise(function(r){setTimeout(r,ENDPOINT?0:550+Math.random()*350)});
  Promise.all([p,wait]).then(function(res){
    t.remove();var r=res[0];
    add('bot',r.t);history.push({role:'assistant',content:r.t});
    setQuick(r.q||MAIN);
  });
}

function toggle(show){
  box.hidden=!show;open.setAttribute('aria-expanded',show?'true':'false');
  open.style.display=show&&window.matchMedia('(max-width:560px)').matches?'none':'';
  if(show){
    if(!greeted){greeted=true;
      setTimeout(function(){add('bot',"Hello, I'm the Vibrant virtual assistant. I can answer questions about our health, auto and home insurance, our carriers, and help you find a doctor, lab or clinic. How can I help?");setQuick(MAIN)},250);
    }
    setTimeout(function(){input.focus()},350);
  }
}
open.addEventListener('click',function(){toggle(box.hidden)});
closeBtn.addEventListener('click',function(){toggle(false)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!box.hidden)toggle(false)});
form.addEventListener('submit',function(e){e.preventDefault();var v=input.value;input.value='';send(v)});
})();
