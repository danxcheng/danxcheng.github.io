+++
# English version of the Hugo rendering test. Same basename as the Chinese
# one (hugo-test.md) -> the two pages link as translations.
title = 'Hugo Rendering Test'
date = '2026-08-25T13:00:00+08:00'
description = 'Rendering test covering headings, lists, tables, code blocks, quotes, footnotes, and built-in shortcodes.'
images = []

+++

<!-- This page is for checking theme rendering item by item. The collapsible
     TOC above lists every heading in this article. -->

## Heading levels

Testing h2-h6 (h1 is reserved for the article title).

### Heading three

#### Heading four

##### Heading five

###### Heading six

## Paragraphs and inline styles

Plain paragraph with **bold**, *italic*, ~~strikethrough~~, `inline code`, an [external link](https://gohugo.io/) and an [internal link](/zh/posts/beiying/). Inline styles can be **mixed with *italic* and `code`**.

## Blockquotes

> Single-level quote.
>
> > Nested quote.
> > Second line.

## Lists

Unordered:

- Apple
- Banana
  - Nested item
  - One more level
- Orange

Ordered:

1. First step
2. Second step
   1. Sub step A
   2. Sub step B
3. Third step

Task list (Goldmark extension):

- [x] Done item
- [ ] Undone item

## Code blocks

Inline code: `print("hello")`.

Fenced code block with language (syntax highlighting):

```go
package main

import "fmt"

func main() {
	fmt.Println("Hello, Hugo")
}
```

Fenced block without language:

```
$ hugo server -D
Web Server is available at http://localhost:1313/
```

Wrapped with the highlight shortcode:

{{< highlight python >}}
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)
{{< /highlight >}}

## Table

| Feature | On by default | Note |
| --- | --- | --- |
| strikethrough | yes | ~~text~~ |
| table | yes | GFM tables |
| footnotes | yes | see below[^1] |

## Footnotes

Inline footnote marker[^1], with a second one[^2] to check numbering.

[^1]: Content of the first footnote.
[^2]: Second footnote.

## Shortcodes

### details (collapsible)

{{< details summary="Click to expand" >}}
Content of the details shortcode.
{{< /details >}}

### figure (image with caption)

{{< figure src="/images/placeholder.jpg" alt="Placeholder from wallhaven 8g97zj" caption="Fig. 1: figure shortcode with a placeholder image" >}}

## Horizontal rule

Above are the block elements, below is the rule:

---

## Chinese typography notes

This English page also validates that mixed CJK/Latin line height and spacing stay comfortable.
