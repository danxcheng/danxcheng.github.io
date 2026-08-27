+++
# Hugo 渲染测试文档：验证主题对各类 Markdown 元素和内置短代码的渲染。
title = 'Hugo 渲染测试'
date = '2026-08-25T13:00:00+08:00'
description = '覆盖标题、列表、表格、代码块、引用、脚注与内置短代码的渲染测试。'
images = []

+++

<!-- 说明：本文用于逐项检查主题渲染。看每项在页面上是否正常即可。
     目录（TOC）在正文上方折叠，点开可见本文所有标题。 -->

## 标题层级

这里测试 h2–h6 的渲染（h1 留给文章标题，正文一般不用）。

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

## 段落与行内样式

普通段落。**粗体**、*斜体*、~~删除线~~、`行内代码`，以及[外部链接](https://gohugo.io/)和[内部链接](/zh/test/beiying/)  <!-- beiying 只有中文版，直接指向 /zh/ 下实际路径 -->。行内样式可以**混用 *斜体* 和 `代码`**。

## 引用

> 单层引用。
>
> > 嵌套引用。
> > 第二行内容。

## 列表

无序列表：

- 苹果
- 香蕉
  - 嵌套子项
  - 再一层
- 橘子

有序列表：

1. 第一步
2. 第二步
   1. 子步骤 A
   2. 子步骤 B
3. 第三步

任务列表（Goldmark 扩展）：

- [x] 已完成的项
- [ ] 未完成的项

## 代码块

行内代码：`print("hello")`。

围栏代码块（带语言标注，用于语法高亮）：

```go
package main

import "fmt"

func main() {
	fmt.Println("Hello, Hugo")
}
```

无语言标注的代码块：

```
$ hugo server -D
Web Server is available at http://localhost:1313/
```

用 highlight 短代码包裹代码块：

{{< highlight python >}}
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)
{{< /highlight >}}

## 表格

| 功能 | 默认开启 | 说明 |
| --- | --- | --- |
| strikethrough | 是 | 删除线 |
| table | 是 | GFM 表格 |
| 脚注 | 是 | 见文末[^1] |

## 脚注

正文中插入脚注标记[^1]，文末自动生成注释区。也可以同时用两个[^2]。

[^1]: 这是第一条脚注的内容。
[^2]: 第二条脚注，验证多条脚注的编号。

## 短代码

### details（可折叠块）

{{< details summary="点击展开详情" >}}
这里是 details 短代码的内容，用来测试折叠块渲染。
{{< /details >}}

### figure（带标题的图片）

{{< figure src="/images/placeholder.jpg" alt="占位图：wallhaven 8g97zj" caption="图 1：figure 短代码（占位图，来自 wallhaven）" >}}

## 水平线

上面是各种块元素，下面是水平线：

---

## 中文排版观察点

检查中文正文的行高、段距、字距是否舒适；长段落滚动时侧边栏是否在顶部呼吸位停住。