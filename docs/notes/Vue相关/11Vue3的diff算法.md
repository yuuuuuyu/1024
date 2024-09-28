# Vue3的快速Diff算法

:::tip
vue3的diff算法也可以叫快速diff算法，基于**同级/同类型**进行diff后再进行patch
::: 


### 几个核心概念
<br/>

#### **1.静态标记（PatchFlag）**
   - 在Vue 3中，编译器会为模板中的每个元素和组件添加一个PatchFlag。这个标记指示了元素或组件的哪些部分是动态的，例如文本、属性、类名等。
   - 源码中，PatchFlag是在`packages/compiler-core/src/ast.ts`中定义的枚举类型，用于标记元素的动态部分。
   - 例如，如果一个元素只有文本是动态的，那么它将有一个`TEXT`类型的PatchFlag。

#### **2.动态数组（Dynamic Children）**
   - 在Vue 3中，只有带有PatchFlag的元素会被视为动态元素，并在diff过程中进行比较。
   - 源码中，`packages/runtime-core/src/renderer.ts`中的`patch`函数会检查元素是否有PatchFlag，如果有，则只对这些动态部分进行diff比较。
   - 这种方法减少了需要比较的元素数量，从而提高了性能。

#### **3.双端比较（Two-end Diff）**
   - Vue 3的diff算法采用了双端比较的策略，即同时从新旧节点的两端开始比较，以快速找到需要移动或删除的节点。
   - 源码中，`packages/runtime-core/src/renderer.ts`中的`patchKeyedChildren`函数实现了这一逻辑。
   - 该函数首先尝试从两端匹配节点，然后使用一个while循环来处理中间部分的节点。

#### **4.最长递增子序列（Longest Increasing Subsequence）**
   - 当需要移动节点时，Vue 3使用最长递增子序列算法来确定最少的移动次数。
   - 源码中，`packages/runtime-core/src/renderer.ts`中的`getSequence`函数实现了这一算法。
   - 这个算法帮助Vue 3在处理列表时，尽可能地减少DOM操作，提高性能。

#### **5.优化策略**
   - Vue 3的diff算法还包括其他优化策略，如静态提升（Static Hoisting）和缓存内联事件处理函数等。
   - 静态提升是指在编译时将静态节点的创建提升到渲染函数之外，减少不必要的VNode创建和比较。
   - 缓存内联事件处理函数可以避免在每次渲染时重新创建函数，减少内存开销。

### 双端Diff/快速Diff

**快速diff算法有以下步骤：**

- 预处理前置节点
- 预处理后置节点
- 处理仅新增节点
- 处理仅卸载节点
- 处理其他情况(新增、移动、卸载)

### 源码分析
```js
const patchChildren: PatchChildrenFn = (
    n1,
    n2,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    namespace: ElementNamespace,
    slotScopeIds,
    optimized = false,
  ) => {
    const c1 = n1 && n1.children
    const prevShapeFlag = n1 ? n1.shapeFlag : 0
    const c2 = n2.children

    const { patchFlag, shapeFlag } = n2
    // fast path
    // 快速路径处理
    // patchFlag是在编译阶段为节点添加的，纯文本的静态DOM是不会给添加patchflag
    if (patchFlag > 0) {
      if (patchFlag & PatchFlags.KEYED_FRAGMENT) {
        // this could be either fully-keyed or mixed (some keyed some not)
        // presence of patchFlag means children are guaranteed to be arrays
        // DOM设置了key的时候进行的patch

        // 快速定位元素：在新旧虚拟 DOM 树之间快速找到对应的元素，避免不必要的遍历和比较。
        // 高效复用节点：通过 key 来判断哪些节点可以复用，哪些需要重新创建或销毁，从而最大程度地减少 DOM 操作。
        // 正确处理元素移动：在处理列表项移动时，key 可以帮助 Vue 准确地识别哪些元素被移动了，并进行相应的更新。
        patchKeyedChildren()
        return
      } else if (patchFlag & PatchFlags.UNKEYED_FRAGMENT) {
        // unkeyed
        // DOM没有设置key的时候进行的patch
        // 没有设置 key，Vue 3 的 diff 算法将退化为一种较为简单的比较策略，主要表现为：

        // 逐一比较：Vue 会从头到尾逐个比较新旧虚拟 DOM 树中的节点，无法快速定位和复用元素。
        // 性能损失：这种逐个比较的方式会增加不必要的 DOM 操作，尤其是在列表项频繁增删改动的情况下，性能下降会更加明显。
        // 潜在错误：对于移动或重复的列表项，没有 key 可能会导致 Vue 错误地复用元素，从而引发状态不一致等问题。

        patchUnkeyedChildren()
        return
      }
    }

    // children has 3 possibilities: text, array or no children.
    // 处理没有添加patchflag的文本节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 文本
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // prev children was array
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // two arrays, cannot assume anything, do full diff
          patchKeyedChildren()
        } else {
          // no new children, just unmount old
          unmountChildren(c1 as VNode[], parentComponent, parentSuspense, true)
        }
      } else {
        // prev children was text OR null
        // new children is array OR null
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(container, '')
        }
        // mount new if array
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren()
        }
      }
    }
  }
```

