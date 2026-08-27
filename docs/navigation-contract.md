# Navigation Contract v0.1

导航架构契约。本文件是**架构约定**；`layouts/partials/menu.html` 只是实现。
menu.html 重构时，本契约不随之消失。

> 状态：**已冻结（v0.1）**。在此版本中，新增栏目只修改 Content，不再触碰
> `hugo.toml` 或导航模板。

---

## Data Source

Content Tree 是唯一事实来源（Source of Truth）。

- 不再读取 `site.Menus` / `hugo.toml` 中的菜单定义。
- 导航节点 = 内容树中的顶层 Section（`_index.md`）与顶层 Regular Page（`content/xxx.md`）。

## Discovery

- 顶层 Section：`site.Sections` 自动遍历。
- 顶层 Regular Page：`site.RegularPages` 中 `.Parent.IsHome` 为真的页面。
- 子 Section / 嵌套页面不属于 v0.1 的导航发现范围（两级限制）。

## Visibility

- 显式 `navigation.show = true` 才进入导航。
- **未声明 `navigation` 的 Section / Page 默认隐藏**（发布意图必须显式表达）。
- 无效节点（无 URL 等）不进入最终导航树。

## Grouping

- v0.1 只有一个固定的「栏目 / Sections」分组（UI 文案走 i18n）。
- **v0.1 不存在 `navigation.group` 字段**：多分组尚未实现，字段已从 schema 删除。
- 等真正需要第二个分组时再引入 `navigation.group`，届时本契约升级 v0.2。

## Ordering

- 同一层级按 `navigation.weight` 升序排列。
- 未指定 `weight` 时取 999（排在最后）。

## Localization

- 节点显示名 = 当前语言的 `Page.Title`（`content/posts/_index.md` = 文章，
  `_index.en.md` = Posts），不重复维护中英文名。
- i18n 仅用于固定文案：首页、栏目分组名、播放器曲目名等。

## Active State

- 当前页判定（不依赖 Hugo Menu 的 IsMenuCurrent / HasMenuCurrent）：
  1. `RelPermalink` 精确匹配 → 节点高亮；
  2. 页面是某 Section 的 `IsDescendant` → 该节点高亮且分组展开（`details[open]`）。

## DOM

- 保留既有 DOM 契约：`nav-menu / nav-group / nav-group-details / nav-group-title /
  nav-children / nav-item(.active) / nav-dot`，当前项带 `aria-current="page"`。
- `layouts/partials/menu-item.html` 为渲染叶子节点的小部件，签名 `(Name, URL, active)`。

## Top-level Page

- v0.1 中顶层 Page 与顶层 Section **统一进入「栏目」分组**渲染（不区分顶级链接）。
- 若未来需要"关于"等作为顶级链接，需在 menu.html 按节点类型分流，属 v0.2。

## Future Extension

- 新增栏目 = 新建 `content/<name>/_index.md` + `[navigation] show = true`。
- 不为此提前设计 Navigation CMS；`show / weight` 两个字段就是完整 schema。

---

## Front Matter Schema（v0.1 完整）

```toml
+++
title = '栏目名'

[navigation]
  show = true
  weight = 10
+++
```
