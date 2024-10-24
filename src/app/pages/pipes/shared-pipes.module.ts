// shared-pipes.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThousandsSeparatorPipe } from './thousands-separator.pipe'; // Ajusta la ruta si es necesario

@NgModule({
  declarations: [ThousandsSeparatorPipe],
  imports: [CommonModule],
  exports: [ThousandsSeparatorPipe] // Exporta el pipe para que esté disponible fuera de este módulo
})
export class SharedPipesModule {}
