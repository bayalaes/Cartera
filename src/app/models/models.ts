// Eliminar `ProductoSeleccionado`, ya que no será necesario
export interface Producto {
  id?: string; // ID opcional, podría estar presente si se está recuperando de Firestore
  nombre: string; // Nombre del producto
  valorUnitario: number; // Valor unitario del producto
  cantidad: number; // Cantidad seleccionada del producto (ahora siempre es requerido)
  valorTotal: number; // Valor total (cantidad * valorUnitario), calculado en base a cantidad y valorUnitario
}

export interface Abono {
  monto: number; // Monto del abono
  fecha: Date; // Fecha del abono
}

export interface Cliente {
  id?: string; // ID opcional del cliente, puede estar presente si se recupera de Firestore
  nombre: string; // Nombre del cliente
  barrio: string; // Barrio del cliente
  direccion: string; // Dirección del cliente
  telefono: string; // Teléfono del cliente
  fechaAdquisicion: Date; // Fecha de adquisición del cliente
  productos: Producto[]; // Lista de productos seleccionados por el cliente
  valorTotalAPagar: number; // Valor total a pagar por el cliente
  abonos?: Abono[]; // Lista opcional de abonos realizados por el cliente
  totalAbonos: number; // Total de abonos realizados
  valorFinal: number; // Valor final a pagar (valorTotalAPagar - totalAbonos)
}

// Interfaz para el formulario de inicio de sesión
export interface LoginForm {
  email: string; // Correo electrónico del usuario
  password: string; // Contraseña del usuario
}

export interface UserProfile {
  uid: string; // ID único del usuario generado por Firebase Authentication
  email: string; // Correo electrónico del usuario
  nombre?: string; // Nombre del usuario
  telefono?: string; // Teléfono del usuario (opcional)
  direccion?: string; // Dirección del usuario (opcional)
  rol?: string; // Rol del usuario (por ejemplo, admin, cliente)
}
