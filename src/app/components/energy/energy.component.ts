import { Component, OnInit, OnDestroy } from '@angular/core';
import { Loader } from 'src/app/loader/loader.service';
import { EventService } from 'src/app/eventhandler.service';
import * as moment from 'moment';
import { Data } from 'src/app/models/data';
import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey-diagram';
import { CalcschedulerService } from 'src/app/calculator/calcscheduler.service';

@Component({
  selector: 'app-energy',
  templateUrl: './energy.component.html',
  styleUrls: ['./energy.component.less']
})
export class EnergyComponent implements OnInit, OnDestroy {
  data: Data;
  loaderSubscription: any;
  extent = [
    [170, 10],
    [1240, 650]
  ];
  constructor(
    private loader: Loader,
    private scheduler: CalcschedulerService,
    private eventService: EventService
  ) {}

  ngOnInit() {
    this.extent = this.calcExtent();
    this.loaderSubscription = this.loader.power().subscribe((original: Data) => {
      this.scheduler.mutate().then((modified: Data) => {
        this.data = modified;
        const sankey = this.makeSum(modified);
        this.addEV(sankey);
        //        this.addGasStorage(sankey);
        sankey.order = this.makeOrder(sankey.links);
        this.draw(sankey);
        this.eventService.setState('message.calced', 'render');
        this.eventService.setState('message.calcing', '');
      });
    });
  }

  addGasStorage(sankey) {
    console.log('add storage', sankey);
    sankey.nodes.push({
      id: 'Gas Storage',
      title: 'Gas Storage'
    });
  }

  addEV(sankey) {
    let fossilTransport = 0;
    const state = this.eventService.getState();
    const ev = state.mutate.Transport / 100;
    sankey.links.forEach(link => {
      if (link.target === 'Road') {
        if ((link.source === 'Motor Gasoline (w/o bio)') || (link.source === 'Gas/Diesel Oil (w/o bio)')) {
          fossilTransport += link.value * ev;
          link.value = link.value * (1 - ev);
        }
      }
    });
    const evTransport = {
      source: 'Electricity',
      target: 'Road',
      value: fossilTransport / 2,
      color: 'gold',
      type: 'electricity'
    };
    sankey.links.push(evTransport);
  }

  draw(energy) {
    const layout = d3Sankey.sankey().extent( this.extent);
    const diagram = d3Sankey.sankeyDiagram()
      .linkColor(function(d) { return d.color; })
      .linkTitle(function(d) {
        let title = d.source.title;
        title += ' → ';
        title += d.target.title;
        title += ' ' + Math.round(d.value) + ' GWh';
        return title;
      });

    //d3.json('assets/energy.json', function(energy) {
    layout.ordering(energy.order);
    d3.select('#sankey')
      .datum(layout(energy))
      .call(diagram);

    //});
  }

  makeSum(data) {
    //console.log('sum', data.sum);
    //console.log('consumption', data.consumption);
    const sankey = {
      nodes: [],
      links: [],
      order: []
    };
    sankey.links = this.makeLinksConsumption(data);
    sankey.links = this.makeLinks(data).concat(sankey.links);
    sankey.links = this.makeThePower2Gas(sankey.links);
    sankey.nodes = this.makeNodesConsumption(sankey.links);
    //sankey.rankSet = this.makeRankSet(sankey.links);
    //sankey.order = this.makeOrder(sankey.links);
    return sankey;
  }
  makeOrder(links) {
    const start = [];
    const middle = ['Electricity'];
    const middle2 = [];
    const end = [];
    links.forEach(link => {
      if (link.target === 'Power2Gas') {
        middle2.push(link.target);
      } else {
        if (link.source !== 'Electricity') {
          start.push(link.source);
        }
        if (link.target !== 'Electricity') {
          end.push(link.target);
        }
      }
    });
    return [
      [start],
      [middle],
      [middle2],
      [end]
    ];
  }

  makeNodes(data) {
    const nodes = [];
    // tslint:disable-next-line:forin
    for (const s in data.sum) {
      const node = {
        id: s,
        title: s
      };
      nodes.push(node);
    }
    return nodes;
  }
  makeLinks(data) {
    const links = [];
    console.log('sankey', data.sum.electricity);
    data.sum.electricity.items.forEach((item, s) => {
      const link = {
        source: item.key,
        target: 'Electricity',
        value: item.modified,
        color: data.config[item.key].color,
        type: 'electricity'
      };
      if (link.value < 0) {
        link.source = 'Electricity';
        link.target = item.key;
        link.value = -link.value;
      }
      if (item.key !== 'Leistung [MW]') {
        links.push(link);
      }
    });
    /*
    links.push({
      source: 'Power2Gas',
      target: 'Residential',
      value: 5,
      color: 'red',
    });
    */
    return links;
  }

  makeNodesConsumption(links) {
    const names = [];
    const nodes = [];
    // tslint:disable-next-line:forin
    links.forEach(link => {
      if (names.indexOf(link.source) === -1) {
        names.push(link.source);
      }
      if (names.indexOf(link.target) === -1) {
        names.push(link.target);
      }
    });
    names.forEach(name => {
      nodes.push({
        id: name,
        title: name
      });
    });
    return nodes;
  }
  makeLinksConsumption(data) {
    const state = this.eventService.getState();
    let factor = 1;
    switch (state.navigate.timetype) {
      case 'day':
        factor = 365;
        break;
      case 'week':
        factor = 365 / 7;
        break;
      case 'month':
        factor = 12;
        break;
      case 'year':
        factor = 1;
        break;
    }
    let links = [];
    // tslint:disable-next-line:forin
    for (const s in data.consumption) {
      for (const t in data.consumption[s]) {
        let color = 'red';
        if (data.config[t]) {
          color = data.config[t].color;
        }
        // tslint:disable-next-line:forin
        const link = {
          source: t,
          target: s,
          value: data.consumption[s][t] / factor,
          color: color,
          type: 'not electricity'
        };
        if (link.value < 0) {
          link.source = s;
          link.target = t;
          link.value = -link.value;
        }
        links.push(link);
      }
    }

    links = links.sort((a, b) => {
      return b.value - a.value;
    });
    const l = Math.round(window.innerWidth / 50)
    links.length = l;
    return links;
  }

  makeThePower2Gas(links) {
    let hasGas = 0;
    links.forEach(item => {
      if (item.target === 'Power2Gas') {
        hasGas = item.value * 0.7;
      }
    });
    links.forEach(item => {
      if (item.source === 'Natural gas') {
        if (item.value < hasGas) {
          item.source = 'Power2Gas';
          item.color = 'lightblue';
          hasGas -= item.value;
        } else {
          if (hasGas > 0) {
            links.push({
              source: 'Power2Gas',
              target: item.target,
              value: hasGas,
              color: 'lightblue',
            });
            item.value -= hasGas;
            hasGas = 0;
          }
        }
      }
    });
    if (hasGas > 0) {
      links.push({
        source: 'Power2Gas',
        target: 'Gas Storage',
        value: hasGas,
        color: 'lightblue',
      });
    }
    /*
        links.push({
          source: 'Power2Gas',
          target: 'residential',
          value: 5,
          color: 'red',
        });
        */
    return links;
  }

  calcExtent() {
    const w = window.innerWidth - 550;
    const h = window.innerHeight - 100;
    return [
      [170, 10],
      [w, h]
    ]
  }

  ngOnDestroy() {
    console.log('unsubscribe');
    this.loaderSubscription.unsubscribe();
  }
}