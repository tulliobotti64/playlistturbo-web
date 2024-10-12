import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://login.local.tebecloud.com/auth", 
  realm: "tebeclouddev",
  clientId: "playlistturbo",
});

export default {
  keycloak,

  init() {
    return new Promise((resolve, reject) => {
      keycloak
        .init({
          onLoad: "login-required",
          promiseType: "native",
        })
        .then((authenticated) => {
          if (!authenticated) {
            console.log("Usuário não autenticado!");
          }
          resolve(authenticated);
        })
        .catch((error) => {
          console.error("Erro durante a inicialização do Keycloak:", error);
          reject(error);
        });
    });
  },

  login() {
    return keycloak.login();
  },

  logout() {
    return keycloak.logout();
  },

  isAuthenticated() {
    return keycloak.authenticated;
  },

  getToken() {
    return keycloak.token;
  },

  updateToken(minValidity = 5) {
    return keycloak.updateToken(minValidity);
  },

  getUserProfile() {
    return keycloak.loadUserProfile();
  },
};