```js
// vue3的快速diff体现在 patchKeyedChildren 中
// 分为五步：预处理前置节点、预处理后置节点、仅新增节点、仅卸载节点、处理其他情况(新增/移动/卸载)
const patchKeyedChildren = (
    c1: VNode[],  // oldNode    
    c2: VNodeArrayChildren, // newNode
    container: RendererElement,
    parentAnchor: RendererNode | null,
    parentComponent: ComponentInternalInstance | null,
    parentSuspense: SuspenseBoundary | null,
    namespace: ElementNamespace,
    slotScopeIds: string[] | null,
    optimized: boolean,
  ) => {
    let i = 0
    const l2 = c2.length
    let e1 = c1.length - 1 // 旧节点结束索引
    let e2 = l2 - 1 // 新节点结束索引

    // 1. sync from start 预处理前置节点
    // (a b) c
    // (a b) d e
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = (c2[i] = optimized
        ? cloneIfMounted(c2[i] as VNode)
        : normalizeVNode(c2[i]))
      if (isSameVNodeType(n1, n2)) {
        patch()
      } else {
        break
      }
      i++
    }

    // 2. sync from end 预处理后置节点
    // a (b c)
    // d e (b c)
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = (c2[e2] = optimized
        ? cloneIfMounted(c2[e2] as VNode)
        : normalizeVNode(c2[e2]))
      if (isSameVNodeType(n1, n2)) {
        patch()
      } else {
        break
      }
      e1--
      e2--
    }

    // 3. common sequence + mount  处理仅有新增节点情况
    // (a b)
    // (a b) c
    // i = 2, e1 = 1, e2 = 2
    // (a b)
    // c (a b)
    // i = 0, e1 = -1, e2 = 0
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? (c2[nextPos] as VNode).el : parentAnchor
        while (i <= e2) {
          patch()
          i++
        }
      }
    }

    // 4. common sequence + unmount 仅有卸载节点的情况
    // (a b) c
    // (a b)
    // i = 2, e1 = 2, e2 = 1
    // a (b c)
    // (b c)
    // i = 0, e1 = 0, e2 = -1
    else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true)
        i++
      }
    }

    // 5. unknown sequence  其他情况（包含了新增/移动/卸载）
    // [i ... e1 + 1]: a b [c d e] f g
    // [i ... e2 + 1]: a b [e d c h] f g
    // i = 2, e1 = 4, e2 = 5
    else {
      const s1 = i // prev starting index
      const s2 = i // next starting index

      // 5.1 build key:index map for newChildren
      const keyToNewIndexMap: Map<string | number | symbol, number> = new Map()
      for (i = s2; i <= e2; i++) {
        const nextChild = (c2[i] = optimized
          ? cloneIfMounted(c2[i] as VNode)
          : normalizeVNode(c2[i]))
        if (nextChild.key != null) {
          if (__DEV__ && keyToNewIndexMap.has(nextChild.key)) {
            warn(
              `Duplicate keys found during update:`,
              JSON.stringify(nextChild.key),
              `Make sure keys are unique.`,
            )
          }
          keyToNewIndexMap.set(nextChild.key, i)
        }
      }

      // 5.2 loop through old children left to be patched and try to patch 
      // matching nodes & remove nodes that are no longer present
      let j
      let patched = 0
      const toBePatched = e2 - s2 + 1
      let moved = false
      // used to track whether any node has moved
      let maxNewIndexSoFar = 0
      // works as Map<newIndex, oldIndex>
      // Note that oldIndex is offset by +1
      // and oldIndex = 0 is a special value indicating the new node has
      // no corresponding old node.
      // used for determining longest stable subsequence
      const newIndexToOldIndexMap = new Array(toBePatched)
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0

      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i]
        if (patched >= toBePatched) {
          // all new children have been patched so this can only be a removal
          unmount(prevChild, parentComponent, parentSuspense, true)
          continue
        }
        let newIndex
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key)
        } else {
          // key-less node, try to locate a key-less node of the same type
          for (j = s2; j <= e2; j++) {
            if (
              newIndexToOldIndexMap[j - s2] === 0 &&
              isSameVNodeType(prevChild, c2[j] as VNode)
            ) {
              newIndex = j
              break
            }
          }
        }
        if (newIndex === undefined) {
          unmount(prevChild, parentComponent, parentSuspense, true)
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            moved = true
          }
          patch()
          patched++
        }
      }

      // 5.3 move and mount
      // generate longest stable subsequence only when nodes have moved
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : EMPTY_ARR
      j = increasingNewIndexSequence.length - 1
      // looping backwards so that we can use last patched node as anchor
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i
        const nextChild = c2[nextIndex] as VNode
        const anchor =
          nextIndex + 1 < l2 ? (c2[nextIndex + 1] as VNode).el : parentAnchor
        if (newIndexToOldIndexMap[i] === 0) {
          // mount new
          patch()
        } else if (moved) {
          // move if:
          // There is no stable subsequence (e.g. a reverse)
          // OR current node is not among the stable sequence
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor, MoveType.REORDER)
          } else {
            j--
          }
        }
      }
    }
  }
```

### 图形展示
:::tip
图形展示可以结合源码理解。

[diff比较长图](http://ebugs.l2.ttut.cc/drawing-bed/20240527/0.jpg)
:::
<drawing-bed src="20240527/1.png" alt="20240527/1.png"/>
<drawing-bed src="20240527/2.png" alt="20240527/1.png"/>
<drawing-bed src="20240527/3.png" alt="20240527/1.png"/>
<drawing-bed src="20240527/4.png" alt="20240527/1.png"/>
<drawing-bed src="20240527/5.png" alt="20240527/1.png"/>
<drawing-bed src="20240527/6.png" alt="20240527/1.png"/>
