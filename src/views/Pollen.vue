<template>
    <v-content>
    <v-autocomplete
      v-model="genus"
      :items="genera"
      :item-text="(item) => $t(item.label)"
      label="Genus"
      @filter="filterGenera"
      />
      <!--
    <DataTable
      :genera="[genus]"
      :data="rawData"
      :hide_bottom="true"
      ></DataTable>
      -->
    <div id="Timeline" ref="timelineRef"></div>
    <div id="Heatmap"></div>
    </v-content>
</template>

<script>

import {DateTime, Interval} from "luxon";
import Plotly from 'plotly.js/dist/plotly'
import DataTable from 'src/components/DataTable.vue'

function parsePlotlyDate(dateString) {
  let output = DateTime.fromFormat(dateString, "yyyy-MM-dd HH:mm:ss.u");
  if (output.invalid) {
    output = DateTime.fromFormat(dateString, "yyyy-MM-dd HH:mm");
  }
  if (output.invalid) {
    output = DateTime.fromFormat(dateString, "yyyy-MM-dd");
  }
  if (output.invalid) {
    throw new Error(`Invalid date-time string: ${dateString}`);
  }
  return output;
}

export default {
  data () {
    return {
      rawData: [],
      genus: 'Gramineae',
      allValues: [],
      genera: [],
      timelineData: [],
      timelineLayout: {
        barmode: 'stack',
        yaxis: { fixedrange: true },
        title: ''
      },
      heatmapData: [],
      heatmapLayout: {
        title: ''
      }
    }
  },
  methods: {
    login: function () {
      this.proxy.login('jdoe', 'jdoe@example.com') // TODO
        .then(token => {
          this.$emit('tokenChanged', token)
        })
    },
    upload: function () {
      this.proxy.upload() // TODO add file
        .then(data => {
          if (data.refreshed_token) {
            this.$emit('tokenChanged', data.refreshed_token)
          }
        })
        .catch(e => {
          if (e.message === 'Authorization failed') {
            console.log(e.message)
            this.$emit('tokenChanged', '')
          } else {
            throw e
          }
        })
    },
    filterGenera: function (item, queryText, itemText) {
      let self = this
      if (queryText === '') {
        return true;
      }

      const needle = queryText.toLowerCase()
      return (
        item.toLowerCase().indexOf(needle) > -1 ||
        this.$t(item).toLowerCase().indexOf(needle) > -1
      );
    },
    updateGenus: function (genus) {
      this.proxy.getRecent(genus)
        .then((data) => {
          this.timelineData = data
          this.timelineLayout.title = this.$t(genus)
          Plotly.react('Timeline', [this.timelineData], this.timelineLayout)
        })
      this.proxy.getHeatmap(genus)
        .then((data) => {
          this.heatmapData = data
          this.heatmapLayout.title = this.$t(genus)
          Plotly.react('Heatmap', [this.heatmapData], this.heatmapLayout)
        })
      this.proxy.getRecentRaw()
        .then(responseData => {
          this.rawData = responseData
        })
    }
  },
  watch: {
    genus: function (newValue, oldValue) {
      this.updateGenus(newValue)
    },
    locale: function (newValue) {
      this.heatmapLayout.title = this.$t(this.genus)
      this.timelineLayout.title = this.$t(this.genus)
      Plotly.setPlotConfig({ locale: newValue })
      Plotly.react(
        'Timeline', [this.timelineData], this.timelineLayout, { 'locale': newValue }
      )
      Plotly.react(
        'Heatmap', [this.heatmapData], this.heatmapLayout, { 'locale': newValue }
      )
    }
  },
  props: {
    locale: {
      type: String,
      required: true
    },
    proxy: {
      type: Object,
      required: true
    }
  },
  mounted () {
    Plotly.newPlot('Timeline', this.timelineData, this.timelineLayout)
    Plotly.newPlot('Heatmap', this.heatmapData, this.heatmapLayout)
    let self = this
    this.$refs.timelineRef.on('plotly_relayout', function (evt) {
      let from = parsePlotlyDate(evt['xaxis.range[0]']);
      let to = parsePlotlyDate(evt['xaxis.range[1]']);
      let interval = Interval.fromDateTimes(from, to);
      if (interval.length() === 0) {
        return
      }
      self.proxy.getBetween(self.genus, from, to)
        .then((data) => {
          this.timelineData = data
          Plotly.react('Timeline', [this.timelineData], this.timelineLayout)
        })
    })
  },
  created () {
    this.updateGenus(this.genus)
    this.proxy.fetchGenera()
      .then(data => {
        this.allValues = data
      })
  },
  components: {
    DataTable
  }
}
</script>

<style>
</style>
