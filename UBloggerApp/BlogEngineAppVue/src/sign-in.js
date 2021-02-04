import SignIn from "./components/sign-in/SignIn.vue";
import Cookies from "./cookies";
import Http from './http';
import VPasswordField from "./vuetify-extentions/VPasswordField.vue"
import requiredRule from "./rules/requiredRule"
import requiredLengthRule from "./rules/requiredLengthRule"
import AccountRecovery from "./../../../AccountRecoveryApp/AccountRecoveryAppVue/src/components/AccountRecovery.vue"
import "./app.scss"

Vue.component("v-password-field", VPasswordField)
Vue.component("account-recovery", AccountRecovery)

const base = location.pathname.substring(0, location.pathname.indexOf("/admin/") +6)
Vue.prototype.$base = base
Vue.prototype.$cookies = new Cookies();
Vue.prototype.$http = new Http({
    headers: {
        "X-CSRFToken": Vue.prototype.$cookies.get("csrftoken")
    },
    base
});
Vue.prototype.$requiredRule = requiredRule;
Vue.prototype.$requiredLengthRule = requiredLengthRule;

const vueApp = new Vue({
    el: "#vue-app",
    render: (h) => h(SignIn)
})

// vueApp.$vuetify.theme.primary = "#003659"
// vueApp.$vuetify.theme.secondary = "#0b99a7"
// vueApp.$vuetify.theme.accent = "#37c4aa"