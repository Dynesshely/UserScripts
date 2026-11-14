# DeepSeek: Ctrl+Enter to Send

把 chat.deepseek.com 的消息发送快捷键从 Enter 改为 **Ctrl + Enter**，把换行还给 **Enter**。

- UserScript 名称：`DeepSeek: Ctrl+Enter to Send`
- namespace：`com.deepseek.userscript`
- 匹配范围：`https://chat.deepseek.com/*`
- 许可：MIT

## 行为

| 按键 | 行为 |
| --- | --- |
| `Enter` | 换行（不再发送） |
| `Ctrl + Enter`（macOS 上也支持 `Cmd + Enter`） | 发送消息 |
| `Shift + Enter` | 保持原有的换行行为 |

## 实现说明

脚本在 `document` 的捕获阶段监听 `keydown`：

1. 普通 `Enter`：拦截原始事件，**直接向输入框插入换行**。
   换行是浏览器的默认编辑行为，合成键盘事件（`isTrusted=false`）不会触发它，
   所以 textarea 用 `setRangeText` + `input` 事件，contenteditable 用
   `execCommand("insertLineBreak")`（不可用时回退为插入 `<br>`）；
2. `Ctrl/Cmd+Enter`：拦截原始事件，向输入框派发一个合成 `Enter`（不带修饰键），
   交给页面自己的发送逻辑处理。

这样不依赖页面内部的发送按钮或组件实现，也不会改变页面的其他快捷键。
输入法组合输入期间（`isComposing`）不拦截，避免影响候选词确认。
搜索类输入框（placeholder 含「搜索 / 查找 / search」）不处理。

## 构建

```powershell
npm install
npm run build
```

输出：`dist/deepseek-ctrl-enter.user.js`。