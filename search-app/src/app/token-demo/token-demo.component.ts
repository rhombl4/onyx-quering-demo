import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenService } from '../auth/token.service';
import { InitializationService } from '../auth/initialization.service';

@Component({
  selector: 'app-token-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './token-demo.component.html',
  styleUrls: ['./token-demo.component.scss']
})
export class TokenDemoComponent implements OnInit {
  // Store token status
  tokenExists: boolean = false;
  // Show only a masked version of the token for security
  maskedToken: string = '';
  
  constructor(
    private tokenService: TokenService,
    private initService: InitializationService
  ) {}

  ngOnInit(): void {
    this.checkTokenStatus();
  }

  /**
   * Check if token exists and create a masked version for display
   */
  checkTokenStatus(): void {
    const token = this.tokenService.getToken();
    this.tokenExists = !!token;
    
    if (token) {
      // Create a masked version of the token for display
      // Only show first 10 and last 5 characters
      if (token.length > 15) {
        this.maskedToken = `${token.substring(0, 10)}...${token.substring(token.length - 5)}`;
      } else {
        this.maskedToken = '***********';
      }
    } else {
      this.maskedToken = '';
    }
  }

  /**
   * Simulate removing the token
   */
  removeToken(): void {
    this.tokenService.removeToken();
    this.checkTokenStatus();
  }

  /**
   * Simulate refreshing the token
   */
  refreshToken(): void {
    this.initService.refreshToken().then(() => {
      this.checkTokenStatus();
    });
  }
}
