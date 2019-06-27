<template>
    <md-card style="min-height: 610px">
        <md-toolbar class="md-transparent md-dense md-layout" :md-elevation="0">
            <div class="md-layout-item md-xsmall-size-100" style="padding-top: 10px">
                <span class="md-subheading" ><md-icon class="md-size-2x">mail</md-icon> Mailer</span>
            </div>
            <div class="md-layout-item md-xsmall-size-100">
                <md-field  md-clearable  v-if="!showEditor">
                    <label>Find mail</label>
                    <md-input v-model="searchString"/>
                <md-button v-if="!searchString" @click="showEditor = true; subject = ''; mailToOperateOn = ''" class="md-icon-button md-primary">
                    <md-icon>add</md-icon>
                </md-button>
                </md-field>
                <md-button class="md-icon-button" v-else style="float: right" @click="showEditor = false">
                    <md-icon>list</md-icon>
                </md-button>
            </div>
        </md-toolbar>
        <md-card-content>
            <template v-if="!showEditor">
                <md-tabs md-theme="night-time">
                    <md-tab md-label="Draft" @click="option = 'draft'">
                    </md-tab>
                    <md-tab md-label="Sent mail" @click="option = 'sent'">
                    </md-tab>
                </md-tabs>
                <infinite-scroller id="mail-list-content" :refresh.sync="refresh" :showLoading="loading" :loader="loadMail">
                    <template slot="md-list" slot-scope="{item}">
                        <div class="md-list-item-text">
                            <span class="md-subheading">{{item.subject}}</span>
                            <span class="md-caption">{{item.by}}</span>
                            <span class="md-caption">{{item.isDraft? item.created : item.sentOn}}</span>
                        </div>
                        <md-button class="md-icon-button" @click="editMail(item.pk)">
                            <md-icon>edit</md-icon>
                        </md-button>
                        <md-button class="md-icon-button" @click="mailToOperateOn = item.pk; showDeleteDialog = true">
                            <md-icon>delete</md-icon>
                        </md-button>
                    </template>
                    <div slot="md-empty-state">
                        <md-empty-state md-label="No Results" md-icon="search" :md-description="`Couldn't find anything related to '${this.searchString}'`" v-if="searchString"/>
                        <md-empty-state md-label="No Sent Mail" md-icon="mail"  md-description="There's nothing here." v-else-if="option == 'sent'" />
                        <md-empty-state md-label="No Drafts" md-icon="drafts"  md-description="There's nothing here." v-else />
                    </div>
                </infinite-scroller>
            </template>
            <template v-else>
                <md-field :class="subjectClasses">
                    <label>Subject*</label>
                    <md-input v-model="subject" @focus="subjectError = false"/>
                    <span class="md-error">A subject is required</span>
                </md-field>
                <br>
                <editor height="300px" style="margin-bottom: 10px" ref="editor"/>
                <md-card-actions>
                    <template v-if="saveButton">
                        <md-button class="md-primary md-size-2x md-icon-button" v-show="!saving" @click="mail('save')">
                            <md-icon>save</md-icon>
                        </md-button>
                        <md-button v-show="saving" class="md-icon-button">
                            <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                        </md-button>
                    </template>
                    <md-button class="md-primary  md-icon-button" v-show="!sending" @click="mail('send')">
                        <md-icon>send</md-icon>
                    </md-button>
                    <md-button v-show="sending" class="md-icon-button">
                        <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                    </md-button>
                </md-card-actions>
            </template>
        </md-card-content>
        <md-snackbar :md-active.sync="showAlert" md-position="left">{{message}}</md-snackbar>
        <md-dialog :md-active.sync="showDeleteDialog" :md-fullscreen="false">
            <md-dialog-content>
                <span>Are you sure you want to delete this mail?</span>
                <md-dialog-actions>
                    <md-button class="md-primary md-raised" @click="deleteMail">Yes</md-button>
                    <md-button class="md-primary" @click="showDeleteDialog = false;">No</md-button>
                </md-dialog-actions>
            </md-dialog-content>
        </md-dialog>
    </md-card>
        
