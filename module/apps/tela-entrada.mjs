import { MODULO } from "../config.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export const FUNDO_ENTRADA = `modules/${MODULO}/assets/entrada/fundo-entrada.webp`;
const DESCRICAO = `modules/${MODULO}/assets/entrada/descricao-mundo.html`;

/**
 * A tela de entrada (/join) do Foundry não carrega código de módulos. O que se personaliza nela
 * é a imagem de fundo e a descrição do mundo, editadas no Setup. Esta janela entrega as duas
 * prontas para copiar, com o passo a passo.
 */
export class TelaEntradaApp extends HandlebarsApplicationMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		id: "galrasia-tela-entrada",
		classes: ["galrasia", "gl-janela"],
		window: { title: "GALRASIA.Entrada.Titulo", icon: "fa-solid fa-door-open", resizable: true },
		position: { width: 640, height: 720 },
		actions: {
			copiarCaminho: TelaEntradaApp.#copiarCaminho,
			copiarDescricao: TelaEntradaApp.#copiarDescricao
		}
	};

	static PARTS = {
		corpo: { template: `modules/${MODULO}/templates/tela-entrada.hbs`, scrollable: [""] }
	};

	static #descricao = null;

	static async descricao() {
		TelaEntradaApp.#descricao ??= await fetch(DESCRICAO).then((r) => r.text());
		return TelaEntradaApp.#descricao;
	}

	async _prepareContext() {
		const html = await TelaEntradaApp.descricao();
		return { fundo: FUNDO_ENTRADA, html, mundo: game.world.title };
	}

	static async #copiarCaminho() {
		await game.clipboard.copyPlainText(FUNDO_ENTRADA);
		ui.notifications.info(game.i18n.localize("GALRASIA.Entrada.CaminhoCopiado"));
	}

	static async #copiarDescricao() {
		await game.clipboard.copyPlainText(await TelaEntradaApp.descricao());
		ui.notifications.info(game.i18n.localize("GALRASIA.Entrada.DescricaoCopiada"));
	}
}
