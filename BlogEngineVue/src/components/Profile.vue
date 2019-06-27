<template>
    <div id="stack">
        <div id="profile-preview">
            <div class="profile-summary">
                <div>
                    <center @click="showProfilePictureDialog = true">
                        <md-avatar class="md-large" style="cursor:pointer">
                            <img ref="profilePicture" :src="profilePicture"/>
                        </md-avatar>
                    </center>
                </div>
                <div>
                    <span class="md-title">{{data.username}}</span><br>
                    <span class="md-subheading">{{data.fullName}}</span><br>
                    <span class="md-caption">{{data.email}}</span>
                </div>
            </div><br><br>
            <md-content>
                <span class="md-title">Profile Description </span><md-button class="md-icon-button md-primary md-raised" @click="editing = !editing"><md-icon>edit</md-icon></md-button><br>
                <p v-if="!editing">{{data.description || "Tell your readers more about yourself..."}}</p>
                <form @submit.prevent="changeDescription" v-else>
                    <md-field>
                        <md-textarea md-autogrow placeholder="Tell your readers more about yourself..." v-model="newDescription" maxlength="5000"></md-textarea>
                    </md-field>
                    <md-button v-show="!changingDescription" type="submit" class="md-primary md-raised">
                        <span>change Description</span>
                    </md-button>
                    <md-button v-show="changingDescription">
                        <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                    </md-button>
                </form>
            </md-content>
        </div>
        <div id="options">
            <md-list md-expand-single>
                <md-list-item md-expand>
                    <md-icon class="md-primary">person</md-icon>
                    <span class="md-list-item-text">Change username</span>
                    <div slot="md-expand" class="slot">
                        <change-username @fail="fail" @change="usernameChanged"/>
                    </div>
                </md-list-item>
                <md-divider class="md-inset"></md-divider>
                <md-list-item md-expand>
                    <md-icon class="md-primary">account_circle</md-icon>
                    <span class="md-list-item-text">Change full name</span>
                    <div slot="md-expand" class="slot">
                        <change-full-name @fail="fail" @change="fullNameChanged"/>
                    </div>
                </md-list-item>
                <md-divider class="md-inset"></md-divider>
                <md-list-item md-expand>
                    <md-icon class="md-primary">email</md-icon>
                    <span class="md-list-item-text">Change email</span>
                    <div slot="md-expand" class="slot">
                        <change-email @fail="fail" @change="emailChanged"/>
                    </div>
                </md-list-item>
                <md-divider class="md-inset"></md-divider>
                <md-list-item md-expand>
                    <md-icon class="md-primary">lock</md-icon>
                    <span class="md-list-item-text">Change password</span>
                    <div slot="md-expand" class="slot">
                        <change-password @fail="fail" @change="passwordChanged"/>
                    </div>
                </md-list-item>
                <md-divider class="md-inset"></md-divider>
            </md-list>
        </div>
        <md-dialog :md-active.sync="showProfilePictureDialog" :md-fullscreen="false">
            <md-dialog-content>
                <md-list>
                    <md-list-item @click="removeProfilePicture">
                        <md-icon>close</md-icon>
                        <span class="md-list-item-text">Remove profile picture</span>
                    </md-list-item>
                    <md-divider class="md-inset"></md-divider>
                    <md-list-item @click="$refs.profilePictureField.click()">
                        <md-icon>image</md-icon>
                        <span class="md-list-item-text">Select profile picture</span>
                    </md-list-item>
                    <md-divider class="md-inset"></md-divider>
                    <span class="error-span">{{error}}</span>
                    <input type="file" ref="profilePictureField" accept="image/*" v-show="false" @change="uploadProfilePicture"/>
                </md-list>
            </md-dialog-content>
        </md-dialog>
        <md-snackbar :md-active.sync="showAlert" md-position="left" >{{message}}</md-snackbar>
        <md-snackbar :md-active="showUploadAlert" md-position="left">
            <md-progress-spinner :md-value="profilePictureUploadPercentage"/> Uploading profile picture
        </md-snackbar>
    </div>
</template>

