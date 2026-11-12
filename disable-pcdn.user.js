// ==UserScript==
// @name        Disable Websites' PCDN
// @description Disable websites to use PCDN to upload content
// @version     2025-04-17-2
// @author      Dyneeshely
// @match       https://*.bilibili.com/*
// @downloadURL https://update.greasyfork.org/scripts/491421/Disable%20Websites%27%20PCDN.user.js
// @grant       none
// @icon        https://img.catrol.cn/icons/projects/user-scripts/disable-pcdn.png
// @license     AGPL
// @namespace   http://tampermonkey.net/
// @updateURL   https://update.greasyfork.org/scripts/491421/Disable%20Websites%27%20PCDN.meta.js
// ==/UserScript==

!function(){"use strict";console.log("🔵 Websites' PCDN disabled!"),delete window.RTCPeerConnection,delete window.mozRTCPeerConnection,delete window.webkitRTCPeerConnection,delete window.RTCDataChannel,delete window.DataChannel}();