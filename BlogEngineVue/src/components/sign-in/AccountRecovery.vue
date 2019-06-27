<template>
    <md-app md-theme="night-time">
        <md-app-toolbar class="md-primary">
            <md-button class="md-icon-button" @click="$emit('back')">
                <md-icon>keyboard_backspace</md-icon>
            </md-button>
            <span class="md-subheading">Account Recovery</span>
        </md-app-toolbar>
        <md-app-content>
            <md-steppers id="vertical-steppers" md-vertical md-linear :md-active-step="activeStep.toString()">
                <md-step id="0" @click="restart" md-label="Username" :md-error="usernameError" :md-done="usernameDone" md-description="Please enter your username.">
                    <center>
                        <form @submit.prevent="findAdmin">
                            <md-field >
                                <label>Enter username</label>
                                <md-input v-model="username" required/>
                            </md-field>
                        </form>
                        <template v-if="findingAdmin">
                            <center>
                                <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                            </center>
                        </template>
                        <template v-else-if="admin">
                                <md-avatar class="md-large">
                                    <img :src="`/profile-picture/?by=${admin.hash}`"/>
                                </md-avatar><br>
                                <span>{{admin.fullName}}</span><br><br>
                                <md-button class="md-icon-button md-primary md-raised" v-show="!sending" @click="sendVerificationCode()" type="submit">
                                    <md-icon>keyboard_arrow_right</md-icon>
                                </md-button>
                                <md-button class="md-icon-button" v-show="sending">
                                    <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                                </md-button>
                        </template>
                    </center>
                </md-step>
                <md-step id="1" :md-editable="false" :md-error="verificationError" :md-done="verificationDone" md-label="Verification Code"  md-description="Enter the 6 digit verification code.">
                    <center>
                        <form @submit.prevent="verify">
                            <md-field >
                                <label>Enter verification code</label>
                                <md-input type="" maxlength="6" v-model="code" style="letter-spacing: 15px;" required/>
                            </md-field>
                            <md-button class="md-icon-button md-primary md-raised" v-show="!verifying" type="submit">
                                <md-icon>keyboard_arrow_right</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" v-show="verifying">
                                <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                            </md-button>
                            <br>
                            <md-button v-show="!sending" @click="sendVerificationCode('resend')" class="md-raised">Resend</md-button>
                            <md-button class="md-icon-button" v-show="sending">
                                <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                            </md-button>
                        </form>
                    </center>
                </md-step>
                <md-step id="2" :md-editable="false" :md-error="resetPasswordError" :md-done="resetPasswordDone" md-label="Reset Password"  md-description="Reset your account's password.">
                    <center>
                        <form @submit.prevent="resetPassword">
                            <md-field :class="newPasswordClasses" :md-toggle-password="false">
                                <label>New Password</label>
                                <md-input type="password" v-model="newPassword"/>
                            </md-field>
                            <md-field :class="confirmNewPasswordClasses" :md-toggle-password="false">
                                <label>Confirm New Password</label>
                                <md-input type="password" v-model="confirmNewPassword"/>
                            </md-field>
                            <md-button class="md-icon-button md-primary md-raised" v-show="!resetting" type="submit">
                                <md-icon>keyboard_arrow_right</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" v-show="resetting">
                                <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                            </md-button>
                        </form>
                    </center>
                </md-step>
                <md-step id="3" :md-editable="false" md-label="Done">
                    <center>
                        <span class="md-subheading">Account Recovery Complete!</span><br>
                        <md-button @click="$emit('back')">close</md-button>
                        <md-button v-show="!signingIn" @click="signIn" class="md-primary">
                            <span>sign me in</span>
                        </md-button>
                        <md-button v-show="signingIn" class="md-primary">
                            <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                        </md-button>
                    </center>
                </md-step>
            </md-steppers>
            <md-steppers md-alternative class="md-small-hide" md-linear :md-active-step="activeStep.toString()">
                <md-step id="0" @click="restart" md-label="Username" :md-error="usernameError" :md-done="usernameDone" md-description="Please enter your username.">
                    <center>
                        <form @submit.prevent="findAdmin">
                            <md-field >
                                <label>Enter username</label>
                                <md-input v-model="username" required/>
                            </md-field>
                        </form>
                        <template v-if="findingAdmin">
                            <center>
                                <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                            </center>
                        </template>
                        <template v-else-if="admin">
                            <md-avatar class="md-large">
                                <img :src="`/profile-picture/?by=${admin.hash}`"/>
                            </md-avatar><br>
                            <span>{{admin.fullName}}</span><br><br>
                            <md-button class="md-icon-button md-primary md-raised" v-show="!sending" @click="sendVerificationCode()" type="submit">
                                <md-icon>keyboard_arrow_right</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" v-show="sending">
                                <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                            </md-button>
                        </template>
                    </center>
                </md-step>
                <md-step id="1" :md-editable="false" :md-error="verificationError" :md-done="verificationDone" md-label="Verification Code"  md-description="Enter the 6 digit verification code.">
                    <center>
                        <form @submit.prevent="verify">
                            <md-field >
                                <label>Enter verification code</label>
                                <md-input type="" maxlength="6" v-model="code" style="letter-spacing: 15px;" required/>
                            </md-field>
                            <md-button class="md-icon-button md-primary md-raised" v-show="!verifying" type="submit">
                                <md-icon>keyboard_arrow_right</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" v-show="verifying">
                                <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                            </md-button>
                            <br>
                            <md-button v-show="!sending" @click="sendVerificationCode('resend')" class="md-raised">Resend</md-button>
                            <md-button class="md-icon-button" v-show="sending">
                                <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                            </md-button>
                        </form>
                    </center>
                </md-step>
                <md-step id="2" :md-editable="false" :md-error="resetPasswordError" :md-done="resetPasswordDone" md-label="Reset Password"  md-description="Reset your account's password.">
                    <center>
                        <form @submit.prevent="resetPassword">
                            <md-field :class="newPasswordClasses" :md-toggle-password="false">
                                <label>New Password</label>
                                <md-input type="password" v-model="newPassword" />
                            </md-field>
                            <md-field :class="confirmNewPasswordClasses" :md-toggle-password="false">
                                <label>Confirm New Password</label>
                                <md-input type="password" v-model="confirmNewPassword"/>
                            </md-field>
                            <md-button class="md-icon-button md-primary md-raised" v-show="!resetting" type="submit">
                                <md-icon>keyboard_arrow_right</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" v-show="resetting">
                                <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                            </md-button>
                        </form>
                    </center>
                </md-step>
                <md-step id="3" :md-editable="false" md-label="Done">
                    <center>
                        <span class="md-subheading">Account Recovery Complete!</span><br>
                        <md-button @click="$emit('back')" class="md-primary">close</md-button>
                        <md-button v-show="!signingIn" @click="signIn" class="md-primary">
                            <span>sign me in</span>
                        </md-button>
                        <md-button v-show="signingIn">
                            <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                        </md-button>
                    </center>
                </md-step>
            </md-steppers>
            <md-snackbar :md-active.sync="showAlert" md-position="left">{{message}}</md-snackbar>
        </md-app-content>
    </md-app>
