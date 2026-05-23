/* Foreign · animations.js */

let _token = 0;
let _ivs   = [];

export function stopAnim() {
  _token++;
  _ivs.forEach(clearInterval);
  _ivs = [];
}

export function startAnim(type, canvas) {
  stopAnim();
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!type || type === 'none') return;
  const tk = _token;
  const W = canvas.width, H = canvas.height;
  const fn = { ocean:_ocean, mist:_mist, stars:_stars, rain:_rain,
                aurora:_aurora, sakura:_sakura, clouds:_clouds,
                snow:_snow, forest:_forest }[type];
  if (fn) fn(ctx, W, H, tk);
}

function iv(fn, ms) { const id = setInterval(fn, ms); _ivs.push(id); return id; }
function raf(fn, tk) { if (_token === tk) requestAnimationFrame(fn); }
function lerp(a,b,t){return a+(b-a)*t;}
function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v));}
function rnd(a,b){return a+Math.random()*(b-a);}
const PI2 = Math.PI*2;

/* ═══ 🌊 深海 ═══════════════════════════════════════════════ */
function _ocean(ctx, W, H, tk) {
  const caust = Array.from({length:22}, () => ({
    x:rnd(W*.1,W*.9), y:rnd(0,H*.2),
    rx:rnd(25,90), ry:rnd(4,14),
    rot:rnd(0,Math.PI), rspd:rnd(-.003,.003),
    a:rnd(.06,.14), spd:rnd(-.22,.22),
    ph:rnd(0,PI2), phs:rnd(.01,.022),
  }));
  const motes = Array.from({length:180}, () => ({
    x:rnd(0,W), y:rnd(0,H), r:rnd(.3,1.2),
    vy:-rnd(.05,.22), vx:rnd(-.05,.05),
    a:rnd(.08,.28), ph:rnd(0,PI2),
  }));
  const rayCount = 10;
  const rays = Array.from({length:rayCount}, (_,i) => {
    const u=(i/(rayCount-1))*2-1;
    const cx=W*(.5+u*.44+rnd(-.04,.04));
    return { cx, w:rnd(14,52), a:rnd(.08,.18)*Math.exp(-u*u*1.0),
             ph:rnd(0,PI2), phs:rnd(.002,.004),
             reach:rnd(H*.38,H*.78), skew:u*rnd(18,44) };
  });
  let t=0;
  function draw() {
    ctx.clearRect(0,0,W,H); t+=.005;
    rays.forEach(r => {
      r.ph+=r.phs;
      const nx=r.cx+Math.sin(r.ph)*9+Math.sin(r.ph*2.2+1)*5;
      const p=.62+.38*Math.sin(r.ph);
      const go=ctx.createLinearGradient(nx,0,nx,r.reach*.88);
      go.addColorStop(0,`rgba(255,255,255,${r.a*.65*p})`);
      go.addColorStop(.2,`rgba(190,232,255,${r.a*.42*p})`);
      go.addColorStop(.62,`rgba(130,205,255,${r.a*.16*p})`);
      go.addColorStop(1,'rgba(90,178,255,0)');
      ctx.save(); ctx.beginPath();
      ctx.moveTo(nx-r.w*2.4,0); ctx.lineTo(nx+r.w*2.4,0);
      ctx.lineTo(nx+r.w*2.4+r.skew,r.reach*.88);
      ctx.lineTo(nx-r.w*2.4+r.skew,r.reach*.88);
      ctx.closePath(); ctx.fillStyle=go; ctx.fill(); ctx.restore();
      const gi=ctx.createLinearGradient(nx,0,nx,r.reach);
      gi.addColorStop(0,`rgba(255,255,255,${r.a*1.6*p})`);
      gi.addColorStop(.2,`rgba(225,246,255,${r.a*p})`);
      gi.addColorStop(.65,`rgba(170,222,255,${r.a*.25*p})`);
      gi.addColorStop(1,'rgba(130,198,255,0)');
      ctx.save(); ctx.beginPath();
      ctx.moveTo(nx-r.w*.35,0); ctx.lineTo(nx+r.w*.35,0);
      ctx.lineTo(nx+r.w*.35+r.skew*.5,r.reach);
      ctx.lineTo(nx-r.w*.35+r.skew*.5,r.reach);
      ctx.closePath(); ctx.fillStyle=gi; ctx.fill(); ctx.restore();
    });
    caust.forEach(c => {
      c.x+=c.spd; c.rot+=c.rspd; c.ph+=c.phs;
      if(c.x<-c.rx*2)c.x=W+c.rx; if(c.x>W+c.rx*2)c.x=-c.rx;
      const pulse=.65+.35*Math.sin(c.ph);
      ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.rot);
      const g=ctx.createRadialGradient(0,0,0,0,0,c.rx);
      g.addColorStop(0,`rgba(195,240,255,${c.a*pulse})`);
      g.addColorStop(.5,`rgba(155,220,255,${c.a*pulse*.38})`);
      g.addColorStop(1,'rgba(110,195,255,0)');
      ctx.scale(1,c.ry/c.rx);
      ctx.beginPath(); ctx.arc(0,0,c.rx,0,PI2);
      ctx.fillStyle=g; ctx.fill(); ctx.restore();
    });
    motes.forEach(m => {
      m.y+=m.vy; m.x+=m.vx+Math.sin(t*.75+m.ph)*.14;
      if(m.y<-5){m.y=H+5; m.x=rnd(0,W);}
      const dc=Math.abs(m.x-W*.5)/(W*.5);
      ctx.beginPath(); ctx.arc(m.x,m.y,m.r,0,PI2);
      ctx.fillStyle=`rgba(195,232,255,${m.a*(1-dc*.4)})`; ctx.fill();
    });
    raf(draw,tk);
  } draw();
}

