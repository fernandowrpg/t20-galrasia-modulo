# Galrasia — módulo para Foundry VTT (Tormenta20)

Ferramentas para uma campanha em **Galrasia, o Inferno Verde**: a vigília de personagens e ameaças, a tela de entrada em pintura rupestre e o mapa revelável de Lysianassa.

Foundry VTT **v13** · sistema **Tormenta20**.

## Instalação

Em *Add-on Modules → Install Module*, cole o manifesto:

```
https://github.com/fernandowrpg/t20-galrasia-modulo/releases/latest/download/module.json
```

Ative o módulo no mundo em *Gerenciar Módulos*.

## Tema Galrasia

A interface do Foundry ganha o visual da selva à noite: cabeçalho das janelas em copa esmeralda com faixa de âmbar, corpo das janelas, barra lateral e chat em folhagem escura, botões em verde e âmbar. Em *Configurações → Galrasia → Tema Galrasia* cada usuário escolhe: Foundry inteiro (padrão), só as janelas do módulo ou desligado (recarrega a página).

## Vigília

Dois painéis flutuantes, sempre visíveis, no tema de Galrasia (copa esmeralda, borda âmbar, PV em verde/âmbar/brasa, PM em turquesa).

- **Expedição** (bússola): os personagens dos jogadores com retrato, jogador, PV, PM, Defesa e condições. O botão de cartão mostra as perícias treinadas com o bônus da ficha. Durante o combate, o personagem da vez fica destacado. Clique no nome para centralizar no token; no retrato, para abrir a ficha.
- **Ameaças** (pata): aparece enquanto houver um combate em andamento, com iniciativa, ND, Defesa, condições, de quem é a vez e quem caiu. O rodapé soma quantas estão de pé e o PV total.
- **Minimizar**: o painel vira um ícone redondo de folha. Clique para reabrir; arraste para mover; solte perto de um canto para prendê-lo ali (o ícone brilha durante o arraste). O ícone de ameaças mostra quantas estão de pé.
- Arraste o painel pelo topo; clique duplo volta à posição padrão. A seta recolhe os detalhes. Posição, estado e escolhas ficam salvos por usuário.

Configurações: cada usuário liga ou desliga cada painel; o mestre decide se os jogadores veem a expedição e o que veem das ameaças (nada, só o estado aproximado ou os valores).

API: `game.modules.get("t20-galrasia-modulo").api.painelPersonagens()` e `.painelAmeacas()`.

## Tela de entrada

A tela de entrada do Foundry não carrega módulos; ela mostra a **imagem de fundo** e a **descrição** do mundo. O módulo traz as duas prontas: uma pintura rupestre de Galrasia (lagartos-trovão, rei tirano, deinonicos, pteros, caçadores thera, mãos estampadas e a serpente de Obassa) e uma descrição com os lembretes da ilha.

Em *Configurações → Galrasia → Tela de entrada*, copie o caminho da imagem e o HTML e siga o passo a passo (*Setup → Worlds → Edit World*).

## Mapa de Lysianassa

Mapa da cidade com 12 regiões cobertas por névoa e 26 locais em pins coloridos (verde = aliados, amarelo = neutro, vermelho = inimigos).

1. Rode a macro **Lysianassa: criar cena** (criada sozinha na primeira vez que o mestre abre o mundo).
2. Para revelar regiões: botão de mapa nas ferramentas de **Notas**, ou a macro **Lysianassa: revelar regiões**. A névoa da região some e os pins dela aparecem para os jogadores.

## Desenvolvimento

```bash
npm install
npm run check          # sintaxe, JSON, arquivos e traduções
npm run build          # dist/module.zip e dist/module.json
```

A release é publicada pelo GitHub Actions quando a versão do `package.json` muda na `main`.
Os protótipos visuais estão em `prototipos/`.

A arte (mapa e pintura rupestre) é original e gerada por código; nenhuma imagem dos livros de Tormenta20 é distribuída.
