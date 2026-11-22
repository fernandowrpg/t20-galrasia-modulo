/**
 * Lysianassa — mapa revelável.
 *
 * Cria uma cena com o mapa, um diário com uma página por local e uma nota (pin) por local.
 * Cada local é uma região própria, coberta por um desenho opaco (névoa). Revelar o local esconde
 * o desenho e libera a página (e portanto o pin) para os jogadores. A cartela com o nome da
 * cidade é um desenho acima da névoa: fica sempre visível.
 */
import { MODULO } from "./config.mjs";

const PASTA = `modules/${MODULO}/assets/lysianassa`;
/* Versão do formato da cena. 2 = uma região por local e cartela do nome sempre visível. */
const VERSAO = 2;
const NIVEL = () => CONST.DOCUMENT_OWNERSHIP_LEVELS;
const CORES = { verde: "Aliados", amarelo: "Neutro", vermelho: "Inimigos" };
const HEX = { verde: "#3fae5a", amarelo: "#e3b23c", vermelho: "#c9402b" };

let _dados = null;
export async function dados() {
	_dados ??= await foundry.utils.fetchJsonWithTimeout(`modules/${MODULO}/assets/lysianassa/lysianassa.json`);
	return _dados;
}

const acharCena = () => game.scenes.find((s) => s.getFlag(MODULO, "lysianassa"));
const acharDiario = () => game.journal.find((j) => j.getFlag(MODULO, "lysianassa"));

function desenhoDoPoligono(poligono) {
	const xs = poligono.map((p) => p[0]);
	const ys = poligono.map((p) => p[1]);
	const x = Math.min(...xs);
	const y = Math.min(...ys);
	return {
		x,
		y,
		shape: { type: "p", width: Math.max(...xs) - x, height: Math.max(...ys) - y, points: poligono.flatMap(([px, py]) => [px - x, py - y]) }
	};
}

export async function criarCena() {
	if (!game.user.isGM) return ui.notifications.warn("Só o mestre pode criar a cena de Lysianassa.");
	const d = await dados();
	const existente = acharCena();
	if (existente) {
		if ((existente.getFlag(MODULO, "versao") ?? 1) < VERSAO) return oferecerRecriar(existente);
		ui.notifications.info("A cena de Lysianassa já existe — abrindo.");
		return existente.view();
	}

	// Diário: uma página por local, todas escondidas dos jogadores.
	let diario = acharDiario();
	if (!diario) {
		diario = await JournalEntry.create({
			name: "Lysianassa — Locais",
			ownership: { default: NIVEL().LIMITED },
			flags: { [MODULO]: { lysianassa: true, versao: VERSAO } },
			pages: d.pins.map((p, i) => {
				const regiao = d.regioes.find((r) => r.id === p.regiao);
				return {
					name: p.nome,
					type: "text",
					sort: (i + 1) * 100,
					ownership: { default: NIVEL().NONE },
					text: {
						content: `<p><span style="background:${HEX[p.cor]};color:#fff;border-radius:999px;padding:1px 8px;font-weight:bold">${CORES[p.cor]}</span> · <em>${regiao?.distritoNome ?? ""}</em></p><p>${p.descricao}</p>`
					},
					flags: { [MODULO]: { pin: p.id, regiao: p.regiao } }
				};
			})
		});
	}
	const paginaDe = Object.fromEntries(diario.pages.map((pg) => [pg.getFlag(MODULO, "pin"), pg]));

	const cena = await Scene.create({
		name: "Lysianassa",
		background: { src: `${PASTA}/${d.imagem}` },
		width: d.largura,
		height: d.altura,
		padding: 0.05,
		backgroundColor: "#0d1712",
		grid: { size: d.grade, type: CONST.GRID_TYPES.SQUARE, alpha: 0.1, color: "#000000" },
		tokenVision: false,
		fog: { exploration: false },
		initial: { x: d.largura / 2, y: d.altura / 2, scale: 0.25 },
		flags: { [MODULO]: { lysianassa: true, versao: VERSAO, reveladas: [] } }
	});

	// Névoa: um desenho opaco por local. Por cima de tudo, a cartela com o nome da cidade.
	const t = d.titulo;
	await cena.createEmbeddedDocuments("Drawing", [
		...d.regioes.map((r) => ({
			...desenhoDoPoligono(r.poligono),
			sort: 0,
			fillType: CONST.DRAWING_FILL_TYPES.PATTERN,
			fillColor: "#ffffff",
			fillAlpha: 1,
			texture: `${PASTA}/nevoa.webp`,
			strokeWidth: 10,
			strokeColor: "#0f1d15",
			strokeAlpha: 1,
			locked: true,
			hidden: false,
			flags: { [MODULO]: { regiao: r.id } }
		})),
		{
			x: t.x,
			y: t.y,
			sort: 100,
			shape: { type: "r", width: t.largura, height: t.altura },
			fillType: CONST.DRAWING_FILL_TYPES.PATTERN,
			fillColor: "#ffffff",
			fillAlpha: 1,
			texture: `${PASTA}/${t.imagem}`,
			strokeWidth: 0,
			strokeAlpha: 0,
			locked: true,
			hidden: false,
			flags: { [MODULO]: { titulo: true } }
		}
	]);

	// Pins: uma nota por local, ligada à página do diário.
	await cena.createEmbeddedDocuments(
		"Note",
		d.pins.map((p) => ({
			entryId: diario.id,
			pageId: paginaDe[p.id]?.id,
			x: p.x,
			y: p.y,
			texture: { src: `${PASTA}/pin-${p.cor}.svg` },
			iconSize: 64,
			text: p.nome,
			fontSize: 26,
			textAnchor: CONST.TEXT_ANCHOR_POINTS.BOTTOM,
			textColor: "#efe6cf",
			global: true,
			flags: { [MODULO]: { pin: p.id, regiao: p.regiao } }
		}))
	);

	ui.notifications.info("Cena de Lysianassa criada. Use o botão de mapa na barra de Notas para revelar os locais.");
	return cena.view();
}

