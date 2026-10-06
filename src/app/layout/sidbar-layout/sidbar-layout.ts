import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidbar-layout',
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidbar-layout.html',
  styleUrl: './sidbar-layout.css',
})
export class SidbarLayout {}
