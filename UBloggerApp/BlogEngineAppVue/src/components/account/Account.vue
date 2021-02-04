<template>
    <v-app class="animated fadeIn" :dark="storeDark">
        <template v-if="!loadingDashboard">
            <v-navigation-drawer app v-model="showDrawer" :mini-variant="mini" light v-if="$vuetify.breakpoint.mdAndUp">
                <v-list>
                    <v-list-tile v-if="$vuetify.breakpoint.lgAndUp">
                        <v-list-tile-action>
                            <v-btn icon large @click="mini = !mini">
                                <v-icon>menu</v-icon>
                            </v-btn>
                        </v-list-tile-action>
                    </v-list-tile>
                    <v-list-tile class="my-2" :to="item.to" @click="item.click" v-for="item in drawerItems" :key="item.name" >
                        <v-list-tile-action @click="mini = true">
                            <v-badge color="red" right :value="item.badgeValue > 0">
                                <template slot="badge">
                                    <span class="font-weight-bold caption">{{item.badgeValue > 99? "99+" : item.badgeValue}}</span>
                                </template>
                                <v-icon>{{item.icon}}</v-icon>
                            </v-badge>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-text class="font-weight-bold">{{item.name}}</v-list-tile-text>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </v-navigation-drawer>
            <v-toolbar app dense :scroll-off-screen="$vuetify.breakpoint.xs" :flat="flat" >
                <v-btn icon large @click="showDrawer = !showDrawer" v-if="$vuetify.breakpoint.mdOnly" class="mr-2">
                    <v-icon>menu</v-icon>
                </v-btn>
                <span class="subheading font-weight-bold">UBlogger</span>
                <v-spacer/>
            </v-toolbar>
            <v-content>
                <router-view/>
            </v-content>
            <v-bottom-nav app dense :color="showSignOutDialog? 'red' : 'primary'" :active.sync="currentRoute" :value="$vuetify.breakpoint.smAndDown" shift>
                <v-btn :value="item.name.toLowerCase()" color="white" flat @click="item.click();" :to="item.to" v-for="item in drawerItems" :key="item.name">
                    <span class="font-weight-bold">{{item.name}}</span>
                    <v-badge color="red" right :value="item.badgeValue > 0">
                        <template slot="badge">
                            <span class="font-weight-bold caption">{{item.badgeValue > 99? "99+" : item.badgeValue}}</span>
                        </template>
                        <v-icon>{{item.icon}}</v-icon>
                    </v-badge>
                </v-btn>
            </v-bottom-nav>
            <v-dialog v-model="showSignOutDialog" width="300" persistent>
                <v-card>
                    <v-card-title>
                        <h2 class="font-weight-bold title"><v-icon>power_settings_new</v-icon> Sign Out</h2>
                    </v-card-title>
                    <v-card-text>
                        <span class="subheading">Are you sure you want to sign out?</span>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn round small class="font-weight-bold" color="primary" @click="signOut" :loading="signingOut">yes</v-btn>
                        <v-btn round small class="font-weight-bold" @click="showSignOutDialog = false; setNavigationValue($route)" :disabled="signingOut">no</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-snackbar bottom :left="$vuetify.breakpoint.smAndUp" v-model="showSnackbar">
                <v-icon :color="snackbarMessage.iconColor">{{snackbarMessage.icon}}</v-icon>
                <span class="ml-2">{{snackbarMessage.message}}</span>
                <v-spacer/>
                <v-btn icon @click="showSnackbar = false">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-snackbar>
        </template>
        <v-dialog :value="loadingDashboard" persistent width="200">
            <v-card>
                <v-card-text>
                    <span class="ml-2">Initializing</span><br>
                    <v-progress-linear color="primary" indeterminate width="2" size="30"/>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-app>
</template>

