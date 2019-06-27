import Cookies from "./components/cookies";
import http from './components/http';
import Account from './Account.vue';


Vue.prototype.$cookies = new Cookies();
Vue.prototype.$http = http;
Vue.prototype.$Quill = Quill;

requestAnimationFrame(
    function c(){
        if(document.body.querySelector(".md-dialog")){
            document.body.querySelector("#vue-app").style.filter = "blur(10px)";
        }
        else{
            document.body.querySelector("#vue-app").style.filter = "";
        }
        requestAnimationFrame(c)
    }
)

var routes = [
    {
        path: "/",
        component: Account,
        name: "account",
        props: route => (route.query)
    },
    {
        path: "/:page",
        component: Account,
        props: route => (route.query)
    },
]

var router = new VueRouter({
    routes
});

new Vue({
    router
}).$mount("#vue-app")