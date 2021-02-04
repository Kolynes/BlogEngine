<template>
    <v-container grid-list-xl>
        <v-layout wrap row v-resize="onResize">
            <v-flex :class="{fixed : $vuetify.breakpoint.smAndUp}" v-show="$vuetify.breakpoint.smAndUp || currentView == 'list'" ref="flex">
                <v-toolbar dense flat>
                    <slot name="list:toolbar"/>
                </v-toolbar>
                <v-card class="elevation-0" id="containerVListAndDetails" :height="height" v-if="$vuetify.breakpoint.smAndUp">
                    <v-scroll-view container="#containerVListAndDetails" :loader="tweakedLoader" :refresh="refresh" @update:refresh="$emit('update:refresh', $event)" :rules="rules" :infinite="infinite" >
                        <v-sheet class="item" :class="index == selectedIndex? selectedClass : 'transparent'" @click="select(item, index)" slot-scope="{item, index}">
                            <slot name="list" :item="item" :index="index"/>
                        </v-sheet>
                        <template slot="empty-state">
                            <slot name="empty-state"/> 
                        </template>
                    </v-scroll-view>
                </v-card>
                <v-card class="elevation-0" v-else style="border-radius: 0">
                    <v-scroll-view 
                        :loader="tweakedLoader"
                        :refresh="refresh"
                        @update:refresh="$emit('update:refresh', $event)" 
                        :rules="rules" 
                        :infinite="infinite" 
                    >
                        <v-sheet class="item" :class="index == selectedIndex? selectedClass : 'transparent'" @click="select(item, index)" slot-scope="{item, index}">
                            <slot name="list" :item="item" :index="index"/>
                        </v-sheet>
                        <template slot="empty-state">
                            <slot name="empty-state"/> 
                        </template>
                    </v-scroll-view>
                </v-card>
            </v-flex>
            <v-flex :class="listClass" v-show="$vuetify.breakpoint.smAndUp || currentView == 'list'" ref="helperFlex"/>
            <v-flex :class="detailsClass" v-show="($vuetify.breakpoint.smAndUp || currentView == 'details') && selectedIndex != null">
                <v-sheet>
                    <v-toolbar dense flat>
                        <v-btn icon @click="currentView ='list'" v-if="$vuetify.breakpoint.xs">
                            <v-icon>keyboard_arrow_left</v-icon>
                        </v-btn>
                        <slot name="details:toolbar"/>
                    </v-toolbar>
                    <v-card-text>
                        <slot name="details" :item="selectedItem" :index="selectedIndex" />
                    </v-card-text>
                </v-sheet>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
export default {
    props:{
        loader: {
            type: [Function, Array],
            default: []
        },
        refresh: Boolean,
        infinite: {
            type: Boolean,
            default: true
        },
        rules: {
            type: Array,
            default: []
        },
        height: {
            type: [String, Number],
            default: "60vh"
        },
        listClass: {
            type: [Array, Object]
        },
        detailsClass: {
            type: [Array, Object]
        },
        selectedClass: {
            type: [Array, Object],
            default: ["primary--text"]
        },
        selectBy: {
            type: Function,
            default: () => null
        }
    },
    data(){
        return {
            currentView: "list",
            selectedIndex: null,
            selectedItem: {},
        }
    },
    computed: {
        tweakedLoader(){
            if(this.loader.constructor == Function){
                return (page) => this.loader(page).then(data => {
                    if(data.items.length > 0 && (this.$vuetify.breakpoint.smAndUp || this.currentView == 'details')){
                        this.selectedItem = data.items[0]
                        this.selectedIndex = 0
                        data.items.forEach((item, index) => {
                            if(this.selectBy(item)){
                                this.selectedItem = item
                                this.selectedIndex = index
                            }
                        })
                        this.$emit("selected", {item: this.selectedItem, index: this.selectedIndex})
                    }
                    else{
                        this.currentView = 'list'
                    }
                    return data
                })
            }
            else{
                if(this.loader.length > 0 && (this.$vuetify.breakpoint.smAndUp || this.currentView == 'details')){
                    this.selectedItem = this.loader[0]
                    this.selectedIndex = 0
                    this.loader.forEach((item, index) => {
                        if(this.selectBy(item)){
                            this.selectedItem = item
                            this.selectedIndex = index
                        }
                    })
                    this.$emit("selected", {item: this.selectedItem, index: this.selectedIndex})
                }
                else{
                    this.currentView = 'list'
                }
                return this.loader
            }
        }
    },
    methods: {
        onResize(){
            this.$refs.flex.style.width = `${this.$refs.helperFlex.clientWidth}px`
        },
        showListView(){
            this.currentView = "list"
        },
        showDetailsView(){
            this.currentView = "details"
        },
        toggleView(){
            this.currentView = this.currentView == "list"?  "details" : "list"
        },
        select(item, index){
            this.selectedItem = item; 
            this.selectedIndex = index; 
            this.currentView = 'details'; 
            this.$emit('selected', {item, index})
        }
    },
    mounted(){
        this.$nextTick().then(this.onResize)
    },
    watch: {
        refresh(newValue){
            if(newValue){
                this.selectedItem = {}
                this.selectedIndex = null
            }
        }
    }
}
</script>

<style lang="scss" scoped>
    .fixed{
        position: fixed;
    }
    #containerVListAndDetails{
        overflow-y: auto; 
        border-radius: 0
    }
    .item{
        cursor: pointer;
    }
</style>
