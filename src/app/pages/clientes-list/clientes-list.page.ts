import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Cliente } from '../../models/models';

@Component({
  selector: 'app-clientes-list',
  templateUrl: './clientes-list.page.html',
  styleUrls: ['./clientes-list.page.scss'],
})
export class ClientesListPage implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  toggleStates: { [key: string]: boolean } = {};

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.firestoreService.getClientes().subscribe((data) => {
      this.clientes = data;
      this.clientesFiltrados = data;
      this.clientes.forEach((cliente) => {
        if (cliente.id) {
          this.toggleStates[cliente.id] = false;
        }
      });
    });
  }

  toggleCliente(id: string) {
    this.toggleStates[id] = !this.toggleStates[id];
  }

  filtrarClientes(event: any) {
    const query = event.target.value.toLowerCase();
    this.clientesFiltrados = this.clientes.filter((cliente) => {
      return (
        cliente.nombre.toLowerCase().includes(query) ||
        cliente.barrio.toLowerCase().includes(query)
      );
    });
  }

  eliminarCliente(id: string) {
    this.firestoreService.deleteCliente(id)
    .then(() => {
      console.log('Cliente eliminado con exito');
      this.clientes = this.clientes.filter(cliente => cliente.id !== id);
      this.clientesFiltrados = this.clientesFiltrados.filter(cliente => cliente.id !== id);
    })
    .catch((error) => {
      console.error('Error eliminando cliente: ', error);
    });
  }
}
