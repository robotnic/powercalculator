import { Component, OnInit, ViewChild, Input, OnChanges, AfterViewInit } from '@angular/core';
import { MatSort } from '@angular/material';
import { Data } from '../models/data';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-energytable',
  templateUrl: './energytable.component.html',
  styleUrls: ['./energytable.component.less']
})
export class EnergytableComponent implements OnInit, OnChanges, AfterViewInit {
  total = [];
  dataSource;
  constructor() {}
  @ViewChild(MatSort) sort: MatSort;
  @Input() data: Data;

  display = {
    'energy': ['key', 'original', 'originalCo2'],
    'co2': ['key', 'originalCo2', 'modifiedCo2', 'deltaCo2'],
    'money': ['key', 'originalMoney', 'modifiedMoney', 'deltaMoney']
  };
  displayedColumns = this.display.energy;

  ngOnInit() {}
  ngOnChanges() {
    this.makeSums(this.data.consumption);
    this.dataSource = new MatTableDataSource(this.total);
    this.sortBy('deltaMoney');
    this.dataSource.sort = this.sort;
  }

  makeSums(consumption) {
    const factor = this.getFactor();
    const total = {};
    // tslint:disable-next-line:forin
    for (const c in consumption) {
      // tslint:disable-next-line:forin
      for (const e in consumption[c]) {
        if (!total[e]) {
          total[e] = 0;
        }
        total[e] += consumption[c][e];
      }
    }
    this.total.length = 0;
    // tslint:disable-next-line:forin
    for (const t in total) {
      const item = {
        key: t,
        original: total[t] * factor,
        originalCo2: 0
      };
      if (this.data.config[t] && this.data.config[t].co2) {
        item.originalCo2 = item.original * this.data.config[t].co2;
      }
      this.total.push(item);
    }
  }

  sortBy(type) {
    this.dataSource.data.sort((a: any, b: any) => {
      if (a[type] === b[type]) {
        return 0;
      }
      if (Math.abs(a[type]) > Math.abs(b[type])) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  getFactor() {
    let factor = 1;
    switch (this.data.meta.timetype) {
      case 'month':
        factor = 1 / 12;
        break;

      case 'day':
        factor = 1 / 365;
        break;
    }
    return factor;
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.sort = this.sort;
    }
  }

}
