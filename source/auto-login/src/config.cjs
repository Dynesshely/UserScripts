module.exports = {
  fields: {
    username: {
      type: "text",
      default: "USERNAME",
      label: "Your User Name",
    },
    password: {
      type: "text",
      default: "PASSWORD",
      label: "Your Password",
    },
    site_type: {
      type: "select",
      default: "1Panel",
      label: "Your Site Type",
      options: [
        "1Panel",
        "JumpServer",
        "DataEase",
        "Portainer",
        "OMV",
        "TrueNAS",
      ],
    },
    site_enabled: {
      type: "checkbox",
      default: false,
      label: "Enable Site Auto Login",
    },
    site_entrance: {
      type: "text",
      default: null,
      label: "Site entrance path (optional)",
    },
  },
};
