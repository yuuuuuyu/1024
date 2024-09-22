# Vue3中ref和reactive的区别

:::tip
https://vuejs.org/api/reactivity-core.html#ref

https://vuejs.org/api/reactivity-core.html#ref
:::

### 区别说明
- **ref** 生成响应式对象，一般用于基础类型
- **reactive** 代理整个对象，一般用于引用类型
  
### 源码分析

<br>

#### ref
[源码路径 vue3/packages/reactivity/src/ref.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/ref.ts)

```js
/**
 * Takes an inner value and returns a reactive and mutable ref object, which
 * has a single property `.value` that points to the inner value.
 *
 * @param value - The object to wrap in the ref.
 * @see {@link https://vuejs.org/api/reactivity-core.html#ref}
 */
export function ref(value?: unknown) {
  return createRef(value, false)
}

function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue, shallow)
}

class RefImpl<T> {
  private _value: T
  private _rawValue: T

  public dep?: Dep = undefined
  public readonly __v_isRef = true

  constructor(
    value: T,
    public readonly __v_isShallow: boolean, // 否是浅层响应
  ) {
    // 构造器内获取变量原始值
    // 使用toRaw确保了在创建深层响应对象时能够正确处理原始值，而不是直接操作可能被代理的响应式对象。提高性能
    this._rawValue = __v_isShallow ? value : toRaw(value) 
    // 将值赋值给.value，toReactive见下方
    this._value = __v_isShallow ? value : toReactive(value)
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newVal) {
    const useDirectValue =
      this.__v_isShallow || isShallow(newVal) || isReadonly(newVal)
    newVal = useDirectValue ? newVal : toRaw(newVal)
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = useDirectValue ? newVal : toReactive(newVal)
      triggerRefValue(this, DirtyLevels.Dirty, newVal)
    }
  }
}
```
```js
// vue3/packages/reactivity/src/reactive.ts 提供
// 如果被声明的变量是引用类型，那么就走reactive的逻辑，否则直接返回
export const toReactive = <T extends unknown>(value: T): T =>
  isObject(value) ? reactive(value) : value
```
#### reactive

[源码路径 vue3/packages/reactivity/src/reactive.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/reactive.ts)

```js
/**
 * Returns a reactive proxy of the object.
 *
 * The reactive conversion is "deep": it affects all nested properties. A
 * reactive object also deeply unwraps any properties that are refs while
 * maintaining reactivity.
 *
 * @example
 * ```js
 * const obj = reactive({ count: 0 })
 * ```
 *
 * @param target - The source object.
 * @see {@link https://vuejs.org/api/reactivity-core.html#reactive}
 */
export function reactive(target: object) {
  // if trying to observe a readonly proxy, return the readonly version.
  if (isReadonly(target)) {
    return target
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap,
  )
}
function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>,
) {
  if (!isObject(target)) {
    if (__DEV__) {
      warn(`value cannot be made reactive: ${String(target)}`)
    }
    return target
  }
  // target is already a Proxy, return it.
  // exception: calling readonly() on a reactive object
  if (
    target[ReactiveFlags.RAW] &&
    !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
  ) {
    return target
  }
  // target already has corresponding Proxy
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  // only specific value types can be observed.
  const targetType = getTargetType(target)
  if (targetType === TargetType.INVALID) {
    return target
  }
  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers,
  )
  proxyMap.set(target, proxy)
  return proxy
}
```

### 思考


<details>
<summary>在ref源码中可以看出，既可以声明基础类型，也可以声明引用类型的变量，那为什么不用ref一把梭？</summary>

虽然理论上可以使用 `ref` 来声明所有类型的响应式数据，但 Vue3 提供了 `ref` 和 `reactive` 这两个工具，那肯定是是有他的道理：

**代码可读性和语义明确性**

1. **语义分离**：
   - `ref` 用于简单的、单一的值（如数字、字符串等）。
   - `reactive` 用于包含多个属性的复杂对象。
   
   这一设计使得代码更具语义性。通过看到代码中的 `ref` 或 `reactive`，可以立即了解数据的结构和用途。

2. **减少冗余访问**：
   - 使用 `ref` 创建的响应式对象需要通过 `.value` 来访问属性，这对于复杂对象来说显得冗长和不直观。
   - 使用 `reactive` 创建的对象可以直接访问其属性，更符合直觉，也减少了代码复杂度。

**性能和实现细节**

1. **性能考虑**：
   - `reactive` 是为了处理复杂对象而设计的，直接使用它可以避免不必要的封装和拆封过程。
   - 虽然 `ref` 可以处理对象，但内部实际上会把对象转为 `reactive`，这可能会带来额外的性能开销。

2. **内部实现简化**：
   - `ref` 和 `reactive` 的内部实现有不同的优化路径。直接使用最适合的数据结构的工具，可以简化框架的内部实现，使代码更加高效和可维护。

**代码维护和开发效率**

1. **代码一致性**：
   - 使用 `reactive` 处理复杂对象，使得代码在处理对象时更加一致，不需要在访问属性时反复使用 `.value`，从而提高代码的一致性和可读性。

2. **开发体验**：
   - 根据数据的类型选择相应的工具，可以让开发者更容易理解和使用响应式系统，提高开发效率和体验。

所以尽管技术上可以使用 `ref` 处理所有类型的数据，但为了代码的可读性、语义明确性、性能优化以及更好的开发体验，Vue 3 提供了 `ref` 和 `reactive` 两个工具。根据数据的类型和使用场景选择合适的工具，可以使得代码更加清晰、简洁和高效。
</details>
