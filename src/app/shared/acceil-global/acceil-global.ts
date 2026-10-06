import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './acceil-global.html',
  styleUrl: './acceil-global.css'
})
export class AccueilGlobal {
  // Profils cibles de la plateforme
  userProfiles = [
    {
      title: 'Porteur de Projet',
      icon: 'rocket_launch',
      description: 'Structurez votre idée, validez vos étapes clés et générez vos documents officiels (Business Plan, Fiche de formalisation).',
      actionText: 'Démarrer mon projet',
      link: '/auth/register'
    },
    {
      title: 'Mentor & Expert',
      icon: 'psychology',
      description: 'Accompagnez des entrepreneurs prometteurs, partagez votre expertise et suivez leur progression en temps réel.',
      actionText: 'Devenir Mentor',
      link: '/auth/register'
    },
    {
      title: 'Investisseur & Partenaire',
      icon: 'account_balance',
      description: 'Découvrez des projets à fort potentiel, qualifiés et structurés, prêts pour un financement.',
      actionText: 'Explorer les projets',
      link: '/auth/register'
    }
  ];

  // Parcours d'accompagnement en 4 étapes
  workflowSteps = [
    { number: '1', title: 'Idéation', desc: 'Définissez votre vision et vos objectifs initiaux' },
    { number: '2', title: 'Business Plan', desc: 'Modélisez votre marché et vos projections financières' },
    { number: '3', title: 'Formalisation', desc: 'Régularisez votre structure administrative et juridique' },
    { number: '4', title: 'Lancement', desc: 'Accédez aux financements et lancez votre activité' }
  ];
}