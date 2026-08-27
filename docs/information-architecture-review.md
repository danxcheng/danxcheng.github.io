# Information Architecture Review v0.1

只读事实审查 + 决策候选。本文件**输出 Review，不输出最终 Decision**。
基于已冻结的：docs/navigation-contract.md、docs/component-contract.md、
docs/architecture-relationship-map.md、docs/content-inventory.md。

> 状态：**审查完成，等待 IA Decisions v0.1**。

---

## 1. Scope & Constraints

**允许**：检查 IA 实际结构与语义；对照四份已冻结文档；回答 P0-P2 的事实依据；
指出语义不一致/冗余/歧义；提出候选 IA 方案（供决策讨论）。

**禁止**：修改任何文件；git 操作；修改配置/content/template/CSS/JS；
引入 type/layout/kind 机制；因未来可能性提前加架构；把候选当决策；
把设计偏好包装成事实；无需求证据重组栏目；默认保留 taxonomy；默认改首页为 Hub。

**三层区分**：
- **FACT**：代码 / content / 构建产物实际证明了什么
- **IA INTERPRETATION**：事实的语义关系与缺口
- **DECISION**：需要产品所有者明确选择什么

---

## 2. Evidence Sources

| 证据 | 位置 | 用途 |
|---|---|---|
| 内容清单 | hugo list all 输出 + content/ 全文逐字读取 | 节点/类型/双语 |
| 导航渲染 | public/zh/index.html 等 6 个构建产物 | 导航↔内容 |
| URL 全集 | public/sitemap.xml（zh 7 / en 6） | 可见性 |
| 空列表状态 | public/zh/posts/index.html（空状态文案） | Section 语义 |
| 空 taxonomy | public/zh/tags/index.html（title: Tags - Danxcheng） | taxonomy 现状 |
| 首页渲染 | public/zh/index.html + home.html（8 行） | 首页职责 |
| 配置 | hugo.toml（[taxonomies]/[params]/[languages]） | 机制声明 |
| 契约 | docs/ 四份文档 | 约束基线 |
| 模板消费 | section/single/taxonomy/term/home.html | 类型耦合 |

---

## 3. Current IA Map

```text
danxcheng.github.io
│
├─ /zh/（home）      身份 + 一句话简介
├─ /zh/posts/        栏目「文章」（空）      → 导航 ✓
├─ /zh/fiction/      栏目「小说」（空）      → 导航 ✓
├─ /zh/test/         栏目「测试」（测试容器）→ 导航 ✗
│   ├─ /zh/test/hugo-test/   渲染测试文档（双语）
│   └─ /zh/test/beiying/      公版散文·排版测试（仅 zh）
├─ /zh/tags/         taxonomy 空列表页
│
└─ /en/ 同构（6 URL，无 beiying；posts/fiction/test/hugo-test/tags）
```

URL 结构：`/语言/栏目/页面/`，`defaultContentLanguageInSubdir=true`（hugo.toml）。

---

## 4. IA ↔ Navigation

**FACT**（构建产物验证）：
- 导航只渲染 posts（文章）、fiction（小说）两个栏目；test 不在导航（无 navigation.show，content/test/_index.md）。
- 首页固定顶级链接（i18n nav_home）；「栏目」分组为唯一分组（i18n nav_sections_group）。
- 无顶层 Page 实例；Navigation 规则 A 的 Page 分支无实际案例。

**IA INTERPRETATION**：
- 导航反映的是「栏目意图」，而栏目目前没有内容——导航语义（栏目）与内容实际（空）存在错位。
- test 在导航中不可见，但其内容（2 篇）是全站唯一的 page——**全站唯一真实内容对用户导航不可见**。

**DECISION**：导航栏目集合 = 内容栏目集合 是否需要一致？（P0）

---

## 5. IA ↔ Content Model

**FACT**：
- Hugo kind 只有 3 种实际出现：home / section / page（hugo list all）。
- front matter 无 type/layout 字段；模板无 Section 名硬编码（single/section 通用）。
- 三个栏目用同一套 section.html + post-list.html 渲染；两个 page 用同一套 single.html。

**IA INTERPRETATION**：
- Content Model 是「通用 Page + Section 容器」，栏目之间无类型差异（与 content-inventory 冻结判断一致）。
- fiction 注释（章节模型）是 existing intent signal，**不是**冻结契约——当前无对应模板/逻辑。