/* ═══ 🌲 雾林 ═══════════════════════════════════════════════ */
function _mist(ctx, W, H, tk) {
  const FOG_BANDS = [
    {yFrac:.16,thickness:.08,speed:.052,density:1.0},
    {yFrac:.31,thickness:.10,speed:.041,density:1.15},
    {yFrac:.47,thickness:.09,speed:.066,density:1.0},
    {yFrac:.61,thickness:.07,speed:.038,density:0.9},
  ];
  const fogClouds = [];
  FOG_BANDS.forEach(band => {
    const count=10+Math.floor(Math.random()*4);
    for(let i=0;i<count;i++){
      fogClouds.push({
        band, x:rnd(-W*.3,W*1.3),
        y:H*band.yFrac+rnd(-H*band.thickness*.4,H*band.thickness*.4),
        rx:rnd(W*.15,W*.38), ry:rnd(H*band.thickness*.6,H*band.thickness*1.3),
        a:rnd(.15,.26)*band.density,
        spd:band.speed*rnd(.6,1.4)*(Math.random()>.5?1:-1),
        ph:rnd(0,PI2), phsV:rnd(.011,.018), phsH:rnd(.0008,.0018), phH:rnd(0,PI2),
      });
    }
  });
  function draw(){
    ctx.clearRect(0,0,W,H);
    fogClouds.forEach(f=>{
      f.x+=f.spd; f.ph+=f.phsV; f.phH+=f.phsH;
      if(f.x<-f.rx*1.8)f.x=W+f.rx;
      if(f.x>W+f.rx*1.8)f.x=-f.rx;
      const jy=Math.sin(f.ph)*H*.022;
      const jx=Math.sin(f.phH)*W*.008;
      const ap=1+Math.sin(f.ph*.7+1.2)*.15;
      ctx.save(); ctx.translate(f.x+jx,f.y+jy);
      const g=ctx.createRadialGradient(0,0,0,0,0,f.rx);
      g.addColorStop(0,`rgba(218,222,225,${f.a*ap})`);
      g.addColorStop(.38,`rgba(210,216,220,${f.a*ap*.58})`);
      g.addColorStop(.72,`rgba(202,209,214,${f.a*ap*.22})`);
      g.addColorStop(1,'rgba(195,204,210,0)');
      ctx.scale(1,f.ry/f.rx);
      ctx.beginPath(); ctx.arc(0,0,f.rx,0,PI2);
      ctx.fillStyle=g; ctx.fill(); ctx.restore();
    });
    raf(draw,tk);
  } draw();
}

