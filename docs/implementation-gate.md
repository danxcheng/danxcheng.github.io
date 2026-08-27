# Implementation Gate v0.1

Implementation 阶段的任务门槛。**本文件生效后，不再使用开放式实现任务**
（如「优化一下网站」「完善文章系统」）。

> 状态：**已冻结（v0.1）**。所有后续 Implementation 任务必须符合本模板。

---

## 1. 背景：Scope Provenance

已建立可追溯决策链：

```text
Facts → Content Inventory → IA Review → IA Decisions → Contract Impact Review
                                                              │
                                       Navigation / Components / Content / Architecture
                                                              │
                                                              ▼
                                                    IMPLEMENTATION GATE
```

**核心规则**：每一个 Implementation 变更，都必须能够追溯到一个
**已经批准的 Decision 或 Contract**。

---

## 2. 任务书模板（每个任务必须包含）

```
TASK: <任务名>

SOURCE DECISION:
  来自哪个已冻结 Decision / Contract？（无来源 → 不是本任务，是新 Decision）

SCOPE:
  本任务要做什么（明确、有限、可验收）

FILES ALLOWED TO CHANGE:
  - <允许修改的文件/目录>

FILES FORBIDDEN TO CHANGE:
  - <禁止触碰的文件/目录>

ACCEPTANCE CRITERIA:
  - <可验证的完成标准，逐条>

REGRESSION CHECK:
  - <构建 + 受影响页面/行为的回归清单>

GIT / WORKTREE REQUIREMENT:
  - <是否提交 / 推送到哪个分支 / 是否同步主题仓库>
```

---

## 3. 「发现问题」≠「有权修复问题」

实施过程中若发现（示例）：

- 「这里最好增加 type」
- 「这里最好加 tags」
- 「首页最好显示文章」
- 「test 最好 noindex」
- 「小说应该有章节导航」
- 「这个 CSS 顺手重构一下」

**正确行为**：

```text
发现
 ↓
报告（在本任务范围内记录）
 ↓
指出需要新的 Decision（IA / Contract）
 ↓
停止越界修改（不实现、不顺手修）
```

**禁止**：把任务外的发现当作任务内改进实现。

---

## 4. 已冻结基线（本 Gate 依据）

### Architecture Baseline
- Navigation Contract v0.1
- Component Contract v0.1
- Architecture Relationship Map v0.1
- Content Inventory v0.1
- IA Review v0.1
- IA Decisions v0.1
- Contract Impact Review v0.1

### Content Model 冻结语义

| 项 | = | ≠ |
|---|---|---|
| Content Model | Generic Page + Section Container | Explicit Content Type System |
| Homepage | Identity Page | Content Hub |
| posts / fiction / test | Sections | Technical Content Types |
| taxonomy | Infrastructure | Current IA |
| test | Publicly accessible | Formal Content IA |
| single-language content | Allowed | Special Content Type |

---

## 5. 当前状态声明

> **截至本文件冻结：不存在由已批准 Decision 驱动的待办 Implementation。**
> D1–D5 均为 No Change 决策；X1–X8 全部冻结为未决。
> 下一个 Implementation Task 必须携带 SOURCE DECISION（新 Decision 或新需求），
> 由任务发起人（站点所有者）提供，而非由执行者自拟。

---

## 6. 关联文档

- docs/ 全部 7 份架构/IA 文档
- 本文件（Implementation Gate v0.1）
