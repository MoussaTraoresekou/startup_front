import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarLayout } from '../navbar-layout/navbar-layout';
import { SidebarLayout } from '../sidbar-layout/sidbar-layout';

@Component({
  selector: 'app-main-layout',
    imports: [RouterOutlet, SidebarLayout, NavbarLayout],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {}
