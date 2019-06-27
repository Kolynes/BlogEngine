import SignIn from "./components/sign-in/SignIn.vue";
import Cookies from "./cookies";
import http from './http';
import VPasswordField from "./vuetify-extentions/VPasswordField.vue"
import requiredRule from "./rules/requiredRule"

Vue.component("v-password-field", VPasswordField)
Vue.prototype.$cookies = new Cookies();
Vue.prototype.$http = http;
Vue.prototype.$requiredRule = requiredRule;

const vueApp = new Vue({
    el: "#vue-app",
    render: (h) => h(SignIn)
})

vueApp.$vuetify.theme.primary = "#003659"
vueApp.$vuetify.theme.secondary = "#0b99a7"
vueApp.$vuetify.theme.accent = "#37c4aa"