/* ═══ 🌌 星空 ═══════════════════════════════════════════════ */
function _stars(ctx, W, H, tk) {
  const MW_X1=W*.85,MW_Y1=H*.82,MW_X2=W*.08,MW_Y2=H*.05;
  const MW_DX=MW_X2-MW_X1,MW_DY=MW_Y2-MW_Y1;
  const MW_LEN=Math.sqrt(MW_DX*MW_DX+MW_DY*MW_DY);
  const MW_W=W*.14,HORIZON=H*.75;
  function mwDist(x,y){
    const t2=clamp(((x-MW_X1)*MW_DX+(y-MW_Y1)*MW_DY)/(MW_LEN*MW_LEN),0,1);
    const px=MW_X1+t2*MW_DX,py=MW_Y1+t2*MW_DY;
    return Math.sqrt((x-px)**2+(y-py)**2);
  }
  function mwWeight(x,y){
    if(y>HORIZON)return 0;
    const d=mwDist(x,y);
    return Math.exp(-d*d/(MW_W*MW_W)*2.2);
  }
  const stars=Array.from({length:320},()=>{
    let x,y,attempts=0;
    do{x=rnd(0,W);y=rnd(0,HORIZON*.98);attempts++;}
    while(Math.random()>mwWeight(x,y)*2.5+.08&&attempts<12);
    const inMW=mwDist(x,y)<MW_W*.9;
    return{x,y,r:inMW?rnd(.1,.75):rnd(.15,1.4),
           a:inMW?rnd(.5,1):rnd(.15,.78),da:rnd(-.01,.01),
           tw:Math.random()>.42,hue:Math.random()<.18?rnd(210,240):Math.random()<.1?rnd(18,35):0,
           sat:Math.random()<.28?rnd(50,85):0};
  });
  const dustClouds=Array.from({length:14},(_,i)=>{
    const t2=rnd(.1,.9);
    return{x:MW_X1+t2*MW_DX+rnd(-MW_W*.6,MW_W*.6),
           y:MW_Y1+t2*MW_DY+rnd(-MW_W*.3,MW_W*.3),
           rx:rnd(W*.04,W*.1),ry:rnd(H*.02,H*.055),
           angle:Math.atan2(MW_DY,MW_DX)+rnd(-.3,.3),a:rnd(.05,.1)};
  });
  const horizonGlow=ctx.createRadialGradient(W*.72,H*.78,0,W*.72,H*.78,H*.38);
  horizonGlow.addColorStop(0,'rgba(255,175,80,.1)');
  horizonGlow.addColorStop(.4,'rgba(240,140,50,.045)');
  horizonGlow.addColorStop(1,'rgba(200,100,20,0)');
  let meteors=[],t=0;
  function draw(){
    ctx.clearRect(0,0,W,H); t++;
    ctx.fillStyle=horizonGlow; ctx.fillRect(0,0,W,H);
    dustClouds.forEach(d=>{
      ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.angle);
      const g=ctx.createRadialGradient(0,0,0,0,0,d.rx);
      g.addColorStop(0,`rgba(180,200,255,${d.a})`);
      g.addColorStop(.5,`rgba(160,185,248,${d.a*.4})`);
      g.addColorStop(1,'rgba(140,168,240,0)');
      ctx.scale(1,d.ry/d.rx);ctx.beginPath();ctx.arc(0,0,d.rx,0,PI2);
      ctx.fillStyle=g;ctx.fill();ctx.restore();
    });
    stars.forEach(s=>{
      if(s.tw){s.a+=s.da;if(s.a<.08||s.a>.98)s.da*=-1;}
      const col=s.sat>0?`hsla(${s.hue},${s.sat}%,92%,${s.a})`:`rgba(222,218,255,${s.a})`;
      if(s.r>1.0&&s.a>.58){
        const dl=s.r*5.5;
        [[s.x-dl,s.y,s.x+dl,s.y],[s.x,s.y-dl,s.x,s.y+dl]].forEach(([x1,y1,x2,y2])=>{
          const g=ctx.createLinearGradient(x1,y1,x2,y2);
          g.addColorStop(0,'rgba(212,208,255,0)');
          g.addColorStop(.5,`rgba(212,208,255,${s.a*.16})`);
          g.addColorStop(1,'rgba(212,208,255,0)');
          ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
          ctx.strokeStyle=g;ctx.lineWidth=.55;ctx.stroke();
        });
      }
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,PI2);ctx.fillStyle=col;ctx.fill();
    });
    if(Math.random()<.0018){
      const baseAng=Math.atan2(MW_DY,MW_DX);
      const ang=baseAng+rnd(-.15,.15);
      meteors.push({x:rnd(W*.1,W*.9),y:rnd(H*.05,H*.5),
        vx:Math.cos(ang)*rnd(10,18),vy:Math.sin(ang)*rnd(10,18),life:1,tail:[]});
    }
    meteors=meteors.filter(m=>m.life>0);
    meteors.forEach(m=>{
      m.tail.push({x:m.x,y:m.y});
      if(m.tail.length>24)m.tail.shift();
      m.x+=m.vx;m.y+=m.vy;m.life-=.02;
      for(let i=1;i<m.tail.length;i++){
        const p0=m.tail[i-1],p1=m.tail[i],prog=i/m.tail.length;
        const gg=Math.round(lerp(185,255,prog)),bb=Math.round(lerp(58,255,prog));
        ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);
        ctx.strokeStyle=`rgba(255,${gg},${bb},${m.life*prog*.9})`;
        ctx.lineWidth=prog*2.8;ctx.stroke();
      }
      const hg=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,5);
      hg.addColorStop(0,`rgba(255,255,255,${m.life})`);
      hg.addColorStop(.45,`rgba(255,205,90,${m.life*.5})`);
      hg.addColorStop(1,'rgba(255,158,28,0)');
      ctx.beginPath();ctx.arc(m.x,m.y,5,0,PI2);ctx.fillStyle=hg;ctx.fill();
    });
    raf(draw,tk);
  } draw();
}

