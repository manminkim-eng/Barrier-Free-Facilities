// 판정 대조 — usage: node verify_bff_judge.js <repoDir>
// ① 시행령 별표 2 제3호나목 45행 · 제4호나목 4행 × 19열(원문을 따로 옮겨 적은 표) ↔ 앱 MAT
// ② 시행령 별표 1 규모 하한 · 비고 규모 ↔ 앱 USES
// ③ 규모형 용도마다 경계값(하한 −0.01 · 하한)과 비고 시설 × 공사 구분 9종 판정
// 원문: 법령 MCP get_annexes(시행령 별표 1 · 별표 2 <개정 2024.9.19.>) 2026-11-09 조회 — 의무 M · 권장 R · 빈칸 -
const {chromium}=require(process.env.MM_PW||'playwright');const path=require('path');const {setup,server}=require('./serve');
const LAW_MAT={
 a1:'MRMMRRRRR----------',a2:'MRMMRRRRR----------',a3:'MMMMMMMRR--MRM--M--',a4:'M-MM--------R------',a5:'M-MM--MMM--M-------',
 a6:'MMMMMMMRR----------',a7:'MRMMRRRRR----------',a8:'MMMMRRRRR---RM-----',
 b1:'MMMMRRRRR----------',b2:'MRMMRRRRR----------',b3:'MMMMMMMMM--MMM-M-MM',b4:'MMMMRRRRR--RRM-----',b5:'MRMMRRRRR----------',b6:'MRMMRRRRR----------',b7:'MRMMRRRRR----------',
 c1:'MMMMMMMMM--MMM-M-MM',c2:'MMMMMMMRR----M-----',c3:'MMMMMMMRR--MRM---RM',d1:'MMMMRRRRR----M-R--R',e1:'MMMMMMMRR---RM----R',f1:'MMMMMMMMMRRMMM--RR-',
 g1:'MMMMMMMMR--MMM-RR-R',g2:'MMMMMMMMR---------R',g3:'MMMMMMMMR--RRM-RR-R',g4:'MMMMMMMMM--RRM-MR-R',
 h1:'MMMMMMMMR---------R',h2:'MMMMMMMMRRR---R----',h3:'MMMMMMMMMMMMMMMMMM-',i1:'MMMMMMMMM-R-RMM----',j1:'MMMMRRRMR-R----R--R',
 k1:'MMMMMMMMM--MMM--M-M',k2:'MMMMMMMRR-------R-R',k3:'MMMMMMMMM--MMM--M-R',l1:'MRMMRRRRR----MM-R--',l2:'MMMMMMMMMR-MRMM-R-R',
 m1:'MMMMRRMMRRR--R--R-R',n1:'MMM--R-------------',n2:'MMMMMMMRR-------R--',o1:'MMMMMMMRR---RM----R',o2:'MMMMMRMRR---RM--R-R',
 p1:'MMMMMMMRM--R----RRR',q1:'MMMMRRMRR----R-----',r1:'MMMMRRMRR---RR-R-RR',r2:'MMMMRRMRR---R----RM',s1:'MMMMMMMMM--MRM---RR',
 H1:'MMMMMMRRRRRR-MR----',H2:'MMMMMRRRRRRR-MR----',H3:'MMMMMRRRRRRR-MR----',H4:'MMMMMRMRMRRR-MM----'};
