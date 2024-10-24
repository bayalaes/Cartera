import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseError } from 'firebase/app';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  loading: boolean = false;
  errorMessage: string = ''; // Para mensajes de error

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {}

  get formControls() {
    return this.registerForm.controls;
  }

  async register() {
    if (this.registerForm.invalid) {
      return; // Detener si el formulario no es válido
    }

    const { email, password, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    this.errorMessage = ''; // Limpiar mensajes de error

    try {
      // Intentar registrar el usuario
      await this.authService.register(email, password);
      
      // Redirigir al login tras un registro exitoso
      this.router.navigate(['/login']);
    } catch (error: any) {
      if (error instanceof FirebaseError) {
        // Mostrar mensaje si el correo ya está en uso
        if (error.code === 'auth/email-already-in-use') {
          this.errorMessage = 'El correo ya está registrado. Por favor, use otro.';
        } else {
          this.errorMessage = 'Error al registrarse. Inténtelo de nuevo.';
        }
      }
    } finally {
      this.loading = false;
    }
  }
}
