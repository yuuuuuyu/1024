# 解决火狐（版本大于107）兼容性问题

:::tip
两种解决方案

1. 代理 instanceof Element 方法
2. 使用 [micro-zoe-micro-app-v1.0.0-rc.4.tgz](https://github.com/micro-zoe/micro-app/files/14321418/micro-zoe-micro-app-v1.0.0-rc.4.tgz) !!!未验证
:::

### 场景

1. Firefox 版本110.0
2. 使用microapp
3. 功能内使用了popover无效
   
<drawing-bed src="20240428/1.png" alt="20240428/1.png"/>

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