import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpModule } from "@angular/http";
import { HomeComponent } from './home/home.component';
import { SpeechRecognitionService } from './speech-recognition.service';
import {HttpService} from './app.service';
import {HomeService} from './home/home.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [SpeechRecognitionService,HttpService,HomeService],
  bootstrap: [AppComponent]
})

export class AppModule { }
