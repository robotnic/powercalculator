import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PowerComponent } from './components/power/power.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: 'power', component: PowerComponent },
  { path: '',      component: HomeComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
