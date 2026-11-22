import { MODULO, estadoPainel, opcao, salvarEstadoPainel } from "../config.mjs";
import { periciasTreinadas, recurso } from "../logica.mjs";
import { PainelFlutuante, barra } from "./painel.mjs";

const MAX_CONDICOES = 6;

/* Personagens dos jogadores que este usuário pode observar. O mestre vê todos. */
export function personagensVisiveis() {
	return game.actors
		.filter((a) => a.type === "character" && a.hasPlayerOwner && a.testUserPermission(game.user, "OBSERVER"))
		.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

function jogadorDe(actor) {
	return game.users.find((u) => !u.isGM && u.character?.id === actor.id)?.name
		?? game.users.find((u) => !u.isGM && actor.testUserPermission(u, "OWNER"))?.name
		?? "";
}

export class PainelPersonagensApp extends PainelFlutuante {
	static CHAVE = "personagens";

	static instancia = null;

	static deveExibir() {
		if (!opcao("painelPersonagens")) return false;
		if (!game.user.isGM && !opcao("personagensJogadores")) return false;
		return personagensVisiveis().length > 0;
	}

	static DEFAULT_OPTIONS = {
		classes: ["gl-painel-personagens"],
		actions: {
			abrirFicha: PainelPersonagensApp.#abrirFicha,
			focar: PainelPersonagensApp.#focar,
			detalhar: PainelPersonagensApp.#detalhar
		}
	};

	static PARTS = {
		corpo: { template: `modules/${MODULO}/templates/painel-personagens.hbs`, scrollable: [".gl-painel-lista"] }
	};

	/* Detalhado, cada personagem mostra as perícias treinadas. Fica salvo por usuário. */
	get detalhado() {
		return !!estadoPainel(this.constructor.CHAVE).detalhado;
	}

	posicaoPadrao() {
		const nav = document.getElementById("scene-navigation")?.getBoundingClientRect();
		if (!nav?.width) return super.posicaoPadrao();
		return { left: Math.round(nav.left), top: Math.round(Math.min(nav.bottom + 12, 160)) };
	}

	async _prepareContext() {
		const detalhado = this.detalhado;
		const combate = game.combats?.viewed ?? game.combat;
		const daVez = combate?.started ? combate.combatant?.actor?.id : null;
		const personagens = personagensVisiveis().map((actor) => {
			const atributos = actor.system?.attributes ?? {};
			const pv = recurso(atributos.pv);
			const condicoes = (actor.temporaryEffects ?? []).filter((e) => e.img).map((e) => ({ nome: e.name, img: e.img }));
			return {
				id: actor.id,
				nome: actor.name,
				img: actor.img,
				jogador: jogadorDe(actor),
				daVez: actor.id === daVez,
				caido: pv?.faixa === "caido",
				defesa: atributos.defesa?.value ?? null,
				barras: [barra("pv", "PV", pv), barra("pm", "PM", recurso(atributos.pm))].filter(Boolean),
				condicoes: condicoes.slice(0, MAX_CONDICOES),
				maisCondicoes: Math.max(0, condicoes.length - MAX_CONDICOES),
				pericias: detalhado ? periciasTreinadas(actor.system?.pericias) : []
			};
		});
		return { recolhido: this.recolhido, minimizado: this.minimizado, detalhado, personagens };
	}

	#ator(alvo) {
		return game.actors.get(alvo.closest("[data-actor]")?.dataset.actor);
	}

	static #abrirFicha(event, alvo) {
		this.#ator(alvo)?.sheet.render(true);
	}

	/* Centraliza no token do personagem na cena atual, se houver. */
	static #focar(event, alvo) {
		const actor = this.#ator(alvo);
		const token = actor?.getActiveTokens(true)[0];
		if (!token) return actor?.sheet.render(true);
		if (token.isOwner) token.control({ releaseOthers: true });
		canvas.animatePan({ x: token.center.x, y: token.center.y });
	}

	static async #detalhar() {
		await salvarEstadoPainel(this.constructor.CHAVE, { detalhado: !this.detalhado });
		this.render();
	}
}
