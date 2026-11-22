import { MODULO, aoMudarConfiguracao, registrarConfiguracoes } from "./config.mjs";
import { PainelPersonagensApp } from "./apps/painel-personagens.mjs";
import { PainelAmeacasApp } from "./apps/painel-ameacas.mjs";
import { TelaEntradaApp } from "./apps/tela-entrada.mjs";
import * as lysianassa from "./lysianassa.mjs";
import * as logica from "./logica.mjs";

const atualizarPersonagens = foundry.utils.debounce(() => PainelPersonagensApp.sincronizar(), 100);
const atualizarAmeacas = foundry.utils.debounce(() => PainelAmeacasApp.sincronizar(), 100);
const atualizarTudo = () => {
	atualizarPersonagens();
	atualizarAmeacas();
};

Hooks.once("init", () => {
	registrarConfiguracoes({ TelaEntradaApp });
	aoMudarConfiguracao(atualizarTudo);
	lysianassa.registrarLysianassa();
	game.modules.get(MODULO).api = {
		painelPersonagens: () => PainelPersonagensApp.sincronizar(),
		painelAmeacas: () => PainelAmeacasApp.sincronizar(),
		telaEntrada: () => new TelaEntradaApp().render({ force: true }),
		lysianassa: { criarCena: lysianassa.criarCena, revelar: lysianassa.revelar, painel: lysianassa.painel, dados: lysianassa.dados },
		logica
	};
});

Hooks.once("ready", () => {
	if (game.system.id !== "tormenta20") {
		console.warn(`${MODULO} | Este módulo foi feito para o sistema Tormenta20; sistema atual: ${game.system.id}`);
	}
	PainelPersonagensApp.sincronizar();
	PainelAmeacasApp.sincronizar();
});

/* Vida, mana, nome, retrato e posse dos personagens. */
for (const gancho of ["createActor", "updateActor", "deleteActor", "updateUser", "createActiveEffect", "updateActiveEffect", "deleteActiveEffect"]) {
	Hooks.on(gancho, atualizarTudo);
}

/* Combate: o painel de ameaças só existe com um combate em andamento; o de personagens marca de quem é a vez. */
for (const gancho of ["createCombat", "updateCombat", "deleteCombat", "combatStart", "createCombatant", "updateCombatant", "deleteCombatant", "updateActorDelta", "canvasReady"]) {
	Hooks.on(gancho, atualizarTudo);
}

Hooks.on("updateToken", (token, mudancas) => {
	if ("disposition" in mudancas || "name" in mudancas || "hidden" in mudancas) atualizarAmeacas();
});
