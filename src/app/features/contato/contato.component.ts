import { Component } from '@angular/core';

@Component({
	selector: 'app-contato',
	templateUrl: './contato.component.html',
})
export class ContatoComponent {
	formatarTelefone(event: any) {
		let input = event.target.value;
		input = input.replace(/\D/g, ''); // Remove tudo que não é dígito

		if (input.length > 0) {
			input = '(' + input;
		}
		if (input.length > 3) {
			input = [input.slice(0, 3), ') ', input.slice(3)].join('');
		}
		if (input.length > 10) {
			input = [input.slice(0, 10), '-', input.slice(10)].join('');
		}

		event.target.value = input;
	}

	enviarMensagem(event: Event) {
		event.preventDefault();
		console.log('Formulário enviado com sucesso!');
		alert('Obrigada pelo contato! Retornaremos em breve.');
	}
}
