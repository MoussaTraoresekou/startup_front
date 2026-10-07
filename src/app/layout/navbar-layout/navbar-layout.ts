import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-navbar-layout',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,  
    MatMenuModule,    
    MatDividerModule, 
    MatIconModule     
  ],
  templateUrl: './navbar-layout.html',
  styleUrls: ['./navbar-layout.css']
})
export class NavbarLayout {
   authService = inject(AuthService);
  private router = inject(Router);
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
