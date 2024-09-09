# Vite 打包项目时报错 JavaScript heap out of memory

## 问题描述
```vue
<--- Last few GCs --->
[12168:00000145D1BE67B0]   199025 ms: Mark-sweep 2007.0 (2094.4) -> 2003.9 (2092.6) MB, 839.6 / 0.0 ms  (average mu = 0.127, current mu = 0.006) allocation failure scavenge might not succeed
[12168:00000145D1BE67B0]   200197 ms: Mark-sweep 2006.9 (2095.3) -> 2003.7 (2092.6) MB, 1152.5 / 0.0 ms  (average mu = 0.074, current mu = 0.017) allocation failure scavenge might not succeed

<--- JS stacktrace --->
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
 1: 00007FF65D44815F v8::internal::CodeObjectRegistry::~CodeObjectRegistry+114079
 2: 00007FF65D3D54C6 DSA_meth_get_flags+65542
 3: 00007FF65D3D637D node::OnFatalError+301
 4: 00007FF65DD0BA0E v8::Isolate::ReportExternalAllocationLimitReached+94
 5: 00007FF65DCF5FED v8::SharedArrayBuffer::Externalize+781
 6: 00007FF65DB993BC v8::internal::Heap::EphemeronKeyWriteBarrierFromCode+1468
 7: 00007FF65DBA6069 v8::internal::Heap::PublishPendingAllocations+1129
 8: 00007FF65DBA303A v8::internal::Heap::PageFlagsAreConsistent+2842
 9: 00007FF65DB95C99 v8::internal::Heap::CollectGarbage+2137
10: 00007FF65DB93E50 v8::internal::Heap::AllocateExternalBackingStore+2000
11: 00007FF65DBB1B60 v8::internal::FreeListManyCached::Reset+1408
12: 00007FF65DBB2215 v8::internal::Factory::AllocateRaw+37
13: 00007FF65DBC7ADF v8::internal::FactoryBase<v8::internal::Factory>::NewRawTwoByteString+79
14: 00007FF65D9AB1BD v8::internal::String::SlowFlatten+477
15: 00007FF65D7153CB v8::internal::WasmTableObject::Fill+603
16: 00007FF65DD167E9 v8::String::WriteUtf8+105
17: 00007FF65D2EB243 v8::internal::OSROptimizedCodeCache::OSROptimizedCodeCache+37827
18: 00007FF65D272EBB v8::internal::compiler::Instruction::parallel_moves+603
19: 00007FF65DCC63E6 v8::internal::Builtins::code_handle+172790
20: 00007FF65DCC5FD9 v8::internal::Builtins::code_handle+171753
21: 00007FF65DCC629C v8::internal::Builtins::code_handle+172460
22: 00007FF65DCC6100 v8::internal::Builtins::code_handle+172048
23: 00007FF65DD99801 v8::internal::SetupIsolateDelegate::SetupHeap+494673
24: 00000145D41FC7B2
 ELIFECYCLE  Command failed with exit code 134.
```
## 产生原因
内存不足，内存溢出

## 解决方案
1. 安装以下两个依赖`cross-env`/`increase-memory-limit`
2. `package.json`增加脚本`"fix-memory-limit": "cross-env LIMIT=4096 increase-memory-limit"`,4096如果不够可以继续增加
3. 修改打包脚本`"build:tzprod": "pnpm fix-memory-limit && rimraf dist && cross-env --max_old_space_size=10000 && cross-env vite build --mode tzprod"`,执行打包前设置node内存
