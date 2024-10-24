import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { Cliente, Producto } from '../../models/models';
import { NavController } from '@ionic/angular';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
})
export class ClientesPage implements OnInit {
  clienteForm: FormGroup;
  id: string | null = null;
  isEditingClient: boolean = false;
  productosDisponibles: Producto[] = []; // Productos disponibles

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.clienteForm = this.fb.group({
      nombre: ['', Validators.required],
      barrio: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      fechaAdquisicion: ['', Validators.required],
      valorTotalAPagar: [{ value: 0, disabled: true }],
      nuevoAbono: [0, [, Validators.min(0)]],
      totalAbonos: [{ value: 0, disabled: true }],
      valorFinal: [{ value: 0, disabled: true }],
      abonos: this.fb.array([]),
      productos: this.fb.array([]), // Lista de productos seleccionados
    });

    this.id = this.route.snapshot.paramMap.get('id');
    this.isEditingClient = this.id !== null;
  }

  ngOnInit() {
    if (this.isEditingClient) {
      this.cargarCliente(this.id!);
    }
    this.cargarProductosDisponibles(); // Cargar productos disponibles desde Firestore
  }

  get abonos(): FormArray {
    return this.clienteForm.get('abonos') as FormArray;
  }

  get productos(): FormArray {
    return this.clienteForm.get('productos') as FormArray;
  }

  cargarCliente(id: string) {
    this.firestoreService.getCliente(id).subscribe((cliente) => {
      if (cliente) {
        const fechaAdquisicion = this.formatDateToYYYYMMDD(
          cliente.fechaAdquisicion
        );
        this.clienteForm.patchValue({
          ...cliente,
          fechaAdquisicion,
        });

        this.abonos.clear();
        cliente.abonos?.forEach((abono) =>
          this.agregarAbonoAlFormulario(abono)
        );
        this.productos.clear();
        cliente.productos?.forEach((producto) =>
          this.agregarProductoAlFormulario(producto)
        );

        this.actualizarValoresTotales();
        this.cdr.detectChanges();
      }
    });
  }

  crearAbono() {
    const nuevoAbono = this.clienteForm.get('nuevoAbono')?.value;
    const abonosFormArray = this.clienteForm.get('abonos') as FormArray;

    if (nuevoAbono && nuevoAbono > 0) {
      const abono = {
        monto: nuevoAbono,
        fecha: new Date(),
      };
      abonosFormArray.push(this.fb.group(abono));
      this.clienteForm.get('nuevoAbono')?.reset();
    }
    this.actualizarTotalAbonos();
  }

  eliminarAbono(index: number) {
    const abonosFormArray = this.clienteForm.get('abonos') as FormArray;
    abonosFormArray.removeAt(index);
    this.actualizarTotalAbonos();
  }

  actualizarTotalAbonos() {
    const abonosFormArray = this.clienteForm.get('abonos') as FormArray;
    const totalAbonos = abonosFormArray.controls.reduce((total, control) => {
      return total + control.value.monto;
    }, 0);
    this.clienteForm.get('totalAbonos')?.setValue(totalAbonos);
    this.actualizarValorFinal();
  }

  actualizarValorFinal() {
    const valorTotalAPagar =
      this.clienteForm.get('valorTotalAPagar')?.value || 0;
    const totalAbonos = this.clienteForm.get('totalAbonos')?.value || 0;
    const valorFinal = valorTotalAPagar - totalAbonos;
    this.clienteForm.get('valorFinal')?.setValue(valorFinal);
  }

  agregarAbonoAlFormulario(abono: any) {
    let fecha = this.formatDateToYYYYMMDD(abono.fecha);
    this.abonos.push(
      this.fb.group({
        monto: [abono.monto, [Validators.required, Validators.min(0)]],
        fecha: [fecha],
      })
    );
  }

  agregarProductoAlFormulario(producto: Producto) {
    const cantidad = 1; // Puedes establecer una cantidad inicial
    this.productos.push(
      this.fb.group({
        id: [producto.id],
        nombre: [producto.nombre],
        valorUnitario: [producto.valorUnitario],
        cantidad: [cantidad, [Validators.required, Validators.min(1)]],
      })
    );

    this.actualizarValoresTotales();
  }

  cargarProductosDisponibles() {
    this.firestoreService.getProductos().subscribe((productos: Producto[]) => {
      this.productosDisponibles = productos; // Cargar productos desde Firestore
      this.cdr.detectChanges(); // Detectar cambios manualmente
    });
  }

  agregarProductoAlCliente(producto: Producto) {
    const productoExistente = this.productos.controls.find(
      (control) => control.get('id')!.value === producto.id
    );

    if (!productoExistente) {
      this.agregarProductoAlFormulario(producto);
      this.actualizarValoresTotales();
    } else {
      alert('El producto ya está agregado');
    }
  }

  eliminarProducto(index: number) {
    this.productos.removeAt(index);
    this.actualizarValoresTotales();
  }

  actualizarValoresTotales() {
    const totalAbonos = this.abonos.controls.reduce(
      (total, abono) => total + (abono.get('monto')?.value || 0),
      0
    );

    const valorTotalAPagar = this.productos.controls.reduce(
      (total, producto) => {
        const cantidad = producto.get('cantidad')?.value || 0;
        const valorUnitario = producto.get('valorUnitario')?.value || 0;
        return total + cantidad * valorUnitario;
      },
      0
    );

    const valorFinal = valorTotalAPagar - totalAbonos;

    this.clienteForm.patchValue({
      valorTotalAPagar: isNaN(valorTotalAPagar) ? 0 : valorTotalAPagar,
      totalAbonos: isNaN(totalAbonos) ? 0 : totalAbonos,
      valorFinal: isNaN(valorFinal) ? 0 : valorFinal,
    });
  }

  formatDateToYYYYMMDD(date: any): string {
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate() + 1).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return '';
  }

  convertirFecha(fecha: any): Date {
    if (fecha instanceof Timestamp) {
      return fecha.toDate();
    } else if (typeof fecha === 'string') {
      return new Date(fecha);
    } else {
      return fecha;
    }
  }

  guardarCliente() {
    if (this.clienteForm.valid) {
      const clienteData = this.prepararCliente();
      // Convertir fechaAdquisicion a Date si es necesario
      if (
        clienteData.fechaAdquisicion &&
        typeof clienteData.fechaAdquisicion === 'string'
      ) {
        const timezoneOffset = new Date().getTimezoneOffset() * 60000;
        let fecha = new Date(
          new Date(clienteData.fechaAdquisicion).getTime() - timezoneOffset
        );

        // Sumar un día a la fecha
        fecha.setDate(fecha.getDate() + 1);
        clienteData.fechaAdquisicion = fecha;
      }
      if (this.id) {
        // Actualizar cliente existente
        this.firestoreService.updateCliente(this.id, clienteData).then(() => {
          this.regresar();
        });
      } else {
        // Crear nuevo cliente
        this.firestoreService.createCliente(clienteData).then(() => {
          this.regresar();
        });
      }
    }
  }

  prepararCliente(): Cliente {
    const cliente: Cliente = this.clienteForm.value;
    cliente.abonos = this.abonos.value;
    cliente.productos = this.productos.value;
    cliente.fechaAdquisicion = this.convertirFecha(cliente.fechaAdquisicion); // Conversión de fecha aquí

    return cliente;
  }

  regresar() {
    this.router.navigate(['/clientes-list']);
  }

  irAPaginaProductos() {
    this.router.navigate(['/productos']);
  }

  getCantidadControl(index: number): FormControl {
    return this.productos.at(index).get('cantidad') as FormControl;
  }
}
