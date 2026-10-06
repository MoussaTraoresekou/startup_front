import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../core/services/auth-service';
import { LoginRequest } from '../../core/model/LoginRequest';
import { NotificationService } from '../../core/services/notification-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css' 
})
export class LoginComponent {
  message=inject(NotificationService)
  loginForm: FormGroup;
  hidePassword = true;
  router = inject(Router);

  private AuntService=inject(AuthService)

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
        this.AuntService.login(this.loginForm.value as LoginRequest).subscribe(
          {
             next: (response) => {
                  console.log(response)
                  this.router.navigate(["/porteur/mes-projets",]);  
        },
        error: (error) => {
          this.message.erreur("mot de passe ou email incorrect")
          console.log(error);
        },
          }

        )
    }
  }
}