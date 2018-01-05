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
  noteHead: string = "";
  constructor(private speechRecognitionService: SpeechRecognitionService) {

  }

  ngOnInit() {
    this.getAllUpdatedNotes();

    var instructions = document.getElementById("recording-instructions");
    this.speechRecognitionService.fireStart.subscribe((response) => {
      instructions.innerHTML = 'Voice recognition activated. Try speaking into the microphone.';
    });

    this.speechRecognitionService.fireEnd.subscribe((response) => {
      instructions.innerHTML = 'You were quiet for a while so voice recognition turned itself off.';
    });

    this.speechRecognitionService.fireError.subscribe((response) => {
      instructions.innerHTML = 'No speech was detected. Try again.';
    });


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
    document.getElementById("recording-instructions").innerHTML = 'Voice recognition paused.';
  }

  saveNote(){
    this.speechRecognitionService.speechRecognition.stop();
    if(!this.speechData.length) {
      this.instructions ='Empty Note!! Please add content to your note.';
    }
    else {
      this.saveToLocalStorage(new Date().toLocaleString(), this.speechData);
      // Reset variables and update UI.
      this.speechData = '';
      this.instructions = 'Note saved successfully.';
      this.getAllUpdatedNotes();
    }
  }

  saveToLocalStorage(dateTime, content) {
    localStorage.setItem('note-' + this.noteHead + '-' + dateTime, content);
    this.noteHead = '';
  }

  getAllNotes() {
    var notes = [];
    var key;
    for (var i = 0; i < localStorage.length; i++) {
      key = localStorage.key(i);
  
      if(key.substring(0,5) == 'note-') {
        notes.push({
          heading : key.split('-')[1],
          date: key.split('-')[2],
          content: localStorage.getItem(localStorage.key(i))
        });
      } 
    }
    return notes;
  }

  renderNotes(notes) {
    this.notesList = notes;
    console.log("notes",this.notesList);
  }

  getAllUpdatedNotes(){
    var notes = this.getAllNotes();
    this.renderNotes(notes);
  }

  readNotes(index) {
    if(document.getElementById('read-label-'+index).innerHTML == 'Read') {
      document.getElementById('read-label-'+index).innerHTML = 'Hide';
      document.getElementById('notes-'+index).style.display = 'block';
    } else {
      document.getElementById('read-label-'+index).innerHTML = 'Read';
      document.getElementById('notes-'+index).style.display = 'none';
    }
  }

  readOut(message) {
    var speech = new SpeechSynthesisUtterance();

    // Speech setups
    speech.text = message;
    speech.volume = 1;
    speech.rate = 0.85;
    speech.pitch = 1;
    
    window.speechSynthesis.speak(speech);
  }

  deleteNote(timestamp){
    localStorage.removeItem('note-'+timestamp);
    this.getAllUpdatedNotes();
  }

  downloadFile(index, content) {
    window.open("data:application/txt," + encodeURIComponent(content), "_self");
  }

}
