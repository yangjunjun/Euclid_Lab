# Euclid Lab

交互式欧几里得几何游戏：把公设和证明规则变成可拖拽积木。由构造到证明，最后把已证明定理变成新工具。

## 在线体验

https://yangjunjun.github.io/Euclid_Lab/

## 第一版

5 关：连接两点、作圆、双圆交点、等边三角形的构造与证明、复用定理。支持几何画布拖动、撤销、重置、提示、证明记录、本地存档。

运行：进入项目根目录，执行 `python3 -m http.server 8080`；打开 http://localhost:8080 。无需安装依赖。

测试：`node --test tests/*.test.mjs`。

GitHub Pages：仓库 Settings → Pages → Build and deployment → GitHub Actions，首次设置后向 `main` 推送代码会自动部署。

## 数学约束

这是教学用的有限规则证明系统，不是对《几何原本》的完整形式化。引擎额外明确采用两圆交点存在条件、圆的定义和相等传递等规则。几何画布负责显示，不会把浮点相等误当成证明。
