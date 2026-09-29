// Dev server: IdP URL from VITE_IDP_LOGIN_URI (.env.development).
// Container startup overwrites this file from runtime-config.js.template.
window.__MENTORHUB_RUNTIME__ = Object.assign(window.__MENTORHUB_RUNTIME__ || {}, {
  IDP_LOGIN_URI: 'http://localhost:8080/login.html',
});
