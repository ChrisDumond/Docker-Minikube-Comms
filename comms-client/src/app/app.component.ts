import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  helloWorldFromApi;
  
  constructor(private http: HttpClient){
    http.get("/api").subscribe(
      (res:string) => this.helloWorldFromApi = res,
      (err) => console.log(err)
    );
   }
  title = 'comms-client';
}
