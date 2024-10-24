import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientesListPage } from './clientes-list.page';

const routes: Routes = [
  {
    path: '',
    component: ClientesListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientesListPageRoutingModule {}
