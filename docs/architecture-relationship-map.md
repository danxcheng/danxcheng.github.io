# Architecture Relationship Map v0.1

架构关系图：回答「**以后大改一个东西，哪些必须跟着动，哪些完全不用碰**」。
本文件是**架构约定**的一部分，与 Navigation / Component Contract 并列。

> 状态：**已冻结（v0.1）**。本图之后暂停架构重构，进入产品信息架构审查。

---

## 1. 总体关系

```text
                         ┌─────────────────────┐
                         │       Content       │
                         │  content/ + _index  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │        Hugo         │
                         │ Content Model / i18n│
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌────────────────────────────┐
                    │        Page Structure      │
                    │                            │
                    │ baseof                     │
                    │ ├─ head                    │
                    │ ├─ sidebar                 │
                    │ ├─ main                    │
                    │ ├─ rightbar                │
                    │ └─ footer                  │
                    └─────────────┬──────────────┘
                                  │
               ┌──────────────────┼──────────────────┐
               │                  │                  │
               ▼                  ▼                  ▼
        ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
        │ Navigation  │    │   Content   │    │ Components  │
        │             │    │             │    │             │
        │ menu        │    │ home        │    │ background  │
        │ menu-item   │    │ section     │    │ settings    │
        │ lang-switch │    │ single      │    │ music       │
        │             │    │ taxonomy    │    │ copy-code   │
        └─────────────┘    │ term / 404  │    └──────┬──────┘
                           └─────────────┘           │
                                                     │
                                                     ▼
                                          ┌─────────────────────┐
                                          │       Runtime       │
                                          │                     │
                                          │ DOM / JS / CSS      │
                                          │ localStorage        │
                                          │ browser APIs        │
                                          └─────────────────────┘
```

---
## 2. 五层边界

```text
┌──────────────────────────────────────────────┐
│  ① CONTENT                                   │
│                                              │
│  content/                                    │
│  ├─ _index.md                                │
│  ├─ posts/                                   │
│  ├─ fiction/                                 │
│  └─ future: projects / notes / ...           │
│                                              │
│  决定：有什么内容                             │
│  不决定：页面怎么画                           │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  ② TEMPLATE / PAGE STRUCTURE                 │
│                                              │
│  baseof                                      │
│  home / section / single / taxonomy / term   │
│  sidebar / rightbar / footer / head          │
│                                              │
│  决定：页面骨架和内容如何组合                 │
│  不决定：具体组件内部行为                     │
└──────────────────────┬───────────────────────┘
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
┌────────────────────┐  ┌──────────────────────┐
│ ③ NAVIGATION       │  │ ④ COMPONENT          │
│                    │  │                      │
│ menu               │  │ background           │
│ menu-item          │  │ settings-dialog      │
│ lang-switch        │  │ music-player         │
│                    │  │ copy-code            │
│                    │  │                      │
│ 有自己的 Contract  │  │ 有自己的 Contract    │
└────────────────────┘  └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ ⑤ RUNTIME            │
                         │                      │
                         │ DOM                  │
                         │ JS                   │
                         │ CSS                  │
                         │ localStorage         │
                         │ browser APIs         │
                         └──────────────────────┘
```

这里有一个很重要的结论：

**Navigation 和 Component 都不是 Page Structure 的子实现。**
它们是两个相对独立的能力层。

---

## 3. 配置关系

配置不要理解成一个单独的页面层，而是**横向提供数据**：

```text
                    Configuration
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
      hugo.toml        i18n         SiteConfig
          │              │              │
          │              │              ├── koiUrl
          │              │              └── tracks
          │              │
          │              └───────────────┐
          │                              │
          ▼                              ▼
     Hugo Templates                 Component JS
          │                              │
          └──────────────┬───────────────┘
                         ▼
                       Output
```

其中必须保持：

```text
Template
   │
   │ 官方配置通道
   ▼
SiteConfig
   │
   ▼
Component JS
```

