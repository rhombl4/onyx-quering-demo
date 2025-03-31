import { Injectable } from '@angular/core';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class InitializationService {
  // The API token provided by the user
  private readonly API_TOKEN = 'on_wL3D38FKRjiRxg6CtcmlO8hHcvS9cMpetKneTim8mPcpIu8B2HULk8e5JkUdXTkE0ZacHBTQ2pFSN1qSyaajxyzGf3EC-S55JBFtSB8okZwwGnRnsBK0j5W9opgOZYyz6airoZ5bQuxyqzqFip9fQRUFcCe06Bk6lN5p4ZRXBJaLnHPf1PB8maTpEkeBgCxGAVTqwhxS_bBHKzyOtkIivVBHNadfm6_XDtwVfyrrwHDKaPiA-DYSvBMFHBtw5OXC';

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
