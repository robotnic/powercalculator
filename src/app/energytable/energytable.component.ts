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
  total = {};
  dataSource;
  constructor() {}
  @ViewChild(MatSort) sort: MatSort;
  @Input() data: Data;
  tabletype = 'energy';


  display = {
    'energy': ['key', 'original', 'modified', 'deltaEnergy'],
    'co2': ['key', 'originalCo2', 'modifiedCo2', 'deltaCo2'],
    'money': ['key', 'originalMoney', 'modifiedMoney', 'deltaMoney']
  };
  displayedColumns = this.display.energy;

  ngOnInit() {};
  ngOnChanges() {
    if (this.data.sum) {
      this.dataSource = new MatTableDataSource(this.data.sum.energy.items);
      this.total = this.data.sum.energy.totals;
      this.sortBy('original');
      this.dataSource.sort = this.sort;
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
  getTotal(name) {
    return this.total[name] || '0';
  }
  changeTableType(event) {
    this.displayedColumns = this.display[event.value];
  }
  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.sort = this.sort;
    }
  }

}
