<?php
require 'config.php'; $d=db();
$id=$_GET['v']??''; $vid=null;
foreach($d['videos'] as $x){ if((string)$x['id']===(string)$id){ $vid=$x; break; } }
if(!$vid){ header('Location: index.php'); exit; }
$catName=''; foreach($d['categories'] as $c){ if($c['id']===$vid['cat']) $catName=$c['name']; }

// Series/seasons: agar ye video kisi series ka episode hai to season filter + episode list ka data
$serData=null;
if(!empty($vid['sid'])){
  foreach(($d['series']??[]) as $s){
    if($s['id']!==$vid['sid']) continue;
    $by=[];
    foreach($d['videos'] as $v) if(($v['sid']??'')===$s['id']) $by[(string)($v['season']??'')][]=$v;
    uksort($by,'strnatcasecmp');
    $ss=[];
    foreach($by as $sn=>$list){
      usort($list,fn($x,$y)=>((int)($x['ep']??0))<=>((int)($y['ep']??0)));
      $ss[]=['n'=>(string)$sn,'e'=>array_map(fn($v)=>[
        'i'=>$v['id'],'o'=>(string)$v['okid'],'t'=>$v['title'],'d'=>$v['desc']??'',
        'n'=>(int)($v['ep']??0),'th'=>!empty($v['thumb'])?thumb($v['thumb']):''
      ],$list)];
    }
    if($ss) $serData=['n'=>$s['name'],'s'=>$ss];
  }
}
?>
<!DOCTYPE html>
<html lang="hi"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?=h($vid['title'])?> - <?=h($d['site']['name'])?></title>
<style>
:root{--red:#ff2d55;--cyan:#19e6b4;--muted:#9a93a6}
*{box-sizing:border-box}
body{margin:0;background:#07060b;color:#f4f1f7;font-family:"Segoe UI",system-ui,Arial,sans-serif}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #2a0d16}
.top a{color:#fff;text-decoration:none}
.logo{font-size:20px;font-weight:800;text-shadow:0 0 18px rgba(255,45,85,.55)}
.logo svg{width:.9em;height:.9em;vertical-align:-.05em;margin-right:6px;fill:var(--red)}
.back{font-size:13px;border:1px solid #4a1520;border-radius:20px;padding:6px 14px}
/* Portrait-style page: player upar, details neeche (desktop par bhi phone jaisi centered width) */
.wrap{width:min(560px,100%);margin:0 auto;padding:16px 0 48px}
.pb{background:#000;border-radius:10px;overflow:hidden;box-shadow:0 0 28px rgba(255,45,85,.2)}
.frame{aspect-ratio:16/9;width:100%;background:#000;position:relative;
  --top-h:26%;--ok-w:6%;--fs-w:5.6%;--bar-h:11%;--blk-w:92px;--blk-h:46px}
.frame iframe{width:100%;height:100%;border:0}
.patch{position:absolute;z-index:5;background:transparent;transition:background .15s}
.p-top{top:0;left:0;right:0;height:var(--top-h)}
.p-ok{right:0;bottom:0;width:var(--blk-w);height:var(--blk-h)}
.p-fs{right:var(--ok-w);bottom:0;width:var(--fs-w);height:var(--blk-h);z-index:6;display:flex;align-items:center;justify-content:center;cursor:pointer}
.p-fs svg{width:46%;height:auto;opacity:0;transition:opacity .15s}
@media (hover:none) and (pointer:coarse),(max-width:600px){
  .p-ok{display:none}
  .p-fs{right:4px;bottom:30px;width:44px;height:36px}
  .p-fs svg{width:50%}
}
.frame:hover .p-top{background:linear-gradient(rgba(0,0,0,.9),rgba(0,0,0,0))}
.frame:hover .p-ok,.frame:hover .p-fs{background:#000}
.frame:hover .p-fs svg{opacity:1}
.frame:fullscreen,.frame.pseudo-fs{width:100vw;height:100vh;aspect-ratio:auto}
.frame.pseudo-fs{position:fixed;inset:0;z-index:9999}
@media (orientation:portrait){
  .frame.pseudo-fs{inset:auto;top:0;left:100vw;width:100vh;height:100vw;transform-origin:0 0;transform:rotate(90deg)}
}
body.dbg .patch{background:rgba(255,0,0,.45)!important}
body.dbg .p-fs svg{opacity:1}
.fb{position:absolute;inset:0;z-index:20;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:16px;background:#000;color:#fff;font-size:14px;line-height:1.4}
.fb.open{display:flex}
.bt{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.g1{border:1px solid #b56bff;border-radius:10px;padding:10px 16px;color:#fff;font:700 13px Georgia,serif;cursor:pointer;background:linear-gradient(135deg,#1ea7ff,#7a3cff);box-shadow:0 0 16px rgba(122,60,255,.6);text-decoration:none;display:inline-block}
.info{padding:16px 14px}
.cat{font-size:12px;color:var(--cyan);margin-bottom:6px}
.info h1{font:700 20px/1.3 Georgia,serif;margin:0 0 10px}
.info p{margin:0;color:#b4aec0;font-size:14px;line-height:1.6;white-space:pre-line}
/* ===== Series: season filter + episode list ===== */
.eps{display:none;padding:0 14px}
.eps .sh{font-size:12px;color:var(--muted);margin:0 0 8px}
.eps select{width:100%;background:#0f0f19;border:1px solid #2c2c44;color:#fff;border-radius:8px;padding:10px;font:inherit;margin-bottom:10px}
.ep{display:flex;gap:10px;align-items:center;width:100%;text-align:left;background:#12121b;border:1px solid #23232f;border-radius:8px;padding:6px;margin-bottom:6px;color:#fff;cursor:pointer;font:inherit}
.ep:hover{border-color:#3a3a4f}
.ep.on{border-color:var(--red);background:#1a0b10}
.ep img,.ep i{flex:0 0 80px;width:80px;height:45px;border-radius:5px;object-fit:cover;background:#1a1a26}
.ep b{flex:0 0 auto;font-size:12px;color:var(--cyan)}
.ep span{font-size:13px;line-height:1.3}
@media(prefers-reduced-motion:reduce){.patch{transition:none}}
</style></head><body>
<div class="top">
  <a class="logo" href="index.php"><svg viewBox="0 0 24 24"><path d="M2 8l4.5 4L12 4l5.5 8L22 8l-2 11H4L2 8z"/></svg><?=h($d['site']['name'])?></a>
  <a class="back" href="index.php">&larr; Home</a>
</div>
<div class="wrap">
  <div class="pb">
    <div class="frame" id="frame">
      <iframe id="pf" allow="autoplay; picture-in-picture" title="Player"></iframe>
      <div class="patch p-top"></div>
      <div class="patch p-ok"></div>
      <div class="patch p-fs" id="pfs" title="Fullscreen"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></div>
      <div class="fb" id="fb">
        <div id="fbt">Video load nahi hua. Network slow ya blocked ho sakta hai.</div>
        <div class="bt" id="fbb"><button class="g1" id="fbr">Dobara try karo</button><a class="g1" id="fbo" target="_blank" rel="noopener">Naye tab me kholo</a></div>
        <div class="bt" id="fbh" style="display:none"><a class="g1" href="index.php">Home par jao</a></div>
      </div>
    </div>
  </div>
  <div class="info">
    <div class="cat"><?=h($catName)?></div>
    <h1 id="pt"><?=h($vid['title'])?></h1>
    <p id="pd"<?=empty($vid['desc'])?' style="display:none"':''?>><?=h($vid['desc']??'')?></p>
  </div>
  <div class="eps" id="ep"></div>
</div>
<script>
const $=i=>document.getElementById(i);
const show=i=>$(i).classList.add('open'),hide=i=>$(i).classList.remove('open');
const SITE=<?=json_encode($d['site']['name'],JSON_UNESCAPED_UNICODE|JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT)?>;
const SER=<?=json_encode($serData,JSON_UNESCAPED_UNICODE|JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT)?>;
let OKID=<?=json_encode((string)$vid['okid'])?>;
let curId=<?=json_encode((string)$vid['id'])?>;
let curSeason=<?=json_encode((string)($vid['season']??''))?>;
const RETRY_MS=8000,MAX_RETRY=2;
let rt=null,tries=0,gotMsg=false,ended=false,loadAt=0;
function loadOk(retry){
  gotMsg=false;clearTimeout(rt);hide('fb');loadAt=Date.now();
  $('pf').src='https://ok.ru/videoembed/'+OKID+'?autoplay=1'+(retry?'&_='+Date.now():'');
  rt=setTimeout(()=>{
    if(gotMsg||ended)return;
    if(tries<MAX_RETRY){tries++;dbgLog('retry '+tries);loadOk(true)}
    else{$('pf').src='about:blank';show('fb')}
  },RETRY_MS);
}
$('fbo').href='https://ok.ru/video/'+encodeURIComponent(OKID);
$('fbr').onclick=()=>{tries=0;loadOk(true)};
loadOk(false);

// ===== Series: season filter + episode list (ad dobara nahi aata) =====
const FB_TXT=$('fbt').textContent;
function renderEps(selSeason){
  const box=$('ep');box.innerHTML='';
  if(!SER||!SER.s||!SER.s.length){box.style.display='none';return}
  box.style.display='block';
  let idx=SER.s.findIndex(x=>x.n===(selSeason!==undefined?selSeason:curSeason));
  if(idx<0)idx=0;
  const sh=document.createElement('div');sh.className='sh';sh.textContent=SER.n||'';box.appendChild(sh);
  const sel=document.createElement('select');
  SER.s.forEach((x,i)=>{const o=document.createElement('option');o.value=x.n;o.textContent=(x.n||'Episodes')+' ('+x.e.length+')';if(i===idx)o.selected=true;sel.appendChild(o)});
  sel.onchange=()=>renderEps(sel.value);
  box.appendChild(sel);
  SER.s[idx].e.forEach(e=>{
    const b=document.createElement('button');b.type='button';b.className='ep'+(e.i===curId?' on':'');
    if(e.th){const im=document.createElement('img');im.src=e.th;im.alt='';im.loading='lazy';b.appendChild(im)}else{b.appendChild(document.createElement('i'))}
    const n=document.createElement('b');n.textContent='E'+e.n;b.appendChild(n);
    const t=document.createElement('span');t.textContent=e.t;b.appendChild(t);
    b.onclick=()=>playEp(e,SER.s[idx].n);
    box.appendChild(b);
  });
}
// naya iframe: purane player ke bache hue "ended" jaise messages naye episode ko band na kar paayein
function freshFrame(){
  const old=$('pf'),f=document.createElement('iframe');
  f.id='pf';f.title='Player';f.setAttribute('allow','autoplay; picture-in-picture');
  old.replaceWith(f);
}
function playEp(e,season){
  if(e.i===curId&&!ended)return;
  curId=e.i;curSeason=season;OKID=e.o;ended=false;tries=0;
  $('pt').textContent=e.t;document.title=e.t+' - '+SITE;
  $('pd').textContent=e.d||'';$('pd').style.display=e.d?'':'none';
  $('fbo').href='https://ok.ru/video/'+encodeURIComponent(OKID);
  $('fbt').textContent=FB_TXT;$('fbb').style.display='flex';$('fbh').style.display='none';
  try{history.replaceState(null,'','?v='+encodeURIComponent(e.i)+(location.search.indexOf('debug')>-1?'&debug=1':''))}catch(_){}
  freshFrame();
  loadOk(false);
  renderEps(season);
  $('frame').scrollIntoView({behavior:'smooth',block:'start'});
}
renderEps();

const unlockOri=()=>{try{screen.orientation&&screen.orientation.unlock&&screen.orientation.unlock()}catch(_){}};
const toggleFS=async()=>{
  const f=$('frame');
  if(document.fullscreenElement){unlockOri();document.exitFullscreen().catch(()=>{});return}
  if(f.requestFullscreen){
    try{await f.requestFullscreen();if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock('landscape').catch(()=>{})}catch(_){}
  }else{f.classList.toggle('pseudo-fs')}
};
$('pfs').onclick=toggleFS;
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)unlockOri()});
if(location.search.indexOf('debug')>-1)document.body.classList.add('dbg');

// Video khatam hote hi OK ke related videos na dikhen
const END_RE=/(^|[^a-z])(ended|finished|videoended|playbackended)([^a-z]|$)/;
let dbgEl=null;
function dbgLog(t){
  if(!document.body.classList.contains('dbg'))return;
  if(!dbgEl){dbgEl=document.createElement('pre');dbgEl.style.cssText='position:fixed;left:0;bottom:0;max-width:60vw;max-height:35vh;overflow:auto;margin:0;padding:6px 8px;background:#000c;color:#0f0;font:11px monospace;z-index:99999;white-space:pre-wrap';document.body.appendChild(dbgEl)}
  dbgEl.textContent=(t+'\n'+dbgEl.textContent).slice(0,3000);
}
function endVideo(){
  ended=true;clearTimeout(rt);
  if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  $('frame').classList.remove('pseudo-fs');
  $('pf').src='about:blank';
  $('fbt').textContent='Video khatam ho gaya.';
  $('fbb').style.display='none';$('fbh').style.display='flex';show('fb');
}
window.addEventListener('message',e=>{
  if(!/ok\.ru|odnoklassniki/.test(e.origin))return;
  let s='';try{s=typeof e.data==='string'?e.data:JSON.stringify(e.data)}catch(_){}
  dbgLog(s.slice(0,200));
  gotMsg=true;clearTimeout(rt);hide('fb');
  if(END_RE.test(s.toLowerCase())&&Date.now()-loadAt>3000)endVideo();
});
</script>
</body></html>