</template>

<script>
export default {
    data(){
        return {
            activeStep: 0,
            username: "",
            usernameError: "",
            usernameDone: false,
            code: "",
            verificationError: "",
            verificationDone: false,
            verifying: false,
            sending: false,
            resetPasswordError: "",
            resetPasswordDone: false,
            resetting: false,
            newPassword: "",
            confirmNewPassword: "",
            newPasswordError: false,
            confirmNewPasswordError: false,
            findingAdmin: false,
            admin: null,
            showAlert: false,
            signingIn: false,
            message: ""
        }
    },
    methods: {
        findAdmin(){
            this.findingAdmin = true;
            this.usernameError = ""
            this.$http.request({
                url: `find-admin/?q=${this.username[0].toUpperCase() + this.username.substring(1)}`
            }).then(response => {
                response = response.json()
                if(response.result){
                    this.admin = response.admin
                }
                else {
                    this.admin = null;
                    this.usernameError = "Admin account not found."
                }
                this.findingAdmin = false;
            }).catch(reason => {
                if(reason == "The connection timed out. Please try again."){
                    this.message = reason;
                }
                else{
                    this.message = "Failed to complete request. Please try again."
                }
                this.showAlert = true;
                this.findingAdmin = false;
            })
        },
        sendVerificationCode(mode="send"){
            this.sending = true;
            this.usernameError = ""
            this.verificationError = ""
            this.$http.request({
                url: `send-verification-code/?m=${mode}`,
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                method: "POST",
                content: JSON.stringify({
                    hash: this.admin.hash
                })
            }).then(response => {
                response = response.json()
                if(response.result){
                    if(mode == "send"){
                        this.usernameDone = true;
                        this.activeStep++;
                    }
                    else{
                        this.showAlert = true
                        this.message = "Verification Code Resent"
                    }
                }
                else{
                    if(mode == "resend"){
                        this.verificationError = response.error
                    }
                    else {
                        this.usernameError = response.error
                    }
                }
                this.sending = false
            }).catch(reason => {
                if(reason == "The connection timed out. Please try again."){
                    this.message = reason;
                }
                else{
                    this.message = "Failed to complete request. Please try again."
                }
                this.showAlert = true;
                this.sending = false;
            })
        },
        verify(){
            this.verifying = true;
            this.verificationError = ""
            this.$http.request({
                url: `verify`,
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                method: "POST",
                content: JSON.stringify({
                    hash: this.admin.hash,
                    code: this.code
                })
            }).then(response => {
                response = response.json()
                if(!response.result){
                    this.verificationError = response.error
                }
                else{
                    this.verificationDone = true;
                    this.activeStep++;
                }
                this.verifying = false;
            }).catch(reason => {
                    if(reason == "The connection timed out. Please try again."){
                        this.message = reason;
                    }
                    else{
                        this.message = "Failed to complete request. Please try again."
                    }
                    this.showAlert = true;
                    this.verifying = false;
                })
        },
        resetPassword(){
            if(this.newPassword == ""){
                this.newPasswordError = true;
                this.resetPasswordError = "The password field is required."
            }
            else if(this.confirmNewPassword == ""){
                this.confirmNewPasswordError = true;
                this.resetPasswordError = "The confirm new password field is required."
            }
            else if(this.newPassword != this.confirmNewPassword){
                this.newPasswordError = true;
                this.confirmNewPasswordError = true;
                this.resetPasswordError = "The passwords do not match."
            }
            else if(this.newPassword.length < 6){
                this.newPasswordError = true;
                this.resetPasswordError = "The password should be 6 or more characters."
            }
            else {
                this.resetting = true;
                this.resetPasswordError = ""
                this.$http.request({
                    url: `reset-password`,
                    headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                    method: "POST",
                    content: JSON.stringify({
                        hash: this.admin.hash,
                        newPassword: this.newPassword
                    })
                }).then(response => {
                    response = response.json()
                    this.activeStep++;
                    this.resetPasswordDone = true
                    this.resetting = false;
                }).catch(reason => {
                    if(reason == "The connection timed out. Please try again."){
                        this.message = reason;
                    }
                    else{
                        this.message = "Failed to complete request. Please try again."
                    }
                    this.showAlert = true;
                    this.resetting = false;
                })
            }
        },
        restart(){
            if(this.activeStep != 0){
                this.activeStep = 0;
                this.usernameDone = false;
                this.verificationDone = false;
                this.resetPasswordDone = false;
                this.usernameError = "";
                this.verificationError = "";
                this.resetPasswordError = "";
                this.username = "";
                this.newPassword = "";
                this.confirmNewPassword = "";
                this.admin = null;
                this.code = "";
            }
        },
        signIn(){
            this.signingIn = true;
            var username = this.username[0].toUpperCase()  + this.username.substring(1);
            this.$http.request({
                url: "sign-in/", 
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                method: "POST",
                content: JSON.stringify({username, password: this.newPassword, keepSignedIn: true})
            }).then(response => {
                response = response.json()
                this.signingIn = false;
                window.location = ""
            }).catch(reason => {
                 if(reason == "The connection timed out. Please try again."){
                    this.message = reason;
                }
                else{
                    this.message = "Failed to complete request. Please try again."
                }
                this.showAlert = true;
                this.signingIn = false;
            })
        }
    },
    computed: {
        newPasswordClasses(){
            return this.newPasswordError? "md-invalid": null;
        },
        confirmNewPasswordClasses(){
            return this.confirmNewPasswordError? "md-invalid": null;
        },
    },
}
</script>

<style lang="scss" scoped>
    @import "vue-material/dist/components/MdLayout/variables.scss";
    .md-field{
        width: 220px;
    }
    #vertical-steppers{
        @media screen and (min-width: $md-breakpoint-small){
            display: none;
        }
    }
</style>

