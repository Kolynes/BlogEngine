<template>
    <md-card>
        <md-toolbar class="md-transparent md-dense md-layout" :md-elevation="0">
            <div class="md-layout-item md-size-100" style="padding-top: 10px">
                <span class="md-subheading" > <md-icon class="md-size-2x">event</md-icon> Events</span>
            </div>
            <div class="md-layout-item md-size-100">
                <md-field  md-clearable >
                    <label>Find an event</label>
                    <md-input v-model="searchString"/>
                <md-button v-if="!searchString" class="md-icon-button md-primary" @click="showSaveEventDialog = true">
                    <md-icon>add</md-icon>
                </md-button>
                </md-field>
            </div>
        </md-toolbar>
        <infinite-scroller id="event-list-content" :class="{interfaced}" :refresh.sync="refresh" :showLoading="loading" :loader="loadEvents">
            <template slot="md-list" slot-scope="{item}">
                <div class="md-list-item-text">
                    <span class="md-subheading">{{item.name}}</span>
                    <span class="md-caption">{{item.date}}</span>
                </div>
                <md-button class="md-icon-button" @click="editEvent(item)">
                    <md-icon>edit</md-icon>
                </md-button>
                <md-button class="md-icon-button" @click="eventToOperateOn = item.pk; showDeleteDialog = true">
                    <md-icon>delete</md-icon>
                </md-button>
            </template>
            <div slot="md-empty-state">
                <md-empty-state md-label="No Results" md-icon="search" :md-description="`Couldn't find anything related to '${this.searchString}'`" v-if="searchString"/>
                <md-empty-state md-label="No Events" md-icon="event"  md-description="There's nothing here." v-else />
            </div>
        </infinite-scroller>
        <md-dialog :md-active.sync="showDeleteDialog" :md-fullscreen="false">
            <md-dialog-content>
                <span>Are you sure you want to delete this event?</span>
                <md-dialog-actions>
                    <md-button class="md-primary md-raised" @click="deleteEvent">Yes</md-button>
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
        <md-dialog :md-active.sync="showSaveEventDialog" :md-fullscreen="false" :md-click-outside-to-close="false" :md-close-on-esc="false" @md-close="clearEventForm">
            <md-dialog-title>
                <md-icon class="md-size-2x">event</md-icon>
                <span class="md-title">Save Event</span>
                <md-button class="md-icon-button" @click="showSaveEventDialog = false" style="float: right;">
                    <md-icon>close</md-icon>
                </md-button>
            </md-dialog-title>
            <md-dialog-content>
                <form @submit.prevent="saveEvent">
                    <md-field>
                        <label>Event Name</label>
                        <md-input v-model="eventName" required/>
                    </md-field>
                    <md-datepicker v-model="eventDate" md-immediately :class="{'md-invalid': dateError}">
                        <label>Select Event Date</label>
                    </md-datepicker>
                    <md-field >
                        <label>Notes...</label>
                        <md-textarea md-autogrow v-model="eventNotes" required/>
                    </md-field>
                    <span class="error-span">{{error}}</span>
                    <md-button class="md-primary md-raised" v-show="!savingEvent" type="submit" >
                        <span>save event</span>
                    </md-button>
                    <md-button v-show="savingEvent">
                        <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                    </md-button>
                </form>
            </md-dialog-content>
        </md-dialog>
        <md-snackbar :md-active.sync="showAlert" md-position="left">{{message}}</md-snackbar>
    </md-card>
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
            eventToOperateOn: null,
            searchString: "",
            showDeleteDialog: false,
            showOperationDialog: false,
            showAlert: false,
            searchTimeout: null,
            message: "",
            reloading: false,
            loading: false,
            refresh: false,
            error: "",
            savingEvent: false,
            eventName: "",
            eventNotes: "",
            eventDate: null,
            dateError: false,
            showSaveEventDialog: false
        }
    },
    methods: {
        saveEvent(pk){
            if(!this.eventDate){
                this.error = "A Date is required"
                this.dateError = true;
            }
            else{
                this.savingEvent = true
                this.error = ""
                this.dateError = false,
                this.$http.request({
                    url: "save-event/",
                    method: "POST",
                    headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                    content: JSON.stringify({
                        name: this.eventName.trim(),
                        timestamp: this.eventDate.getTime()/1000,
                        notes: this.eventNotes.trim(),
                        pk: this.eventToOperateOn
                    })
                }).then(response => {
                    response = response.json()
                    this.message = "Event Saved"
                    this.showAlert = true
                    this.refresh = true
                    this.savingEvent = false
                    this.showSaveEventDialog = false
                    this.eventToOperateOn = ""
                    this.$cookies.set("event-count", response.eventCount)
                    this.$emit("change", response.eventCount)
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
        editEvent(item){
            this.eventName = item.name;
            this.eventToOperateOn = item.pk
            this.eventDate = new Date(item.date)
            this.eventNotes = item.notes
            this.showSaveEventDialog = true
        },
        clearEventForm(){
            this.eventName = "";
            this.eventNotes = "";
            this.eventDate = null;
            this.dateError = false
        },
        deleteEvent(){
            this.message = "deleting...";
            this.showDeleteDialog = false;
            this.showOperationDialog = true;
            var pk = this.eventToOperateOn;
            this.$http.request({
                url: `delete-event/?pk=${pk}`, 
            }).then(response => {
                response = response.json()
                this.showOperationDialog = false
                this.reloading = true;
                this.refresh = true;
                this.showAlert = true;
                this.message = "Event Deleted"
                this.eventToOperateOn = ""
                this.$cookies.set("event-count", response.eventCount)
                this.$emit("change", response.eventCount)
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
        loadEvents(page){
            return this.$http.request({
                url: `../events/?q=${escape(this.searchString.trim())}&page=${page}`
            }).then(response => {
                response = response.json()
                return {items: response.events, hasNextPage: response.hasNextPage}
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
#event-list-content {
  overflow-y: auto;
  height: 24em;
  padding-top: 0;
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

