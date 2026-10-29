// Euclid Lab · deterministic construction & proof rules.
// Geometry is for display; theorem validation uses recorded logical facts only.
export const LEVELS = [
  { id: 1, eyebrow: '入门 · 公设 I', title: '连接两个点', description: '给定不同的点 A、B，使用第一公设作出线段 AB。', target: '构造线段 AB', hint: '选择「连接两点」，让端点分别为 A 和 B。', tools: ['segment'] },
  { id: 2, eyebrow: '入门 · 公设 III', title: '画出第一个圆', description: '以 A 为圆心，以 AB 为半径作圆。观察圆规实际上固定了什么。', target: '构造圆 (A, AB)', hint: '选择「作圆」，圆心 A，经过点 B。', tools: ['circle'] },
  { id: 3, eyebrow: '探索 · 交点', title: '双圆相交', description: '分别以 A、B 为圆心，以 AB 为半径作圆，并找出交点 C。', target: '作圆 A、作圆 B，取得交点 C', hint: '先分别作圆 (A, AB) 和 (B, BA)，再使用「取两圆交点」。', tools: ['circle', 'intersect'] },
  { id: 4, eyebrow: '《几何原本》· 命题 I.1', title: '证明等边三角形', description: '从公设出发构造三角形 ABC，再用半径相等、相等传递和定义完成严谨证明。', target: '证明 AB = AC = BC', hint: '先作两圆和交点 C，连接 AC、BC；用两次「半径相等」、一次「相等传递」和「等边定义」完成证明。', tools: ['segment', 'circle', 'intersect', 'radius', 'transitive', 'equilateral'] },
  { id: 5, eyebrow: '进阶 · 定理复用', title: '让证明变成工具', description: '把上一关已经证明的命题封装成一块积木，只用一步在新线段 DE 上构造等边三角形。', target: '调用命题 I.1，构造 DEF', hint: '使用已解锁的「等边三角形构造」积木。', tools: ['reuse'] }
];

export const TOOLS = {
  segment: { icon: '╱', name: '连接两点', group: '构造', subtitle: '公设 I · 作线段' },
  circle: { icon: '◯', name: '作圆', group: '构造', subtitle: '公设 III · 圆心与半径' },
  intersect: { icon: '⌖', name: '取两圆交点', group: '构造', subtitle: '交点存在条件' },
  radius: { icon: '=', name: '半径相等', group: '证明', subtitle: '圆的定义' },
  transitive: { icon: '⇒', name: '相等传递', group: '证明', subtitle: '共同概念 I' },
  equilateral: { icon: '△', name: '等边定义', group: '证明', subtitle: '由三边相等归结' },
  reuse: { icon: '✦', name: '等边三角形构造', group: '已证明定理', subtitle: '命题 I.1 · 复用' }
};

