<template>
    <v-card>
        <v-btn icon style="float: right" @click="close" v-if="dialog">
            <v-icon>close</v-icon>
        </v-btn>
        <v-card-title>
            <h2 class="subheading"><v-icon>person_add</v-icon> Create Admin Account</h2>
        </v-card-title>
        <v-card-text>
            <v-form ref="createAdminForm" @submit.prevent="createAdmin">
                <v-text-field label="Username" :rules="[$requiredRule]" :error-messages="usernameErrors" v-model="username" prepend-icon="person_outline"/>
                <v-text-field label="Name" :rules="[$requiredRule]"  v-model="name" prepend-icon="account_box"/>
                <v-text-field label="Email" :rules="[$requiredRule, $emailRule]"  v-model="email" prepend-icon="mail_outline"/>
                <v-password-field label="Password" :rules="[$requiredRule, $requiredLengthRule(6)]"  v-model="password" prepend-icon="lock_outline"/>
                <v-checkbox label="Superuser" v-model="superuser"/>
                <p v-if="superuser"><v-icon color="accent" class="mr-1" size="17">info</v-icon>This account cannot be deleted once created and can create other accounts.</p>
                <p v-if="error"><v-icon color="red" class="mr-1" size="17">warning</v-icon>{{error}}</p>
                <v-btn icon type="submit" color="primary" :loading="creating">
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
    </v-card>
</template>

<script>
export default {
    props: {
        dialog: Boolean
    },
    data(){
        return {
            username: "",
            name: "",
            email: "",
            password: "",
            superuser: false,
            creating: false,
            usernameErrors: [],
            snackbarMessage: {},
            showSnackbar: false,
            error: ""
        }
    },
    methods: {
        createAdmin(){
            if(this.$refs.createAdminForm.validate()){
                this.usernameErrors  = []
                this.creating = true
                var form = new FormData()
                form.append("username", this.username)
                form.append("name", this.name)
                form.append("email", this.email)
                form.append("password", this.password)
                form.append("superuser", this.superuser)
                this.$http.request({
                    url: "home/create-admin/",
                    method: "POST",
                    content: form
                }).then(response => {
                    response = response.json()
                    this.creating = false;
                    if(response.status){
                        this.snackbarMessage = {icon: "done", iconColor: "success", message: "Account Created"}
                        this.showSnackbar = true
                        this.$emit("created")
                    }
                    else if(response.error.includes("username")){
                        this.usernameErrors.push(response.error)
                    }
                    else if(response.error.includes("not authorized")){
                        this.error = response.error
                    }
                    else{
                        this.snackbarMessage = {icon: "warning", iconColor: "red", message: response.error}
                        this.showSnackbar = true
                    }
                }).catch(reason => {
                    console.log(reason)
                    this.creating = false
                    this.snackbarMessage = {icon: "warning", iconColor: "red", message: "Failed to create account. Please try again"}
                    this.showSnackbar = true
                })
            }
        },
        close(){
            this.$refs.createAdminForm.reset()
            this.$emit("close")
        }
    }
}
</script>