<script>
import ChangePassword from "./ChangePassword.vue";
import ChangeEmail from "./ChangeEmail.vue";
import ChangeUsername from "./ChangeUsername.vue";
import ChangeFullName from "./ChangeFullName.vue";
export default {
    data(){
        return{
            data: {
                username: this.$cookies.get("username"),
                email: this.$cookies.get("email"),
                description: (sessionStorage.getItem("description")) || "Tell your readers more about yourself",
                fullName: `${this.$cookies.get("first-name")} ${this.$cookies.get("last-name")}`
            },
            editing: false,
            newDescription: (sessionStorage.getItem("description")),
            profilePictureUploadPercentage: 0,
            profilePicture: Vue.prototype.profilePicture,
            changingDescription: false,
            showProfilePictureDialog: false,
            showAlert: false,
            showUploadAlert: false,
            message: "",
            error: "",
            makeAlertPersistent: false,
            xhr: this.$http.createXHR()
        }
    },
    computed: {
        username: {
            get(){
                return this.$cookies.get("username")
            },
            set(value){
                this.$cookies.set("username", value)
                this.data.username = value
            }
        },
        email: {
            get(){
                return this.$cookies.get("email")
            },
            set(value){
                this.$cookies.set("email", value)
                this.data.email = value
            }
        },
        fullName: {
            get(){
                return `${this.$cookies.get("first-name")} ${this.$cookies.get("last-name")}`
            },
            set(value){
                this.$cookies.set("first-name", value.substring(0, value.lastIndexOf(" ")))
                this.$cookies.set("last-name", value.substring(value.lastIndexOf(" ") + 1))
                this.data.fullName = value
            }
        }
    },
    components: {
        ChangePassword,
        ChangeEmail,
        ChangeUsername,
        ChangeFullName,
    },
    methods: {
        changeDescription(){
            this.changingDescription = true;
            this.$http.request({
                url: "change-description/",
                method: "POST",
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                content: JSON.stringify({
                    newDescription: this.newDescription.trim()
                })
            }).then(response => {
                response = response.json()
                if(response.result){
                    sessionStorage.setItem("description", this.newDescription)
                    this.data.description = this.newDescription.trim();
                    this.changingDescription = false;
                    this.showAlert = true;
                    this.message = "Profile description changed";
                    this.editing = false
                }
            })
        },
        removeProfilePicture(){
            this.$http.request({
                url: "remove-profile-picture/",
            }).then(response => {
                response = response.json()
                if(response.result){
                    this.showAlert = true;
                    this.message = "Profile picture removed";
                    this.showProfilePictureDialog = false; 
                    this.profilePicture = Vue.prototype.profilePicture =`/static/BlogEngineApp/images/default.png`
                }
            })
        },
        uploadProfilePicture(){
            var profilePicture = this.$refs.profilePictureField.files[0]
            if(profilePicture.size > 200 * 1024){
                this.error = "This image is too large"
                return 
            }
            var data = new FormData();
            this.showUploadAlert = true;
            this.showProfilePictureDialog = false;
            data.append("picture", this.$refs.profilePictureField.files[0])
            this.xhr.open("POST", "change-profile-picture/");
            this.xhr.setRequestHeader("X-CSRFToken", this.$cookies.get("csrftoken"));
            var reader = new FileReader();
            reader.onload = () => {
                this.profilePicture = Vue.prototype.profilePicture = reader.result
            }
            var file = this.$refs.profilePictureField.files[0]
            this.xhr.upload.onprogress = (e) => {
                this.profilePictureUploadPercentage = Math.round(e.loaded/e.total*100);
                if(this.profilePictureUploadPercentage == 100){
                    this.showUploadAlert = false;
                    reader.readAsDataURL(file)
                    this.message = "Profile picture changed!"
                    this.showAlert = true;
                }
            };
            this.xhr.timeout = 30000
            this.xhr.ontimeout = () => {
                this.showUploadAlert = false;
                this.message = "The connection timed out. Please try again."
                this.showAlert = true;
            }
            this.xhr.send(data)
        },
        usernameChanged(event){
            this.username = event;
            this.message = "Username Changed"
            this.showAlert = true
        },
        emailChanged(event){
            this.email = event;
            this.message = "Email Changed"
            this.showAlert = true
        },
        fullNameChanged(event){
            this.fullName = event;
            this.message = "Full Name Changed"
            this.showAlert = true
        },
        passwordChanged(){
            this.message = "Password Changed"
            this.showAlert = true
        },
        fail(reason){
            if(reason == "The connection timed out. Please try again."){
                this.message = reason;
            }
            else{
                this.message = "Failed to complete request. Please try again."
            }
            this.showAlert = true;
        }
    },
}
</script>

<style lang="scss">
    #stack{
        height: 100%;
        position: relative;
        text-align: left;
        display: block;

        .profile-summary > div{
            display: inline-block;
            padding: 5px;
            vertical-align: middle;
        }
        .slot{
            padding-bottom: 70px
        }
    }
</style>