export function segmentKey(a, b) {
  return [a, b].sort().join('-');
}
export function circleId(center, through) {
  return 'circle:' + center + ':' + through;
}
function equalPair(a, b) {
  return [a, b].sort().join('|');
}
function labelSegment(key) {
  return key.replace('-', '');
}
export function basePoints(level, positions = {}) {
  const a = level === 5 ? 'D' : 'A';
  const b = level === 5 ? 'E' : 'B';
  return {
    [a]: { x: positions[a]?.x ?? 210, y: positions[a]?.y ?? 330, fixed: true },
    [b]: { x: positions[b]?.x ?? 430, y: positions[b]?.y ?? 330, fixed: true }
  };
}
export function initialState(level, positions = {}) {
  return { level, points: basePoints(level, positions), segments: [], circles: [], intersections: [], facts: [], theorems: [], steps: [] };
}
function failure(error) { return { ok: false, error }; }
function point(state, id) { return state.points[id]; }
function getCircle(state, id) { return state.circles.find(c => c.id === id); }
function getFact(state, id) { return state.facts.find(f => f.id === id); }
function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function intersectCircles(c1, c2, state) {
  const p = point(state, c1.center), q = point(state, c2.center);
  const r1 = distance(p, point(state, c1.through));
  const r2 = distance(q, point(state, c2.through));
  const dx = q.x - p.x, dy = q.y - p.y;
  const d = Math.hypot(dx, dy);
  if (d < 0.0001 || d > r1 + r2 + 0.0001 || d < Math.abs(r1 - r2) - 0.0001) return null;
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const mid = { x: p.x + (a * dx / d), y: p.y + (a * dy / d) };
  const one = { x: mid.x - dy * h / d, y: mid.y + dx * h / d };
  const two = { x: mid.x + dy * h / d, y: mid.y - dx * h / d };
  return one.y <= two.y ? one : two;
}
function addStep(state, action, title, detail, category) {
  state.steps.push({ id: 'step-' + (state.steps.length + 1), action, title, detail, category });
}
function addFact(state, a, b, via) {
  if (a === b) return failure('这是同一条线段，不能得到新的相等关系。');
  if (state.facts.some(f => equalPair(...f.pairs) === equalPair(a, b))) {
    return failure('这条相等关系已经证明过了。');
  }
  const fact = { id: 'fact-' + (state.facts.length + 1), pairs: [a, b], via };
  state.facts.push(fact);
  return { ok: true, fact };
}
export function applyAction(state, action, options = {}) {
  if (!action || !TOOLS[action.type]) return failure('未知的积木类型。');
  const next = structuredClone(state);
  const { a, b, type } = action;
  if (type === 'segment') {
    if (!point(next, a) || !point(next, b) || a === b) return failure('请选择两个不同的已知点。');
    const key = segmentKey(a, b);
    if (next.segments.some(s => s.key === key)) return failure('这条线段已经构造过了。');
    next.segments.push({ key, a, b });
    addStep(next, action, '连接 ' + a + '、' + b, '公设 I · 得到线段 ' + labelSegment(key), 'construct');
  }
  if (type === 'circle') {
    if (!point(next, a) || !point(next, b) || a === b) return failure('作圆需要不同的圆心和经过点。');
    const id = circleId(a, b);
    if (getCircle(next, id)) return failure('这个圆已经构造过了。');
    next.circles.push({ id, center: a, through: b });
    addStep(next, action, '作圆 (' + a + ', ' + a + b + ')', '公设 III · 以 ' + a + ' 为圆心、' + a + b + ' 为半径', 'construct');
  }
  if (type === 'intersect') {
    const c1 = getCircle(next, action.circle1), c2 = getCircle(next, action.circle2);
    if (!c1 || !c2 || c1.id === c2.id) return failure('请选择两个不同的已构造圆。');
    if (next.points.C) return failure('交点 C 已存在。');
    const result = intersectCircles(c1, c2, next);
    if (!result) return failure('这两个圆没有确定的交点，不能构造 C。');
    next.points.C = { ...result, fixed: false };
    next.intersections.push({ point: 'C', circles: [c1.id, c2.id] });
    addStep(next, action, '取得交点 C', '交点存在条件 · C 同时位于两个圆上', 'construct');
  }
  if (type === 'radius') {
    const circle = getCircle(next, action.circle);
    const p = action.point;
    if (!circle || !point(next, p)) return failure('请选取已有的圆和点。');
    const onCircle = p === circle.through || next.intersections.some(i => i.point === p && i.circles.includes(circle.id));
    if (!onCircle) return failure('当前构造没有证明 ' + p + ' 位于该圆上，不能使用半径相等。');
    const s1 = segmentKey(circle.center, p);
    const s2 = segmentKey(circle.center, circle.through);
    const r = addFact(next, s1, s2, 'radius');
    if (!r.ok) return r;
    addStep(next, action, labelSegment(s1) + ' = ' + labelSegment(s2), '圆的定义 · 同一圆的半径相等', 'proof');
  }
  if (type === 'transitive') {
    const f1 = getFact(next, action.fact1), f2 = getFact(next, action.fact2);
    if (!f1 || !f2 || f1.id === f2.id) return failure('请选择两条不同的、已经证明的相等关系。');
    const shared = f1.pairs.find(k => f2.pairs.includes(k));
    if (!shared) return failure('两条关系没有共同的线段，不能使用相等传递。');
    const other1 = f1.pairs.find(k => k !== shared);
    const other2 = f2.pairs.find(k => k !== shared);
    const r = addFact(next, other1, other2, 'transitive');
    if (!r.ok) return r;
    addStep(next, action, labelSegment(other1) + ' = ' + labelSegment(other2), '共同概念 I · 与同一量相等的两个量彼此相等', 'proof');
  }
  if (type === 'equilateral') {
    const edges = ['A-B', 'A-C', 'B-C'];
    if (edges.some(k => !next.segments.some(s => s.key === k))) return failure('请先连接 AB、AC、BC 三条边。');
    const expected = [equalPair(edges[0], edges[1]), equalPair(edges[0], edges[2]), equalPair(edges[1], edges[2])];
    if (!expected.every(k => next.facts.some(f => equalPair(...f.pairs) === k))) return failure('还缺少三边相等的证明。需要两次半径相等和一次相等传递。');
    if (next.theorems.includes('equilateral')) return failure('已经证明了这个定理。');
    next.theorems.push('equilateral');
    addStep(next, action, '△ABC 是等边三角形', '等边三角形定义 · 三条边两两相等，证毕！', 'theorem');
  }
  if (type === 'reuse') {
    if (!options.unlocked) return failure('请先通关命题 I.1，解锁这块定理积木。');
    if (next.points.F) return failure('已经调用过该定理。');
    const d = point(next, 'D'), e = point(next, 'E');
    if (!d || !e || distance(d, e) < 10) return failure('需要两个不同的起始点 D、E。');
    const dx = e.x - d.x, dy = e.y - d.y;
    next.points.F = { x: (d.x + e.x) / 2 + dy * Math.sqrt(3) / 2, y: (d.y + e.y) / 2 - dx * Math.sqrt(3) / 2, fixed: false };
    for (const [u, v] of [['D','E'],['D','F'],['E','F']]) next.segments.push({ key: segmentKey(u,v), a: u, b: v });
    next.theorems.push('reused-equilateral');
    addStep(next, action, '调用命题 I.1 → △DEF', '由已证明的构造定理，直接得到 DE = DF = EF', 'theorem');
  }
  return { ok: true, state: next };
}
export function replay(level, actions, positions = {}, unlocked = false) {
  let state = initialState(level, positions);
  for (const action of actions) {
    const result = applyAction(state, action, { unlocked });
    if (!result.ok) return result;
    state = result.state;
  }
  return { ok: true, state };
}
export function isGoalComplete(state) {
  switch (state.level) {
    case 1: return state.segments.some(s => s.key === 'A-B');
    case 2: return !!getCircle(state, circleId('A', 'B'));
    case 3: return !!getCircle(state, circleId('A', 'B')) && !!getCircle(state, circleId('B', 'A')) && !!state.points.C;
    case 4: return state.theorems.includes('equilateral');
    case 5: return state.theorems.includes('reused-equilateral');
    default: return false;
  }
}
export function availablePoints(state) { return Object.keys(state.points).sort(); }
export function factText(fact) { return fact.pairs.map(labelSegment).join(' = '); }
export function circleText(circle) { return '圆 (' + circle.center + ', ' + circle.center + circle.through + ')'; }
