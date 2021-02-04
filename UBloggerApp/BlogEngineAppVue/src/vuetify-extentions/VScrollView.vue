<template>
    <div ref="scrollView">
        <slot v-if="items.length > 0" v-for="(item, index) in items" :item="item" :index="index"/>
        <slot name="empty-state" v-if="items.length == 0 && !loading">
            <v-empty-state title="List Empty" icon="list"/>
        </slot>
        <center>
            <slot name="load-more" :on="{click: () => loadItems(false)}" :loading="loading" v-if="hasNextPage && !infinite">
                <v-btn @click="loadItems(false)" :loading="loading">Load More</v-btn>
            </slot>
            <v-progress-circular color="primary" indeterminate v-if="loading && infinite"/>
        </center>
    </div>
</template>

<script>
export default {
    name: "VScrollView",
    props: {
        loader: {
            type: [Function, Array],
            default: []
        },
        refresh: Boolean,
        infinite: {
            type: Boolean,
            default: true
        },
        container: {
            type: [String, Object],
            default: document
        },
        rules: {
            type: Array,
            default: []
        }
    },
    data(){
        return {
            items: [],
            page: 1,
            loading: false,
            content: null,
            hasNextPage: false
        }
    },
    methods: {
        loadMoreItems(event){
            if(event.target == document){
                var scrollHeight = event.target.scrollingElement.scrollHeight, 
                    clientHeight = event.target.scrollingElement.clientHeight,
                    scrollTop = event.target.scrollingElement.scrollTop;
            }
            else{
                var scrollHeight = event.target.scrollHeight, 
                    clientHeight = event.target.clientHeight,
                    scrollTop = event.target.scrollTop;
            }
            if (scrollHeight == clientHeight + scrollTop && this.hasNextPage){
                this.loadItems()
            }
        },
        loadItems(reload = false){
            this.loading = true
            if(this.loader.constructor == Array){
                this.loading = false;
                this.items = this.loader
                return this.$nextTick()
            }
            if(this.infinite){
                this.content.removeEventListener("scroll", this.loadMoreItems)
            }
            return this.loader(this.page).then(data => {
                var filteredItems = data.items.filter((item, index) => {
                    var flag = true;
                    for(var rule of this.rules){
                        flag = flag && (rule(item, index) === true)
                    }
                    return flag
                })
                if(reload){
                    this.items = filteredItems
                }
                else{
                    this.items.push(...filteredItems)
                }
                this.page++;
                this.loading = false;
                this.hasNextPage = data.hasNextPage
                if(this.hasNextPage && this.infinite){
                    this.content.addEventListener("scroll", this.loadMoreItems)
                }
            }).catch(reason => {
                console.log(reason)
                this.loading = false
                this.$emit("update:refresh", false)
            })
        }
    },
    mounted(){
        if(this.container.constructor == "".constructor){
            this.content = document.querySelector(this.container)
        }
        else{
            this.content = this.container
        }
        this.loadItems()
    },
    watch: {
        refresh(newValue){
            if(newValue){
                this.page = 1
                this.items = []
                this.loadItems(true).then(() => this.$emit("update:refresh", false))
            }
        }
    }
}
</script>