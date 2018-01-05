import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Rx";
import { Injectable } from "@angular/core";

@Injectable()
export class HttpService {
  constructor(private http: Http) {}

  get(url) {
    let urlBase = "http://localhost:3000/";
    return (
      this.http
        .get(urlBase + "" + url)
        // ...and calling .json() on the response to return data
        .map((res: Response) => res.json().data)
        // ...errors if any
        .catch((error: any) => Observable.throw(error.json().error))
    );
  }

  post(url, data) {
    let body = new URLSearchParams();
    body.set('title', data.title);
    body.set('content', data.content);
    let urlBase = "http://localhost:3000/";
    const headers = new Headers({ "Content-Type": "application/x-www-form-urlencoded" }); // ... Set content type to JSON
    const options = new RequestOptions({ headers: headers }); // Create a request option

    return this.http
      .post(urlBase + "" + url, data) // ...using post request
      .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
      .catch((error: any) => Observable.throw(error.json().error)); // ...errors if any
  }
}