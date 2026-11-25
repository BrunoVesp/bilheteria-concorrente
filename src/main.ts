// src/main.ts
import { Evento } from "./dominio.ts";
import { criarBilheteria } from "./bilheteria.ts";
import { criarPagamentoFalso } from "./pagamento.ts";
import { criarServidor } from "./servidor.ts";

const eventos = [
  new Evento(1, "Show Principal", 80, 100),   // id 1 com 100 poltronas: o bench usa este
  new Evento(2, "Show Acústico", 50, 40),     // escolha do grupo
  new Evento(3, "Festival de Verão", 120, 200) // escolha do grupo
];

const pagar = criarPagamentoFalso({ latenciaMs: 80, taxaDeFalha: 0.1 });

const bilheteria = criarBilheteria({
  eventos,
  pagar,
  limitePagamentoMs: 500,
});

criarServidor(bilheteria).listen(3000, () => console.log("no ar na porta 3000"));