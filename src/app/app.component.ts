import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { ChatSessionComponent } from './chat-session/chat-session.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SearchComponent, ChatSessionComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'search-app';
}
