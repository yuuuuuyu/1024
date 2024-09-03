# Jenkins 持续集成/持续部署

:::tip
**什么是 CI/CD?**

CI/CD是两个独立过程的组合：持续集成和持续部署.

持续集成（CI）是构建软件和完成初始测试的过程。持续部署（CD）是将代码与基础设施相结合的过程，确保完成所有测试并遵循策略，然后将代码部署到预期环境中.

[什么是 CI/CD ？5分钟让你明白](https://zhuanlan.zhihu.com/p/654666712)

[为什么持续集成和部署在开发中非常重要？](https://blog.csdn.net/csdnnews/article/details/104624343)

[浅谈CICD与项目实战](https://anqixiang.blog.csdn.net/article/details/105078179?spm=1001.2101.3001.6650.3&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-3-105078179-blog-120842158.235%5Ev43%5Epc_blog_bottom_relevance_base5&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-3-105078179-blog-120842158.235%5Ev43%5Epc_blog_bottom_relevance_base5&utm_relevant_index=6)
:::

> ***Ubuntu环境安装配置Jenkins***
> 
> Jenkins默认端口8080，服务器8080被nginx占用(当前文档网站)，启动失败
> 
> 更改 Jenkins 监听端口  `sudo vim /etc/default/jenkins`
> 
> 重启

## 安装过程

1. 查看服务器操作系统
   ```bash
   lsb_release -a
   ```
2. 查看JDK是否安装
   ```bash
   java -version
   ```
   ```bash
   // JDK安装命令
   sudo apt install openjdk-11-jre-headless
   ```
3. 下载2.406版本 Jenkins，阿里云或者华为云镜像
   ```bash
   # 阿里云
   curl -L0 https://mirrors.aliyun.com/jenkins/debian/jenkins_2.406_all.deb --output jenkins_2.406_all.deb
   # 华为云
   curl -L0 https://repo.huaweicloud.com/jenkins/debian/jenkins_2.406_all.deb --output jenkins_2.406_all.deb
   ```
4. 安装启动
   ```bash
   dpkg -i jenkins_2.406_all.deb
   ``` 
   当前步骤可能会报错，端口占用问题，重新为 Jenkins 指定新端口

5. 查看是否启动
   ```bash
   ss -tnl
   #关闭
   sudo service jenkins stop
   #重新启动
   sudo service jenkins restart
   ```
6. 此时安装算是完成了，可以访问了
   ```bash
   # 管理员密码
   cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
<drawing-bed src="20240403/1.png" alt="20240403/1.png"/>

## 配置过程/前端项目

> 以下配置过程仅以当前文档网站以及配套图床仓库作为演示。
>
> 其他场景待补充
>

### 安装Gitee插件
<drawing-bed src="20240403/2.png" alt="20240403/2.png"/>

### 创建Jenkins任务
<drawing-bed src="20240403/3.png" alt="20240403/3.png"/>

### 配置任务
创建一个自由风格的任务
<drawing-bed src="20240403/4.png" alt="20240403/4.png"/>
进入任务的设置后，依次配置以下信息：
<drawing-bed src="20240403/5.png" alt="20240403/5.png"/>
<drawing-bed src="20240403/6.png" alt="20240403/6.png"/>
在添加验证方式中可以选择直接使用gitee的用户名和密码，也可以在gitee中添加令牌
<drawing-bed src="20240403/6-1.png" alt="20240403/6-1.png"/>
源码部分设置完成后，设置如何触发构建。安装Gitee插件后，就会出现Gitee Webhook出发构建这个选项，同时要生成一个webhook密码，用于在Gitee设置webhook的时候使用，如下：
<drawing-bed src="20240403/7.png" alt="20240403/7.png"/>
触发设置完成后，需要配置一下构建环境，前端项目基本的打包环境是Node，同时也需要将npm添加到环境变量中，方便脚本调用，如下：
<drawing-bed src="20240403/8.png" alt="20240403/8.png"/>
我的服务器使用的linux，那么build steps中我选择的是shell脚本。具体的脚本内容根据实际的需求添加，比如设置npm源、使用npm还是pnpm、产物的发布等，如下：
<drawing-bed src="20240403/9.png" alt="20240403/9.png"/>


### 设置Gitee仓库的webhook
为仓库设置webhooks，其中密码就是在Jenkins任务设置中生成的密码。
<drawing-bed src="20240403/11.png" alt="20240403/11.png"/>
至此，任务设置完成，仓库的webhooks设置完成。

### push代码自动构建
提交代码后触发自动构建，会提示`gitee用户推送触发构建`
<drawing-bed src="20240403/10.png" alt="20240403/10.png"/>