<template>
    <div>
        <md-button class="md-icon-button" @click="list">
            <md-icon>list</md-icon>
        </md-button>
        <md-field :class="titleClasses">
            <label>Title</label>
            <md-input v-model="title" @input="titleError = false"/>
        </md-field>
        <md-autocomplete md-dense v-model="categoryString" :md-options="categories">
            <label>Category</label>
            <template slot="md-autocomplete-empty" slot-scope="{term}">
                <div>
                    <span v-if="term"><i><b>{{term}}</b></i> will be created as a new category.</span>
                    <span v-else>Create a new category</span>
                </div>
            </template>
            <template slot="md-autocomplete-item" slot-scope="{item, term}">
                <div>
                    <span>{{item}}</span>
                </div>
            </template>
        </md-autocomplete>
        <span>Tags</span>
        <div id="tags">
            <div>
            <md-chip style="float: left" v-for="(tag, index) in tags" md-deletable :key="index" @md-delete="removeTag(index)">
                {{tag}}
            </md-chip>
            </div>
        </div>
        <md-autocomplete md-dense v-model="tagString" md-input-placeholder="Add a tag" :md-options="tagsList" @input="addTag" :disabled="tags.length == 20" :md-open-on-focus="false">
            <div slot="md-autocomplete-item" slot-scope="{item, term}">
                <template v-if="item == '' && !searchingForTags">
                    <span>Press <b>SPACE</b> to enter <i><b>{{term}}</b></i> as a new tag.</span>
                </template>
                <template v-else>{{item}}</template>
                <div v-if="item == '' && searchingForTags" style="width: 100%; text-align: center; justify-self: center;" >
                    <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto" /> 
                </div>
            </div>
            <div class="md-helper-text">
                {{tags.length}}/20
            </div>
        </md-autocomplete>
        <div style="margin: 1em">
            <span @click="selectCoverPhoto" style="margin-right: -4em">
                <md-icon class="md-size-5x" v-if="!coverPhoto">image</md-icon>
                <img style="max-height: 240px" :src="coverPhoto" v-else/>
                <md-tooltip >select a cover photo</md-tooltip>
            </span>
            <md-button class="md-icon-button md-raised" style="margin-top: .7em" v-if="coverPhoto" @click="coverPhoto = ''"><md-icon>close</md-icon></md-button>
        </div>
        <editor ref="editor"/>
        <template v-if="saveButton">
            <md-button class="md-accent md-raised" v-show="!saving" @click="save">
                <span>save {{saved? "changes" : ""}}</span>
            </md-button>
            <md-button v-show="saving">
                <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
            </md-button>
        </template>
        <md-button class="md-primary md-raised" v-show="!publishing" @click="publish">
            <span>publish {{saved? (saveButton? "with " : "") + "changes" : ""}}</span>
        </md-button>
        <md-button v-show="publishing">
            <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
        </md-button>
        <br>
        <span class="error-span">{{error}}</span>
        <md-snackbar :md-active.sync="showAlert" md-position="left">{{message}}</md-snackbar>
        <md-dialog :md-active.sync="loadingArticle" :md-fullscreen="false" :md-click-outside-to-close="false" :md-close-on-esc="false">
            <md-dialog-content>
                <div style="display: flex; justify-content:flex-start; align-items: center; height: 100%">
                    <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="30" style="width:auto; margin-right: .5em"/>
                    <span>loading article...</span>
                </div>
            </md-dialog-content>
        </md-dialog>
        <md-dialog :md-active.sync="showFilesDialog" style="min-width: 80%; min-height: 90vh;" :md-click-outside-to-close="false">
            <md-dialog-title>
                <md-button class="md-icon-button" style="float: right" @click="showFilesDialog = false" ><md-icon>close</md-icon></md-button>            
                <md-icon>insert_drive_file</md-icon>
                <span class="md-title">Select File</span>
            </md-dialog-title>
            <files interfaced :filter="fileFilter" @file-selected="fileSelected"/>
        </md-dialog>
    </div>
</template>

<script>
import Files from "./Files.vue"
import Editor from "./Editor.vue"

