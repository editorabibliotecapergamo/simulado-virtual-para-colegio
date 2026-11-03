#!/usr/bin/env python3
"""Extrai as questões do banco_questoes_simulado.html para questoes.json.

Rode de novo sempre que o banco de questões for atualizado:
    python3 scripts/extrair_questoes.py
"""
import json
import pathlib
import random
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / "banco_questoes_simulado.html"
DESTINO = RAIZ / "questoes.json"

CAMPOS = ["uid", "serie", "modulo", "tema", "dificuldade",
          "enunciado", "alternativas", "resposta_correta", "justificativa"]


LETRAS = ["A", "B", "C", "D", "E"]


def questoes_dos_cadernos():
    """Questões baseadas nos textos do Caderno do 4º bimestre (scripts/dados/cadernos_4bim.py).

    Para as séries presentes nesse arquivo, elas SUBSTITUEM as questões do banco original.
    A letra da resposta correta é distribuída de forma equilibrada entre A e E.
    """
    sys.path.insert(0, str(RAIZ / "scripts" / "dados"))
    try:
        import cadernos_4bim as c4
    except ImportError:
        return {}
    por_serie = {}
    for item in c4.QUESTOES:
        por_serie.setdefault(item[0], []).append(item)

    resultado = {}
    for serie, itens in por_serie.items():
        rnd = random.Random("caderno-4bim-" + serie)
        corretas = (LETRAS * (len(itens) // 5 + 1))[: len(itens)]
        rnd.shuffle(corretas)
        saida = []
        for n, (item, letra) in enumerate(zip(itens, corretas), start=1):
            _, mod, tema, dif, enun, ok, erradas, just = item
            assert len(erradas) == 4, (serie, mod, enun)
            outras = erradas[:]
            rnd.shuffle(outras)
            alternativas = {}
            for l in LETRAS:
                alternativas[l] = ok if l == letra else outras.pop()
            saida.append({
                "uid": "%sC4-%03d" % (serie[0], n),
                "serie": serie,
                "modulo": c4.MODULOS[serie][mod],
                "tema": tema,
                "dificuldade": dif,
                "enunciado": enun,
                "alternativas": alternativas,
                "resposta_correta": letra,
                "justificativa": just,
            })
        resultado[serie] = saida
    return resultado


def main():
    texto = ORIGEM.read_text(encoding="utf-8")
    linha = next(l for l in texto.splitlines() if "const BANCO_COMPLETO" in l)
    dados = json.loads(linha.split("=", 1)[1].strip().rstrip(";"))
    questoes = [{c: q[c] for c in CAMPOS} for q in dados]

    novas = questoes_dos_cadernos()
    if novas:
        questoes = [q for q in questoes if q["serie"] not in novas]
        for serie in sorted(novas):
            questoes.extend(novas[serie])
            print("%s: %d questões do caderno do 4º bimestre" % (serie, len(novas[serie])))
    DESTINO.write_text(json.dumps(questoes, ensure_ascii=False, separators=(",", ":")),
                       encoding="utf-8")
    print(f"{len(questoes)} questões gravadas em {DESTINO.name}")


if __name__ == "__main__":
    main()
