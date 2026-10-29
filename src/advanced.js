// Euclid Lab advanced geometry curriculum (levels 6–15).
// Numeric coordinates draw constructed objects; proof certificates are
// only created by geometry operations with checked side conditions.
export const ADVANCED_LEVELS = [
  { id: 6, eyebrow: '等距探索 · 圆的定义', title: '圆上的等距点', description: '在圆 (A, AB) 上构造新的点 C，证明 AC = AB。', target: '证明 AC = AB', hint: '先作圆 (A, AB)，再「在圆上取点」得到 C，最后选择圆与点 C 使用「半径相等」。', tools: ['circle','onCircle','segment','radius'] },
  { id: 7, eyebrow: '等距探索 · 两圆交点', title: '发现第二个交点', description: '两个等半径圆通常有两个交点。找出 C 和另一侧的 D。', target: '构造两个不同的交点 C、D', hint: '分别作圆 (A, AB) 与 (B, BA)，先「取两圆交点」得到 C，再用「取另一交点」得到 D。', tools: ['circle','intersect','otherIntersection'] },
  { id: 8, eyebrow: '等距探索 · 相等传递', title: '同圆的两条半径', description: 'C 与 D 都在以 A 为圆心的圆上。严谨证明 AC = AD。', target: '证明 AC = AD', hint: '按上一关步骤取出 C、D，再分别证明 AC = AB 与 AD = AB，最后使用「相等传递」。', tools: ['circle','intersect','otherIntersection','radius','transitive'] },
  { id: 9, eyebrow: '等距探索 · 四边形', title: '证明一个菱形', description: '把两个圆的交点连接起来，证明四边形 ACBD 的四条边相等。', target: '证明 ACBD 是菱形', hint: '先得到 C、D，连接 AC、CB、BD、DA。分别使用两个圆证明四条边与 AB 相等，再应用「菱形定义」。', tools: ['circle','intersect','otherIntersection','segment','radius','transitive','rhombus'] },
  { id: 10, eyebrow: '直线与顺序 · 公设 II', title: '向前延长线段', description: '画出 AB，再从 A 经 B 延长，得到 B 后方的 C。', target: '构造 A—B—C 的共线顺序', hint: '先连接 A、B，再选择「延长线段」，起点 A、终点 B，产生 C。', tools: ['segment','extend'] },
  { id: 11, eyebrow: '直线与顺序 · 反向延长', title: '向另一侧延长', description: '同样使用第二公设，把 BA 从 B 经 A 延长到 C。', target: '构造 B—A—C 的共线顺序', hint: '先作 AB，然后「延长线段」时选择起点 B、终点 A。注意顺序！', tools: ['segment','extend'] },
  { id: 12, eyebrow: '长度推理 · 整体与部分', title: '线段加法', description: '若 B 位于 A 和 C 之间，就能得出 AC = AB + BC。', target: '证明 AC = AB + BC', hint: '先连接 AB，延长 A→B 得到 C；再用「线段加法」，依次选择 A、B、C。', tools: ['segment','extend','segmentSum'] },
  { id: 13, eyebrow: '长度推理 · 圆与射线', title: '从圆复制一段距离', description: '让从 B 出发的射线与圆 (B, BA) 相交于 D，证明 BD = BA。', target: '证明 BD = BA', hint: '连接 AB，延长 A→B 得到 C；作圆 (B, BA)，让从 B 经过 C 的射线与圆相交得到 D；最后证明 BD = BA。', tools: ['segment','extend','circle','rayCircle','radius'] },
  { id: 14, eyebrow: '长度推理 · 倍长', title: '构造两倍线段', description: '让 D 位于从 A 经 B 的延长线上，证明 AD = AB + BD = 2AB。', target: '证明 AD = 2 × AB', hint: '先按上一关方法构造 D。利用圆证明 AB = BD，利用 A—B—D 得出 AD = AB + BD，然后选择「倍长推理」。', tools: ['segment','extend','circle','rayCircle','radius','segmentSum','doubleLength'] },
  { id: 15, eyebrow: '长度推理 · 中点定义', title: '证明一个中点', description: '以 A 为圆心、AB 为半径作圆。从 B 沿 BA 射线得到另一个交点 C，证明 A 是 BC 的中点。', target: '证明 A 是 BC 的中点', hint: '连接 AB、作圆 (A, AB)；选圆与射线 B→A 得到 C；连接 AC、BC，证明 AB = AC，再用「中点定义」按 B、A、C 的顺序填写。', tools: ['segment','circle','rayCircle','radius','midpoint'] }
];

