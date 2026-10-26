
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConversationModel } from '../../model/ConversationModel';
import { MessageModel } from '../../model/message';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/conversations';

  /**
   * Récupère les conversations de l'utilisateur connecté.
   * Le backend détermine l'utilisateur à partir du JWT.
   */
  mesConversations(): Observable<ConversationModel[]> {
    return this.http.get<ConversationModel[]>(
      `${this.baseUrl}/mes-conversations`
    );
  }

  /**
   * Charge l'historique d'une conversation.
   */
  historique(conversationId: number): Observable<MessageModel[]> {
    return this.http.get<MessageModel[]>(
      `${this.baseUrl}/${conversationId}/messages`
    );
  }
}
