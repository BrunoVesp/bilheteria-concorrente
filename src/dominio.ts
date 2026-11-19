import type { EventoInfo } from "./tipos.ts";

export abstract class ErroDeNegocio extends Error {
  readonly status: number;

  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.name = this.constructor.name;
    this.status = status;
  }
}


export class DadosInvalidosErro extends ErroDeNegocio {
  constructor(mensagem: string) {
    super(mensagem, 400);
  }
}

export class NaoEncontradoErro extends ErroDeNegocio {
  constructor(mensagem: string) {
    super(mensagem, 404);
  }
}

export class PoltronaOcupadaErro extends ErroDeNegocio {
  constructor(mensagem: string) {
    super(mensagem, 409);
  }
}

export class PagamentoErro extends ErroDeNegocio {
  constructor(mensagem: string) {
    super(mensagem, 502);
  }
}


export class Evento {
    #poltronasVendidas: number[] = [];
    
    constructor(
        public readonly id: number,
        public readonly nome: string,
        public readonly preco: number,
        public readonly capacidade: number
    ) {}
    
    get disponivel(): number {
        return this.capacidade - this.#poltronasVendidas.length;
    }
    
    reservar(poltronas: number[]): void {
        if (poltronas.length === 0) {
            throw new DadosInvalidosErro("A lista de poltronas está vazia");
        }
        
        if (
            poltronas.some(
            (p) => !Number.isInteger(p) || p < 1 || p > this.capacidade
            ) ||
            new Set(poltronas).size !== poltronas.length
        ) {
            throw new DadosInvalidosErro("Poltronas inválidas ou repetidas");
        }

        if (poltronas.some((p) => this.#poltronasVendidas.includes(p))) {
            throw new PoltronaOcupadaErro("Uma ou mais poltronas já foram vendidas");
        }

        this.#poltronasVendidas.push(...poltronas);
    }
    
    liberar(poltronas: number[]): void {
        if (poltronas.some((p) => !this.#poltronasVendidas.includes(p))) {
            throw new DadosInvalidosErro("Uma ou mais poltronas não estão vendidas");
        }

        const liberar = new Set(poltronas);

        this.#poltronasVendidas = this.#poltronasVendidas.filter(
            (p) => !liberar.has(p)
        );
    }


    info(): EventoInfo {
        return {
            id: this.id,
            nome: this.nome,
            preco: this.preco,
            capacidade: this.capacidade,
            disponivel: this.disponivel,
        };
    }

}