export const ADVANCED_TOOLS = {
  onCircle: {icon:'⊙',name:'在圆上取点',group:'构造',subtitle:'圆上新点 · 生成 C'},
  otherIntersection: {icon:'⤧',name:'取另一交点',group:'构造',subtitle:'两圆的第二个交点 D'},
  rhombus: {icon:'◇',name:'菱形定义',group:'证明',subtitle:'四条边相等 → 菱形'},
  extend: {icon:'⟶',name:'延长线段',group:'构造',subtitle:'公设 II · 从起点经终点延长'},
  segmentSum: {icon:'＋',name:'线段加法',group:'证明',subtitle:'中间点 → 整体等于两部分之和'},
  rayCircle: {icon:'◎',name:'射线与圆交点',group:'构造',subtitle:'射线与圆求非起点交点'},
  doubleLength: {icon:'×2',name:'倍长推理',group:'证明',subtitle:'两段相等且首尾相连'},
  midpoint: {icon:'½',name:'中点定义',group:'证明',subtitle:'介于两端且等距'}
};

const seg=(a,b)=>[a,b].sort().join('-');
const pair=(a,b)=>[a,b].sort().join('|');
const hasPoint=(s,p)=>Object.hasOwn(s.points,p);
const len=(p,q)=>Math.hypot(p.x-q.x,p.y-q.y);
const reject=(error)=>({ok:false,error});
const success=(state)=>({ok:true,state});
const hasSegment=(s,a,b)=>s.segments.some(x=>x.key===seg(a,b));
const hasFact=(s,a,b)=>s.facts.some(f=>pair(...f.pairs)===pair(seg(...a),seg(...b)));
const between=(s,a,b,c)=>s.between?.some(x=>(x.a===a&&x.b===b&&x.c===c)||(x.a===c&&x.b===b&&x.c===a));
const record=(s,action,title,detail,category)=>s.steps.push({id:'step-'+(s.steps.length+1),action,title,detail,category});
const addSegment=(s,a,b)=>{const key=seg(a,b);if(!hasSegment(s,a,b))s.segments.push({key,a,b});};
const addBetween=(s,a,b,c,via)=>{s.between??=[];if(!between(s,a,b,c))s.between.push({a,b,c,via});};
function circleOf(s,id){return s.circles.find(c=>c.id===id);}
function eqReach(s,a,b) {
  if(a===b)return true;
  const visited=new Set([a]),queue=[a];
  while(queue.length) {
    const cur=queue.shift();
    for(const f of s.facts){
      if(!f.pairs.includes(cur))continue;
      const other=f.pairs.find(x=>x!==cur);
      if(other===b)return true;
      if(other&&!visited.has(other)){visited.add(other);queue.push(other);}
    }
  }
  return false;
}
function intersectBoth(s,c1,c2) {
  const p=s.points[c1.center],q=s.points[c2.center];
  const r=len(p,s.points[c1.through]),r2=len(q,s.points[c2.through]);
  const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy);
  if(d<1e-7 || d>=r+r2-1e-7 || d<=Math.abs(r-r2)+1e-7)return null;
  const a=(r*r-r2*r2+d*d)/(2*d),h=Math.sqrt(Math.max(0,r*r-a*a));
  const m={x:p.x+a*dx/d,y:p.y+a*dy/d};
  const v1={x:m.x-dy*h/d,y:m.y+dx*h/d};
  const v2={x:m.x+dy*h/d,y:m.y-dx*h/d};
  return v1.y<=v2.y?[v1,v2]:[v2,v1];
}
function rayCirclePoint(s,circle,origin,toward) {
  const o=s.points[origin],q=s.points[toward],center=s.points[circle.center];
  const dx=q.x-o.x,dy=q.y-o.y,n=Math.hypot(dx,dy);
  if(n<1e-7)return null;
  const ux=dx/n,uy=dy/n,ox=o.x-center.x,oy=o.y-center.y;
  const r=len(center,s.points[circle.through]);
  const proj=ox*ux+oy*uy;
  const discriminant=proj*proj-(ox*ox+oy*oy-r*r);
  if(discriminant<1e-7)return null; // tangent / no distinct crossing
  const sqrt=Math.sqrt(discriminant);
  const ts=[-proj-sqrt,-proj+sqrt].filter(t=>t>1e-7);
  if(!ts.length)return null;
  const t=Math.max(...ts);
  return {x:o.x+ux*t,y:o.y+uy*t};
}
export function applyAdvancedAction(s,action) {
  const type=action.type;
  if(!ADVANCED_TOOLS[type])return reject('未知的高级积木。');
  if(type==='onCircle'){
    const c=circleOf(s,action.circle);
    if(!c)return reject('请选择已经作出的圆。');
    if(hasPoint(s,'C'))return reject('点 C 已存在。');
    const p=s.points[c.center],q=s.points[c.through];
    const dx=q.x-p.x,dy=q.y-p.y,k=Math.sqrt(3)/2;
    s.points.C={x:p.x+dx/2+dy*k,y:p.y+dy/2-dx*k,fixed:false};
    s.intersections.push({point:'C',circles:[c.id]});
    record(s,action,'在圆上取 C','圆上点构造 · C 位于圆 ('+c.center+', '+c.center+c.through+')','construct');
    return success(s);
  }
  if(type==='otherIntersection'){
    const c1=circleOf(s,action.circle1),c2=circleOf(s,action.circle2);
    if(!c1||!c2||c1.id===c2.id)return reject('请选择两个不同的已有圆。');
    if(hasPoint(s,'D'))return reject('点 D 已存在。');
    if(!s.intersections.some(i=>i.point==='C'&&i.circles.includes(c1.id)&&i.circles.includes(c2.id)))return reject('请先构造两个圆的首个交点 C。');
    const points=intersectBoth(s,c1,c2);
    if(!points)return reject('这两个圆不存在两个不同的交点。');
    const first=s.points.C;
    const other=points.find(p=>len(p,first)>1e-5);
    if(!other)return reject('无法找到与 C 不同的交点。');
    s.points.D={...other,fixed:false};
    s.intersections.push({point:'D',circles:[c1.id,c2.id]});
    record(s,action,'取得另一交点 D','双圆交点存在条件 · C 与 D 位于两个圆上','construct');
    return success(s);
  }
  if(type==='rhombus'){
    if(s.theorems.includes('rhombus'))return reject('已经证明四边形是菱形。');
    if(!['A','B','C','D'].every(p=>hasPoint(s,p)))return reject('先构造两个不同的交点 C 和 D。');
    const edges=[seg('A','C'),seg('B','C'),seg('B','D'),seg('A','D')];
    if(!edges.every(k=>s.segments.some(x=>x.key===k)))return reject('请先连接 AC、CB、BD、DA 四条边。');
    if(!s.intersections.some(i=>i.point==='D'&&i.circles.length===2))return reject('D 必须由双圆交点构造。');
    if(!edges.every(k=>eqReach(s,edges[0],k)))return reject('还没有证明四条边全部相等。请使用两个圆的半径关系。');
    s.theorems.push('rhombus');
    record(s,action,'四边形 ACBD 是菱形','四边形定义 · AC = CB = BD = DA，证毕','theorem');
    return success(s);
  }
  if(type==='extend'){
    const {a,b}=action;
    if(!hasPoint(s,a)||!hasPoint(s,b)||a===b)return reject('选择两个不同的已知点。');
    if(!hasSegment(s,a,b))return reject('请先用第一公设作出这条线段。');
    if(hasPoint(s,'C'))return reject('延长所得点 C 已存在。');
    const p=s.points[a],q=s.points[b];
    if(len(p,q)<1e-7)return reject('线段长度必须为正。');
    s.points.C={x:q.x+(q.x-p.x)*1.7,y:q.y+(q.y-p.y)*1.7,fixed:false};
    addSegment(s,a,'C');addSegment(s,b,'C');
    addBetween(s,a,b,'C','extend');
    record(s,action,'延长 '+a+b+' 到 C','公设 II · '+a+'—'+b+'—C 共线，'+b+' 位于两端之间','construct');
    return success(s);
  }
  if(type==='segmentSum'){
    const {a,b,c}=action;
    if(![a,b,c].every(p=>hasPoint(s,p))||new Set([a,b,c]).size!==3)return reject('请选择三个不同的已知点。');
    if(!between(s,a,b,c))return reject('尚未构造出 '+a+'—'+b+'—'+c+' 的居间关系。');
    if(![[a,b],[b,c],[a,c]].every(([u,v])=>hasSegment(s,u,v)))return reject('请先作出两部分与整条线段。');
    s.sums??=[];
    const whole=seg(a,c),parts=[seg(a,b),seg(b,c)].sort();
    if(s.sums.some(x=>x.whole===whole&&x.parts.join('|')===parts.join('|')))return reject('此线段加法关系已经证明过了。');
    s.sums.push({whole,parts,via:'betweenness'});
    record(s,action,a+c+' = '+a+b+' + '+b+c,'线段加法 · '+b+' 位于 '+a+' 与 '+c+' 之间','proof');
    return success(s);
  }
  if(type==='rayCircle'){
    const c=circleOf(s,action.circle),{a,b}=action;
    if(!c)return reject('请先选择已经构造的圆。');
    if(!hasPoint(s,a)||!hasPoint(s,b)||a===b)return reject('射线需要两个不同的已知点。');
    if(!hasSegment(s,a,b))return reject('请先作出确定射线方向的线段。');
    const newId=hasPoint(s,'C')?'D':'C';
    if(hasPoint(s,newId))return reject('目标交点已存在。');
    const p=rayCirclePoint(s,c,a,b);
    if(!p)return reject('这条射线与圆不存在新的、非切线交点。');
    if(Object.entries(s.points).some(([,q])=>len(p,q)<1e-5))return reject('新交点与现有点重合，不能得到新点。');
    s.points[newId]={...p,fixed:false};
    s.intersections.push({point:newId,circles:[c.id]});
    // Betweenness certificates follow from the particular ray/circle construction,
    // not from approximate equality of floating-point segment lengths.
    if(c.center===a&&c.through!==a&&between(s,c.through,a,b)){
      addBetween(s,c.through,a,newId,'ray-circle-extension');
    }
    if(c.center===b&&c.through===a){
      addBetween(s,a,b,newId,'ray-circle-opposite');
    }
    record(s,action,'射线 '+a+b+' 与圆交于 '+newId,'圆-射线构造 · 取射线上不同于起点的交点 '+newId,'construct');
    return success(s);
  }
  if(type==='doubleLength'){
    if(s.theorems.includes('double-length'))return reject('已经证明两倍线段。');
    const A=seg('A','B'),B=seg('B','D'),W=seg('A','D');
    if(!s.sums?.some(x=>x.whole===W&&x.parts.includes(A)&&x.parts.includes(B)))return reject('请先用线段加法证明 AD = AB + BD。');
    if(!eqReach(s,A,B))return reject('请先证明 AB = BD。');
    s.theorems.push('double-length');
    record(s,action,'AD = 2 × AB','由 AD = AB + BD 且 AB = BD，代入得两倍线段','theorem');
    return success(s);
  }
  if(type==='midpoint'){
    const {a,b,c}=action;
    if(![a,b,c].every(p=>hasPoint(s,p))||new Set([a,b,c]).size!==3)return reject('请选择三个不同的点。');
    if(!between(s,a,b,c))return reject('没有证明 '+b+' 位于 '+a+' 与 '+c+' 之间。');
    if(![[a,b],[b,c],[a,c]].every(([u,v])=>hasSegment(s,u,v)))return reject('请先连接 BC、BA、AC 等相关线段。');
    if(!eqReach(s,seg(a,b),seg(b,c)))return reject('还缺少 '+a+b+' = '+b+c+' 的证明。');
    s.midpoints??=[];
    if(s.midpoints.some(x=>x.mid===b&&pair(...x.ends)===pair(a,c)))return reject('这个中点已经证明过了。');
    s.midpoints.push({mid:b,ends:[a,c],via:'midpoint-definition'});
    record(s,action,b+' 是 '+a+c+' 的中点','中点定义 · '+a+'—'+b+'—'+c+' 且 '+a+b+' = '+b+c,'theorem');
    return success(s);
  }
  return reject('该积木尚未实现。');
}
export function isAdvancedGoalComplete(s) {
  const exists=(a,b)=>hasFact(s,a,b);
  switch(s.level) {
    case 6: return hasPoint(s,'C')&&exists(['A','C'],['A','B']);
    case 7: return hasPoint(s,'C')&&hasPoint(s,'D')&&!!s.intersections.find(x=>x.point==='D'&&x.circles.length===2);
    case 8: return hasPoint(s,'D')&&exists(['A','C'],['A','D']);
    case 9: return s.theorems.includes('rhombus');
    case 10: return between(s,'A','B','C');
    case 11: return between(s,'B','A','C');
    case 12: return !!s.sums?.some(x=>x.whole===seg('A','C')&&x.parts.includes(seg('A','B'))&&x.parts.includes(seg('B','C')));
    case 13: return hasPoint(s,'D')&&exists(['B','D'],['B','A']);
    case 14: return s.theorems.includes('double-length');
    case 15: return !!s.midpoints?.some(x=>x.mid==='A'&&pair(...x.ends)===pair('B','C'));
    default:return false;
  }
}
