import { Injectable, NgZone, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as _ from "lodash";

interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

@Injectable()
export class SpeechRecognitionService {
    speechRecognition: any;
    data:any = "";
    lineNumber:any = 1;
    webkitSpeechRecognition : IWindow = <IWindow>window;
    fireStart: EventEmitter<any> = new EventEmitter();
    fireEnd: EventEmitter<any> = new EventEmitter();
    fireError: EventEmitter<any> = new EventEmitter();

    constructor(private zone: NgZone) {
    }

    record(): Observable<string> {

        return Observable.create(observer => {
            const { webkitSpeechRecognition }: IWindow = <IWindow>window;
            this.speechRecognition = new webkitSpeechRecognition();
            this.speechRecognition.continuous = true;
            //this.speechRecognition.interimResults = true;
            this.speechRecognition.lang = 'en-us';
            this.speechRecognition.maxAlternatives = 1;

            this.speechRecognition.onresult = speech => {
                let term: string = "";
                if (speech.results) {
                    var result = speech.results[speech.resultIndex];
                    var transcript = result[0].transcript;
                    if (result.isFinal) {
                        if (result[0].confidence < 0.3) {
                            console.log("Unrecognized result - Please try again");
                        }
                        else {
                            term = _.trim(transcript);
                            // console.log("Did you said? -> " + term + " , If not then say something else...");
                            // this.data += this.lineNumber + ": " + term + '.' + '\n';
                            // this.lineNumber++;
                            // console.log(this.data);
                        }
                    }
                }
                this.zone.run(() => {
                    observer.next(term);
                });
            };

            this.speechRecognition.onerror = error => {
                observer.error(error);
                if(error.error == 'no-speech') {
                    this.fireError.emit({});
                };
            };

            this.speechRecognition.onend = () => {
                console.log("ended");
                this.fireEnd.emit({});
                observer.complete();
            };

            this.speechRecognition.start();
            this.fireStart.emit({});
            console.log("Say something - We are listening !!!");
        });
    }

    DestroySpeechObject() {
        if (this.speechRecognition)
            this.speechRecognition.stop();
    }

}