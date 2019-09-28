import { Injectable } from '@angular/core';
import { Chart } from '../models/charts';

@Injectable({
  providedIn: 'root'
})
export class NormalizeService {

  constructor() { }

  normalize(data) {
    // this.splitPump(data);
    this.addEmptyChart(data, 'Curtailment');
    this.addEmptyChart(data, 'Transport');
    this.addEmptyChart(data, 'Power2Gas');
    this.sortData(data);
    return data;
  }

  sortData(data) {
    const order: string[] = [
      'Hydro Pumped Storage',
      'Power2Gas',
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
      'Transport',
      'Leistung [MW]'];

    data.power = data.power.sort((a, b) => {
      return order.indexOf(a.key) - order.indexOf(b.key);
    });
  }

  addEmptyChart(data, key) {
    const chart: Chart = JSON.parse(JSON.stringify(data.power[0]));
    chart.values.forEach(item => {
      item.y = 0;
    });
    chart.key = key;
    chart.originalKey = key;
    chart.source = 'powercalculator';
    data.power.unshift(chart);
  }
}
