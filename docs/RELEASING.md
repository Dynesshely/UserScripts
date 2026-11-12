# 发布流程（RELEASING）

本仓库的发布模型是 **平台侧自动拉取**：打版本 tag 后由 CI 构建，把产物推送到
`release` 分支；GreasyFork 通过 GitHub webhook 得到通知，再从 raw URL 自动拉取新版本。

- **不创建 GitHub Release**（没有 release 页面、没有 release notes）。
- **不发布 GitHub Package / npm 包**，也不把产物作为 Actions artifact 发布。
- **唯一的发布产物位置就是 `release` 分支**，根目录扁平存放三个 `.user.js`。

```text
git tag v* ──▶ GitHub Actions: .github/workflows/release.yml
                    │
                    ├─ 依次构建 auto-login / disable-pcdn / luogu-helper
                    ├─ 校验 tag 提交里的 dist/ 是最新构建结果
                    └─ push 到 release 分支（根目录只有三个 .user.js）
                                │
                    GitHub webhook（push 事件）
                                ▼
                    GreasyFork 从 release 分支的 raw URL 拉取更新
```

## 一、仓库侧发布步骤

### 1. 修改 `@version`

版本号写在每个脚本的 `webpack.config.cjs` 里（`UserscriptPlugin` 的
`headers.version`），构建后就是产物头部的 `@version`。`package.json` 里的
`version` 不参与发布，改不改都不影响。

| 脚本 | 配置文件 |
| --- | --- |
| auto-login | [source/auto-login/webpack.config.cjs](../source/auto-login/webpack.config.cjs) |
| disable-pcdn | [source/disable-pcdn/webpack.config.cjs](../source/disable-pcdn/webpack.config.cjs) |
| luogu-helper | [source/luogu-helper/webpack.config.cjs](../source/luogu-helper/webpack.config.cjs) |

`headers.version` 的当前值直接看配置文件；本文不抄写具体版本号，避免文档随发版过期。

注意：GreasyFork 是按 `@version` 比较版本的，**新版本必须比平台上已发布的大**。
沿用各脚本现有的版本格式即可（日期式或数字式，只要单调递增）。

### 2. 构建

在仓库根目录构建全部三个脚本：

```powershell
npm run build
```

只想构建其中一个时：

```powershell
cd source\<slug>
npm ci
npm run build
```

产物路径为 `source/<slug>/dist/<slug>.user.js`。

### 3. 提交 dist

`dist/` 是入库的（构建产物就是用户脚本的实际安装文件），源码与产物必须在同一个提交里：

```powershell
git add source/<slug>/dist
git commit -m "build(<slug>): 构建 vX.Y.Z 产物"
```

> CI 会重新构建并执行 `git diff --exit-code -- source/*/dist`。如果提交里的 `dist/`
> 与重新构建的结果不一致，发布任务会直接失败。**所以一定要把构建后的 dist 提交上去**。

### 4. 打 tag 并推送

tag 必须打在**包含最新 dist** 的提交上，且必须以 `v` 开头（`release.yml` 只监听 `v*`）：

```powershell
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin main
git push origin vX.Y.Z
```

用 `git push --follow-tags` 也可以，但它只会推送**附注 tag**；轻量 tag 仍需显式推送
`git push origin vX.Y.Z`。

### 5. 观察 CI

推送 tag 后会自动运行 **Release** workflow：

1. checkout（`fetch-depth: 0`）、Node.js 22、按 `auto-login` → `disable-pcdn` → `luogu-helper`
   的顺序执行 `npm ci` + `npm run build`；
2. 校验 `dist/` 无差异；
3. 把三个产物复制成扁平文件名，提交到 `release` 分支（提交身份
   `github-actions[bot]`，提交信息包含 tag 名）。

release 分支上的文件**没有变化**时不会产生空提交（workflow 会跳过并正常结束）。

## 二、GreasyFork 平台配置（手动操作，每个脚本配置一次）

以下步骤在 GreasyFork 网页上完成，属于人工一次性配置，CI 不会代做。

### 1. 给每个脚本填 Sync URL

打开脚本的编辑 / 管理页面，找到 **Sync（同步）** 设置：

| 脚本 | Sync URL |
| --- | --- |
| auto-login | `https://raw.githubusercontent.com/Dynesshely/UserScripts/release/auto-login.user.js` |
| disable-pcdn | `https://raw.githubusercontent.com/Dynesshely/UserScripts/release/disable-pcdn.user.js` |
| luogu-helper | `https://raw.githubusercontent.com/Dynesshely/UserScripts/release/luogu-helper.user.js` |

必须使用 **raw URL**（`raw.githubusercontent.com`），不能填 `github.com/.../blob/...` 页面地址。

