import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Loader } from 'src/app/loader/loader.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material';

import * as moment from 'moment';
import { Calculator } from 'src/app/calculator/calculator.service';
import { EventService } from 'src/app/eventhandler.service';
import { Data } from 'src/app/models/data';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.less']
})
export class TablesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;

  display = {
    'energy': ['key', 'original', 'modified', 'deltaEnergy'],
    'co2': ['key', 'originalCo2', 'modifiedCo2', 'deltaCo2'],
    'money': ['key', 'originalMoney', 'modifiedMoney', 'deltaMoney']
  };
  displayedColumns = this.display.energy;
  total = {};
  date;
  previousdate;
  country;
  meta;
  timetype;
  data;
  dataSource;
  math = Math;
  tabletype = 'energy';

  constructor(
    private loader: Loader,
    private calculator: Calculator,
    private eventService: EventService
  ) {}

  ngOnInit() {
    this.loader.power().subscribe((original: Data) => {
      this.date = moment(original.meta.date, 'YYYYMMDD').format('YYYY/MM/DD');
      this.meta = original.meta;
      this.country = original.meta.country;
      this.timetype = original.meta.timetype;
      this.calculator.mutate().then((modified: Data) => {
        this.data = modified;
        console.log('das große ding', modified.sum);
        let sum =  modified.sum;
        console.log('sum', sum);
        sum = sum.filter(item => {
          return item.key !== 'Leistung [MW]';
        });
        this.calcTotal(sum);
        this.dataSource = new MatTableDataSource(sum);
        this.sortBy('deltaMoney');
        console.log('this.dataSource', this.dataSource);
        this.dataSource.sort = this.sort;
        this.eventService.setState('message.calced', 'render');
        this.eventService.setState('message.calcing', '');
        this.previousdate = modified.meta.date;
      });
    });
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

  calcTotal(sum) {
    const total = {};
    sum.forEach(item => {
      // tslint:disable-next-line:forin
      for (const i in item) {
        if (!this.total[i]) {
          total[i] = 0;
        }
        if (!isNaN(item[i])) {
          total[i] += item[i];
        }
      }
      console.log(total);
      this.total = total;
      /*
      if (item.key === 'Leistung [MW]') {
        console.log(item);
        this.total = item;
      }
      */
    });
  }

  makeSum(sum) {
    const sumlist = [];
    // tslint:disable-next-line:forin
    for (const key in sum) {
      sumlist.push(sum[key]);
   }
   return sumlist;
  }
  getTotal(name) {
    return this.total[name] || '0';
  }
  changeTableType(event) {
    console.log('tabletype', event.value, this.display);
    this.displayedColumns = this.display[event.value];
  }
  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.sort = this.sort;
    }
  }
}