<script>
export default {
    data(){
        return {
            setShowDrawer: false,
            setMini: true,
            showSignOutDialog: false,
            showNotificationsDrawer: false,
            currentRoute: "red",
            signingOut: false,
            showSnackbar: false,
            snackbarMessage: {},
            loadingDashboard: true,
            flat: true,
            drawerItems: [
                {click: () => null, to: {name: "home"}, name: "Home", icon: "home", badgeValue: 0},
                {click: () => null, to: {name: "articles"}, name: "Articles", icon: "description", badgeValue: 0},
                {click: () => null, to: {name: "files"}, name: "Files", icon: "folder", badgeValue: 0},
                {click: () => null, to: {name: "options"}, name: "Options", icon: "settings", badgeValue: 0},
                {click: () => this.showSignOutDialog = true, to: null, name: "Sign Out", icon: "power_settings_new", badgeValue: 0},
            ]
        }
    },
    computed: Object.assign({},
        Vuex.mapState({
            username: state => state.username,
            storeDark: state => state.dark
        }),
        {
            mini: {
                set(value){
                    this.setMini = value
                }, 
                get(){
                    if(this.$vuetify.breakpoint.lgAndUp){
                        return this.setMini
                    }
                    else {
                        return false;
                    }
                }
            },
            showDrawer: {
                set(value){
                    this.setShowDrawer = value
                },
                get(){
                    if(this.$vuetify.breakpoint.lgAndUp){
                        return true
                    }
                    else {
                        return this.setShowDrawer;
                    }
                }
            },
        }
    ),
    methods: Object.assign({},
        {
            signOut(){
                this.signingOut = true
                this.$http.request({
                    url: `sign-out`,
                }).then(response => {
                    response = response.json();
                    if(!response.status){
                        this.signingOut = false;
                        this.showSnackbar = true;
                        this.snackbarMessage = {icon: "warning", iconColor: "red", message: "Failed to sign you out. Please try again!"}
                    }
                    else{
                        window.location.href = ""
                    }
                }).catch(reason => {
                    this.signingOut = false;
                    this.showSnackbar = true;
                    this.snackbarMessage = {icon: "warning", iconColor: "red", message: "Failed to sign you out. Please try again!"}
                })
            },
            setNavigationValue(route){
                if(route && route != this.$route){
                    this.$router.push(route)
                }
                name = (route || {name: "red"}).name
                this.currentRoute = name
            }
        },
        Vuex.mapMutations([
            "setUsername",
            "setEmail",
            "setProfilePicture",
            "setName",
            "setDescription",
            "setArticleCount",
            "setGalleryCount",
            "setEventCount",
            "setLastActive",
            "setIsSuperuser"
        ])
    ),
    watch: {
        showNotificationsDrawer(newValue){
            this.showDrawer = false
        },
        $route(){
            this.$vuetify.goTo(0)
            this.setNavigationValue(this.$route)
        }
    },
    mounted(){
        this.setNavigationValue(this.$route)
        document.addEventListener("scroll", () => this.flat = window.scrollY == 0)
        this.$http.request({
            url: "ping"
        }).then(response => {
            response = response.json();
            this.loadingDashboard = false
            if(response.status){
                this.setUsername(response.data.username);
                this.setName(response.data.name);
                this.setEmail(response.data.email);
                this.setDescription(response.data.description);
                this.setProfilePicture(response.data.profilePicture);
                this.setArticleCount(response.data.articleCount);
                this.setEventCount(response.data.eventCount);
                this.setGalleryCount(response.data.galleryCount);
                this.setLastActive(response.data.lastActive);
                this.setIsSuperuser(response.data.isSuperuser)
            }
            else{
                this.snackbarMessage = {icon: "warning", iconColor: "red", message: "Failed to communicate with the server"}
                this.showSnackbar = true;
            }
        }).catch(reason => {
            this.loadingDashboard = false
            this.snackbarMessage = {icon: "warning", iconColor: "red", message: "Failed to communicate with the server"}
            this.showSnackbar = true;
        })
    }
}
</script>
