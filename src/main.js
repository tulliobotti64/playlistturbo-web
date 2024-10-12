import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from "primevue/config";
import Dropdown from 'primevue/dropdown';
import auth from './services/auth';

auth.init()
.then(() => {
  console.log("in the way to authenticate");

    const app = createApp(App)
    app.use(PrimeVue)
    app.component("Dropdown", Dropdown);
    app.use(router)
    app.config.globalProperties.$keycloak = auth.keycloak;
    
    app.mount('#app')
  })
  .catch((error) => {
    console.error("Erro na autenticação:", error);
  });

