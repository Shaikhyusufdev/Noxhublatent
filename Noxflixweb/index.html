<?php require 'config.php'; $d=db(); $b=$d['broadcast']; $any=false; $ad=$d['ad']??['img'=>'','link'=>'','sec'=>9];
$cn=[]; foreach($d['categories'] as $c){ $n=count(array_filter($d['videos'],fn($v)=>$v['cat']===$c['id'])); if($n)$cn[]=[$c,$n]; }
$all=$d['videos']; usort($all,fn($a,$b)=>$b['time']<=>$a['time']); $feat=array_values(array_filter($all,fn($v)=>!empty($v['feat']))); $hero=$feat[0]??null;
$catn=array_column($d['categories'],'name','id'); $catm=array_column($d['categories'],'members','id');
// hero ke liye badi image (Cloudinary), baaki cards ka thumb() waisa hi
function big($u){ return (strpos($u,'res.cloudinary.com')!==false && strpos($u,'/upload/')!==false && !preg_match('~/upload/[a-z]_~',$u)) ? str_replace('/upload/','/upload/w_1600,h_900,c_fill,f_auto,q_auto/',$u) : $u; } ?>
<!DOCTYPE html>
<html lang="hi"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?=h($d['site']['name'])?></title>
<script>document.documentElement.className='js'</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap">
<style>
:root{--red:#ff2d55;--cyan:#19e6b4;--vio:#8a1fff;--muted:#9a93a6;--bg:#07060b;--hf:"Space Grotesk","Segoe UI",system-ui,sans-serif}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:#f4f1f7;font-family:"Segoe UI",system-ui,Arial,sans-serif}
#bc{display:flex;gap:12px;justify-content:center;align-items:center;background:linear-gradient(90deg,#ff2d55,#8a1fff);padding:10px 16px;font-size:14px;font-weight:600;text-align:center;position:relative;z-index:30}
#bc a{color:#fff;text-decoration:underline}#bc button{background:none;border:0;color:#fff;font-size:20px;cursor:pointer}

/* ===== NEW STREAMING UI ===== */
.nav{position:sticky;top:0;z-index:20;height:68px;margin-bottom:-68px;display:flex;align-items:center;gap:28px;padding:0 4vw;background:linear-gradient(rgba(7,6,11,.85),rgba(7,6,11,0));transition:background .35s,box-shadow .35s}
.nav.solid{background:rgba(7,6,11,.94);backdrop-filter:blur(14px);box-shadow:0 1px 0 #1f1a28}
.brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;font:700 24px var(--hf);letter-spacing:-.5px;flex:0 0 auto}
.brand svg{width:26px;height:26px;fill:var(--red);filter:drop-shadow(0 0 10px rgba(255,45,85,.75))}
.nl{display:flex;gap:6px;flex:1;overflow-x:auto;scrollbar-width:none}
.nl::-webkit-scrollbar{display:none}
.nl a{flex:0 0 auto;color:#cfc8dc;text-decoration:none;font:500 14px var(--hf);padding:8px 14px;border-radius:999px;transition:background .2s,color .2s}
.nl a:hover{background:rgba(255,255,255,.1);color:#fff}
.sr{margin-left:auto;position:relative;flex:0 0 auto}
#q{width:220px;background:rgba(255,255,255,.08);border:1px solid #2f2a3d;border-radius:999px;color:#fff;font:400 14px "Segoe UI",sans-serif;padding:9px 16px;transition:width .3s,border-color .2s,background .2s}
#q::placeholder{color:#8f88a0}
#q:focus{outline:none;width:300px;border-color:var(--cyan);background:rgba(255,255,255,.12)}

.hero{position:relative;min-height:min(86vh,780px);display:flex;align-items:flex-end;padding:130px 4vw 96px;overflow:hidden}
.hero .bg{position:absolute;inset:0;background:radial-gradient(circle at 20% 20%,var(--a,#5a1230),transparent 65%),radial-gradient(circle at 85% 85%,var(--b,#2a1060),transparent 65%),#160a12}
.hero .bg img{width:100%;height:100%;object-fit:cover;animation:kb 28s ease-in-out infinite alternate}
@keyframes kb{from{transform:scale(1.03)}to{transform:scale(1.2) translate(-1.5%,-1.2%)}}
.hero::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--bg) 6%,rgba(7,6,11,.6) 42%,rgba(7,6,11,.05) 80%),linear-gradient(0deg,var(--bg) 3%,rgba(7,6,11,0) 46%)}
.hc{position:relative;z-index:2;max-width:640px}
.hc>*{animation:rise .9s cubic-bezier(.2,.8,.2,1) both}
.hc>*:nth-child(2){animation-delay:.12s}.hc>*:nth-child(3){animation-delay:.24s}.hc>*:nth-child(4){animation-delay:.36s}
@keyframes rise{from{opacity:0;transform:translateY(36px)}}
.hmeta{display:inline-flex;align-items:center;gap:10px;color:var(--cyan);font:500 14px var(--hf);margin-bottom:14px}
.lock2{background:var(--red);color:#fff;font:700 11px "Segoe UI",sans-serif;border-radius:4px;padding:2px 7px}
.hc h1{margin:0;font:700 clamp(34px,6.4vw,76px)/1.02 var(--hf);letter-spacing:-2px;text-shadow:0 4px 40px rgba(0,0,0,.6)}
.hc p{margin:18px 0 0;color:#d6cfe3;font-size:17px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;white-space:pre-line}
.hb{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-top:28px}
.pbtn{display:inline-flex;align-items:center;gap:10px;border:0;cursor:pointer;color:#fff;font:700 16px var(--hf);padding:15px 32px;border-radius:999px;background:linear-gradient(135deg,var(--red),var(--vio));animation:glow 2.4s ease-in-out infinite;transition:transform .2s}
.pbtn:hover{transform:translateY(-3px) scale(1.03)}
@keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(255,45,85,.55),0 10px 30px rgba(255,45,85,.3)}50%{box-shadow:0 0 0 14px rgba(255,45,85,0),0 10px 40px rgba(255,45,85,.5)}}
.more{color:#fff;text-decoration:none;font:500 15px var(--hf);padding:14px 26px;border-radius:999px;border:1px solid rgba(255,255,255,.3);backdrop-filter:blur(6px);transition:background .2s}
.more:hover{background:rgba(255,255,255,.14)}
.hero.nov .bg{background:radial-gradient(circle at 20% 20%,#5a1230,transparent 65%),radial-gradient(circle at 85% 85%,#2a1060,transparent 65%),#160a12}
.hero.nov{min-height:min(44vh,400px);padding-bottom:70px}    

main{position:relative;z-index:3;max-width:1500px;margin:-46px auto 0;padding:0 4vw 60px}
section{padding:22px 0 14px;scroll-margin-top:80px}
h2{display:flex;align-items:center;gap:12px;margin:0 0 6px;font:700 24px var(--hf);letter-spacing:-.4px}
.count{font:400 12px "Segoe UI",sans-serif;color:var(--muted);border:1px solid #2b2536;border-radius:12px;padding:3px 9px}
.rw{position:relative}
.row{display:flex;gap:20px;overflow-x:auto;padding:16px 4px 22px;scroll-snap-type:x mandatory;scrollbar-width:none;scroll-behavior:smooth}
.row::-webkit-scrollbar{display:none}
.ar{position:absolute;top:0;bottom:22px;width:64px;border:0;color:#fff;font-size:34px;cursor:pointer;z-index:4;opacity:0;transition:opacity .25s}
.ar.l{left:-4vw;background:linear-gradient(90deg,var(--bg) 20%,transparent)}
.ar.r{right:-4vw;background:linear-gradient(270deg,var(--bg) 20%,transparent)}
.rw:hover .ar{opacity:1}
.ar:hover{color:var(--cyan)}
.card{flex:0 0 300px;background:none;border:0;padding:0;color:inherit;text-align:left;cursor:pointer;scroll-snap-align:start;font:inherit}
.thumb{position:relative;height:168px;border-radius:12px;overflow:hidden;display:flex;align-items:flex-end;padding:14px;border:1px solid #2a2338;box-shadow:0 10px 28px rgba(0,0,0,.5);background:radial-gradient(circle at 20% 15%,var(--a),transparent 65%),radial-gradient(circle at 90% 90%,var(--b),transparent 65%),#160a12;transition:transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s,border-color .3s,opacity .3s}
.thumb::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(0deg,rgba(0,0,0,.55),transparent 55%);pointer-events:none}
.thumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .6s}
.thumb b{position:relative;z-index:2;font:700 20px/1.15 var(--hf);text-shadow:0 2px 10px #000}
.card:hover .thumb,.card:focus-visible .thumb{transform:translateY(-8px) scale(1.05);border-color:var(--cyan);box-shadow:0 22px 46px rgba(0,0,0,.65),0 0 30px rgba(25,230,180,.25)}
.card:hover .thumb img{transform:scale(1.1)}
.row:hover .card:not(:hover) .thumb{opacity:.55}
.card:focus-visible{outline:2px solid var(--cyan);outline-offset:4px;border-radius:12px}
.play{position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;background:rgba(255,45,85,.92);display:grid;place-items:center;z-index:2;opacity:0;transform:scale(.6);transition:opacity .25s,transform .3s cubic-bezier(.2,.8,.2,1.4);box-shadow:0 0 30px rgba(255,45,85,.6)}
.play::after{content:"";border-left:14px solid #fff;border-top:9px solid transparent;border-bottom:9px solid transparent;margin-left:4px}
.card:hover .play,.card:focus-visible .play{opacity:1;transform:none}
@media(hover:none){.play{opacity:1;transform:none;width:38px;height:38px;margin:0;left:auto;top:auto;right:12px;bottom:12px}.play::after{border-left-width:11px;border-top-width:7px;border-bottom-width:7px;margin-left:3px}}
.lock{position:absolute;left:12px;top:12px;font-size:11px;background:var(--red);border-radius:4px;padding:2px 7px;font-weight:700;z-index:2}
.title{margin:16px 2px 0;font:500 15px/1.35 var(--hf);background:linear-gradient(var(--cyan),var(--cyan)) 0 100%/0 2px no-repeat;display:inline;transition:background-size .35s}
.card:hover .title{background-size:100% 2px}
.empty{text-align:center;color:var(--muted);padding:80px 0}
#nores{display:none}
.ft{max-width:1500px;margin:0 auto;padding:30px 4vw 44px;border-top:1px solid #1f1a28;color:var(--muted);font-size:13px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
.js .rv{opacity:0;transform:translateY(34px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.8,.2,1);transition-delay:calc(var(--i,0)*90ms)}
.js .rv.in{opacity:1;transform:none}
/* ===== end new streaming UI ===== */

#modal{}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.86);display:none;align-items:center;justify-content:center;padding:14px;z-index:40}
.ov.open{display:flex}
.ov.open>.ch,.ov.open>.adb{animation:pop .28s cubic-bezier(.2,.9,.3,1.2)}
@keyframes pop{from{opacity:0;transform:scale(.88) translateY(14px)}}
.ch{width:min(316px,100%);background:#150a0f;border:1px solid #4a1520;border-radius:12px;padding:26px 20px 18px;text-align:center;box-shadow:0 0 40px rgba(255,45,85,.15)}
.ch h3{font:700 17px/1.3 Georgia,serif;margin:0 0 10px}.ch p{font-size:12px;margin:0 0 16px}
.bt{display:flex;gap:12px;justify-content:center}
.g1{border:1px solid #b56bff;border-radius:10px;padding:12px 18px;color:#fff;font:700 13px Georgia,serif;cursor:pointer;background:linear-gradient(135deg,#1ea7ff,#7a3cff);box-shadow:0 0 16px rgba(122,60,255,.6)}
.cn{margin-top:16px;font-size:12px;color:#fff;background:none;border:0;text-decoration:underline;cursor:pointer}
.adb{position:relative;width:min(300px,100%);height:min(370px,80vh);background:#1a0b10;border:1px solid #5a1a28;border-radius:14px;padding:12px}
.adi{width:100%;height:100%;border:1px dashed #5a2a35;border-radius:8px;display:grid;place-items:center;font-size:11px;color:#aaa;overflow:hidden}
.adi img{width:100%;height:100%;object-fit:cover}
#cd{position:absolute;top:22px;right:22px;width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,.75);border:2px solid #ff7a45;color:#fff;font-weight:700}
#cd.rd{cursor:pointer;border-color:#fff}
.pb{width:min(780px,100%);max-height:94vh;display:flex;flex-direction:column;background:#000;border-radius:10px;overflow:hidden}
.frame{aspect-ratio:16/9;width:100%;background:#000;flex-shrink:0}.frame iframe{width:100%;height:100%;border:0}

/* ===== OK player patches (link button, title/branding, OK logo, native fullscreen) ===== */
.frame{
  /* Patch sizes: galat jagah lage to ?debug=1 se dekh ke yahin numbers badlo */
  --top-h:17%;    /* upar ki patti: link button + title + VK branding */
  --ok-w:6%;      /* neeche-right OK logo */
  --fs-w:5.6%;    /* OK ka apna fullscreen button (iski jagah hamara chalega) */
  --bar-h:11%;    /* neeche ki control bar ki height */
  position:relative;
}
.patch{position:absolute;z-index:5;background:transparent;transition:background .15s}
.p-top{top:0;left:0;right:0;height:var(--top-h)}
.p-ok{right:0;bottom:0;width:var(--ok-w);height:var(--bar-h)}
.p-fs{right:var(--ok-w);bottom:0;width:var(--fs-w);height:var(--bar-h);display:flex;align-items:center;justify-content:center;cursor:pointer}
.p-fs svg{width:46%;height:auto;opacity:0;transition:opacity .15s}
/* mobile/touch: phone me OK ka fullscreen icon control row me hai (progress bar ke upar, right side).
   Hamara patch usi ke upar (px me, kyunki OK ke controls fixed size ke hote hain). Position galat lage to ?debug=1 se dekh ke bottom/right/width/height badlo */
@media (hover:none) and (pointer:coarse),(max-width:600px){
  .p-ok{display:none}
  .p-fs{right:4px;bottom:30px;width:44px;height:36px}
  .p-fs svg{width:50%}
}
.frame:hover .p-top{background:linear-gradient(rgba(0,0,0,.9),rgba(0,0,0,0))}
.frame:hover .p-ok,.frame:hover .p-fs{background:rgba(0,0,0,.92)}
.frame:hover .p-fs svg{opacity:1}
.frame:fullscreen,.frame.pseudo-fs{width:100vw;height:100vh;aspect-ratio:auto}
.frame.pseudo-fs{position:fixed;inset:0;z-index:9999}
@media (orientation:portrait){
  .frame.pseudo-fs{inset:auto;top:0;left:100vw;width:100vh;height:100vw;transform-origin:0 0;transform:rotate(90deg)}
}
body.dbg .patch{background:rgba(255,0,0,.45)!important}
body.dbg .p-fs svg{opacity:1}
/* ===== end patches ===== */

/* ===== Load fail / retry fallback ===== */
.fb{position:absolute;inset:0;z-index:20;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:16px;background:#000;color:#fff;font-size:14px;line-height:1.4}
.fb.open{display:flex}
.fb .bt{flex-wrap:wrap}
.fb a.g1{text-decoration:none;display:inline-block}
.fb .g1{padding:10px 16px}
/* ===== end fallback ===== */

.info{display:flex;gap:14px;justify-content:space-between;align-items:flex-start;padding:14px 16px;overflow:auto;background:#0a0a0f}
.info h3{font:700 17px/1.3 Georgia,serif;margin:0 0 6px}
.info p{margin:0;color:#b4aec0;font-size:13px;line-height:1.55;white-space:pre-line}
#px{flex:0 0 34px;height:34px;border-radius:50%;background:#1a0b10;border:1px solid var(--red);color:#fff;cursor:pointer}
@media(orientation:landscape) and (max-height:520px){.pb{width:100%;height:100%;max-height:100%;flex-direction:row}.frame{flex:1 1 62%;aspect-ratio:auto;height:100%}.info{flex:1 1 38%}}
@media(max-width:820px){.nl{display:none}.nav{gap:12px}.sr{flex:1}#q,#q:focus{width:100%}.hero{padding:110px 5vw 70px;min-height:74vh}.ar{display:none}}
@media(max-width:600px){main{padding:0 14px 40px}.card{flex-basis:260px}.thumb{height:146px}h2{font-size:21px}.hc p{font-size:15px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}.js .rv{opacity:1;transform:none}}
</style></head><body>
<?php if($b['on'] && $b['text']): ?>
<div id="bc" data-k="<?=md5($b['text'].$b['link'])?>"><span><?=h($b['text'])?> <?php if($b['link']):?><a href="<?=h($b['link'])?>" target="_blank" rel="noopener">Dekho</a><?php endif;?></span><button aria-label="Band karo">&times;</button></div>
<?php endif; ?>
<nav class="nav" id="nav">
  <a class="brand" href="#"><svg viewBox="0 0 24 24"><path d="M2 8l4.5 4L12 4l5.5 8L22 8l-2 11H4L2 8z"/></svg><?=h($d['site']['name'])?></a>
  <div class="nl"><?php foreach($cn as [$c,$n]): ?><a href="#c-<?=h($c['id'])?>"><?=h($c['name'])?></a><?php endforeach; ?></div>
  <div class="sr"><input id="q" type="search" placeholder="Lecture dhundo" aria-label="Lecture dhundo" autocomplete="off"></div>
</nav>
<?php if($hero): $hh=crc32($hero['id'])%360; ?>
<header class="hero">
  <div class="bg" style="--a:hsl(<?=$hh?> 70% 24%);--b:hsl(<?=($hh+70)%360?> 60% 15%)"><?php if($hero['thumb']): ?><img src="<?=h(big($hero['thumb']))?>" alt=""><?php endif; ?></div>
  <div class="hc">
    <div class="hmeta"><?=h($catn[$hero['cat']]??'')?><?php if(!empty($catm[$hero['cat']])): ?><span class="lock2">MEMBERS</span><?php endif; ?></div>
    <h1><?=h($hero['title'])?></h1>
    <?php if(!empty($hero['desc'])): ?><p><?=h($hero['desc'])?></p><?php else: ?><p><?=h($d['site']['tag'])?></p><?php endif; ?>
    <div class="hb"><button class="pbtn" id="hp" data-vid="<?=h($hero['id'])?>">&#9654; WATCH</button><a class="more" href="#lib">OTHER MOVIES/WEBSERIES</a></div>
  </div>
</header>
<?php else: ?>
<header class="hero nov"><div class="bg"></div><div class="hc"><div class="hmeta"><?=h($d['site']['tag'])?></div><h1><?=h($d['site']['name'])?></h1><p><?=$all?'':'Abhi koi lecture nahi hai.'?></p></div></header>
<?php endif; ?>
<main id="lib">
<?php foreach($d['categories'] as $c):
  $vs=array_values(array_filter($d['videos'],fn($v)=>$v['cat']===$c['id']));
  if(!$vs) continue; $any=true;
  usort($vs,fn($a,$b)=>$b['time']<=>$a['time']); ?>
<section id="c-<?=h($c['id'])?>">
  <h2 class="rv"><?=h($c['name'])?><span class="count"><?=count($vs)?> lectures</span></h2>
  <div class="rw">
  <button class="ar l" aria-label="Peeche">&#8249;</button><button class="ar r" aria-label="Aage">&#8250;</button>
  <div class="row">
  <?php foreach($vs as $k=>$v): $hue=crc32($v['id'])%360; ?>
    <button class="card rv" style="--i:<?=min($k,6)?>" data-id="<?=h($v['okid'])?>" data-vid="<?=h($v['id'])?>" data-t="<?=h($v['title'])?>" data-d="<?=h($v['desc']??'')?>" data-dl="<?=h($v['dl']??'')?>">
      <div class="thumb" style="--a:hsl(<?=$hue?> 70% 24%);--b:hsl(<?=($hue+70)%360?> 60% 15%)">
        <?php if($v['thumb']): ?><img src="<?=h(thumb($v['thumb']))?>" alt="" loading="lazy"><?php else: ?><b><?=h($v['title'])?></b><?php endif; ?>
        <span class="play"></span><?php if($c['members']): ?><span class="lock">MEMBERS</span><?php endif; ?>
      </div>
      <div class="title"><?=h($v['title'])?></div>
    </button>
  <?php endforeach; ?>
  </div>
  </div>
</section>
<?php endforeach; ?>
<?php if(!$any): ?><div class="empty">Abhi koi lecture nahi hai. Admin panel se pehla lecture add karo.</div><?php endif; ?>
<div class="empty" id="nores">Is naam ka koi lecture nahi mila.</div>
</main>
<footer class="ft"><span><?=h($d['site']['name'])?></span><span><?=h($d['site']['tag'])?></span></footer>
<div id="ch" class="ov"><div class="ch">
  <h3 id="ct"></h3><p>How would you like to watch this?</p>
  <div class="bt"><button class="g1" id="stb">&#9654; Stream</button><button class="g1" id="dlb">&#8595; Download</button></div>
  <button class="cn" id="cc">Cancel</button></div></div>
<div id="ad" class="ov" data-sec="<?=(int)$ad['sec']?>"><div class="adb">
  <div class="adi"><?php if($ad['img']): ?><?php if($ad['link']): ?><a href="<?=h($ad['link'])?>" target="_blank" rel="noopener sponsored" style="display:block;width:100%;height:100%"><?php endif; ?><img src="<?=h($ad['img'])?>" alt="Ad"><?php if($ad['link']): ?></a><?php endif; ?><?php else: ?>AD<?php endif; ?></div>
  <button id="cd" aria-label="Continue"></button></div></div>
<div id="pm" class="ov"><div class="pb">
  <div class="frame">
    <!-- allowfullscreen / allow=fullscreen jaan-bujh ke hata diya: OK ka apna fullscreen band, hamara (patch wala) chalega -->
    <iframe id="pf" allow="autoplay; picture-in-picture" title="Player"></iframe>
    <div class="patch p-top"></div>
    <div class="patch p-ok"></div>
    <div class="patch p-fs" id="pfs" title="Fullscreen"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></div>
    <div class="fb" id="fb">
      <div>Video load nahi hua. Network slow ya blocked ho sakta hai.</div>
      <div class="bt"><button class="g1" id="fbr">Dobara try karo</button><a class="g1" id="fbo" target="_blank" rel="noopener">Naye tab me kholo</a></div>
    </div>
  </div>
  <div class="info"><div><h3 id="pt"></h3><p id="pd"></p></div><button id="px" aria-label="Band karo">&times;</button></div>
</div></div>
<script>
const $=i=>document.getElementById(i);
let cur=null,tm=null;
const show=i=>$(i).classList.add('open'),hide=i=>$(i).classList.remove('open');
document.querySelectorAll('.card').forEach(c=>c.onclick=()=>{
  cur=c.dataset;$('ct').textContent=cur.t;$('dlb').style.display=cur.dl?'':'none';show('ch');
});
$('cc').onclick=()=>hide('ch');
$('stb').onclick=()=>{hide('ch');runAd('s')};
$('dlb').onclick=()=>{hide('ch');runAd('d')};
// Stream ab us video ke dedicated page (watch.php) par le jaata hai
function go(k){ if(k==='s')location.href='watch.php?v='+encodeURIComponent(cur.vid); else window.open(cur.dl,'_blank','noopener'); }
function runAd(k){
  let n=+$('ad').dataset.sec; if(n<=0){go(k);return}
  const cd=$('cd');cd.textContent=n;cd.className='';cd.disabled=true;show('ad');
  clearInterval(tm);
  tm=setInterval(()=>{n--;if(n>0){cd.textContent=n}else{clearInterval(tm);cd.textContent='\u2715';cd.className='rd';cd.disabled=false}},1000);
  cd.onclick=()=>{if(cd.disabled)return;hide('ad');go(k)};
}

// ===== OK load + auto-retry (8 sec me koi message na aaye to src dobara set, max 2 baar, phir fallback) =====
const RETRY_MS=8000,MAX_RETRY=2;
let rt=null,tries=0,gotMsg=false;
function loadOk(retry){
  gotMsg=false;clearTimeout(rt);hide('fb');
  $('pf').src='https://ok.ru/videoembed/'+cur.id+'?autoplay=1'+(retry?'&_='+Date.now():'');   // official embed: token khud refresh hota hai
  rt=setTimeout(()=>{
    if(gotMsg||!$('pm').classList.contains('open'))return;
    if(tries<MAX_RETRY){tries++;dbgLog('retry '+tries);loadOk(true)}
    else{$('pf').src='about:blank';show('fb')}
  },RETRY_MS);
}
function play(){
  $('pt').textContent=cur.t;$('pd').textContent=cur.d||'';
  $('fbo').href='https://ok.ru/video/'+encodeURIComponent(cur.id);
  tries=0;
  show('pm');
  loadOk(false);
}
$('fbr').onclick=()=>{tries=0;loadOk(true)};
function stop(){
  const f=document.querySelector('#pm .frame');
  clearTimeout(rt);
  if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  f.classList.remove('pseudo-fs');
  hide('fb');hide('pm');$('pf').src='about:blank';
}
$('px').onclick=stop;
$('pm').onclick=e=>{if(e.target.id==='pm')stop()};
document.onkeydown=e=>{if(e.key==='Escape'){stop();hide('ch')}};

// Hamara fullscreen (patch wale poore .frame ko fullscreen karta hai) + mobile par seedha landscape
const unlockOri=()=>{try{screen.orientation&&screen.orientation.unlock&&screen.orientation.unlock()}catch(_){}};
const toggleFS=async()=>{
  const f=document.querySelector('#pm .frame');
  if(document.fullscreenElement){unlockOri();document.exitFullscreen().catch(()=>{});return}
  if(f.requestFullscreen){
    try{
      await f.requestFullscreen();
      if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock('landscape').catch(()=>{});
    }catch(_){}
  }else{f.classList.toggle('pseudo-fs')}   // iPhone Safari fallback (CSS se landscape me ghumta hai)
};
$('pfs').onclick=toggleFS;
// fullscreen se kisi bhi tarah bahar aao (back gesture etc.) to orientation lock hata do
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)unlockOri()});
// Test mode: site ko index.php?debug=1 se kholo to patch laal dikhenge
if(location.search.indexOf('debug')>-1)document.body.classList.add('dbg');

// Video khatam hote hi player band (OK ka end-screen / related videos na dikhe)
const END_RE=/(^|[^a-z])(ended|finished|videoended|playbackended)([^a-z]|$)/;
let dbgEl=null;
function dbgLog(t){
  if(!document.body.classList.contains('dbg'))return;
  if(!dbgEl){
    dbgEl=document.createElement('pre');
    dbgEl.style.cssText='position:fixed;left:0;bottom:0;max-width:60vw;max-height:35vh;overflow:auto;margin:0;padding:6px 8px;background:#000c;color:#0f0;font:11px monospace;z-index:99999;white-space:pre-wrap';
    document.body.appendChild(dbgEl);
  }
  dbgEl.textContent=(t+'\n'+dbgEl.textContent).slice(0,3000);
}
window.addEventListener('message',e=>{
  if(!/ok\.ru|odnoklassniki/.test(e.origin))return;
  if(!$('pm').classList.contains('open'))return;
  let s='';try{s=typeof e.data==='string'?e.data:JSON.stringify(e.data)}catch(_){}
  dbgLog(s.slice(0,200));
  // OK zinda hai: retry timer band, fallback hatao
  gotMsg=true;clearTimeout(rt);hide('fb');
  if(END_RE.test(s.toLowerCase()))stop();
});

const bc=document.getElementById('bc');
if(bc){try{if(localStorage.getItem('bc')===bc.dataset.k)bc.remove()}catch(e){}
  bc.querySelector('button').onclick=()=>{try{localStorage.setItem('bc',bc.dataset.k)}catch(e){}bc.remove()}}
</script>
<script>
// ===== Naye UI ke effects (sirf dikhawat: nav, reveal, arrows, search, hero play) =====
(function(){
  var rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var nav=document.getElementById('nav');
  var onS=function(){nav.classList.toggle('solid',window.scrollY>40)};onS();window.addEventListener('scroll',onS,{passive:true});
  var els=document.querySelectorAll('.rv');
  if(rm||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')})}
  else{var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.12});els.forEach(function(e){io.observe(e)})}
  document.querySelectorAll('.rw').forEach(function(w){
    var row=w.querySelector('.row');
    w.querySelector('.ar.l').onclick=function(){row.scrollBy({left:-row.clientWidth*.8,behavior:'smooth'})};
    w.querySelector('.ar.r').onclick=function(){row.scrollBy({left:row.clientWidth*.8,behavior:'smooth'})};
  });
  // hero ka Play button = wahi card click (Stream/Download choice, phir ad, phir watch page)
  var hp=document.getElementById('hp');
  if(hp)hp.onclick=function(){var c=document.querySelector('.card[data-vid="'+hp.dataset.vid+'"]');if(c)c.click()};
  // search: title se cards filter
  var q=document.getElementById('q'),nr=document.getElementById('nores');
  q.addEventListener('input',function(){
    var s=q.value.trim().toLowerCase(),total=0;
    document.querySelectorAll('.rv').forEach(function(e){e.classList.add('in')});
    document.querySelectorAll('main section').forEach(function(sec){
      var n=0;sec.querySelectorAll('.card').forEach(function(c){var m=!s||c.dataset.t.toLowerCase().indexOf(s)>-1;c.style.display=m?'':'none';if(m)n++});
      sec.style.display=n?'':'none';total+=n;
    });
    nr.style.display=(s&&!total)?'block':'none';
    if(s)document.getElementById('lib').scrollIntoView({behavior:'smooth'});
  });
})();
</script>
</body></html>
