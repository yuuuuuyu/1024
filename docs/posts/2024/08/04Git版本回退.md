---
title: Git版本回退的处理
date: 2024-08-11
tags: 
  - Git
  - 版本管理
  - 回退
---
# Git版本回退的处理

## 问题场景

平台近期没有发布计划，但是同事反馈平台存在小bug有点影响使用，但是距离上次发布`develop`分支已经增加了很多代码，不可以直接合并代码到`product`，就只能通过修改`product`分支的指定文件。

问题来了，这个时候如果已经切换到`product`分支完成了合并，并且push了。

这个时候就需要进行回退操作。

## 回退操作

由于合并的代码过多，需要谨慎处理。

### 查看提交log
```bash
git log
```
```bash
zhiyong.yu@yuuuuuu beeboat-designer % git log
commit e17dcb68230de111b1daf14373580f505137d616 (HEAD -> product, origin/product)
Author: ************
Date:   Fri Mar 15 10:59:16 2024 +0800

    fix: 补充fix

commit 0cda57f085b271e05633ab25abb2bdb79fe04ac7
Author: ************
Date:   Fri Mar 15 10:17:17 2024 +0800

    fix: 属性丢失fix

commit ad6a5f9edf117e6381824adeee89d06fda2e05df
Author: ************
Date:   Mon Mar 4 08:47:48 2024 +0800

    fix: 隐藏弹窗数据更新提示

commit fb81ff8c8907c0979b957e790f08ccb1ed392132
Author: ************
Date:   Sat Mar 2 16:43:40 2024 +0800

    fix: 消息滚动时间调整为5秒

commit eea9565ab659693fcdd7683b7f5ce4c5a5a9d08f
Merge: 0aedb817c 5142be6ca
Author: ************
Date:   Sat Mar 2 15:35:09 2024 +0800

    Merge branch 'develop' of ******** into develop

commit 0aedb817c6693409b39a5b0b73fbf9bb3f5c8cb3
Author: ************
Date:   Sat Mar 2 15:34:42 2024 +0800

    fix: 修改form报错
```
找到`commit 0aedb817c6693409b39a5b0b73fbf9bb3f5c8cb3`后, 可以查看对应hash的提交内容
```bash
git show 0aedb817c6693409b39a5b0b73fbf9bb3f5c8cb3
```

### 撤回合并

操作的目的仅仅是撤回合并，因为合并过去的代码涉及到很多内容，不可以无脑硬撤回，硬撤回会造成代码丢失。

```bash
git reset --soft <commit-hash-before-merge>
```
找到要退回的hash
```bash
git reset --soft 0aedb817c6693409b39a5b0b73fbf9bb3f5c8cb3
```
注意：软撤回后，合并到`product`的代码会在出现在`暂存的更改`中

> git reset --hard commit-hash
> 也可以使用 --hard 进行硬提交，硬提交会直接丢掉指定hash之后的代码。谨慎使用

### 强制提交

```bash
git push origin <branch-name> --force
```
强制提交后可以通过`git log`查看，远程分支已经回退到hash值了

### 暂存区的代码

本次撤回完成后，`product`代码处理完成后，暂存区的代码就可以再次正常提交了
