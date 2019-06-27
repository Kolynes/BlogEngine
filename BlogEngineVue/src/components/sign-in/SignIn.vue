<template>
    <v-app v-if="!recoverAccount" dark>
        <v-content>
            <v-container justify-center align-center fill-height>
                <v-card>
                    <v-card-text>
                        <h1 class="title">UBlogger</h1>
                    </v-card-text>
                    <v-card-text>
                        <v-form @submit.prevent="signIn" ref="signInForm">
                            <v-text-field label="Username" v-model="username" :rules="[$requiredRule]" color="white"/>
                            <v-password-field label="Password" v-model="password" :rules="[$requiredRule]" color="white"/>
                            <v-checkbox class="v-primary" v-model="keepSignedIn" label="keep me signed in"/>
                            <h5 class="text--red"><v-icon color="red" class="mr-1" v-if="error">warning</v-icon>{{error}}</h5>
                            <v-btn type="submit" round :loading="signingIn" color="primary">sign in</v-btn>
                            <v-btn round @click="recoverAccount = true" :disabled="signingIn" color="secondary">forgot password</v-btn>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-container>
        </v-content>
    </v-app>
    <account-recovery @back="recoverAccount = false" v-else/>
</template>

<script>
    // import AccountRecovery from "./AccountRecovery.vue";
    export default {
        data() {
            return {
            username: "",
            password: "",
            keepSignedIn: true,
            error: "",
            signingIn: false,
            recoverAccount: false
            }
        },
        components: {
            // AccountRecovery
        },
        methods: {
            signIn(){
                if(this.$refs.signInForm.validate()){
                    var form = new FormData()
                    form.append("username", (this.username[0].toUpperCase()  + this.username.substring(1).toLowerCase()).trim())
                    form.append("password", this.password)
                    form.append("keepSignedIn", this.keepSignedIn)
                    this.error = "";
                    this.signingIn = true;
                    this.$http.request({
                        url: "sign-in/", 
                        headers: {"X-CSRFToken": this.$cookies.get("csrftoken")},
                        method: "POST",
                        content: form
                    }).then(response => {
                        response = response.json()
                        if(!response.result){
                            this.signingIn = false;
                            this.error = response.error;
                        }
                        else{
                            window.location.href = ""
                        }
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
        },
    }
</script>

<style lang="scss" scoped>
</style>