同步类型（Sync type）选择 **Webhook**（不是 Automatic 定时轮询）。选 Webhook 后
GreasyFork 会生成 webhook 相关信息，并只在收到 GitHub 的推送通知时拉取。

> 说明：GreasyFork 上三个脚本的 ID 分别是 491421（disable-pcdn）、581027（luogu-helper），
> 配置时直接编辑对应脚本即可；auto-login 目前在 GreasyFork 没有发布条目，首次同步前需要
> 先在 GreasyFork 上发布一次该脚本。

### 2. 生成 webhook URL 与 secret

登录 GreasyFork 后打开：

<https://greasyfork.org/en/users/webhook-info>

页面上会显示 **Webhook URL** 和 **Secret**。把它抄下来（secret 只在这里出现一次，
丢失可重新生成）。

### 3. 在 GitHub 仓库添加 webhook

打开 GitHub 仓库 **Settings → Webhooks → Add webhook**，按下面填写：

| 字段 | 值 |
| --- | --- |
| Payload URL | GreasyFork 的 **Webhook URL** |
| Content type | `application/json` |
| Secret | GreasyFork 的 **Secret** |
| SSL verification | Enable SSL verification |
| Which events would you like to trigger this webhook? | **Just the push event** |
| Active | 勾选 |

保存即可。之后每次 `release` 分支被 CI 推送，GitHub 都会把 push 事件发给 GreasyFork，
GreasyFork 随即从上面填的 raw URL 拉取新版本。

### 4. 验证

- GitHub：**Settings → Webhooks → 该 webhook → Recent Deliveries**，应看到 `push` 事件
  返回 2xx。
- GreasyFork：脚本详情页的版本应更新；如果没更新，见下面的「排障」。

## 三、直接安装链接（release 分支）

产物发布后，可以直接用 raw URL 安装 / 覆盖安装：

- <https://raw.githubusercontent.com/Dynesshely/UserScripts/release/auto-login.user.js>
- <https://raw.githubusercontent.com/Dynesshely/UserScripts/release/disable-pcdn.user.js>
- <https://raw.githubusercontent.com/Dynesshely/UserScripts/release/luogu-helper.user.js>

`release` 分支的结构（全部在根目录，扁平存放，不含源码）：

```text
release
├─ auto-login.user.js
├─ disable-pcdn.user.js
└─ luogu-helper.user.js
```

## 四、明确不做的事

- **不创建 GitHub Release**：不需要 release 页面、release notes、附件。
- **不发布 GitHub Package / npm 包**：仓库没有 `publish` 流程。
- **不上传 Actions artifact 作为发布渠道**：artifact 只是 CI 内部临时文件，产物只进
  `release` 分支。
- **不手动修改 release 分支**：该分支由 CI 维护，根目录只允许三个 `.user.js`；
  手动往里加文件会在下次发版时被清掉。
- **不移动 / 重写已推送的 tag**：需要重发时删除远端 tag 重新打（见排障）。

## 五、排障

### CI 失败：提示 dist/ 与源码不一致

说明 tag 指向的提交里 `dist/` 不是最新构建结果。处理办法：

1. 本地重新 `npm run build`，把 `dist` 的改动提交；
2. 删除远端 tag 并重新打：

```powershell
git push origin :refs/tags/vX.Y.Z
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin vX.Y.Z
```

（如果已经推送到公开仓库，也可以直接提升版本号重新发一版，避免改写历史。）

### CI 成功，但 release 分支没有新提交

说明三个产物与 release 分支上现有的完全一致。通常是 `@version` 没改、或构建没产生
任何字节变化；确认版本号确实变了再重发。

### GreasyFork 没有拉到新版本

按顺序检查：

1. GitHub webhook 的 Recent Deliveries 是否返回 2xx；
2. GreasyFork 的 Sync URL 是否是 raw URL，且分支名是 `release`；
3. 脚本的 `@version` 是否比 GreasyFork 上当前版本更大（GreasyFork 按版本号判断更新）；
4. GreasyFork 上该脚本是否处于正常发布状态、自动更新是否启用；
5. 手动触发一次：在 GreasyFork 脚本页面点「更新 / 检查更新」，或在 GitHub 上对
   webhook 点 **Redeliver** 重投一次通知。

### 权限与凭据

- `release.yml` 只需要 `contents: write` 权限，使用 Actions 内置的
  `GITHUB_TOKEN` 推送 `release` 分支，无需额外配置 deploy key 或 PAT。
- GreasyFork 的 webhook secret 只保存在 GitHub 仓库的 webhook 设置里，**不要写进仓库文件**。
