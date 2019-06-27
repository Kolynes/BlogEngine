<template>
    <div>
        <md-card md-theme="night-time" class="md-accent">
            <md-card-content>
                <form @submit.prevent="changeFullName">
                    <md-field>
                        <label >First Name</label>
                        <md-input type="text" required v-model="firstName"/>
                    </md-field>
                    <md-field>
                        <label >Last Name</label>
                        <md-input type="text" required v-model="lastName"/>
                    </md-field>
                    <md-field :class="passwordClasses">
                        <label>Password</label>
                        <md-input type="password" required v-model="password"/>
                    </md-field>
                    <span class="error-span">{{error}}</span>
                    <md-button class="md-primary md-raised" v-show="!changingFullName" type="submit" >
                        <span>change Full Name</span>
                    </md-button>
                    <md-button v-show="changingFullName">
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
            firstName: this.$cookies.get("first-name"),
            lastName: this.$cookies.get("last-name"),
            password: "",
            error: "",
            changingFullName: false,
            passwordError: false,
        }
    },
    methods: {
        changeFullName(){
            this.changingFullName = true;
            var firstName = this.firstName;
            var lastName = this.lastName;
            var password = this.password;
            this.error = ""
            this.passwordError = false;
            this.$http.request({
                url: "change-full-name/", 
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                method: "POST",
                content: JSON.stringify({newFullName: this.fullName, password})
            }).then(response => {
                response = response.json()
                this.changingFullName = false;
                if(!response.result){
                    this.passwordError = true;
                    this.error = response.error
                }
                else {
                    this.$emit("change", this.fullName)
                    this.error = "";
                    this.password = "";
                    this.changingFullName = false;
                }
            }).catch(reason => {
                this.changingFullName = false
                this.$emit("fail", reason)
            })
        }
    },
    computed: {
        passwordClasses(){
            return this.passwordError? "md-invalid": null;
        },
        fullName(){
            return `${this.firstName} ${this.lastName}`
        }
    }
}
</script>

