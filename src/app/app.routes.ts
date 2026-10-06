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
    path: 'porteur',
    canActivate: [authGuard, roleGuard],
    data: { role: 'PORTEUR' },
    children: [
      {
        path: 'mes-projets',
        loadComponent: () => import('./pages/mes-projets/mes-projets').then((m) => m.MesProjets),
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
            loadComponent: () => import('./pages/parcours/parcours').then((m) => m.Parcours),
          },
          {
            path: 'equipe',
            loadComponent: () => import('./pages/equipe/equipe').then((m) => m.Equipe),
          },
          {
            path: 'mentor',
            loadComponent: () => import('./pages/mentor/mentor').then((m) => m.Mentor),
          },
          {
            path: 'financement',
            loadComponent: () => import('./pages/financement/financement').then((m) => m.Financement),
          },
          {
            path: 'taches',
            loadComponent: () => import('./pages/taches/taches').then((m) => m.Taches),
          },
          {
            path: 'discussion',
            loadComponent: () => import('./pages/discussion/discussion').then((m) => m.Discussion),
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
            loadComponent: () => import('./pages/profil/profil').then((m) => m.Profil),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
