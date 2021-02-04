<template>
    <div>
        <v-list-and-details ref="events" height="calc(100vh - 212px)" @selected="selectedEvent = $event.item" :loader="loadEvents" :refresh.sync="refreshEventsList" :selectedClass="['white--text', 'accent']" :listClass="['xs12', 'sm6', 'md4']" :detailsClass="['xs12', 'sm6', 'md8']">
            <template slot="list:toolbar">
                <template v-if="!searchingMode">
                <v-btn icon @click="showSaveEventDialog = true; selectedEventPk = null">
                    <v-icon>add</v-icon>
                </v-btn>
                <v-spacer/>
                <v-btn icon @click="searchingMode = true">
                    <v-icon>search</v-icon>
                </v-btn>
                </template>
                <template v-else>
                    <v-text-field :loading="searching" dense v-model="searchString" prepend-inner-icon="search" placeholder="Search for events" append-icon="cancel" @click:append="searchingMode = false" autofocus/>
                </template>
                <v-menu offset-y="30" :close-on-content-click="false" v-model="filterMenu">
                    <v-btn icon slot="activator" slot-scope="{on}" v-on="on">
                        <v-icon>tune</v-icon>
                    </v-btn>
                    <v-card>
                        <v-toolbar dense>
                            <span>Filters</span>
                            <v-spacer/>
                            <v-switch width="10" class="mt-4" style="width: 5px !important; overflow: hidden" :label="filters? 'On' : 'Off'" v-model="filters" />
                        </v-toolbar>
                        <v-card-text>
                            <v-date-field v-model="from" label="from" dense :disabled="!filters" />
                            <v-date-field v-model="to" label="to" dense :disabled="!filters" />
                            <v-btn class="primary" icon @click="refreshEventsList = true; filterMenu = false" :disabled="!filters">
                                <v-icon>keyboard_arrow_right</v-icon>
                            </v-btn>
                        </v-card-text>
                    </v-card>
                </v-menu>
                <v-btn icon @click="refreshEventsList = true" :loading="refreshEventsList">
                    <v-icon>refresh</v-icon>
                </v-btn>
            </template>
            <template slot="details:toolbar">
                <v-spacer/>
                <v-btn icon @click="beginEdit">
                    <v-icon>edit</v-icon>
                </v-btn>
                <v-btn icon @click="deleteEvent" :loading="deletingEvent">
                    <v-icon>delete</v-icon>
                </v-btn>
            </template>
            <template slot="list" slot-scope="{item, index}">
                <v-list-tile class="mb-3 pa-1">
                    <v-list-tile-action>
                        <v-avatar tile>
                            <v-img :src="`${$base}/../preview/?file=${item.picture.pk}`" v-if="item.picture"/>
                            <v-icon v-else>event</v-icon>
                        </v-avatar>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>{{item.name}}</v-list-tile-title>
                        <span class="caption">{{$time.date(item.date)}}</span>
                    </v-list-tile-content>
                </v-list-tile>
            </template>
            <v-card-text slot="details" slot-scope="{item, index}"> 
                <center class="mb-2" v-if="item.picture">
                    <v-img :src="`${$base}/../preview/?file=${item.picture.pk}`"  height="200" style="width: 100%"/>
                </center>
                <v-layout align-center>
                    <v-avatar color="accent white--text" class="title font-weight-bold">
                        <span>{{new Date(item.date).getDate()}}</span>
                    </v-avatar>
                    <v-flex>
                        <h3 class="title font-weight-bold">{{item.name}}</h3>
                        <h3 class="caption">{{$time.date(item.date)}}</h3>
                    </v-flex>
                </v-layout>
                <p class="body">{{item.notes}}</p>
            </v-card-text>
            <v-empty-state slot="empty-state" title="No Events Found" icon="today"/>
        </v-list-and-details>
        <v-dialog v-model="showSaveEventDialog" width="300" persistent>
            <v-card>
                <v-btn icon @click="showSaveEventDialog = false" style="float:right">
                    <v-icon>close</v-icon>
                </v-btn>
                <v-card-title>
                    <span class="subheading"><v-icon>event</v-icon> Save Event </span>
                </v-card-title>
                <v-card-text>
                    <v-form ref="saveEventForm" @submit.prevent="saveEvent">
                        <v-text-field v-model="name" label="Name" :rules="[$requiredRule]"/>
                        <v-date-field v-model="date" label="Date" :rules="[$requiredRule]"/>
                        <v-text-field readonly v-model="picture.name" label="Picture" prepend-icon="image" :append-icon="picture? 'close' : null" @click:append="picture = ''" @click="showFilesDialog = true">
                            <v-avatar tile slot="prepend" v-if="picture != ''" >
                                <v-img :src="`${$base}/../preview/?file=${picture.pk}`"/>
                            </v-avatar>
                        </v-text-field>
                        <v-textarea v-model="notes" label="Notes" prepend-icon="edit" :rules="[$requiredRule]"/>
                        <v-btn type="submit" icon color="primary" :loading="savingEvent">
                            <v-icon>keyboard_arrow_right</v-icon>
                        </v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-snackbar bottom :left="$vuetify.breakpoint.smAndUp" v-model="showSnackbar">
            <v-icon :color="snackbarMessage.iconColor">{{snackbarMessage.icon}}</v-icon>
            <span class="ml-2">{{snackbarMessage.message}}</span>
            <v-spacer/>
            <v-btn icon @click="showSnackbar = false">
                <v-icon>close</v-icon>
            </v-btn>
        </v-snackbar>
        <v-confirmation ref="confirmation"/>
        <v-dialog v-model="showFilesDialog" :fullscreen="$vuetify.breakpoint.xs" width="800">
            <v-sheet height="100%">
                <v-toolbar dense flat>
                    Select Image
                    <v-spacer/>
                    <v-btn icon @click="showFilesDialog = false">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <files interfaced filter="image" @selected="picture = $event; showFilesDialog = false"/>
            </v-sheet>
        </v-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return {
            from: new Date(0).toISOString().substr(0, 10),
            to: new Date().toISOString().substr(0, 10),
            date: "",
            name: "",
            notes: "",
            picture: "",
            savingEvent: false,
            refreshEventsList: false,
            searchString: "",
            searchingMode: false,
            searching: false,
            searchTimeout: null,
            filterMenu: false,
            filters: false,
            showSaveEventDialog: false,
            snackbarMessage: {},
            showSnackbar: false,
            selectedEvent: null,
            selectedEventPk: null,
            showFilesDialog: false,
        }
    },
    methods: Object.assign({},
        Vuex.mapMutations([
            "setEventCount"
        ]),
        {
            loadEvents(page){
                return this.$http.request({
                    url: this.filters? `../events/?from=${escape(this.from)}&to=${escape(this.to)}&q=${escape(this.searchString)}&page=${page}` : `../events/?q=${escape(this.searchString)}&page=${page}`
                }).then(response => {
                    response = response.json()
                    return {
                        items: response.data.events,
                        hasNextPage: response.data.hasNextPage
                    }
                })
            },
            saveEvent(){
                if(this.$refs.saveEventForm.validate()){
                    this.savingEvent = true;
                    var content = new FormData()
                    content.append("name", this.name)
                    content.append("date", this.date)
                    content.append("notes", this.notes)
                    content.append("picture", this.picture.pk)
                    if(this.selectedEventPk){
                        content.append("pk", this.selectedEventPk)
                    }
                    this.$http.request({
                        url: "home/save-event/",
                        method: "POST",
                        content
                    }).then(response => {
                        response = response.json()
                        this.savingEvent = false;
                        if(response.status){
                            this.setEventCount(response.data.eventCount)
                            this.refreshEventsList = true
                            this.$refs.events.selectBy = item => item.pk == this.selectedEventPk
                            this.showSaveEventDialog = false
                            this.showSnackbar = true;
                            this.snackbarMessage = {icon: "done", iconColor: "success", message: "Event saved"}
                        }
                    }).catch(reason => {
                        console.log(reason)
                        this.savingEvent = false;
                        this.showSnackbar = true;
                        this.snackbarMessage = {icon: "warning", iconColor: "red", message: "Failed to save event. Please try again"}
                    })
                }
            },
            beginEdit(){
                var timeZoneOffset = new Date().getTimezoneOffset() * 60000
                this.name = this.selectedEvent.name;
                this.date = new Date(this.selectedEvent.date - timeZoneOffset).toISOString().substr(0, 10);
                this.notes = this.selectedEvent.notes;
                this.picture = this.selectedEvent.picture;
                this.selectedEventPk = this.selectedEvent.pk
                this.showSaveEventDialog = true
            },
            deleteEvent(){
                this.$refs.confirmation.confirm({message: "Are you sure you want to delete this event?"}).then(result => {
                    if(result){
                        this.deletingEvent = true
                        this.$http.request({
                            url: `home/delete-event/?pk=${this.selectedEvent.pk}`
                        }).then(response => {
                            response = response.json()
                            if(response.status){
                                this.setEventCount(response.data.eventCount)
                                this.refreshEventsList = true
                                this.$refs.events.showListView()
                                this.deletingEvent = false
                                this.showSnackbar = true;
                                this.snackbarMessage = {icon: "done", iconColor: "success", message: "Event deleted"}
                            }
                        }).catch(reason => {
                            console.log(reason)
                            this.deletingEvent = false
                            this.showSnackbar = true;
                            this.snackbarMessage = {icon: "warning", iconColor: "red", message: "Failed to delete event. Please try again"}
                        })
                    }
                })
            }
        }
    ),
    watch: {
        filters(newValue){
            this.refreshEventsList = true
        },
        searchString(newValue){
            this.searching = true
            if(this.searchTimeout){
                clearTimeout(this.searchTimeout)
                this.searchTimeout = null
            }
            this.searchTimeout = setTimeout(() => {
                this.searching = false
                this.refreshEventsList = true;
            }, 500)
        },
        searchingMode(newValue){
            if(!newValue){
                this.searchString = ""
            }
        },
        showSaveEventDialog(newValue){
            if(!newValue){
                this.$refs.saveEventForm.reset()
            }
        }
    },
}
</script>

