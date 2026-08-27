# Component Contract v0.1

组件架构契约，基于 **Component Architecture Review v0.1**（只审不改的结论）。
本文件是**架构约定**；各 partial / JS / CSS 是实现。实现重构时，契约不随之消失。

> 状态：**已冻结（v0.1）**。冻结范围只含下面列出的架构边界与契约；
> 组件的内部实现可以自由重做。

---

## 0. 五类约定的区分

本契约把约定分成五类，重要度递减：

| 类别 | 性质 | 可改性 |
|---|---|---|
| **Architecture Boundary** | 分层与依赖方向，长期稳定 | 冻结，变更需 v0.2 评审 |
| **Configuration Contract** | SiteConfig 等官方配置通道 | 冻结，变更需双端同步 |
| **Runtime Contract** | 组件运行时的行为约束 | 冻结，变更需评审 |
| **DOM Hook（实现契约）** | 当前实现的 id / data-* / class | 生命周期内稳定，可随实现重做而演进 |
| **Persistence Contract** | localStorage schema 兼容 | 冻结，写读必须兼容旧值 |

---

## 1. Architecture Boundary

分层与依赖方向（**单向**，禁止反向/横向）：

```
Content / Front Matter
        ↓
Hugo Page Model
        ↓
Page Structure + Navigation + Configuration
        ↓
Components
        ↓
Runtime Behavior (JS)
```

具体分层：

- **Page Structure**：baseof / home / section / single / taxonomy / term / 404 / head / sidebar / footer
- **Navigation**：menu / menu-item / lang-switch（契约见 docs/navigation-contract.md）
- **Component**：background / settings-dialog / music-player / copy-code
- **Configuration**：hugo.toml / site-config.html（SiteConfig）/ i18n / localStorage

**依赖方向规则**：

- 组件可以依赖 Configuration（SiteConfig / i18n / 自己的 localStorage）。
- 组件可以依赖 Page Structure 提供的容器 DOM（通过 DOM Hook）。
- **组件之间禁止直接依赖**：一个组件不得读取另一个组件的内部状态、
  不得调用另一个组件的函数、不得订阅另一个组件的事件。
- 唯一的例外：**settings.js 是设置面板的编排者**，它编排的是引擎
  （particles / koi / grain），而不是其它组件 UI。

## 2. Configuration Contract

- **`window.SiteConfig` 是「模板 → JS」的唯一官方配置通道**，由
  `site-config.html` 注入（当前含 `koiUrl` 与 `tracks`）。
- 组件 JS 不得绕过 SiteConfig 直接读模板 / 硬编码 URL / 重复维护配置。
- i18n 是界面文案的官方通道（组件文案一律走 i18n 键，不硬编码）。
- `hugo.toml` 只承载站点级配置（语言 / params），不承载组件配置。

## 3. Runtime Contract

- **设置系统采用显式接线，不是注册框架**：每个进设置面板的组件由
  `settings.js` 显式编排（开关 / 参数 / 重建 / 销毁），成本固定为：
  `background.html`（容器）+ `settings-dialog.html`（开关行 + 参数视图）
  + `settings.js`（DEFAULTS + handler + rebuild）+ `settings.css`（样式）
  四处接线。这是 v0.1 的**已知固定成本**，冻结为事实，不假装零成本，
  也不为此发明 Component Registry（见「明确不做」）。
- 不进设置面板的组件（如 copy-code）：只需 baseof 一行 partial 编排 +
  组件自己的 partial / JS / CSS，近乎零耦合。
- 尊重 `prefers-reduced-motion`：动画类组件首次访问默认关闭。
- 组件内部实现（HTML 结构、算法、引擎版本）**可以自由重做**，
  前提是不破坏下方 DOM Hook 与 Persistence Contract。

## 4. DOM Hook（当前实现契约）

> 说明：DOM id / data-* 是**当前实现的接口**，不是产品设计原则。
> 在 Contract v0.1 生命周期内，外部依赖的 hook 不随意改；
> 若组件换成 Web Component / 事件驱动等实现，hook 可随实现演进。

当前外部依赖的 hook：

- `#pond` / `#particles-js`：背景引擎容器（settings.js 启动/重建）
- `#settings-dialog` / `#settings-fab` / `.settings-entry[data-open-settings]`：设置入口与弹窗
- `data-toggle` / `data-detail` / `data-range` / `data-num` / `data-action` / `data-reset`：
  设置面板的控件契约（值：particles / koi / grain / theme / close / back / reset-all）
- `.settings-panel[data-view]` + `.settings-view`：弹窗视图切换（CSS 驱动）
- `#music-audio / #music-player / #music-toggle / #music-prev / #music-next /
  #music-shuffle / #music-title / #music-track / #music-fill`：播放器 DOM 契约
- `.highlight > pre`：代码块复制按钮（copy-code.js）
- `body.no-grain` + `--grain-opacity`、`html[data-theme]`：CSS 变量契约

## 5. Persistence Contract

- `localStorage['siteSettings']`：设置面板的开关与参数（particles / koi / grain / theme）。
- `localStorage['music-state']`：播放器状态（当前曲目索引 / 进度 / 随机开关）。
- **读写必须兼容旧值**：读取时校验结构，损坏值回退默认；新增字段不得破坏已存值。
- schema 变更需保留迁移路径（读取旧格式并正常回退）。

---

## 6. 明确不做的（v0.1 冻结范围外）

- 不发明 Component Registry / Builder / Service 抽象。
- 不把组件数从 4 个硬性扩张——新增组件走第 3 节的接线成本。
- 不把 DOM id 提升为永久产品接口（见第 4 节说明）。
- 不做「组件可插拔 / 动态注册」——那是 v0.2 的候选，不是现在的需求。

## 7. 增 / 删 / 重做成本（事实清单）

| 动作 | 受影响文件 | 说明 |
|---|---|---|
| 新增组件（不进设置） | baseof 1 行 + 组件自己的文件 | 近零耦合（copy-code 示范） |
| 新增组件（进设置） | background + settings-dialog + settings.js + settings.css 共 4 处 | v0.1 固定接线成本 |
| 删除组件 | 反向 4 处（进设置）或 3 处（不进设置） | 需同时清理 JS 分支 |
| 重做组件内部 | 仅该组件自己的 partial + JS + CSS 段 | baseof / settings.js / 其它组件不受影响 |
| 重做组件且换 hook | 需同步更新依赖方（settings.js 等） | 允许，但要评审 |

---

## 8. 关联文档

- docs/navigation-contract.md（Navigation Contract v0.1）
- 本文件（Component Contract v0.1）
