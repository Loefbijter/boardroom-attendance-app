<template>
    <v-row id="main-row">
        <v-col v-if="available === true">
            <v-img
                aspect-ratio="1"
                cover
                src="https://s3.eu-central-1.amazonaws.com/images.loefbijter.nl/bk-app/lol.jpg"
            ></v-img>
            <v-card height="200">
                <v-card-title class="text-wrap">Wij zijn momenteel aanwezig!</v-card-title>
                <v-card-subtitle>:D</v-card-subtitle>
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
                    src="https://s3.eu-central-1.amazonaws.com/images.loefbijter.nl/bk-app/happy.jpg"
                ></v-img>
                <v-card height="200" d-flex align-center justify-center>
                    <v-card-title class="text-wrap">We zijn weer aanwezig tussen {{startText}} en {{endText}}</v-card-title>
                    <v-card-subtitle>:)</v-card-subtitle>
                </v-card>
        </v-col>
    </v-row>
</template>

<script>
import {GET_AVAILABILITY, SET_AVAILABILITY} from "../store/storeconstants";

export default {
    name: "DisplayText",
    data: function () {
        return {
            startText: "",
            endText: "",
            available: this.$store.getters[`availability/${GET_AVAILABILITY}`]
        };
    },
    beforeMount() {
        this.checkIfBoardAvailable()
    },
    methods: {
        async getShiftsFromS3(){
            const response = await this.axios.get("https://s3.eu-central-1.amazonaws.com/images.loefbijter.nl/bk-app/bkdienst.json");
            const shifts = response.data

            console.log(shifts)
            return shifts
        },

        async checkIfBoardAvailable(){
            console.log("checking board available")
            const datetime = await this.toDateTime()

            const datetime_start = datetime['start']
            const datetime_end = datetime['end']

            const currDatetime = new Date().toLocaleString('nl-NL', {timeZone: 'Europe/Amsterdam'});

            if (this.checkIfCurrShift(datetime_start, datetime_end, currDatetime)){
                console.log("current shift")
                this.$store.commit(`availability/${SET_AVAILABILITY}`, true);
            }
            else if (this.checkIfNextShift(datetime_start, datetime_end, currDatetime) != null){
                console.log("next shift")
                const nextShiftIdx = this.checkIfNextShift(datetime_start, datetime_end, currDatetime)
                this.$store.commit(`availability/${SET_AVAILABILITY}`, false);

                this.startText = datetime_start[nextShiftIdx]
                this.endText = datetime_end[nextShiftIdx]
            }
            else{
                console.log("no shifts")
                this.$store.commit(`availability/${SET_AVAILABILITY}`, false);
            }
        },
        async toDateTime() {
            console.log("to datetime")
            const arr_datetime_start = []
            const arr_datetime_end = []

            for (const [key, value] of Object.entries(await this.getShiftsFromS3())) {
                const datetime_start = new Date(value.date_year + "-" + value.date_month + "-" + value.date_day + " " + value.time_start).toLocaleString('nl-NL', {timeZone: 'Europe/Amsterdam'});
                const datetime_end = new Date(value.date_year + "-" + value.date_month + "-" + value.date_day + " " + value.time_end).toLocaleString('nl-NL', {timeZone: 'Europe/Amsterdam'});

                arr_datetime_start.push(datetime_start)
                arr_datetime_end.push(datetime_end)
            }

            return {
                'start': arr_datetime_start,
                'end': arr_datetime_end
            }
        },
        checkIfCurrShift(datetime_start, datetime_end, currDatetime){
            let isCurrent = null
            for (let i in datetime_start){
                isCurrent = currDatetime > datetime_start[i] && currDatetime < datetime_end[i];
                if (isCurrent){
                    return isCurrent
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
        }
    }
}
</script>

<style scoped>
#main-row{
    max-width: 600px;
}
</style>