export const MODULO = "t20-galrasia-modulo";

const ouvintes = new Set();

export function aoMudarConfiguracao(fn) {
	ouvintes.add(fn);
}

function notificar() {
	for (const fn of ouvintes) fn();
}

export function registrarConfiguracoes({ TelaEntradaApp }) {
	const painel = (chave) =>
		game.settings.register(MODULO, chave, {
			name: `GALRASIA.Config.${chave}.Nome`,
			hint: `GALRASIA.Config.${chave}.Dica`,
			scope: "client",
			config: true,
			type: Boolean,
			default: true,
			onChange: notificar
		});

	painel("painelPersonagens");
	painel("painelAmeacas");

	game.settings.register(MODULO, "personagensJogadores", {
		name: "GALRASIA.Config.personagensJogadores.Nome",
		hint: "GALRASIA.Config.personagensJogadores.Dica",
		scope: "world",
		config: true,
		type: Boolean,
		default: true,
		onChange: notificar
	});

	game.settings.register(MODULO, "ameacasJogadores", {
		name: "GALRASIA.Config.ameacasJogadores.Nome",
		hint: "GALRASIA.Config.ameacasJogadores.Dica",
		scope: "world",
		config: true,
		type: String,
		choices: {
			nenhum: "GALRASIA.Config.ameacasJogadores.Nenhum",
			estado: "GALRASIA.Config.ameacasJogadores.Estado",
			valores: "GALRASIA.Config.ameacasJogadores.Valores"
		},
		default: "estado",
		onChange: notificar
	});

	/* Posição, recolhido e minimizado de cada painel, por usuário. */
	game.settings.register(MODULO, "paineis", {
		scope: "client",
		config: false,
		type: Object,
		default: {}
	});

	game.settings.registerMenu(MODULO, "telaEntrada", {
		name: "GALRASIA.Config.telaEntrada.Nome",
		label: "GALRASIA.Config.telaEntrada.Rotulo",
		hint: "GALRASIA.Config.telaEntrada.Dica",
		icon: "fa-solid fa-door-open",
		type: TelaEntradaApp,
		restricted: true
	});
}

export function opcao(chave) {
	return game.settings.get(MODULO, chave);
}

export function estadoPainel(chave) {
	return opcao("paineis")?.[chave] ?? {};
}

export async function salvarEstadoPainel(chave, dados) {
	const todos = foundry.utils.deepClone(opcao("paineis") ?? {});
	todos[chave] = { ...todos[chave], ...dados };
	return game.settings.set(MODULO, "paineis", todos);
}
