/* Checagem rápida sem Foundry: sintaxe dos .mjs, JSON válidos e arquivos citados no manifesto. */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let erros = 0;
const falha = (msg) => {
	erros++;
	console.error(`✗ ${msg}`);
};

function arquivos(pasta, ext) {
	const out = [];
	for (const nome of readdirSync(pasta)) {
		const p = join(pasta, nome);
		if (statSync(p).isDirectory()) out.push(...arquivos(p, ext));
		else if (p.endsWith(ext)) out.push(p);
	}
	return out;
}

for (const f of arquivos(join(RAIZ, "module"), ".mjs")) {
	try {
		execFileSync(process.execPath, ["--check", f], { stdio: "pipe" });
	} catch (e) {
		falha(`sintaxe: ${f}\n${e.stderr}`);
	}
}
for (const f of [...arquivos(join(RAIZ, "lang"), ".json"), ...arquivos(join(RAIZ, "assets"), ".json"), join(RAIZ, "module.json")]) {
	try {
		JSON.parse(readFileSync(f, "utf8"));
	} catch (e) {
		falha(`JSON: ${f}: ${e.message}`);
	}
}
const manifesto = JSON.parse(readFileSync(join(RAIZ, "module.json"), "utf8"));
for (const f of [...manifesto.esmodules, ...manifesto.styles, ...manifesto.languages.map((l) => l.path)]) {
	if (!existsSync(join(RAIZ, f))) falha(`manifesto cita arquivo inexistente: ${f}`);
}
/* Templates e assets citados no código existem? */
for (const f of arquivos(join(RAIZ, "module"), ".mjs")) {
	const texto = readFileSync(f, "utf8");
	for (const m of texto.matchAll(/modules\/\$\{MODULO\}\/([\w./-]+\.(?:hbs|webp|svg|json|html))/g)) {
		if (!existsSync(join(RAIZ, m[1]))) falha(`${f} cita ${m[1]}, que não existe`);
	}
}
/* Chaves de tradução usadas no código existem no pt-BR? */
const lang = JSON.parse(readFileSync(join(RAIZ, "lang", "pt-BR.json"), "utf8"));
const temChave = (k) => k.split(".").reduce((o, p) => (o && typeof o === "object" ? o[p] : undefined), lang) !== undefined;
for (const f of [...arquivos(join(RAIZ, "module"), ".mjs"), ...arquivos(join(RAIZ, "templates"), ".hbs")]) {
	const texto = readFileSync(f, "utf8");
	for (const m of texto.matchAll(/["'`](GALRASIA\.[\w.]+)["'`]/g)) {
		if (!temChave(m[1])) falha(`${f}: chave de tradução ausente ${m[1]}`);
	}
}
console.log(erros ? `${erros} problema(s).` : "Tudo certo.");
process.exit(erros ? 1 : 0);
