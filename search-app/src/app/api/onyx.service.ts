import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { TokenService } from '../auth/token.service';
import { environment } from '../../environments/environment';

interface ChatSessionResponse {
  chat_session_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class OnyxService {
  private readonly API_URL = environment.apiUrl;
  private readonly SESSION_COOKIE_KEY = 'chat_session_id';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private tokenService: TokenService
  ) {}

  /**
   * Create a new chat session and store the session ID in cookies
   */
  createChatSession(): Observable<string> {
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No API token available');
      return of('');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<ChatSessionResponse>(
      `${this.API_URL}/chat/create-chat-session`,
      { persona_id: 0 },
      { headers }
    ).pipe(
      map(response => {
        const sessionId = response.chat_session_id;
        // Store session ID in cookies with 24 hour expiry
        this.cookieService.set(this.SESSION_COOKIE_KEY, sessionId, 1);
        return sessionId;
      }),
      catchError(error => {
        console.error('Error creating chat session:', error);
        return of('');
      })
    );
  }

  /**
   * Get the current chat session ID from cookies
   */
  getCurrentSessionId(): string {
    return this.cookieService.get(this.SESSION_COOKIE_KEY) || '';
  }

  /**
   * Remove the chat session ID from cookies
   */
  removeSessionId(): void {
    this.cookieService.delete(this.SESSION_COOKIE_KEY);
  }

  /**
   * Check if a chat session exists
   */
  hasActiveSession(): boolean {
    return this.cookieService.check(this.SESSION_COOKIE_KEY);
  }
}
