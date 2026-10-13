<?php
session_start();
define('DB', __DIR__.'/data/db.json');
function db(){
  if(!file_exists(DB)){
    $d=['site'=>['name'=>'CodeHub','tag'=>'PREMIUM CODING LECTURES'],
      'categories'=>[['id'=>'c1','name'=>'Trending','members'=>0],['id'=>'c2','name'=>'Members Only','members'=>1],['id'=>'c3','name'=>'Bonus Lectures','members'=>0]],
      'videos'=>[],'broadcast'=>['on'=>0,'text'=>'','link'=>''],
      'pass'=>password_hash('admin123',PASSWORD_DEFAULT)];
    save($d);
  }
  return json_decode(file_get_contents(DB),true);
}
function save($d){ file_put_contents(DB,json_encode($d,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE),LOCK_EX); }
function h($s){ return htmlspecialchars((string)$s,ENT_QUOTES,'UTF-8'); }
function uid(){ return substr(bin2hex(random_bytes(4)),0,8); }
// ok.ru link (ya sirf number) se video ID nikalta hai
function okid($s){ $s=trim($s); if(preg_match('~(?:video|videoembed)/(\d+)~',$s,$m))return $m[1]; return preg_match('~^\d+$~',$s)?$s:''; }
// Cloudinary link ko auto resize + optimize karta hai
function thumb($u){
  if(strpos($u,'res.cloudinary.com')!==false && strpos($u,'/upload/')!==false && !preg_match('~/upload/[a-z]_~',$u))
    return str_replace('/upload/','/upload/w_640,h_360,c_fill,f_auto,q_auto/',$u);
  return $u;
}
