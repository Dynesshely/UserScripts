// ==UserScript==
// @name        DeepSeek: Ctrl+Enter to Send
// @description Send messages with Ctrl+Enter and use Enter for line breaks on chat.deepseek.com
// @version     0.0.2
// @author      Dynesshely
// @match       https://chat.deepseek.com/*
// @grant       none
// @icon        https://chat.deepseek.com/favicon.ico
// @license     MIT
// @namespace   com.deepseek.userscript
// @run-at      document-idle
// ==/UserScript==

!function(){"use strict";const e="__deepseek_ctrl_enter_synthetic__",t=["搜索","查找","search"];function n(e,t){var n;try{n=new InputEvent("input",{bubbles:!0,inputType:t,data:null})}catch(e){n=new Event("input",{bubbles:!0})}e.dispatchEvent(n)}function r(e){Object.defineProperty(e,"keyCode",{get:function(){return 13}}),Object.defineProperty(e,"which",{get:function(){return 13}})}document.addEventListener("keydown",function(o){if(!o[e]&&"Enter"===o.key&&!o.isComposing&&229!==o.keyCode){var a=o.target;if(function(e){if(!e||1!==e.nodeType)return!1;if("TEXTAREA"===e.tagName){if("search"===e.getAttribute("type"))return!1;for(var n=(e.getAttribute("placeholder")||"").toLowerCase(),r=0;r<t.length;r++)if(n.indexOf(t[r])>=0)return!1;return!0}return!(!e.isContentEditable||e.closest&&e.closest('[role="search"]'))}(a))return function(e){return(e.ctrlKey||e.metaKey)&&!e.altKey}(o)?(o.preventDefault(),o.stopPropagation(),o.stopImmediatePropagation(),void function(t){var n=new KeyboardEvent("keydown",{key:"Enter",code:"Enter",bubbles:!0,cancelable:!0,composed:!0});r(n),n[e]=!0,t.dispatchEvent(n);var o=new KeyboardEvent("keyup",{key:"Enter",code:"Enter",bubbles:!0,cancelable:!0,composed:!0});r(o),o[e]=!0,t.dispatchEvent(o)}(a)):void(function(e){return!(e.shiftKey||e.altKey||e.ctrlKey||e.metaKey)}(o)&&(o.preventDefault(),o.stopPropagation(),o.stopImmediatePropagation(),function(e){"TEXTAREA"!==e.tagName?e.isContentEditable&&function(e){var t=!1;try{t=document.execCommand("insertLineBreak")}catch(e){t=!1}if(!t)try{t=document.execCommand("insertText",!1,"\n")}catch(e){t=!1}if(!t){var r=window.getSelection();if(r&&0!==r.rangeCount){var o=r.getRangeAt(0);o.deleteContents();var a=document.createElement("br");o.insertNode(a),o.setStartAfter(a),o.collapse(!0),r.removeAllRanges(),r.addRange(o),n(e,"insertLineBreak")}}}(e):function(e){var t=e.value,r="number"==typeof e.selectionStart?e.selectionStart:t.length,o="number"==typeof e.selectionEnd?e.selectionEnd:r;e.setRangeText("\n",r,o,"end"),n(e,"insertLineBreak")}(e)}(a)))}},!0),console.log("[DeepSeek Ctrl+Enter] 已启用：Enter 换行，Ctrl+Enter 发送")}();