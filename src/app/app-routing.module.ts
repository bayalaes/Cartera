import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard'; // Importa el guard

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login', // Cambiar a 'login' para que inicie en la página de login
    pathMatch: 'full',
  },
  {
    path: 'clientes',
    loadChildren: () =>
      import('./pages/clientes/clientes.module').then(
        (m) => m.ClientesPageModule
      ),
      canActivate: [AuthGuard], // Aplica el AuthGuard aquí
  },
  {
    path: 'clientes/:id',
    loadChildren: () =>
      import('./pages/clientes/clientes.module').then(
        (m) => m.ClientesPageModule
      ),
      canActivate: [AuthGuard], // Aplica el AuthGuard aquí
  },
  {
    path: 'productos',
    loadChildren: () =>
      import('./pages/productos/productos.module').then(
        (m) => m.ProductosPageModule
      ),
      canActivate: [AuthGuard], // Aplica el AuthGuard aquí
  },
  {
    path: 'productos/:id',
    loadChildren: () =>
      import('./pages/productos/productos.module').then(
        (m) => m.ProductosPageModule
      ),
      canActivate: [AuthGuard], // Aplica el AuthGuard aquí
  },
  {
    path: 'clientes-list',
    loadChildren: () =>
      import('./pages/clientes-list/clientes-list.module').then(
        (m) => m.ClientesListPageModule
      ),
      canActivate: [AuthGuard], // Aplica el AuthGuard aquí
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./pages/register/register.module').then(
        (m) => m.RegisterPageModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
