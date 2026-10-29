import {LEVELS,TOOLS,initialState,applyAction,replay,isGoalComplete,availablePoints,factText,circleText} from './engine.js';
const $=s=>document.querySelector(s), root=$('#app'), KEY='euclid-lab-v1';
let completed=new Set(JSON.parse(localStorage.getItem(KEY)||'[]')),level=1,actions=[],positions={},state=initialState(1),selected=null,tab='construct',hint=false,dragging=null,draggedTool=null;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function message(text,success=false){const el=$('#toast');el.textContent=text;el.style.background=success?'#165d5a':'#a35540';el.classList.add('show');clearTimeout(message.timer);message.timer=setTimeout(()=>el.classList.remove('show'),3000)}
function svgNode(tag,attrs){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n}
function unlocked(id){return id===1||completed.has(id-1)}
function goto(id){if(!unlocked(id))return;level=id;actions=[];positions={};state=initialState(level);selected=null;tab='construct';hint=false;render()}
function apply(action){const result=applyAction(state,action,{unlocked:completed.has(4)});if(!result.ok)return message(result.error);state=result.state;actions.push(action);if(isGoalComplete(state)){if(!completed.has(level)){completed.add(level);localStorage.setItem(KEY,JSON.stringify([...completed]));message('验证通过！已解锁下一关。',true)}else message('规则验证成功。',true)}else message('积木已应用，逻辑步骤有效。',true);selected=null;render()}
function undo(){if(!actions.length)return message('没有可以撤销的步骤。');actions.pop();state=replay(level,actions,positions,completed.has(4)).state;render()}
function selectTool(type){selected=type;tab=TOOLS[type].group==='证明'?'prove':'construct';render()}
function options(items,display,second=false){return items.map((item,i)=>'<option value="'+escape(item.id||item)+'" '+(second&&i===1?'selected':'')+'>'+escape(display?display(item):item)+'</option>').join('')}
function editor(){
if(!selected)return '<div class="empty-drop"><span>⊞</span><b>将积木拖到这里</b><small>或直接点击上方积木选择操作</small></div>';
let fields='';
if(selected==='segment'||selected==='circle'){const pts=availablePoints(state);fields='<label>'+(selected==='circle'?'圆心':'起点')+'<select name="a">'+options(pts)+'</select></label><label>'+(selected==='circle'?'经过点':'终点')+'<select name="b">'+options(pts,null,true)+'</select></label>'}
if(selected==='intersect'){fields='<label>圆 ①<select name="circle1">'+options(state.circles,circleText)+'</select></label><label>圆 ②<select name="circle2">'+options(state.circles,circleText,true)+'</select></label>'}
if(selected==='radius'){fields='<label>选择圆<select name="circle">'+options(state.circles,circleText)+'</select></label><label>圆上的点<select name="point">'+options(availablePoints(state))+'</select></label>'}
if(selected==='transitive'){fields='<label>事实 ①<select name="fact1">'+options(state.facts,factText)+'</select></label><label>事实 ②<select name="fact2">'+options(state.facts,factText,true)+'</select></label>'}
return '<form id="block-form"><div class="form-title">'+escape(TOOLS[selected].icon+' '+TOOLS[selected].name)+'<button type="button" id="clear">×</button></div><div class="form-inputs">'+fields+'</div><button class="primary" type="submit">应用积木 <span>↗</span></button></form>';
}
function render(){
const l=LEVELS[level-1],done=isGoalComplete(state),tools=l.tools.filter(t=>tab==='construct'?TOOLS[t].group!=='证明':TOOLS[t].group==='证明');
root.innerHTML='<header class="top"><div class="logo">E<span>·</span></div><div class="logo-text"><b>EUCLID <em>LAB</em></b><small>从公设到定理 · INTERACTIVE GEOMETRY</small></div><div class="top-right"><span>● 证明实验室 v1.0</span><a target="_blank" rel="noreferrer" href="https://github.com/yangjunjun/Euclid_Lab">GitHub ↗</a></div></header>'
+'<div class="layout"><aside class="sidebar"><div class="small-title">学习路径 <span>01 — 05</span></div><div class="progress-title">探索进度 <b>'+completed.size+' / '+LEVELS.length+'</b></div><div class="progress"><div style="width:'+(completed.size/LEVELS.length*100)+'%"></div></div><div class="level-list">'+LEVELS.map(x=>'<button data-level="'+x.id+'" class="level '+(x.id===level?'active':'')+'" '+(unlocked(x.id)?'':'disabled')+'><span class="level-num">'+(completed.has(x.id)?'✓':('0'+x.id).slice(-2))+'</span><span><b>'+escape(x.title)+'</b><small>'+escape(x.eyebrow)+'</small></span><i>'+(unlocked(x.id)?'→':'♧')+'</i></button>').join('')+'</div><div class="side-quote"><span>“</span><p>除了通过理解，没有通往几何学的皇家大道。</p><small>— 归于欧几里得的名言</small></div></aside>'
+'<main class="main"><div class="eyebrow">CHAPTER '+('0'+level).slice(-2)+' <span>/</span> EUCLIDEAN GEOMETRY</div><div class="intro"><div><h1>'+escape(l.title)+' <span>.</span></h1><p>'+escape(l.description)+'</p></div><div class="status '+(done?'won':'')+'">'+(done?'✓ 已完成':'◌ 探索中')+'</div></div>'
+'<div class="workspace"><section class="panel"><div class="panel-head"><strong><em>01</em> 几何画布</strong><div><span>可拖动初始点</span><button id="undo" title="撤销">↶</button><button id="reset" title="重置">⟳</button></div></div><div class="stage"><svg id="geometry" viewBox="0 0 660 510"><defs><pattern id="dots" width="25" height="25" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#d3ded8"/></pattern></defs><rect width="660" height="510" fill="url(#dots)"/><g id="drawing"></g></svg><span class="canvas-top">EUCLIDEAN SPACE · ℝ²</span><span class="canvas-bottom">拖动 A / B 调整图形 ↗</span></div><div class="panel-foot">点 '+Object.keys(state.points).length+'　 ━　线段 '+state.segments.length+'　 ◯　圆 '+state.circles.length+' <span>几何 ≠ 证明</span></div></section>'
+'<section class="panel"><div class="panel-head"><strong><em>02</em> 积木工作台</strong><span>拖拽 / 点击积木</span></div><div class="tabs"><button data-tab="construct" class="'+(tab==='construct'?'on':'')+'">▧ 几何构造</button><button data-tab="prove" class="'+(tab==='prove'?'on':'')+'">◇ 逻辑证明</button></div><div class="tools"><div class="small-title">AVAILABLE BLOCKS <span>'+tools.length+' 种</span></div>'+ (tools.length?tools.map(id=>'<button draggable="true" class="block '+(TOOLS[id].group==='证明'?'logic ':TOOLS[id].group==='已证明定理'?'theorem ':'')+(selected===id?'picked':'')+'" data-tool="'+id+'"><span class="block-icon">'+TOOLS[id].icon+'</span><span><b>'+escape(TOOLS[id].name)+'</b><small>'+escape(TOOLS[id].subtitle)+'</small></span><span class="plus">＋</span></button>').join(''):'<p class="no-tools">当前关卡没有这类积木。</p>')+'<div class="drop" id="drop"><div class="small-title">▤ STEP BUILDER</div>'+editor()+'</div></div></section></div>'
+'<div class="workspace lower"><section class="panel"><div class="panel-head"><strong><em>03</em> 推理记录</strong><span>'+state.steps.length+' STEPS</span></div><div class="proof">'+(state.steps.length?state.steps.map((s,i)=>'<div class="step"><span class="step-num '+s.category+'">'+('0'+(i+1)).slice(-2)+'</span><span><b>'+escape(s.title)+'</b><small>'+escape(s.detail)+'</small></span><i>✓</i></div>').join(''):'<div class="proof-empty"><span>⌁</span><b>每个伟大的证明，都始于第一步。</b><p>选择积木，构造你的第一条推理链。</p></div>')+(state.facts.length?'<div class="facts"><b>已证实的关系</b><div>'+state.facts.map(f=>'<span>'+escape(factText(f))+'</span>').join('')+'</div></div>':'')+'</div></section>'
+'<section class="panel"><div class="panel-head"><strong><em>◎</em> 本关目标</strong><span>✳</span></div><div class="goal"><small>TO PROVE</small><h2>'+escape(l.target)+'</h2><div class="goal-state '+(done?'done':'')+'">'+(done?'✓ 目标已验证':'◌ 尚未完成证明')+'</div><p>'+(done?'成功。当前目标的全部必要逻辑条件已满足。':'完成必要构造与推理；系统依照规则验证结论，而不是依靠图形外观。')+'</p>'+(done?'<button class="primary" id="next">'+(level===LEVELS.length?'返回第一关 ↺':'进入下一关 →')+'</button>':'<button class="hint-btn" id="hint">'+(hint?'收起提示 ↑':'需要一点提示？ ↗')+'</button>'+(hint?'<div class="hint">'+escape(l.hint)+'</div>':''))+'</div></section></div>'
+'<footer>EUCLID LAB ✳ AXIOMS → THEOREMS <span>确定性证明引擎 · 进度本地保存</span></footer></main></div>';
draw();
document.querySelectorAll('[data-level]').forEach(e=>e.onclick=()=>goto(Number(e.dataset.level)));
document.querySelectorAll('[data-tab]').forEach(e=>e.onclick=()=>{tab=e.dataset.tab;selected=null;render()});
document.querySelectorAll('[data-tool]').forEach(e=>{e.onclick=()=>selectTool(e.dataset.tool);e.ondragstart=event=>{draggedTool=e.dataset.tool;event.dataTransfer.setData('text/plain',draggedTool)}});
const drop=$('#drop');drop.ondragover=e=>{e.preventDefault();drop.classList.add('over')};drop.ondragleave=()=>drop.classList.remove('over');drop.ondrop=e=>{e.preventDefault();drop.classList.remove('over');const id=e.dataTransfer.getData('text/plain')||draggedTool;if(TOOLS[id])selectTool(id)};
$('#undo').onclick=undo;$('#reset').onclick=()=>{actions=[];state=initialState(level,positions);selected=null;render();message('已重置',true)};
if($('#block-form'))$('#block-form').onsubmit=e=>{e.preventDefault();const data=new FormData(e.currentTarget),a={type:selected};for(const [k,v] of data)a[k]=v;apply(a)};
if($('#clear'))$('#clear').onclick=()=>{selected=null;render()};
if($('#hint'))$('#hint').onclick=()=>{hint=!hint;render()};
if($('#next'))$('#next').onclick=()=>goto(level===LEVELS.length?1:level+1);
}
function draw(){
const svg=$('#geometry'),drawing=$('#drawing');drawing.replaceChildren();const pts=state.points;
for(const c of state.circles){const p=pts[c.center],q=pts[c.through],r=Math.hypot(p.x-q.x,p.y-q.y);drawing.append(svgNode('circle',{cx:p.x,cy:p.y,r,fill:'none',stroke:c.center==='A'?'#568d9b':'#c9935e','stroke-width':1.8,'stroke-dasharray':'5 5'}))}
for(const s of state.segments){const a=pts[s.a],b=pts[s.b];drawing.append(svgNode('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke:'#204e58','stroke-width':3,'stroke-linecap':'round'}))}
for(const [name,p] of Object.entries(pts)){const g=svgNode('g',{});g.append(svgNode('circle',{cx:p.x,cy:p.y,r:15,fill:'transparent'}));g.append(svgNode('circle',{cx:p.x,cy:p.y,r:5.5,fill:'#fff',stroke:'#1c6e7d','stroke-width':2.5}));const t=svgNode('text',{x:p.x+13,y:p.y-13,fill:'#1b424a','font-size':19,'font-family':'Georgia'});t.textContent=name;g.append(t);drawing.append(g);if(p.fixed){g.style.cursor='grab';g.addEventListener('pointerdown',e=>{dragging=name;svg.setPointerCapture(e.pointerId);e.preventDefault()})}}}
function move(e){
if(!dragging)return;
const svg=$('#geometry'),rect=svg.getBoundingClientRect(),x=Math.max(50,Math.min(605,(e.clientX-rect.left)*660/rect.width)),y=Math.max(50,Math.min(460,(e.clientY-rect.top)*510/rect.height));const other=Object.keys(state.points).find(k=>state.points[k].fixed&&k!==dragging);if(other&&Math.hypot(x-state.points[other].x,y-state.points[other].y)<50)return;
positions[dragging]={x,y};const r=replay(level,actions,positions,completed.has(4));if(r.ok){state=r.state;draw()}
}
document.addEventListener('pointermove',move);
document.addEventListener('pointerup',()=>{if(dragging){dragging=null;render()}});
document.addEventListener('pointercancel',()=>{if(dragging){dragging=null;render()}});
render();