/* ═══ 🌸 樱花 ═══════════════════════════════════════════════ */
function _sakura(ctx, W, H, tk) {
  let wx=.2,wt=.2;
  iv(()=>{wt=rnd(-.1,.6);},3500);
  function mkPetal(airborne){
    if(airborne){
      const fromLeft=Math.random()>.5;
      return{x:fromLeft?rnd(-20,W*.3):rnd(W*.7,W+20),y:rnd(-30,H*.6),
             sz:rnd(3,9),vx:fromLeft?rnd(.2,.8):rnd(-.8,-.2),vy:rnd(.3,.9),
             rot:rnd(0,PI2),rv:rnd(-.025,.025),sw:rnd(0,PI2),sws:rnd(.006,.014),
             a:rnd(.5,.85),fa:rnd(0,PI2),fs:rnd(.005,.013),vi:rnd(.08,.18),type:'air'};
    } else {
      return{x:rnd(0,W),y:rnd(H*.55,H+10),sz:rnd(2,6),vx:rnd(-.08,.08),vy:rnd(-.02,.05),
             rot:rnd(0,PI2),rv:rnd(-.005,.005),sw:rnd(0,PI2),sws:rnd(.002,.006),
             a:rnd(.3,.65),fa:rnd(0,PI2),fs:rnd(.002,.008),vi:rnd(.06,.14),type:'ground'};
    }
  }
  const airPetals=Array.from({length:70},()=>mkPetal(true));
  const groundPetals=Array.from({length:50},()=>mkPetal(false));
  const mist=Array.from({length:6},(_,i)=>({
    x:W*(.2+i*.14),y:rnd(H*.3,H*.6),rx:rnd(W*.12,W*.28),ry:rnd(H*.04,H*.1),
    a:rnd(.04,.08),ph:rnd(0,PI2),phs:rnd(.001,.003),
  }));
  function drawPetal(p){
    const s=p.sz,flip=Math.cos(p.fa),back=flip<0;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);
    ctx.scale(flip,1);ctx.globalAlpha=p.a;
    ctx.beginPath();
    ctx.moveTo(0,s*.52);
    ctx.bezierCurveTo(s*.88,s*.18,s*.82,-s*.34,0,-s*.43);
    ctx.bezierCurveTo(-s*.82,-s*.34,-s*.88,s*.18,0,s*.52);
    ctx.closePath();
    const g=ctx.createRadialGradient(0,-s*.18,0,0,s*.08,s*1.02);
    if(!back){g.addColorStop(0,'rgba(255,235,242,.98)');g.addColorStop(.5,'rgba(255,205,224,.9)');g.addColorStop(1,'rgba(255,175,206,.16)');}
    else{g.addColorStop(0,'rgba(240,192,212,.96)');g.addColorStop(.5,'rgba(224,162,192,.82)');g.addColorStop(1,'rgba(210,142,176,.12)');}
    ctx.fillStyle=g;ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0,s*.5);ctx.quadraticCurveTo(0,0,0,-s*.41);
    ctx.moveTo(0,s*.08);ctx.quadraticCurveTo(-s*.46,-s*.04,-s*.66,-s*.22);
    ctx.moveTo(0,s*.08);ctx.quadraticCurveTo(s*.46,-s*.04,s*.66,-s*.22);
    ctx.strokeStyle=`rgba(210,142,176,${p.vi})`;ctx.lineWidth=.5;ctx.stroke();
    ctx.restore();ctx.globalAlpha=1;
  }
  function draw(){
    ctx.clearRect(0,0,W,H);wx+=(wt-wx)*.006;
    mist.forEach(m=>{
      m.ph+=m.phs;ctx.save();ctx.translate(m.x,m.y);
      const g=ctx.createRadialGradient(0,0,0,0,0,m.rx);
      g.addColorStop(0,`rgba(255,235,240,${m.a})`);g.addColorStop(1,'rgba(255,228,235,0)');
      ctx.scale(1,m.ry/m.rx);ctx.beginPath();ctx.arc(0,0,m.rx,0,PI2);ctx.fillStyle=g;ctx.fill();ctx.restore();
    });
    groundPetals.forEach(p=>{
      p.sw+=p.sws;p.rot+=p.rv;p.fa+=p.fs;
      p.x+=p.vx+Math.sin(p.sw)*.15+wx*.2;p.y+=p.vy;
      if(p.y>H+15){p.y=H*.55+rnd(0,H*.4);p.x=rnd(0,W);}
      if(p.x<-15)p.x=W+15;if(p.x>W+15)p.x=-15;
      drawPetal(p);
    });
    airPetals.forEach(p=>{
      p.sw+=p.sws;p.rot+=p.rv;p.fa+=p.fs;
      p.x+=p.vx+wx+Math.sin(p.sw)*.55;p.y+=p.vy+Math.cos(p.sw*.7)*.18;
      if(p.y>H+20||(p.x>W*.1&&p.x<W*.9&&p.y>H*.65)){Object.assign(p,mkPetal(true));}
      if(p.x<-25)p.x=W+25;if(p.x>W+25)p.x=-25;
      drawPetal(p);
    });
    raf(draw,tk);
  } draw();
}

/* ═══ 🌅 火烧云 ═════════════════════════════════════════════ */
function _clouds(ctx, W, H, tk) {
  const HORIZON=H*.58,SUN_X=W*.48;
  const sunGlow=ctx.createRadialGradient(SUN_X,HORIZON,0,SUN_X,HORIZON,W*.35);
  sunGlow.addColorStop(0,'rgba(255,235,140,.22)');sunGlow.addColorStop(.15,'rgba(255,185,60,.14)');
  sunGlow.addColorStop(.45,'rgba(255,120,20,.06)');sunGlow.addColorStop(1,'rgba(220,60,0,0)');
  const waveGlints=Array.from({length:35},()=>({
    x:SUN_X+rnd(-W*.45,W*.45),y:rnd(HORIZON+H*.02,H*.98),
    rx:rnd(W*.015,W*.08),ry:rnd(1.5,4.5),a:rnd(.04,.14),
    ph:rnd(0,PI2),phs:rnd(.02,.06),spd:rnd(-.15,.15),
  }));
  const cloudGlows=Array.from({length:16},()=>({
    x:rnd(-W*.1,W*1.1),y:rnd(0,HORIZON*.95),
    rx:rnd(W*.08,W*.22),ry:rnd(H*.012,H*.04),
    a:rnd(.04,.1),spd:rnd(-.05,.05),ph:rnd(0,PI2),phs:rnd(.001,.003),
  }));
  let t=0;
  function draw(){
    ctx.clearRect(0,0,W,H);t+=.004;
    ctx.fillStyle=sunGlow;ctx.fillRect(0,0,W,H);
    cloudGlows.forEach(c=>{
      c.x+=c.spd;c.ph+=c.phs;
      if(c.x<-c.rx*2)c.x=W+c.rx;if(c.x>W+c.rx*2)c.x=-c.rx;
      const yFrac=c.y/HORIZON;
      const r=Math.round(lerp(255,180,yFrac)),g2=Math.round(lerp(200,120,yFrac)),b=Math.round(lerp(80,200,yFrac));
      const pulse=.7+.3*Math.sin(c.ph);
      ctx.save();ctx.translate(c.x,c.y);
      const g=ctx.createRadialGradient(0,0,0,0,0,c.rx);
      g.addColorStop(0,`rgba(${r},${g2},${b},${c.a*pulse})`);
      g.addColorStop(.5,`rgba(${r},${g2},${b},${c.a*pulse*.35})`);
      g.addColorStop(1,`rgba(${r},${g2},${b},0)`);
      ctx.scale(1,c.ry/c.rx);ctx.beginPath();ctx.arc(0,0,c.rx,0,PI2);ctx.fillStyle=g;ctx.fill();ctx.restore();
    });
    waveGlints.forEach(w=>{
      w.ph+=w.phs;w.x+=w.spd;
      if(w.x<-w.rx*2)w.x=W+w.rx;if(w.x>W+w.rx*2)w.x=-w.rx;
      const distSun=Math.abs(w.x-SUN_X)/(W*.5);
      const brightness=w.a*(1-distSun*.55)*(.6+.4*Math.abs(Math.sin(w.ph)));
      if(brightness<.01)return;
      ctx.save();ctx.translate(w.x,w.y);
      const g=ctx.createRadialGradient(0,0,0,0,0,w.rx);
      g.addColorStop(0,`rgba(255,215,120,${brightness})`);
      g.addColorStop(.4,`rgba(255,175,60,${brightness*.4})`);
      g.addColorStop(1,'rgba(255,140,20,0)');
      ctx.scale(1,w.ry/w.rx);ctx.beginPath();ctx.arc(0,0,w.rx,0,PI2);ctx.fillStyle=g;ctx.fill();ctx.restore();
    });
    raf(draw,tk);
  } draw();
}

