import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PowerComponent } from './components/power/power.component';
import { EnergyComponent } from './components/energy/energy.component';
import { HomeComponent } from './components/home/home.component';
import { TablesComponent } from './components/tables/tables.component';

const routes: Routes = [
  { path: 'power', component: PowerComponent },
  { path: 'energy', component: EnergyComponent },
  { path: 'numbers', component: TablesComponent },
  { path: '',      component: HomeComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
