import { Component, OnInit, OnDestroy } from '@angular/core';
import { SpeechRecognitionService } from '../speech-recognition.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [SpeechRecognitionService]
})
export class HomeComponent implements OnInit, OnDestroy {
  showSearchButton: boolean;
  speechData: any = '';
  instructions: any = '';
  notesList: any;
  constructor(private speechRecognitionService: SpeechRecognitionService) {

  }

  ngOnInit() {
    var notes = this.getAllNotes();
    this.renderNotes(notes);
  }

  ngOnDestroy() {
      this.speechRecognitionService.DestroySpeechObject();
  }

  onRecognise(){
    this.speechRecognitionService.record()
          .subscribe(
          //listener
          (value) => {
              this.speechData += value.charAt(0).toUpperCase() + value.slice(1) + '. ';
              console.log(this.speechData);
          },
          //errror
          (err) => {
              console.log(err);
              if (err.error == "no-speech") {
                  console.log("--restatring service--");
                  this.onRecognise();
              }
          },
          //completion
          () => {
              console.log("--complete--");
          });
  }

  onPause(){
    this.speechRecognitionService.speechRecognition.stop();
  }

  saveNote(){
    this.speechRecognitionService.speechRecognition.stop();
    if(!this.speechData.length) {
      this.instructions ='Empty Note!! Please add content to your note.';
    }
    else {
      // Save note to localStorage.
      // The key is the dateTime with seconds, the value is the content of the note.
      this.saveToLocalStorage(new Date().toLocaleString(), this.speechData);
  
      // Reset variables and update UI.
      this.speechData = '';
      //renderNotes(getAllNotes());
      this.instructions = 'Note saved successfully.';
    }
  }

  saveToLocalStorage(dateTime, content) {
    localStorage.setItem('note-' + dateTime, content);
  }

  getAllNotes() {
    var notes = [];
    var key;
    for (var i = 0; i < localStorage.length; i++) {
      key = localStorage.key(i);
  
      if(key.substring(0,5) == 'note-') {
        notes.push({
          date: key.replace('note-',''),
          content: localStorage.getItem(localStorage.key(i))
        });
      } 
    }
    return notes;
  }

  renderNotes(notes) {
    // var html = '';
    // if(notes.length) {
    //   console.log("hi",notes);
    //   notes.forEach(function(note) {
    //     html+= `<li class="note">
    //       <p class="header">
    //         <span class="date">${note.date}</span>
    //         <a href="#" class="listen-note" title="Listen to Note">Listen to Note</a>
    //         <a href="#" class="delete-note" title="Delete">Delete</a>
    //       </p>
    //       <p class="content">${note.content}</p>
    //     </li>`;    
    //   });
    // }
    // else {
    //   console.log("ho");
    //   html = '<li><p class="content">You don\'t have any notes yet.</p></li>';
    // }
    // this.notesList.html(html);
    this.notesList = notes;
  }

}
