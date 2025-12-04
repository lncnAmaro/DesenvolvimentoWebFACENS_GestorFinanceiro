import { Component, OnInit, inject } from '@angular/core';
import { GestorServiceService, Transacao } from '../Services/gestor-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transacoes',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './transacoes.component.html',
  styleUrl: './transacoes.component.css'
})
export class TransacoesComponent {
  private api = inject(GestorServiceService);

  transacoes: Transacao[] = [];
  carregando = false;
  salvando = false;
  erro = '';

  // Bindings do Form
  tipo: 'entrada' | 'saida' = 'entrada';
  categoria = '';
  valor: number | null = null;
  data: Date | null = null;

  ngOnInit() { this.carregar(); }

  // Carrega as informações através da API
  carregar() {
    this.carregando = true;
    this.api.listar().subscribe({
      next: xs => {
        this.transacoes = xs;
        this.calcularSaldo();
        this.carregando = false; },
      error: e => {
        this.erro = e.message ?? 'Falha ao carregar';
        this.carregando = false;
       }
    });
  }

  // Cria uma nova transação e envia para o BD
  criar() {
    if (!this.tipo || !this.categoria || this.valor == null || !this.data) return;

    const novaTransacao: Transacao = {
      tipo: this.tipo,
      categoria: this.categoria,
      valor: this.valor,
      data: this.data,
    };

    this.salvando = true;
    this.api.criar(novaTransacao).subscribe({
      next: _ => {
        this.tipo = 'entrada';
        this.categoria = '';
        this.valor = null;
        this.data = null;

        this.salvando = false;
        this.calcularSaldo();
        this.carregar();
      },
      error: e => {
        this.erro = e.message ?? 'Falha ao criar';
        this.salvando = false;
      }
    });
  }

  // Apaga o dado do BD
  excluir(id?: string) {
    if (!id) return;
    this.api.excluir(id).subscribe({
      next: _ => this.carregar(),
      error: e => this.erro = e.message ?? 'Falha ao excluir'
      
    });
  }

  // Calcula o saldo atual
  saldoAtual: number = 0;

  calcularSaldo() {
    let saldo = 0;

    this.transacoes.forEach(t => {
      if (t.tipo === 'entrada') {
        saldo += t.valor;
      } else if (t.tipo === 'saida') {
        saldo -= t.valor;
      }
    });

  this.saldoAtual = saldo;
  }

  // Utilizado para trocar a cor da categoria
  corCategoria(categoria: string): string {
    switch(categoria.toLowerCase()) {
      case 'alimentação': return 'orange';
      case 'transporte': return 'blue';
      case 'lazer': return 'green';
      case 'contas': return 'purple';

      default: return 'black';
    }
  }
}