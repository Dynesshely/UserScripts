/**
 * Disable Websites' PCDN
 *
 * 直接删除页面上下文中与 WebRTC / DataChannel 相关的全局构造器，
 * 让网站无法通过 PCDN 的 WebRTC 通道把访问者当作上传节点。
 */
(function () {
    'use strict';

    console.log("🔵 Websites' PCDN disabled!");

    delete window.RTCPeerConnection;
    delete window.mozRTCPeerConnection;
    delete window.webkitRTCPeerConnection;
    delete window.RTCDataChannel;
    delete window.DataChannel;
})();
