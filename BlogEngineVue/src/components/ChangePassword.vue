<template>
    <div>
        <md-card id="change-password" md-theme="night-time" class="md-accent">
            <md-card-content>
                <form @submit.prevent="changePassword">
                    <md-field :md-toggle-password="false" :class="oldPasswordClasses">
                        <label for="old-password">Old Password</label>
                        <md-input type="password" id="old-password" required v-model="oldPassword"/>
                    </md-field>
                    <md-field :md-toggle-password="false" :class="passwordClasses">
                        <label for="new-password">New Password</label>
                        <md-input type="password" id="new-password" required v-model="password"/>
                    </md-field>
                    <md-field :md-toggle-password="false" :class="confirmPasswordClasses">
                        <label for="confirm-password">Confirm New Password</label>
                        <md-input type="password" id="confirm-password" required v-model="confirmPassword"/>
                    </md-field>
                    <span class="error-span">{{error}}</span>
                    <md-button class="md-primary md-raised" v-show="!changingPassword" type="submit" >
                        <span>change password</span>
                    </md-button>
                    <md-button v-show="changingPassword">
                        <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                    </md-button>
                </form>

            </md-card-content>
        </md-card>
    </div>
</template>

<script>
 export default {
        data(){
            return {
                oldPassword: "",
                password: "",
                confirmPassword: "",
                changingPassword: false,
                error: "",
                oldPasswordError: false,
                passwordError: false,
                confirmPasswordError: false,
            }
        },
        methods: {
            changePassword(){
                var password = this.password;
                var oldPassword = this.oldPassword;
                var confirmPassword = this.confirmPassword;
                this.error = ""
                this.oldPasswordError = false;
                this.passwordError = false;
                this.confirmPasswordError = false;

                if(this.changingPassword){
                    return
                }
                else if(password == ""){
                    this.passwordError = true;
                    this.error = "The password field is required."
                }
                else if(confirmPassword == ""){
                    this.confirmPasswordError = true;
                    this.error = "The confirm new password field is required."
                }
                else if(password != confirmPassword){
                    this.passwordError = true;
                    this.confirmPasswordError = true;
                    this.error = "The passwords do not match."
                }
                else if(password.length < 6){
                    this.passwordError = true;
                    this.error = "The password should be 6 or more characters."
                }
                else if(oldPassword == ""){
                    this.oldPasswordError = true;
                    this.error = "The old password field is required"
                }
                else{
                    this.changingPassword = true;
                    this.$http.request({
                        url: "change-password/", 
                        headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                        method: "POST",
                        credentials: "same-origin",
                        content: JSON.stringify({newPassword: password, oldPassword})
                    }).then(response => {
                        response = response.json()
                        this.changingPassword = false;
                        if(!response.result){
                            this.oldPasswordError = true;
                            this.error = response.error
                        }
                        else {
                            this.$emit("change")
                            this.oldPassword = "";
                            this.password = "";
                            this.confirmPassword = "";
                            this.error = ""
                        }
                    }).catch(reason => {
                        this.changingPassword = false
                        this.$emit("fail", reason)
                    })
                }
            }
        },
        computed: {
            oldPasswordClasses(){
                return this.oldPasswordError? "md-invalid": null;
            },
            passwordClasses(){
                return this.passwordError? "md-invalid": null;
            },
            confirmPasswordClasses(){
                return this.confirmPasswordError? "md-invalid": null;
            },
        },
    }
</script>

