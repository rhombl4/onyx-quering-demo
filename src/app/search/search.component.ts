import { Component, OnInit } from '@angular/core';
import { OnyxService } from '../api/onyx.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Document {
  title: string;
  content: string;
  semantic_identifier: string;
  document_id: string;
  score: number;
}

interface MessageResponse {
  message_id: string;
  message: string;
  answer_piece: string;
  context_docs?: {
    top_documents?: Document[];
  };
  error?: string;
  is_done?: boolean;
  message_type?: string;
  parent_message_id?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  documents?: {
    document_id: string;
    semantic_identifier: string;
    blurb: string;
    score: number;
  }[];
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SearchComponent implements OnInit {
  messages: Message[] = [];
  currentMessage = '';
  isLoading = false;
  error: string | null = null;

  constructor(private onyxService: OnyxService) {}

  ngOnInit(): void {}

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || this.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: this.currentMessage.trim(),
      sender: 'user'
    };

    this.messages.push(userMessage);
    this.isLoading = true;
    this.error = null;

    this.onyxService.sendMessage(userMessage.text).subscribe({
      next: (response: MessageResponse) => {
        this.isLoading = false;
        // Debug log to ensure we're receiving the response
        console.log('DEBUG: Sending message:', userMessage.text);
        console.log('DEBUG: Full response:', response);
        
        // Check if we have a valid response
        if (!response || !response.message_id) {
          console.error('Invalid response received:', response);
          this.error = 'Received invalid response from server';
          return;
        }

        console.log('Message details:', {
          message_id: response.message_id,
          parent_message: response.parent_message_id,
          message: response.message,
          documents: response.context_docs?.top_documents
        });

        // Log first 6 documents with their semantic identifiers and document IDs
        console.log('First 6 top documents:');
        response.context_docs?.top_documents?.slice(0, 6).forEach((doc, index) => {
          console.log(`Document ${index + 1}:`, {
            semantic_identifier: doc.semantic_identifier,
            document_id: doc.document_id
          });
        });

        if (response.message) {
          const botMessage: Message = {
            id: response.message_id || Date.now().toString(),
            text: response.message,
            sender: 'bot',
            documents: response.context_docs?.top_documents?.map(doc => ({
              document_id: doc.document_id,
              semantic_identifier: doc.semantic_identifier,
              blurb: doc.content,
              score: doc.score
            }))
          };
          this.messages.push(botMessage);
        }
        this.currentMessage = '';
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Failed to send message. Please try again.';
        console.error('Error sending message:', err);
      }
    });
  }

  clearChat(): void {
    this.messages = [];
    this.currentMessage = '';
    this.error = null;
  }
}