/* 별표 1 규모 하한(㎡ · 실 · 세대 · 인) · 비고(㎡ 미만) — 원문 문장에서 옮김 */
const LAW_MIN={barber:50,bath:300,assembly:500,exhibit:500,zoo:300,religion:500,sale:1000,library:1000,sport:500,office:500,bcast:1000,tel:1000,outdoor:1000,restarea:300,funeral:500};
const LAW_BIGO={retail:50,barber:50,cafe:50,rest2:50,bath:300,clinic:100,clinic2:100};
const LAW_Q={lodgeG:30,lodgeS:30,rowh:10,multi:10,dorm:30};
(async()=>{const repo=path.resolve(process.argv[2]);const s=await server(repo,8896);const b=await chromium.launch();
 const ctx=await b.newContext({serviceWorkers:'block'});await setup(ctx);const p=await ctx.newPage();
 await p.goto('http://127.0.0.1:8896/index.html');await p.waitForTimeout(2500);
 const r=await p.evaluate(({LAW_MAT,LAW_MIN,LAW_BIGO,LAW_Q})=>{const bad=[];let n=0;
  const keys=Object.keys(LAW_MAT);
  if(Object.keys(MAT).length!==keys.length)bad.push('MAT 행 수 '+Object.keys(MAT).length+' ≠ '+keys.length);
  keys.forEach(k=>{n++;if(!MAT[k]){bad.push('MAT 없음 '+k);return;}if(MAT[k].m!==LAW_MAT[k])bad.push(`MAT ${k} 앱 ${MAT[k].m} ≠ 원문 ${LAW_MAT[k]}`);});
  Object.entries(LAW_MIN).forEach(([id,v])=>{const u=USE_BY[id];if(!u||u.t!=='min'||u.min!==v)bad.push(`별표1 하한 ${id} 앱 ${u&&u.min} ≠ ${v}`);});
  USES.forEach(u=>{const v=LAW_BIGO[u.id];if((u.bigo||0)!==(v||0))bad.push(`비고 ${u.id} 앱 ${u.bigo} ≠ ${v}`);});
  USES.forEach(u=>{if(u.row&&!MAT[u.row])bad.push('USES row 없음 '+u.id+' '+u.row);});
  /* 경계값 — 신축 */
  const J=(u,a,q)=>judgeUse({u,a,q1:q||0,q2:0},'new');let cases=0;
  Object.entries(LAW_MIN).forEach(([id,v])=>{cases+=2;if(J(id,v-0.01).st!=='N')bad.push(`경계 ${id} ${v-0.01}㎡ 대상이 됨`);if(J(id,v).st!=='Y')bad.push(`경계 ${id} ${v}㎡ 대상 아님`);});
  Object.entries(LAW_Q).forEach(([id,v])=>{cases+=2;if(J(id,0,v-1).st!=='N')bad.push(`경계 ${id} ${v-1} 대상이 됨`);if(J(id,0,v).st!=='Y')bad.push(`경계 ${id} ${v} 대상 아님`);});
  const T=[['retail',49.99,'N',null],['retail',50,'Y','a1'],['retail',999.99,'Y','a1'],['retail',1000,'Y','e1'],['cafe',49.99,'N',null],['cafe',50,'Y','a2'],['cafe',299.99,'Y','a2'],['cafe',300,'Y','b1'],
   ['rest2',49.99,'N',null],['rest2',50,'Y','b2'],['rest2',299.99,'Y','b2'],['rest2',300,'Y','b1'],['clinic',499.99,'Y','a7'],['clinic',500,'Y','a6'],['theater2',499.99,'Y','b3'],['theater2',500,'Y','c1'],
   ['acad2',499.99,'Y','b6'],['acad2',500,'Y','g3'],['agency',999.99,'Y','a3'],['agency',1000,'Y','k3'],['pub1',999.99,'Y','a3'],['pub1',1000,'C','a3']];
  T.forEach(([id,a,st,row])=>{cases++;const j=J(id,a);if(j.st!==st||(row&&j.row!==row))bad.push(`경계 ${id} ${a}㎡ 앱 ${j.st}/${j.row} ≠ ${st}/${row}`);});
  /* 비고 시설 × 공사 구분 — 별개 증축 · 전부 개축 · 재축만 적용 */
  const OK={extSep:1,recAll:1,rebuild:1};
  Object.entries(LAW_BIGO).forEach(([id,v])=>{const a=v-1;WORKS.forEach(w=>{if(w.v==='new')return;cases++;const j=judgeUse({u:id,a,q1:0,q2:0},w.v);
    const exp=OK[w.v]?(j.st==='Y'||j.st==='C'):j.st==='N';if(!exp)bad.push(`비고 ${id} ${a}㎡ ${w.v} → ${j.st}`);});});
  /* 6층 · 2천㎡ 승강기 · 주차 10대 */
  const run=(fa,area,park,ex)=>{const J0=[Object.assign(judgeUse({u:'office',a:area,q1:0,q2:0},'new'),{r:{u:'office',a:area}})];return buildFacilities(J0,{work:'new',fa,area,parkN:park,only1:false,stairEx:!!ex});};
  const F=(L,k)=>L.find(o=>o.f.k===k);
  [[6,2000,'M'],[5,5000,'M'],[6,1999.99,'M']].forEach(([fa,ar])=>{cases++;});
  if(!F(run(6,2000,20),'stair').notes.some(t=>t.includes('6층 이상')))bad.push('6층 · 2천㎡ 강화 문구 없음');
  if(F(run(6,1999,20),'stair').notes.some(t=>t.includes('6층 이상 · 2천')))bad.push('1,999㎡ 강화 적용됨');
  if(F(run(6,2000,20,true),'stair').notes.some(t=>t.includes('의무(별표 2 제3호가목(6)(나))')))bad.push('직통계단 예외 무시');
  if(F(run(3,600,9),'parking').s!=='X')bad.push('주차 9대 제외 안 됨');if(F(run(3,600,10),'parking').s!=='M')bad.push('주차 10대 의무 아님');cases+=5;
  return {matRows:n,cases,bad};},{LAW_MAT,LAW_MIN,LAW_BIGO,LAW_Q});
 console.log(`별표 2 ${r.matRows}행 × 19열 · 판정 경계 ${r.cases}건 — 불일치 ${r.bad.length}건`);r.bad.slice(0,30).forEach(x=>console.log('✗',x));
 await b.close();s.close();process.exit(r.bad.length?1:0);})();
