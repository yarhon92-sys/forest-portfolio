const films=[
 {title:'感受森林一日的氛围变化',tag:'一日流转 · 时序手札',desc:'从破晓到星眠，看森林流转八种时光。',file:'output/时序剪辑/森林一日-时序合辑.mp4',duration:'00:26',paper:'rgba(115,63,39,.89)',ink:'#ffe9bf',symbol:'☼',ambience:'破晓至星眠 · 森林一日'},
 {title:'茶社宣传片广告',tag:'流光 · 茶社邀请',desc:'循着时光的指针，走进一杯茶的奇遇。',file:'茶社广告-4K宣传片.mp4',duration:'00:43',paper:'rgba(231,218,176,.91)',ink:'#34423a',symbol:'◷',ambience:'流光转盘 · 一封森林的邀请'},
 {title:'奇妙的森林装置',tag:'雨夜 · 魔法图鉴',desc:'雨滴敲响叶灯，森林在微光中苏醒。',file:'下雨.mp4',duration:'00:16',paper:'rgba(30,57,70,.89)',ink:'#eee2bd',symbol:'☾',ambience:'雨落林间 · 装置苏醒'},
 {title:'茶社音乐会',tag:'星夜 · 林间乐章',desc:'萤火亮起，让旋律在树影间流淌。',file:'10.2.mp4',duration:'00:04',paper:'rgba(52,39,86,.89)',ink:'#efe1ff',symbol:'♫',ambience:'星光作伴 · 今夜有一场音乐会'},
 {title:'茶社的客人',tag:'相逢 · 精灵来信',desc:'为远道而来的朋友，留一杯温热的茶。',file:'_1080p_202601260027.mp4',duration:'00:08',paper:'rgba(179,219,219,.9)',ink:'#204b55',symbol:'❧',ambience:'一杯温茶 · 与森林的朋友相遇'}
];
const $=s=>document.querySelector(s), carousel=$('.carousel'), dots=$('.dots'), layers=[...document.querySelectorAll('.backdrop')],player=$('#player'),dialog=$('#floating-player');let active=2,layer=0,version=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cards=films.map((f,i)=>{let c=document.createElement('button');c.className='card';c.style.setProperty('--paper',f.paper);c.style.setProperty('--ink',f.ink);c.setAttribute('aria-label',f.title);c.innerHTML=`<div class="media"><img src="assets/tea-carousel/${i}.jpg" alt="${f.title}视频画面"><span class="play" aria-hidden="true">▶</span><span class="duration">${f.duration}</span></div><div class="copy"><span class="eyebrow">0${i+1} / ${f.tag}</span><span class="ornament" aria-hidden="true">${f.symbol}</span><h2>${f.title}</h2><p>${f.desc}</p></div>`;c.onclick=()=>{if(expanding||closing)return;const origin=c.getBoundingClientRect();if(i!==active){active=i;arrange();setBackground()}openPlayer(origin)};carousel.append(c);let dot=document.createElement('button');dot.setAttribute('aria-label','切换到'+f.title);dot.onclick=()=>select(i);dots.append(dot);return c});
function arrange(){const mobile=innerWidth<=700,step=mobile?innerWidth*.66:Math.min(innerWidth*.17,290);cards.forEach((c,i)=>{let d=i-active;if(d>2)d-=5;if(d< -2)d+=5;let n=Math.abs(d);c.style.transform=`translate(calc(-50% + ${d*step}px),-50%) scale(${[1,.8,.63][n]}) rotateY(${d===0?0:d<0?13:-13}deg)`;c.dataset.side=d>0?'right':d<0?'left':'center';c.style.zIndex=10-n;c.style.filter=n?'brightness(.88)':'none';c.classList.toggle('active',!n);c.setAttribute('aria-pressed',String(!n));c.tabIndex=mobile&&n? -1:0;dots.children[i].setAttribute('aria-current',String(!n))});$('#counter').textContent=`0${active+1} / 05`;$('#ambience').textContent=films[active].ambience}
let cleanupTimer;
function setBackground(){const token=++version;clearTimeout(cleanupTimer);const old=layer;layer=1-layer;const next=layers[layer],prev=layers[old],v=next.querySelector('video');v.pause();v.classList.remove('ready');next.querySelector('img').src=`assets/tea-carousel/${active}.jpg`;v.src=films[active].file;next.classList.add('shown');prev.classList.remove('shown');prev.querySelector('video').pause();v.oncanplay=()=>{if(token!==version)return;v.classList.add('ready');if(!paused&&!dialog.open&&!document.hidden)v.play().catch(()=>{})};v.onerror=()=>v.classList.remove('ready');v.load();cleanupTimer=setTimeout(()=>{const p=prev.querySelector('video');p.removeAttribute('src');p.load()},1100)}
function select(i){const next=(i+5)%5;if(next===active)return;active=next;arrange();setBackground()}
const filmDetails=[
 '破晓、晨息、朝明、昼盛、午荫、暮染、夜临、星眠。八个时段缓缓相接，从晨光到星夜，看看同一座茶社如何随时间变换气氛。每一段只留下短暂的停留，让森林的一天在一杯茶的时间里流转。',
 '跟随发光的时序转盘，开启精灵茶社的邀请。从森林的光影到一杯茶的温度，在流转的画面中认识这座藏在林间的小小茶社。',
 '雨落在树叶和石径上，闪电照亮远处的森林，茶屋的窗内仍亮着暖光。叶形灯、茶车与林间装置在雨夜中呈现另一种模样，等待你慢慢发现。',
 '夜幕下，星光与萤火为茶社点亮舞台。精灵们带着乐器相聚，让拨弦与节奏穿过花丛和树影，一起听见森林夜晚的热闹与温柔。',
 '蓝色的精灵客人在茶桌旁坐下，眼前是温热的茶与熟悉的森林。把目光留给他们的神情与相处，让一次小小的相逢，成为茶社日常里值得记住的片刻。'
];
let expanding=false,closing=false,collapseTimer=null,controlsTimer=null;
function lockGallery(locked){carousel.inert=locked;$('.navigation').inert=locked;}
function playerBounds(){const width=Math.min(940,innerWidth*.9,(innerHeight-220)*16/9);const w=Math.max(280,width);const height=Math.min(innerHeight*.92,w*9/16+(innerWidth<=700?300:180));return {left:(innerWidth-w)/2,top:(innerHeight-height)/2,width:w,height};}
function applyBounds(r){for(const key of ['left','top','width','height'])dialog.style[key]=r[key]+'px'}
function openPlayer(origin){
 if(expanding||closing)return;
 expanding=true;dialog.open=true;lockGallery(true);player.controls=false;dialog.classList.add('morphing');document.body.classList.add('player-morphing');
 const rect=origin||cards[active].getBoundingClientRect();dialog.hidden=false;dialog.classList.remove('expanded','collapsing');applyBounds(rect);
 const changed=player.getAttribute('src')!==films[active].file;
 if(changed){player.src=films[active].file;player.poster=`assets/tea-carousel/${active}.jpg`}
 if(player.ended)player.currentTime=0;
 $('#player-title').textContent=films[active].title;$('#player-category').textContent=films[active].tag;
 $('#player-duration').textContent='影片时长 '+films[active].duration;$('#player-description').textContent=filmDetails[active];$('#player-error').textContent='';
 void dialog.offsetWidth;
 document.body.classList.add('is-playing');applyBounds(playerBounds());dialog.classList.add('expanded');
 layers.forEach(l=>l.querySelector('video').pause());
 player.play().catch(()=>{$('#player-error').textContent='点击视频播放按钮继续观看。'});
 $('#close').focus({preventScroll:true});clearTimeout(controlsTimer);controlsTimer=setTimeout(()=>{if(expanding){player.controls=true;dialog.classList.remove('morphing');document.body.classList.remove('player-morphing')}},620);
}
function collapsePlayer(){
 if(!expanding||closing)return;
 closing=true;expanding=false;clearTimeout(controlsTimer);player.pause();
 const card=cards[active],to=card.getBoundingClientRect(),from=dialog.getBoundingClientRect();
 const mediaTo=card.querySelector('.media').getBoundingClientRect(),mediaFrom=player.getBoundingClientRect();
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches,duration=reduced?0:480;
 // Retain the actual paused frame: there is no poster swap at the end of the return.
 let frame=card.querySelector('img').src;
 try{const canvas=document.createElement('canvas');canvas.width=player.videoWidth;canvas.height=player.videoHeight;canvas.getContext('2d').drawImage(player,0,0);frame=canvas.toDataURL('image/jpeg',.94);card.querySelector('img').src=frame}catch{}
 const shell=document.createElement('div');shell.className='return-shell';
 Object.assign(shell.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'});
 const picture=document.createElement('img');picture.src=frame;picture.className='return-picture';
 Object.assign(picture.style,{left:mediaFrom.left+'px',top:mediaFrom.top+'px',width:mediaFrom.width+'px',height:mediaFrom.height+'px'});
 document.body.append(shell,picture);
 const anims=[];const opts={duration,easing:'cubic-bezier(.3,.15,.35,1)',fill:'forwards'};
 function move(el,start,end){anims.push(el.animate([start,end],opts))}
 move(shell,{}, {left:to.left+'px',top:to.top+'px',width:to.width+'px',height:to.height+'px'});
 move(picture,{}, {left:mediaTo.left+'px',top:mediaTo.top+'px',width:mediaTo.width+'px',height:mediaTo.height+'px'});
 const labels=[];
 const pairs=[['#player-category','.eyebrow'],['#player-title','h2'],['#player-description','.copy p']];
 for(const [source,target] of pairs){
  const src=dialog.querySelector(source),dest=card.querySelector(target),r1=src.getBoundingClientRect(),r2=dest.getBoundingClientRect();
  const label=document.createElement('div');label.className='return-label';label.textContent=dest.textContent;
  const cs=getComputedStyle(dest);Object.assign(label.style,{left:r1.left+'px',top:r1.top+'px',width:r2.width+'px',fontFamily:cs.fontFamily,fontSize:cs.fontSize,lineHeight:cs.lineHeight,color:cs.color,opacity:'1'});
  document.body.append(label);labels.push(label);
  move(label,{transform:'translate(0,0)',opacity:source==='#player-description'?0:1},{transform:`translate(${r2.left-r1.left}px,${r2.top-r1.top}px)`,opacity:1});
 }
 document.body.classList.add('player-morphing');dialog.hidden=true;player.controls=false;
 document.body.classList.remove('is-playing');
 // Only the play icon and small ornaments fade in; picture and copy are already in place.
 Promise.all(anims.map(a=>a.finished)).then(()=>{
  // Reveal the real card at full opacity before removing the matching overlay.
  // Removing player-morphing alone would trigger the base .45s opacity transition.
  card.style.transition='none';
  card.style.opacity='1';
  document.body.classList.remove('player-morphing');
  void card.offsetWidth;
  shell.remove();picture.remove();labels.forEach(l=>l.remove());
  requestAnimationFrame(()=>{card.style.removeProperty('transition');card.style.removeProperty('opacity')});
  closing=false;dialog.open=false;dialog.classList.remove('morphing','collapsing','expanded');
  lockGallery(false);cards[active].focus({preventScroll:true});
  if(!paused&&!document.hidden)layers[layer].querySelector('video').play().catch(()=>{});
 });
}
$('#close').onclick=collapsePlayer;


player.onerror=()=>{$('#player-error').textContent='视频暂时无法播放，请检查本地文件是否完整。'};
addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog.open){e.preventDefault();collapsePlayer()}});
addEventListener('resize',()=>{if(expanding)applyBounds(playerBounds())});
$('#prev').onclick=()=>select(active-1);$('#next').onclick=()=>select(active+1);function motionLabel(){$('#motion').textContent=paused?'播放背景':'暂停背景';$('#motion').setAttribute('aria-pressed',String(paused))}$('#motion').onclick=()=>{paused=!paused;motionLabel();const v=layers[layer].querySelector('video');paused?v.pause():v.play().catch(()=>{})};document.addEventListener('visibilitychange',()=>{layers.forEach(l=>l.querySelector('video').pause());if(!document.hidden&&!paused&&!dialog.open)layers[layer].querySelector('video').play().catch(()=>{})});addEventListener('keydown',e=>{if(dialog.open)return;if(e.key==='ArrowRight'){e.preventDefault();select(active+1)}if(e.key==='ArrowLeft'){e.preventDefault();select(active-1)}});let startX=0;carousel.addEventListener('touchstart',e=>startX=e.touches[0].clientX,{passive:true});carousel.addEventListener('touchend',e=>{let dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>55)select(active+(dx<0?1:-1))},{passive:true});addEventListener('resize',arrange);for(let i=0;i<16;i++){const m=document.createElement('i');m.style.cssText=`--x:${(i*37)%100}%;--y:${(i*23+10)%100}%;--delay:-${i*.7}s`;$('.motes').append(m)}motionLabel();arrange();setBackground();
player.addEventListener('loadedmetadata',()=>{
 if(player.videoWidth&&player.videoHeight)player.style.setProperty('--video-ratio',player.videoWidth/player.videoHeight);
});
// Programmatic focus follows the animation; only keyboard navigation needs a ring.
document.addEventListener('pointerdown',()=>document.body.classList.add('pointer-interaction'),true);
document.addEventListener('keydown',e=>{if(e.key==='Tab'||e.key.startsWith('Arrow'))document.body.classList.remove('pointer-interaction')},true);
