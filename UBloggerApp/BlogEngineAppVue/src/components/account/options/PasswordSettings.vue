<template>
    <v-card id="change-password">
        <v-card-text>
            <v-form ref="changePasswordForm" @submit.prevent="changePassword">
                <v-password-field label="New Password" v-model="newPassword" :rules="[$requiredRule, $requiredLengthRule(6)]"/>
                <v-password-field label="Old Password" v-model="password" :rules="[$requiredRule]" :error-messages="passwordErrors"/>
                <v-btn icon type="submit" color="primary" :loading="changingPassword">
                    <v-icon>keyboard_arrow_right</v-icon>
                </v-btn>
            </v-form> 
        </v-card-text>
        <v-snackbar bottom :left="$vuetify.breakpoint.smAndUp" v-model="showSnackbar">
            <v-icon :color="snackbarMessage.iconColor">{{snackbarMessage.icon}}</v-icon>
            <span class="ml-2">{{snackbarMessage.message}}</span>
            <v-spacer/>
            <v-btn icon @click="showSnackbar = false">
                <v-icon>close</v-icon>
            </v-btn>
        </v-snackbar>
        <v-confirmation ref="confirmation"/>
    </v-card>
</template>

<script>
export default {
    data(){
        return {
            password: "",
            newPassword: "",
            passwordErrors: [],
            changingPassword: false,
            showSnackbar: false,
            snackbarMessage: [],
        }
    },
    methods: Object.assign({}, 
        {
            changePassword(){
                if(this.$refs.changePasswordForm.validate()){
                    this.$refs.confirmation.confirm({message: "Your password will be changed. continue?"}).then(value => {
                        if(value !== true){
                            return
                        }
                        this.changingPassword = true;
                        this.passwordErrors = []
                        var form = new FormData()
                        form.append("newPassword", this.newPassword)
                        form.append("password", this.password)
                        this.$http.request({
                            url: "options/change-password/",
                            method: "POST",
                            content: form
                        }).then(response => {
                            response = response.json()
                            this.changingPassword = false;
                            if(response.status){
                                this.showSnackbar = true
                                this.snackbarMessage = {icon: "done", iconColor: "success", message: "password changed successfully"}
                                this.refs.changePasswordForm.reset()
                            }
                            else if(response.error.includes("password")){
                                this.passwordErrors.push(response.error)
                            }
                            else{
                                this.showSnackbar = true
                                this.snackbarMessage = {icon: "warning", iconColor: "red", message: response.error}
                            }
                        }).catch(reason => {
                            console.log(reason)
                            this.changingPassword = false;
                            this.showSnackbar = true
                            this.snackbarMessage = {icon: "warning", iconColor: "red", message: "Failed to change password. Please try again"}
                        })
                    })
                }
            }
        }
    ),
}
</script>
