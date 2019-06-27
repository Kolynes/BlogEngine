<template>
    <div>
        <md-card md-theme="night-time" class="md-accent">
            <md-card-content>
                <form @submit.prevent="changeUsername">
                    <md-field  :class="newUsernameClasses">
                        <label >New Username</label>
                        <md-input type="username" required v-model="newUsername"/>
                    </md-field>
                    <md-field :class="passwordClasses">
                        <label>Password</label>
                        <md-input type="password" required v-model="password"/>
                    </md-field>
                    <span class="error-span">{{error}}</span>
                    <md-button class="md-primary md-raised" v-show="!changingUsername" type="submit" >
                        <span>change username</span>
                    </md-button>
                    <md-button v-show="changingUsername">
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
            newUsername: "",
            password: "",
            error: "",
            changingUsername: false,
            newUsernameError: false,
            passwordError: false,
        }
    },
    methods: {
        changeUsername(){
            this.changingUsername = true;
            this.error = ""
            this.newUsernameError = false;
            this.passwordError = false;
            var newUsername = this.newUsername.trim()
            newUsername = newUsername[0].toUpperCase() + newUsername.substring(1)
            this.$http.request({
                url: "change-username/", 
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                method: "POST",
                content: JSON.stringify({
                    newUsername,
                    password: this.password
                })
            }).then(response => {
                response = response.json()
                this.changingUsername = false;
                if(!response.result){
                    if(response.error.includes("username")){
                        this.newUsernameError = true;
                    }
                    else{
                        this.passwordError = true;
                    }
                    this.error = response.error
                }
                else {
                    this.$emit("change", this.newUsername)
                    this.newUsername = "";
                    this.password = "";
                }
            }).catch(reason => {
                this.changingUsername = false
                this.$emit("fail", reason)
            })
        }
    },
    computed: {
        passwordClasses(){
            return this.passwordError? "md-invalid": null;
        },
        newUsernameClasses(){
            return this.newUsernameError? "md-invalid": null;
        },
    }
}
</script>