import { MODULO } from "./config.mjs";

const FONTES = "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Alegreya+Sans:ital,wght@0,400;0,700;1,400&display=swap";

export function registrarTema() {
	game.settings.register(MODULO, "tema", {
		name: "GALRASIA.Config.tema.Nome",
		hint: "GALRASIA.Config.tema.Dica",
		scope: "client",
		config: true,
		type: String,
		choices: {
			tudo: "GALRASIA.Config.tema.Tudo",
			modulo: "GALRASIA.Config.tema.Modulo",
			desligado: "GALRASIA.Config.tema.Desligado"
		},
		default: "tudo",
		requiresReload: true
	});
}

/**
 * Tema Galrasia: a selva à noite. O corpo das janelas só é tingido quando a janela usa o
 * esquema escuro do Foundry (o padrão no v13); fichas claras de sistemas ficam como estão,
 * só ganham a moldura e o cabeçalho de copa.
 */
export function aplicarTema() {
	const modo = game.settings.get(MODULO, "tema");
	if (modo !== "tudo" && modo !== "modulo") return;
	document.body.classList.add(`gl-tema-${modo}`);

	const fontes = document.createElement("link");
	fontes.rel = "stylesheet";
	fontes.href = FONTES;
	document.head.append(fontes);
}