/* ═══ 🌿 雨林 ═══════════════════════════════════════════════ */
function _forest(ctx, W, H, tk) {
  const rays=Array.from({length:7},(_,i)=>{
    const cx=W*(.12+i*.135)+rnd(-W*.03,W*.03);
    return{cx,w:rnd(10,32),skew:rnd(-10,10),a:rnd(.08,.14),ph:rnd(0,PI2),phs:rnd(.0018,.0028),reach:rnd(H*.55,H*.92)};
  });
  const waterSpots=Array.from({length:14},()=>({
    x:rnd(W*.1,W*.9),y:rnd(H*.62,H*.95),rx:rnd(8,32),ry:rnd(2.5,7),
    a:rnd(.06,.12),ph:rnd(0,PI2),phs:rnd(.014,.028),spd:rnd(-.05,.05),
  }));
  function mkMote(d){return{x:rnd(0,W),y:rnd(0,H),r:rnd(.2,.9)*d,vx:rnd(-.06,.06)*d,vy:-rnd(.018,.12)*d,a:rnd(.06,.24)*d,ph:rnd(0,PI2),d};}
  const motes=[Array.from({length:55},()=>mkMote(.3)),Array.from({length:40},()=>mkMote(.65)),Array.from({length:22},()=>mkMote(1.0))];
  let t=0;
  function draw(){
    ctx.clearRect(0,0,W,H);t++;
    rays.forEach(r=>{
      r.ph+=r.phs;
      const nx=r.cx+Math.sin(r.ph)*5+Math.sin(r.ph*1.7+.8)*3;
      const p=.68+.32*Math.sin(r.ph);
      const go=ctx.createLinearGradient(nx,0,nx,r.reach*.9);
      go.addColorStop(0,`rgba(235,255,188,${r.a*.62*p})`);go.addColorStop(.28,`rgba(218,252,172,${r.a*.35*p})`);
      go.addColorStop(.68,`rgba(198,242,152,${r.a*.14*p})`);go.addColorStop(1,'rgba(178,230,132,0)');
      ctx.save();ctx.beginPath();
      ctx.moveTo(nx-r.w*2.2,0);ctx.lineTo(nx+r.w*2.2,0);
      ctx.lineTo(nx+r.w*2.2+r.skew,r.reach*.9);ctx.lineTo(nx-r.w*2.2+r.skew,r.reach*.9);
      ctx.closePath();ctx.fillStyle=go;ctx.fill();ctx.restore();
      const gi=ctx.createLinearGradient(nx,0,nx,r.reach);
      gi.addColorStop(0,`rgba(250,255,215,${r.a*1.5*p})`);gi.addColorStop(.2,`rgba(238,255,198,${r.a*p})`);
      gi.addColorStop(.65,`rgba(215,250,172,${r.a*.3*p})`);gi.addColorStop(1,'rgba(188,238,145,0)');
      ctx.save();ctx.beginPath();
      ctx.moveTo(nx-r.w*.36,0);ctx.lineTo(nx+r.w*.36,0);
      ctx.lineTo(nx+r.w*.36+r.skew*.5,r.reach);ctx.lineTo(nx-r.w*.36+r.skew*.5,r.reach);
      ctx.closePath();ctx.fillStyle=gi;ctx.fill();ctx.restore();
    });
    waterSpots.forEach(s=>{
      s.x+=s.spd;s.ph+=s.phs;
      if(s.x<-s.rx)s.x=W+s.rx;if(s.x>W+s.rx)s.x=-s.rx;
      const pulse=.6+.4*Math.abs(Math.sin(s.ph));
      ctx.save();ctx.translate(s.x,s.y);
      const g=ctx.createRadialGradient(0,0,0,0,0,s.rx);
      g.addColorStop(0,`rgba(238,255,198,${s.a*pulse})`);g.addColorStop(.5,`rgba(212,250,172,${s.a*pulse*.38})`);g.addColorStop(1,'rgba(188,238,145,0)');
      ctx.scale(1,s.ry/s.rx);ctx.beginPath();ctx.arc(0,0,s.rx,0,PI2);ctx.fillStyle=g;ctx.fill();ctx.restore();
    });
    motes.forEach(layer=>layer.forEach(m=>{
      m.x+=m.vx+Math.sin(t*.009+m.ph)*.12*m.d;m.y+=m.vy;
      if(m.y<-4){m.y=H+4;m.x=rnd(0,W);}
      if(m.x<0)m.x=W;if(m.x>W)m.x=0;
      const fl=m.a*(.38+.62*Math.abs(Math.sin(t*.012+m.ph)));
      ctx.beginPath();ctx.arc(m.x,m.y,m.r,0,PI2);ctx.fillStyle=`rgba(225,255,188,${fl})`;ctx.fill();
    }));
    raf(draw,tk);
  } draw();
}