</template>

<script>
import InfiniteScroller from "./InfiniteScroller.vue"
import Editor from "./Editor.vue"

export default {
    components: {
        InfiniteScroller,
        Editor
    },
    data(){
        return {
            searchString: "",
            showEditor: false,
            showDeleteDialog: false,
            saving: false,
            sending: false,
            saveButton: true,
            subject: "",
            subjectError: false,
            message: "",
            showAlert: false,
            option: "draft",
            refresh: false,
            loading: false,
            mailToOperateOn: "",
            searchTimeout: null
        }
    },
    methods: {
        mail(option){
            if(!this.subject){
                this.subjectError = true;
            }
            else{
                if(option == "save"){
                    this.saving = true;
                }
                else{
                    this.sending = true;
                }
                this.$http.request({
                    url: `mail/`,
                    method: "POST",
                    headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                    content: JSON.stringify({
                        subject: this.subject,
                        editorContent: JSON.stringify(this.$refs.editor.instance.getContents()),
                        rawContent: this.$refs.editor.rawContent(),
                        isDraft: option == "save",
                        pk: this.mailToOperateOn || null
                    })
                }).then(response => {
                    this.sending = false,
                    this.saving = false
                    this.message = `Mail ${option == "save"? "Saved" : "Sent"}`
                    this.showAlert = true;
                }).catch(reason => {
                    if(reason == "The connection timed out. Please try again."){
                        this.message = reason;
                    }
                    else{
                        this.message = "Failed to complete request. Please try again."
                    }
                    this.showAlert = true;
                })
            }
        },
        loadMail(page){
            return this.$http.request({
                url: `load-mail/?q=${escape(this.searchString.trim())}&page=${page}&d=${this.option == 'draft'}`
            }).then(response => {
                response = response.json()
                this.loading = false
                return {items: response.mail, hasNextPage: response.hasNextPage}
            }).catch(reason => {
                if(reason == "The connection timed out. Please try again."){
                    this.message = reason;
                }
                else{
                    this.message = "Failed to complete request. Please try again."
                }
                this.showAlert = true;
            })
        },
        editMail(pk){
            this.$http.request({
                url: `load-particular-mail/?pk=${pk}`
            }).then(response => {
                response = response.json()
                this.showEditor = true;
                this.mailToOperateOn = pk
                this.$nextTick().then(() => {
                    this.$refs.editor.instance.setContents(JSON.parse(response.mail.editorContent))
                    this.subject = response.mail.subject
                })
            }).catch(reason => {
                if(reason == "The connection timed out. Please try again."){
                    this.message = reason;
                }
                else{
                    this.message = "Failed to complete request. Please try again."
                }
                this.showAlert = true;
            })
        },
        deleteMail(){
            this.$http.request({
                url: `delete-mail/?pk=${this.mailToOperateOn}`
            }).then(response => {
                this.message = "Mail Deleted"
                this.showDeleteDialog = false;
                this.refresh = true
            }).catch(reason => {
                if(reason == "The connection timed out. Please try again."){
                    this.message = reason;
                }
                else{
                    this.message = "Failed to complete request. Please try again."
                }
                this.showAlert = true;
            })
        }
    },
    computed: {
        subjectClasses(){
            return this.subjectError? "md-invalid" : null
        },
    },
    watch: {
        option(){
            this.refresh = true
        },
        searchString(newValue){
            if(this.searchTimeout){
                clearTimeout(this.searchTimeout);
                this.searchTimeout = null;
            }
            this.loading = true
            this.searchTimeout = setTimeout(() => {
                this.refresh = true
            }, 500)
        },
    }
}
</script>

<style lang="scss" scoped>
    #mail-list-content{
        position: relative;
        height: 452px
    }
</style>
