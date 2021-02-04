<template>
    <v-dialog v-model="show" width="300" persistent>
        <v-dialog-content>
            <v-card :dark="dark" :light="light" >
                <v-btn icon style="float:right" @click="close">
                    <v-icon>close</v-icon>
                </v-btn>
                <v-card-title>
                    <v-icon class="mr-2">lock</v-icon> <span>Authentication</span>
                </v-card-title>
                <v-card-text>
                    <v-form ref="authenticationForm" @submit.prevent="runAuthenticate">
                        <v-password-field v-model="password" label="Password" :error-messages="passwordErrors" :color="color"/>
                        <v-btn type="submit" icon color="primary" :loading="authenticating">
                            <v-icon>keyboard_arrow_right</v-icon>
                        </v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog-content>
    </v-dialog>
</template>

<script>
export default {
    name: "VAuthentication",
    props: {
        dark: Boolean,
        light: Boolean,
        color: String,
        url: String,
    },
    data(){
        return {
            show: false,
            password: "",
            passwordErrors: [],
            authenticating: false,
            resolve: null,
            reject: null
        }
    },
    methods: {
        close(){
            this.$refs.authenticationForm.reset()
            this.passwordErrors = []
            this.show = false
            this.$emit("close")
            this.reject("close")
        },
        authenticate(){
            this.show = true;
            this.$emit("show")
            return this
        },
        then(resolve, reject = () => null){
            this.resolve = resolve;
            this.reject = reject
        },
        runAuthenticate(){
            if(this.$refs.authenticationForm.validate()){
                var form = new FormData()
                form.append("password", this.password)
                this.authenticating = true
                this.passwordErrors = []
                this.$http.request({
                    url: this.url,
                    method: "POST",
                    content: form
                }).then(response => {
                    response = response.json()
                    this.authenticating = false
                    if(response.status){
                        this.close()
                        this.resolve()
                    }
                    else{
                        this.passwordErrors.push(response.error)
                        this.reject(response.error)
                    }
                }).catch(reason => {
                    this.authenticating = false
                    console.log(reason)
                    this.reject(reason)
                })
            }
        }
    },
}
</script>