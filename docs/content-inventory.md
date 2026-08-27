# Content Inventory Review v0.1（事实基线）

只读审查产出。本文件是 **Content Model 的事实基线**，不是设计决策。
回答：**danxcheng.github.io 现在到底是什么**。

> 状态：**已验收**。下一阶段是 Information Architecture Review（决策阶段），
> 本阶段不实施任何 Content Model 改动。

---

## 1. 核心事实

1. 全站 12 个内容节点：2 首页 + 6 Section 着陆页（3 栏目 × 双语）+ 4 页面（其中 1 个仅中文）。
2. **三个栏目（posts / fiction / test）全部没有真实发布内容**：posts 0 篇、fiction 0 篇；
   test 下仅 2 篇测试性质内容（hugo-test 渲染测试、beiying 公版散文排版测试）。
3. 首页只渲染 content/_index.md 的一句话简介；home.html 不消费任何列表/聚合数据。
4. 导航实际显示 posts / fiction（weight 10/20）；test 无 navigation.show，已确认不进导航。
5. 无顶层 Page 实例；Navigation Contract 规则 A 的 Page 分支目前无案例可验证。
6. Taxonomy（tags）基础设施存在（配置/模板/空页）但内容零使用。
7. 模板层无任何内容类型硬编码（无 `.Section == "xxx"` 分支、无 type 字段）。
8. i18n 42 键全为 UI 文案；内容标题/描述全在 front matter，双语走文件后缀（.en.md）。
9. 全部内容 draft=false，无草稿；data/ 目录为空（未启用）。

---

## 2. 冻结判断（IA Review 的起点）

> **当前 Hugo Content Model 是「通用 Page + Section 容器 + Navigation Contract」，
> 而不是「显式 Content Type 系统」。现有 posts / fiction / test 是栏目语义，
> 而不是技术意义上的内容类型。**

由此：

- **不得**从「posts / fiction / test」推导出「type = post / fiction / test」。
- **不得**为此引入 Content Type 机制（type 字段、类型专属模板）。
- Section 本身已足够作为 IA 结构；新增栏目 = _index.md + navigation（契约已解）。

触发 Content Type 机制的真实条件（满足前不引入）：

> 同一个 Section 内，不同内容需要不同的：front matter schema / rendering /
> listing semantics / navigation semantics / metadata semantics / interaction。

仅「文章一个 section、小说一个 section」且都能由 section.html + single.html +
post-list.html 统一处理时，Section 就是足够的 IA 结构。

---

## 3. 决策问题清单（IA Review 待答，按优先级）

| 优先级 | 问题 | 当前结论 |
|---|---|---|
| P0 | posts / fiction / test 到底分别是什么？ | **必须先定语义** |
| P0 | Section 与 Content Type 是否需要分离？ | **暂不引入机制，除非出现真实差异需求** |
| P1 | 首页是 Identity Page 还是 Content Hub？ | 目前事实是 Identity Page |
| P1 | 测试内容与正式内容的边界？ | 需明确测试内容是否属于正式站点 IA |
| P2 | tags / 单语内容是否保留现有基础设施？ | 暂不做架构升级，仅记录决策 |

---

## 4. Facts / Questions / Not Yet Decidable

### Facts
- 12 内容节点；6 对中英 + beiying 单语。
- posts/fiction 空；全站 page 内容仅 2 篇测试。
- 首页仅渲染一句话简介，无聚合。
- 导航实际显示 posts/fiction；test 隐藏。
- 无顶层 Page 实例。
- taxonomy 基础设施存在、零使用。
- 模板无内容类型硬编码。
- i18n 全为 UI 文案。
- 全部 published。
- data/ 空目录。

### Questions
- 三个栏目是否应成为正式内容类型，还是保持通用 section + 命名？
- 首页应否聚合内容，还是保持身份页？
- 唯一真实内容（测试性质）应否迁移/归类到正式栏目？
- taxonomy 未来是否有实际用途？
- 顶层 Page（如 About）何时出现以验证规则 A？

### Not Yet Decidable
- 栏目与内容类型是否区分（无需求驱动）。
- 首页形态（产品决策）。
- fiction 章节模型是否实现。
- tags 保留与否。

---

## 5. 关联文档

- docs/navigation-contract.md（Navigation Contract v0.1）
- docs/component-contract.md（Component Contract v0.1）
- docs/architecture-relationship-map.md（Architecture Relationship Map v0.1）
- 本文件（Content Inventory Review v0.1）

## 6. 下一步

> Information Architecture Review —— 对第 3 节 5 个决策问题逐项给出 IA 决策，
> 然后才评估 Navigation / Content Contract 是否需要变化。
