import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../chat.service';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {

  @ViewChild('scrollMe')
  
  private myScrollContainer:ElementRef;

  chats: any;
  joined: boolean = false;
  newUser = {
    nickname: '',
    message: '',
    room: ''
  }
  msgData = {
    room: '',
    nickname: '',
    message: ''
  }
  socket = io('http://localhost:4000');

  constructor(private ChatService: ChatService) {}

  ngOnInit() {
    let user = JSON.parse(localStorage.getItem('user'));
    if(user != null) {
      this.getChatByRoom(user.room);
      this.msgData = {
        room: user.room,
        nickname: user.nickname,
        message: '' 
      }
      this.joined = true;
      this.scrollToBottom();
    }
    this.socket.on('new-message', data => {
      if (data.message.room === JSON.parse(localStorage.getItem('user')).room) {
        this.chats.push(data.message);
        this.msgData = {
          room: user.room,
          nickname: user.nickname,
          message: ''
        }
        this.scrollToBottom();
      }
    })
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom():void {
    this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHright;
  }

  getChatByRoom(room):void {
    this.ChatService.getChatByRoom(room)
      .then(res => this.chats = res,
        err => console.error(err)
      );
  }

  joinRoom() {
    let date = new Date();
    localStorage.setItem('user', JSON.stringify(this.newUser));
    this.getChatByRoom(this.newUser.room);
    this.msgData = {
      room: this.newUser.room,
      nickname: this.newUser.nickname,
      message: ''
    }
    this.joined = true;
    this.socket.emit('save-message', {
      room: this.newUser.room,
      nickname: this.newUser.nickname,
      message: 'Join this room',
      updated_at: date
    });
  }

  sendMessage() {
    this.ChatService.saveChat(this.msgData)
      .then(res => this.socket.emit('save-message', res),
        err => console.error(err)
      )
    this.msgData.message = ''
  }

  logout() {
    let date = new Date;
    let user = JSON.parse(localStorage.getItem('user'));
    this.socket.emit('save-message', {
      room: user.room,
      nickname: user.nickname,
      message: 'Left this room',
      updated_at: date
    });
    localStorage.removeItem('user');
    this.joined = false;
  }
}
