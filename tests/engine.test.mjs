import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,applyAction,replay,isGoalComplete,circleId,segmentKey} from '../src/engine.js';
function action(s,a,options={}){const r=applyAction(s,a,options);assert.equal(r.ok,true,r.error);return r.state}
test('segment construction must be valid and not duplicated',()=>{
let s=initialState(1);
assert.equal(applyAction(s,{type:'segment',a:'A',b:'A'}).ok,false);
s=action(s,{type:'segment',a:'A',b:'B'});
assert.equal(isGoalComplete(s),true);
assert.equal(applyAction(s,{type:'segment',a:'B',b:'A'}).ok,false);
});
test('circle construction verifies center and radius',()=>{
let s=initialState(2);
s=action(s,{type:'circle',a:'A',b:'B'});
assert.equal(isGoalComplete(s),true);
assert.equal(applyAction(s,{type:'circle',a:'A',b:'B'}).ok,false);
});
test('two circles produce a point that lies on both circles',()=>{
let s=initialState(3);
s=action(s,{type:'circle',a:'A',b:'B'});
s=action(s,{type:'circle',a:'B',b:'A'});
s=action(s,{type:'intersect',circle1:circleId('A','B'),circle2:circleId('B','A')});
assert.equal(isGoalComplete(s),true);
assert.ok(s.points.C);
});
test('equilateral requires explicit construction and proof, not visuals',()=>{
let s=initialState(4);
s=action(s,{type:'circle',a:'A',b:'B'});
s=action(s,{type:'circle',a:'B',b:'A'});
s=action(s,{type:'intersect',circle1:circleId('A','B'),circle2:circleId('B','A')});
for(const [a,b] of [['A','B'],['A','C'],['B','C']])s=action(s,{type:'segment',a,b});
assert.equal(isGoalComplete(s),false);
assert.equal(applyAction(s,{type:'equilateral'}).ok,false);
s=action(s,{type:'radius',circle:circleId('A','B'),point:'C'});
s=action(s,{type:'radius',circle:circleId('B','A'),point:'C'});
assert.equal(isGoalComplete(s),false);
s=action(s,{type:'transitive',fact1:'fact-1',fact2:'fact-2'});
s=action(s,{type:'equilateral'});
assert.equal(isGoalComplete(s),true);
assert.equal(s.facts.length,3);
});
test('invalid radius and missing theorem unlock are rejected',()=>{
let s=initialState(4);s=action(s,{type:'circle',a:'A',b:'B'});
assert.equal(applyAction(s,{type:'radius',circle:circleId('A','B'),point:'A'}).ok,false);
assert.equal(applyAction(initialState(5),{type:'reuse'},{unlocked:false}).ok,false);
const r=applyAction(initialState(5),{type:'reuse'},{unlocked:true});
assert.equal(r.ok,true);assert.equal(isGoalComplete(r.state),true);
});
test('replay rebuilds derived geometry after dragging base points',()=>{
const acts=[{type:'circle',a:'A',b:'B'},{type:'circle',a:'B',b:'A'},{type:'intersect',circle1:circleId('A','B'),circle2:circleId('B','A')}];
const r=replay(3,acts,{A:{x:120,y:320},B:{x:490,y:340}});
assert.equal(r.ok,true);
assert.ok(Number.isFinite(r.state.points.C.x));
});
