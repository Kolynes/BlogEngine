<template>
    <div>
        <md-toolbar class="md-primary">
            <div class="md-toolbar-row">
                <div class="md-toolbar-section-start">
                    <md-button class="md-icon-button" @click="createArticle" v-if="!interfaced">
                        <md-icon>note_add</md-icon>
                    </md-button>
                    <md-button class="md-icon-button" id="refresh" :class="{reloading}" @click="reloading = true; refresh = true" >
                        <md-icon>refresh</md-icon>
                    </md-button>
                </div>
                <div class="md-toolbar-section-end">
                    <md-field  md-clearable md-theme="md-primary">
                        <md-input v-model="searchString" placeholder="Title, Category or Tag" style="background: rgba(0,0,0,.1); padding: 10px; border-radius: 10px"/>
                    </md-field>
                </div>
            </div>
        </md-toolbar>
        <infinite-scroller id="article-list-content" :class="{interfaced}" :refresh.sync="refresh" :showLoading="loading" :loader="loadArticles">
            <template slot="md-list" slot-scope="{item}">
                <div class="md-list-item-text">
                    <span class="md-subheading">{{item.title}}</span>
                    <span class="md-caption">{{item.by}}</span>
                    <span class="md-caption">{{item.category}}</span>
                    <span class="md-caption">{{item.published? item.publishedOn : "Not Published"}}</span>
                </div>
                <md-button class="md-icon-button" @click="editArticle(item.pk)">
                    <md-icon>edit</md-icon>
                </md-button>
                <md-button class="md-icon-button" @click="articleToOperateOn = item.pk; showDeleteDialog = true">
                    <md-icon>delete</md-icon>
                </md-button>
            </template>
            <div slot="md-empty-state">
                <md-empty-state md-label="No Results" md-icon="search" :md-description="`Couldn't find anything related to '${this.searchString}'`" v-if="searchString"/>
                <md-empty-state md-label="No Articles" md-icon="edit"  md-description="There's nothing here." v-else />
            </div>
        </infinite-scroller>
        <md-dialog :md-active.sync="showDeleteDialog" :md-fullscreen="false">
            <md-dialog-content>
                <span>Are you sure you want to delete this article?</span>
                <md-dialog-actions>
                    <md-button class="md-primary md-raised" @click="deleteArticle">Yes</md-button>
                    <md-button class="md-primary" @click="showDeleteDialog = false;">No</md-button>
                </md-dialog-actions>
            </md-dialog-content>
        </md-dialog>
        <md-dialog :md-active.sync="showOperationDialog" :md-fullscreen="false" :md-click-outside-to-close="false" :md-close-on-esc="false">
            <md-dialog-content>
                <div style="display: flex; justify-content:flex-start; align-items: center; height: 100%">
                    <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="30" style="width:auto; margin-right: .5em"/>
                    <span>{{message}}</span>
                </div>
            </md-dialog-content>
        </md-dialog>
        <md-snackbar :md-active.sync="showAlert" md-position="left">{{message}}</md-snackbar>
    </div>
</template>

<script>
import InfiniteScroller from "./InfiniteScroller.vue";

export default {
    props: {
        interfaced: Boolean,
    },
    components: {
        InfiniteScroller
    },
    data(){
        return{
            articleToOperateOn: null,
            searchString: "",
            showDeleteDialog: false,
            showOperationDialog: false,
            showAlert: false,
            searchTimeout: null,
            message: "",
            reloading: false,
            loading: false,
            refresh: false
        }
    },
    methods: {
        createArticle(){
            this.$emit("edit")
        },
        editArticle(pk){
            this.$emit("edit", pk)
        },
        deleteArticle(){
            this.message = "deleting...";
            this.showDeleteDialog = false;
            this.showOperationDialog = true;
            var pk = this.articleToOperateOn;
            this.$http.request({
                url: "delete-article/", 
                method: "POST",
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                content: JSON.stringify({pk})
            }).then(response => {
                response = response.json()
                this.showOperationDialog = false
                this.reloading = true;
                this.refresh = true;
                this.showAlert = true;
                this.message = "Article Deleted"
                this.$cookies.set("article-count", response.articleCount)
            }).catch(reason => {
                if(reason == "The connection timed out. Please try again."){
                    this.message = reason;
                }
                else{
                    this.message = "Failed to complete request. Please try again."
                }
                this.showAlert = true;
                this.showOperationDialog = false
            })
        },
        loadArticles(page){
            return this.$http.request({
                url: `../articles/?q=${escape(this.searchString.trim())}&page=${page}`
            }).then(response => {
                response = response.json()
                return {items: response.articles, hasNextPage: response.hasNextPage}
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
    },
    watch: {
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
        refresh(newValue){
            if(!newValue){
                this.reloading = false;
                this.loading = false
            }
        }
    },
}
</script>

<style lang="scss">
.reloading {
  animation: rotateZ infinite 1s;
}


#article-list-content {
  overflow-y: auto;
  height: 75vh;
  &.interfaced{
      height: auto;
  }
}

.md-list-item{
    transition: linear .3s background;
    &:not(.md-primary):hover{
        background: rgba(0,0,0,.1)
    }
}
</style>

