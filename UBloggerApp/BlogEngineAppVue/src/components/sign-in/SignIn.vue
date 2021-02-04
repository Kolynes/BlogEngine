<template>
    <v-app>
        <v-content v-if="!recoverAccount">
            <v-container justify-center align-center fill-height>
                <v-card>
                    <v-card-text>
                        <h1 class="title">UBlogger</h1>
                    </v-card-text>
                    <v-card-text>
                        <v-form @submit.prevent="signIn" ref="signInForm">
                            <v-text-field label="Username" v-model="username" :rules="[$requiredRule]" prepend-icon="person_outline"/>
                            <v-password-field label="Password" v-model="password" :rules="[$requiredRule]" prepend-icon="lock_outline"/>
                            <v-checkbox v-model="keepSignedIn" label="keep me signed in"/>
                            <h5 class="text--red"><v-icon color="red" class="mr-1" v-if="error">warning</v-icon>{{error}}</h5>
                            <v-btn small type="submit" round :loading="signingIn" color="primary">sign in</v-btn>
                            <v-btn small round @click="recoverAccount = true" :disabled="signingIn" color="secondary">forgot password</v-btn>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-container>
            <v-snackbar bottom :right="$vuetify.breakpoint.smAndUp" v-model="showSnackbar">
                <v-icon :color="snackbarMessage.iconColor">{{snackbarMessage.icon}}</v-icon>
                <span class="ml-2">{{snackbarMessage.message}}</span>
                <v-spacer/>
                <v-btn icon @click="showSnackbar = false">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-snackbar>
        </v-content>
        <account-recovery @back="recoverAccount = false" toolbar-dark v-else path="account-recovery"/>
    </v-app>
</template>

<script>
    export default {
        data() {
            return {
            username: "",
            password: "",
            keepSignedIn: false,
            error: "",
            signingIn: false,
            recoverAccount: false,
            showSnackbar: false,
            snackbarMessage: {}
            }
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
                        method: "POST",
                        content: form
                    }).then(response => {
                        response = response.json()
                        if(!response.status){
                            this.signingIn = false;
                            this.error = response.error;
                        }
                        else{
                            window.location.href = ""
                        }
                    }).catch(reason => {
                        if(reason == "The connection timed out. Please try again."){
                            this.snackbarMessage.message = reason;
                        }
                        else{
                            this.snackbarMessage.message = "Failed to complete request. Please try again."
                        }
                        this.showSnackbar = true;
                        this.signingIn = false;
                    })
                }
                
            },
        },
    }
</script>

<style lang="scss" scoped>
</style>
