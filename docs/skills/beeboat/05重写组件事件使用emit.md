# 重写组件事件时使用emit


:::tip
- 在 Vue 3 中，defineEmits 是 Composition API 的一部分，用于在`script setup`标记中声明组件可以触发的事件。这样做可以让 TypeScript 知道哪些事件是可以被触发的，并且提供适当的类型提示
- 
- 在使用`script setup`时，***尽量遵循 Composition API 的范式***，直接使用 defineEmits 来定义和触发事件。
- 
- 如果项目在搭建时使用了`vue-class-component`或者`vue-property-decorator`库，则可以使用`this.$emit`或者`@Emit`(暂无示例代码)
:::

## 功能概述
重写BtTableEx组件的行点击事件时，需要emit出去一个事件。（以及类似场景在class内重写事件，并在事件内进行emit，均可使用当前方案解决）

## 相关代码

#### 错误代码
```ts
// 将Vue页面的写法直接移植到class的写法中
import { ComponentInternalInstance, defineEmits } from 'vue'
import BaseListLedgerContext, * as BTCmpt from '@/bt-views/app/list-ledger/base/index'
export { BTCmpt }

export default class ListLedgerContext extends BaseListLedgerContext {
    constructor(parentPageContext: any, vueInstance?: ComponentInternalInstance, emits: any = []) {
        super(parentPageContext, vueInstance)
        this.emits = emits
        const emits = defineEmits(['handleDetail'])
        this.getBindProps('elButton9371288516', 'btTableEx7224643216').disabled = false
        this.getBindEvents('btTableEx6138924116').rowClick = row => {
            emits('handleDetail', row)
        }
    }
}
// 错误写法
// 在 Vue 3 中，defineEmits 函数用于定义组件内部的自定义事件。这个函数应该在 setup 函数内部使用，
// 并且返回的是一个可以用于触发这些事件的函数。当前代码中，defineEmits 被用在了 class 组件的构造函数内是不可行的。
```

#### 正确代码
```vue
<template src="@/bt-views/app/list-ledger/base/template.html"></template>
<script setup lang="ts">
import { inject, provide, getCurrentInstance } from 'vue'

// 正确写法：由于defineEmits仅能在setup内执行，那就将emits作为参数传入构造内，如下
// ...
const emits = defineEmits(['handleDetail'])
const ctx = new ListLedgerContext(inject('ctx'), getCurrentInstance(), emits)
// ...

provide('ctx', ctx)
defineExpose(ctx.getExpose())
console.log(BTCmpt)
</>
```

```ts
import { ComponentInternalInstance, defineEmits } from 'vue'
import BaseListLedgerContext, * as BTCmpt from '@/bt-views/app/list-ledger/base/index'
export { BTCmpt }

export default class ListLedgerContext extends BaseListLedgerContext {
    emits: any
    // 此时将emits作为入参传入构造器中，也可以举一反三，如有其他需要，也可以这么尝试
    constructor(parentPageContext: any, vueInstance?: ComponentInternalInstance, emits: any = []) {
        super(parentPageContext, vueInstance)
        // 接收emits
        this.emits = emits
        this.getBindProps('elButton9371288516', 'btTableEx7224643216').disabled = false
        this.getBindEvents('btTableEx6138924116').rowClick = row => {
            this.emits('handleDetail', row)
        }
    }
}
```

## 实际效果
    可以达到预期效果，触发emits暴露的方法