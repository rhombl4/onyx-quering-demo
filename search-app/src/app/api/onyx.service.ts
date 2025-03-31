import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, map, catchError, of } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { TokenService } from '../auth/token.service';
import { environment } from '../../environments/environment';

interface ChatSessionResponse {
  chat_session_id: string;
}

interface MessageResponse {
  message_id: string;
  answer_piece: string;
  message: string;
  top_documents?: {
    title: string;
    content: string;
    score: number;
  }[];
  error?: string;
  is_done?: boolean;
  message_type?: string;
  parent_message_id?: string;
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

  private async* handleStream(response: Response): AsyncGenerator<MessageResponse, void, unknown> {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const rawChunk = await reader?.read();
      if (!rawChunk) {
        throw new Error('Unable to process chunk');
      }
      const { done, value } = rawChunk;
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;

        try {
          const data = JSON.parse(line) as MessageResponse;
          yield data;
        } catch (error) {
          console.error('Error parsing SSE data:', error);
          
          // Try to extract valid JSON objects from the line
          const jsonObjects = line.match(/\{[^{}]*\}/g);
          if (jsonObjects) {
            for (const jsonObj of jsonObjects) {
              try {
                const data = JSON.parse(jsonObj) as MessageResponse;
                yield data;
              } catch (innerError) {
                console.error('Error parsing extracted JSON:', innerError);
              }
            }
          }
        }
      }
    }

    // Process any remaining data in the buffer
    if (buffer.trim() !== '') {
      try {
        const data = JSON.parse(buffer) as MessageResponse;
        yield data;
      } catch (error) {
        console.error('Error parsing remaining buffer:', error);
      }
    }
  }

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
   * Send a message in the current chat session
   */
  sendMessage(message: string, parentMessageId?: string | null): Observable<MessageResponse> {
    const token = this.tokenService.getToken();
    const sessionId = this.cookieService.get(this.SESSION_COOKIE_KEY);

    if (!token || !sessionId) {
      console.error('Missing token or session ID');
      return of({} as MessageResponse);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const data = {
      message,
      chat_session_id: sessionId,
      parent_message_id: parentMessageId ?? null,
      file_descriptors: [],
      prompt_id: 0,
      search_doc_ids: null,
      retrieval_options: {
        run_search: "always",
        real_time: true,
        enable_auto_detect_filters: false,
        filters: {}
      }
    };

    return from(
      fetch(`${this.API_URL}/chat/send-message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(async response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        // Log headers in a type-safe way
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        console.log('DEBUG: Response headers:', headers);
        
        const messageGenerator = this.handleStream(response);
        let lastMessage: MessageResponse | undefined;

        for await (const message of messageGenerator) {
          console.log('DEBUG: Received message chunk:', message);
          lastMessage = message;
        }

        if (!lastMessage) {
          throw new Error('No message received from stream');
        }

        return lastMessage;
      })
    ).pipe(
      catchError(error => {
        console.error('Error in stream processing:', error);
        throw error;
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
   * Check if a chat session exists
   */
  hasActiveSession(): boolean {
    return !!this.getCurrentSessionId();
  }

  /**
   * Remove the chat session ID from cookies
   */
  removeSession(): void {
    this.cookieService.delete(this.SESSION_COOKIE_KEY);
  }
}
