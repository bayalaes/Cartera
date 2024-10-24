import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Cliente, Producto } from '../models/models';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Timestamp } from '@angular/fire/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private dbPath = 'clientes';
  private productDbPath = 'productos';

  constructor(private firestore: AngularFirestore) {}

  // Métodos para manejar clientes
  async createCliente(cliente: Cliente): Promise<string> {
    try {
      cliente.productos = cliente.productos || [];
      cliente.abonos = cliente.abonos || [];
      const docRef = await this.firestore.collection<Cliente>(this.dbPath).add(cliente);
      return docRef.id;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  getClientes(): Observable<Cliente[]> {
    return this.firestore.collection<Cliente>(this.dbPath).snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Cliente;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      ),
      catchError(this.handleError)
    );
  }

  getCliente(id: string): Observable<Cliente | undefined> {
    return this.firestore.doc<Cliente>(`${this.dbPath}/${id}`).valueChanges().pipe(
      map((cliente) => {
        if (cliente) {
          cliente.fechaAdquisicion = this.convertirFecha(cliente.fechaAdquisicion);
          cliente.productos = cliente.productos || [];
          cliente.abonos = cliente.abonos || [];
          cliente.abonos = cliente.abonos.map((abono) => ({
            ...abono,
            fecha: this.convertirFecha(abono.fecha),
          }));
        }
        return cliente;
      }),
      catchError(this.handleError)
    );
  }

  private convertirFecha(fecha: any): Date {
    if (fecha instanceof Timestamp) {
      return fecha.toDate();
    } else if (typeof fecha === 'string' || fecha instanceof Date) {
      return new Date(fecha);
    }
    return fecha;
  }

  async updateCliente(id: string, cliente: Cliente): Promise<void> {
    try {
      cliente.productos = cliente.productos || [];
      cliente.abonos = cliente.abonos || [];
      await this.firestore.doc(`${this.dbPath}/${id}`).update(cliente);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async deleteCliente(id: string): Promise<void> {
    try {
      await this.firestore.doc(`${this.dbPath}/${id}`).delete();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Métodos para manejar productos
  async createProducto(producto: Producto): Promise<void> {
    try {
      await this.firestore.collection<Producto>(this.productDbPath).add(producto);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  getProductos(): Observable<Producto[]> {
    return this.firestore.collection<Producto>(this.productDbPath).snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Producto;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      ),
      catchError(this.handleError)
    );
  }

  getProducto(id: string): Observable<Producto | undefined> {
    return this.firestore.doc<Producto>(`${this.productDbPath}/${id}`).valueChanges().pipe(
      catchError(this.handleError)
    );
  }

  async updateProducto(id: string, producto: Producto): Promise<void> {
    try {
      await this.firestore.doc(`${this.productDbPath}/${id}`).update(producto);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async deleteProducto(id: string): Promise<void> {
    try {
      await this.firestore.doc(`${this.productDbPath}/${id}`).delete();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Métodos para asociar productos al cliente directamente
  async agregarProductoACliente(clienteId: string, producto: Producto): Promise<void> {
    try {
      const clienteRef = this.firestore.collection(this.dbPath).doc(clienteId);
      const clienteDoc = await clienteRef.get().toPromise();

      if (!clienteDoc!.exists) {
        throw new Error(`Cliente con ID ${clienteId} no existe`);
      }

      const clienteData = clienteDoc!.data() as Cliente;
      clienteData.productos = clienteData.productos || [];
      clienteData.productos.push(producto);

      // Actualiza el total a pagar
      this.calcularTotales(clienteData);

      await clienteRef.update({
        productos: firebase.firestore.FieldValue.arrayUnion(producto),
        valorTotalAPagar: clienteData.valorTotalAPagar,
        valorFinal: clienteData.valorFinal,
        totalAbonos: clienteData.totalAbonos,
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async eliminarProductoDeCliente(clienteId: string, producto: Producto): Promise<void> {
    try {
      const clienteRef = this.firestore.collection(this.dbPath).doc(clienteId);
      const clienteDoc = await clienteRef.get().toPromise();

      if (!clienteDoc!.exists) {
        throw new Error(`Cliente con ID ${clienteId} no existe`);
      }

      const clienteData = clienteDoc!.data() as Cliente;
      clienteData.productos = clienteData.productos!.filter((p) => p.id !== producto.id);

      // Actualiza el total a pagar
      this.calcularTotales(clienteData);

      await clienteRef.update({
        productos: firebase.firestore.FieldValue.arrayRemove(producto),
        valorTotalAPagar: clienteData.valorTotalAPagar,
        valorFinal: clienteData.valorFinal,
        totalAbonos: clienteData.totalAbonos,
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private calcularTotales(cliente: Cliente): void {
    cliente.valorTotalAPagar = cliente.productos!.reduce(
      (total, prod) => total + prod.valorUnitario * prod.cantidad,
      0
    );
    cliente.valorFinal = cliente.valorTotalAPagar - cliente.totalAbonos;
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en FirestoreService:', error.message || error);
    return throwError(error.message || 'Error en la operación de Firestore');
  }
}
