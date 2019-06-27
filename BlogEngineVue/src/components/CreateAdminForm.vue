<template>
    <md-dialog :md-active.sync="showDialog" style="min-width:60%">
        <md-dialog-title>
            <md-icon>person_add</md-icon>
            <span>Create Admin Account</span>
            <md-button class="md-icon-button" id="close" @click="close">
                <md-icon>close</md-icon>
            </md-button>
        </md-dialog-title>
        <md-dialog-content class="md-scrollbar">
            <form @submit.prevent="createAdmin">
                <md-field>
                    <label>Username</label>
                    <md-input type="text" v-model="username" required/>
                </md-field>
                <md-field>
                    <label>First Name</label>
                    <md-input type="text" v-model="firstName" required/>
                </md-field>
                <md-field>
                    <label>Last Name</label>
                    <md-input type="text" v-model="lastName" required/>
                </md-field>
                <md-field>
                    <label>Email</label>
                    <md-input type="email" v-model="email" required/>
                </md-field>
                <md-field>
                    <label>Password</label>
                    <md-input type="password" v-model="password" required/>
                </md-field>
                <md-switch class="md-primary" v-model="immunity">Account Immunity</md-switch><br>
                <span class="md-caption" v-if="immunity">This account will be able to create other accounts and cannot be deleted by any other account.</span>
                <span class="error-span">{{error}}</span>
                <md-button v-show="!creatingAdmin" type="submit" class="md-primary md-raised">
                    <span>create admin</span>
                </md-button>
                <md-button v-show="creatingAdmin">
                    <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                </md-button>
            </form>
        </md-dialog-content>
    </md-dialog>
</template>

<script>
export default {
    props: {
        showDialog: Boolean
    },
    data(){
        return{
            username: "",
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            error: "",
            immunity: false,
            creatingAdmin: false,
        }
    },
    methods: {
        createAdmin(){
            var username = this.username.trim()[0].toUpperCase() + this.username.trim().substring(1).toLowerCase();
            var firstName = this.firstName.trim()[0].toUpperCase() + this.firstName.trim().substring(1).toLowerCase();
            var lastName = this.lastName.trim()[0].toUpperCase() + this.lastName.trim().substring(1).toLowerCase();

            this.creatingAdmin = true;
            this.$http.request({
                url: "create-admin/",
                method: "POST",
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                content: JSON.stringify({
                    username,
                    name: firstName + " " + lastName,
                    email: this.email,
                    password: this.password,
                    immunity: this.immunity
                })
            }).then(response => {
                response = response.json()
                this.creatingAdmin = false;
                if(!response.result){
                    this.error = response.error;
                }
                else{
                    this.$emit("success")
                    this.close();
                }
            }).catch(reason => {
                this.creatingAdmin = false
                this.$emit("fail", reason)
            })
        },
        close(){
            this.username = "";
            this.firstName = "";
            this.lastName = "";
            this.email = "";
            this.password = "";
            this.$emit("close")
        },
    },
}
</script>

<style lang="scss">

    #close{
        float: right;
    }
</style>
