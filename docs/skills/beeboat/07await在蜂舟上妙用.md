# async/await在蜂舟上妙用

:::tip
V4.1.0迭代更新后统一为逻辑事件中的 `实体接口` 增加了return。

增加return后，方便特殊场景下的重写。同时也可以使用async/await

:::


### 业务场景
<br/>
<drawing-bed src="20240407/1.png" alt="20240407/1.png"/>

当前场景中，`保存排序` 按钮的启用禁用状态和表格的拖拽排序结合使用，无法通过设计器拖拽直接实现，那么就需要通过重写 `usage` 中的方法来实现。

### 更新前的代码
```ts
// base
saveClick (_params)  {
    DefaultEntityFieldApi.updateIndexValue(_params)
    .then(_res => {
        ElMessage({
            message: `保存成功`,
            type: `success`,
        })
    })
}

// usage
saveClick(_params: any): void {
    const ids = [], uids = []
    this.getRef('btTableExRef')
        .getTableData()
        .forEach(item => {
            ids.push(item.id)
            uids.push(item.uid)
        })
    // base中生成的代码完全复制过来
    DefaultEntityFieldApi.updateIndexValue({ id: ids, uid: uids }).then((res: any) => {
        ElMessage({
            type: `${res.code === 0 ? 'success' : 'error'}`,
            message: res.msg || '保存成功',
        })
        // 按钮的启用禁用状态控制
        this.hasMoved.value = false
        this.getRef('btTableExRef').refresh()
    })
}
```
:::warning
当前重写方案有一个弊端：当保存方法`saveClick`调用的接口发生变化时（在设计器中修改了保存方法），并不会在功能上体现，因为`usage`中重写的方法并没有手动更改，是之前从base中复制过来的，那就意味着需要手动再次将base中的方法复制过来。
:::

### 更新后的代码

```ts
// base
saveClick (_params)  {
    // 迭代更新后，为实体接口添加了return
    return DefaultEntityFieldApi.updateIndexValue(_params)
    .then(_res => {
        ElMessage({
            message: `保存成功`,
            type: `success`,
        })
        nextTick(()=>{
            this.getRef('btTableExRef')?.refresh()
                        })
    })
}

// usage
async saveClick(_params: any) {
    const uids = []
    this.getRef('btTableExRef')
        .getTableData()
        .forEach(item => {
            uids.push(item.uid)
        })
    await super.saveClick({ uid: uids })
    this.hasMoved.value = false
}
```
::: tip
更新迭代后usage的重写方式略有变化，由于base中`return`了实体接口，那么在usage中可以充分利用返回的Promise。

在当前场景下，需要等待保存操作结束后，再去决定按钮的启用禁用（因为保存结果不一定全都是成功）
:::

### 回顾一下

[ES6的async函数](https://es6.ruanyifeng.com/#docs/async)