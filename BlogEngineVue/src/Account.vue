<template>
    <md-app :md-theme="appTheme" v-if="showContent" md-mode="fixed" >
        <md-app-toolbar class="md-primary">
            <div class="md-toolbar-section-start">
                <h1 class="md-title">UBlogger</h1>
            </div>
            <div class="md-toolbar-section-end">
                <md-menu md-dense>
                    <md-button md-menu-trigger class="md-icon-button">
                        <md-icon>more_vert</md-icon>
                    </md-button>
                    <md-menu-content>
                        <md-menu-item>
                            <md-icon>info</md-icon>
                            <span>About UBlogger</span>
                        </md-menu-item>
                        <md-menu-item @click="switchAppTheme">
                            <md-icon>invert_colors</md-icon>
                            <span>Change Theme</span>
                        </md-menu-item>
                    </md-menu-content>
                </md-menu>
            </div>
        </md-app-toolbar>
        <md-app-drawer md-permanent="clipped" md-theme="night-time">
            <md-list>
                <md-list-item to="/administration">
                    <md-icon>supervisor_account</md-icon>
                    <span class="md-list-item-text">Administration</span>
                </md-list-item>
                <md-list-item to="/profile">
                    <md-icon>person</md-icon>
                    <span class="md-list-item-text">My Profile</span>
                </md-list-item>
                <md-list-item to="/articles">
                    <md-icon>edit</md-icon>
                    <span class="md-list-item-text">Articles</span>
                </md-list-item>
                <md-list-item to="/files">
                    <md-icon>storage</md-icon>
                    <span class="md-list-item-text">Files</span>
                </md-list-item>
                <md-list-item @click="showSignOutDialog = true">
                    <md-icon>power_settings_new</md-icon>
                    <span class="md-list-item-text">Sign Out</span>
                </md-list-item>
            </md-list>
        </md-app-drawer>
        <md-app-content>
            <div id="pages">
                <transition name="slide">
                    <admin v-if="$route.params.page == 'administration'"/>
                    <Files v-else-if="$route.params.page == 'files'"/>
                    <articles v-else-if="$route.params.page == 'articles'"/>
                    <profile v-else-if="$route.params.page == 'profile'"/>
                </transition>
            </div>
            <md-bottom-bar md-sync-route md-type="shift" class="md-dense">
                <md-bottom-bar-item md-icon="supervisor_account" md-label="Admin" to="/administration"/>
                <md-bottom-bar-item md-icon="person" md-label="My Profile" to="/profile"/>
                <md-bottom-bar-item md-icon="edit" md-label="Articles" to="/articles"/>
                <md-bottom-bar-item md-icon="storage" md-label="Files" to="/files"/>
                <md-bottom-bar-item md-icon="power_settings_new" md-label="Sign Out" @click="showSignOutDialog = true;"/>
            </md-bottom-bar>
            <md-dialog :md-active.sync="showSignOutDialog" :md-fullscreen="false">
                <md-dialog-content>
                    <span>Are you sure you want to sign out?</span>
                    <md-dialog-actions>
                        <md-button class="md-primary md-raised" @click="showSignOutDialog = false; signOut()">Yes</md-button>
                        <md-button class="md-primary" @click="showSignOutDialog = false">No</md-button>
                    </md-dialog-actions>
                </md-dialog-content>
            </md-dialog>
        </md-app-content>
    </md-app>
</template>

<script>
import Files from "./components/Files.vue";
import Articles from "./components/Articles.vue";
import Profile from "./components/Profile.vue";
import Admin from "./components/Admin.vue";

export default {
    data(){
        return {
            showContent: false,
            showSignOutDialog: false,
            appTheme: this.$cookies.get("app-theme") || "default"
        }
    },
    props:{
        username: String
    },
    components:{
        Files,
        Articles,
        Profile,
        Admin
    },
    mounted(){
        this.$http.request({
            url: "ping/", 
        }).then(response => {
            response = response.json()
            if(!response.result){
                this.showContent = false;
            }
            else{
                this.$cookies.set("username", response.data.username)
                this.$cookies.set("email", response.data.email)
                sessionStorage.setItem("description", response.data.description == null? "" : response.data.description)
                this.$cookies.set("hash", response.data.hash)
                this.$cookies.set("first-name", response.data.fullName.substring(0, response.data.fullName.lastIndexOf(" ")))
                this.$cookies.set("last-name", response.data.fullName.substring(response.data.fullName.lastIndexOf(" ") + 1))
                this.$cookies.set("last-signed-in", response.data.lastSignedIn)
                this.$cookies.set("immunity", response.data.immunity)
                this.$cookies.set("article-count", response.data.articleCount)
                this.$cookies.set("event-count", response.data.eventCount)
                this.$cookies.set("gallery-count", response.data.galleryCount)
                this.$nextTick().then(this.updateTheming)
                this.showContent = true;
                Vue.prototype.profilePicture = `../profile-picture?by=${Vue.prototype.$cookies.get("hash")}`
                if(this.$route.path == "/"){
                    this.$router.push({path: "/administration/"})
                }
            }
        })
    },
    updated(){
        this.updateTheming()
    },
    methods: {
        signOut(){
            this.$http.request({
                url: "sign-out/", 
                method: "POST",
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
            }).then(() => {
                sessionStorage.clear()
                this.$cookies.clear()
                window.location = ""
            })
        },
        switchAppTheme(){
            if(this.appTheme == "default"){
                this.appTheme = "night-time"
            }
            else{
                this.appTheme = "default"
            }
        },
        updateTheming(){
            if(this.appTheme == 'night-time'){
                var cards = document.querySelectorAll(".md-card.md-theme-night-time:not(.item):not(.exclude-from-night-theme)")
                for(var i = 0; i < cards.length; i++){
                    cards[i].classList.add("md-accent")
                }
            }
            else{
                var cards = document.querySelectorAll(".md-card.md-theme-default:not(.item):not(.exclude-from-night-theme)")
                for(var i = 0; i < cards.length; i++){
                    cards[i].classList.remove("md-accent")
                }
            }
        }
    },
    watch: {
        appTheme(newValue){
            this.$cookies.set("app-theme", newValue)
            this.$nextTick().then(this.updateTheming)
        }
    },
}

</script>

<style lang="scss">
    @import "vue-material/dist/components/MdLayout/variables.scss";

    .md-app{ 
        height: 100vh;  
        transition: filter .5s linear;
        .md-app-drawer{
            @media screen and (min-width: $md-breakpoint-xsmall){
                width: auto;
            }
        }
        .md-app-content{
            height: auto;
            min-height: 90vh;
            overflow-x: hidden;
            #pages{
                display: flex;
                justify-content: flex-start;
                width: 200%;
                position:relative;
                & >*{
                    width:50%;
                    margin-bottom: 65px;
                    @media screen and (min-width: $md-breakpoint-xsmall){
                        margin-bottom: 0;
                    }
                }
                
            }
            .md-bottom-bar{
                position: fixed !important;
                z-index: 100;
                left: 0;
                right: 0;
                bottom: 0 !important;
                @media screen and (min-width: $md-breakpoint-xsmall){
                    visibility: hidden;
                }
            }

        }
    }

    .slide-enter{
        transform: translateX(0);
        opacity: 0;
    }
    .slide-enter-to{
        transform: translateX(-100%);
        opacity: 1;
    }
    .slide-enter-active, .slide-leave-active{
        transition: transform .7s ease-out, opacity .7s ease-out;
    }

    .slide-leave{
        transform: translateY(0);
        opacity: 1;
    }
    .slide-leave-to{
        transform: translateY(100%);
        opacity: 0;
    }
</style>