/* Cenas criadas antes da 1.2.0 tinham uma região por distrito: oferece recriar no formato novo. */
async function oferecerRecriar(cena) {
	const ok = await foundry.applications.api.DialogV2.confirm({
		window: { title: "Lysianassa: mapa atualizado" },
		content: "<p>O mapa de Lysianassa mudou: agora <strong>cada local é uma região própria</strong> e o nome da cidade fica sempre visível.</p><p>Recriar a cena e o diário de locais? O que já foi revelado volta a ficar coberto.</p>",
		rejectClose: false
	});
	if (!ok) return cena.view();
	await recriarCena();
}

export async function recriarCena() {
	if (!game.user.isGM) return;
	await acharCena()?.delete();
	await acharDiario()?.delete();
	return criarCena();
}

export async function revelar(regiaoId, valor = true) {
	return revelarVarios({ [regiaoId]: valor });
}

/* Revela ou esconde vários locais de uma vez: { idDoLocal: true|false }. */
export async function revelarVarios(mudancas) {
	if (!game.user.isGM) return;
	const cena = acharCena();
	const diario = acharDiario();
	if (!cena || !diario) return ui.notifications.warn("Crie a cena de Lysianassa primeiro.");

	const desenhos = cena.drawings.filter((dr) => dr.getFlag(MODULO, "regiao") in mudancas);
	await cena.updateEmbeddedDocuments("Drawing", desenhos.map((dr) => ({ _id: dr.id, hidden: !!mudancas[dr.getFlag(MODULO, "regiao")] })));

	const paginas = diario.pages.filter((pg) => pg.getFlag(MODULO, "regiao") in mudancas);
	await diario.updateEmbeddedDocuments(
		"JournalEntryPage",
		paginas.map((pg) => ({ _id: pg.id, "ownership.default": mudancas[pg.getFlag(MODULO, "regiao")] ? NIVEL().OBSERVER : NIVEL().NONE }))
	);

	const atual = new Set(cena.getFlag(MODULO, "reveladas") ?? []);
	for (const [id, valor] of Object.entries(mudancas)) valor ? atual.add(id) : atual.delete(id);
	await cena.setFlag(MODULO, "reveladas", [...atual]);
}

