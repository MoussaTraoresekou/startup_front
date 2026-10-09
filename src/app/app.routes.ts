import { Routes } from '@angular/router';
import { authGuard } from './core/guard/auth-ghard-guard';
import { roleGuard } from './core/guard/role-ghard-guard';
import { MainLayout } from './layout/main-layout/main-layout';
import { AccueilGlobal } from './shared/acceil-global/acceil-global';

export const routes: Routes = [
  {
    path: '',
    component: AccueilGlobal,
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./pages/login-component/login-component').then((m) => m.LoginComponent),
  },
   {
    path: 'auth/mentor_register',
    loadComponent: () =>
      import('./pages/mentors/mentor-register/mentor-register').then((m) => m.MentorRegister),
  },
  {
    path: 'porteur',
    canActivate: [authGuard, roleGuard],
    data: { role: 'PORTEUR' },
    children: [
      {
        path: 'mes-projets',
        loadComponent: () => import('./pages/porteur/mes-projets/mes-projets').then((m) => m.MesProjets),
      },
      {
        path: 'projets/:id',
        component: MainLayout,
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
          },
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
          },
          {
            path: 'parcours',
            loadComponent: () => import('./pages/porteur/parcours/parcours').then((m) => m.Parcours),
          },
          {
            path: 'equipe',
            loadComponent: () => import('./pages/porteur/equipe/equipe').then((m) => m.Equipe),
          },
          
          {
            path: 'financement',
            loadComponent: () => import('./pages/financement/financement').then((m) => m.Financement),
          },
          {
            path: 'taches',
            loadComponent: () => import('./pages/porteur/taches/taches').then((m) => m.Taches),
          },
          {
            path: 'discussion',
            loadComponent: () => import('./pages/porteur/discussion/discussion').then((m) => m.Discussion),
          },
          {
            path: 'actualites',
            loadComponent: () => import('./pages/actualites/actualites').then((m) => m.Actualites),
          },
          {
            path: 'formations',
            loadComponent: () => import('./pages/formations/formations').then((m) => m.Formations),
          },
          {
            path: 'profil',
            loadComponent: () => import('./pages/porteur/profil/profil').then((m) => m.Profil),
          },
        ],
      },
    ],
  },
  {
    path: 'admin',
    component: MainLayout,
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'projets',
        loadComponent: () => import('./pages/actualites/actualites').then((m) => m.Actualites),
      },
      {
        path: 'utilisateurs',
        loadComponent: () => import('./pages/actualites/actualites').then((m) => m.Actualites),
      },
      {
        path: 'mentors',
        loadComponent: () => import('./pages/admin/mentors/mentor').then((m) => m.Mentor),
      },
      {
        path: 'evenements',
        loadComponent: () => import('./pages/actualites/actualites').then((m) => m.Actualites),
      },
      {
        path: 'formations',
        loadComponent: () => import('./pages/actualites/actualites').then((m) => m.Actualites),
      },
      {
        path: 'financements',
        loadComponent: () => import('./pages/actualites/actualites').then((m) => m.Actualites),
      },
      {
        path: 'actualites',
        loadComponent: () => import('./pages/actualites/actualites').then((m) => m.Actualites),
      },
      {
        path: 'profil',
        loadComponent: () => import('./pages/porteur/profil/profil').then((m) => m.Profil),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