export default {
    data(){
        return {
            editor: null,
            tags: [],
            tagsList: [],
            searchingForTags: false,
            searchingForTagsTimeout: null,
            title: "",
            tagString: "",
            categoryString: "",
            categories: [],
            articlePk: this.article,
            publishing: false,
            saving: false,
            saveButton: true,
            saved: false,
            loadingArticle: false,
            titleError: false,
            error: "",
            message: "",
            showAlert: false,
            fileFilter: "",
            showFilesDialog: false,
            coverPhoto: "",
            setCoverPhoto: false,
        }
    },
    components:{
        Files,
        Editor
    },
    methods: {
        removeTag(index){
            this.tags = this.tags.filter(tag => tag != this.tags[index])
        },
        addTag(){
            if(this.tagString.endsWith(" ") && this.tags.length < 20 && this.tagString.length > 1){
                const tag = this.tagString.trim();
                if(tag.length == 0){
                    return
                }
                this.tagString = "";
                for(let index in this.tags){
                    if(this.tags[index].toUpperCase() == tag.toUpperCase()){
                        return
                    }
                }
                this.tags.push(tag)
            }
        },
        publish(){
            if(!this.title){
                this.error = "A title is required"
                this.titleError = true;
                return
            }
            else{
                this.titleError = false;
                this.error = "";
                this.publishing = true;
                this.$http.request({
                    url: "save-article/?o=publish",
                    method: "POST",
                    headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                    content: JSON.stringify({
                        article: {
                            body: JSON.stringify(this.$refs.editor.instance.getContents()),
                            title: this.title,
                            tags: this.tags,
                            pk: this.articlePk,
                            category: this.categoryString || "Others",
                            coverPhoto: this.coverPhoto
                        }
                    })
                }).then(response => {
                    response = response.json()
                    this.publishing = false;
                    if(response.result){
                        this.$cookies.set("article-count", response.articleCount)
                        this.message = "Article published."
                        this.articlePk = response.articlePk;
                        this.showAlert = true;
                        this.saved = true;
                        this.saveButton = false;
                    }
                }).catch(reason => {
                    if(reason == "The connection timed out. Please try again."){
                        this.message = reason;
                    }
                    else{
                        this.message = "Failed to complete request. Please try again."
                    }
                    this.showAlert = true;
                    this.publishing = false;
                })
            }
        },
        save(){
            if(!this.title){
                this.error = "A title is required"
                this.titleError = true;
                return
            }
            else{
                this.error = ""
                this.titleError = false;
                this.saving = true;
                this.$http.request({
                    url: "save-article/?o=save",
                    method: "POST",
                    headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                    content: JSON.stringify({
                        article: {
                            body: JSON.stringify(this.$refs.editor.instance.getContents()),
                            title: this.title,
                            tags: this.tags,
                            pk: this.articlePk,
                            rawBody: this.$refs.editor.instance.rawContent(),
                            category: this.categoryString || "Others",
                            coverPhoto: this.coverPhoto
                        }
                    })
                }).then(response => {
                    response = response.json()
                    this.saving = false;
                    if(response.result){
                        this.$cookies.set("article-count", response.articleCount)
                        this.message = "Article saved."
                        this.articlePk = response.articlePk;
                        this.showAlert = true;
                        this.saved = true;
                    }
                }).catch(reason => {
                    if(reason == "The connection timed out. Please try again."){
                        this.message = reason;
                    }
                    else{
                        this.message = "Failed to complete request. Please try again."
                    }
                    this.showAlert = true;
                    this.saving = false;
                })
            }
        },
        preview(){
            sessionStorage.setItem("article", JSON.stringify(
                {
                    body: JSON.stringify(this.$refs.editor.instance.getContents()),
                    title: this.title,
                    tags: this.tags,
                    coverPhoto: this.coverPhoto,
                    category: this.categoryString
                }
            ))
            this.$emit("view", this.articlePk)
        },
        list(){
            sessionStorage.removeItem("article")
            this.$emit("list")
        },
        fileSelected(url){
            if(this.setCoverPhoto){
                this.coverPhoto = url
            }
            else{
                try{
                    this.$refs.editor.instance.format(this.fileFilter, url);
                } catch(e) {}
            }
            this.showFilesDialog = false
        },
        selectCoverPhoto(){
            this.setCoverPhoto = true;
            this.fileFilter = "image";
            this.showFilesDialog = true
        }
    },
    computed:{
        tagsPromise(){
            return new Promise((resolve, reject) =>{
                if(!this.tagString){
                    resolve([])
                }
                else{
                    
                }
            })
        },
        titleClasses(){
            return this.titleError? "md-error" : null;
        },
    },
    props: {
        article: [String, Number, Object]
    },
    watch: {
        showFilesDialog(newValue){
            if(!newValue){
                this.setCoverPhoto = false
            }
        },
        tagString(newValue){
            if(this.searchingForTagsTimeout){
                clearTimeout(this.searchingForTagsTimeout)
                this.searchingForTagsTimeout = null
            }
            if(newValue.trim()){
                if(this.tagsList[this.tagsList.length -1] != ""){
                    this.tagsList.push("")
                }
                this.searchingForTags = true;
                this.searchingForTagsTimeout = setTimeout(() => {
                    this.$http.request({
                        url: "tags/",
                        method: "POST",
                        headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                        content: JSON.stringify({
                            searchString: newValue.trim()
                        })
                    }).then(response => {
                        response = response.json()
                        if(response.searchResults.length){
                            this.tagsList = response.searchResults.map(tag => tag += " ")
                        }
                        else{
                            this.tagsList = [""]
                        }
                        this.searchingForTags = false
                    })
                }, 500)
            }
            else {
                this.tagsList = []
            }
        }
    },
    mounted(){
        if(sessionStorage.getItem("article")){
            var article = JSON.parse(sessionStorage.getItem("article"))
            this.$refs.editor.instance.setContents(JSON.parse(article.body))
            this.title = article.title;
            this.category = article.category;
            this.coverPhoto = article.coverPhoto
            this.tags = article.tags || [];
        }
        else if(this.articlePk){
            this.loadingArticle = true;
            this.$http.request({
                url: "../load-article/",
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                method: "POST",
                content: JSON.stringify({"pk": this.articlePk})
            }).then(response => {
                response = response.json()
                this.$refs.editor.instance.setContents(JSON.parse(response.article.body))
                this.title = response.article.title;
                this.tags = response.article.tags || [];
                this.categoryString = response.article.category
                this.coverPhoto = response.article.coverPhoto
                if(response.article.published){
                    this.saveButton = false;
                }
                this.loadingArticle = false;
                this.saved = true;
            }).catch(reason => {
                if(reason == "The connection timed out. Please try again."){
                    this.message = reason;
                }
                else{
                    this.message = "Failed to complete request. Please try again."
                }
                this.showAlert = true;
                this.loadingArticle = false;
            })
        }
        this.$http.request({
            url: "categories/",
        }).then(response => {
            this.categories = response.json().searchResults
        })
    }
}
</script>

<style lang="scss" scoped>
    #tags{
        overflow-y: auto;
        max-height: 5em;

        & > div{
            width: auto
        }
    }
</style>
