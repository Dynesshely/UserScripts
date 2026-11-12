"use strict";

/**
 * Auto Login 配置模型与存储
 *
 * - 站点凭据：auto-login-config-<hostname>（与旧版 GM_config 键一致，兼容旧数据）
 * - 自定义站点（示教结果）：auto-login-custom-site-<hostname>
 */

const CUSTOM_SITE_TYPE = "__custom__";

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

const ACTIONS = {
  FILL_USERNAME: "fill:username",
  FILL_PASSWORD: "fill:password",
  CLICK: "click",
};

function storageKey(hostname) {
  return "auto-login-config-" + hostname;
}

function customSiteKey(hostname) {
  return "auto-login-custom-site-" + hostname;
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

  const allowedType =
    source.site_type === CUSTOM_SITE_TYPE ||
    SITE_TYPES.includes(source.site_type);
  const siteType = allowedType ? source.site_type : FIELD_DEFAULTS.site_type;

  const entrance =
    typeof source.site_entrance === "string" ? source.site_entrance : "";

  const configured =
    username !== "" && username !== FIELD_DEFAULTS.username && password !== "";
  const enabled =
    typeof source.site_enabled === "boolean"
      ? source.site_enabled
      : configured;

  // GM_config 时期的旧配置没有 terms_accepted 字段：已有凭据即视为已同意
  const legacy =
    stored && !Object.prototype.hasOwnProperty.call(stored, "terms_accepted");
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

/**
 * 校验示教得到的动作序列
 * 至少需要“填写用户名 + 填写密码 + 点击登录”三类动作。
 */
function normalizeCustomSite(store) {
  const source = store && typeof store === "object" ? store : {};
  const rawSteps = Array.isArray(source.steps) ? source.steps : [];
  const steps = [];

  rawSteps.forEach(function (item) {
    if (!item || typeof item !== "object") {
      return;
    }

    const selector = typeof item.selector === "string" ? item.selector : "";
    if (!selector) {
      return;
    }

    if (item.action === "fill" && (item.field === "username" || item.field === "password")) {
      steps.push({ action: "fill", field: item.field, selector: selector });
    } else if (item.action === "click") {
      steps.push({ action: "click", selector: selector });
    }
  });

  const hasUsername = steps.some(function (item) {
    return item.action === "fill" && item.field === "username";
  });
  const hasPassword = steps.some(function (item) {
    return item.action === "fill" && item.field === "password";
  });
  const hasClick = steps.some(function (item) {
    return item.action === "click";
  });

  if (!hasUsername || !hasPassword || !hasClick) {
    return null;
  }

  return {
    steps: steps,
    updatedAt: typeof source.updatedAt === "number" ? source.updatedAt : Date.now(),
  };
}

function loadCustomSite(hostname) {
  return normalizeCustomSite(parseStored(gmGet(customSiteKey(hostname), null)));
}

function saveCustomSite(hostname, store) {
  const normalized = normalizeCustomSite(store);
  if (!normalized) {
    return null;
  }
  gmSet(customSiteKey(hostname), JSON.stringify(normalized));
  return normalized;
}

function clearCustomSite(hostname) {
  gmSet(customSiteKey(hostname), "");
}

module.exports = {
  CUSTOM_SITE_TYPE,
  SITE_TYPES,
  FIELD_DEFAULTS,
  TERMS_TEXT,
  ACTIONS,
  storageKey,
  customSiteKey,
  loadConfig,
  saveConfig,
  clearConfig,
  loadCustomSite,
  saveCustomSite,
  clearCustomSite,
};