/* ═══ 🌧 雨天 ═══════════════════════════════════════════════ */
function _rain(ctx, W, H, tk) {
  function mkDot(init){
    return{x:rnd(0,W),y:init?rnd(0,H):rnd(0,H*.35),r:rnd(1.5,5.5),maxR:rnd(5,14),
           growSpd:rnd(.008,.022),a:rnd(.38,.62),flowing:false,vy:0,vx:0,
           path:[],pathMaxLen:120,wobble:rnd(-.012,.012),wobblePh:rnd(0,PI2),dead:false};
  }
  const dots=Array.from({length:55},()=>mkDot(true));
  iv(()=>{
    const di=dots.findIndex(d=>d.dead);
    if(di>=0)dots[di]=mkDot(false);
    else if(dots.length<75)dots.push(mkDot(false));
  },280);
  function drawDrop(x,y,r,a,stretch){
    const sy=stretch||1;ctx.save();ctx.translate(x,y);ctx.scale(1,sy);
    const g=ctx.createRadialGradient(-r*.3,-r*.35,r*.04,r*.1,r*.1,r);
    g.addColorStop(0,`rgba(255,255,255,${a*.92})`);g.addColorStop(.22,`rgba(230,242,255,${a*.72})`);
    g.addColorStop(.55,`rgba(185,215,245,${a*.35})`);g.addColorStop(.82,`rgba(155,195,235,${a*.12})`);
    g.addColorStop(1,`rgba(130,180,225,${a*.04})`);
    ctx.beginPath();ctx.arc(0,0,r,0,PI2);ctx.fillStyle=g;ctx.fill();
    ctx.strokeStyle=`rgba(180,215,248,${a*.22})`;ctx.lineWidth=.6;ctx.stroke();
    const hg=ctx.createRadialGradient(-r*.32,-r*.38,0,-r*.28,-r*.32,r*.38);
    hg.addColorStop(0,`rgba(255,255,255,${a*.88})`);hg.addColorStop(1,'rgba(255,255,255,0)');
    ctx.beginPath();ctx.arc(0,0,r,0,PI2);ctx.fillStyle=hg;ctx.fill();
    ctx.beginPath();ctx.arc(r*.22,r*.28,r*.28,0,PI2);ctx.fillStyle=`rgba(140,185,230,${a*.14})`;ctx.fill();
    ctx.restore();
  }
  function drawTrail(path,r,a){
    if(path.length<3)return;
    const w=clamp(r*.55,.8,3.5);
    ctx.beginPath();ctx.moveTo(path[0].x,path[0].y);
    for(let i=1;i<path.length;i++){const mx=(path[i-1].x+path[i].x)*.5,my=(path[i-1].y+path[i].y)*.5;ctx.quadraticCurveTo(path[i-1].x,path[i-1].y,mx,my);}
    ctx.strokeStyle=`rgba(200,228,252,${a*.28})`;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
    ctx.beginPath();ctx.moveTo(path[0].x-w*.3,path[0].y);
    for(let i=1;i<path.length;i++)ctx.lineTo(path[i].x-w*.3,path[i].y);
    ctx.strokeStyle=`rgba(255,255,255,${a*.18})`;ctx.lineWidth=w*.35;ctx.stroke();
  }
  let t=0;
  function draw(){
    ctx.clearRect(0,0,W,H);t++;
    dots.forEach(d=>{
      if(d.dead)return;
      if(!d.flowing){
        d.r+=d.growSpd;
        const jx=Math.sin(t*.04+d.wobblePh)*.15,jy=Math.cos(t*.03+d.wobblePh)*.08;
        drawDrop(d.x+jx,d.y+jy,d.r,d.a,1);
        if(d.r>=d.maxR){d.flowing=true;d.vy=rnd(.4,1.2);d.vx=d.wobble*d.r*2;d.path.push({x:d.x,y:d.y});}
      } else {
        d.vy=Math.min(d.vy+rnd(.018,.032),3.8);d.wobblePh+=.045;
        d.vx+=Math.sin(d.wobblePh)*.04+d.wobble*.15;d.vx*=.88;
        d.x+=d.vx;d.y+=d.vy;
        const stretch=clamp(1+d.vy*.055,1,1.65);
        d.path.push({x:d.x,y:d.y});if(d.path.length>d.pathMaxLen)d.path.shift();
        drawTrail(d.path,d.r,d.a);drawDrop(d.x,d.y,d.r*.85,d.a,stretch);
        if(Math.random()<.012&&d.r>5)dots.push({...mkDot(false),x:d.x+rnd(-4,4),y:d.y-rnd(5,20),r:rnd(1,3),maxR:999,growSpd:0,flowing:false,a:rnd(.2,.4)});
        if(d.y>H+20||d.x<-10||d.x>W+10)d.dead=true;
      }
    });
    for(let i=dots.length-1;i>=0;i--){
      if(dots[i].dead&&dots[i].path.length===0)dots.splice(i,1);
      else if(dots[i].dead){dots[i].a-=.004;if(dots[i].a>.05)drawTrail(dots[i].path,dots[i].r,dots[i].a);else dots.splice(i,1);}
    }
    raf(draw,tk);
  } draw();
}

