import { DadosInvalidosErro, Evento, NaoEncontradoErro, PagamentoErro } from "./dominio.ts";
import { Pagamento } from "./pagamento.ts";
import { calcularTotal, montarIngressos } from "./preco.ts";
import { direitoAMeia } from "./regras.ts";
import { Comprovante, ConfigBilheteria, EventoInfo, Pedido } from "./tipos.ts";

export class Bilheteria {
    #eventos: Evento[];
    #pagar: Pagamento;
    #limitePagamentoMs: number;
    #reservaId: number;

    constructor(config: ConfigBilheteria) {
        this.#eventos = config.eventos;
        this.#pagar = config.pagar;
        this.#limitePagamentoMs = config.limitePagamentoMs;
        this.#reservaId = 0;
    }

    listarEventos(): EventoInfo[] {
        return this.#eventos.map(evento => evento.info());
    }

    async reservar(pedido: Pedido): Promise<Comprovante> {
        if (!pedido.ingressos || pedido.ingressos.length === 0) {
            throw new DadosInvalidosErro("Não há ingressos no pedido");
        }

        const evento = this.#eventos.find(evento => evento.id === pedido.eventoId);

        if (!evento) {
            throw new NaoEncontradoErro("Evento não encontrado");
        }

        const poltronas = pedido.ingressos.map(pessoa => pessoa.poltrona);
        evento.reservar(poltronas);

        const ingressos = montarIngressos(evento.preco, pedido.ingressos, direitoAMeia);

        const total = calcularTotal(ingressos);

        try {
            await comTempoLimite(this.#pagar(total), this.#limitePagamentoMs);
        } catch {
            evento.liberar(poltronas);
            throw new PagamentoErro("Erro ao processar o pagamento");
        }

        this.#reservaId++;

        return {
            reservaId: this.#reservaId,
            eventoId: evento.id,
            ingressos,
            total,
        };
    }
}

export function criarBilheteria(config: ConfigBilheteria): Bilheteria {
    return new Bilheteria(config);
}

function comTempoLimite<T>(promessa: Promise<T>, ms: number): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const limite = new Promise<never>((_, rejeitar) => {
        timer = setTimeout(() => rejeitar(new Error("tempo esgotado")), ms);
    });
    // O finally desliga o relógio quando a cobrança termina antes.
    return Promise.race([promessa, limite]).finally(() => clearTimeout(timer));
}