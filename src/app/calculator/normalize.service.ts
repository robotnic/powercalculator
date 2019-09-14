import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NormalizeService {

  constructor() { }

  normalize(data) {
    this.splitPump(data);
    this.sortData(data);
    return data;
  }

  splitPump(data) {
    //data = JSON.parse(JSON.stringify(data));
    const key = 'Hydro Pumped Storage';
    let pumpUp = null;
    let pumpDown = null;
    data.power.forEach(chart => {
      if (chart.key === key) {
        console.log(chart.key, '-', key);
        console.log('--------------------');
        pumpUp = JSON.parse(JSON.stringify(chart));
        pumpUp.key = 'Hydro Pumped down';
        pumpUp.originalKey = 'Hydro Pump down';
        pumpUp.seriesIndex = data.power.length;
        pumpDown = JSON.parse(JSON.stringify(chart));
        pumpDown.key = 'Hydro Pumped up';
        pumpDown.originalKey = 'Hydro Pump up';
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
        console.log('splitPump', chart.key, pumpDown.key, pumpUp.key, pumpUp);
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
    console.log('splitPump', data);
    return data;
  }

  sortData(data) {
    const order = ['Hydro Pump up', 'Hydro Pump down', 'Nuclear', 'Hydro Run-of-river and poundage', 'Hydro Water Reservoir', 'Waste', 'Biomass',  'Fossil Oil', 'Fossil Gas', 'Other', 'Fossil Hard coal', 'Fossil Brown coal/Lignite', 'Geothermal', 'Other renewable', 'Solar', 'Wind Offshore', 'Wind Onshore', 'Leistung [MW]'];

    data.power = data.power.sort((a, b) => {
      return order.indexOf(a.key) - order.indexOf(b.key);
    });
  }
}
