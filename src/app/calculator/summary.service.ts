import { Injectable } from '@angular/core';
import { SumItem } from '../models/sum';
import { EventService } from '../eventhandler.service';

@Injectable({
  providedIn: 'root'
})
export class SummaryService {
  state;
  constructor(
    private eventService: EventService
  ) {}

  calcSummary(data) {
    data.sum = {
      electricity: this.calcElectricity(data),
      energy: {}
    };
    data.sum.energy = this.calcEnergy(data);
    data.keyFigures = this.getKeyFigures(data.sum);
    this.eventService.setState('figures', data.keyFigures);
  }

  getKeyFigures(sum) {
    const electricTotals = sum.electricity.totals;
    const energyTotals = sum.energy.totals;
    //const originalCo2 = electricTotals.originalCo2 + energyTotals.originalCo2;
    //const modifiedCo2 = electricTotals.modifiedCo2 + energyTotals.modifiedCo2;
    const percent = energyTotals.modifiedCo2 / energyTotals.originalCo2 * 100;
    return {
      percentCo2: percent,
      original: energyTotals.original,
      modified: energyTotals.modified,
    };
  }

  calcEnergy(data) {
    this.state = this.eventService.getState();
    const transport = this.state.mutate.Transport;
    console.log('THE STATE', transport);
    const factor = this.getDurationFactor(data.power);
    console.log('calcenergy', factor, data.consumption);
    const sumObj = {};
    const sum = {
      items: [],
      totals: {}
    };
    // tslint:disable-next-line:forin
    for (const t in data.consumption) {
      // tslint:disable-next-line:forin
      for (const k in data.consumption[t]) {
        const v = data.consumption[t][k];
        if (!isNaN(v)) {
          if (!sumObj[k]) {
            sumObj[k] = 0;
          }
          sumObj[k] += v;
        }
      }
    }
    // tslint:disable-next-line:forin
    for (const s in sumObj) {
      let row = {
        key: s,
        original: sumObj[s] * factor,
        originalCo2: 0,
        modified: sumObj[s] * factor,
        modifiedCo2: 0,
        deltaEnergy: 0,
        deltaCo2: 0,
        originalMoney: 0,
        modifiedMoney: 0,
        deltaMoney: 0,
      };
      if (s === 'Gas/Diesel Oil (w/o bio)' || s === 'Motor Gasoline (w/o bio)') {
        row.modified = row.original * (100 - transport) / 100;
      }

      if (data.config[s] && data.config[s].co2) {
        row.originalCo2 = row.original * data.config[s].co2 / 1000;
        row.modifiedCo2 = row.modified * data.config[s].co2 / 1000;
      }
      row.deltaEnergy = row.modified - row.original;
      row.deltaCo2 = row.modifiedCo2 - row.originalCo2;
      row.originalMoney = row.original * 50000;
      row.modifiedMoney = row.modified * 50000;
      row.deltaMoney = row.modifiedMoney - row.originalMoney;
      if (row.key === 'Electricity') {
        console.log('hot swap', data.sum.electricity.totals, row);
        row = data.sum.electricity.totals;
        row.key = 'Electrity';
      }
      sum.items.push(row);
    }
    sum.totals = this.makeTotals(sum.items);
    return sum;
  }

  getDurationFactor(power) {
    const start = power[0].values[0].x;
    const end = power[0].values[power[0].values.length - 1].x;
    const duration = end - start;
    const yearDuration = 365 * 24 * 60 * 60 * 1000;
    console.log('duration', start, end, duration / 1000);
    return duration / yearDuration;
  }

  calcElectricity(data) {
    const sum = {
      items: [],
      totals: {}
    };
    for (let p = 0; p < data.power.length; p++) {
      const key = data.power[p].key;
      if (!key.startsWith('hydrofill') && !key.startsWith('Leistung')) {
        sum.items.push(this.makeSum(data, p));
      }
    }
    sum.totals = this.makeTotals(sum.items);
    console.log(sum);
    return sum;
  }

  makeTotals(items) {
    const totals = {};
    items.forEach(item => {
      // tslint:disable-next-line:forin
      for (const key in item) {
        if (!totals[key]) {
          totals[key] = 0;
        }
        totals[key] += item[key];
      }
    });
    return totals;
  }

  makeSum(data, p) {
    const sum: SumItem = {
      original: 0,
      modified: 0,
      deltaEnergy: 0,
      originalCo2: 0,
      modifiedCo2: 0,
      deltaCo2: 0,
      originalMoney: 0,
      modifiedMoney: 0,
      deltaMoney: 0,
      key: ''
    };
    const deltaTime = this.getResolution(data.power[p]);
    data.power[p].values.forEach((item, i) => {
      const original: number = item.y;
      const modified: number = data.loadshifted[p].values[i].y;
      const delta: number = modified - original;
      sum.key = data.power[p].key;
      sum.original += original * deltaTime;
      sum.modified += modified * deltaTime;
      sum.deltaEnergy += delta * deltaTime;
      let co2factor = 0;
      if (data.power[p] && data.config[data.power[p].originalKey] && !isNaN(data.config[data.power[p].originalKey].co2)) {
        co2factor = data.config[data.power[p].originalKey].co2 / 1000;
      }
      sum.modifiedCo2 = sum.modified * co2factor;
      sum.originalCo2 = sum.original * co2factor;
      sum.deltaCo2 = sum.deltaEnergy * co2factor;
      sum.originalMoney += original * deltaTime * 40 * 1000;
      sum.modifiedMoney += modified * deltaTime * 40 * 1000;
      sum.deltaMoney += delta * deltaTime * 40 * 1000 || 0;
    });
    return sum;
  }

  getResolution(chart) {
    let deltaTime = 0.25;
    switch (chart.resolution) {
      case 'PT15M':
        deltaTime = 0.25;
        break;
      case 'PT60M':
        deltaTime = 1;
        break;
      default:
        console.error('missing resolution', chart.key, chart.resolution);
    }
    return deltaTime;
  }
}