**DECISION**：是否引入 Content Type 机制？（触发条件已列于 content-inventory.md 第 2 节，当前不满足）

---## 6. IA ↔ Localization

**FACT**（content 全文 + sitemap）：
- 语言：zh（默认）+ en；URL 为 /zh/ /en/ 子目录（hugo.toml）。
- 双语配对：home、posts、fiction、test、hugo-test 各成对；beiying 仅 zh。
- en sitemap 6 URL 无 beiying；lang-switch 对 beiying 回退到 en 首页（构建产物含 /en/ 链接）。
- Section 标题由各语言 _index.md 分别定义；i18n 42 键全为 UI 文案。

**IA INTERPRETATION**：
- 双语结构按「文件配对」组织，语言间栏目结构一致（test 栏目在 en 侧存在空着陆页）。
- beiying 是唯一单语内容：其 IA 定位为「中文独占内容」，回退行为（→ en 首页）是当前事实，非设计决策。

**DECISION**：单语内容的预期多语言行为是否需要明确？（P2）

---

## 7. Homepage IA

**FACT**：
- home.html 全文 8 行：仅 `{{ .Content }}` 包进 .prose（build 产物确认）。
- content/_index.md 提供：title（=site.Title）、description、一句话简介正文。
- baseof 提供全站共享：站点标题/导航/语言切换/页脚/组件；首页不消费 site.RegularPages 或 site.Sections 列表。

**IA INTERPRETATION**：
- 首页是 **Identity Page**：身份 + 一句话，无内容聚合、无栏目入口。
- 首页不依赖任何内容列表——**改变内容不会改变首页**（除简介文案）。

**DECISION**：首页保持 Identity Page 还是改为 Content Hub？（P1，当前事实是前者）

---

## 8. Section / Page Semantics

**FACT**：
- 三个 Section 均为「列表语义」：section.html 渲染 Title + post-list（空时显示 no_posts 文案）。
- 两个 Page 均为「文章语义」：single.html 渲染 Title + post-meta（日期/标签）+ TOC + 正文。
- 无 Section 提供「着陆页正文」——三个 _index.md 均无正文，只有 front matter。

**IA INTERPRETATION**：
- 当前 Section 语义 = 纯容器/列表入口，无独立着陆内容（如栏目介绍）。
- posts/fiction 的「栏目身份」只存在于 title 与导航，无页面内自我描述。

**DECISION**：Section 是否需要承载着陆内容（栏目介绍）？（P0 相关）

---

## 9. Taxonomy Role

**FACT**：
- [taxonomies] tag='tags' 声明（hugo.toml）；taxonomy.html/term.html 模板存在；/zh/tags/ 空列表页生成（title: Tags - Danxcheng）。
- content 全部文件零 tags 引用（grep 确认）。
- categories 未声明、未生成。

**IA INTERPRETATION**：
- taxonomy 是「已支付的未使用基础设施」：配置、模板、URL 均存在，但无任何内容使用。
- 保留/拆除都是决策，且拆除属 Contract/配置变更（非本轮范围）。

**DECISION**：tags 是未来内容策略的一部分，还是应拆除？（P2）

---

## 10. Test Content Boundary

**FACT**：
- test 栏目（导航不可见）承载全站仅有的 2 个 page：hugo-test（渲染测试）、beiying（排版测试）。
- 两者 front matter 含 description/images=[]，与正式 page 无结构差异。

**IA INTERPRETATION**：
- 测试内容与正式内容**目前无机制边界**（同一 Content Tree、同一模板、同 sitemap 可见）；
  边界只存在于「栏目命名 + 不进导航」。
