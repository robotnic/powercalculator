import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { Loader } from '../../loader/loader.service';
import { EventService } from '../../eventhandler.service';
import { MatTableDataSource } from '@angular/material/table';

declare let d3: any;
import * as moment from 'moment';
import { Data } from 'src/app/models/data';
import { Chart } from 'src/app/models/charts';
import { State } from 'src/app/models/state';
import { CalcschedulerService } from 'src/app/calculator/calcscheduler.service';

@Component({
  selector: 'app-power',
  templateUrl: './power.component.html',
  styleUrls: ['./power.component.less', './nv.d3.css'],
  encapsulation: ViewEncapsulation.None

})
export class PowerComponent implements OnInit, OnDestroy {
  view;
  charts;
  math = Math;
  loaderSubscription: any;
  eventSubscription: any;
  constructor(
    private loader: Loader,
    private scheduler: CalcschedulerService,
    private eventService: EventService
  ) {}
  @ViewChild('nvd3') private nvd3: any;
  data: Data;
  modified;
  sum = [];
  meta;
  date;
  previousdate;
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
      showLegend: false,
      duration: () => {
        let duration = 0;
        switch (this.timetype) {
          case 'day':
            duration = 800;
            break;
          case 'week':
            duration = 3000;
            break;
          case 'month':
            duration = 0;
            break;
          case 'year':
            duration = 5000;
            break;
        }
        if (this.timetype !== this.previoustimetype) {
          duration = 0;
        }
        if (!this.previousdate || this.previousdate === this.meta.date) {
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
      useInteractiveGuideline: true,
      interactiveLayer: {
        tooltip: {
          contentGenerator: (e, div) => {
            const date = moment(e.value).format('YYYY-MM-DD');
            let html = '<div>';
            html += '<h1>' + date + '</h1>';
            html += '<table>';
            e.series.forEach(chart => {
              html += `<tr>
              <td style="color:${chart.color}">◼</td>
              <td>${chart.key}</td>
              <td</td>
              <td>${Math.round(chart.value * 100) / 100} GW</td>
              </tr>`;
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
          let t = '0';
          const timetype: String = 'day';
          switch (this.timetype) {
            case 'day':
              t = moment(d).format('HH:mm');
              break;
            case 'week':
              t = moment(d).format('ddd DD.MMM.YYYY ');
              break;
            default:
              t = moment(d).format('ddd DD.MMM.YYYY');
          }
          return t;
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
        axisLabel: 'Electricity generation GW',
        tickFormat: function(d) {
          return d3.format('.02f')(d);
        },
        axisLabelDistance: -10,
        showMaxMin: false
      },
      yAxis2: {
        axisLabel: 'Hydro fill TWh',
        tickFormat: function(d) {
          return d3.format('.03f')(d / 1000 / 1000);
        },
        axisLabelDistance: -10,
        showMaxMin: false
      }

    }
  };

  height() {
    const h = window.innerHeight - 200;
    return h;
  }

  onResize(event) {
    this.nvd3.updateWithOptions(this.options);
  }

  legendStateChanged(e) {
    console.log(e);
  }

  ngOnInit() {
    console.log('---------------power--------');
    this.loaderSubscription = this.loader.power().subscribe((original: Data) => {
      console.log('more power');
      this.date = moment(original.meta.date, 'YYYYMMDD').format('YYYY/MM/DD');
      this.meta = original.meta;
      this.country = original.meta.country;
      this.timetype = original.meta.timetype;
      this.scheduler.mutate().then((modified: Data) => {
        console.log('got now data');
        this.data = modified;
        //const sum = this.makeSum(modified.sum);
        //this.dataSource = new MatTableDataSource(sum);
        this.charts = this.reduce(modified);
        this.nvd3.updateWithData(this.charts);
        this.eventService.setState('message.calced', 'render');
        this.eventService.setState('message.calcing', '');
        this.previousdate = modified.meta.date;
      });
    });
    this.eventSubscription = this.eventService.on('view').subscribe((state: State) => {
      this.charts.forEach((chart, i) => {
        chart.disabled = false;
        if (state.view.charts[i] === '1') {
          chart.disabled = true;
        }
      });
      this.nvd3.updateWithData(this.charts);
    });
  }

  makeSum(sum) {
    const sumlist = [];
    // tslint:disable-next-line:forin
    for (const key in sum) {
      let co2percent = '';
      if (sum[key].co2) {
        co2percent = Math.round(sum[key].modified / sum[key].original * 100).toString();
      }
      sumlist.push({
        key: key,
        power: Math.round(sum[key].original),
        loadshifted: Math.round(sum[key].modified),
        delta: Math.round(sum[key].deltaEnergy),
        money: sum[key].delta * 40 * 1000,
        co2: sum[key].co2,
        co2percent: co2percent
      });
    }
    return sumlist;
  }

  reduce(data) {
    data.loadshifted.forEach(chart => {
      const l = chart.values.length;
      const factor = Math.ceil(l / 300);
      let sum = 0;
      const values = [];
      chart.values.forEach((value, i) => {
        sum += value.y;
        if ((i % factor) === 0) {
          if (i > 0) {
            value.y = sum / factor;
          }
          values.push(value);
          sum = 0;
        }
      });
      chart.values = values;
    });
    return data.loadshifted;
  }
  ngOnDestroy() {
    this.eventSubscription.unsubscribe();
    this.loaderSubscription.unsubscribe();
  }
}