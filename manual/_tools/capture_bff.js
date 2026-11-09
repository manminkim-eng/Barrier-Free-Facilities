// 장애인 편의시설 설치기준 검토 매뉴얼 화면 캡처 — usage: node capture_bff.js <repoDir> <outDir>
// 안전대가 · 해체감리 매뉴얼과 같은 규격: 1440×900 · DSF 1.25 · _marks.json(번호 배지 % 좌표) · _example.json(예제 검증값)
const {chromium}=require(process.env.MM_PW||'playwright');const fs=require('fs');const path=require('path');const {setup,server}=require('./serve');
const repo=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);fs.mkdirSync(out,{recursive:true});
const VW=1440,VH=900,DSF=1.25,PORT=8894;
/* 예제 A = 앱 초기값: 신축 · 민간 · 업무시설(사무소) 1,200㎡ + 휴게음식점 180㎡ · 지상 5층 · 지하 1층 · 연면적 1,680㎡ · 부설주차 14대
   예제 B = 신축 · 국가 · 지방자치단체 · 시청 별관(국가 · 지자체 청사) 2,400㎡ · 지상 7층 · 지하 1층 · 부설주차 30대
   예제 C = 증축(기존 건축물에 붙여서) · 민간 · 사무소 기존 450㎡ + 증축 100㎡ · 지상 3층 · 부설주차 8대 */
const FREEZE=`(()=>{const T=new Date(2026,10,9,10,0,0).getTime();const D=Date;class F extends D{constructor(...a){if(a.length)super(...a);else super(T);}static now(){return T;}}window.Date=F;window.alert=()=>{};window.confirm=()=>true;try{localStorage.clear()}catch(e){}})()`;
const HELP=`window.__vis=e=>e&&e.getClientRects().length>0;
window.__set=(id,v)=>{const e=document.getElementById(id);if(e.type==='checkbox'){e.checked=!!v;e.dispatchEvent(new Event('change',{bubbles:true}));return;}e.value=String(v);e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));};
window.__card=(t)=>{const h=[...document.querySelectorAll('.card-title')].find(e=>__vis(e)&&e.textContent.trim()===t);return h?h.closest('.card'):null;};
window.__ref=(i)=>[...document.querySelectorAll('#tab-reference .ref-block')][i]||null;
window.__find=(sel)=>{
 if(sel.startsWith('card:'))return __card(sel.slice(5));
 if(sel.startsWith('ref:'))return __ref(+sel.slice(4));
 if(sel.startsWith('wrap:')){const e=document.getElementById(sel.slice(5));return e?(e.closest('label')||e.parentElement):null;}
 if(sel.startsWith('a4tbl:')){return document.querySelectorAll('#a4Page table')[+sel.slice(6)]||null;}
 if(sel.startsWith('a4sub:')){return [...document.querySelectorAll('#a4Page .a4-sub')].filter(__vis)[+sel.slice(6)]||null;}
 if(sel.startsWith('itab:')){return [...document.querySelectorAll('.fml-itab')][+sel.slice(5)]||null;}
 if(sel.startsWith('chip:')){return document.querySelector('#facPreview .bff-'+sel.slice(5));}
 for(const s of sel.split(',')){const e=[...document.querySelectorAll(s)].find(__vis);if(e)return e;}return null;};
window.__B=()=>{__set('work','new');__set('owner','gov');ROWS=[{u:'gov',a:2400,q1:0,q2:0}];renderRows();
 __set('totalArea',2400);__set('floorsAbove',7);__set('floorsBelow',1);__set('parkN',30);__set('projectName','만민시청 별관 신축공사');__set('client','만민시');recalc();};
window.__C=()=>{__set('owner','priv');__set('work','ext');ROWS=[{u:'office',a:550,a0:450,a1:100,q1:0,q10:0,q11:0,q2:0,q20:0,q21:0}];renderRows();
 __set('totalArea',550);__set('floorsAbove',3);__set('floorsBelow',0);__set('parkN',8);__set('projectName','만민빌딩 증축공사');__set('client','(주)만민');recalc();};`;
