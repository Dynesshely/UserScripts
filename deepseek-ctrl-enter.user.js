// ==UserScript==
// @name        DeepSeek: Ctrl+Enter to Send
// @description Send messages with Ctrl+Enter and use Enter for line breaks on chat.deepseek.com
// @version     0.0.1
// @author      Dynesshely
// @match       https://chat.deepseek.com/*
// @grant       none
// @icon        https://chat.deepseek.com/favicon.ico
// @license     MIT
// @namespace   com.deepseek.userscript
// @run-at      document-idle
// ==/UserScript==

!function(){"use strict";const e="__deepseek_ctrl_enter_synthetic__",t=["搜索","查找","search"];function n(e){Object.defineProperty(e,"keyCode",{get:function(){return 13}}),Object.defineProperty(e,"which",{get:function(){return 13}})}function r(t,r){var o=new KeyboardEvent("keydown",{key:"Enter",code:"Enter",shiftKey:r,bubbles:!0,cancelable:!0,composed:!0});n(o),o[e]=!0,t.dispatchEvent(o);var i=new KeyboardEvent("keyup",{key:"Enter",code:"Enter",shiftKey:r,bubbles:!0,cancelable:!0,composed:!0});n(i),i[e]=!0,t.dispatchEvent(i)}document.addEventListener("keydown",function(n){if(!n[e]&&"Enter"===n.key&&!n.isComposing&&229!==n.keyCode){var o=n.target;if(function(e){if(!e||1!==e.nodeType)return!1;if("TEXTAREA"===e.tagName){if("search"===e.getAttribute("type"))return!1;for(var n=(e.getAttribute("placeholder")||"").toLowerCase(),r=0;r<t.length;r++)if(n.indexOf(t[r])>=0)return!1;return!0}return!(!e.isContentEditable||e.closest&&e.closest('[role="search"]'))}(o))return function(e){return(e.ctrlKey||e.metaKey)&&!e.altKey}(n)?(n.preventDefault(),n.stopPropagation(),n.stopImmediatePropagation(),void r(o,!1)):void(function(e){return!(e.shiftKey||e.altKey||e.ctrlKey||e.metaKey)}(n)&&(n.preventDefault(),n.stopPropagation(),n.stopImmediatePropagation(),r(o,!0)))}},!0),console.log("[DeepSeek Ctrl+Enter] 已启用：Enter 换行，Ctrl+Enter 发送")}();