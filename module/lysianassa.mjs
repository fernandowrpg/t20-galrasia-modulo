/**
 * Lysianassa — mapa revelável.
 *
 * Cria uma cena com o mapa, um diário com uma página por local e uma nota (pin) por local.
 * Cada região começa coberta por um desenho opaco. Revelar a região esconde o desenho
 * e libera as páginas (e portanto os pins) daquela região para os jogadores.
 */
import { MODULO } from "./config.mjs";

const PASTA = `modules/${MODULO}/assets/lysianassa`;
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

export async function criarCena() {
	if (!game.user.isGM) return ui.notifications.warn("Só o mestre pode criar a cena de Lysianassa.");
	const d = await dados();
	const existente = acharCena();
	if (existente) {
		ui.notifications.info("A cena de Lysianassa já existe — abrindo.");
		return existente.view();
	}

	// Diário: uma página por pin, todas escondidas dos jogadores.
	let diario = acharDiario();
	if (!diario) {
		const regioes = Object.fromEntries(d.regioes.map((r) => [r.id, r]));
		diario = await JournalEntry.create({
			name: "Lysianassa — Locais",
			ownership: { default: NIVEL().LIMITED },
			flags: { [MODULO]: { lysianassa: true } },
			pages: d.pins.map((p, i) => ({
				name: p.nome,
				type: "text",
				sort: (i + 1) * 100,
				ownership: { default: NIVEL().NONE },
				text: {
					content: `<p><span style="background:${HEX[p.cor]};color:#fff;border-radius:999px;padding:1px 8px;font-weight:bold">${CORES[p.cor]}</span> · <em>${regioes[p.regiao].nome}</em></p><p>${p.descricao}</p>`
				},
				flags: { [MODULO]: { pin: p.id, regiao: p.regiao } }
			}))
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
		flags: { [MODULO]: { lysianassa: true, reveladas: [] } }
	});

	// Névoa: um desenho opaco por região.
	await cena.createEmbeddedDocuments(
		"Drawing",
		d.regioes.map((r) => {
			const xs = r.poligono.map((p) => p[0]);
			const ys = r.poligono.map((p) => p[1]);
			const x = Math.min(...xs);
			const y = Math.min(...ys);
			return {
				x,
				y,
				shape: { type: "p", width: Math.max(...xs) - x, height: Math.max(...ys) - y, points: r.poligono.flatMap(([px, py]) => [px - x, py - y]) },
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
			};
		})
	);

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

	ui.notifications.info("Cena de Lysianassa criada. Use o botão de mapa na barra de Notas para revelar regiões.");
	return cena.view();
}

export async function revelar(regiaoId, valor = true) {
	if (!game.user.isGM) return;
	const cena = acharCena();
	const diario = acharDiario();
	if (!cena || !diario) return ui.notifications.warn("Crie a cena de Lysianassa primeiro.");

	const desenhos = cena.drawings.filter((dr) => dr.getFlag(MODULO, "regiao") === regiaoId);
	await cena.updateEmbeddedDocuments("Drawing", desenhos.map((dr) => ({ _id: dr.id, hidden: valor })));

	const paginas = diario.pages.filter((pg) => pg.getFlag(MODULO, "regiao") === regiaoId);
	await diario.updateEmbeddedDocuments(
		"JournalEntryPage",
		paginas.map((pg) => ({ _id: pg.id, "ownership.default": valor ? NIVEL().OBSERVER : NIVEL().NONE }))
	);

	const atual = new Set(cena.getFlag(MODULO, "reveladas") ?? []);
	valor ? atual.add(regiaoId) : atual.delete(regiaoId);
	await cena.setFlag(MODULO, "reveladas", [...atual]);
}

export async function painel() {
	if (!game.user.isGM) return;
	const cena = acharCena();
	if (!cena) return criarCena();
	const d = await dados();
	const reveladas = new Set(cena.getFlag(MODULO, "reveladas") ?? []);
	const linhas = d.regioes
		.map(
			(r) => `<label style="display:flex;align-items:center;gap:8px;padding:4px 0">
				<input type="checkbox" name="${r.id}" ${reveladas.has(r.id) ? "checked" : ""}>
				<span style="width:10px;height:10px;border-radius:50%;background:${HEX[r.cor]};display:inline-block"></span>
				<span><strong>${r.nome}</strong><br><small>${d.pins.filter((p) => p.regiao === r.id).map((p) => p.nome).join(" · ")}</small></span>
			</label>`
		)
		.join("");
	const escolha = await foundry.applications.api.DialogV2.wait({
		window: { title: "Lysianassa — regiões reveladas", icon: "fa-solid fa-map-location-dot" },
		position: { width: 460 },
		content: `<p>Marque as regiões que os jogadores podem ver.</p><div style="max-height:60vh;overflow:auto">${linhas}</div>`,
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
	for (const [id, valor] of Object.entries(escolha)) {
		if (valor !== reveladas.has(id)) await revelar(id, valor);
	}
	ui.notifications.info("Regiões de Lysianassa atualizadas.");
}

export function registrarLysianassa() {
	Hooks.on("getSceneControlButtons", (controls) => {
		if (!game.user?.isGM) return;
		const notas = Array.isArray(controls) ? controls.find((c) => c.name === "notes") : controls.notes;
		if (!notas) return;
		const ferramenta = {
			name: "galrasia-lysianassa",
			title: "Lysianassa: revelar regiões",
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
