"use strict";

/**
 * Auto Login 配置模型与存储
 *
 * 存储键保持与旧版 GM_config 一致（auto-login-config-<hostname>），
 * 老配置可直接读取，无需迁移。
 */

const SITE_TYPES = [
  "1Panel",
  "JumpServer",
  "DataEase",
  "Portainer",
  "OMV",
  "TrueNAS",
];

const FIELD_DEFAULTS = {
  username: "USERNAME",
  password: "PASSWORD",
  site_type: "1Panel",
  site_enabled: false,
  site_entrance: "",
};

const TERMS_TEXT =
  "我已知晓：账号密码仅保存在本机浏览器存储中，不会上传到任何服务器；" +
  "脚本会在匹配的登录页面自动填充并提交表单。";

function storageKey(hostname) {
  return "auto-login-config-" + hostname;
}

function gmGet(key, fallback) {
  try {
    if (typeof GM_getValue === "function") {
      return GM_getValue(key, fallback);
    }
  } catch (error) {
    console.warn("[Auto Login] 读取配置失败", error);
  }

  return fallback;
}

function gmSet(key, value) {
  try {
    if (typeof GM_setValue === "function") {
      GM_setValue(key, value);
      return true;
    }
  } catch (error) {
    console.warn("[Auto Login] 保存配置失败", error);
  }

  return false;
}

function parseStored(raw) {
  if (raw === null || raw === undefined || raw === "") {
    return null;
  }

  if (typeof raw === "object") {
    return raw;
  }

  try {
    const parsed = JSON.parse(String(raw));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    return null;
  }
}

function normalize(stored) {
  const source = stored && typeof stored === "object" ? stored : {};

  const username =
    typeof source.username === "string" ? source.username.trim() : "";
  const password =
    typeof source.password === "string" ? source.password : "";
  const siteType = SITE_TYPES.includes(source.site_type)
    ? source.site_type
    : FIELD_DEFAULTS.site_type;
  const entrance =
    typeof source.site_entrance === "string" ? source.site_entrance : "";

  const configured =
    username !== "" && username !== FIELD_DEFAULTS.username && password !== "";
  const enabled =
    typeof source.site_enabled === "boolean"
      ? source.site_enabled
      : configured;

  // GM_config 时期的旧配置没有 terms_accepted 字段：已有凭据即视为已同意
  const legacy = stored && !Object.prototype.hasOwnProperty.call(stored, "terms_accepted");
  const termsAccepted =
    typeof source.terms_accepted === "boolean"
      ? source.terms_accepted
      : Boolean(legacy && configured);

  return {
    username,
    password,
    site_type: siteType,
    site_enabled: enabled,
    site_entrance: entrance,
    terms_accepted: termsAccepted,
  };
}

function loadConfig(hostname) {
  return normalize(parseStored(gmGet(storageKey(hostname), null)));
}

function saveConfig(hostname, values) {
  const payload = normalize(values);
  gmSet(storageKey(hostname), JSON.stringify(payload));
  return payload;
}

function clearConfig(hostname) {
  const empty = normalize({});
  empty.terms_accepted = false;
  empty.site_enabled = false;
  gmSet(storageKey(hostname), JSON.stringify(empty));
  return empty;
}

module.exports = {
  SITE_TYPES,
  FIELD_DEFAULTS,
  TERMS_TEXT,
  storageKey,
  loadConfig,
  saveConfig,
  clearConfig,
};
