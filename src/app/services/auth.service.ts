// services/auth.service.ts
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth) {}

  // Registrar usuario con email y password
  async register(email: string, password: string) {
    try {
      return await this.afAuth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Error al registrar: ', error);
      throw error; // Re-lanzar el error para manejarlo en el componente
    }
  }

  // Iniciar sesión con email y password
  async login(email: string, password: string) {
    try {
      return await this.afAuth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Error al iniciar sesión: ', error);
      throw error; // Re-lanzar el error para manejarlo en el componente
    }
  }

  // Iniciar sesión con Google
  async loginWithGoogle() {
    try {
      return await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    } catch (error) {
      console.error('Error al iniciar sesión con Google: ', error);
      throw error; // Re-lanzar el error para manejarlo en el componente
    }
  }

  // Cerrar sesión
  async logout() {
    return this.afAuth.signOut();
  }

  // Obtener el usuario autenticado
  getAuthUser() {
    return this.afAuth.authState;
  }

  // Comprobar si el usuario está autenticado
  isAuthenticated(): Promise<boolean> {
    return new Promise((resolve) => {
      this.afAuth.onAuthStateChanged((user) => {
        resolve(!!user); // Devuelve true si hay un usuario autenticado
      });
    });
  }
}
