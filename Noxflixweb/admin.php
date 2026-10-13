<?php
require 'config.php';
$d=db();
$d['series']=$d['series']??[];
if(isset($_GET['logout'])){session_destroy();header('Location: admin.php');exit;}
if(empty($_SESSION['t']))$_SESSION['t']=bin2hex(random_bytes(16));
$T=$_SESSION['t']; $err='';
if(isset($_POST['login'])){
  if(password_verify($_POST['p']??'',$d['pass'])){session_regenerate_id(true);$_SESSION['ok']=1;header('Location: admin.php');exit;}
  $err='Password galat hai'; usleep(700000);
}
$in=!empty($_SESSION['ok']);
$tab=in_array($_GET['tab']??'',['cats','bc','set','ser'])?$_GET['tab']:'vid';

if($in && $_SERVER['REQUEST_METHOD']==='POST' && isset($_POST['a'])){
  if(!hash_equals($T,$_POST['t']??''))die('Bad token');
  $a=$_POST['a']; $m='Ho gaya'; $P=$_POST;
  if($a==='vid'){
    $oid=okid($P['url']??'');
    if(!$oid||!$P['title']){$m='Title aur valid ok.ru link daalo';}
    else{
      $th=trim($P['thumb']??''); if($th&&!preg_match('~^https://~',$th))$th='';
      $new=['id'=>$P['vid']?:uid(),'cat'=>$P['cat'],'title'=>trim($P['title']),'okid'=>$oid,'thumb'=>$th,'desc'=>trim($P['desc']??''),'dl'=>(preg_match('~^https?://~',trim($P['dl']??''))?trim($P['dl']):''),'time'=>time(),'feat'=>empty($P['feat'])?0:1];
      $f=false;
      // array_merge: edit karne par series/season/ep jaisi extra fields bani rahti hain
      foreach($d['videos'] as &$v) if($v['id']===$new['id']){$new['time']=$v['time'];$v=array_merge($v,$new);$f=true;}
      unset($v); if(!$f)$d['videos'][]=$new;
    }
  }
  if($a==='vdel') $d['videos']=array_values(array_filter($d['videos'],fn($v)=>$v['id']!==$P['id']));
  if($a==='cat'){
    $n=trim($P['name']??''); $mem=empty($P['members'])?0:1;
    if(!$n)$m='Naam daalo';
    elseif(!empty($P['id'])){foreach($d['categories'] as &$c) if($c['id']===$P['id']){$c['name']=$n;$c['members']=$mem;} unset($c);}
    else $d['categories'][]=['id'=>uid(),'name'=>$n,'members'=>$mem];
  }
  if($a==='cdel'){
    if(array_filter($d['videos'],fn($v)=>$v['cat']===$P['id']))$m='Pehle is category ke lectures hatao ya move karo';
    else $d['categories']=array_values(array_filter($d['categories'],fn($c)=>$c['id']!==$P['id']));
  }
  if($a==='cmove'){
    $i=array_search($P['id'],array_column($d['categories'],'id')); $j=$i+($P['dir']==='up'?-1:1);
    if($i!==false&&isset($d['categories'][$j])){$x=$d['categories'][$i];$d['categories'][$i]=$d['categories'][$j];$d['categories'][$j]=$x;}
  }
  if($a==='bc') $d['broadcast']=['on'=>empty($P['on'])?0:1,'text'=>trim($P['text']),'link'=>preg_match('~^https?://~',trim($P['link']))?trim($P['link']):''];
  if($a==='set'){
    $d['site']=['name'=>trim($P['name'])?:'CodeHub','tag'=>trim($P['tag'])];
    $ai=trim($P['aimg']??'');$al=trim($P['alink']??'');
    $d['ad']=['img'=>preg_match('~^https://~',$ai)?$ai:'','link'=>preg_match('~^https?://~',$al)?$al:'','sec'=>max(0,min(30,(int)($P['asec']??9)))];
    if(!empty($P['pw'])){ if(strlen($P['pw'])<6)$m='Password kam se kam 6 character ka ho'; else $d['pass']=password_hash($P['pw'],PASSWORD_DEFAULT); }
  }

  /* ===== Series / Seasons ===== */
  if($a==='sset'){   // series banao ya edit karo
    $n=trim($P['name']??''); $cat=$P['cat']??'';
    if(!$n||!array_filter($d['categories'],fn($c)=>$c['id']===$cat))$m='Series ka naam aur category daalo';
    elseif(!empty($P['id'])){
      foreach($d['series'] as &$s) if($s['id']===$P['id']){$s['name']=$n;$s['cat']=$cat;} unset($s);
      foreach($d['videos'] as &$v) if(($v['sid']??'')===$P['id'])$v['cat']=$cat; unset($v);
    }
    else $d['series'][]=['id'=>uid(),'name'=>$n,'cat'=>$cat];
  }
  if($a==='sdel'){   // poori series + uske saare episodes delete
    $d['series']=array_values(array_filter($d['series'],fn($s)=>$s['id']!==$P['id']));
    $d['videos']=array_values(array_filter($d['videos'],fn($v)=>($v['sid']??'')!==$P['id']));
  }
  if($a==='seldel'){ // ek season ke saare episodes delete
    $d['videos']=array_values(array_filter($d['videos'],fn($v)=>!(($v['sid']??'')===$P['id']&&($v['season']??'')===$P['season'])));
  }
  if($a==='sbulk'){  // ek season ke bahut saare episodes ek saath add
    $sid=$P['id']??''; $sn=trim($P['season']??''); $ser=null;
    foreach($d['series'] as $s) if($s['id']===$sid)$ser=$s;
    if(!$ser||$sn==='')$m='Season ka naam daalo';
    else{
      $max=0;
      foreach($d['videos'] as $v) if(($v['sid']??'')===$sid&&($v['season']??'')===$sn)$max=max($max,(int)($v['ep']??0));
      $ok=0;$bad=0;$now=time();
      foreach(preg_split('~\R~',trim($P['lines']??'')) as $ln){
        $ln=trim($ln); if($ln==='')continue;
        $p=array_map('trim',explode('|',$ln));
        $oid=okid($p[1]??'');
        if(!$oid||$p[0]===''){$bad++;continue;}
        $th=$p[2]??''; if($th&&!preg_match('~^https://~',$th))$th='';
        $d['videos'][]=['id'=>uid(),'cat'=>$ser['cat'],'title'=>$p[0],'okid'=>$oid,'thumb'=>$th,'desc'=>'','dl'=>'','time'=>$now-$ok,'sid'=>$sid,'season'=>$sn,'ep'=>++$max];
        $ok++;
      }
      $m=$ok?('Ho gaya - '.$ok.' episode add hue'.($bad?', '.$bad.' line galat thi (skip)':'')):'Koi valid line nahi mili. Format: Title | ok.ru link';
    }
  }
  if($a==='sep'){    // episode ka title / season / number badlo
    foreach($d['videos'] as &$v) if($v['id']===$P['id']){
      $t=trim($P['title']??''); if($t!=='')$v['title']=$t;
      $sn=trim($P['season']??''); if($sn!=='')$v['season']=$sn;
      $v['ep']=max(0,(int)($P['ep']??0));
    } unset($v);
  }

  if($a==='vdel')$go=(($P['back']??'')==='ser')?'ser':'vid';
  elseif($a==='cdel'||$a==='cmove')$go='cats';
  elseif(in_array($a,['sset','sdel','sbulk','seldel','sep']))$go='ser';
  else $go=$tab;
  save($d); $_SESSION['m']=$m; header('Location: admin.php?tab='.$go);exit;
}
$flash=$_SESSION['m']??''; unset($_SESSION['m']);
function vform($v,$d,$T){ $e=!empty($v); ?>
<form method="post" class="f"><input type="hidden" name="t" value="<?=$T?>"><input type="hidden" name="a" value="vid"><input type="hidden" name="vid" value="<?=h($v['id']??'')?>">
<select name="cat"><?php foreach($d['categories'] as $c):?><option value="<?=$c['id']?>" <?=($v['cat']??'')===$c['id']?'selected':''?>><?=h($c['name'])?></option><?php endforeach;?></select>
<input name="title" placeholder="Lecture title" value="<?=h($v['title']??'')?>" required>
<input name="url" placeholder="ok.ru video link" value="<?=$e?h('https://ok.ru/video/'.$v['okid']):''?>" required>
<input name="thumb" placeholder="Cloudinary thumbnail link (https://...)" value="<?=h($v['thumb']??'')?>">
<textarea name="desc" rows="3" placeholder="Description (player me video ke neeche dikhega)" style="flex-basis:100%"><?=h($v['desc']??'')?></textarea>
<input name="dl" placeholder="Download link (optional, Drive/Telegram/direct link)" value="<?=h($v['dl']??'')?>" style="flex-basis:100%">
<label style="flex-basis:100%"><input type="checkbox" name="feat" value="1" <?=!empty($v['feat'])?'checked':''?>> Home page ke top (hero) par dikhao</label>    
<button class="b"><?=$e?'Save':'Lecture add karo'?></button></form>
<?php } ?>
<!DOCTYPE html><html lang="hi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#14141f;color:#e6e6f0;font:14px "Segoe UI",system-ui,sans-serif}
.wrap{display:flex;min-height:100vh}nav{width:210px;background:#181826;border-right:1px solid #262638;padding:20px 12px;flex-shrink:0}
nav h1{font-size:18px;margin:0 8px 20px}nav a{display:block;padding:10px 12px;border-radius:8px;color:#b4b4c8;text-decoration:none;margin-bottom:4px}
nav a.on{background:#232338;color:#1ea7ff}main{flex:1;padding:24px;max-width:960px}h2{margin:0 0 16px}
.f{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}.f>*{flex:1 1 200px}
input,select,textarea{background:#0f0f19;border:1px solid #2c2c44;color:#fff;border-radius:8px;padding:10px;font:inherit}
input[type=checkbox]{flex:0 0 auto}label{display:flex;align-items:center;gap:8px;flex:0 0 auto}
.b{background:#1ea7ff;border:0;color:#fff;border-radius:8px;padding:10px 16px;font-weight:600;cursor:pointer;flex:0 0 auto}
.r{background:#ff3d71}.g{background:#2c2c44}
.box{background:#181826;border:1px solid #262638;border-radius:12px;padding:16px;margin-bottom:14px}
.row{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}.row img{width:96px;height:54px;object-fit:cover;border-radius:6px;background:#0f0f19}
.row>div:first-child{display:flex;gap:12px;align-items:center}small{color:#8b8ba3}
.ms{background:#1c3a2c;color:#7dffb0;padding:10px 14px;border-radius:8px;margin-bottom:14px}.ws{background:#4a2a10;color:#ffcf99}.er{background:#4a1a26;color:#ff9db3}
details summary{cursor:pointer;color:#1ea7ff;margin-top:10px}
.login{max-width:340px;margin:16vh auto;padding:0 16px}
.sn{margin-top:14px;padding-top:12px;border-top:1px solid #262638}
.er2{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0}
@media(max-width:700px){.wrap{flex-direction:column}nav{width:100%;display:flex;flex-wrap:wrap;gap:4px}nav h1{width:100%}nav a{margin:0}}
</style></head><body>
<?php if(!$in): ?>
<div class="login"><div class="box"><h2>Admin login</h2>
<?php if($err):?><div class="ms er"><?=h($err)?></div><?php endif;?>
<form method="post" class="f"><input type="password" name="p" placeholder="Password" autofocus required><button class="b" name="login" value="1">Login</button></form></div></div>
<?php else: ?>
<div class="wrap"><nav><h1>👑 <?=h($d['site']['name'])?></h1>
<a href="?tab=vid" class="<?=$tab==='vid'?'on':''?>">Lectures</a><a href="?tab=ser" class="<?=$tab==='ser'?'on':''?>">Series</a><a href="?tab=cats" class="<?=$tab==='cats'?'on':''?>">Categories</a>
<a href="?tab=bc" class="<?=$tab==='bc'?'on':''?>">Broadcast</a><a href="?tab=set" class="<?=$tab==='set'?'on':''?>">Settings</a>
<a href="index.php" target="_blank">Site dekho</a><a href="?logout=1">Logout</a></nav>
<main>
<?php if(password_verify('admin123',$d['pass'])):?><div class="ms ws">Default password (admin123) abhi bhi chalu hai. Settings me jaake badlo.</div><?php endif;?>
<?php if($flash):?><div class="ms <?=strpos($flash,'Ho gaya')===0?'':'er'?>"><?=h($flash)?></div><?php endif;?>

<?php if($tab==='vid'): ?>
<h2>Lectures</h2>
<div class="box"><?php if(!$d['categories']):?>Pehle category banao.<?php else: vform([],$d,$T); endif;?>
<small>Thumbnail: Cloudinary par image upload karo, uska link yahan paste karo. Site khud 640x360 me optimize kar legi.</small></div>
<?php $vs=$d['videos']; usort($vs,fn($a,$b)=>$b['time']<=>$a['time']);
$cn=array_column($d['categories'],'name','id');
foreach($vs as $v): ?>
<div class="box"><div class="row"><div><?php if($v['thumb']):?><img src="<?=h(thumb($v['thumb']))?>" alt=""><?php else:?><img alt=""><?php endif;?>
<div><b><?=h($v['title'])?></b><br><small><?=h($cn[$v['cat']]??'?')?> | ID <?=h($v['okid'])?><?=!empty($v['sid'])?' | '.h($v['season']??'').' E'.(int)($v['ep']??0):''?></small></div></div>
<form method="post" onsubmit="return confirm('Delete karna hai?')"><input type="hidden" name="t" value="<?=$T?>"><input type="hidden" name="a" value="vdel"><input type="hidden" name="id" value="<?=$v['id']?>"><button class="b r">Delete</button></form></div>
<details><summary>Edit</summary><div style="margin-top:10px"><?php vform($v,$d,$T);?></div></details></div>
<?php endforeach; if(!$vs):?><small>Abhi koi lecture nahi hai.</small><?php endif;?>

<?php elseif($tab==='ser'): ?>
<h2>Series / Seasons</h2>
<div class="box"><?php if(!$d['categories']):?>Pehle category banao.<?php else: ?>
<form method="post" class="f"><input type="hidden" name="t" value="<?=$T?>"><input type="hidden" name="a" value="sset">
<input name="name" placeholder="Series ka naam (jaise: React Full Course)" required>
<select name="cat"><?php foreach($d['categories'] as $c):?><option value="<?=$c['id']?>"><?=h($c['name'])?></option><?php endforeach;?></select>
<button class="b">Series banao</button></form>
<small>Category = home page par is series ke episodes kis category me dikhenge. Home par episodes normal lectures ki tarah dikhte hain. Video kholne par (ad ke baad) player ke neeche season filter aur episode list aati hai.</small><?php endif;?></div>
<?php foreach($d['series'] as $s):
  $eps=array_values(array_filter($d['videos'],fn($v)=>($v['sid']??'')===$s['id']));
  $by=[]; foreach($eps as $v)$by[(string)($v['season']??'')][]=$v;
  uksort($by,'strnatcasecmp'); ?>
<div class="box">
<form method="post" class="f"><input type="hidden" name="t" value="<?=$T?>"><input type="hidden" name="a" value="sset"><input type="hidden" name="id" value="<?=h($s['id'])?>">
<input name="name" value="<?=h($s['name'])?>" required>
<select name="cat"><?php foreach($d['categories'] as $c):?><option value="<?=$c['id']?>" <?=$s['cat']===$c['id']?'selected':''?>><?=h($c['name'])?></option><?php endforeach;?></select>
<small><?=count($by)?> season | <?=count($eps)?> episodes</small><button class="b">Save</button></form>
<details <?=$eps?'':'open'?>><summary>Season / episodes add karo</summary>
<form method="post" class="f" style="margin-top:10px"><input type="hidden" name="t" value="<?=$T?>"><input type="hidden" name="a" value="sbulk"><input type="hidden" name="id" value="<?=h($s['id'])?>">
<input name="season" placeholder="Season ka naam (jaise: Season 1)" list="sl<?=h($s['id'])?>" required>
<datalist id="sl<?=h($s['id'])?>"><?php foreach(array_keys($by) as $sn):?><option value="<?=h($sn)?>"><?php endforeach;?></datalist>
<textarea name="lines" rows="6" style="flex-basis:100%" placeholder="Har line me ek episode:&#10;Episode 1 - Intro | https://ok.ru/video/123456&#10;Episode 2 - Setup | https://ok.ru/video/789012 | https://thumbnail-link (optional)" required></textarea>
<button class="b">Episodes add karo</button></form>
<small>Format: Title | ok.ru link | thumbnail link (optional). Episode number line ke order se apne aap lagta hai. Description ya download link ke liye Lectures tab me Edit karo.</small></details>
<?php foreach($by as $sn=>$list): usort($list,fn($x,$y)=>((int)($x['ep']??0))<=>((int)($y['ep']??0))); ?>
<div class="sn"><div class="row"><b><?=h($sn)?> <small>(<?=count($list)?> episodes)</small></b>
<form method="post" onsubmit="return confirm('Ye poora season delete karna hai?')"><input type="hidden" name="t" value="<?=$T?>"><input type="hidden" name="a" value="seldel"><input type="hidden" name="id" value="<?=h($s['id'])?>"><input type="hidden" name="season" value="<?=h($sn)?>"><button class="b r">Season delete</button></form></div>
<?php foreach($list as $v): ?>
<div class="er2"><form method="post" class="f" style="flex:1 1 320px;margin:0"><input type="hidden" name="t" value="<?=$T?>"><input type="hidden" name="a" value="sep"><input type="hidden" name="id" value="<?=h($v['id'])?>">
<input type="number" name="ep" min="0" value="<?=(int)($v['ep']??0)?>" title="Episode number" style="flex:0 0 70px"><input name="season" value="<?=h($v['season']??'')?>" title="Season" style="flex:0 1 130px"><input name="title" value="<?=h($v['title'])?>"><button class="b g">Save</button></form>
<form method="post" style="flex:0 0 auto" onsubmit="return confirm('Episode delete karna hai?')"><input type="hidden" name="t" value="<?=$T?>"><input type="hidden" name="a" value="vdel"><input type="hidden" name="back" value="ser"><input type="hidden" name="id" value="<?=h($v['id'])?>"><button class="b r">Delete</button></form></div>
<?php endforeach; ?></div>
<?php endforeach; ?>
<form method="post" style="margin-top:14px" onsubmit="return confirm('Poori series aur uske SAARE episodes delete honge. Pakka?')"><input type="hidden" name="t" value="<?=$T?>"><input type="hidden" name="a" value="sdel"><input type="hidden" name="id" value="<?=h($s['id'])?>"><button class="b r">Series delete (saare episodes ke saath)</button></form>
</div>
<?php endforeach; if(!$d['series']):?><small>Abhi koi series nahi hai.</small><?php endif;?>

<?php elseif($tab==='cats'): ?>
<h2>Categories</h2>
<div class="box"><form method="post" class="f"><input type="hidden" name="t" value="<?=$T?>"><input type="hidden" name="a" value="cat">
<input name="name" placeholder="Nayi category ka naam" required><label><input type="checkbox" name="members"> Members badge</label><button class="b">Add</button></form></div>
<?php foreach($d['categories'] as $c): $cnt=count(array_filter($d['videos'],fn($v)=>$v['cat']===$c['id'])); ?>
<div class="box"><form method="post" class="f"><input type="hidden" name="t" value="<?=$T?>"><input type="hidden" name="a" value="cat"><input type="hidden" name="id" value="<?=$c['id']?>">
<input name="name" value="<?=h($c['name'])?>" required><label><input type="checkbox" name="members" <?=$c['members']?'checked':''?>> Members</label><small><?=$cnt?> lectures</small><button class="b">Save</button></form>
<div class="f" style="margin:0">
<?php foreach(['up'=>'Upar','down'=>'Neeche'] as $k=>$l):?><form method="post" style="flex:0 0 auto"><input type="hidden" name="t" value="<?=$T?>"><input type="hidden" name="a" value="cmove"><input type="hidden" name="id" value="<?=$c['id']?>"><input type="hidden" name="dir" value="<?=$k?>"><button class="b g"><?=$l?></button></form><?php endforeach;?>
<form method="post" style="flex:0 0 auto" onsubmit="return confirm('Category delete karni hai?')"><input type="hidden" name="t" value="<?=$T?>"><input type="hidden" name="a" value="cdel"><input type="hidden" name="id" value="<?=$c['id']?>"><button class="b r">Delete</button></form></div></div>
<?php endforeach;?>

<?php elseif($tab==='bc'): $b=$d['broadcast']; ?>
<h2>Broadcast</h2>
<div class="box"><form method="post" class="f"><input type="hidden" name="t" value="<?=$T?>"><input type="hidden" name="a" value="bc">
<label><input type="checkbox" name="on" <?=$b['on']?'checked':''?>> Site par dikhao</label>
<input name="text" placeholder="Message (jaise: Nayi React series aa gayi!)" value="<?=h($b['text'])?>" style="flex-basis:100%">
<input name="link" placeholder="Optional link (https://...)" value="<?=h($b['link'])?>" style="flex-basis:100%"><button class="b">Save broadcast</button></form>
<small>Ye site ke sabse upar banner me dikhta hai. Message badalne par sabko dobara dikhega, chahe unhone pehle band kiya ho.</small></div>

<?php else: ?>
<h2>Settings</h2>
<div class="box"><form method="post" class="f"><input type="hidden" name="t" value="<?=$T?>"><input type="hidden" name="a" value="set">
<input name="name" placeholder="Site ka naam" value="<?=h($d['site']['name'])?>"><input name="tag" placeholder="Tagline" value="<?=h($d['site']['tag'])?>">
<?php $ad=$d['ad']??['img'=>'','link'=>'','sec'=>9];?>
<input name="aimg" placeholder="Ad image link (https://...) - khali = AD placeholder" value="<?=h($ad['img'])?>" style="flex-basis:100%">
<input name="alink" placeholder="Ad click link (optional)" value="<?=h($ad['link'])?>"><input type="number" name="asec" min="0" max="30" value="<?=(int)$ad['sec']?>" title="Ad seconds (0 = ad band)">
<input type="password" name="pw" placeholder="Naya password (khali chhodo to same rahega)" style="flex-basis:100%"><button class="b">Save</button></form></div>
<?php endif;?>
</main></div>
<?php endif; ?>
</body></html>
