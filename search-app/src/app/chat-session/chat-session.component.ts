import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnyxService } from '../api/onyx.service';

@Component({
  selector: 'app-chat-session',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-session.component.html',
  styleUrls: ['./chat-session.component.scss']
})
export class ChatSessionComponent implements OnInit {
  sessionId: string = '';
  isLoading: boolean = false;

  constructor(private onyxService: OnyxService) {}

  ngOnInit(): void {
    this.checkExistingSession();
  }

  /**
   * Check if there's an existing session in cookies
   */
  private checkExistingSession(): void {
    if (this.onyxService.hasActiveSession()) {
      this.sessionId = this.onyxService.getCurrentSessionId();
    }
  }

  /**
   * Create a new chat session
   */
  createSession(): void {
    this.isLoading = true;
    this.onyxService.createChatSession().subscribe({
      next: (sessionId) => {
        this.sessionId = sessionId;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Remove the current session
   */
  removeSession(): void {
    this.onyxService.removeSession();
    this.sessionId = '';
  }
}
