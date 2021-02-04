import Cookies from "./cookies";
import Http from './http';
import requiredRule from "./rules/requiredRule"
import requiredLengthRule from "./rules/requiredLengthRule"
import emailRule from "./rules/emailRule"
import store from "./store"
import time from "./time"

import Account from './components/account/Account.vue';

import Home from './components/account/home/Home.vue';
import Admin from "./components/account/home/Admin.vue";
import Gallery from "./components/account/home/Gallery.vue";
import Events from "./components/account/home/Events.vue";
import CreateAdminForm from "./components/account/home/CreateAdminForm.vue";

import Articles from './components/account/articles/Articles.vue';
import Files from './components/account/files/Files.vue';

import Options from './components/account/options/Options.vue';
import ProfileSettings from './components/account/options/ProfileSettings.vue';
import PasswordSettings from './components/account/options/PasswordSettings.vue';

import VEmptyState from "./vuetify-extentions/VEmptyState.vue";
import VFileUploader from "./vuetify-extentions/VFileUploader.vue";
import VFileField from "./vuetify-extentions/VFileField.vue";
import VPasswordField from "./vuetify-extentions/VPasswordField.vue";
import VScrollView from "./vuetify-extentions/VScrollView.vue";
import VAuthentication from "./vuetify-extentions/VAuthentication.vue";
import VConfirmation from "./vuetify-extentions/VConfirmation.vue";
import VListAndDetails from "./vuetify-extentions/VListAndDetails.vue";
import VDateField from "./vuetify-extentions/VDateField.vue";

import "./app.scss"

Vue.use(Vuetify);
Vue.use(VueRouter);
// Vue.use(Vuex);
Vue.component("v-empty-state", VEmptyState);
Vue.component("v-password-field", VPasswordField);
Vue.component("v-scroll-view", VScrollView);
Vue.component("v-file-uploader", VFileUploader);
Vue.component("v-file-field", VFileField);
Vue.component("v-authentication", VAuthentication);
Vue.component("v-confirmation", VConfirmation);
Vue.component("v-list-and-details", VListAndDetails);
Vue.component("v-date-field", VDateField);

Vue.component("create-admin-form", CreateAdminForm);
Vue.component("profile-settings", ProfileSettings);
Vue.component("password-settings", PasswordSettings);
Vue.component("files", Files);


const base = location.pathname.substring(0, location.pathname.indexOf("/admin/") +6)
Vue.prototype.$base = base
Vue.prototype.$cookies = new Cookies();
Vue.prototype.$http = new Http({
    headers: {
        "X-CSRFToken": () => Vue.prototype.$cookies.get("csrftoken")
    },
    base
});
Vue.prototype.$Quill = Quill;
Vue.prototype.$time = time;
Vue.prototype.$requiredRule = requiredRule;
Vue.prototype.$requiredLengthRule = requiredLengthRule;
Vue.prototype.$emailRule = emailRule;

var routes = [
    {path: `${base}`, redirect: {name: "home"}, name: "account", component: Account, children: [
        {path: `${base}/home`, name: "home", component: Home, redirect: {name: "admin"}, children: [
            {path: `${base}/home/admin`, name: "admin", component: Admin},
            {path: `${base}/home/events`, name: "events", component: Events},
            {path: `${base}/home/gallery`, name: "gallery", component: Gallery},
        ]},
        {path: `${base}/articles`, name: "articles", component: Articles},
        {path: `${base}/files`, name: "files", component: Files},
        {path: `${base}/options`, name: "options", component: Options},
    ]}
]

var router = new VueRouter({
    mode: "history",
    routes
});

const vueApp = new Vue({
    store,
    router,
}).$mount("#vue-app")

// vueApp.$vuetify.theme.primary = "#003659"
// vueApp.$vuetify.theme.secondary = "#0b99a7"
// vueApp.$vuetify.theme.accent = "#37c4aa"