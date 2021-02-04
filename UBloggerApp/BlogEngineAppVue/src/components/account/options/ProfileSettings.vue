<template>
    <v-card id="edit-profile">
        <v-card-text>
            <v-layout align-center >
                <v-avatar size="60" style="cursor: pointer" :color="storeProfilePicture? 'black' : 'accent'" class="ma-2" @click="showEditProfilePictureDialog = true">
                    <v-icon v-if="!storeProfilePicture" color="white">person_outline</v-icon>
                    <img :src="`${$base}/../profile-pictures/${storeProfilePicture}`" v-else/>
                </v-avatar>
                <h2 class="ml-3">{{storeUsername}}</h2>
            </v-layout>
            <v-form ref="optionsForm" @submit.prevent="update" class="mt-1">
                <v-text-field label="Name" prepend-icon="person_outline" v-model="name" :rules="[$requiredRule]"/>
                <v-text-field label="Email" prepend-icon="mail_outline" v-model="email" :rules="[$requiredRule, $emailRule]"/>
                <v-textarea label="Description" prepend-icon="edit" v-model="description" />
                <v-btn icon type="submit" color="primary" :loading="updating">
                    <v-icon>keyboard_arrow_right</v-icon>
                </v-btn>
            </v-form> 
        </v-card-text>
        <v-authentication ref="authentication" url="authenticate/"/>
        <v-dialog v-model="showEditProfilePictureDialog" width="300">
            <v-card>
                <v-card-text>
                    <v-list>
                        <v-list-tile @click="showUploadProfilePicture = true; showEditProfilePictureDialog = false">
                            <v-list-tile-action>
                                <v-icon>image</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-title>Change Profile Picture</v-list-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile @click="removeProfilePicture">
                            <v-list-tile-action>
                                <v-icon>close</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-title>Remove Profile Picture</v-list-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog v-model="showUploadProfilePicture" width="300">
            <v-file-uploader 
                :rules="[$requiredRule]"
                filename="picture" 
                @uploaded="profilePictureUpdateComplete" 
                title="Upload Profile Picture"
                @close="showUploadProfilePicture = false" 
                dialog 
                url="options/change-profile-picture/" 
                accept="image/*" 
                :max-size="500 * 1024"
            />
        </v-dialog>
        <v-snackbar bottom :left="$vuetify.breakpoint.smAndUp" v-model="showSnackbar">
            <v-icon :color="snackbarMessage.iconColor">{{snackbarMessage.icon}}</v-icon>
            <span class="ml-2">{{snackbarMessage.message}}</span>
            <v-spacer/>
            <v-btn icon @click="showSnackbar = false">
                <v-icon>close</v-icon>
            </v-btn>
        </v-snackbar>
    </v-card>
</template>

<script>
export default {
    data(){
        return {
            showEditProfilePictureDialog: false,
            showUploadProfilePicture: false,
            name: "",
            email: "",
            description: "",
            updating: false,
            showSnackbar: false,
            snackbarMessage: [],
        }
    },
    computed: Object.assign({},
        Vuex.mapState({
            storeUsername: state => state.username,
            storeName: state => state.name,
            storeEmail: state => state.email,
            storeDescription: state => state.description,
            storeProfilePicture: state => state.profilePicture
        })
    ),
    methods: Object.assign({}, 
        Vuex.mapMutations([
            "setDescription",
            "setName",
            "setEmail",
            "setProfilePicture"
        ]),
        {
            update(){
                if(this.$refs.optionsForm.validate()){
                    this.$refs.authentication.authenticate().then(() => {
                        this.updating = true;
                        var form = new FormData();
                        form.append("name", this.name);
                        form.append("email", this.email);
                        form.append("description", this.description);
                        this.$http.request({
                            url: "options/update-profile/",
                            method: "POST",
                            content: form
                        }).then(response => {
                            response = response.json()
                            this.updating = false;
                            if(response.status){
                                this.setName(this.name);
                                this.setEmail(this.email);
                                this.setDescription(this.description);
                                this.showSnackbar = true
                                this.snackbarMessage = {icon: "done", iconColor: "success", message: "Profile updated successfully"}
                            }
                        }).catch(reason => {
                            console.log(reason)
                            this.updating = false;
                            this.showSnackbar = true
                            this.snackbarMessage = {icon: "warning", iconColor: "red", message: "Failed to update profile. Please try again"}
                        })
                    })
                }
            },
            profilePictureUpdateComplete(){
                this.$http.request({
                    url: "ping"
                }).then(response => {
                    response = response.json();
                    this.setProfilePicture(response.data.profilePicture)
                    this.showSnackbar = true
                    this.snackbarMessage = {icon: "done", iconColor: "success", message: "Profile picture updated"}
                    this.showUploadProfilePicture = false
                })
            },
            removeProfilePicture(){
                this.$http.request({
                    url: "options/remove-profile-picture"
                }).then(() => {
                    this.profilePictureUpdateComplete()
                    this.showEditProfilePictureDialog = false
                })
            },
        }
    ),
    mounted(){
        this.name = this.storeName;
        this.email = this.storeEmail;
        this.description = this.storeDescription;
    }
}
</script>
