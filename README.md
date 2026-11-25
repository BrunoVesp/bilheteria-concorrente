# Bilheteria concorrente

Projeto final de Paradigmas de Linguagens de Programação. Enunciado completo no Blackboard.

Os arquivos de `src/` que vocês escrevem já existem, vazios; o `tipos.ts` e o `servidor.ts` vêm prontos. O que vai em cada um está no passo
indicado do enunciado:

| Arquivo | Passo do enunciado |
| :--- | :--- |
| `src/tipos.ts` (pronto) | 1: os tipos |
| `src/regras.ts` | 2: meia-entrada |
| `src/preco.ts` | 3: preço (funcional) |
| `src/dominio.ts` | 4: evento e erros (orientado a objetos) |
| `src/bilheteria.ts` | 5: a venda, onde a concorrência aparece |
| `src/servidor.ts` (pronto) e `src/main.ts` | 6: ligar o servidor |

Não alterem `src/pagamento.ts`, `src/servidor.ts`, `src/bench.ts` nem `testes/`: a correção usa os originais.

Para começar, sigam o `GUIA.md`. Depois dele, os comandos são:

```bash
npm install
npm test          # correção automática: mostra os pontos
npm start         # serviço em http://localhost:3000
npm run bench     # com o serviço no ar: 200 pedidos simultâneos no evento 1, dois por poltrona
```

Exemplo de pedido:

```bash
curl -X POST localhost:3000/reservas -H 'Content-Type: application/json' \
  -d '{"eventoId":1,"ingressos":[{"nome":"Ana","idade":20,"estudante":true,"pcd":false,"poltrona":7}]}'
```

---

## Preencham (avaliado no vídeo)

**Link do vídeo:** 

### Integrantes

| Nome | Usuário do GitHub | Parte principal | RGM |
| :--- | :--- | :--- | :--- |
| Bruno Hebert Sousa Felix | BrunoVesp | regras.ts e bilheteria.ts | 34895337 |
| Caio Kleivson Serafim Galdino Alves | caiokleivson | main.ts | 34885862 |
| Marllon Brenno Barbosa Serpa | Marllonbrenno | preco.ts | 33623112 |
| Paulo Fernandes Pinheiro Neto | Paulo0675 | dominio.ts | 33920095 |

### Decisões

1. **Concorrência.** Como vocês garantem que duas pessoas não ficam com a mesma poltrona? Onde estava o
   `await` perigoso?
2. **OO.** O que o `Evento` esconde e por quê? Por que o `reservar` é tudo ou nada? Por que os erros são uma hierarquia de classes?
3. **Funcional.** O que ganhamos com `preco.ts` puro? Como vocês testariam ele sem subir o servidor?
4. **Se fosse em outro paradigma.** Escolham uma das partes e expliquem como ficaria em outro
   paradigma, e se ficaria melhor ou pior.
5. **Concorrente × paralelo.** O Node roda o JavaScript numa linha só: os pedidos de vocês são
   concorrentes, não paralelos. O que mudaria se a venda rodasse em vários núcleos ao mesmo tempo?

### Respostas:
1. Garantimos que duas pessoas não reservem a mesma poltrona porque chamamos evento.reservar(poltronas) antes do await, marcando as poltronas como ocupadas imediatamente.
   O await perigoso seria aguardar o pagamento antes de reservar as poltronas, pois duas pessoas poderiam iniciar o pagamento pela mesma poltrona.
   Se o pagamento falhar ou exceder o tempo limite, liberamos as poltronas para uma nova tentativa.
2. O Evento esconde a lista de poltronas vendidas por meio do atributo privado #poltronasVendidas. Isso é feito para proteger os dados internos da classe, impedindo que outras partes do sistema acessem
   ou modifiquem diretamente essa lista. Dessa forma, o controle das poltronas é realizado exclusivamente pelos métodos da própria classe, mantendo a integridade das informações.O método reservar deve
   funcionar no modelo tudo ou nada para garantir a funcionalidade da operação. Antes de realizar a reserva, o sistema verifica se todas as poltronas são válidas, se não existem números repetidos e se
   nenhuma já foi vendida. Somente depois de todas as validações serem aprovadas é que as poltronas são reservadas. Isso evita reservas parciais e mantém a consistência dos dados. Os erros são organizados
   em uma hierarquia de classes para aproveitar os conceitos de herança e reutilização de código. A classe abstrata ErroDeNegocio concentra as características comuns dos erros, como a mensagem e o status
   HTTP. Suas subclasses representam situações específicas, como dados inválidos, evento não encontrado, poltrona ocupada e falha no pagamento, cada uma com seu próprio código de status. Isso facilita a
   organização, identificação e tratamento dos erros no sistema.
3. Ganhamos confiabilidade e previsibilidade no código, uma vez que o arquivo preco.ts trabalha com funções puras, recebendo dados externos por parâmetros e retornando resultados sem modificar esses
   dados ou depender de estados externos. Isso é importante porque ele é responsável diretamente pelos cálculos dos ingressos, que precisam ser realizados corretamente. Uma forma de testar esse
   código sem subir o servidor seria importar diretamente suas funções em um arquivo de testes e verificar os resultados para diferentes situações, como ingressos inteiros, meia-entrada e aplicação
   da taxa de serviço. Dessa forma, conseguimos validar os cálculos de maneira isolada, sem precisar executar toda a aplicação.
4. Há Responder
5. Se a venda rodasse em vários núcleos ao mesmo tempo, os pedidos poderiam ser processados em paralelo, mas precisaríamos de mecanismos de sincronização para evitar que duas requisições reservassem a mesma poltrona
   simultaneamente. No Node atual, a concorrência é mais simples de controlar porque o JavaScript executa uma operação por vez, permitindo marcar a poltrona antes do await. Em vários núcleos, precisaríamos proteger
   esse acesso compartilhado com travas ou mecanismos de sincronização.

### Resultados do bench

| Cenário | Pedidos | Tempo (ms) | Vendidos | Poltrona ocupada | Falha de pagamento |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Padrão (`main.ts`) | 200 | | | | |
| Padrão (`main.ts`) | 200 | 274ms | 731 Pedidos | 409 | 502 |

O bench ocupa as poltronas do evento 1: para rodar de novo, parem o `npm start` (Ctrl+C) e subam outra
vez.

O que os números mostram:
200 pedidos em 266 ms (752 pedidos/s)
por status HTTP: { '201': 91, '409': 100, '502': 9 }  (201 vendido, 409 poltrona ocupada, 502 pagamento)
