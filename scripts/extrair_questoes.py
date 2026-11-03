#!/usr/bin/env python3
"""Extrai as questões do banco_questoes_simulado.html para questoes.json.

Rode de novo sempre que o banco de questões for atualizado:
    python3 scripts/extrair_questoes.py
"""
import json
import pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / "banco_questoes_simulado.html"
DESTINO = RAIZ / "questoes.json"

CAMPOS = ["uid", "serie", "modulo", "tema", "dificuldade",
          "enunciado", "alternativas", "resposta_correta", "justificativa"]


def main():
    texto = ORIGEM.read_text(encoding="utf-8")
    linha = next(l for l in texto.splitlines() if "const BANCO_COMPLETO" in l)
    dados = json.loads(linha.split("=", 1)[1].strip().rstrip(";"))
    questoes = [{c: q[c] for c in CAMPOS} for q in dados]
    DESTINO.write_text(json.dumps(questoes, ensure_ascii=False, separators=(",", ":")),
                       encoding="utf-8")
    print(f"{len(questoes)} questões gravadas em {DESTINO.name}")


if __name__ == "__main__":
    main()
