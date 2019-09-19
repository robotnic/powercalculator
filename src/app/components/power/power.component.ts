import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Loader } from '../../loader/loader.service';
import { Calculator } from '../../calculator/calculator.service';
declare let d3: any;
import * as moment from 'moment';

@Component({
  selector: 'app-power',
  templateUrl: './power.component.html',
  styleUrls: ['./power.component.less', './nv.d3.css'],
  encapsulation: ViewEncapsulation.None

})
export class PowerComponent implements OnInit {

  constructor(private loader: Loader, private calculator: Calculator) {}
  @ViewChild('nvd3') private nvd3: any;
  data;
  meta;
  date;
  country;
  layers;
  timetype;
  previoustimetype;
  options = {
    chart: {
      type: 'multiChart',
      legend: {
        dispatch: {
          stateChange: (e => {
            this.legendStateChanged(e);
          })
        }
      },
      duration: () => {
        let duration = 0;
        switch (this.timetype) {
          case 'day':
            duration = 300;
            break;
          case 'week':
            duration = 3000;
            break;
          case 'month':
            duration = 5000;
            break;
          case 'year':
            duration = 5000;
            break;
        }
        if (this.timetype !== this.previoustimetype) {
          duration = 0;
        }
        this.previoustimetype = this.timetype;
        return duration;
      },
      margin: {
        top: 150,
        right: 80,
        bottom: 60,
        left: 80
      },
      x: function(d) { return d.x; },
      y: function(d) { return d.y; },
      useInteractiveGuideline: false,
      interactiveLayer: {
        tooltip: {
          contentGenerator: (e, div) => {
            const date = moment(e.value).format('YYYY-MM-DD');
            let html = '<div>';
            html += '<h1>' + date + '</h1>';
            html += '<table>'
            e.series.forEach(chart => {
              html += `<tr><td style="color:${chart.color}">◼</td><td>${chart.key}</td><td</td><td>${Math.round(chart.value * 10) / 10}</td></tr>`
            });
            html += '</table>';
            html += '</div>';
            return html;
          }
        }
      },
      xAxis: {
        axisLabel: 'Date Time',
        tickFormat: (d) => {
          let t = "0";
          const timetype: String = 'day';
          switch (this.timetype) {
            case 'day':
              t = moment(d).format('HH:mm'); //d3.time.fmt(rmat('%x')(new Date(d))
              break;
            case 'week':
              t = moment(d).format('ddd DD.MMM.YYYY '); //d3.time.fmt(rmat('%x')(new Date(d))
              break;
            default:
              t = moment(d).format('ddd DD.MMM.YYYY'); //d3.time.fmt(rmat('%x')(new Date(d))
          }
          return t;
          //return d3.time.fmt(rmat('%x')(new Date(moment(d).format('DD.MMM HH:mm'))));
        },

        tickValues: function(charts) {
          const dayMS = 1000 * 60 * 60 * 24;
          const ticks = [];
          const values = charts[0].values;
          const start = values[0].x;
          const end = values[values.length - 1].x;
          const startTime = moment(start);
          const endTime = moment(end);
          const duration = moment.duration(endTime.diff(startTime)).asHours();
          let tickTime = 4;
          if (duration > 30) {
            tickTime = 24;
          }
          if (duration > 200) {
            tickTime = 24 * 7;
          }
          if (duration > 2000) {
            tickTime = 24 * 30;
          }
          const days = (end - start) / dayMS;
          ticks.push(start);
          while (startTime < endTime) {
            /*
            if (days <=1) {
              start += 1000*60*60*24/6;
            } else {
              if (days <= 8) {
                start += 1000*60*60*24;
              } else {
                start += 1000*60*60*24 *7;
              }
            }
            */
            startTime.add(tickTime, 'h');
            ticks.push(startTime.unix() * 1000);
          }
          return ticks;
        },
        rotateLabels: 10

      },
      yAxis1: {
        axisLabel: 'GW',
        tickFormat: function(d) {
          return d3.format('.02f')(d);
        },
        axisLabelDistance: -10,
        showMaxMin: false
      },
      yAxis2: {
        axisLabel: 'TWh',
        tickFormat: function(d) {
          return d3.format('.02f')(d / 1000 / 1000);
        },
        axisLabelDistance: -10,
        showMaxMin: false
      }


    }
  };

  height() {
    const h = window.innerHeight - 200;
    console.log(h);
    return h;
  }

  onResize(event) {
    console.log(this.nvd3);
    this.nvd3.updateWithOptions(this.options);
  }

  legendStateChanged(e) {
    console.log(e);
  }

  ngOnInit() {
    this.loader.power().subscribe(power => {
      const data: any = power;
      console.log('power', data);
      //      this.reduce(data.power);
      this.date = moment(data.meta.date, 'YYYYMMDD').format('YYYY/MM/DD');
      this.country = data.meta.country;
      this.timetype = data.meta.timetype;
      const chart = this.calculator.mutate();
      console.log('readypower', data);
      this.reduce(chart);
      this.nvd3.updateWithData(chart);
    });
  }

  reduce(data) {
    data.forEach(chart => {
      //console.log(chart.key, chart.values);
      const l = chart.values.length;
      const factor = Math.ceil(l / 300);
      let sum = 0;
      const values = [];
      chart.values.forEach((value, i) => {
        sum += value.y;
        if (i++ % factor === 0) {
          value.y = sum / factor;
          values.push(value);
          sum = 0;
        }
      });
      chart.values = values;
    });
  }
}