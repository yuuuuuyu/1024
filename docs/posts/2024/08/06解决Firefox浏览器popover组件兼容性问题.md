---
title: 解决火狐（版本大于107）兼容性问题
date: 2024-08-29
tags: 
  - 兼容性问题
  - FireFox
  - ElementPlus
---
# 解决火狐（版本大于107）兼容性问题

> ✨文章摘要（AI生成）

<!-- DESC SEP -->
在使用Firefox 110.0版本和microapp时，功能内使用的popover无效。为了解决这一兼容性问题，有两种解决方案：

代理 instanceof Element 方法，通过手动监测元素是否为DOM元素来修复兼容性问题。
使用 micro-zoe-micro-app-v1.0.0-rc.4.tgz（未验证）。
具体实现方法包括在代码中通过代理 instanceof Element 方法，重写元素的判断逻辑。这种方式可以确保在Firefox的特定版本中，元素的识别和操作不会出现问题，从而解决兼容性问题。

通过这种方式，可以保证在使用Firefox浏览器时，相关功能正常运行，不受浏览器版本更新的影响。
<!-- DESC SEP -->

:::tip
两种解决方案
1. 代理 instanceof Element 方法
2. 使用 [micro-zoe-micro-app-v1.0.0-rc.4.tgz](https://github.com/micro-zoe/micro-app/files/14321418/micro-zoe-micro-app-v1.0.0-rc.4.tgz) !!!未验证
:::

### 场景

1. Firefox 版本110.0
2. 使用microapp
3. 功能内使用了popover无效
   
![](https://ebugs.l2.ttut.cc/drawing-bed/20240428/1.png)

### 解决方案

在`main.ts`内加入以下代码：

```js
/**
 * 解决火狐（版本大于107）兼容性问题
 * 代理 instanceof Element 方法， 手动监测 element 是否是 dom 元素
 * */
if (
    navigator.userAgent.indexOf('Firefox') > -1 &&
    +navigator.userAgent.match(/Firefox\/([\d.]+)/)![1] > 107
) {
    Object.defineProperty(Element, Symbol.hasInstance, {
        value: function (node: any) {
            if (typeof node !== 'object' || !node) return false
            node = node.__proto__
            while (node) {
                // 重写 instanceof 判断逻辑
                if (Object.prototype.toString.call(node) === this.prototype.toString()) return true
                node = node.__proto__
            }
            return false
        },
    })
}

```