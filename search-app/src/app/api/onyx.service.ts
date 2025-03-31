import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { TokenService } from '../auth/token.service';
import { CookieService } from 'ngx-cookie-service';

export interface ChatSession {
  chat_session_id: string;
}

export interface MessageResponse {
  answer: string;
  sources?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class OnyxService {
  // API configuration
  private readonly ONYX_API_URL = 'https://sonix.agibot.click/';
  private readonly SESSION_COOKIE_NAME = 'onyx_chat_session_id';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private cookieService: CookieService
  ) { }

  /**
   * Create a new chat session and store the session ID in a cookie
   * @returns Observable of the chat session ID
   */
  createChatSession(): Observable<string> {
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No API token available');
      return of('');
    }

    const headers = this.getAuthHeaders(token);

    return this.http.post<ChatSession>(`${this.ONYX_API_URL}/chat/create-chat-session`, {}, { headers })
      .pipe(
        map(response => response.chat_session_id),
        tap(sessionId => {
          // Store the session ID in a cookie
          this.cookieService.set(this.SESSION_COOKIE_NAME, sessionId, {
            path: '/',
            secure: true,
            sameSite: 'Strict'
          });
          console.log('Chat session created and stored in cookie:', sessionId);
        }),
        catchError(error => {
          console.error('Error creating chat session:', error);
          return of('');
        })
      );
  }

  /**
   * Send a message to the chat API
   * @param message The message to send
   * @returns Observable of the response
   */
  sendMessage(message: string): Observable<MessageResponse> {
    const token = this.tokenService.getToken();
    const sessionId = this.getChatSessionId();
    
    if (!token || !sessionId) {
      console.error('Missing token or session ID');
      return of({ answer: 'Error: Missing authentication or session information.' });
    }

    const headers = this.getAuthHeaders(token);
    const payload = {
      chat_session_id: sessionId,
      message: message
    };

    return this.http.post<MessageResponse>(
      `${this.ONYX_API_URL}/chat/send-message-simple-api/`,
      payload,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error sending message:', error);
        return of({ answer: 'Sorry, there was an error processing your request.' });
      })
    );
  }

  /**
   * Get the current chat session ID from cookie
   * @returns The chat session ID or null if not found
   */
  getChatSessionId(): string | null {
    if (this.cookieService.check(this.SESSION_COOKIE_NAME)) {
      return this.cookieService.get(this.SESSION_COOKIE_NAME);
    }
    return null;
  }

  /**
   * Check if a chat session exists in cookies
   * @returns True if a session exists
   */
  hasChatSession(): boolean {
    return this.cookieService.check(this.SESSION_COOKIE_NAME);
  }

  /**
   * Remove the chat session ID from cookies
   * This effectively ends the current session
   */
  removeChatSession(): void {
    if (this.cookieService.check(this.SESSION_COOKIE_NAME)) {
      this.cookieService.delete(this.SESSION_COOKIE_NAME, '/');
      console.log('Chat session removed from cookies');
    }
  }

  /**
   * Create authentication headers with the token
   * @param token API token
   * @returns HttpHeaders object
   */
  private getAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Generate a curl command for creating a chat session
   * This is useful for debugging or manual API testing
   * @returns The curl command string
   */
  getCurlForCreateSession(): string {
    const token = this.tokenService.getToken();
    if (!token) {
      return 'No API token available';
    }
    
    return `curl -X POST "${this.ONYX_API_URL}/chat/create-chat-session" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{}'`;
  }
}