const SHOTS=[
 {id:'s01_overview',tab:'input',clip:'viewport',m:[['.tab-bar-inner','작업 탭'],['.sum-bar-wrap','요약 스트립'],['.law-strip','근거 안내'],['.total-banner','판정 배너'],['card:사업 정보','사업 정보'],['card:공사 구분 · 시설주','공사 구분 · 시설주'],['#fab-group','판정 안내']]},
 {id:'s02_tabs',tab:'input',clip:'.app-header',union:'.tab-bar',m:[['.tb:nth-of-type(1)','검토 입력'],['.tb:nth-of-type(2)','검토서 미리보기'],['.tb:nth-of-type(3)','법적 근거·기준표'],['.tb-manual','매뉴얼'],['.hdr-right','근거 법령']]},
 {id:'s03_project',tab:'input',clip:'card:사업 정보',m:[['#projectName','사업명'],['#client','건축주 · 발주처'],['#siteLoc','위치'],['#author','작성자'],['#reportDate','작성일']]},
 {id:'s04_work',tab:'input',clip:'card:공사 구분 · 시설주',m:[['#work','공사 구분'],['#owner','시설주'],['#tallWrap','초고층 · 지하연계']]},
 {id:'s05_scale',tab:'input',clip:'card:건물 규모',m:[['#totalArea','연면적'],['#bldHeight','높이'],['#floorsAbove','지상 층수'],['#floorsBelow','지하 층수'],['#parkN','부설주차 대수'],['wrap:only1','1층에만 이용 시설'],['wrap:stairEx','6층 직통계단 예외']]},
 {id:'s06_uses',tab:'input',clip:'card:용도별 규모',m:[['#u0','용도 1'],['#a0','바닥면적'],['#uh0','판정'],['#u1','용도 2'],['#uh1','판정'],['.sif-add','용도 추가']]},
 {id:'s07_fac',tab:'input',clip:'card:설치 편의시설',m:[['chip:M','의무'],['chip:R','권장']]},
 {id:'s08_bf',tab:'input',clip:'card:BF 인증 의무',m:[['#bfInfo','BF 인증 판정']]},
 {id:'s09_banner',tab:'input',clip:'.sum-bar-wrap',union:'.total-banner',m:[['#sb-work','공사 구분'],['#sb-target','대상 여부'],['#sb-m','의무 수'],['#sb-r','권장 수'],['#sb-bf','BF 인증'],['#banner-total','의무 · 권장'],['#banner-sub','BF 인증 의무']]},
 {id:'s10_a4',tab:'result',clip:'viewport',m:[['.mm-btn-print','인쇄 / PDF 저장'],['.mm-btn-jpg','JPG 저장'],['.bff-figopt','그림 부록 포함'],['#a4Page','A4 검토서']]},
 {id:'s11_a4page',tab:'result',clip:'#a4Page',m:[['a4tbl:0','사업 개요'],['a4sub:0','1. 대상시설 판정'],['a4sub:1','2. 설치 편의시설'],['a4sub:2','3. 세부기준 체크리스트'],['a4sub:3','4. BF 인증 의무'],['a4sub:4','유의사항'],['a4sub:5','적용 법령']]},
 {id:'s12_reference',tab:'reference',clip:'ref:0',union:'ref:2',m:[['ref:0','법적 근거'],['ref:1','별표 1 규모 기준'],['ref:2','별표 2 의무 · 권장 표']]},
 {id:'s13_figmodal',tab:'result',pre:"openFig(1)",wait:900,fixed:true,clip:'#fg-modal .fg-box',post:"document.querySelector('#fg-modal .fg-x').click()",m:[]},
 {id:'s14_figgal',tab:'reference',pre:"document.getElementById('figGal').scrollIntoView()",clip:'ref:3',m:[['#figOnly','설치 대상 그림만'],['#figGal','그림 모음']]},
 {id:'s15_varB_input',tab:'input',pre:"__B()",clip:'viewport',m:[['.sum-bar-wrap','요약 스트립'],['.total-banner','판정 배너'],['card:공사 구분 · 시설주','국가 · 지자체 · 신축']]},
 {id:'s16_varB_fac',tab:'input',clip:'card:설치 편의시설',m:[['chip:M','의무 14종']]},
 {id:'s17_varB_bf',tab:'input',clip:'card:BF 인증 의무',m:[['#bfInfo','BF 인증 — 해당']]},
 {id:'s18_varC_uses',tab:'input',pre:"__C()",clip:'card:용도별 규모',m:[['.bff-split-note','기존 + 증축 = 판정 합계'],['#a0_0','기존'],['#a1_0','증축'],['#uh0','대상 편입']]},
 {id:'s19_varC_scope',tab:'input',clip:'card:설치 편의시설',m:[['#facPreview','설치 편의시설'],['#scopeHint','적용 범위 안내']]},
 {id:'s20_varC_a4scope',tab:'result',clip:'#r-scopeWrap',m:[]},
 {id:'s21_help_howto',tab:'input',pre:"openModal()",wait:1500,fixed:true,clip:'#fmlBox',m:[['itab:0','이용방법'],['itab:1','판정 구조'],['itab:2','공사 구분 · BF'],['itab:3','핵심 주의사항']]},
 {id:'s22_help_method',tab:null,pre:"document.querySelectorAll('.fml-itab')[1].click();document.querySelector('.fml-bd').scrollTop=0",wait:1500,fixed:true,clip:'#fmlBox',m:[]},
 {id:'s23_help_formula',tab:null,pre:"document.querySelectorAll('.fml-itab')[2].click();document.querySelector('.fml-bd').scrollTop=0",wait:1500,fixed:true,clip:'#fmlBox',m:[]},
 {id:'s24_help_caution',tab:null,pre:"document.querySelectorAll('.fml-itab')[3].click();document.querySelector('.fml-bd').scrollTop=0",wait:1500,fixed:true,post:"closeModal()",clip:'#fmlBox',m:[]},
];
(async()=>{
 const s=await server(repo,PORT);const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DSF,serviceWorkers:'block'});await setup(ctx);
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(FREEZE);
 await pg.goto(`http://127.0.0.1:${PORT}/index.html`);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(3000);
 await pg.evaluate(HELP);
 const readEx=()=>pg.evaluate(()=>{const q=id=>((document.getElementById(id)||{}).innerText||'').replace(/\s+/g,' ').trim();const s=window._s||{};
  return {banner:q('banner-total'),desc:q('banner-desc'),sub:q('banner-sub'),strip:['work','target','m','r','bf'].map(k=>q('sb-'+k)),
   ctx:s.ctx,rows:ROWS,J:(s.J||[]).map(j=>({u:j.u.id,nm:j.u.nm,st:j.st,row:j.row,why:j.why,bigo:j.bigo,inc:j.inc||''})),
   FL:(s.FL||[]).filter(o=>o.s!=='-').map(o=>({k:o.f.k,nm:o.f.nm,s:o.s,notes:o.notes})),nM:s.nM,nR:s.nR,
   BF:s.BF?{st:s.BF.st,lines:s.BF.lines,basis:s.BF.basis}:null,uh:[0,1].map(i=>q('uh'+i)),scope:q('scopeHint'),fac:q('facPreview'),bf:q('bfInfo')};});
 const ex={A:await readEx()};const meta={};
 for(const S of SHOTS){
  if(S.tab){await pg.evaluate(t=>{switchTab(t);window.scrollTo(0,0);},S.tab);await pg.waitForTimeout(600);}
  if(S.pre){try{await pg.evaluate(S.pre);}catch(e){errs.push(S.id+' pre '+e.message);}}
  await pg.waitForTimeout(S.wait||700);
  if(S.id==='s15_varB_input')ex.B=await readEx();
  if(S.id==='s18_varC_uses')ex.C=await readEx();
  if(S.id==='s11_a4page')ex.A_a4=await pg.evaluate(()=>[...document.querySelectorAll('#a4Page table tr')].map(r=>r.innerText.replace(/\s+/g,' ').trim()));
  if(S.id==='s20_varC_a4scope')ex.C_a4=await pg.evaluate(()=>[...document.querySelectorAll('#r-scopeWrap tr')].map(r=>r.innerText.replace(/\s+/g,' ').trim()));
  const info=await pg.evaluate(({S,VW,VH})=>{
   const abs=e=>{const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height};};
   let clip;
   if(S.clip==='viewport'){clip={x:0,y:scrollY,width:VW,height:VH};}
   else{const el=__find(S.clip);if(!el)return {err:'clip '+S.clip};if(!S.fixed)el.scrollIntoView({block:'start'});const a=abs(el);clip={x:a.x,y:a.y,width:a.w,height:a.h};
     if(S.union){const e2=__find(S.union);if(e2){const a2=abs(e2);const x0=Math.min(clip.x,a2.x),y0=Math.min(clip.y,a2.y),x1=Math.max(clip.x+clip.width,a2.x+a2.w),y1=Math.max(clip.y+clip.height,a2.y+a2.h);clip={x:x0,y:y0,width:x1-x0,height:y1-y0};}}}
   const marks=[];(S.m||[]).forEach(([sel,label],i)=>{const e=__find(sel);if(!e){marks.push({n:i+1,label,miss:sel});return;}const a=abs(e);
     marks.push({n:i+1,label,x:+((a.x-clip.x)/clip.width*100).toFixed(2),y:+((a.y-clip.y)/clip.height*100).toFixed(2),w:+(a.w/clip.width*100).toFixed(2),h:+(Math.min(a.h,clip.y+clip.height-a.y)/clip.height*100).toFixed(2)});});
   return {clip,marks};},{S,VW,VH});
  if(info.err){errs.push(S.id+' '+info.err);continue;}
  const c=info.clip;const cl={x:Math.max(0,c.x),y:Math.max(0,c.y),width:Math.min(c.width,VW),height:c.height};
  if(S.clip==='viewport'){await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:0,y:0,width:VW,height:VH}});}
  else if(S.fixed){const sx=await pg.evaluate(()=>scrollX),sy=await pg.evaluate(()=>scrollY);await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:c.x-sx,y:c.y-sy,width:c.width,height:Math.min(c.height,VH)}});}
  else{await pg.screenshot({path:path.join(out,S.id+'.png'),clip:cl,fullPage:true});}
  meta[S.id]={w:Math.round(cl.width),h:Math.round(cl.height),marks:info.marks};
  if(S.post){try{await pg.evaluate(S.post);}catch(e){errs.push(S.id+' post '+e.message);}await pg.waitForTimeout(500);}
 }
 const mctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block',isMobile:true,hasTouch:true});await setup(mctx);
 const mp=await mctx.newPage();await mp.addInitScript(FREEZE);
 await mp.goto(`http://127.0.0.1:${PORT}/index.html`);await mp.waitForTimeout(3000);
 await mp.screenshot({path:path.join(out,'s25_mobile_main.png')});meta['s25_mobile_main']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{const h=[...document.querySelectorAll('.card-title')].find(e=>e.textContent.trim()==='용도별 규모').closest('.card');window.scrollTo(0,h.getBoundingClientRect().top+scrollY-120);});await mp.waitForTimeout(600);
 await mp.screenshot({path:path.join(out,'s26_mobile_input.png')});meta['s26_mobile_input']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{switchTab('result');window.scrollTo(0,0);});await mp.waitForTimeout(900);
 await mp.screenshot({path:path.join(out,'s27_mobile_a4.png')});meta['s27_mobile_a4']={w:390,h:844,marks:[]};
 fs.writeFileSync(path.join(out,'_marks.json'),JSON.stringify(meta,null,1));fs.writeFileSync(path.join(out,'_example.json'),JSON.stringify(ex,null,1));
 const miss=[];Object.entries(meta).forEach(([k,v])=>v.marks.forEach(m=>{if(m.miss)miss.push(k+':'+m.miss);else if(m.x<0||m.y<0||m.x+m.w>100.5||m.y+m.h>100.5)miss.push(k+':OUT '+m.label+' '+m.x+','+m.y+','+m.w+','+m.h);}));
 console.log(JSON.stringify({A:{banner:ex.A.banner,bf:ex.A.BF&&ex.A.BF.st},B:{banner:ex.B&&ex.B.banner,bf:ex.B&&ex.B.BF.st},C:{banner:ex.C&&ex.C.banner,uh:ex.C&&ex.C.uh[0]},sizes:Object.fromEntries(Object.entries(meta).map(([k,v])=>[k,v.w+'x'+v.h])),miss,errs:errs.slice(0,15)},null,1));
 await b.close();s.close();
})();
