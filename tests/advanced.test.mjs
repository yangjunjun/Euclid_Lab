import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS, TOOLS, initialState, applyAction, isGoalComplete, replay, circleId} from '../src/engine.js';

const step=(state,action,options={unlocked:true})=>{
  const result=applyAction(state,action,options);
  assert.equal(result.ok,true,JSON.stringify(action)+' :: '+(result.error||''));
  return result.state;
};
const circle=(a,b)=>({type:'circle',a,b});
const segment=(a,b)=>({type:'segment',a,b});
const circles=(state)=>step(step(state,circle('A','B')),circle('B','A'));
const both=(state)=>{
  let s=circles(state);
  s=step(s,{type:'intersect',circle1:circleId('A','B'),circle2:circleId('B','A')});
  return step(s,{type:'otherIntersection',circle1:circleId('A','B'),circle2:circleId('B','A')});
};
const extend=(level,a='A',b='B')=>step(step(initialState(level),segment('A','B')),{type:'extend',a,b});
const ray=(state,cCenter='B',cThrough='A',rayStart='B',rayThrough='C')=>{
  let s=step(state,circle(cCenter,cThrough));
  return step(s,{type:'rayCircle',circle:circleId(cCenter,cThrough),a:rayStart,b:rayThrough});
};

test('all 15 levels have distinct ids, existing tools and goals',()=>{
  assert.equal(LEVELS.length,15);
  assert.deepEqual(LEVELS.map(l=>l.id),Array.from({length:15},(_,i)=>i+1));
  for(const level of LEVELS){
    assert.ok(level.title&&level.description&&level.hint&&level.target);
    for(const tool of level.tools) assert.ok(TOOLS[tool],level.id+' missing '+tool);
  }
});

test('level 6 - circle point produces legitimate radius equality',()=>{
  let s=step(initialState(6),circle('A','B'));
  s=step(s,{type:'onCircle',circle:circleId('A','B')});
  assert.equal(isGoalComplete(s),false);
  s=step(s,{type:'radius',circle:circleId('A','B'),point:'C'});
  assert.equal(isGoalComplete(s),true);
  assert.equal(applyAction(s,{type:'onCircle',circle:circleId('A','B')}).ok,false);
});

test('level 7 - distinct two-circle intersections',()=>{
  const s=both(initialState(7));
  assert.equal(isGoalComplete(s),true);
  assert.ok(Math.hypot(s.points.C.x-s.points.D.x,s.points.C.y-s.points.D.y)>1);
});

test('level 8 - transitivity yields AC = AD only after two radius facts',()=>{
  let s=both(initialState(8));
  s=step(s,{type:'radius',circle:circleId('A','B'),point:'C'});
  assert.equal(isGoalComplete(s),false);
  s=step(s,{type:'radius',circle:circleId('A','B'),point:'D'});
  assert.equal(isGoalComplete(s),false);
  s=step(s,{type:'transitive',fact1:'fact-1',fact2:'fact-2'});
  assert.equal(isGoalComplete(s),true);
});

test('level 9 - rhombus cannot be certified by drawing alone',()=>{
  let s=both(initialState(9));
  for(const [a,b] of [['A','C'],['C','B'],['B','D'],['D','A']])s=step(s,segment(a,b));
  assert.equal(applyAction(s,{type:'rhombus'}).ok,false);
  for(const [c,p] of [['A','C'],['A','D'],['B','C'],['B','D']])s=step(s,{type:'radius',circle:circleId(c,c==='A'?'B':'A'),point:p});
  s=step(s,{type:'rhombus'});
  assert.equal(isGoalComplete(s),true);
});

test('levels 10 and 11 - extending in either direction yields different betweenness',()=>{
  const forward=extend(10);
  assert.equal(isGoalComplete(forward),true);
  assert.deepEqual(forward.between.map(x=>[x.a,x.b,x.c]),[['A','B','C']]);
  assert.equal(isGoalComplete(extend(11)),false);
  const reverse=extend(11,'B','A');
  assert.equal(isGoalComplete(reverse),true);
  assert.deepEqual(reverse.between.map(x=>[x.a,x.b,x.c]),[['B','A','C']]);
  assert.equal(applyAction(initialState(11),{type:'extend',a:'B',b:'A'}).ok,false);
});

test('level 12 - segment addition checks proven betweenness',()=>{
  let s=extend(12);
  assert.equal(applyAction(s,{type:'segmentSum',a:'A',b:'C',c:'B'}).ok,false);
  assert.equal(isGoalComplete(s),false);
  s=step(s,{type:'segmentSum',a:'A',b:'B',c:'C'});
  assert.equal(isGoalComplete(s),true);
});

test('level 13 - circle ray intersection establishes new radius equality',()=>{
  let s=ray(extend(13));
  assert.equal(isGoalComplete(s),false);
  assert.equal(s.between.some(x=>x.a==='A'&&x.b==='B'&&x.c==='D'),true);
  s=step(s,{type:'radius',circle:circleId('B','A'),point:'D'});
  assert.equal(isGoalComplete(s),true);
});

test('level 14 - doubling requires both length addition and equal components',()=>{
  let s=ray(extend(14));
  assert.equal(applyAction(s,{type:'doubleLength'}).ok,false);
  s=step(s,segment('A','D'));
  s=step(s,segment('B','D'));
  s=step(s,{type:'segmentSum',a:'A',b:'B',c:'D'});
  assert.equal(applyAction(s,{type:'doubleLength'}).ok,false);
  s=step(s,{type:'radius',circle:circleId('B','A'),point:'D'});
  s=step(s,{type:'doubleLength'});
  assert.equal(isGoalComplete(s),true);
});

test('level 15 - midpoint needs betweenness, two radii and its segments',()=>{
  let s=step(initialState(15),segment('A','B'));
  s=step(s,circle('A','B'));
  s=step(s,{type:'rayCircle',circle:circleId('A','B'),a:'B',b:'A'});
  assert.ok(s.points.C.x>=0&&s.points.C.x<=660);
  assert.equal(applyAction(s,{type:'midpoint',a:'B',b:'A',c:'C'}).ok,false);
  s=step(s,segment('A','C'));
  s=step(s,segment('B','C'));
  s=step(s,{type:'radius',circle:circleId('A','B'),point:'C'});
  s=step(s,{type:'midpoint',a:'B',b:'A',c:'C'});
  assert.equal(isGoalComplete(s),true);
});

test('replay preserves advanced constructions under dragged base coordinates',()=>{
  const sequence=[segment('A','B'),{type:'extend',a:'A',b:'B'},circle('B','A'),{type:'rayCircle',circle:circleId('B','A'),a:'B',b:'C'},segment('A','D'),segment('B','D'),{type:'radius',circle:circleId('B','A'),point:'D'},{type:'segmentSum',a:'A',b:'B',c:'D'},{type:'doubleLength'}];
  const result=replay(14,sequence,{A:{x:120,y:190},B:{x:285,y:210}},true);
  assert.equal(result.ok,true,result.error);
  assert.equal(isGoalComplete(result.state),true);
  assert.equal(result.state.steps.length,sequence.length);
});
