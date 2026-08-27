# Information Architecture Decisions v0.1

IA 决策基线，基于 Information Architecture Review v0.1 的 5 个 Handoff 问题。

> 状态：**已冻结（v0.1）**。本文件只记录 IA 决策，**不实施任何 Content Model 变更**；
> 实施需另行发起 Implementation 阶段并评估 Contract Impact。

> 核心原则：只冻结当前真正需要冻结的 IA；没有需求证据的地方明确保持开放。

---

## 0. 决策总表

| ID | 决策 | 结论 |
|---|---|---|
| D1 | posts / fiction / test 栏目定位 | 保留为栏目，不升级为 Content Type |
| D2 | 首页职责 | 保持 Identity Page |
| D3 | 测试内容边界 | 测试内容不属于正式内容 IA（导航层）；索引策略单独待决 |
| D4 | taxonomy | 保留基础设施，不纳入当前 IA |
| D5 | 单语内容策略 | 允许单语内容存在，不引入额外 Content Model |

---

## 1. D1：posts / fiction / test 栏目定位

**Decision**：三个栏目**保留为 Section（栏目），不升级为 Content Type**。
「文章 / 小说 / 测试」是栏目语义；不引入 `type = post / fiction / test` 机制。

**Rationale**：
- 三个栏目在机制上无差异（同一套 section.html / single.html / post-list.html），
  差异仅存在于命名、导航 weight 与注释意图。
- 无真实需求驱动类型分化（fiction 章节模型仅是 intent signal，无模板/数据支撑）。
- 避免 premature abstraction：不为「未来可能不同」提前设计类型机制。

**Evidence**：content-inventory.md 第 2 节冻结判断；IA Review 第 5、8、11 节；
hugo list all（kind 仅 home/section/page）；content/ 全文（无 type 字段）。

**Scope**：覆盖 posts / fiction / test 三个现有栏目；覆盖当前与近期的栏目语义。

**Non-goals**：
- 不引入 Content Type 机制（type/layout 字段、类型专属模板）。
- 不实现 fiction 注释中的章节模型（章节导航/排序/小说元数据）。
- 不因「文章可能有日期归档」而预先设计 archive 机制。
- 不重组或重命名现有栏目。

**Deferred**：当同一 Section 内出现真实差异需求（不同 front matter schema / rendering /
listing / navigation / metadata / interaction）时，重新评估 Content Type（触发条件见
content-inventory.md 第 2 节）。

**Contract Impact**：无。Navigation Contract / Content Model / 模板均不变。

---

## 2. D2：首页职责

**Decision**：首页**保持 Identity Page**（身份 + 介绍 + 全站导航），不改为 Content Hub。

**Rationale**：
- 当前事实：home.html 只渲染一句话简介，不消费任何列表数据；首页对内容变化不敏感。
- 零内容可聚合（posts/fiction 空），聚合机制无对象。
- 首页形态是产品决策，当前证据不支持 Hub 化。

**Evidence**：home.html（8 行）；content/_index.md；IA Review 第 7、12 节；
public/zh/index.html（无聚合结构）。

**Scope**：首页的信息承载范围（身份/介绍）；不覆盖站点级导航（baseof 提供）。

**Non-goals**：
- 不为首页预留聚合机制（Recent Posts / Featured / Projects 插槽）。
- 不增加首页内容依赖（site.RegularPages / site.Sections 列表）。

**Deferred**：若未来出现真实聚合需求（如首页展示最新文章），作为**新的 IA Decision**
另行评估，而非现在预留能力。

**Contract Impact**：无。home.html 属 Page Structure（Architecture Map），可独立演进。

---## 3. D3：测试内容边界

**Decision（定位层）**：测试内容（test 栏目下）**不属于正式内容 IA**——它不进入导航、
不作为正式栏目语义的一部分。「不进入导航」≠「不是正式内容」的概念已确认：
test 当前是 **public but undiscoverable**（可访问、可构建、进 sitemap、无 navigation.show）。

**Decision（技术表达层，待决）**：测试内容是否 noindex / draft，**不在本决策冻结**。
先定定位，再选技术表达。

**Rationale**：
- 定位决策（不属于正式 IA）是干净的语义判断；noindex 是技术手段，不该先绑死。
- 当前 test 内容（hugo-test / beiying）是排版/渲染验证工具，不是发布内容。
- 测试内容与正式内容当前无机制边界（同模板、同 sitemap），边界只存在于命名与导航。

