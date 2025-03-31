import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnyxService, MessageResponse } from '../api/onyx.service';
import { TokenService } from '../auth/token.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  // User message input
  userMessage: string = '';
  
  // Chat session info
  sessionId: string | null = null;
  hasSession: boolean = false;
  
  // API responses
  apiResponse: string = '';
  isLoading: boolean = false;
  
  // Curl command for demonstration
  curlCommand: string = '';
  showCurl: boolean = false;

  constructor(
    private onyxService: OnyxService,
    private tokenService: TokenService
  ) { }

  ngOnInit(): void {
    // Check if we already have a session
    this.checkSession();
    
    // Generate curl command for demonstration
    this.curlCommand = this.onyxService.getCurlForCreateSession();
  }

  /**
   * Check if a session exists in cookies
   */
  checkSession(): void {
    this.hasSession = this.onyxService.hasChatSession();
    this.sessionId = this.onyxService.getChatSessionId();
  }

  /**
   * Create a new chat session
   */
  createSession(): void {
    this.isLoading = true;
    this.apiResponse = 'Creating session...';
    
    this.onyxService.createChatSession().subscribe({
      next: (sessionId) => {
        if (sessionId) {
          this.sessionId = sessionId;
          this.hasSession = true;
          this.apiResponse = `Session created successfully! Session ID: ${this.maskSessionId(sessionId)}`;
        } else {
          this.apiResponse = 'Failed to create session. Check console for errors.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating session:', error);
        this.apiResponse = 'Error creating session. Check console for details.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Remove the current chat session
   */
  removeSession(): void {
    this.onyxService.removeChatSession();
    this.sessionId = null;
    this.hasSession = false;
    this.apiResponse = 'Session removed from cookies.';
  }

  /**
   * Send a message to the chat API
   */
  sendMessage(): void {
    if (!this.userMessage.trim()) {
      return;
    }
    
    this.isLoading = true;
    this.apiResponse = 'Sending message...';
    
    this.onyxService.sendMessage(this.userMessage).subscribe({
      next: (response: MessageResponse) => {
        this.apiResponse = response.answer;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.apiResponse = 'Error sending message. Check console for details.';
        this.isLoading = false;
      }
    });
    
    // Clear the input after sending
    this.userMessage = '';
  }

  /**
   * Toggle showing the curl command
   */
  toggleCurl(): void {
    this.showCurl = !this.showCurl;
  }

  /**
   * Mask the session ID for display (security)
   */
  public maskSessionId(sessionId: string): string {
    if (sessionId.length > 10) {
      return `${sessionId.substring(0, 5)}...${sessionId.substring(sessionId.length - 5)}`;
    }
    return '***********';
  }
}
