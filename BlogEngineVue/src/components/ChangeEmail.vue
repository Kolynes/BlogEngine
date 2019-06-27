<template>
    <div>
        <md-card md-theme="night-time" class="md-accent">
            <md-card-content>
                <form @submit.prevent="changeEmail">
                    <md-field  :class="newEmailClasses">
                        <label for="new-email">New Email</label>
                        <md-input type="email" id="new-email" required v-model="newEmail"/>
                    </md-field>
                    <md-field :class="passwordClasses">
                        <label for="password">Password</label>
                        <md-input type="password" id="password" required v-model="password"/>
                    </md-field>
                    <span class="error-span">{{error}}</span>
                    <md-button class="md-primary md-raised" v-show="!changingEmail" type="submit" >
                        <span>change email</span>
                    </md-button>
                    <md-button v-show="changingEmail">
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
            newEmail: "",
            password: "",
            error: "",
            changingEmail: false,

            newEmailError: false,

            passwordError: false,
        }
    },
    methods: {
        changeEmail(){
            this.changingEmail = true;
            this.newEmailError = false;
            this.passwordError = false;
            this.error = ""
            this.$http.request({
                url: "change-email/", 
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                method: "POST",
                content: JSON.stringify({
                    newEmail: this.newEmail,
                    password: this.password
                })
            }).then(response => {
                response = response.json()
                this.changingEmail = false;
                if(!response.result){
                    if(response.error.includes("email")){
                        this.newEmailError = true;
                    }
                    else{
                        this.passwordError = true;
                    }
                    this.error = response.error
                }
                else {
                    this.$emit("change", newEmail)
                    this.error = "";
                    this.newEmail = "";
                    this.password = "";
                    this.changingEmail = false;
                }
            }).catch(reason => {
                this.changingEmail = false
                this.$emit("fail", reason)
            })
        }
    },
    computed: {
        passwordClasses(){
            return this.passwordError? "md-invalid": null;
        },
        newEmailClasses(){
            return this.newEmailError? "md-invalid": null;
        },
    }
}
</script>