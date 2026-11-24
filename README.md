# Baús Reforçados

Mod **oficial** do [MineClaude](https://mineclaude.com). Id `baus_reforcados`, versão `0.1.0`. Repositório público.

Este mod **vem junto** com o servidor oficial: quem joga em https://mineclaude.com já tem ele. Este
repositório é para quem hospeda o próprio servidor, ou quer ler como ele é feito.

> Num servidor que já traz este mod como **pasta** na `MODS_DIR` (`mods/baus_reforcados/`), não ponha o
> `.mcmod` do lado: seriam dois mods com o id `baus_reforcados`. Use um ou o outro.

## O que ele faz

Baús maiores em três níveis (ferro 54, ouro 81, diamante 108 slots) e kits que melhoram um baú já colocado sem tirar os itens. Inspirado na mecânica de baús em níveis; arte e código originais, pintados por código.

## Instalar

Baixe o `.mcmod` da [última Release](../../releases/latest) e escolha um caminho:

- **Pasta de mods:** ponha o arquivo **`baus_reforcados.mcmod`** (o nome importa: o servidor exige que seja o id do mod) na `MODS_DIR` do servidor e reinicie. A Release traz esse nome pronto, ao lado da cópia com a versão no nome.
- **No jogo:** `/mod previa <link do .mcmod>`, ou a tela **Mods**.

Lado: servidor + navegador.

## Montar e empacotar aqui

Só precisa do [Bun](https://bun.sh) — nada do repositório do jogo:

```
bun tools/pack.mjs
```

Sai um `baus_reforcados-0.1.0.mcmod` determinístico (mesma entrada, mesmos bytes).

## Publicar uma versão

Suba a `version` no `package.json`, comite, e marque:

```
git tag v0.1.0 && git push origin v0.1.0
```

O workflow `.github/workflows/release.yml` monta, empacota e cria a Release com o `.mcmod` anexado.

## Arte

Arte 100% original, pintada por código.
