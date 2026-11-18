#!/usr/bin/env python3
"""Gera questoes_biologia.json (simulado de Biologia, 50 questões) a partir de scripts/dados/biologia_50.py.

    python3 scripts/gerar_biologia.py

A letra da resposta correta é sorteada de forma equilibrada (10 de cada letra, A–E).
"""
import json
import pathlib
import random
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "scripts" / "dados"))
import biologia_50 as b  # noqa: E402

LETRAS = ["A", "B", "C", "D", "E"]
SERIE = "Biologia"


def main():
    itens = b.QUESTOES
    rnd = random.Random("biologia-50-v1")
    corretas = (LETRAS * (len(itens) // 5 + 1))[: len(itens)]
    rnd.shuffle(corretas)
    saida = []
    for n, (item, letra) in enumerate(zip(itens, corretas), start=1):
        mod, tema, dif, enun, ok, erradas, just = item
        assert len(erradas) == 4 and len(set(erradas + [ok])) == 5, (n, enun)
        outras = erradas[:]
        rnd.shuffle(outras)
        alternativas = {l: ok if l == letra else outras.pop() for l in LETRAS}
        saida.append({
            "uid": "BIO-%03d" % n, "serie": SERIE, "modulo": b.MODULOS[mod], "tema": tema,
            "dificuldade": dif, "enunciado": enun, "alternativas": alternativas,
            "resposta_correta": letra, "justificativa": just,
        })
    destino = RAIZ / "questoes_biologia.json"
    destino.write_text(json.dumps(saida, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    por = {}
    for q in saida:
        por.setdefault((q["modulo"], q["dificuldade"]), 0)
        por[(q["modulo"], q["dificuldade"])] += 1
    for k in sorted(por):
        print(k, por[k])
    print("Fáceis:", sum(q["dificuldade"] == "Fácil" for q in saida), "Médias:", sum(q["dificuldade"] == "Médio" for q in saida))
    print("Letras:", {l: sum(q["resposta_correta"] == l for q in saida) for l in LETRAS})
    print(len(saida), "questões gravadas em", destino.name)


if __name__ == "__main__":
    main()
