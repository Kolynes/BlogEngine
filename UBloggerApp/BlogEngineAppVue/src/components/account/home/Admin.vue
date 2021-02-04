<template>
    <v-container grid-list-xl fluid>
        <v-layout  class="mb-4" wrap>
            <v-flex xs12 sm6 md5>
                <v-card :style="{transform: `translateY(${translation}px)`}" class="mb-3">
                    <v-card-text>
                        <v-layout align-center class="mx-1" >
                            <v-avatar size="60" :color="storeProfilePicture? 'black' : 'accent'" class="mb-2">
                                <v-icon v-if="!storeProfilePicture" color="white">person_outline</v-icon>
                                <img :src="`${$base}/../profile-pictures/${storeProfilePicture}`" v-else/>
                            </v-avatar>
                            <v-flex >
                                <h3>{{storeUsername}}</h3>
                                <h4>{{storeName}}</h4>
                                <h4>last active on {{storeLastActive}}</h4>
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                </v-card>
                <v-card :style="{transform: `translateY(${translation}px)`}" class="mb-3">
                    <v-card-text>
                        <v-layout align-center class="mx-1" >
                            <v-avatar color="accent" class="mb-2">
                                <v-icon color="white">description</v-icon>
                            </v-avatar>
                            <v-flex>
                                {{storeArticleCount || "No"}} Article{{storeArticleCount == 1? "" : "s"}} 
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                </v-card>
                <v-card :style="{transform: `translateY(${translation}px)`}" class="mb-3">
                    <v-card-text>
                        <v-layout align-center class="mx-1" >
                            <v-avatar color="accent" class="mb-2">
                                <v-icon color="white">today</v-icon>
                            </v-avatar>
                            <v-flex>
                                {{storeEventCount || "No"}} Event{{storeEventCount == 1? "" : "s"}} 
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                </v-card>
                <v-card :style="{transform: `translateY(${translation}px)`}" class="mb-3">
                    <v-card-text>
                        <v-layout align-center class="mx-1" >
                            <v-avatar color="accent" class="mb-2">
                                <v-icon color="white">collections</v-icon>
                            </v-avatar>
                            <v-flex>
                                {{storeGalleryCount || "No"}} Gallery Image{{storeGalleryCount == 1? "" : "s"}} 
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                </v-card>
            </v-flex>
            <v-flex xs12 sm6 md7>
                <v-layout>
                    <h2 class="subheading ml-3"><v-icon>people</v-icon> Accounts</h2>
                    <v-spacer/>
                    <v-btn icon color="primary" @click="showCreateAdminDialog = true">
                        <v-icon>person_add</v-icon>
                    </v-btn>
                </v-layout>
                <v-list two-line>
                    <template v-for="(item, index) in storeAdmins" >
                        <v-list-tile :key="index">
                            <v-list-tile-action>
                                <v-avatar :color="item.profilePicture? 'black' : 'accent'" class="mb-2">
                                    <v-icon v-if="!item.profilePicture" color="white">person_outline</v-icon>
                                    <img :src="`${$base}/../profile-pictures/${item.profilePicture}`" v-else/>
                                </v-avatar>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>{{item.username == storeUsername? "You" : item.username}}</v-list-tile-title>
                                <span class="caption">{{item.name}}</span>
                                <span class="caption">{{item.email}}</span>
                            </v-list-tile-content>
                            <v-spacer/>
                            <v-btn icon @click="deleteAdmin(item)" v-if="storeIsSuperuser && (item.username != storeUsername || !item.isSuperuser)">
                                <v-icon>delete</v-icon>
                            </v-btn>
                        </v-list-tile>
                        <v-divider inset :key="index + 'df'"/>
                    </template>
                </v-list>
                <center>
                    <v-progress-circular indeterminate v-if="loadingAdmin" color="primary"/>
                </center>
            </v-flex>
        </v-layout>
        <v-snackbar bottom :left="$vuetify.breakpoint.smAndUp" v-model="showSnackbar">
            <v-icon :color="snackbarMessage.iconColor">{{snackbarMessage.icon}}</v-icon>
            <span class="ml-2">{{snackbarMessage.message}}</span>
            <v-spacer/>
            <v-btn icon @click="showSnackbar = false">
                <v-icon>close</v-icon>
            </v-btn>
        </v-snackbar>
        <v-dialog v-model="showCreateAdminDialog" persistent :fullscreen="$vuetify.breakpoint.xs" width="500">
            <create-admin-form @created="loadAdmins" dialog @close="showCreateAdminDialog = false"/>
        </v-dialog>
        <v-confirmation ref="confirmation"/>
    </v-container>
</template>

<script>
export default {
    data(){
        return {
            showSnackbar: false,
            snackbarMessage: [],
            showCreateAdminDialog: false,
            loadingAdmin: true,
            translation: "0"
        }
    },
    computed: Object.assign({},
        Vuex.mapState({
            storeUsername: state => state.username,
            storeName: state => state.name,
            storeEmail: state => state.email,
            storeDescription: state => state.description,
            storeProfilePicture: state => state.profilePicture,
            storeLastActive: state => Vue.prototype.$time.datetime(state.lastActive),
            storeAdmins: state => state.admins,
            storeIsSuperuser: state => state.isSuperuser,
            storeArticleCount: state => state.articleCount,
            storeEventCount: state => state.eventCount,
            storeGalleryCount: state => state.galleryCount,
        })
    ),
    methods: Object.assign({}, 
        Vuex.mapMutations([
            "setAdmins"
        ]),
        {
            loadAdmins(){
                this.loadingAdmin = true
                this.$http.request({
                    url: "home/admins/"
                }).then(response => {
                    response = response.json()
                    this.loadingAdmin = false
                    if(response.status){
                        this.setAdmins(response.data.admins)
                    }
                    else {
                        this.snackbarMessage = {icon: "warning", iconColor: "red", message: "Failed to load Admins"}
                        this.showSnackbar = true
                    }
                }).catch(reason => {
                    console.log(reason)
                    this.loadingAdmin = false
                    this.snackbarMessage = {icon: "warning", iconColor: "red", message: "Failed to load Admins"}
                    this.showSnackbar = true
                })
            },
            deleteAdmin(item){
                this.$refs.confirmation.confirm({message: "Are you sure you want to delete this admin?"}).then(value => {
                    if(value === true){
                        var form = new FormData()
                        form.append("username", item.username)
                        item.deleting = true;
                        this.$http.request({
                            url: "home/delete-admin/",
                            method: "POST",
                            content: form
                        }).then(response => {
                            response = response.json()
                            item.deleting = false;
                            if(response.status){
                                this.loadAdmins()
                                this.snackbarMessage = {icon: "done", iconColor: "success", message: "Account deleted"}
                                this.showSnackbar = true
                            }
                            else {
                                this.snackbarMessage = {icon: "warning", iconColor: "red", message: response.error}
                                this.showSnackbar = true
                            }
                        }).catch(reason => {
                            console.log(reason)
                            this.snackbarMessage = {icon: "warning", iconColor: "red", message: "Failed to delete Account. Please try again"}
                            this.showSnackbar = true
                        })
                    }
                })
            }
        }
    ),
    mounted(){
        this.loadAdmins()
        document.addEventListener("scroll", () => this.$vuetify.breakpoint.xs? null : this.translation = scrollY)
    }
}
</script>
