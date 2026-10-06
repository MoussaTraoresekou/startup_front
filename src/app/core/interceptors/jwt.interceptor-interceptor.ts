import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Récupération du token JWT stocké au moment du login
  const token = localStorage.getItem('token');

  // 2. Si un token est présent, on clone la requête pour y ajouter le header "Authorization"
  if (token) {
    const cloneReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // On envoie la requête clonée et sécurisée
    return next(cloneReq);
  }

  // 3. Si aucun token n'est trouvé (ex: inscription ou login public), la requête continue telle quelle
  return next(req);
};
