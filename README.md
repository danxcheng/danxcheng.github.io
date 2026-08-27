# Danxcheng 的个人站点

两色（米白 + 墨黑 + 朱砂）极简个人站，用 [Hugo](https://gohugo.io/) 构建，部署在 GitHub Pages。

在线地址：<https://danxcheng.github.io/>

## 特性

- **双语文档**：中文（/zh/）与英文（/en/），导航/日期/设置弹窗全部走 i18n
- **两色纸感主题**：米白暖底 + 墨黑正文 + 朱砂强调，深色模式跟随系统或手动切换
- **三栏网格**：左导航 / 正文（绝对居中）/ 右日期，首行对齐由 CSS 变量 `calc()` 派生
- **组件设置系统**：右栏"⚙ 组件"弹窗可开关/调节背景组件：
  - 粒子（点线连线背景）
  - 锦鲤（boids 算法，游动鱼群）
  - 纸噪点（SVG feTurbulence 颗粒）
  - 主题（浅 / 深 / 自动）
  - 设置存 localStorage；尊重 `prefers-reduced-motion`（首次访问默认关闭动画）
- **看板娘**：Live2D 仙狐（moc3），桌面端空闲时延迟加载，资源全部自托管
- **音乐播放器**：左下悬浮，播放欢乐颂（公有领域录音），进度跨页保留
- **性能**：图片懒加载、字体/脚本按需加载、资源指纹缓存

## 技术栈

| 组件 | 说明 |
|---|---|
| Hugo 0.165.0 | 静态站点生成器（extended 版，含 esbuild CSS 管线） |
| GitHub Pages + Actions | `.github/workflows/hugo.yaml` 自动构建部署 |
| 原生 JS | 全部组件手写，**零外部依赖**（无 CDN、无 npm 包） |
| 公有领域素材 | 欢乐颂录音来自 Wikimedia Commons |

## 本地开发

```bash
# 安装 Hugo extended（≥0.158，用到新版多语言键）
hugo version

# 本地预览（--disableFastRender 可避免改模板时 Fast Render 模式的偶发 404）
hugo server --disableFastRender
# 打开 http://localhost:1313/zh/
```

构建：

```bash
hugo --minify --gc --cleanDestinationDir
# 产物在 public/，--cleanDestinationDir 避免残留旧指纹文件
```

## 目录结构

```
.
├── assets/
│   ├── css/                  # 样式（按职责拆分，入口 main.css 引入）
│   │   ├── tokens.css        # 设计变量（颜色/字号/间距，改一处全站联动）
│   │   ├── base.css          # 基础：字体、纸噪点层、focus、::selection
│   │   ├── layout.css        # 三栏网格 + 侧栏 + 标题 + 语言切换
│   │   ├── prose.css         # 正文排版（标题/段落/代码/引用）
│   │   ├── content.css       # 文章列表/目录/分页/页脚
│   │   ├── settings.css      # 设置弹窗 + 音乐播放器等浮层
│   │   ├── background.css    # 粒子/锦鲤画布
│   │   └── responsive.css    # 断点（<768 移动 / 768-1023 平板 / ≥1024 桌面）
│   ├── fonts/                # Archivo 自托管字体（woff2 + 指纹）
│   └── background/           # koi-pond.js（锦鲤引擎，走资源管线加指纹）
├── layouts/
│   ├── baseof.html           # 网格骨架 + 背景容器 + 设置弹窗 + 音乐播放器
│   ├── home/section/single/taxonomy/term/404.html
│   └── partials/             # head/sidebar/menu/post-list/toc 等
├── content/                  # 文章（_index.md 双语首页，test/ 为测试文章）
├── static/
│   ├── audio/                # 欢乐颂 mp3 + ogg（公有领域）
│   ├── background/particles.js
│   ├── js/settings.js        # 设置系统（localStorage + 组件重建）
│   ├── js/music-player.js    # 播放器逻辑
│   └── live2d/               # 看板娘（Cubism Core + SDK + 仙狐模型，自托管）
├── i18n/                     # zh.toml / en.toml 界面文案
├── hugo.toml                 # 全部站点配置（多语言/菜单/参数）
└── .github/workflows/hugo.yaml
```

## 部署

推送到 `main` 分支即自动部署（GitHub Actions）：

- 前提：仓库 Settings → Pages → Source 选择 **GitHub Actions**（一次性设置）
- 工作流：checkout → 安装 Hugo 0.165.0 → 构建（`--minify --gc --cleanDestinationDir`）→ 上传 artifact → deploy-pages

## 自定义

### 配色 / 字号 / 间距

改 `assets/css/tokens.css` 一个文件即可：颜色（--bg/--text/--link…）、网格（--grid-side/--grid-content）、标题节奏（--title-size/--title-gap）都是变量，三栏对齐关系由 `calc()` 自动派生，无需逐个改布局。

### 界面文案

改 `i18n/zh.toml` / `i18n/en.toml`，模板里用 `{{ i18n "键名" }}` 引用。

### 音乐播放器

- 换曲：替换 `static/audio/` 下的文件，改 `layouts/baseof.html` 里的 `<source>` 与标题（i18n 键 `music_title`）
- 进度保留逻辑在 `static/js/music-player.js`

### 看板娘换模型

`static/live2d/model/<名字>/` 放 `model3.json + .moc3 + 纹理`（只支持 Cubism 3 / moc3 新格式），在 `model_list.json` 里填目录名。

### 背景组件参数

粒子数量/速度、锦鲤数量/透明度、噪点强度的默认值在 `static/js/settings.js` 顶部 `DEFAULTS` 里。

## 版权

- 欢乐颂录音：公有领域（Wikimedia Commons）
- 看板娘模型：仙狐（Eikanya 模型库，个人使用）
- 其余代码与设计：本人原创，可自由参考
