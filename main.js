(function(){'use strict';
var $=function(s,c){return(c||document).querySelector(s)},$$=function(s,c){return[].slice.call((c||document).querySelectorAll(s))};
var rm=matchMedia('(prefers-reduced-motion:reduce)').matches,root=document.documentElement;
window.VIBRANT_CARRIERS={health:['UnitedHealthcare','Ambetter Health','Oscar Health','Blue Cross Blue Shield','Molina Healthcare','Cigna Healthcare','Aetna','Anthem','Humana','Kaiser Permanente','Florida Blue','Community Health Choice','Baylor Scott & White Health Plan','Imperial Health'],life:['AIG','Pacific Life','Fidelity','Lincoln Financial','MassMutual','Allianz','Jackson National','AXA','Nationwide','New York Life','Transamerica','Prudential','MetLife','TIAA'],auto:['National General','State Farm','Progressive','GEICO'],home:['State Farm','Allstate','Farmers Insurance','USAA','Liberty Mutual','Travelers','Nationwide','American Family','Progressive','Chubb','Safeco','Homesite','Mercury Insurance','Texas Farm Bureau','Auto-Owners','Amica','Foremost','National General','Openly','Hippo','Stillwater Insurance','Universal Property','Branch Insurance','Lemonade','Kin Insurance']};
/* dark mode */
var th=$('#theme');th.addEventListener('click',function(){var t=root.dataset.theme==='dark'?'light':'dark';root.dataset.theme=t;try{localStorage.setItem('vt',t)}catch(e){}});
/* nav */
var nav=$('#nav'),prog=$('#progress'),totop=$('#totop'),hero=$('[data-parallax]'),links=$('#links'),burger=$('#burger');
function onScroll(){var y=scrollY,h=root.scrollHeight-innerHeight;nav.classList.toggle('solid',y>30);prog.style.width=(h>0?y/h*100:0)+'%';totop.classList.toggle('show',y>700);if(hero&&y<900&&!rm)hero.style.transform='translateY('+y*.22+'px)'}
addEventListener('scroll',onScroll,{passive:true});onScroll();
totop.addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'})});
burger.addEventListener('click',function(){burger.setAttribute('aria-expanded',links.classList.toggle('open'))});
$$('#links a').forEach(function(a){a.addEventListener('click',function(){links.classList.remove('open');burger.setAttribute('aria-expanded','false')})});
$$('.ddb').forEach(function(b){b.addEventListener('click',function(){var d=b.parentNode,o=d.classList.toggle('open');b.setAttribute('aria-expanded',o)})});
root.style.scrollPaddingTop='84px';
/* reveal + counters */
$$('.reveal').forEach(function(el,i){el.style.setProperty('--d',(i%4)*.08+'s')});
function count(el){var end=+el.dataset.count,s=el.dataset.suffix||'',t0=null;(function st(t){t0=t0||t;var p=Math.min((t-t0)/1600,1);el.textContent=Math.round(end*(1-Math.pow(1-p,3)))+s;if(p<1)requestAnimationFrame(st)})(performance.now())}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;e.target.classList.add('in');var c=e.target.dataset.count?e.target:$('[data-count]',e.target);if(c)count(c);io.unobserve(e.target)})},{threshold:.15});
$$('.reveal,.stat').forEach(function(el){io.observe(el)});
/* rotating word */
var ty=$('#ty');if(ty&&!rm){var w=['simple','clear','affordable','personal'],k=0;setInterval(function(){ty.classList.add('out');setTimeout(function(){k=(k+1)%w.length;ty.textContent=w[k];ty.classList.remove('out')},400)},2600)}
/* logo search */
$$('.lgf').forEach(function(f){f.addEventListener('input',function(){var q=f.value.toLowerCase();$$('.lg',$('#'+f.dataset.for)).forEach(function(l){l.classList.toggle('hide',l.title.toLowerCase().indexOf(q)<0)})})});
/* sound (synthesized, no files) */
var AC=null,on=true;try{on=localStorage.getItem('vs')!=='off'}catch(e){}
var sb=$('#snd');function syncS(){sb.setAttribute('aria-pressed',on);sb.setAttribute('aria-label',on?'Turn sound off':'Turn sound on');sb.classList.toggle('mute',!on)}
function tone(f,d,ty,v,to,dl){if(!on)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();var t=AC.currentTime+(dl||0),o=AC.createOscillator(),g=AC.createGain();o.type=ty||'sine';o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.05,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
var S={click:function(){tone(520,.09,'triangle',.06,780)},hover:function(){tone(1500,.03,'sine',.012)},open:function(){tone(440,.12,'sine',.05,660);tone(660,.14,'sine',.04,990,.07)},close:function(){tone(660,.1,'sine',.04,440)},theme:function(){tone(392,.12,'sine',.05);tone(587,.16,'sine',.05,null,.08)},msg:function(){tone(880,.1,'sine',.04);tone(1175,.14,'sine',.035,null,.07)},ok:function(){[523,659,784].forEach(function(f,i){tone(f,.18,'sine',.05,null,i*.09)})}};
sb.addEventListener('click',function(){on=!on;try{localStorage.setItem('vs',on?'on':'off')}catch(e){}syncS();if(on)S.ok()});syncS();
document.addEventListener('click',function(e){var t=e.target.closest('a,button,summary,.tab');if(!t||t.id==='snd')return;S[t.id==='theme'?'theme':(t.id==='chatOpen'||t.id==='burger'||t.classList.contains('ddb'))?'open':t.id==='chatClose'?'close':'click']()});
var lh=0;document.addEventListener('mouseover',function(e){var t=e.target.closest('.btn,.pk,.card,.lg,.links a');if(!t||t.contains(e.relatedTarget))return;var n=Date.now();if(n-lh>90){lh=n;S.hover()}});
var cl=$('#chatLog');if(cl)new MutationObserver(function(ms){ms.forEach(function(m){[].forEach.call(m.addedNodes,function(n){if(n.classList&&n.classList.contains('bot')&&!$('#chat').hidden)S.msg()})})}).observe(cl,{childList:true});
/* cursor, tilt, magnetic (kept subtle) */
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
 var cd=$('#cd'),lb=$('em',cd);root.classList.add('cur');
 addEventListener('mousemove',function(e){root.classList.add('mv');cd.style.transform='translate('+e.clientX+'px,'+e.clientY+'px)';
  var t=e.target.closest&&e.target.closest('a,button,summary,.lg,label,[data-tilt]');cd.classList.toggle('hov',!!t);var l=t&&t.closest('[data-cur]');cd.classList.toggle('lab',!!l);lb.textContent=l?l.dataset.cur:'';
  var tl=e.target.closest&&e.target.closest('[data-tilt]');if(tl&&!rm){var r=tl.getBoundingClientRect();tl.style.transform='perspective(900px) rotateX('+(-(e.clientY-r.top)/r.height*6+3)+'deg) rotateY('+((e.clientX-r.left)/r.width*6-3)+'deg) translateY(-3px)'}
  $$('.blob').forEach(function(b,i){b.style.translate=(e.clientX-innerWidth/2)*(.03+i*.02)+'px '+(e.clientY-innerHeight/2)*.03+'px'})});
 document.addEventListener('mouseout',function(e){var t=e.target.closest&&e.target.closest('[data-tilt]');if(t)t.style.transform=''});
 document.addEventListener('mouseleave',function(){root.classList.remove('mv')});
 var cp=function(v){return Math.max(-3,Math.min(3,v))};
 $$('.btn').forEach(function(b){b.addEventListener('mousemove',function(e){if(rm)return;var r=b.getBoundingClientRect();b.style.translate=cp((e.clientX-r.left-r.width/2)*.06)+'px '+cp((e.clientY-r.top-r.height/2)*.1)+'px'});b.addEventListener('mouseleave',function(){b.style.translate=''})})}
/* quote + finder */
var q=$('#quote');
window.vibrantPick=function(v){if(q){$$('input[name=interest]',q).forEach(function(c){if(c.value===v)c.checked=true})}else location.href='contact.html?pick='+encodeURIComponent(v)};
if(q){var m=/pick=(\w+)/.exec(location.search);if(m)window.vibrantPick(m[1]);
 q.zip.addEventListener('input',function(){this.value=this.value.replace(/\D/g,'').slice(0,5)});
 q.addEventListener('submit',function(e){if(!$$('input[name=interest]:checked',q).length){e.preventDefault();alert('Please choose at least one coverage you are interested in.');return}S.ok();var b=$('button[type=submit]',q);b.disabled=true;b.textContent='Sending…'})}
var f=$('#finder');if(f){$('#pzip').addEventListener('input',function(){this.value=this.value.replace(/\D/g,'').slice(0,5)});f.addEventListener('submit',function(e){e.preventDefault();var z=$('#pzip').value;if(!/^\d{5}$/.test(z)){$('#pzip').focus();return}open('https://www.google.com/maps/search/'+encodeURIComponent($('#ptype').value+' near '+z),'_blank','noopener')})}
$('#yr').textContent=new Date().getFullYear();
})();
