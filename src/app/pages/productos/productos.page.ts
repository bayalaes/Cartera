import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { Producto } from '../../models/models';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage {
  productoForm: FormGroup;
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  terminoBusqueda: string = '';

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      valorUnitario: [0, [Validators.required, Validators.min(0.01)]],
    });

    this.cargarProductos();
  }

  cargarProductos() {
    this.firestoreService.getProductos().subscribe((productos) => {
      this.productos = productos;
      this.actualizarProductosFiltrados();
      this.cd.detectChanges(); // Forzar detección de cambios
    });
  }

  actualizarProductosFiltrados() {
    this.productosFiltrados = this.productos.filter((producto) => {
      return true; // Aquí puedes agregar lógica de filtrado si es necesario
    });
  }

  agregarProducto() {
    if (this.productoForm.valid) {
      const nuevoProducto: Producto = { ...this.productoForm.value };
      this.firestoreService.createProducto(nuevoProducto).then(() => {
        this.productoForm.reset();
        this.cargarProductos();
      });
    }
  }

  async eliminarProducto(id: string) {
    await this.firestoreService.deleteProducto(id);
    this.cargarProductos();
  }

  regresar() {
    this.router.navigate(['/clientes']); // Regresar a la lista de clientes
  }

  filtrarProductos(event: any) {
    const termino = event.target.value.toLowerCase();
    this.productosFiltrados = this.productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(termino)
    );
  }
}
