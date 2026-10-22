# Permission Panic

**AI 想要权限。这次，你会允许吗？**

### [▶ 点开就玩，无需安装](https://karurukaruru.github.io/permission-panic/)

不需要登录、API、命令行或开发环境。在线版部署在 GitHub Pages，与你的电脑是否开机无关。

**想离线玩？** 在游戏页面底部点「下载离线版」，下载后双击 `Permission-Panic.html` 即可。
这个单文件包含完整游戏，无需联网、Node.js 或本地服务器；也可以从 [Releases](https://github.com/karurukaruru/permission-panic/releases/latest) 下载。

支持 English、简体中文、繁體中文、한국어、日本語；默认跟随浏览器语言，右上角可切换。
十道题的任务说明、检查结论、答案解释、成绩和分享文字均已翻译；命令、技术证据和模拟日志保留原文。

## 玩法

AI 编程助手申请读文件、运行测试、删目录、推送代码……你来选「允许」「检查」或「拒绝」。
检查会揭示上下文，不消耗题目，也不扣分。没有倒计时。

- 共 10 题，全部答完会得到分数、称号和可下载的成绩卡。
- 正确 +100；跳过必要检查但猜对 +60；错误 −50；误批高风险操作 −100。
- 最高 1000 分，最低 0 分。可以复制挑战文字，附带真实试玩链接。
- 快捷键：A 允许、I 检查、D 拒绝、Enter 下一题。
- 刷新会重新开始；浏览器允许存储时，会记住你的语言选择。
- 所有命令和事故都是模拟，不执行真实操作；没有追踪、后端或 AI 服务。

## 开发

只有修改源码才需要 Node.js 22.12+：

```sh
npm ci
npm run dev
```

[开发与部署](docs/DEVELOPMENT.md) · [贡献指南](CONTRIBUTING.md) · [English](README.md)

由 [karurukaruru](https://github.com/karurukaruru) 创建和维护，OpenAI Codex 协助开发。独立项目，无官方背书。[MIT 许可](LICENSE)。
