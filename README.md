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

## 部署（待完善）

安装 nodejs，版本 >=16
```
git clone https://github.com/bakapiano/maimaidx-prober-updater
cd maimaidx-prober-updater
npm install
```

若直接通过 IP 访问：

    修改 `src/proxy.js` 文件的 whiteList 变量，添加 "weixin110.qq.com" 和服务器的公网 IP 地址

```
node main.js
```

HTTP 代理默认启在 2560 端口上，web 服务器启在 8081 上，使用方法同上
