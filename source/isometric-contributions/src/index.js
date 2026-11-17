/**
 * Isometric Contributions (userscript)
 *
 * 直接照搬开源扩展 jasonlong/isometric-contributions 的实现：
 *   - vendor/iso.js: 扩展入口逻辑（DOM 注入、数据解析、统计块、视图切换）
 *   - vendor/utils.js: 解析 / 设置 / 统计工具
 *   - vendor/history.js: 通过 GitHub 历史贡献接口补全 streak
 *   - vendor/obelisk.min.js: obelisk.js 等轴测渲染库
 *
 * 仅做用户脚本所需的最小适配：
 *   - 通过 GM_addStyle 注入 iso.css
 *   - 存储自动回退 localStorage（原扩展代码已兼容）
 *   - 移除对旧版 GitHub 的 .vcard-names-container 依赖
 */

import "./styles.js";
import "./vendor/obelisk.min.js";
import "./vendor/iso.js";
