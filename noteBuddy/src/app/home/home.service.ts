import { Injectable } from "@angular/core";
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Rx";
import { HttpService } from "../app.service";

// Import RxJs required methods
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

@Injectable()
export class HomeService {
  // Resolve HTTP using the constructor
  constructor(private httpService: HttpService) {}
  // private instance variable to hold base url
  summariseNote(data){
      console.log("data",data);
    return this.httpService.post("summariseNote", data);
  }

  askQuestion(data){
    return this.httpService.post("reviseChat", data);
  }
  
}
