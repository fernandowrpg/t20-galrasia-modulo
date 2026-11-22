/* Regras puras, sem depender do Foundry: faixas de vida e nomes das perícias do Tormenta20. */

export const PERICIAS_T20 = {
	acro: "Acrobacia",
	ades: "Adestramento",
	atle: "Atletismo",
	atua: "Atuação",
	cava: "Cavalgar",
	conh: "Conhecimento",
	cura: "Cura",
	dipl: "Diplomacia",
	enga: "Enganação",
	fort: "Fortitude",
	furt: "Furtividade",
	guer: "Guerra",
	inic: "Iniciativa",
	inti: "Intimidação",
	intu: "Intuição",
	inve: "Investigação",
	joga: "Jogatina",
	ladi: "Ladinagem",
	luta: "Luta",
	mist: "Misticismo",
	nobr: "Nobreza",
	perc: "Percepção",
	pilo: "Pilotagem",
	pont: "Pontaria",
	refl: "Reflexos",
	reli: "Religião",
	sobr: "Sobrevivência",
	vont: "Vontade",
	alfa: "Ofício: Alfaiate",
	alqu: "Ofício: Alquimista",
	arme: "Ofício: Armeiro",
	arte: "Ofício: Artesão",
	cozi: "Ofício: Cozinheiro",
	enge: "Ofício: Engenhoqueiro"
};

export function faixaRecurso(valor, max) {
	if (valor <= 0) return "caido";
	if (max <= 0 || valor >= max) return "ileso";
	const fracao = valor / max;
	if (fracao <= 0.25) return "critico";
	if (fracao <= 0.5) return "ferido";
	return "leve";
}

export function recurso(dados) {
	if (!dados || typeof dados !== "object") return null;
	const valor = Number(dados.value) || 0;
	const max = Number(dados.max) || 0;
	const temp = Number(dados.temp) || 0;
	const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((valor / max) * 100))) : 0;
	return { valor, max, temp, pct, faixa: faixaRecurso(valor, max) };
}

/* Perícias treinadas da ficha do T20 com o bônus total. Ofícios personalizados (ofi1…ofi9) usam o nome dado na ficha. */
export function periciasTreinadas(pericias = {}) {
	return Object.entries(pericias)
		.filter(([chave, dados]) => dados?.treinado && chave !== "oficio")
		.map(([chave, dados]) => {
			const nome = /^ofi[1-9]$/.test(chave) ? dados.label || chave : PERICIAS_T20[chave] ?? dados.label ?? chave;
			const valor = Number(dados.value);
			const bonus = Number.isFinite(valor) ? (valor >= 0 ? `+${valor}` : `${valor}`) : "";
			return { nome, bonus };
		})
		.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
