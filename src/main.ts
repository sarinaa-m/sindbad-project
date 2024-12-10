import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import "./assets/color.css"
import "./assets/style.css";
import "./assets/fonts/Roboto/index.css"
const app = createApp(App);

app.use(router);
app.mount('#app');
