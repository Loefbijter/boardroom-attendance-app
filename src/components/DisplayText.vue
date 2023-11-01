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
                        Je vind ons weer op {{startText}} en {{endText}}</v-card-title>
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
            remarks: null
        };
    },
    beforeMount() {
        this.checkIfBoardAvailable()
    },
    methods: {
        async getShiftsFromS3(){
            const response = await this.axios.get("https://docs.google.com/spreadsheets/d/1fKUB7j8O9so2ueUkkyaVQYvQiCw13swBJ4IIev3JzM8/gviz/tq?tqx=out:csv");
            const shifts = response.data

            const lines = shifts.split('\n') // 1️⃣
            const header = lines[0].replace(/['"]+/g, '').split(',') // 2️⃣
            const output = lines.slice(1).map(line => {
                const fields = line.replace(/['"]+/g, '').split(',') // 3️⃣
                return Object.fromEntries(header.map((h, i) => [h, fields[i]])) // 4️⃣
            })

            console.log(output)

            return output
        },

        async checkIfBoardAvailable(){
            const entries = await this.constructEntries()

            const datetime_start = entries['start']
            const datetime_end = entries['end']
            const availabilities = entries['available']

            console.log(availabilities)

            const currDatetime = moment(new Date(), 'DD-MM-YYYY HH:ss').format('DD-MM-YYYY HH:ss')

            const currShift = this.checkIfCurrShift(datetime_start, datetime_end, currDatetime);
            const nextShift = this.checkIfNextShift(datetime_start, datetime_end, currDatetime);
            let available = null

            if (currShift){
                this.$store.commit(`availability/${SET_AVAILABILITY}`, true);
                this.available = true

                this.startText = moment(datetime_end[currShift], 'DD-MM-YYYY HH:ss').format('HH:ss');
                this.members = this.checkWhichMembersAvailable(availabilities[currShift])
            }
            else if (nextShift != null){
                this.$store.commit(`availability/${SET_AVAILABILITY}`, nextShift);
                this.available = nextShift

                this.startText = moment(datetime_start[nextShift], 'DD-MM-YYYY HH:ss').format('dddd DD MMMM [tussen] HH:ss');
                this.endText = moment(datetime_end[nextShift], 'DD-MM-YYYY HH:ss').format('HH:ss');
            }
            else{
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

            for (const [key, value] of Object.entries(await this.getShiftsFromS3())) {
                const datetime_start = moment(value.Datum + " " + value.Begin, 'DD-MM-YYYY HH:ss').format('DD-MM-YYYY HH:ss');
                const datetime_end = moment(value.Datum + " " + value.Eind, 'DD-MM-YYYY HH:ss').format('DD-MM-YYYY HH:ss');
                const availabilities = {
                    "Noëlle": value.Noëlle,
                    "Sebastiaan": value.Sebastiaan,
                    "Freek": value.Freek,
                    "Roel": value.Roel,
                    "Jort": value.Jort
                }

                arr_datetime_start.push(datetime_start)
                arr_datetime_end.push(datetime_end)
                arr_availabilities.push(availabilities)
            }

            return {
                'start': arr_datetime_start,
                'end': arr_datetime_end,
                'available': arr_availabilities
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
        }
    }
}
</script>

<style scoped>
#main-row{
    max-width: 600px;
}
</style>