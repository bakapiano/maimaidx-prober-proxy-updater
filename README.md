# 舞萌 DX 查分器数据更新器

一种仅使用 HTTP 代理的查分器数据更新方案

## 使用方法

1. 手动修改全局 HTTP 代理为 `maimai.bakapiano.com:2560`（若使用代理软件，请自行添加代理规则来保证 wahlap.com 为后缀的 HTTP 请求经过代理转发）
2. 在微信任意聊天中发送链接 [https://maimai.bakapiano.com](https://maimai.bakapiano.com) 并访问
3. 填写查分器账号密码并提交
4. 手动还原全局 HTTP 代理

## 原理

修改微信 oauth2 认证中的 redirect_uri 链接，将 https://example.com 修改为 http://example.com 并通过 HTTP 代理截获。之后服务器通过认证信息获取舞萌 DX 成绩数据。

理论上全平台支持，只要对应平台下的微信内置浏览器走全局 HTTP 代理，目前已测试：
- [x] Win10 
- [x] Android
- [ ] Mac
- [x] IOS
- [ ] Linux

## 部署

### 使用 nodejs 部署

首先安装 nodejs，版本 >=16；之后克隆项目并安装依赖：

```
git clone https://github.com/bakapiano/maimaidx-prober-proxy-updater
cd maimaidx-prober-proxy-updater
npm install
```

之后在目录 `maimaidx-prober-proxy-updater` 运行如下命令进行部署：

```
npm start {SERVER_HOST}
```

其中 `{SERVER_HOST}` 需替换为网站访问用的 host，如 IP `1.1.1.1` 或域名 `maimai.bakapiano.com`

HTTP 代理默认启在 2560 端口上，web 服务器启在 8081 上，使用方法同上。


停止运行：
```
npm stop
```

### 使用 docker 部署

首先安装 docker，之后使用镜像 `bakapiano/maimai-prober-proxy-updater` 进行构建：

```
docker run \
-p 8081:8081 -p 2560:2560 \
-e SERVER_HOST={SERVER_HOST} \
-d bakapiano/maimai-prober-proxy-updater
```

同上，`{SERVER_HOST}` 需替换为网站访问用的 host，如 IP `1.1.1.1` 或域名 `maimai.bakapiano.com`

端口映射可根据需要自行修改，8081 为 web 服务器端口 ，2560 为代理服务器端口。 
