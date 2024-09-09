<template>
    <v-row id="main-row" :key="available">
        <v-col v-if="available === true">
            <v-img
                aspect-ratio="1"
                cover
                src="https://s3.eu-central-1.amazonaws.com/images.loefbijter.nl/bk-app/happy.jpg"
            ></v-img>
            <v-card height="200">
                <v-card-title class="text-wrap">Wij zijn vandaag aanwezig tot {{startText}}!</v-card-title>
                <v-card-title class="text-wrap">Locatie: {{location}}</v-card-title>
                <v-card-subtitle v-for="member in members">{{ member }}</v-card-subtitle>
            </v-card>
        </v-col>
        <v-col v-else-if="available === false">
            <v-img
                aspect-ratio="1"
                cover
                src="https://s3.eu-central-1.amazonaws.com/images.loefbijter.nl/bk-app/sad.jpg"
            ></v-img>
            <v-card height="200">
                <v-card-title class="text-wrap">Wij zijn vandaag niet aanwezig..</v-card-title>
                <v-card-subtitle>en hebben ook geen planning wanneer :(</v-card-subtitle>
            </v-card>
        </v-col>
        <v-col v-else >
                <v-img
                    aspect-ratio="1"
                    cover
                    src="https://s3.eu-central-1.amazonaws.com/images.loefbijter.nl/bk-app/excited.jpg"
                ></v-img>
                <v-card height="200" d-flex align-center justify-center>
                    <v-card-title class="text-wrap">We zijn er nu niet.. <br>
                        Je vindt ons weer op {{startText}} en {{endText}}</v-card-title>
                    <v-card-title class="text-wrap">Waar? {{location}}!</v-card-title>
                    <v-card-subtitle>{{ remarks }}</v-card-subtitle>
                </v-card>
        </v-col>
    </v-row>
</template>

<script>
import {GET_AVAILABILITY, SET_AVAILABILITY} from "../store/storeconstants";
import moment from 'moment-with-locales-es6';

export default {
    name: "DisplayText",
    data: function () {
        return {
            startText: "",
            endText: "",
            available: this.$store.getters[`availability/${GET_AVAILABILITY}`],
            members: null,
            remarks: null,
            location: null
        };
    },
    beforeMount() {
        this.checkIfBoardAvailable()
    },
    methods: {
        async getShiftsFromDrive(){
            const response = await this.axios.get("https://docs.google.com/spreadsheets/d/1qaoHdeh58VErMIXj-H28CLPONEDnIOX3/gviz/tq?tqx=out:csv");
            const shifts = response.data

            const lines = shifts.split('\n') // 1️⃣
            const header = lines[0].replace(/['"]+/g, '').split(',') // 2️⃣
            const output = lines.slice(1).map(line => {
                const fields = line.replace(/['"]+/g, '').split(',') // 3️⃣
                return Object.fromEntries(header.map((h, i) => [h, fields[i]])) // 4️⃣
            })

            return output
        },

        async checkIfBoardAvailable(){
            const entries = await this.constructEntries()

            const datetime_start = entries['start']
            const datetime_end = entries['end']
            const availabilities = entries['available']
            const locations = entries['location']

            const currDatetime = moment(new Date(), 'DD-MM-YYYY HH:mm')

            console.log(datetime_start[0])
            console.log(datetime_end[0])
            console.log(currDatetime)
            const currShift = this.checkIfCurrShift(datetime_start, datetime_end, currDatetime);
            const nextShift = this.checkIfNextShift(datetime_start, datetime_end, currDatetime);
            let available = null

            if (currShift){
                console.log("Current shift")
                this.$store.commit(`availability/${SET_AVAILABILITY}`, true);
                this.available = true

                this.startText = moment(datetime_end[currShift], 'DD-MM-YYYY HH:mm').format('HH:mm');
                this.members = this.checkWhichMembersAvailable(availabilities[currShift]);
                this.location = locations[currShift];
            }
            else if (nextShift != null){
                console.log("Next shift")
                this.$store.commit(`availability/${SET_AVAILABILITY}`, nextShift);
                this.available = nextShift

                this.startText = moment(datetime_start[nextShift], 'DD-MM-YYYY HH:mm').format('dddd DD MMMM [tussen] HH:mm');
                this.endText = moment(datetime_end[nextShift], 'DD-MM-YYYY HH:mm').format('HH:mm');
                this.location = locations[nextShift];
            }
            else{
                console.log("Not available")
                this.$store.commit(`availability/${SET_AVAILABILITY}`, false);
                this.available = false
            }
        },
        async constructEntries() {
            moment.locale('nl');

            const arr_datetime_start = []
            const arr_datetime_end = []

            const arr_availabilities = []
            const arr_remarks = []
            const arr_locations = []

            for (const [key, value] of Object.entries(await this.getShiftsFromDrive())) {
                const datetime_start = moment(value.Datum + " " + value.Begin, 'DD-MM-YYYY HH:mm');
                const datetime_end = moment(value.Datum + " " + value.Eind, 'DD-MM-YYYY HH:mm');
                const availabilities = {
                    "Sophie": value.Sophie,
                    "Hannah": value.Hannah,
                    "Levi": value.Levi,
                    "Koen": value.Koen,
                    "Nienke": value.Nienke,
                    "Lieke": value.Lieke
                }
                const location = value.Locatie

                arr_datetime_start.push(datetime_start)
                arr_datetime_end.push(datetime_end)
                arr_availabilities.push(availabilities)
                arr_locations.push(location)
            }

            return {
                'start': arr_datetime_start,
                'end': arr_datetime_end,
                'available': arr_availabilities,
                'location': arr_locations
            }
        },
        checkIfCurrShift(datetime_start, datetime_end, currDatetime){
            let isCurrent = null
            for (let i in datetime_start){
                isCurrent = currDatetime > datetime_start[i] && currDatetime < datetime_end[i];
                if (isCurrent){
                    return i
                }
            }
            return isCurrent
        },
        checkIfNextShift(datetime_start, datetime_end, currDatetime){
            let nextShiftIdx = null
            for (let i in datetime_start){
                if (currDatetime < datetime_start[i]){
                    nextShiftIdx = i
                    break
                }
            }
            return nextShiftIdx
        },
        checkWhichMembersAvailable(availabilities){
            let arr_availabilities = []
            for (const [key, value] of Object.entries(availabilities)) {
                if (value === 'TRUE'){
                    arr_availabilities.push(key)
                }
            }
            console.log(arr_availabilities)
            return arr_availabilities
        },
    }
}
</script>

<style scoped>
#main-row{
    max-width: 600px;
}
</style>