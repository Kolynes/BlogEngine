<template>
<div>
    <div class="pages">
        <transition name="slide">
            <article-list v-if="!editing"  @edit="editArticle"/>
            <editor :article="editedArticle" v-else-if="editing"  @list="showList"/>
        </transition>
    </div>
</div>
</template>

<script>
import ArticleList from "./ArticleList.vue"
import Editor from "./ArticleEditor.vue";

export default {
    data(){
        return {
            editing: false,
            editedArticle: {},
        }
    },
    components: {
        ArticleList,
        Editor,
    },
    methods: {
        showList(event){
            this.editing = false;
        },
        editArticle(event){
            this.editedArticle = event;
            this.editing = true;
        },
    }
}
</script>

<style lang="scss"> 
    .pages{
        display: flex;
        justify-content: flex-start;
        width: 200%;
        
    }
    .pages > *{
        width: 50%;
    }
 </style>