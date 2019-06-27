<template>
    <div>
        <md-card class="md-layout-item md-small-size-100">
            <md-toolbar class="md-transparent md-dense" style="padding-top: 16px;"  :md-elevation="0">
                <span class="md-subheading" ><md-icon class="md-size-2x">account_box</md-icon> Accounts</span>
                <div class="md-toolbar-row">
                    <md-field>
                        <label>Search</label>
                        <md-input v-model="searchString"  style="display: inline; width: 100%;"/>
                        <md-button class="md-icon-button" v-if="$cookies.get('immunity') == 'true'" @click="showCreateAdminForm = true">
                            <md-icon>person_add</md-icon>
                        </md-button>
                    </md-field>
                </div>
            </md-toolbar>
            <md-card-content class="md-scrollbar" id="admin-list">
                <md-list class="md-dense" style="background: transparent" v-if="filteredAdmins.length">
                    <template v-for="admin in filteredAdmins">
                        <md-list-item :key="admin.hash" >
                            <md-avatar class="md-medium">
                                <img :src="admin.hash == $cookies.get('hash')? profilePicture : `/profile-picture/?by=${admin.hash}`"/>
                            </md-avatar>
                            <span class="md-list-item-text">{{admin.username == $cookies.get("username")? "You" : admin.fullName}}</span>
                            <md-button class="md-icon-button" v-if="$cookies.get('immunity') == 'true' && admin.immunity != true && admin.username != $cookies.get('username') " @click="adminToDelete = admin; showDeleteAdminDialog = true">
                                <md-icon>delete</md-icon>
                            </md-button>
                        </md-list-item>
                        <md-divider class="md-inset" :key="admin.hash + 'divider'"></md-divider>
                    </template>
                </md-list>
                <md-empty-state v-if="!filteredAdmins.length && searchString" md-label="No Results" :md-description="`Couldn't find anything related to '${this.searchString}'`"/>
            </md-card-content>
        </md-card>
        <create-admin-form :show-dialog="showCreateAdminForm" v-if="showCreateAdminForm" @close="showCreateAdminForm = false" @fail="fail" @success="success"/>
        <md-dialog :md-active.sync="showDeleteAdminDialog" :md-fullscreen="false" :md-click-outside-to-close="!deleting">
            <md-dialog-content>
                <md-toolbar class="md-transparent" :md-elevation="0">
                    <div class="md-toolbar-section-start">
                        <md-avatar>
                            <img :src="`/profile-picture/?by=${adminToDelete.hash}`"/>
                        </md-avatar>
                    </div>
                </md-toolbar>
                <span>Are you sure you want to delete this Admin account?</span>
                <md-dialog-actions>
                    <md-button class="md-primary md-raised" v-show="!deleting" @click="deleteAdmin">
                        Yes
                    </md-button>
                    <md-button v-show="deleting">
                        <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                    </md-button>
                    <md-button class="md-primary" @click="showDeleteAdminDialog = false;">No</md-button>
                </md-dialog-actions>
            </md-dialog-content>
        </md-dialog>
        <md-snackbar :md-active.sync="showAlert" md-position="left">{{message}}</md-snackbar>
    </div>
</template>

<script>
import CreateAdminForm from "./CreateAdminForm.vue";

export default {
    data(){
        return {
            admins: [],
            filteredAdmins: [],
            adminToDelete: {},
            showCreateAdminForm: false,
            showDeleteAdminDialog: false,
            showAlert: false,
            message: new String(),
            deleting: false,
            searchString: "",
            profilePicture: Vue.prototype.profilePicture
        }
    },
    mounted(){
       this.loadAdmins()
    },
    components:{
        CreateAdminForm
    },
    methods: {
        success(){
            this.showAlert = true;
            this.message = "Admin account created"
            this.loadAdmins();
        },
        loadAdmins(){
            this.$http.request({
                url: "admins/",
                method: "GET"
            }).then(response => {
                response = response.json()
                this.admins = response.admins.sort((a, b) => a.username == this.$cookies.get("username")? 1 : -1)
                this.filteredAdmins = this.admins
            })
        },
        deleteAdmin(hash){
            this.deleting = true;
            this.$http.request({
                url: "delete-admin/",
                method: "POST",
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                content: JSON.stringify({
                    hash: this.adminToDelete.hash
                })
            }).then(response => {
                response = response.json()
                this.showDeleteAdminDialog = false;
                this.deleting = false;
                if(response.result == false){
                    this.message = response.error;
                    this.showAlert = true;
                }
                else{
                    this.message = "Admin account deleted";
                    this.showAlert = true;
                    this.loadAdmins()
                }
            }).catch(reason => {
                 if(reason == "The connection timed out. Please try again."){
                    this.message = reason;
                }
                else{
                    this.message = "Failed to complete request. Please try again."
                }
                this.showAlert = true;
                this.deleting = false
            })
        },
        fail(){
            this.message = "Failed to complete request. Please Try again."
            this.showAlert = true;
        }
    },
    watch: {
        searchString(newValue){
            this.filteredAdmins = this.admins.filter(admin => admin.fullName.toUpperCase().indexOf(newValue.toUpperCase()) != -1);
        }
    }
}
</script>

<style lang="scss">
    .md-card{
        height: auto;
        margin: 0;
            
        #admin-list{
            height: 23em;
            overflow-y: auto;
            padding-top: 0;
        }
    }
</style>
