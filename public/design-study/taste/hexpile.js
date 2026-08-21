(function(){
"use strict";

/* Mounted by a React effect rather than parsed once with the document, so the
   study has to be able to shut itself down and start over on a remount. */
if(typeof window.__hexpileTeardown==="function"){ try{ window.__hexpileTeardown(); }catch(e){} }
var dead=false, rafId=0;

var TAU = Math.PI*2;
var GOAL = 6;
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Pointy-top hexagon: a vertex at the top and the bottom, flat left and
   right sides. Height is 2/sqrt(3) of the width. */
var HEX_RATIO = 1.1547;
var HEX_R = 0.12;                 // corner setback, as a share of tile width

/* ============================================================
   THE TILES
   Each image is embedded so the page is one self-contained file. To swap in
   your own, replace `src` with a path — any aspect ratio, the crop is worked
   out for you (see bestCrop below). Nothing is ever stretched to fit.
   ============================================================ */
var TILES = [
  {id:'threshold', name:'Threshold', src:'/design-study/taste/img/threshold.jpg'},
  {id:'playthings', name:'Playthings', src:'/design-study/taste/img/playthings.jpg'},
  {id:'overgrowth', name:'Overgrowth', src:'/design-study/taste/img/overgrowth.jpg'},
  {id:'paradise', name:'Digital Paradise', src:'/design-study/taste/img/paradise.jpg'},
  {id:'interface', name:'Interface', src:'/design-study/taste/img/interface.jpg'},
  {id:'bloom', name:'Bloom', src:'/design-study/taste/img/bloom.jpg'},
  {id:'lattice', name:'Lattice', src:'/design-study/taste/img/lattice.jpg'},
  {id:'terrain', name:'Terrain', src:'/design-study/taste/img/terrain.jpg'},
  {id:'ripple', name:'Ripple', src:'/design-study/taste/img/ripple.jpg'},
  {id:'happy', name:'Mr Happy', src:'/design-study/taste/img/happy.jpg'},
  {id:'peaches', name:'Peaches', src:'/design-study/taste/img/peaches.jpg'},
  {id:'wordmark', name:'Wordmark', src:'/design-study/taste/img/wordmark.jpg'},
  {id:'tatra', name:'Tatra House', src:'/design-study/taste/img/tatra.jpg'}
];

/* ============================================================
   ROUNDED POINTY-TOP HEXAGON
   Built once and reused three ways: the CSS clip on the tiles, the mask the
   pixel sampler reads through, and therefore the outline the dots inherit.
   ============================================================ */
function hexPath(w,h,d){
  var V=[[0.5*w,0],[w,0.25*h],[w,0.75*h],[0.5*w,h],[0,0.75*h],[0,0.25*h]];
  function towards(from,to,dist){
    var dx=to[0]-from[0], dy=to[1]-from[1], L=Math.sqrt(dx*dx+dy*dy)||1;
    return [from[0]+dx/L*dist, from[1]+dy/L*dist];
  }
  var seg=[],i,v,pv,nv;
  for(i=0;i<6;i++){
    v=V[i]; pv=V[(i+5)%6]; nv=V[(i+1)%6];
    seg.push({a:towards(v,pv,d), v:v, b:towards(v,nv,d)});
  }
  return seg;
}
function hexPathD(w,h,d){
  var seg=hexPath(w,h,d), s='', i, g;
  for(i=0;i<6;i++){
    g=seg[i];
    s += (i===0?'M':'L')+g.a[0].toFixed(5)+' '+g.a[1].toFixed(5)+
         'Q'+g.v[0].toFixed(5)+' '+g.v[1].toFixed(5)+' '+g.b[0].toFixed(5)+' '+g.b[1].toFixed(5);
  }
  return s+'Z';
}
function hexTrace(g2d,w,h,d){
  var seg=hexPath(w,h,d),i,g;
  g2d.beginPath();
  for(i=0;i<6;i++){
    g=seg[i];
    if(i===0) g2d.moveTo(g.a[0],g.a[1]); else g2d.lineTo(g.a[0],g.a[1]);
    g2d.quadraticCurveTo(g.v[0],g.v[1],g.b[0],g.b[1]);
  }
  g2d.closePath();
}
/* objectBoundingBox units: author at the true 1 x 1.1547 ratio, then
   normalise y so the corners stay round when the box is scaled */
document.getElementById('hexRoundPath').setAttribute('d',
  hexPathD(1, HEX_RATIO, HEX_R).replace(/(-?\d*\.?\d+) (-?\d*\.?\d+)/g,
    function(m,x,y){ return x+' '+(parseFloat(y)/HEX_RATIO).toFixed(5); }));

/* ============================================================
   PIXEL SAMPLING
   ============================================================ */
var SAMPLE_W = 116;
var SAMPLE_H = Math.round(SAMPLE_W*HEX_RATIO);
var STEP = reduced ? 5 : 3;
var PALETTE = [], PAL_INDEX = {};
var DOT_R = 1.4;                  // set from the tile grid, so dots never overlap

function paletteIndex(r,g,b){
  r=r&0xF8; g=g&0xF8; b=b&0xF8;
  var key=(r<<16)|(g<<8)|b, i=PAL_INDEX[key];
  if(i===undefined){ i=PALETTE.length; PAL_INDEX[key]=i; PALETTE.push('rgb('+r+','+g+','+b+')'); }
  return i;
}


/* ============================================================
   CROPPING YOUR OWN IMAGES
   An image is never squashed to fit the hexagon. It is cropped to the tile's
   aspect at its original scale, and the crop window is chosen by looking for
   the busiest part of the picture — a coarse gradient-energy pass, so the
   frame lands on detail rather than on empty sky. The same crop is used for
   the tile you see and for the dots it dissolves into, so the two always agree.
   ============================================================ */
function bestCrop(img, aspect){
  var iw=img.naturalWidth||img.width, ih=img.naturalHeight||img.height;
  var full={sx:0, sy:0, sw:iw, sh:ih, ox:50, oy:50};
  if(!iw||!ih) return full;

  /* the largest window of the right shape that fits */
  var cw, ch;
  if(iw/ih > aspect){ ch=ih; cw=ih*aspect; } else { cw=iw; ch=iw/aspect; }
  if(Math.abs(cw-iw)<1 && Math.abs(ch-ih)<1) return full;

  /* coarse energy map */
  var AW=Math.min(120, iw), AH=Math.max(1, Math.round(AW*ih/iw));
  var c=document.createElement('canvas'); c.width=AW; c.height=AH;
  var g=c.getContext('2d',{willReadFrequently:true});
  var d;
  try{ g.drawImage(img,0,0,AW,AH); d=g.getImageData(0,0,AW,AH).data; }
  catch(e){ return centred(); }

  var en=new Float32Array(AW*AH), x, y, i, l, lr, ld;
  function lum(px){ return 0.299*d[px]+0.587*d[px+1]+0.114*d[px+2]; }
  for(y=0;y<AH-1;y++) for(x=0;x<AW-1;x++){
    i=(y*AW+x)*4; l=lum(i); lr=lum(i+4); ld=lum(i+AW*4);
    en[y*AW+x]=Math.abs(l-lr)+Math.abs(l-ld);
  }
  /* summed-area table so every window costs the same to score */
  var sat=new Float64Array((AW+1)*(AH+1));
  for(y=0;y<AH;y++) for(x=0;x<AW;x++)
    sat[(y+1)*(AW+1)+x+1] = en[y*AW+x] + sat[y*(AW+1)+x+1] + sat[(y+1)*(AW+1)+x] - sat[y*(AW+1)+x];
  function sum(x0,y0,x1,y1){
    return sat[y1*(AW+1)+x1]-sat[y0*(AW+1)+x1]-sat[y1*(AW+1)+x0]+sat[y0*(AW+1)+x0];
  }

  var wx=Math.max(1,Math.round(cw*AW/iw)), wy=Math.max(1,Math.round(ch*AH/ih));
  var best=-1, bx=0, by=0, cxA=(AW-wx)/2, cyA=(AH-wy)/2, sc, bias;
  var stepX=Math.max(1,Math.round((AW-wx)/40)), stepY=Math.max(1,Math.round((AH-wy)/40));
  for(y=0;y<=AH-wy;y+=stepY) for(x=0;x<=AW-wx;x+=stepX){
    /* a mild pull toward the middle, so a busy corner does not win outright */
    bias = 1 - 0.22*(Math.abs(x-cxA)/Math.max(1,AW) + Math.abs(y-cyA)/Math.max(1,AH));
    sc = sum(x,y,x+wx,y+wy)*bias;
    if(sc>best){ best=sc; bx=x; by=y; }
  }
  var sx=bx*iw/AW, sy=by*ih/AH;
  sx=Math.max(0,Math.min(iw-cw,sx)); sy=Math.max(0,Math.min(ih-ch,sy));
  return {sx:sx, sy:sy, sw:cw, sh:ch,
          ox: (iw-cw)>0 ? (sx/(iw-cw))*100 : 50,
          oy: (ih-ch)>0 ? (sy/(ih-ch))*100 : 50};

  function centred(){
    var sx=(iw-cw)/2, sy=(ih-ch)/2;
    return {sx:sx, sy:sy, sw:cw, sh:ch, ox:50, oy:50};
  }
}

function sampleTile(t){
  return new Promise(function(resolve){
    var img=new Image();
    img.crossOrigin='anonymous';
    img.onload=function(){
      var cr = t.src ? bestCrop(img, 1/HEX_RATIO) : null;
      t.crop = cr;
      var c=document.createElement('canvas');
      c.width=SAMPLE_W; c.height=SAMPLE_H;
      var g=c.getContext('2d',{willReadFrequently:true});
      g.save(); hexTrace(g,SAMPLE_W,SAMPLE_H,HEX_R*SAMPLE_W); g.clip();
      try{
        if(cr) g.drawImage(img, cr.sx, cr.sy, cr.sw, cr.sh, 0, 0, SAMPLE_W, SAMPLE_H);
        else   g.drawImage(img, 0, 0, SAMPLE_W, SAMPLE_H);
      }catch(e){}
      g.restore();
      var d;
      try{ d=g.getImageData(0,0,SAMPLE_W,SAMPLE_H).data; }catch(e){ t.pts=[]; return resolve(); }
      var pts=[],x,y,i;
      for(y=1;y<SAMPLE_H;y+=STEP) for(x=1;x<SAMPLE_W;x+=STEP){
        i=(y*SAMPLE_W+x)*4;
        if(d[i+3]<40) continue;
        pts.push({ox:x/SAMPLE_W-0.5, oy:y/SAMPLE_H-0.5, ci:paletteIndex(d[i],d[i+1],d[i+2])});
      }
      t.pts=pts;
      resolve();
    };
    img.onerror=function(){ t.pts=[]; resolve(); };
    img.src = t.src ? t.src : 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(t.art);
  });
}

/* ============================================================
   LATTICE — pointy-top honeycomb, three columns wide
   Rows of 3 and rows of 2 alternate and interlock; the cluster can only
   grow downward, so it stays portrait however many tiles are in it.
   ============================================================ */
var ROW = 0.75*HEX_RATIO;         // vertical row pitch, in tile widths

/* The cluster: three-wide honeycomb, five rows, thirteen tiles. Rows alternate
   between whole-step and half-step columns, which is what interlocks them.
   Ordered centre-out, so the shape stays compact as tiles leave it. */
var CLUSTER=[[-2,[-1,0,1]],[-1,[-.5,.5]],[0,[-1,0,1]],[1,[-.5,.5]],[2,[-1,0,1]]];
function lattice(){
  var pts=[], i, j;
  for(i=0;i<CLUSTER.length;i++)
    for(j=0;j<CLUSTER[i][1].length;j++)
      pts.push({x:CLUSTER[i][1][j], y:CLUSTER[i][0]*ROW});
  var cy=0; pts.forEach(function(p){cy+=p.y;}); cy/=pts.length;
  pts.forEach(function(p){p.y-=cy;});
  pts.sort(function(a,b){
    return (Math.abs(a.y)-Math.abs(b.y))||(Math.abs(a.x)-Math.abs(b.x))||(a.x-b.x)||(a.y-b.y);
  });
  return pts;
}
var LATTICE=lattice();
function bbox(s){
  var mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9;
  s.forEach(function(p){ if(p.x<mnx)mnx=p.x; if(p.x>mxx)mxx=p.x; if(p.y<mny)mny=p.y; if(p.y>mxy)mxy=p.y; });
  return {w:(mxx-mnx)+1, h:(mxy-mny)+HEX_RATIO, cx:(mnx+mxx)/2, cy:(mny+mxy)/2};
}

/* ============================================================
   STATE
   ============================================================ */
var stage=document.getElementById('stage');
var arena=document.getElementById('arena');
var pileEl=document.getElementById('pile');
var live=document.getElementById('live');
var cv=document.getElementById('fx'), ctx=cv.getContext('2d');
var edgeLove=document.getElementById('edgeLove'), edgePass=document.getElementById('edgePass');
var countLove=document.getElementById('countLove'), countPass=document.getElementById('countPass');
var summary=document.getElementById('summary');
var progressNow=document.getElementById('progressNow');

var pile=[], sorted=[], nodes={}, selected=null, hexW=126;
var W=0,H=0,dpr=1;
var band={top:0,h:0};        /* the arena's vertical band, in panel coordinates */
var cloud=null, fields={love:[],pass:[]};
/* The black mass at each edge. Not particles — a lattice-packed body whose
   outline bulges toward whatever is being dragged at it. */
var goop={ love:{dots:[],aim:0,heat:0,act:false}, pass:{dots:[],aim:0,heat:0,act:false} };
var ripples={love:[], pass:[]};          /* the wave a new drop sends through a field */

function build(){
  pileEl.innerHTML=''; nodes={};
  pile=TILES.map(function(t){return t.id;});
  sorted=[];
  fields.love=[]; fields.pass=[]; cloud=null;
  ripples.love=[]; ripples.pass=[];
  goop.love.dots=[]; goop.pass.dots=[]; goop.love.heat=0; goop.pass.heat=0;
  TILES.forEach(function(t,i){
    var el=document.createElement('div');
    el.className='tile';
    el.dataset.id=t.id;
    el.innerHTML='<div class="tile__inner">'+(t.src
        ? '<img alt="'+t.name+'" src="'+t.src+'" style="object-position:'+
          (t.crop?t.crop.ox.toFixed(1)+'% '+t.crop.oy.toFixed(1)+'%':'50% 50%')+'">'
        : t.art)+'</div>';
    el.style.zIndex=String(10+i);
    pileEl.appendChild(el);
    nodes[t.id]={el:el, inner:el.firstChild, z:10+i};
  });
  selected=pile[0];
  resize(); render(); updateHud();
}

function render(){
  var box=pileEl.getBoundingClientRect();
  var availW=Math.max(120, box.width-16), availH=Math.max(160, box.height-14);
  var n=pile.length||1, s=LATTICE.slice(0,n), bb=bbox(s);
  hexW=Math.min(126, availW/bb.w, availH/bb.h);
  if(hexW<44) hexW=44;
  stage.style.setProperty('--hex-w', hexW.toFixed(2)+'px');
  var newR=(hexW/SAMPLE_W*STEP)*0.46;          // just under half the grid pitch
  DOT_R=newR;
  pile.forEach(function(id,i){
    var nd=nodes[id]; if(!nd) return;
    var p=s[i];
    nd.x=(p.x-bb.cx)*hexW; nd.y=(p.y-bb.cy)*hexW;
    nd.el.classList.toggle('is-selected', id===selected && stage.dataset.live==='1');
    if(!nd.dragging) nd.el.style.transform='translate('+nd.x.toFixed(2)+'px,'+nd.y.toFixed(2)+'px)';
  });
}

function resize(){
  var r=stage.getBoundingClientRect(), a=arena.getBoundingClientRect();
  W=r.width; H=r.height;
  band.top=a.top-r.top; band.h=a.height;
  dpr=Math.min(1.5, window.devicePixelRatio||1);
  cv.width=Math.max(1,Math.round(W*dpr));
  cv.height=Math.max(1,Math.round(H*dpr));
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
function toPanel(clientX, clientY){
  var r=stage.getBoundingClientRect();
  return {x:clientX-r.left, y:clientY-r.top};
}

/* ============================================================
   SEPARATION — a spatial hash keeps every dot whole
   ============================================================ */
var sepHead=null, sepNext=null;
function separate(arr, minD, iters){
  var n=arr.length; if(n<2) return;
  var pass; for(pass=0;pass<(iters||1);pass++) separateOnce(arr,minD);
}
function separateOnce(arr, minD){
  var n=arr.length; if(n<2) return;
  /* grid only over what this set actually occupies — clearing a full-stage
     grid every frame costs more than the collision test itself */
  var mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9,i,p;
  for(i=0;i<n;i++){ p=arr[i];
    if(p.x<mnx)mnx=p.x; if(p.x>mxx)mxx=p.x;
    if(p.y<mny)mny=p.y; if(p.y>mxy)mxy=p.y;
  }
  var cell=minD;
  var cols=((mxx-mnx)/cell|0)+3, rows=((mxy-mny)/cell|0)+3, cn=cols*rows;
  if(cn<1||cn>4000000) return;
  if(!sepHead || sepHead.length<cn) sepHead=new Int32Array(cn);
  if(!sepNext || sepNext.length<n) sepNext=new Int32Array(n);
  sepHead.fill(-1,0,cn);
  var j,ci,cj,q,dx,dy,d2,d,push,k,nci,ncj,min2=minD*minD;
  for(i=0;i<n;i++){
    p=arr[i];
    ci=((p.x-mnx)/cell|0)+1; cj=((p.y-mny)/cell|0)+1;
    p._c=cj*cols+ci;
    sepNext[i]=sepHead[p._c]; sepHead[p._c]=i;
  }
  for(i=0;i<n;i++){
    p=arr[i];
    ci=p._c%cols; cj=(p._c/cols)|0;
    for(k=0;k<9;k++){
      nci=ci+(k%3)-1; ncj=cj+((k/3)|0)-1;
      if(nci<0||ncj<0||nci>=cols||ncj>=rows) continue;
      j=sepHead[ncj*cols+nci];
      while(j!==-1){
        if(j>i){
          q=arr[j];
          dx=q.x-p.x; dy=q.y-p.y; d2=dx*dx+dy*dy;
          if(d2<min2){
            d=Math.sqrt(d2)||0.0001;
            push=(minD-d)*0.5;
            dx=dx/d*push; dy=dy/d*push;
            p.x-=dx; p.y-=dy; q.x+=dx; q.y+=dy;
          }
        }
        j=sepNext[j];
      }
    }
  }
}

/* ============================================================
   FIELD PACKING — even spacing, organic silhouette
   ============================================================ */
var GOLDEN=Math.PI*(3-Math.sqrt(5));
function packField(side){
  var arr=fields[side], n=arr.length; if(!n) return;
  var margin=14;
  var maxW=Math.max(90, W*0.34-margin), maxH=Math.max(90, band.h-margin*2);
  var spacing=Math.max(7.4, DOT_R*4.4);
  var R=Math.sqrt(n/Math.PI)*spacing;
  var rx=Math.min(maxW/2, R*0.9), ry=Math.min(maxH/2, R*1.18);
  var cx = side==='love' ? W-margin-rx : margin+rx, cy=band.top+band.h/2;
  var seed = side==='love' ? 1.7 : 4.9;
  function edgeAt(a){
    /* kept shallow on purpose: a deeper wobble pinches the phyllotaxis
       slots together and the dots would have nowhere to sit */
    return 1 + 0.085*Math.sin(2*a+seed) + 0.065*Math.sin(3*a-seed*1.6)
             + 0.045*Math.sin(5*a+seed*2.4) + 0.03*Math.sin(7*a-seed*0.7);
  }
  var norm=1/1.225, jx=spacing*0.14, i, t, rr, m, slots=new Array(n);
  for(i=0;i<n;i++){
    rr=Math.sqrt((i+0.5)/n); t=i*GOLDEN; m=edgeAt(t)*norm;
    slots[i]={x:cx+Math.cos(t)*rr*rx*m+(Math.random()*2-1)*jx,
              y:cy+Math.sin(t)*rr*ry*m+(Math.random()*2-1)*jx};
  }
  var order=arr.map(function(p,idx){return idx;});
  order.sort(function(a,b){ return (arr[a].y-arr[b].y)||(arr[a].x-arr[b].x); });
  slots.sort(function(a,b){ return (a.y-b.y)||(a.x-b.x); });
  for(i=0;i<n;i++){
    var p=arr[order[i]];
    p.tx=slots[i].x; p.ty=slots[i].y;
  }
}

/* ============================================================
   DISSOLVE / DROP
   ============================================================ */
function tileCentre(id){
  var r=nodes[id].el.getBoundingClientRect(), a=stage.getBoundingClientRect();
  return {cx:r.left+r.width/2-a.left, cy:r.top+r.height/2-a.top};
}
function dissolve(id){
  var t=TILES.filter(function(x){return x.id===id;})[0];
  if(!t||!t.pts||!t.pts.length) return null;
  var c=tileCentre(id), w=hexW, h=hexW*HEX_RATIO;
  var pts=new Array(t.pts.length),i,s;
  for(i=0;i<t.pts.length;i++){
    s=t.pts[i];
    var rn=Math.min(1, Math.sqrt(s.ox*s.ox+s.oy*s.oy)/0.5);
    pts[i]={ox:s.ox*w, oy:s.oy*h, x:c.cx+s.ox*w, y:c.cy+s.oy*h,
            vx:0, vy:0, tx:0, ty:0, ci:s.ci,
            k:0.255-rn*0.075,         /* the outer ring is a touch softer than the core */
            _c:0};
  }
  pts.sort(function(a,b){return a.ci-b.ci;});
  nodes[id].el.classList.add('is-dust');
  return {tid:id, pts:pts, cx:c.cx, cy:c.cy, vx:0, vy:0, heat:0, side:null};
}
function releaseCloud(side){
  if(!cloud) return;
  var arr=fields[side],i;
  var had=arr.length;
  for(i=0;i<cloud.pts.length;i++){ cloud.pts[i].k=0.05; arr.push(cloud.pts[i]); }
  /* the arriving mass shoves the settled dots aside — a wavefront that
     travels out from where it landed and dies at the rim */
  if(had>60){
    ripples[side].push({x:cloud.cx, y:cloud.cy, age:0, life:2.2, speed:300, amp:31, width:40});
    ripples[side].push({x:cloud.cx, y:cloud.cy, age:0, life:1.5, speed:520, amp:15, width:26});
  }
  cloud=null;
  packField(side);
}
function unpackLast(side,count){
  fields[side].splice(Math.max(0,fields[side].length-count), count);
  packField(side);
}

/* ============================================================
   ANIMATION
   ============================================================ */
var t0=performance.now(), tPrev=t0;
function step(now){
  if(dead) return;
  var t=(now-t0)/1000, i, p;
  var dt=Math.min(0.05, Math.max(0.006,(now-tPrev)/1000)); tPrev=now;

  /* One swell travelling down the column. The scale never reaches 1, so the
     tiles open and close but never touch each other. */
  pile.forEach(function(id){
    var nd=nodes[id]; if(!nd) return;
    var ph=t*1.05-((nd.y||0)*0.0150+(nd.x||0)*0.0034);
    var w=reduced?0.5:Math.pow((Math.sin(ph)+1)*0.5, 2.0);
    var sc=nd.dragging?0.96:(0.885+w*0.075);
    nd.inner.style.transform='translateY('+((w-0.34)*5.0).toFixed(2)+'px) scale('+sc.toFixed(4)+')';
  });

  ctx.clearRect(0,0,W,H);

  /* The cloud keeps the tile's own sampled grid and warps only with how fast
     it is dragged — stretched along the direction of travel. It is never
     compressed, so the dots can only move further apart, never into each other. */
  if(cloud){
    /* hold the reading while the hand is still moving; drop it fast once it isn't,
       so the dots regather the instant you pause */
    if(now-(cloud.vt||0)>70){ cloud.vx*=0.84; cloud.vy*=0.84; }
    var speed=Math.sqrt(cloud.vx*cloud.vx+cloud.vy*cloud.vy);
    var sp=Math.min(1, speed/850);
    var ang=speed>2?Math.atan2(cloud.vy,cloud.vx):0;
    /* No random drift — noise reads as a bug. The deformation is inertia:
       the grid opens a little, smears along the line of travel, and every dot
       is pulled with a stiffness graded by where it sits on that line, so the
       trailing side hangs back and the leading side keeps up. It follows the
       hand instead of reacting to it. */
    var expand=1+sp*0.45, stretch=1+sp*0.38;
    var lagRef=Math.max(40, cloud.half||60);
    var ca=Math.cos(ang), sa=Math.sin(ang), u, v;
    for(i=0;i<cloud.pts.length;i++){
      p=cloud.pts[i];
      u=( p.ox*ca + p.oy*sa)*expand*stretch;
      v=(-p.ox*sa + p.oy*ca)*expand;
      p.tx=cloud.cx + u*ca - v*sa;
      p.ty=cloud.cy + u*sa + v*ca;
      /* graded along the direction of travel: leading dots stiff, trailing loose */
      var kk=p.k*(1 + sp*0.55*Math.max(-1,Math.min(1, u/lagRef)));
      p.vx+=(p.tx-p.x)*kk; p.vy+=(p.ty-p.y)*kk;
      p.vx*=0.70; p.vy*=0.70;
      p.x+=p.vx; p.y+=p.vy;
    }
    separate(cloud.pts, DOT_R*2, 2);

  }

  ['love','pass'].forEach(function(side){
    var arr=fields[side], rip=ripples[side], j, k2, q, r, dx, dy, d, front, fall, off, gx, gy, en=0;
    for(k2=rip.length-1;k2>=0;k2--){
      rip[k2].age+=dt;
      if(rip[k2].age>=rip[k2].life) rip.splice(k2,1);
    }
    for(j=0;j<arr.length;j++){
      q=arr[j];
      gx=q.tx; gy=q.ty;
      for(k2=0;k2<rip.length;k2++){
        r=rip[k2];
        dx=q.tx-r.x; dy=q.ty-r.y;
        d=Math.sqrt(dx*dx+dy*dy)||0.001;
        front=r.speed*r.age;
        fall=(d-front)/r.width;
        if(fall>3||fall<-3) continue;
        off=r.amp*Math.exp(-fall*fall)*(1-r.age/r.life);
        gx+=dx/d*off; gy+=dy/d*off;
      }
      q.vx+=(gx-q.x)*q.k; q.vy+=(gy-q.y)*q.k;
      q.vx*=0.80; q.vy*=0.80;
      q.x+=q.vx; q.y+=q.vy;
      en+=q.vx*q.vx+q.vy*q.vy;
    }
    if(arr.length) separate(arr, DOT_R*2, 3);
  });

  runGoop(dt, t);

  draw();
  rafId=requestAnimationFrame(step);
}


function drawSet(arr){
  var i=0,n=arr.length,ci,p;
  while(i<n){
    ci=arr[i].ci;
    ctx.fillStyle=PALETTE[ci];
    ctx.beginPath();
    while(i<n && arr[i].ci===ci){
      p=arr[i];
      ctx.moveTo(p.x+DOT_R,p.y);
      ctx.arc(p.x,p.y,DOT_R,0,TAU);
      i++;
    }
    ctx.fill();
  }
}
function draw(){
  ctx.globalAlpha=1;
  drawSet(fields.pass);
  drawSet(fields.love);
  if(cloud) drawSet(cloud.pts);
  drawGoop();
}



/* ============================================================
   THE BLACK MASS
   Not a swarm. Each edge holds one body, packed on a triangular lattice so
   no two dots ever touch, with an outline that bulges toward whatever is
   being dragged at it. It slides in from off-canvas as a whole and slides
   back out the same way — a mass reaching, not particles scattering.
   ============================================================ */

var GOOP_PITCH = 7.6;             // lattice pitch in px — dots grow to nearly fill it
var GOOP_SPAN  = 400;             // how far along the edge the body can spread
var GOOP_DEEP  = 0.29;            // how far in it can reach, as a share of panel width

/* ---------------------------------------------------------------
   THE BLACK MASS
   One body per edge, packed on a triangular lattice. The dots grow to almost
   touch near the edge — ~89% coverage, which reads as solid black — and
   shrink to specks as the body reaches inward, so the gradient is carried by
   the marks themselves rather than by opacity. The outline is four sines
   crawling at different rates, so it never holds still: lobes push out and
   pull back the way a slime mould does.
   --------------------------------------------------------------- */
function runGoop(dt, t){
  ['love','pass'].forEach(function(side){
    var g=goop[side], dots=g.dots, i, p, en=0;
    if(!g.map) g.map=new Map();
    if(g.stamp===undefined) g.stamp=0;

    var want = !!(cloud && cloud.side===side && cloud.heat>0.30);
    g.heat += ((want?cloud.heat:0) - g.heat) * 0.075;
    if(want) g.aim += (cloud.cy - g.aim) * 0.13;
    else if(!dots.length) g.aim = band.top + band.h/2;

    var sign = side==='love' ? 1 : -1;
    var S=GOOP_PITCH, rowH=S*0.866, rMax=S*0.495;
    var deepMax = W*GOOP_DEEP;
    var maxDepth = 44 + g.heat*(deepMax-44);
    var halfSpan = 120 + g.heat*(GOOP_SPAN-120);
    var off = sign*(deepMax+110);

    g.tick=(g.tick||0)+1;
    if(want && g.heat>0.015 && (g.tick&1)===0){
      var ph = t*0.62 + (side==='love'?0:2.4);
      var R=Math.ceil(GOOP_SPAN/rowH), C=Math.ceil(deepMax/S);
      var row, col, y, sN, D, dep, key, sx, lobe;
      g.stamp++;
      g.est = dots.length>240;
      for(row=-R;row<=R;row++){
        y=g.aim+row*rowH;
        if(y<-30||y>H+30) continue;
        sN=(y-g.aim)/halfSpan;
        if(sN<-1||sN>1) continue;
        /* four crawling harmonics: the rim is never twice the same shape */
        lobe = 1 + 0.30*Math.sin(y*0.0102 + ph*1.00)
                 + 0.22*Math.sin(y*0.0223 - ph*1.55)
                 + 0.14*Math.sin(y*0.0417 + ph*2.30)
                 + 0.09*Math.sin(y*0.0781 - ph*3.10);
        D = maxDepth*Math.pow(1-sN*sN, 0.46)*Math.max(0.12, lobe*0.80);
        for(col=0;col<=C;col++){
          dep=col*S+((row&1)?S/2:0);
          if(dep>D) break;
          key=(row+700)*4096+col;
          sx = side==='love' ? W-dep : dep;
          p=g.map.get(key);
          if(!p){
            /* The first arrival slides in from off-canvas as one mass. After
               that the body is established, and cells the crawling rim opens
               up simply bloom where they stand — nothing flies across the
               body, so nothing ever crosses anything else. */
            var born = g.est;
            p={x: born?sx:sx+off, y:y, vx:0, vy:0, tx:sx, ty:y, homeX:sx+off,
               a: born?1:0, ta:1, r:born?0:0.4, tr:0, dep:0, k:0.04, out:false, cell:key, _c:0};
            g.map.set(key,p); dots.push(p);
          }
          p.st=g.stamp;
          p.tx=sx; p.ty=y; p.homeX=sx+off; p.out=false;
          p.dep=Math.min(1, dep/Math.max(1,maxDepth));
          p.k=0.036+p.dep*0.030;
          p.ta=1;
          /* solid at the edge, specks at the reach */
          p.tr=rMax*(0.20+0.80*Math.pow(1-p.dep, 1.25));
        }
      }
      for(i=0;i<dots.length;i++) if(dots[i].st!==g.stamp){ dots[i].out=true; }
    }else if(!want){
      for(i=0;i<dots.length;i++) dots[i].out=true;
      g.est=false;
    }
    g.leaving = !want;

    for(i=dots.length-1;i>=0;i--){
      p=dots[i];
      if(p.out){
        p.tr=0;                                   /* a cell the rim gave up simply closes */
        if(g.leaving){ p.tx=p.homeX; p.ta=0; p.k=0.042; }   /* the whole body, though, leaves by the edge */
      }
      p.vx+=(p.tx-p.x)*p.k; p.vy+=(p.ty-p.y)*p.k;
      p.vx*=0.80; p.vy*=0.80;
      p.x+=p.vx; p.y+=p.vy;
      p.a += (p.ta-p.a)*(p.out?0.22:0.16);
      var prox = p.out ? 1 : 1-Math.min(1, Math.abs(p.x-p.tx)/70);
      p.r += (p.tr*prox - p.r)*(p.out?0.20:0.15);
      en += p.vx*p.vx+p.vy*p.vy;
      if(p.out && p.r<0.28 && (!g.leaving || p.a<0.05)){ g.map.delete(p.cell); dots.splice(i,1); }
    }
    if(dots.length && en/dots.length>0.30) separate(dots, S*0.985, 2);
  });
}

function drawGoop(){
  var side, dots, i, p;
  ctx.fillStyle='#14140F';
  /* the body proper: one path at full opacity — this is what reads as solid */
  ctx.beginPath();
  for(side in goop){
    dots=goop[side].dots;
    for(i=0;i<dots.length;i++){
      p=dots[i];
      if(p.a<0.96||p.r<0.3) continue;
      ctx.moveTo(p.x+p.r,p.y); ctx.arc(p.x,p.y,p.r,0,TAU);
    }
  }
  ctx.fill();
  /* only the dots still blooming or closing carry an alpha of their own */
  for(side in goop){
    dots=goop[side].dots;
    for(i=0;i<dots.length;i++){
      p=dots[i];
      if(p.a>=0.96||p.a<0.04||p.r<0.3) continue;
      ctx.globalAlpha=p.a;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,TAU); ctx.fill();
    }
  }
  ctx.globalAlpha=1;
}


/* ============================================================
   SORTING
   ============================================================ */
function updateHud(){
  var L=sorted.filter(function(s){return s.side==='love';}).length;
  var P=sorted.length-L;
  countLove.textContent=(L<10?'0':'')+L;
  countPass.textContent=(P<10?'0':'')+P;
  progressNow.textContent=Math.min(sorted.length,GOAL);
}
function setHeat(l,p){
  edgeLove.classList.toggle('is-hot', l>0.55);
  edgePass.classList.toggle('is-hot', p>0.55);
}
function sort(id, side){
  if(sorted.length>=GOAL) return;
  var idx=pile.indexOf(id); if(idx<0) return;
  if(!cloud || cloud.tid!==id){
    cloud=dissolve(id);
    if(cloud){ cloud.side=side; cloud.heat=1; }
  }
  pile.splice(idx,1);
  sorted.push({id:id, side:side, n:cloud?cloud.pts.length:0});
  nodes[id].el.classList.remove('is-dust');
  nodes[id].el.classList.add('is-gone');
  if(cloud) releaseCloud(side);
  if(selected===id) selected=pile[0]||null;
  setHeat(0,0);
  stage.dataset.armed='0';
  updateHud(); render();
  var t=TILES.filter(function(x){return x.id===id;})[0];
  live.textContent=t.name+(side==='love'?' kept. ':' passed. ')+Math.min(sorted.length,GOAL)+' of '+GOAL+' sorted.';
  if(sorted.length>=GOAL) setTimeout(finish,520);
}
function undo(){
  var last=sorted.pop(); if(!last) return;
  unpackLast(last.side,last.n);
  var nd=nodes[last.id];
  pile.unshift(last.id);
  nd.el.classList.remove('is-gone','is-dust');
  selected=last.id;
  summary.hidden=true; stage.dataset.done='0';
  updateHud(); render();
  live.textContent='Undone. '+sorted.length+' of '+GOAL+' sorted.';
}
function finish(){
  var L=sorted.filter(function(s){return s.side==='love';}).length;
  var st=document.getElementById('cardStat');
  if(st) st.textContent=('0'+GOAL).slice(-2)+' sorted · '+('0'+L).slice(-2)+' kept';
  summary.hidden=false; stage.dataset.done='1';
  var cd=summary.querySelector('.card');
  if(cd){ cd.style.animation='none'; void cd.offsetWidth; cd.style.animation=''; }
  /* let the card land, then carry them down to the reasoning */
  clearTimeout(scrollT);
  scrollT=setTimeout(function(){
    if(dead) return;
    if(stage.dataset.done!=='1') return;
    if(window.scrollY > stage.offsetTop + 40) return;      /* they already went looking */
    goTo(document.getElementById('notes'));
  }, 2100);
  live.textContent=GOAL+' sorted. '+L+' kept. Your profile is ready.';
}

/* ============================================================
   POINTER
   ============================================================ */
var drag=null, THRESH=118;
pileEl.addEventListener('pointerdown', function(e){
  if(sorted.length>=GOAL) return;
  var el=e.target.closest('.tile'); if(!el||el.classList.contains('is-gone')) return;
  var id=el.dataset.id, nd=nodes[id]; if(!nd) return;
  el.setPointerCapture(e.pointerId);
  drag={id:id, nd:nd, x0:e.clientX, y0:e.clientY, dx:0, dy:0, t:e.timeStamp};
  nd.dragging=true;
  selected=id;
  stage.dataset.armed='1'; stage.dataset.live='1';
  cloud=dissolve(id);
  render();
  e.preventDefault();
});
pileEl.addEventListener('pointermove', function(e){
  if(!drag||!cloud) return;
  drag.dx=e.clientX-drag.x0; drag.dy=e.clientY-drag.y0;
  var q=toPanel(e.clientX,e.clientY), nx=q.x, ny=q.y;
  var dt=Math.max(8, e.timeStamp-drag.t); drag.t=e.timeStamp;
  cloud.vx+=((nx-cloud.cx)/dt*1000-cloud.vx)*0.34;
  cloud.vy+=((ny-cloud.cy)/dt*1000-cloud.vy)*0.34;
  cloud.vt=performance.now();   /* same clock as the animation loop */
  cloud.cx=nx; cloud.cy=ny;
  var hl=Math.max(0,Math.min(1,drag.dx/THRESH)), hp=Math.max(0,Math.min(1,-drag.dx/THRESH));
  cloud.side = drag.dx>0?'love':'pass';
  cloud.heat = Math.max(hl,hp);
  setHeat(hl,hp);
});
function endDrag(){
  if(!drag) return;
  var nd=drag.nd, id=drag.id, dx=drag.dx;
  nd.dragging=false; drag=null;
  if(Math.abs(dx)>THRESH){ sort(id, dx>0?'love':'pass'); }
  else{
    cloud=null;
    nd.el.classList.remove('is-dust');
    setHeat(0,0);
    render();
  }
}
pileEl.addEventListener('pointerup', endDrag);
pileEl.addEventListener('pointercancel', endDrag);

/* ============================================================
   KEYBOARD
   ============================================================ */
pileEl.addEventListener('focus', function(){
  stage.dataset.live='1';
  if(!selected) selected=pile[0];
  stage.dataset.armed='1';
  render();
});
pileEl.addEventListener('blur', function(){ if(!drag){ stage.dataset.armed='0'; setHeat(0,0);} });
pileEl.addEventListener('keydown', function(e){
  if(!pile.length) return;
  if(sorted.length>=GOAL && e.key!=='Backspace') return;
  var i=pile.indexOf(selected); if(i<0){ i=0; selected=pile[0]; }
  if(e.key==='ArrowRight'){ e.preventDefault(); stage.dataset.live='1'; sort(selected,'love'); }
  else if(e.key==='ArrowLeft'){ e.preventDefault(); stage.dataset.live='1'; sort(selected,'pass'); }
  else if(e.key==='ArrowDown'){ e.preventDefault(); selected=pile[(i+1)%pile.length]; render(); announce(); }
  else if(e.key==='ArrowUp'){ e.preventDefault(); selected=pile[(i-1+pile.length)%pile.length]; render(); announce(); }
  else if(e.key==='Backspace'){ e.preventDefault(); undo(); }
});
function announce(){
  var t=TILES.filter(function(x){return x.id===selected;})[0];
  if(t) live.textContent=t.name+' selected.';
}
var scrollT=null;
function goTo(el){
  var top = el===null ? 0 : el.getBoundingClientRect().top + window.scrollY;
  try{ window.scrollTo({top:top, behavior: reduced?'auto':'smooth'}); }
  catch(e){ window.scrollTo(0, top); }
}
document.getElementById('again').addEventListener('click', function(){
  clearTimeout(scrollT);
  summary.hidden=true; stage.dataset.done='0'; stage.dataset.live='0';
  build();
  goTo(null);
  setTimeout(function(){ if(dead) return; pileEl.focus({preventScroll:true}); }, reduced?0:420);
});

/* ============================================================
   BOOT
   ============================================================ */
var rt;
function onResize(){
  clearTimeout(rt);
  rt=setTimeout(function(){ if(dead) return; resize(); render(); packField('love'); packField('pass'); }, 110);
}
window.addEventListener('resize', onResize);

window.__hexpileTeardown=function(){
  dead=true;
  cancelAnimationFrame(rafId);
  clearTimeout(rt); clearTimeout(scrollT);
  window.removeEventListener('resize', onResize);
  /* leave the shell in its opening state, so a re-run starts from the top even
     if it inherits this DOM rather than a freshly rendered one */
  try{
    stage.dataset.armed='0'; stage.dataset.live='0'; stage.dataset.done='0';
    summary.hidden=true;
    pileEl.innerHTML='';
    ctx.clearRect(0,0,W,H);
  }catch(e){}
  delete window.__hexpileReady; delete window.__hex; delete window.__hexpileTeardown;
};

Promise.all(TILES.map(sampleTile)).then(function(){
  if(dead) return;
  build();
  rafId=requestAnimationFrame(step);
  window.__hexpileReady=true;
  window.__hex={
    dots:function(side){ return fields[side].length; },
    cloud:function(){ return cloud?cloud.pts.length:0; },
    edgeDots:function(){ return goop.love.dots.length+goop.pass.dots.length; },
    edgeStats:function(){
      var out={};
      ['love','pass'].forEach(function(side){
        var d=goop[side].dots, i, dsum=0, going=0;
        for(i=0;i<d.length;i++){
          dsum += side==='love' ? (W-d[i].x) : d[i].x;
          if(d[i].out) going++;
        }
        out[side]={n:d.length, meanDepth:d.length?Math.round(dsum/d.length):0, returning:going};
      });
      return out;
    },
    crops:function(){
      var n=0, bad=0, off=0, i, t, c, want=1/HEX_RATIO, got;
      for(i=0;i<TILES.length;i++){
        t=TILES[i]; if(!t.src) continue;
        n++; c=t.crop;
        if(!c){ bad++; continue; }
        got=c.sw/c.sh;
        if(Math.abs(got-want)>0.01) bad++;
        if(Math.abs(c.ox-50)>1||Math.abs(c.oy-50)>1) off++;
      }
      return {total:n, stretched:bad, offCentre:off};
    },
    goopReach:function(side){
      var a=goop[side].dots, i, m=1e9, v;
      for(i=0;i<a.length;i++){
        if(a[i].a<0.3||a[i].r<0.5) continue;
        v = side==='love' ? (W-a[i].x) : a[i].x;
        if(v<m) m=v;
      }
      return {minX: m===1e9?999:m};
    },
    goopGap:function(side){
      var a=goop[side].dots.filter(function(p){return !p.out && p.a>0.05;});
      var i,j,m=1e9,dx,dy,d;
      if(a.length<2) return -1;
      for(i=0;i<a.length;i++) for(j=i+1;j<Math.min(a.length,i+80);j++){
        dx=a[i].x-a[j].x; dy=a[i].y-a[j].y;
        d=Math.sqrt(dx*dx+dy*dy)/(a[i].r+a[j].r);
        if(d<m) m=d;
      }
      return m;
    },
    cloudSpeed:function(){ return cloud?Math.round(Math.hypot(cloud.vx,cloud.vy)):0; },
    cloudBox:function(){
      if(!cloud) return {x:0,y:0,w:0,h:0};
      var a=cloud.pts,i,mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;
      for(i=0;i<a.length;i++){
        if(a[i].x<mnx)mnx=a[i].x; if(a[i].x>mxx)mxx=a[i].x;
        if(a[i].y<mny)mny=a[i].y; if(a[i].y>mxy)mxy=a[i].y;
      }
      var r=stage.getBoundingClientRect();
      return {x:Math.round(mnx+r.left), y:Math.round(mny+r.top),
              w:Math.round(mxx-mnx), h:Math.round(mxy-mny)};
    },
    minGap:function(side){
      var a=fields[side],i,j,m=1e9,dx,dy,d;
      if(a.length<2) return -1;
      for(i=0;i<a.length;i++) for(j=i+1;j<Math.min(a.length,i+40);j++){
        dx=a[i].x-a[j].x; dy=a[i].y-a[j].y; d=Math.sqrt(dx*dx+dy*dy);
        if(d<m) m=d;
      }
      return m/DOT_R;
    },
    undo:undo,
    sorted:function(){ return sorted.length; },
    pile:function(){ return pile.length; }
  };
});
})();