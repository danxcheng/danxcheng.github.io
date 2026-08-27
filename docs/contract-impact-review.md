# Contract Impact Review v0.1

短审查：验证 IA Decisions v0.1（D1–D5）对既有契约的实际影响。
本文件是 **IA 链的收口验证**，不是重新设计。

> 结论（先行）：**IA Baseline v0.1 Frozen + Contract Impact = No Change**。

---

## CIR-01 — Navigation Contract：No Change

**验证项**（对照 docs/navigation-contract.md）：

| IA 决策 | 对导航的影响 | 验证 |
|---|---|---|
| D1 栏目保留 Section | 导航语义（Section + show/weight）不变 | 契约无 type 概念（grep 确认无 "type"） |
| D2 首页 Identity | 首页固定顶级链接不变 | 契约第 4 节（首页 + 栏目分组结构未动） |
| D3 测试内容定位 | test 本就不在导航（无 show）；D3 只确认定位 | 契约 Visibility 规则（show=true 才进）未变 |
| D4 taxonomy 保留 | 不影响导航 | 契约无 taxonomy 参与导航 |
| D5 单语内容 | lang-switch 行为不变 | 契约 Localization 节（Title 来自 _index）未动 |

**结论**：Section/Page 导航语义、navigation.show、navigation.weight、active/expand、
顶层 Page 行为——**全部 No Change**。

---

## CIR-02 — Component Contract：No Change

**验证项**（对照 docs/component-contract.md）：

| IA 决策 | 对组件的影响 | 验证 |
|---|---|---|
| D1 不升级 Content Type | 组件（background/settings/music/copy-code）与内容类型无关 | 组件清单未含任何内容类型组件 |
| D2 首页 Identity | 首页组件组合不变 | home.html 属 Page Structure，组件编排在 baseof，未动 |
| D3 测试内容定位 | **≠ 要求组件隐藏 test** | 无组件消费 test 内容；无 noindex 实现（grep 确认） |
| D4 taxonomy 保留 | taxonomy UI（taxonomy.html/term.html）保留原状 | 无组件涉及 taxonomy |
| D5 单语内容 | 无组件影响 | — |

**重点**：D3 是 IA 定位决策，**不等于**要求组件/页面隐藏 test 内容。
noindex 属 X3 未决项，不得顺手实现。

**结论**：Homepage composition、Section/Single 职责、Sidebar/navigation、
lang-switch、taxonomy UI、test 内容 UI 边界——**全部 No Change**。

---

## CIR-03 — Content Model / Architecture Relationship：No Change

**验证项**：

| 假设 | 验证 |
|---|---|
| D1 → 不增加 Content Type | 代码无 type/layout 机制（grep：layouts 零 Params.type 消费） |
| D2 → 不增加 Home aggregation model | home.html 8 行纯 Content 渲染，无聚合 |
| D3 → 不增加 TestContent type | test 内容用通用 page/section 渲染，无专属机制 |
| D4 → 不增加 taxonomy semantics | taxonomy 配置/模板保留原状，无内容使用 |
| D5 → 不增加 localization/content-type mechanism | 单语内容走现有文件配对机制 |

**结论**：Content Model **No Change**；Architecture Relationship Map **No Change**
（五层边界、修改影响图均不因 D1–D5 变化）。

---

## CIR-04 — Deferred Decisions Boundary（scope creep 最后闸门）

逐项确认：**没有任何 Deferred Decision 被默认解释为已批准**。

| ID | 未决项 | ≠ 不得提前实现 | 当前代码证据 |
|---|---|---|---|
| X1 | Content Type | ≠ 提前加 type 机制 | 无 type 字段/模板 |
| X2 | Home Hub | ≠ 提前加 recent posts 聚合 | home.html 无聚合 |
| X3 | test noindex | ≠ 顺手给 test 加 noindex | 全站无 noindex（grep 确认） |
| X4 | taxonomy 启用 | ≠ 顺手做 tags UI | taxonomy 零使用 |
| X5 | beiying 语言 UX | ≠ 顺手改 lang-switch 回退 | lang-switch 保持现状 |
| X6 | 栏目着陆正文 | ≠ 顺手给 section 加介绍 | _index 无正文 |
| X7 | fiction 章节 | ≠ 提前实现章节导航 | 无章节模板 |
| X8 | 测试内容去留 | ≠ 顺手清理/迁移 test | content 未动 |

**结论**：X1–X8 全部保持未决状态，任何实现不得将其当已批准行为。

---

## 最终结论

> **IA Baseline v0.1 Frozen + Contract Impact = No Change**

D1–D5 对 Navigation Contract / Component Contract / Content Model /
Architecture Relationship Map 的契约影响全部为零（代码与文档双重验证）。

## Implementation 门槛（自本文件起生效）

任何新功能/新变更必须回答：

```text
这个需求来自哪个已冻结 Decision？
        ↓
如果没有来源
        ↓
它就是新的 Decision（IA / Contract），而不是 Implementation scope。
```

Implementation 的任务定义：

> 针对已冻结的 IA 与现有 Contracts，实现一个明确、有限、可验证的变更。

---

## 关联文档

- docs/navigation-contract.md / component-contract.md / architecture-relationship-map.md
- docs/content-inventory.md / information-architecture-review.md / information-architecture-decisions.md
- 本文件（Contract Impact Review v0.1）