而不是：

```text
Component JS
   ├── 偷读模板
   ├── 偷读 hugo.toml
   ├── 硬编码 URL
   └── 自己找配置
```

---## 4. 最重要的「修改影响图」

这部分才是这张图的核心。

### A. 重做首页

```text
修改：
content/_index.md
        +
layouts/home.html
        +
相关首页 CSS

影响：
        ┌───────────────┐
        │     首页      │
        └───────────────┘

不需要动：
❌ Navigation Contract
❌ menu.html
❌ menu-item.html
❌ music-player
❌ settings
❌ background
❌ Component Contract
❌ 其它页面模板
```

**结论：首页可以独立重做。**

---

### B. 重做播放器

```text
music-player.html
       │
       ▼
music-player.js
       │
       ▼
music-* DOM Contract
       │
       ▼
music-state
```

因此：

```text
重做播放器 UI
        │
        ├── music-player.html
        ├── music-player.js
        └── music CSS
        │
        ▼
       DONE
```

不应该影响：

```text
❌ baseof
❌ navigation
❌ home
❌ section
❌ settings.js
❌ background
❌ content model
```

唯一需要注意：

> 如果主动改变 `#music-*` hooks 或 `SiteConfig.tracks` schema，就已经是在修改
> Component Contract，而不只是重做组件内部。

---

## 5. 添加一个栏目

例如以后增加：

```text
content/projects/
├── _index.md
├── project-a.md
└── project-b.md
```

只需要：

```text
projects/_index.md
        │
        │ navigation.show = true
        │ navigation.weight = ...
        ▼
     menu.html
        │
        ▼
    自动出现
```

关系：

```text
Content
  │
  ▼
_index.md
  │
  ├── title
  ├── navigation.show
  └── navigation.weight
  │
  ▼
Navigation
  │
  ▼
Sidebar
```

不需要：

```text
❌ hugo.toml 添加菜单
❌ menu.html 添加栏目名
❌ sidebar 修改
❌ baseof 修改
❌ 新建模板
```

这正是现在 Navigation Contract 最有价值的地方。

---

## 6. 添加一个普通页面

例如：

```text
content/about.md
```

如果：

```yaml
navigation:
  show: true
```

当前 v0.1 的行为是：

```text
about.md
   │
   ▼
顶层 Page
   │
   ▼
进入「栏目」
   │
   ▼
nav-children
```

因此：

```text
首页
栏目
 ├─ 文章
 ├─ 小说
 ├─ 项目
 └─ 关于
```

这里再次体现 **Navigation Contract v0.1 的规则 A**：

> 顶层 Page 当前属于「栏目」分组，而不是顶级导航链接。

---## 7. 添加一个组件

例如未来想加：

```text
snow-effect
```

### 不进入设置

```text
baseof
  │
  └── partial snow-effect
           │
           ├── snow-effect.js
           └── snow-effect.css
```

影响非常小：

```text
baseof
   +
component files
```

### 进入设置面板

当前架构：

```text
                Snow Component
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     background   settings-dialog  settings.js
                                    │
                                    ▼
                               settings.css
```

也就是当前冻结的：

**4 处接线成本。**

这不是缺陷，而是当前 v0.1 有意接受的架构成本。

---

## 8. 删除一个组件

例如删除音乐播放器：

```text
music-player.html
music-player.js
music CSS
      │
      ▼
   删除组件
```

如果它没有进入设置系统，影响非常局部。

如果进入设置：

```text
music-player
     │
     ├── component partial
     ├── component JS
     ├── settings-dialog
     ├── settings.js
     └── settings CSS
```

反向拆除即可。

---

## 9. 重做导航

导航是另外一条独立链：

```text
Content
   │
   ▼
navigation front matter
   │
   ▼
menu.html
   │
   ▼
menu-item.html
   │
   ▼
sidebar
```

