
import { Component, OnInit } from '@angular/core';
import { Router} from '@angular/router';
import * as fs from 'fs';
import * as path from 'path';

import { desktopCapturer, screen, ipcRenderer, crashReporter} from 'electron'
const mergeImg = window.require('merge-img');
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})


export class HomeComponent implements OnInit { 
  windowDetails: any = [];
      
  constructor(private router: Router) {
 
  }

  
  ngOnInit() {   
  
  }
 
 
  
   recordScreen() {	 
    this.windowDetails = ipcRenderer.sendSync('get-screen');

    let screenSize = this.windowDetails;
    let options = {
      types: ['screen'],
      thumbnailSize: screenSize
    }

    var screen_array: any = [];
    desktopCapturer.getSources(options).then( async sources => {
     
      for (let i = 0; i < sources.length; ++i) {
       
        screen_array.push(sources[i].thumbnail.toPNG())
      }

      mergeImg(screen_array)
      .then((img) => {
        img.getBase64('image/jpeg', (err, imageBase64) => {
          var imageBuffer = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
          fs.writeFile(path.join('./screenimage.jpg'), imageBuffer,'base64', function(err) {
            if (err){     
            console.log(err)
            }
          });
        });

      });
    });
   
  } 
}
