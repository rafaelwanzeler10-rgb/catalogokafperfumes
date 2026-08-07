# KAF Perfumes - Cloudflare Pages

Este site é estático e está pronto para Cloudflare Pages.

## Publicação

Use a pasta `site` como raiz do projeto publicado.

- Build command: deixe em branco
- Build output directory: `/`
- Framework preset: None

Também é possível publicar por upload direto enviando todo o conteúdo da pasta `site`.

## Atualização do catálogo

Sempre que o catálogo principal mudar, rode na raiz do projeto:

```powershell
python build_site_data.py
```

Depois publique novamente a pasta `site` no Cloudflare Pages.