- 对搜索引擎/访客，测试页是公开可索引内容（sitemap 含 /zh/test/*）。

**DECISION**：测试内容是否属于正式站点 IA？（P1）

---## 11. P0 Decisions（事实依据 + 候选）

### P0-1：posts / fiction / test 到底分别是什么？

- **当前事实**：三个独立 Section（Hugo kind=section），导航中 posts/fiction 是栏目、test 隐藏；
  三个栏目均无发布内容；仅 test 有内容（测试性质）。
- **已有约束**：Navigation Contract（show/weight）；Content Model 通用（无类型机制）。
- **冲突/空白**：栏目语义（文章/小说/测试）与内容实际（空/测试）不一致；「测试」既是栏目又是内容类别。
- **可选决策方向**：
  1. 栏目 = 未来内容容器（文章/小说待填充，测试为工具区）——现状延续
  2. 栏目 = 当前实际内容（若测试内容转正，test 语义变化）
  3. 拆分「正式栏目」与「工具/测试区」为不同可见性层级
- **推荐/不推荐**：不推荐在此阶段重组；推荐先确认「栏目是否有待填充的真实内容计划」——这决定栏目语义是否成立。
- **尚不能决定**：栏目内容计划（产品决策）；测试内容去留。

### P0-2：Section 与 Content Type 是否需要分离？

- **当前事实**：无 type 机制；模板全通用；栏目间无渲染差异。
- **已有约束**：content-inventory.md 冻结判断（通用 Page + Section，非 Content Type 系统）。
- **冲突/空白**：无真实差异需求（fiction 章节模型仅为注释 intent signal）。
- **可选决策方向**：
  1. 维持现状（Section 即 IA 结构）
  2. 引入 type 机制（仅在出现真实差异需求时，如章节导航/不同列表语义）
- **推荐/不推荐**：**推荐维持现状**；不推荐提前引入 type。
- **尚不能决定**：无。当前证据充分支持维持。

---

## 12. P1 Decisions

### P1-1：首页是 Identity Page 还是 Content Hub？

- **当前事实**：Identity Page（身份 + 一句话，无聚合，无内容依赖）。
- **已有约束**：Component/Architecture Map（home.html 属 Page Structure，可独立重做）。
- **冲突/空白**：首页是唯一「可聚合」位置，但无聚合能力；未来若聚合需 home.html 新增能力。
- **可选决策方向**：
  1. 保持 Identity Page（现状）
  2. 演进为聚合页（展示栏目/最新内容）——需内容与 home.html 同时就绪
- **推荐/不推荐**：不推荐在零内容时改 Hub；保持 Identity 是当下事实合理态。
- **尚不能决定**：首页形态（产品决策，且依赖 P0 栏目语义）。

### P1-2：测试内容与正式内容的边界？

- **当前事实**：无机制边界；测试页公开可索引（sitemap），导航不可见。
- **已有约束**：无（test 不进导航是 navigation.show 默认隐藏的结果，非专属机制）。
- **冲突/空白**：公开可索引 vs 测试性质；「测试」栏目名与内容类别混用。
- **可选决策方向**：
  1. 维持现状（test 公开、导航隐藏、可索引）
  2. 测试内容降级（draft / noindex）——需确认测试内容是否该被索引
  3. 建立正式/测试区分的显式机制
- **推荐/不推荐**：不推荐引入显式机制；测试内容的 noindex/draft 与否是产品决策。
- **尚不能决定**：测试内容是否应被搜索引擎索引。

---

## 13. P2 Decisions

### P2-1：tags / 单语内容是否保留现有基础设施？

- **当前事实**：taxonomy 配置/模板/URL 存在、零使用；beiying 单语且回退行为已确认。
- **已有约束**：无内容使用 tags；契约未承诺 taxonomy。
- **冲突/空白**：基础设施「已支付未使用」；保留成本低、拆除是 Contract 变更。
- **可选决策方向**：
  1. 保留（零成本，等待内容策略）
  2. 拆除（[taxonomies]、taxonomy.html/term.html、空页）——属 Contract/配置变更
  3. beiying 补 en 版或明确单语策略
- **推荐/不推荐**：**推荐保留但记录为待决**；不推荐本轮拆除（越界）。
- **尚不能决定**：内容策略是否使用 tags；单语内容策略。

---## 14. Facts

1. 三个 Section（posts/fiction/test）均为空栏目，posts/fiction 无任何 page，test 有 2 篇测试 page。
2. 导航实际显示 posts/fiction；test 隐藏；首页为固定顶级链接。
3. 首页（home.html）只渲染一句话简介，不消费任何列表数据。
4. 无顶层 Page 实例（无 content/*.md 非 _index 文件）。
5. taxonomy（tags）配置/模板/URL 存在但内容零使用；categories 未声明。
6. 双语配对完整（home/posts/fiction/test/hugo-test），beiying 单语且回退 en 首页。
7. 模板层无任何内容类型硬编码；front matter 无 type/layout 字段。
8. Section 无着陆正文（_index.md 只有 front matter）；Section 语义 = 列表容器。
9. 测试内容公开可索引（sitemap 含 /zh/test/* 与 /en/test/hugo-test/）。
10. i18n 42 键全为 UI 文案，无内容文案。

---

## 15. Interpretations

1. **导航语义与内容实际错位**：导航展示的栏目（文章/小说）无内容；全站唯一内容（测试）导航不可见。
2. **栏目 ≠ 内容类型**：三个栏目在机制上是同一种「Section 容器」，差异仅在命名与导航 weight。
3. **首页是纯 Identity 页**：改变内容（除简介）不会影响首页。
4. **测试区是公开的隐藏内容**：导航隐藏但可被索引——「测试」是内容类别与栏目名的混合语义。
5. **fiction 章节模型是意图信号**：仅注释存在，无模板/数据支撑，不可视为冻结 IA。
6. **taxonomy 是未兑现的架构支付**：存在但不服务任何内容。

---

## 16. Decision Candidates（供讨论，非决策）

| # | 候选 | 所属问题 | 影响面 | 依据 |
|---|---|---|---|---|
| C1 | 保持「栏目 = Section 容器」语义，待内容填充 | P0-1 | 无代码改动 | 现状即此 |
| C2 | 不引入 Content Type 机制，Section 即 IA 结构 | P0-2 | 无 | 无差异需求 |
| C3 | 首页保持 Identity Page | P1-1 | 无 | 零内容可聚合 |
| C4 | 测试内容维持公开/隐藏导航现状 | P1-2 | 无 | 机制已足够 |
| C5 | 保留 taxonomy 基础设施待决 | P2-1 | 无 | 零成本 |
| C6 | （若测试内容需不索引）为 test 内容加 noindex/draft | P1-2 | content front matter | 需产品确认 |
| C7 | （若栏目需自我介绍）为 Section 加着陆正文 | P0-1 | section.html + content | 需栏目语义确认 |

> 标注：C6/C7 属于「内容/模板变更」，超出本轮只读边界，仅作为候选列出。

---

## 17. Not Yet Decidable

- 栏目是否有待填充的真实内容计划（P0-1 的前提）。
- 首页最终形态（P1-1，依赖 P0）。
- 测试内容是否应被索引（P1-2）。
- 内容策略是否使用 tags（P2-1）。
- 单语内容（beiying）的长期处理（P2-1）。

---

## 18. IA Risks / Inconsistencies

| # | 类型 | 描述 | 严重度 | 是否当前问题 |
|---|---|---|---|---|
| R1 | 语义错位 | 导航栏目（文章/小说）无内容；唯一内容（测试）不可见 | 中 | 是（事实） |
| R2 | 混合语义 | 「测试」既是栏目名又是内容类别；测试内容公开可索引 | 低-中 | 是（需决策） |
| R3 | 未兑现支付 | taxonomy 基础设施零使用 | 低 | 是（需决策） |
| R4 | 意图与实现脱节 | fiction 注释的章节模型无实现，可能被误读为已有能力 | 低 | 是（文档风险） |
| R5 | 首页零聚合 | 首页不展示任何内容（若未来期望聚合则需新增能力） | 低 | 否（未来可能性） |
| R6 | 单语内容 | beiying 无 en 版，回退 en 首页为当前事实 | 低 | 是（需决策） |

---

## 19. Handoff to IA Decisions

下一阶段（IA Decisions v0.1）需产品所有者回答：

1. 三个栏目是否有待填充的内容计划？（决定 C1 是否成立）
2. 首页是 Identity Page 还是未来的聚合入口？（决定 C3）
3. 测试内容应否被搜索引擎索引？（决定 C4/C6）
4. taxonomy 是未来内容策略的一部分还是应拆除？（决定 C5）
5. beiying 单语内容是否需要 en 版或明确单语策略？（R6）

> 本轮所有候选（C1-C7）与风险（R1-R6）仅作讨论输入，**未冻结任何 IA 决策**。

---

## 20. 关联文档

- docs/content-inventory.md（Content Inventory v0.1 基线）
- docs/navigation-contract.md / component-contract.md / architecture-relationship-map.md
- 本文件（Information Architecture Review v0.1）
