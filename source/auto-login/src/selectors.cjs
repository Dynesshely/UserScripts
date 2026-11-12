module.exports = {
  selectors: [
    {
      Name: "1Panel",
      Path: "$entrance",
      Selector: {
        USERNAME:
          'input.el-input__inner[placeholder="用户名"], input[type="text"][placeholder="用户名"]',
        PASSWORD:
          'input.el-input__inner[placeholder="密码"], input[type="password"][placeholder="密码"]',
      },
      Login: {
        Selector: "button span",
        InnerText: "登录",
        NeedsValidation: false,
      },
    },
    {
      Name: "JumpServer",
      Path: "/core/auth/login/*",
      Selector: {
        USERNAME: "#id_username",
        PASSWORD: "#password",
      },
      Login: {
        Selector: 'button[type="submit"]',
        InnerText: null,
        NeedsValidation: true,
        Validator: {
          Selector: 'input[type="text"][placeholder="验证码"]',
        },
      },
    },
    {
      Name: "DataEase",
      Path: "/#/login*",
      Selector: {
        USERNAME: 'input.ed-input__inner[type="text"][placeholder="账号/邮箱"]',
        PASSWORD: 'input.ed-input__inner[type="password"][placeholder="密码"]',
      },
      Login: {
        Selector: "button span",
        InnerText: "登录",
        NeedsValidation: false,
      },
    },
    {
      Name: "Portainer",
      Path: "/#!/auth*",
      Selector: {
        USERNAME: "#username",
        PASSWORD: "#password",
      },
      Login: {
        Selector: 'button[type="submit"]',
        InnerText: null,
        NeedsValidation: true,
        Validator: {
          Selector: 'input[type="text"][placeholder="验证码"]',
        },
      },
    },
    {
      Name: "OMV",
      Path: "/#/login*",
      Selector: {
        USERNAME: "#mat-input-0",
        PASSWORD: "#mat-input-1",
      },
      Login: {
        Selector: "button span",
        InnerText: "登录",
        NeedsValidation: false,
      },
    },
    {
      Name: "TrueNAS",
      Path: "/ui/signin*",
      Selector: {
        USERNAME: 'input[type="text"][data-test="input-username"]',
        PASSWORD: 'input[type="password"][data-test="input-password"]',
      },
      Login: {
        Selector: "button span",
        InnerText: "登录",
        NeedsValidation: false,
      },
    },
  ],
};
