// pages/login/login.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    this.authService.isAuthenticated().then(isAuth => {
      if (isAuth) {
        this.router.navigate(['/clientes-list']); // Redirige si ya está autenticado
      }
    }).catch(error => {
      console.error('Error al verificar autenticación:', error);
    });
  }

  // Agrega este getter para acceder a los controles del formulario
  get formControls() {
    return this.loginForm.controls;
  }

  async login() {
    if (this.loginForm.invalid) {
      return; // Detener si el formulario no es válido
    }

    this.loading = true;
    this.errorMessage = ''; // Limpiar mensajes de error

    const { email, password } = this.loginForm.value;

    try {
      await this.authService.login(email, password);
      this.router.navigate(['/clientes-list']); // Cambia esto a la ruta de tu página principal
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        this.errorMessage = 'Contraseña incorrecta. Por favor, intente nuevamente.';
      } else if (error.code === 'auth/user-not-found') {
        this.errorMessage = 'No se encontró un usuario con este correo.';
      } else {
        this.errorMessage = 'Error al iniciar sesión. Verifique sus credenciales.';
      }
      console.error('Login error:', error);
    } finally {
      this.loading = false; // Finaliza la carga
    }
  }
}
