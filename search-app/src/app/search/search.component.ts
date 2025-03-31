import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService, SearchResult } from '../search.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  searchQuery: string = '';
  searchResults: SearchResult[] = [];
  isLoading: boolean = false;
  private searchTerms = new Subject<string>();

  constructor(private searchService: SearchService) {
    this.setupSearch();
  }

  private setupSearch() {
    this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),
      
      // ignore new term if same as previous term
      distinctUntilChanged(),
      
      // switch to new search observable each time the term changes
      switchMap((term: string) => {
        this.isLoading = true;
        return this.searchService.search(term);
      })
    ).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching search results:', error);
        this.isLoading = false;
      }
    });
  }

  // Push a search term into the observable stream
  onSearch(): void {
    this.searchTerms.next(this.searchQuery);
  }

  // Clear search results
  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
  }
}
