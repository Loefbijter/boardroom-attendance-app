<template>
    <div class="d-flex justify-center ma-4">
        <div v-if="available === true">
            <v-img
                :width="600"
                aspect-ratio="1"
                cover
                src="https://s3.eu-central-1.amazonaws.com/images.loefbijter.nl/bk-app/lol.jpg"
            ></v-img>
            <v-card height="500" width="600">
                <v-card-title class="text-wrap">Aanwezig</v-card-title>
                <v-card-subtitle>Your data is ready</v-card-subtitle>
            </v-card>
        </div>
        <div v-else-if="available === false">
            <v-img
                :width="600"
                aspect-ratio="1"
                cover
                src="https://s3.eu-central-1.amazonaws.com/images.loefbijter.nl/bk-app/sad.jpg"
            ></v-img>
            <v-card height="500" width="600">
                <v-card-title class="text-wrap">Niet aanwezig</v-card-title>
                <v-card-subtitle>Your data is ready</v-card-subtitle>
            </v-card>
        </div>
        <div v-else>
            <v-img
                :width="600"
                aspect-ratio="1"
                cover
                src="https://s3.eu-central-1.amazonaws.com/images.loefbijter.nl/bk-app/happy.jpg"
            ></v-img>
            <v-card height="500" width="600">
                <v-card-title class="text-wrap">Weer aanwezig tussen {{availableWhenStart}} en {{availableWhenEnd}}</v-card-title>
                <v-card-subtitle>Jeej!</v-card-subtitle>
            </v-card>
        </div>
    </div>
</template>

<script>
import json from '../assets/data.json'
export default {
    name: "DisplayText",
    data(){
        return{
            data: json,
            happy: import.meta.glob('../assets/images/happy.jpg'),
            sad: import.meta.glob('../assets/images/sad.jpg')
        }
    },
    computed: {
        available(){
            return this.checkIfBoardAvailable()
        },
        availableWhenStart(){
            return this.checkIfBoardAvailable()[0]
        },
        availableWhenEnd(){
            return this.checkIfBoardAvailable()[1]
        }
    },
    methods: {
        checkIfBoardAvailable(){
            const datetime = this.toDateTime()

            this.datetime_start = datetime['start']
            this.datetime_end = datetime['end']

            this.currDatetime = new Date().toLocaleString('nl-NL', {timeZone: 'Europe/Amsterdam'});

            if (this.checkIfCurrShift()){
                return true
            }
            else if (this.checkIfNextShift() != null){
                const nextShiftIdx = this.checkIfNextShift()
                return [this.datetime_start[nextShiftIdx], this.datetime_end[nextShiftIdx]]
            }
            else{
                return false
            }
        },
        toDateTime(){
            const arr_datetime_start = []
            const arr_datetime_end = []

            for (const [key, value] of Object.entries(this.data)) {
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
        checkIfCurrShift(){
            let isCurrent = null

            for (let i in this.datetime_start){
                isCurrent = this.currDatetime > this.datetime_start[i] && this.currDatetime < this.datetime_end[i];
                if (isCurrent){
                    return isCurrent
                }
            }
            return isCurrent
        },
        checkIfNextShift(){
            let nextShiftIdx = null
            for (let i in this.datetime_start){
                if (this.currDatetime < this.datetime_start[i]){
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

</style>