/* ═══ 🌠 极光 v3 — 宽光幕，自然飘动 ══════════════════════════ */
function _aurora(ctx, W, H, tk) {
  const HORIZON = H * .60;

  const stars = Array.from({length:180}, () => ({
    x:rnd(0,W), y:rnd(0,HORIZON*1.1),
    r:rnd(.1,.9), a:rnd(.15,.85),
    da:rnd(-.006,.006), tw:Math.random()>.45,
  }));

  const CURTAINS = [
    { xC:W*.48, xS:W*.92, yTop:H*.04, yBot:HORIZON,
      h:142, h2:158, bright:.9, cols:22,
      wPh:0,   wSpd:.004,  wAm:H*.032,
      tPh:.5,  tSpd:.0028, tAm:H*.065 },
    { xC:W*.74, xS:W*.48, yTop:H*.12, yBot:HORIZON,
      h:148, h2:163, bright:.58, cols:14,
      wPh:2.4, wSpd:.0035, wAm:H*.024,
      tPh:1.8, tSpd:.0022, tAm:H*.048 },
    { xC:W*.55, xS:W*.62, yTop:H*.0,  yBot:H*.38,
      h:272, h2:292, bright:.42, cols:12,
      wPh:4.1, wSpd:.005,  wAm:H*.016,
      tPh:2.6, tSpd:.004,  tAm:H*.044 },
    { xC:W*.2,  xS:W*.32, yTop:H*.08, yBot:HORIZON,
      h:150, h2:162, bright:.45, cols:10,
      wPh:5.8, wSpd:.0038, wAm:H*.018,
      tPh:3.4, tSpd:.003,  tAm:H*.036 },
  ];

  const reflections = Array.from({length:12}, () => ({
    x:rnd(W*.05,W*.95), y:rnd(HORIZON+H*.02,H*.88),
    rx:rnd(W*.04,W*.16), ry:rnd(H*.006,H*.018),
    hue:Math.random()>.35?rnd(146,164):rnd(272,294),
    a:rnd(.03,.09), ph:rnd(0,PI2), phspd:rnd(.002,.007),
  }));

  let t=0;
  function draw(){
    ctx.clearRect(0,0,W,H); t+=.004;

    stars.forEach(s=>{
      if(s.tw){s.a+=s.da; if(s.a<.05||s.a>.88)s.da*=-1;}
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,PI2);
      ctx.fillStyle=`rgba(205,218,255,${s.a})`; ctx.fill();
    });

    CURTAINS.forEach(c=>{
      c.wPh+=c.wSpd; c.tPh+=c.tSpd;
      const xLeft=c.xC-c.xS*.5;
      const colW=c.xS/c.cols;

      for(let i=0;i<c.cols;i++){
        const frac=i/(c.cols-1);
        // Hanning窗：两端平滑淡出
        const win=Math.sin(frac*Math.PI);
        if(win<.015)continue;

        const bx=xLeft+frac*c.xS+Math.sin(c.wPh+frac*2.8)*c.wAm*.5;
        // 两个sin叠加，避免过于规律
        const topSway=Math.sin(c.tPh+frac*3.6)*c.tAm
                     +Math.sin(c.tPh*1.7+frac*1.4)*c.tAm*.35;
        const tx=bx+topSway+(frac-.5)*c.xS*.12;
        const ty=c.yTop+Math.sin(c.tPh*.9+frac*2.1)*H*.022;

        const stripe=.55+.45*Math.abs(Math.sin(frac*PI2*2.8+c.wPh*3.1));
        const pulse=.72+.28*Math.sin(c.wPh*1.5+frac*2.2);
        const alpha=clamp(c.bright*win*stripe*pulse*.85,0,.88);
        const hw=clamp(colW*.85*(1+win*.4),1.5,colW*1.6);

        const gv=ctx.createLinearGradient(0,c.yBot,0,ty);
        gv.addColorStop(0,   `hsla(${c.h},90%,92%,0)`);
        gv.addColorStop(.03, `hsla(${c.h},95%,95%,${alpha*.55})`);
        gv.addColorStop(.1,  `hsla(${c.h},90%,75%,${alpha*.92})`);
        gv.addColorStop(.32, `hsla(${lerp(c.h,c.h2,frac)|0},82%,62%,${alpha})`);
        gv.addColorStop(.65, `hsla(${c.h2},75%,52%,${alpha*.5})`);
        gv.addColorStop(.88, `hsla(${c.h2},68%,44%,${alpha*.15})`);
        gv.addColorStop(1,   `hsla(${c.h2},62%,38%,0)`);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(bx-hw,c.yBot); ctx.lineTo(bx+hw,c.yBot);
        ctx.lineTo(tx+hw*.32,ty); ctx.lineTo(tx-hw*.32,ty);
        ctx.closePath();
        ctx.fillStyle=gv; ctx.fill();
        ctx.restore();
      }

      const glowX=c.xC+Math.sin(c.wPh*.5)*W*.015;
      const glowR=c.xS*.48;
      const gg=ctx.createRadialGradient(glowX,HORIZON,0,glowX,HORIZON,glowR);
      gg.addColorStop(0,  `hsla(${c.h},85%,72%,${.1*c.bright})`);
      gg.addColorStop(.4, `hsla(${c.h},80%,58%,${.04*c.bright})`);
      gg.addColorStop(1,  `hsla(${c.h},75%,45%,0)`);
      ctx.save(); ctx.scale(1,.38);
      ctx.beginPath(); ctx.arc(glowX,HORIZON/.38,glowR,0,PI2);
      ctx.fillStyle=gg; ctx.fill(); ctx.restore();
    });

    reflections.forEach(r=>{
      r.ph+=r.phspd;
      const p=.65+.35*Math.sin(r.ph);
      ctx.save(); ctx.translate(r.x,r.y);
      const g=ctx.createRadialGradient(0,0,0,0,0,r.rx);
      g.addColorStop(0,  `hsla(${r.hue},85%,68%,${r.a*p})`);
      g.addColorStop(.5, `hsla(${r.hue},78%,55%,${r.a*p*.32})`);
      g.addColorStop(1,  `hsla(${r.hue},72%,44%,0)`);
      ctx.scale(1,r.ry/r.rx);
      ctx.beginPath(); ctx.arc(0,0,r.rx,0,PI2);
      ctx.fillStyle=g; ctx.fill(); ctx.restore();
    });

    raf(draw,tk);
  } draw();
}

