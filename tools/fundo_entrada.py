"""Fundo da tela de entrada: pintura rupestre de Galrasia numa parede de caverna (SVG 2560x1440).

Ocre vermelho, ocre amarelo, carvão e caulim sobre rocha iluminada por tochas.
Figuras: lagartos-trovão, rei tirano, deinonicos, pteros, um ceratops-fera e caçadores thera
(ceratops, velocis, pteros e voracis), mãos estampadas, espirais de Allihanna, a serpente de
fogo de Obassa sobre o vulcão e a Árvore-Mãe.

Composição: figuras fortes nas bordas e nas faixas de cima e de baixo; o centro, atrás dos
painéis do Foundry, leva só uma manada esmaecida. O topo central fica livre para o título.

Uso: python fundo_entrada.py SAIDA.svg
"""
import math, random, sys

W, H = 2560, 1440
rnd = random.Random(1418)
o = []
add = o.append

OCRE = "#9a3218"      # ocre vermelho
OCRE2 = "#b8451f"
AMARELO = "#c8892c"   # ocre amarelo
CARVAO = "#1c1410"
CAULIM = "#e6d8b8"
BRASA = "#d4561e"

add(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
add(f"""<defs>
<filter id="rocha" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.0045" numOctaves="6" seed="21" result="n"/>
  <feDiffuseLighting in="n" surfaceScale="16" lighting-color="#ffd9a8" result="luz">
    <feDistantLight azimuth="235" elevation="38"/>
  </feDiffuseLighting>
  <feComposite in="luz" in2="SourceGraphic" operator="arithmetic" k1="1.05" k2="0" k3="0" k4="0"/>
</filter>
<filter id="relevo" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="4" seed="31" result="n"/>
  <feDiffuseLighting in="n" surfaceScale="3" lighting-color="#fff">
    <feDistantLight azimuth="235" elevation="50"/>
  </feDiffuseLighting>
</filter>
<filter id="tons" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.0025" numOctaves="3" seed="41"/>
  <feColorMatrix values="0 0 0 0 0.75  0 0 0 0 0.55  0 0 0 0 0.35  0.9 0 0 0 -0.35"/>
</filter>
<filter id="poros" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" seed="4"/>
  <feColorMatrix values="0 0 0 0 0.12  0 0 0 0 0.08  0 0 0 0 0.05  0 0 0 0.22 0"/>
</filter>
<filter id="manchas" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.0018 0.006" numOctaves="4" seed="13"/>
  <feColorMatrix values="0 0 0 0 0.08  0 0 0 0 0.05  0 0 0 0 0.03  0 0 0 0.9 -0.35"/>
</filter>
<!-- pigmento: borda áspera e falhas, como tinta absorvida pela pedra -->
<filter id="pigmento" x="-10%" y="-10%" width="120%" height="120%">
  <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="7" result="t"/>
  <feDisplacementMap in="SourceGraphic" in2="t" scale="7" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="2" seed="9" result="f"/>
  <feColorMatrix in="f" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 2.15" result="falhas"/>
  <feComposite in="d" in2="falhas" operator="in"/>
</filter>
<filter id="spray" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>
<filter id="suave"><feGaussianBlur stdDeviation="2"/></filter>
<radialGradient id="tocha-e" cx="0.08" cy="1.02" r="0.75">
  <stop offset="0" stop-color="#ffb35c" stop-opacity="0.55"/><stop offset="0.45" stop-color="#d4561e" stop-opacity="0.18"/>
  <stop offset="1" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<radialGradient id="tocha-d" cx="0.92" cy="1.02" r="0.75">
  <stop offset="0" stop-color="#ffb35c" stop-opacity="0.5"/><stop offset="0.45" stop-color="#d4561e" stop-opacity="0.16"/>
  <stop offset="1" stop-color="#000" stop-opacity="0"/>
</radialGradient>
<radialGradient id="vinheta" cx="0.5" cy="0.48" r="0.72">
  <stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0a0604" stop-opacity="0.85"/>
</radialGradient>
<linearGradient id="fuligem" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#0a0604" stop-opacity="0.75"/><stop offset="0.22" stop-color="#0a0604" stop-opacity="0"/>
</linearGradient>
</defs>""")

# ---------------------------------------------------------------- parede
add(f'<rect width="{W}" height="{H}" fill="#8a6444"/>')
add(f'<rect width="{W}" height="{H}" fill="#8a6444" filter="url(#rocha)"/>')
add(f'<rect width="{W}" height="{H}" filter="url(#tons)" opacity="0.55" style="mix-blend-mode:soft-light"/>')
add(f'<rect width="{W}" height="{H}" filter="url(#relevo)" opacity="0.32" style="mix-blend-mode:multiply"/>')
add(f'<rect width="{W}" height="{H}" filter="url(#manchas)" opacity="0.8"/>')
add(f'<rect width="{W}" height="{H}" filter="url(#poros)"/>')
# rachaduras
for _ in range(22):
    x, y = rnd.uniform(0, W), rnd.uniform(0, H)
    d = f"M{x:.0f},{y:.0f}"
    ang = rnd.uniform(0, math.tau)
    for _ in range(rnd.randint(4, 9)):
        ang += rnd.uniform(-0.7, 0.7)
        ln = rnd.uniform(20, 70)
        x += math.cos(ang) * ln
        y += math.sin(ang) * ln
        d += f" L{x:.0f},{y:.0f}"
    add(f'<path d="{d}" stroke="#2a1a10" stroke-width="{rnd.uniform(1.5, 3.5):.1f}" fill="none" opacity="0.55"/>')
    add(f'<path d="{d}" stroke="#e8c79a" stroke-width="1" fill="none" opacity="0.1" transform="translate(2,2)"/>')


# ---------------------------------------------------------------- figuras
def g(x, y, s=1.0, rot=0, flip=False, op=0.92, cor=OCRE):
    sx = -s if flip else s
    return f'<g transform="translate({x},{y}) rotate({rot}) scale({sx},{s})" fill="{cor}" stroke="{cor}" opacity="{op}">'


def lagarto_trovao(x, y, s, flip=False, op=0.9, cor=OCRE):
    add(g(x, y, s, 0, flip, op, cor))
    add('<path stroke="none" d="M-260,40 C-170,30 -110,-10 -60,-40 C-10,-80 90,-85 150,-50 C190,-25 205,-60 230,-120 '
        'C250,-175 275,-245 310,-285 C325,-300 352,-296 352,-280 C350,-268 335,-262 325,-255 C298,-210 280,-140 262,-60 '
        'C255,-20 240,10 200,25 L205,95 L184,95 L176,32 L84,34 L86,98 L64,98 L56,34 C10,30 -40,28 -95,36 C-150,44 -200,52 -260,40Z"/>')
    add(f'<circle cx="338" cy="-284" r="5" fill="{CAULIM}" stroke="none"/>')
    add("</g>")


def rei_tirano(x, y, s, flip=False, op=0.92, cor=OCRE):
    add(g(x, y, s, 0, flip, op, cor))
    add('<path stroke="none" d="M-230,-40 C-150,-50 -80,-70 -20,-95 C20,-115 60,-120 90,-140 C110,-175 150,-190 200,-185 '
        'C235,-182 255,-168 258,-150 L215,-146 L240,-130 L205,-118 C180,-110 150,-112 128,-96 C120,-60 108,-20 85,0 '
        'L105,85 L120,95 L78,98 L66,20 L20,24 L32,90 L48,100 L6,102 L-6,26 C-60,18 -140,-5 -230,-40Z"/>')
    add('<path d="M120,-70 L150,-52 M128,-60 L150,-38" stroke-width="7" fill="none" stroke-linecap="round"/>')
    add(f'<circle cx="208" cy="-168" r="6" fill="{CAULIM}" stroke="none"/>')
    # dentes
    add(f'<path d="M210,-146 l6,8 l6,-8 l6,8 l6,-8" stroke="{CAULIM}" stroke-width="3" fill="none"/>')
    add("</g>")


def deinonico(x, y, s, flip=False, op=0.9, cor=OCRE):
    add(g(x, y, s, 0, flip, op, cor))
    add('<path stroke="none" d="M-120,-10 C-70,-20 -30,-30 0,-40 C25,-50 45,-62 60,-80 C70,-92 92,-96 104,-88 L88,-80 L104,-74 '
        'C88,-66 72,-60 62,-48 C58,-30 50,-14 38,-4 L52,40 L64,46 L40,48 L28,6 L8,8 L2,44 L14,50 L-10,50 L-12,6 C-50,2 -90,0 -120,-10Z"/>')
    add('<path d="M52,-40 L72,-24" stroke-width="5" fill="none" stroke-linecap="round"/>')
    add("</g>")


def ceratops_fera(x, y, s, flip=False, op=0.9, cor=OCRE):
    add(g(x, y, s, 0, flip, op, cor))
    add('<path stroke="none" d="M-170,10 C-150,-50 -60,-80 30,-70 C70,-66 100,-70 120,-90 C135,-130 170,-150 200,-130 '
        'C215,-118 210,-95 196,-82 C215,-70 232,-52 230,-30 C215,-28 196,-34 180,-30 C160,-10 120,0 95,10 L100,70 L78,70 L72,18 '
        'L-40,20 L-36,70 L-58,70 L-64,24 C-110,24 -150,22 -170,10Z"/>')
    add('<path d="M205,-60 L262,-92 M190,-118 L238,-160 M182,-112 L208,-170" stroke-width="8" fill="none" stroke-linecap="round"/>')
    add("</g>")


def ptero(x, y, s, flip=False, op=0.9, cor=CARVAO, rot=0):
    add(g(x, y, s, rot, flip, op, cor))
    add('<path stroke="none" d="M0,0 C-35,-30 -95,-36 -160,-8 C-100,-16 -52,-4 -18,14 L0,8 L18,14 C52,-4 100,-16 160,-8 '
        'C95,-36 35,-30 0,0Z M0,0 L34,-14 L60,-20 L38,-4Z"/>')
    add("</g>")


def cacador(x, y, s, tipo="ceratops", flip=False, op=0.95, cor=OCRE, lanca=True, pose=0):
    """Caçador thera em traço de palito, com a marca de cada raça."""
    add(g(x, y, s, 0, flip, op, cor))
    add('<g fill="none" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">')
    # corpo
    add('<path d="M0,-60 L-4,10"/>')
    passo = 22 if pose == 0 else 34
    add(f'<path d="M-4,10 L-{passo},60 M-4,10 L{passo - 4},48 L{passo + 6},62"/>')
    if tipo == "pteros":
        add('<path d="M0,-50 C-40,-80 -90,-70 -110,-40 C-80,-50 -50,-40 -6,-30 M0,-50 C40,-80 90,-70 110,-40 C80,-50 50,-40 6,-30" stroke-width="7"/>')
    else:
        add('<path d="M0,-45 L-30,-18 M0,-45 L34,-30 L56,-44"/>')
    if lanca and tipo != "pteros":
        add('<path d="M-40,-100 L80,30" stroke-width="5"/>')
        add('<path d="M-40,-100 l-6,-20 l18,12z" stroke-width="4"/>')
    if tipo in ("velocis", "voracis"):
        add('<path d="M-4,8 C-40,14 -70,6 -96,-10" stroke-width="7"/>')
    add("</g>")
    # cabeça
    add('<circle cx="2" cy="-78" r="16" stroke="none"/>')
    if tipo == "ceratops":
        add('<path d="M-22,-90 A26,26 0 0 1 26,-96 L22,-80 L-18,-76Z" stroke="none" opacity="0.85"/>')
        add('<path d="M10,-92 L30,-118 M-6,-92 L-16,-120" stroke-width="5" fill="none" stroke-linecap="round"/>')
    elif tipo == "velocis":
        add('<path d="M-8,-92 L-30,-110 M2,-94 L-8,-118 M12,-92 L16,-116" stroke-width="5" fill="none" stroke-linecap="round"/>')
    elif tipo == "voracis":
        add('<path d="M14,-80 L38,-74 L16,-70Z" stroke="none"/>')
        add('<path d="M56,-44 l10,-6 M56,-44 l12,0 M56,-44 l10,6" stroke-width="4" fill="none" stroke-linecap="round"/>')
    elif tipo == "pteros":
        add('<path d="M14,-82 L44,-90 L16,-74Z M-10,-88 L-34,-104" stroke-width="4" stroke-linecap="round"/>')
    add("</g>")


def mao(x, y, s=1.0, rot=0, negativa=True, cor=OCRE):
    forma = ('<path d="M-30,40 C-36,10 -40,-10 -34,-20 C-30,-26 -22,-22 -20,-14 L-18,-50 C-18,-60 -6,-60 -6,-50 L-4,-20 L-2,-70 '
             'C-2,-80 10,-80 10,-70 L10,-22 L14,-62 C14,-72 26,-72 26,-62 L24,-16 L32,-46 C34,-56 46,-52 44,-42 L34,0 '
             'C46,-6 58,-2 54,8 C40,22 30,40 24,56 C4,62 -18,58 -30,40Z"/>')
    tr = f'translate({x},{y}) rotate({rot}) scale({s})'
    if negativa:
        mid = f"m{rnd.randint(0, 99999)}"
        add(f'<mask id="{mid}"><rect x="-200" y="-200" width="400" height="400" fill="#fff" transform="{tr}"/>'
            f'<g transform="{tr}" fill="#000">{forma}</g></mask>')
        add(f'<g mask="url(#{mid})"><circle cx="{x}" cy="{y}" r="{95 * s:.0f}" fill="{cor}" opacity="0.65" filter="url(#spray)"/></g>')
    else:
        add(f'<g transform="{tr}" fill="{cor}" opacity="0.85">{forma}</g>')


def espiral(x, y, r, voltas=3, cor=AMARELO, esp=7, op=0.85):
    pts = []
    for i in range(0, int(voltas * 60)):
        a = i / 60 * math.tau
        rr = r * i / (voltas * 60)
        pts.append((x + math.cos(a) * rr, y + math.sin(a) * rr))
    add(f'<path d="M{" L".join(f"{a:.0f},{b:.0f}" for a, b in pts)}" stroke="{cor}" stroke-width="{esp}" fill="none" stroke-linecap="round" opacity="{op}"/>')


def sol(x, y, r, cor=AMARELO):
    add(f'<circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="{cor}" stroke-width="9" opacity="0.85"/>')
    add(f'<circle cx="{x}" cy="{y}" r="{r * .35:.0f}" fill="{cor}" opacity="0.85"/>')
    for k in range(12):
        a = k * math.tau / 12
        add(f'<line x1="{x + math.cos(a) * r * 1.25:.0f}" y1="{y + math.sin(a) * r * 1.25:.0f}" x2="{x + math.cos(a) * r * 1.7:.0f}" '
            f'y2="{y + math.sin(a) * r * 1.7:.0f}" stroke="{cor}" stroke-width="8" stroke-linecap="round" opacity="0.85"/>')


def pontos(x, y, n, cor=CAULIM, passo=22):
    for i in range(n):
        add(f'<circle cx="{x + i * passo}" cy="{y + rnd.uniform(-4, 4):.0f}" r="{rnd.uniform(5, 8):.1f}" fill="{cor}" opacity="0.8"/>')


def arvore_mae(x, y, s, cor=OCRE):
    add(g(x, y, s, 0, False, 0.85, cor))
    add('<g fill="none" stroke-width="10" stroke-linecap="round">')
    add('<path d="M0,120 L0,-40 M0,20 L-60,-30 M0,0 L60,-50 M0,-40 L-30,-100 M0,-40 L34,-110 M-60,-30 L-90,-60 M60,-50 L96,-70"/>')
    add('<path d="M0,120 L-40,150 M0,120 L40,152 M0,120 L-10,160 M0,120 L14,162"/>')
    add("</g>")
    for _ in range(26):
        a = rnd.uniform(math.pi * 1.05, math.pi * 1.95)
        rr = rnd.uniform(70, 150)
        add(f'<circle cx="{math.cos(a) * rr:.0f}" cy="{-40 + math.sin(a) * rr * .8:.0f}" r="{rnd.uniform(7, 12):.0f}" stroke="none" fill="{AMARELO}"/>')
    add("</g>")


def serpente_vulcao(x, y, s):
    add(g(x, y, s, 0, False, 0.9, CARVAO))
    add('<path stroke="none" d="M-150,120 L-30,-30 L30,-30 L150,120Z"/>')
    add("</g>")
    d = f"M{x},{y - 30 * s}"
    for k in range(8):
        d += f" Q{x + (40 if k % 2 == 0 else -40) * s},{y - (60 + k * 40) * s} {x},{y - (80 + k * 40) * s}"
    add(f'<path d="{d}" stroke="{BRASA}" stroke-width="{11 * s:.0f}" fill="none" stroke-linecap="round" opacity="0.92"/>')
    add(f'<circle cx="{x}" cy="{y - 400 * s:.0f}" r="{12 * s:.0f}" fill="{BRASA}"/>')
    add(f'<path d="M{x - 8 * s},{y - 410 * s} l-14,-16 M{x + 8 * s},{y - 410 * s} l14,-16" stroke="{BRASA}" stroke-width="5" fill="none"/>')


def marcas(x, y, n, cor=CARVAO):
    for i in range(n):
        add(f'<line x1="{x + i * 18}" y1="{y}" x2="{x + i * 18 + 4}" y2="{y + 46}" stroke="{cor}" stroke-width="7" stroke-linecap="round" opacity="0.8"/>')


add('<g filter="url(#pigmento)" style="mix-blend-mode:multiply">')

# centro (atrás dos painéis): manada esmaecida
lagarto_trovao(1150, 760, 1.25, op=0.28)
lagarto_trovao(1500, 820, 0.8, op=0.22, flip=True, cor=AMARELO)

# faixa de cima: pteros, sol e espirais (topo central livre para o título)
sol(260, 190, 54)
ptero(560, 150, 0.9, rot=-8)
ptero(760, 230, 0.6, rot=6)
ptero(870, 120, 0.45, rot=-4)
ptero(1840, 140, 0.8, flip=True, rot=5)
ptero(2020, 230, 0.55, flip=True, rot=-6)
espiral(2380, 190, 70)
pontos(1640, 250, 7)
pontos(700, 330, 9, cor=AMARELO)

# esquerda: mãos, árvore-mãe e a caçada dos thera aos deinonicos
mao(130, 520, 1.1, -12)
mao(250, 470, 0.9, 8)
mao(160, 690, 0.8, -25, negativa=False, cor=CARVAO)
mao(300, 640, 1.0, 14)
arvore_mae(470, 620, 1.0)
deinonico(130, 1010, 0.9, op=0.9)
deinonico(320, 960, 0.75, op=0.9)
cacador(470, 1020, 1.0, "velocis", flip=True, pose=1)
cacador(580, 990, 0.9, "ceratops", flip=True)
cacador(330, 820, 0.8, "pteros", flip=True, lanca=False)
marcas(60, 1120, 9)

# direita: rei tirano contra o ceratops-fera, e a serpente de Obassa no vulcão
rei_tirano(2230, 820, 1.25, flip=True, cor=OCRE)
ceratops_fera(1980, 1010, 0.8, cor=AMARELO)
cacador(2090, 1060, 0.9, "voracis", flip=False, pose=1, cor=CARVAO)
serpente_vulcao(2330, 520, 0.85)
espiral(2120, 470, 40, voltas=2.5, cor=OCRE2)
mao(2460, 1000, 0.9, 20)
mao(2400, 1120, 0.8, -10, negativa=False)

# faixa de baixo: procissão dos lagartos-trovão e caçadores
for i, x in enumerate(range(700, 1900, 230)):
    if i % 2 == 0:
        lagarto_trovao(x, 1300, 0.42, op=0.85, cor=OCRE if i % 4 == 0 else AMARELO)
    else:
        cacador(x, 1300, 0.6, ["ceratops", "velocis", "voracis", "pteros"][i % 4], pose=i % 2)
pontos(760, 1390, 40, cor=OCRE, passo=28)
add("</g>")

# luz das tochas, fuligem e vinheta
add(f'<rect width="{W}" height="{H}" fill="url(#tocha-e)" style="mix-blend-mode:screen"/>')
add(f'<rect width="{W}" height="{H}" fill="url(#tocha-d)" style="mix-blend-mode:screen"/>')
add(f'<rect width="{W}" height="{H}" fill="url(#fuligem)"/>')
add(f'<rect width="{W}" height="{H}" fill="url(#vinheta)"/>')
add("</svg>")
open(sys.argv[1], "w", encoding="utf-8").write("\n".join(o))
print("ok", len(o))
