import { Injectable } from '@angular/core';
import { Chart } from '../models/charts';

@Injectable({
  providedIn: 'root'
})
export class NormalizeService {

  constructor() { }

  normalize(data) {
    //this.splitPump(data);
    this.addCurtailment(data);
    this.sortData(data);
    return data;
  }

  splitPump(data) {
    const key = 'Hydro Pumped Storage';
    let pumpUp: Chart = null;
    let pumpDown: Chart = null;
    data.power.forEach(chart => {
      if (chart.key === key) {
        console.log(chart.key, '-', key);
        console.log('--------------------');
        pumpUp = JSON.parse(JSON.stringify(chart));
        pumpUp.key = 'Hydro Pumped down';
        pumpUp.originalKey = 'Hydro Pumped down';
        pumpUp.seriesIndex = data.power.length;
        pumpDown = JSON.parse(JSON.stringify(chart));
        pumpDown.key = 'Hydro Pumped up';
        pumpDown.originalKey = 'Hydro Pumped up';
        pumpDown.seriesIndex = data.power.length + 1;
        pumpUp.values.forEach(value => {
          if (value.y < 0) {
            value.y = 0;
          }
        });

        pumpDown.values.forEach(value => {
          if (value.y > 0) {
            value.y = 0;
          }
        });
      }
    });
    data.power = data.power.filter(chart => {
      return chart.key !== key;
    });
    if (pumpUp) {
      data.power.push(pumpUp);
    }
    if (pumpDown) {
      data.power.unshift(pumpDown);
    }
    return data;
  }

  sortData(data) {
    const order: string[] = [
      'Hydro Pumped Storage',
      'Curtailment',
      'Nuclear',
      'Hydro Run-of-river and poundage',
      'Hydro Water Reservoir',
      'Waste',
      'Biomass',
      'Fossil Oil',
      'Fossil Gas',
      'Other',
      'Fossil Hard coal',
      'Fossil Brown coal/Lignite',
      'Geothermal',
      'Other renewable',
      'Solar',
      'Wind Offshore',
      'Wind Onshore',
      'Leistung [MW]'];

    data.power = data.power.sort((a, b) => {
      return order.indexOf(a.key) - order.indexOf(b.key);
    });
  }

  addCurtailment(data) {
    const chart: Chart = JSON.parse(JSON.stringify(data.power[0]));
    chart.values.forEach(item => {
      item.y = 0;
    });
    chart.key = 'Curtailment';
    chart.originalKey = 'Curtailment';
    //data.power.splice(1, 0, chart);
    data.power.unshift(chart);
  }
}
