# 如何在Vue文件中监听class类中定义的变量

> 当前案例的代码环境是基于蜂舟平台生成代码。
>
> [最小化demo代码](https://gitee.com/yuuuuuyu/bugs-resources/tree/develop/src/views/class)


## 功能目录
```markdown
inner-edit-demo/
├── base/
│   ├── index.scss
│   └── index.ts
│   └── template.html
└── index.scss
└── index.ts
└── index.vue
```

## 问题描述

在 `inner-edit-demo` 目录下的 `index.vue` 文件中监听不到 `index.ts` 或者 `base/index.ts` 中定义的变量

## 问题原因

在 `JavaScript ES6` 中，当你使用 `class` 关键字来定义类并在其中定义方法时，这些方法的 `this` 上下文默认绑定到实例对象。如果你在某些没有自动绑定 `this` 的场景下（比如事件处理器或者异步回调中）调用这些方法，`this` 的值可能会丢失，导致它变成 `undefined。`

在 `Vue.js` 中，这个问题往往出现在方法作为回调函数传递时，因为默认情况下，事件监听器和异步调用不会保持原始的 this 上下文

***所以这个问题可以归到 `this` 指向问题！***

## 问题还原

既然已经知道问题出在 `this` 指向，就处理 `this` 

```ts
// base的index.ts
export default class BaseInnerEditDemoContext extends BtPageContext {
    /**
     * 页面数据对象
     */
    public state
    constructor(parentPageContext: any, vueInstance?: ComponentInternalInstance) {
        super(parentPageContext, vueInstance)
        this.regComponentContext(
            'btTableEx1725207717Ref',
            new BtPageContext(parentPageContext, vueInstance),
        )
        this.state = reactive({
            elSelect6073523217: null,
            btTableEx1725207717: {},
        })
        // 其他代码
    }
    btTableEx1725207717RowClick(row) {
        console.log(`${JSON.stringify(row)}`)
    }   
}
```

```ts
// usage的index.ts
export default class InnerEditDemoContext extends BaseInnerEditDemoContext {
    // 当前类中自己的变量
    public params = ref(0)
    constructor(parentPageContext: any, vueInstance?: ComponentInternalInstance) {
        super(parentPageContext, vueInstance)
    }

    // 继承了base中的类，同时重写了btTableEx1725207717RowClick方法
    btTableEx1725207717RowClick(row) {
        this.params.value = 333
        // 继承了base中的state变量
        this.state.elSelect6073523217 = 1
    }
}
```

```vue
<template src="@/bt-views/app/inner-edit-demo/base/template.html" />
<script setup lang="ts">
import { inject, provide, getCurrentInstance, watch } from 'vue'
import InnerEditDemoContext, { BTCmpt } from './index'
import { computed } from 'vue'

// 实例化
const ctx = new InnerEditDemoContext(inject('ctx'), getCurrentInstance())

watch(
    () => ctx.params,
    val => {
        console.log(val.value, '=======')
    },
    {
        immediate: true,
        deep: true,
    },
)

const a = computed(() => {
    console.log(ctx.state.elSelect6073523217)
    return `计算属性变化了： ${ctx.state.elSelect6073523217}`
})

// 验证computed是否有效
watch(
    () => a,
    val => {
        console.log(val)
    },
    {
        immediate: true,
        deep: true,
    },
)

provide('ctx', ctx)
defineExpose(ctx.getExpose())
</script>
```

:::tip
以上代码为基于蜂舟平台生成的功能最小化的实例代码。

同时还原了无法在 `inner-edit-demo/index.vue` 中使用 `watch` 和 `computed` 。

报错信息如下
```bash
Uncaught TypeError: Cannot read properties of undefined (reading 'state')
```
:::

## 实现方式

```ts
// usage的index.ts!!!!!!!! 不要修改base中的index.ts
export default class InnerEditDemoContext extends BaseInnerEditDemoContext {
    // 当前类中自己的变量
    public params = ref(0)
    constructor(parentPageContext: any, vueInstance?: ComponentInternalInstance) {
        super(parentPageContext, vueInstance)

        // !!!!!!!!!!!!!
        // 第一种：在构造器中重新绑定this
        this.btTableEx1725207717RowClick = this.btTableEx1725207717RowClick.bind(this)

    }

    // 当前方法声明是有蜂舟生成的代码
    // 逻辑事件统一生成
    // 结合当前方法，解决方式就是第一种
    // 因为该方法通过按钮触发，也就是`事件处理器`，会丢失this
    btTableEx1725207717RowClick(row) {
        this.params.value = 333
        this.state.elSelect6073523217 = 1
    }


    // 使用箭头函数声明方法，就不需要在构造器内使用bind重新指向this
    // !!!!!!!!!!!!!!
    // 利用箭头函数的特性：
    // 没有自己的 this 绑定。在声明时会捕获其所在上下文的 this 值，并且这个值在箭头函数的生命周期内保持不变。
    // 在箭头函数内部使用 this 时，实际上是引用的是箭头函数声明时作用域中的 this。常用于回调函数和方法中，以确保 this 的值与期望的对象保持一致，而不是调用时的上下文。
    // !!!!!!!!!!!!!!!
    btTableEx1725207717RowClickByArrowFunction = row => {
        this.params.value = 333
        this.state.elSelect6073523217 = 1
    }
}
```

通过以上两种形式可以解决在`index.vue`中监听不到定义的变量的问题。本质就是`箭头函数`和`this指向`。