import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidbarLayout } from '../sidbar-layout/sidbar-layout';
import { NavbarLayout } from '../navbar-layout/navbar-layout';

@Component({
  selector: 'app-main-layout',
    imports: [RouterOutlet, SidbarLayout, NavbarLayout],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {}
