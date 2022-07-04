## 网站访问量统计系统

![visitor](https://visitor_badge.deta.dev/?pageID=github.Lete114.Visit-Stat&label=PV)

- 轻量，简洁
- 支持 `site_uv`, `site_pv`, `page_pv`
- 存储[redis, mongodb]
- Nodejs 编写，多平台部署(`Server`,`ServerLess`)

## 客户端

将 [dist/visit-stat.min.js](dist/visit-stat.min.js) 内的 `//localhost:6870` 服务端地址替换为你自己部署的服务端地址，然后在你的网站上引用即可

返回的数据会主动寻找标签 id 属性为:`vs_site_uv`, `vs_site_pv`, `vs_page_pv`的标签并替换内容。不懂请看 [public/index.html](public/index.html)

## 服务端

> 服务器需要有 nodejs 运行环境

环境配置文件详细请看 [.env.example](.env.example)

```bash
git clone https://github.com/Lete114/Visit-Stat.git
cd Visit-Stat
npm run start # 启动

# 或

mkdir Visit-Stat                      # 创建目录
cd Visit-Stat                         # 进入目录
npm install visit-stat --save         # 安装 Visit-Stat
touch index.js .env                   # 创建 index.js 以及 .env(环境配置文件)
node index.js # 启动
```

```js
// index.js

// Server
require('visit-stat').server()

// ServerLess 可参考 Vercel 分支
// module.exports = require('visit-stat').main
```
