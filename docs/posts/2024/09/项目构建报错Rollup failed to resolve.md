---
title: 关于 Rollup failed to resolve import "xxx" from "xxx". 
date: 2024-09-10
tags: 
  - Vite构建
  - Rollup
---

# 关于 Rollup failed to resolve import "xxx" from "xxx". 
     
> ✨文章摘要（AI生成）

<!-- DESC SEP -->
在当前构建过程中，出现了一个错误，提示 Rollup 无法解析 `src/bt-views/app/test-process-bearing-ledger/components/print-barcode.vue` 文件中的 `import "jsbarcode"`。这通常是因为项目中没有安装该依赖包。为了解决这个问题，可以通过以下步骤操作：首先使用命令 `npm list jsbarcode` 查看项目中是否已经安装了 `jsbarcode` 包，从日志中可以看到并没有安装该包。然后，通过执行 `pnpm install jsbarcode` 来安装 `jsbarcode` 包，以解决该问题。这样，Rollup 就能正确解析并构建项目。
<!-- DESC SEP -->

### 报错日志

```bash
ERROR  error during build: 09:16:11
Error: [vite]: Rollup failed to resolve import "jsbarcode" from "src/bt-views/app/test-process-bearing-ledger/components/print-barcode.vue?vue&type=script&setup=true&lang.ts".
This is most likely unintended because it can break your application at runtime.
If you do want to externalize this module explicitly add it to
`build.rollupOptions.external`
    at onRollupWarning (file:///Users/zhiyong.yu/HY_PROJECT/%E4%B8%AD%E8%88%AA%E5%8F%91%E5%93%88%E8%BD%B4/hyas-hzx-tdm-web/node_modules/.pnpm/vite@3.2.10_@types+node@22.5.2_sass@1.77.8_terser@5.31.6/node_modules/vite/dist/node/chunks/dep-372dab03.js:45909:19)
    at onwarn (file:///Users/zhiyong.yu/HY_PROJECT/%E4%B8%AD%E8%88%AA%E5%8F%91%E5%93%88%E8%BD%B4/hyas-hzx-tdm-web/node_modules/.pnpm/vite@3.2.10_@types+node@22.5.2_sass@1.77.8_terser@5.31.6/node_modules/vite/dist/node/chunks/dep-372dab03.js:45680:13)
    at Object.onwarn (file:///Users/zhiyong.yu/HY_PROJECT/%E4%B8%AD%E8%88%AA%E5%8F%91%E5%93%88%E8%BD%B4/hyas-hzx-tdm-web/node_modules/.pnpm/rollup@2.79.1/node_modules/rollup/dist/es/shared/rollup.js:23263:13)
    at ModuleLoader.handleResolveId (file:///Users/zhiyong.yu/HY_PROJECT/%E4%B8%AD%E8%88%AA%E5%8F%91%E5%93%88%E8%BD%B4/hyas-hzx-tdm-web/node_modules/.pnpm/rollup@2.79.1/node_modules/rollup/dist/es/shared/rollup.js:22158:26)
    at file:///Users/zhiyong.yu/HY_PROJECT/%E4%B8%AD%E8%88%AA%E5%8F%91%E5%93%88%E8%BD%B4/hyas-hzx-tdm-web/node_modules/.pnpm/rollup@2.79.1/node_modules/rollup/dist/es/shared/rollup.js:22119:26
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)

```

### 产生原因 

在当前构建过程中，rollup 根据 `src/bt-views/app/test-process-bearing-ledger/components/print-barcode.vue` 页面上的 `import "jsbarcode"` 去找对应包，没有找到

### 解决方案

1. 使用命令查看当前项目中包的信息
    ```bash
    npm list jsbarcode
    ```

2. log提示并没有安装这个包
    ```bash
    zhiyong.yu@yuuuuuu hyas-hzx-tdm-web % npm list jsbarcode
    hyrd-beeboat-micro-app-child@1.0.0 /Users/zhiyong.yu/HY_PROJECT/中航发哈轴/hyas-hzx-tdm-web
    └── (empty)
    ```
3. 安装
   ```bash
   pnpm install jsbarcode
   ```