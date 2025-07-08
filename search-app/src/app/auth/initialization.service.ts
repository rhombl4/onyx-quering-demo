import { Injectable } from '@angular/core';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class InitializationService {
  // The API token provided by the user
  private readonly API_TOKEN = 'on_l7Y8x4BIb1fQwfqdkRpx_8UL8StKWs1VdEcUokYFul05Ar2TOLic74nXblYBmDor6RMILpvvMtBQK5IZuzLyp13-x_dpQFYDl1Mp1UZq8awlPQ0AgTw7h2eiHEi-mQTVvJSOuCeg-hw6sTrjwzZYftpSu_zjE_yaogfFwF2N6tlP8RYR2Tt-GhQgmKU1Ifr38U8fSY8CazTipH9hlsKGemrYjAX6fP2XWIxR4ZfpCqbJ0pTfV-87qm0GlGkGXKhs';

  constructor(private tokenService: TokenService) {}

  /**
   * Initialize the application with the API token
   * This should be called during app initialization
   */
  async initializeApp(): Promise<void> {
    // Set the token during initialization
    const token = this.API_TOKEN;
    this.tokenService.setToken(token);
    return Promise.resolve();
  }

  /**
   * Get a new token from the server
   * This would typically be used for token refresh
   */
  refreshToken(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      // In a real app, this would make an API call to refresh the token
      // For demo purposes, we'll just simulate a successful refresh
      setTimeout(() => {
        this.tokenService.setToken(this.API_TOKEN);
        resolve(true);
      }, 500);
    });
  }
}