**Evidence**：sitemap 含 /zh/test/* 与 /en/test/hugo-test/；test 无 navigation.show；
IA Review 第 10、12 节（P1-2）。

**Scope**：test 栏目及其内容在 IA 中的定位；不覆盖「测试内容具体去留」。

**Non-goals**：
- 不冻结 noindex / draft 方案（属独立决策，见 Deferred）。
- 不为测试内容引入「正式/测试」的机制区分（如独立 content root、前缀约定）。
- 不移动 /zh/test/* 的 URL（Content URL 稳定性是既有约束）。

**Deferred**：
- 测试内容是否应被搜索引擎索引（noindex / robots / draft）——独立决策项。
- 测试内容的长期去留（保留 / 迁移 / 清理）。

**Contract Impact**：无当前变化。若未来选择 noindex：涉及 content front matter 或 config，
属 Content/配置变更，需在 Implementation 阶段评估。

---

## 4. D4：taxonomy

**Decision**：taxonomy 基础设施（[taxonomies] tag='tags'、taxonomy.html / term.html、/tags/ 页）
**暂时保留，但不把 tags 纳入当前 IA**。不拆除、不升级。

**Rationale**：
- 保留成本为零；拆除属 Contract/配置变更，且无需求驱动。
- 当前 IA 不依赖 taxonomy；强行使用或立即删除都违反 evidence-driven 原则。
- 未来有内容策略（分类需求）时再启用，属独立决策。

**Evidence**：hugo.toml [taxonomies]；content 零 tags 引用（grep）；/zh/tags/ 空页（构建产物）；
IA Review 第 9、13 节。

**Scope**：taxonomy 基础设施的存在性；不覆盖未来启用时的设计。

**Non-goals**：
- 不强制为内容添加 tags。
- 不删除 taxonomy 配置/模板/URL。
- 不设计未来的 taxonomy 使用方案。

**Deferred**：内容策略是否使用 tags；启用时 tags 的命名/组织（属未来 IA Decision）。

**Contract Impact**：无。若未来拆除：hugo.toml + taxonomy.html / term.html + 空页，
属 Contract/配置变更，需另行评审。

---

## 5. D5：单语内容策略

**Decision**：**允许单语内容存在**（如 beiying 仅中文），不为单语内容引入额外 Content Model。
中文内容无 en 翻译时，作为 zh 内容正常存在。

**Rationale**：
- beiying 是公版中文散文，无 en 版本是合理内容状态，不是缺陷。
- 单语是内容属性，不是内容类型——不需要机制支持。

**Evidence**：content/test/beiying.md（仅 zh）；lang-switch 回退 /en/（构建产物）；
IA Review 第 6、13 节（P2-1）。

**Scope**：单语内容的存在性；不覆盖语言切换的 UX 细节。

**Non-goals**：
- 不强制所有内容双语。
- 不为单语内容增加翻译占位/提示机制。
- 不新增 Content Model 概念（如「语言独占」标记）。

**Deferred**：语言切换回退 UX（如 beiying 跳转 /en/ 首页是否理想）——属
**Localization Contract / UX Decision**，当前无 Localization Contract，不作为本决策内容。

**Contract Impact**：无。若未来明确单语 UX 规则，需新建/修订 Localization 相关契约。

---## 6. Deferred / Not Decided（暂不决定 ≠ 默认同意）

> 以下项目**未被本决策冻结**。「暂不决定」不代表「默认同意」，后续实现不得把
> 本节的未决项当作已批准的行为。

| ID | 未决项 | 触发条件 | 备注 |
|---|---|---|---|
| X1 | Content Type 机制 | 同一 Section 内出现真实差异需求 | 触发条件见 content-inventory.md 第 2 节 |
| X2 | 首页 Hub 化 | 出现真实聚合需求 | 需新 IA Decision |
| X3 | 测试内容 noindex / draft | D3 定位决策后的独立选择 | 不在此冻结 |
| X4 | taxonomy 启用 / 拆除 | 内容策略确定 tags 用途 | 拆除属 Contract 变更 |
| X5 | beiying 语言切换 UX | 建立 Localization Contract 时 | 当前无此契约 |
| X6 | 栏目着陆正文（栏目介绍） | 栏目语义确定后 | IA Review 候选 C7 |
| X7 | fiction 章节模型 | 小说内容真实出现时 | 仅 intent signal |
| X8 | 测试内容长期去留 | 内容策略阶段 | 保留/迁移/清理 |

---

## 7. Contract Impact 汇总

| 决策 | Navigation Contract | Component Contract | Content Model | 模板/配置 |
|---|---|---|---|---|
| D1 | 无 | 无 | 无（保持通用 Page + Section） | 无 |
| D2 | 无 | 无 | 无 | 无（home.html 保持现状） |
| D3 | 无 | 无 | 无 | 无（noindex 未冻结） |
| D4 | 无 | 无 | 无 | 无（taxonomy 保留） |
| D5 | 无 | 无 | 无 | 无 |

**结论**：v0.1 的五项 IA 决策**均不触发任何既有 Contract 变更**。
Implementation 阶段不得自动实施本节之外的行为。

---

## 8. 关联文档

- docs/content-inventory.md（Content Inventory v0.1）
- docs/information-architecture-review.md（IA Review v0.1）
- docs/navigation-contract.md / component-contract.md / architecture-relationship-map.md
- 本文件（Information Architecture Decisions v0.1）