因此：

**重做导航视觉/交互**

可以限制在：

```text
menu.html
menu-item.html
sidebar.css / navigation CSS
```

而不应该影响：

```text
❌ home
❌ section
❌ single
❌ music
❌ settings
❌ background
```

如果改变的是导航数据规则，比如：

```text
navigation.group
navigation.type
navigation.parent
```

那才属于：

> Navigation Contract 新版本。

---

## 10. 页面模板和组件的关系

这个边界尤其重要：

```text
                Page
                 │
        ┌────────┴────────┐
        │                 │
     Structure         Component
        │                 │
        │                 ├── Music
        │                 ├── Settings
        │                 ├── Background
        │                 └── Copy Code
        │
        ├── Home
        ├── Section
        ├── Single
        ├── Taxonomy
        ├── Term
        └── 404
```

所以不要出现这种结构：

```text
home.html
   └── music-player special logic ❌

single.html
   └── settings special logic ❌

section.html
   └── background special logic ❌
```

组件应该由公共编排层加载。

---## 11. Contract 层级关系

目前可以正式形成：

```text
                 Architecture Map
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
 Navigation        Template      Component
 Contract           Architecture Contract
    v0.1                v0.1        v0.1
```

具体：

```text
docs/
├── navigation-contract.md
├── component-contract.md
└── architecture-relationship-map.md   ← 本文
```

三者职责不同：

| 文档 | 回答的问题 |
|---|---|
| Navigation Contract | **导航应该怎么工作？** |
| Template Architecture | **页面应该怎么组合？** |
| Component Contract | **组件应该如何存在和通信？** |
| Relationship Map | **改一个东西会影响什么？** |

---

## 12. 最终判断规则

以后你要加东西的时候，不需要先问：

> 「我要改哪个文件？」

先问：

> **「这是 Content、Page Structure、Navigation、Component，还是 Configuration？」**

然后沿着关系图走。

例如：

```text
我要加 Projects
      ↓
Content
      ↓
Navigation Contract
      ↓
_index.md
      ↓
DONE
```

```text
我要重做播放器
      ↓
Component
      ↓
music-player
      ↓
html + js + css
      ↓
DONE
```

```text
我要完全重做首页
      ↓
Page Structure
      ↓
home.html + 首页相关样式
      ↓
DONE
```

```text
我要加一个雪花效果
      ↓
Component
      ↓
snow partial + js + css
      ↓
baseof 加一个入口
      ↓
DONE
```

```text
我要让组件可以动态注册
      ↓
Component Architecture
      ↓
修改 Component Contract
      ↓
⚠️ 这不是普通功能开发
```

---

## 13. 现在的架构状态

当前状态定性为：

```text
                    ┌──────────────┐
                    │   Content    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │     Hugo     │
                    └──────┬───────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
      ┌──────────────┐            ┌──────────────┐
      │     Page     │            │ Navigation   │
      │  Structure   │            │  Contract    │
      └──────┬───────┘            └──────────────┘
             │
             ▼
      ┌──────────────┐
      │  Components  │
      │   Contract   │
      └──────┬───────┘
             │
             ▼
      ┌──────────────┐
      │   Runtime    │
      └──────────────┘
```

**目前不需要再继续抽象。**

尤其不要现在去做：

- Component Registry
- Plugin System
- Dynamic Component Loader
- Template Builder
- Navigation Builder
- 通用配置框架

这些东西现在都属于**为了未来可能性提前支付架构成本**。

你现在真正需要建立的是：

> **稳定的边界，而不是更多的抽象。**

所以这张 Architecture Relationship Map v0.1 之后，建议**暂时停止架构重构**，
进入下一阶段：**真正审查产品的信息架构 / 页面信息层级 / 首页应该承载什么**。

因为现在「怎么组织代码」已经基本站稳了，下一步应该回答的是：

> **「这个网站到底应该呈现什么？」**