/* ═══ 🏔️ 雪山 ═══════════════════════════════════════════════ */
function _snow(ctx, W, H, tk) {
  let wx=.18,wt=.18;
  iv(()=>{wt=rnd(-.9,1.9);},5000);
  function flake(ctx,r){
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3,mx=Math.cos(a)*r*.55,my=Math.sin(a)*r*.55,sa=a+Math.PI/2;
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();
      ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx+Math.cos(sa)*r*.27,my+Math.sin(sa)*r*.27);ctx.stroke();
      ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx-Math.cos(sa)*r*.27,my-Math.sin(sa)*r*.27);ctx.stroke();
    }
  }
  const layers=[
    Array.from({length:62},()=>({d:.2,x:rnd(0,W),y:rnd(0,H),r:rnd(.3,.75),sp:rnd(.14,.28),sw:rnd(0,PI2),sws:rnd(.003,.007),a:rnd(.07,.24)})),
    Array.from({length:48},()=>({d:.58,x:rnd(0,W),y:rnd(0,H),r:rnd(.72,1.6),sp:rnd(.3,.56),sw:rnd(0,PI2),sws:rnd(.005,.009),a:rnd(.16,.42)})),
    Array.from({length:28},()=>({d:1.0,x:rnd(0,W),y:rnd(0,H),r:rnd(1.8,3.4),sp:rnd(.62,.95),sw:rnd(0,PI2),sws:rnd(.007,.014),a:rnd(.3,.56)})),
  ];
  const piles=Array.from({length:8},(_,i)=>({x:W*(i/7),h:rnd(H*.03,H*.072),w:rnd(W*.16,W*.26)}));
  function draw(){
    ctx.clearRect(0,0,W,H); wx+=(wt-wx)*.005;
    piles.forEach(p=>{
      const g=ctx.createRadialGradient(p.x,H,0,p.x,H-p.h*.5,p.w*.55);
      g.addColorStop(0,'rgba(238,246,255,.2)');g.addColorStop(1,'rgba(218,232,255,0)');
      ctx.beginPath();ctx.ellipse(p.x,H,p.w*.5,p.h,0,Math.PI,0);ctx.fillStyle=g;ctx.fill();
    });
    layers.forEach(lr=>lr.forEach(f=>{
      f.sw+=f.sws;f.y+=f.sp;f.x+=wx*f.d+Math.sin(f.sw)*f.d*.42;
      if(f.y>H+8){f.y=-8;f.x=rnd(0,W);}
      if(f.x<-18)f.x=W+18;else if(f.x>W+18)f.x=-18;
      ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.sw*.44);ctx.globalAlpha=f.a;
      if(f.r>1.85){
        ctx.strokeStyle=`rgba(244,252,255,${f.a})`;ctx.lineWidth=.55;flake(ctx,f.r);
        ctx.beginPath();ctx.arc(0,0,f.r*.16,0,PI2);ctx.fillStyle='rgba(255,255,255,.92)';ctx.fill();
      } else {
        ctx.beginPath();ctx.arc(0,0,f.r,0,PI2);ctx.fillStyle='rgba(246,253,255,.92)';ctx.fill();
      }
      ctx.restore();ctx.globalAlpha=1;
    }));
    raf(draw,tk);
  } draw();
}