export async function painel() {
	if (!game.user.isGM) return;
	const cena = acharCena();
	if (!cena) return criarCena();
	if ((cena.getFlag(MODULO, "versao") ?? 1) < VERSAO) return oferecerRecriar(cena);
	const d = await dados();
	const reveladas = new Set(cena.getFlag(MODULO, "reveladas") ?? []);
	const grupos = d.distritos
		.map((dist) => {
			const locais = d.regioes.filter((r) => r.distrito === dist.id);
			const itens = locais
				.map(
					(r) => `<label style="display:flex;align-items:center;gap:8px;padding:2px 0 2px 22px">
						<input type="checkbox" name="${r.id}" data-distrito="${dist.id}" ${reveladas.has(r.id) ? "checked" : ""}>
						<span style="width:10px;height:10px;border-radius:50%;background:${HEX[r.cor]};display:inline-block;flex:none"></span>
						<span>${r.nome}</span>
					</label>`
				)
				.join("");
			const todos = locais.every((r) => reveladas.has(r.id));
			return `<fieldset style="margin:0 0 6px;padding:4px 8px">
				<legend><label style="display:flex;align-items:center;gap:6px;font-weight:bold">
					<input type="checkbox" class="gl-distrito" data-distrito="${dist.id}" ${todos ? "checked" : ""}> ${dist.nome}
				</label></legend>${itens}</fieldset>`;
		})
		.join("");
	const escolha = await foundry.applications.api.DialogV2.wait({
		window: { title: "Lysianassa — locais revelados", icon: "fa-solid fa-map-location-dot" },
		position: { width: 480 },
		content: `<p>Marque os locais que os jogadores podem ver. A caixa do distrito marca todos os locais dele.</p><div style="max-height:62vh;overflow:auto">${grupos}</div>`,
		render: (event, dialog) => {
			const raiz = dialog.element ?? event?.target?.element;
			raiz?.querySelectorAll("input.gl-distrito").forEach((caixa) =>
				caixa.addEventListener("change", () => {
					raiz.querySelectorAll(`input[data-distrito="${caixa.dataset.distrito}"]:not(.gl-distrito)`).forEach((c) => (c.checked = caixa.checked));
				})
			);
		},
		buttons: [
			{
				action: "aplicar",
				label: "Aplicar",
				icon: "fa-solid fa-eye",
				default: true,
				callback: (event, button) => Object.fromEntries(d.regioes.map((r) => [r.id, button.form.elements[r.id].checked]))
			},
			{ action: "cancelar", label: "Cancelar" }
		],
		rejectClose: false
	});
	if (!escolha || typeof escolha !== "object") return;
	const mudancas = Object.fromEntries(Object.entries(escolha).filter(([id, valor]) => valor !== reveladas.has(id)));
	if (Object.keys(mudancas).length) await revelarVarios(mudancas);
	ui.notifications.info("Locais de Lysianassa atualizados.");
}

export function registrarLysianassa() {
	Hooks.on("getSceneControlButtons", (controls) => {
		if (!game.user?.isGM) return;
		const notas = Array.isArray(controls) ? controls.find((c) => c.name === "notes") : controls.notes;
		if (!notas) return;
		const ferramenta = {
			name: "galrasia-lysianassa",
			title: "Lysianassa: revelar locais",
			icon: "fa-solid fa-map-location-dot",
			button: true,
			visible: true,
			order: 100
		};
		// v13: ferramentas em objeto com onChange; v12: array com onClick.
		if (Array.isArray(notas.tools)) notas.tools.push({ ...ferramenta, onClick: () => painel() });
		else notas.tools["galrasia-lysianassa"] = { ...ferramenta, onChange: () => painel() };
	});

	Hooks.once("ready", async () => {
		if (!game.user.isGM) return;
		const macros = [
			{ name: "Lysianassa: criar cena", command: `game.modules.get("${MODULO}").api.lysianassa.criarCena();`, img: "icons/svg/village.svg" },
			{ name: "Lysianassa: revelar regiões", command: `game.modules.get("${MODULO}").api.lysianassa.painel();`, img: "icons/svg/eye.svg" }
		];
		for (const m of macros) {
			if (!game.macros.find((x) => x.name === m.name)) await Macro.create({ ...m, type: "script", flags: { [MODULO]: { macro: true } } });
		}
	});
}
