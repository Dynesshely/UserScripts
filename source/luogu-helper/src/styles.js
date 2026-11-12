// 注入页面的样式文本（自原脚本内联模板字符串抽出，内容保持不变）
export const styles = `#lh-fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #3498db;
  color: #fff;
  border: none;
  cursor: pointer;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 2px 10px rgba(0,0,0,.25);
  transition: transform .2s, background .2s, box-shadow .2s;
  user-select: none;
  padding: 0;
}
#lh-fab:hover {
  transform: scale(1.08);
  background: #2980b9;
  box-shadow: 0 4px 14px rgba(0,0,0,.3);
}
#lh-fab:active {
  transform: scale(.95);
}

#lh-panel {
  position: fixed;
  bottom: 84px;
  right: 28px;
  width: 380px;
  max-height: 55vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,.18);
  z-index: 99998;
  display: none;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  font-size: 14px;
  color: #333;
}
#lh-panel.show {
  display: flex;
}

#lh-panel .lh-panel-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  font-weight: 600;
  font-size: 15px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}
#lh-panel .lh-panel-close {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 0;
}
#lh-panel .lh-panel-close:hover {
  background: #f0f0f0;
  color: #333;
}

#lh-panel .lh-panel-body {
  overflow-y: auto;
  flex: 1;
}

#lh-panel .lh-section {
  padding: 10px 16px;
}
#lh-panel .lh-section + .lh-section {
  border-top: 1px solid #f0f0f0;
}

#lh-panel .lh-sec-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
#lh-panel .lh-sec-title {
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
#lh-panel .lh-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
#lh-panel .lh-dot.ac  { background: #27ae60; }
#lh-panel .lh-dot.wa  { background: #e74c3c; }
#lh-panel .lh-dot.ud  { background: #95a5a6; }

#lh-panel .lh-copy {
  font-size: 11px;
  padding: 3px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fafafa;
  cursor: pointer;
  color: #888;
  transition: all .15s;
  white-space: nowrap;
  flex-shrink: 0;
}
#lh-panel .lh-copy:hover {
  background: #eee;
  border-color: #ccc;
  color: #555;
}
#lh-panel .lh-copy.ok {
  background: #27ae60;
  color: #fff;
  border-color: #27ae60;
}

#lh-panel .lh-pids {
  color: #555;
  line-height: 1.7;
  word-break: break-all;
  font-size: 13px;
  font-family: 'Consolas','Source Code Pro',monospace;
}
#lh-panel .lh-empty {
  color: #bbb;
  font-style: italic;
  font-size: 12px;
}
`;
