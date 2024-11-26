import { Component, Renderer2 } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatIconModule, HttpClientModule, FormsModule, NgClass, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  @ViewChild('chatBody') chatBody!: ElementRef;

  isChatbotVisible = false;
  messages: { sender: string; text: string }[] = [];
  userInput = '';
  backendUrl = 'http://192.168.18.42:5134/api/chatbot'; 
  hasDisplayedWelcomeMessage = false;

  constructor(private renderer: Renderer2, private http: HttpClient) {}

  openChat() {
    this.applyAnimation('show');
    setTimeout(() => {
      this.isChatbotVisible = true;

      if (!this.hasDisplayedWelcomeMessage) {
        this.addBotMessage(
          "Como posso ajudar você? Escolha uma das opções abaixo e digite o número correspondente:<br>" +
            "1 - Ver horários de funcionamento<br>" +
            "2 - Como agendar uma consulta<br>" +
            "3 - Endereço da clínica<br>" +
            "4 - Convênios aceitos<br>" +
            "5 - Exames disponíveis<br>" +
            "6 - Informações sobre tratamentos e especialidades<br>" +
            "7 - Quero falar com atendente real<br>" +
            "<br>" +
            "Digite o número correspondente ou 'menu' para voltar ao início."
        );
        this.hasDisplayedWelcomeMessage = true;
      }
    }, 300);
  }

  closeChat() {
    this.applyAnimation('hide');
    setTimeout(() => {
      this.isChatbotVisible = false;
    }, 300);
  }

  private applyAnimation(action: 'show' | 'hide') {
    const chatbotWindow = document.getElementById('chatbotWindow');
    if (chatbotWindow) {
      if (action === 'show') {
        this.renderer.setStyle(chatbotWindow, 'opacity', '1');
        this.renderer.setStyle(chatbotWindow, 'transform', 'scale(1)');
      } else {
        this.renderer.setStyle(chatbotWindow, 'opacity', '0');
        this.renderer.setStyle(chatbotWindow, 'transform', 'scale(0.8)');
      }
    }
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    this.addUserMessage(this.userInput);

    this.http
      .post<{ sender: string; message: string }>(this.backendUrl, {
        sender: 'User',
        message: this.userInput
      })
      .subscribe(
        (response) => {
          this.addBotMessage(response.message);
          this.userInput = ''; 
        },
        (error) => {
          this.addBotMessage(
            "Desculpe, houve um erro ao processar sua mensagem. Tente novamente mais tarde."
          );
        }
      );
  }

  private addUserMessage(message: string) {
    this.messages.push({ sender: 'User', text: message });
    this.scrollToBottom();
  }

  private addBotMessage(message: string) {
    this.messages.push({ sender: 'Bot', text: message });
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
