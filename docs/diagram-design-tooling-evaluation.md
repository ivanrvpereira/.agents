# Diagram Design: tooling evaluation

## Decision

Adopt only as a pinned, reviewed skill copy, not as a trusted HTML sanitizer or a complete validation toolchain.
The packaged Python tools need no third-party dependencies, but the validators have concrete gaps.
No installation, configuration change, upstream edit, dependency download, or browser execution occurred in this evaluation.

Scope: cached checkout `/Users/ivanpereira/.cache/checkouts/github.com/cathrynlavery/diagram-design`, commit `562dbdf93ff3c3da630be4f90f4f6c2548175058`.
`git rev-parse HEAD` matched that commit, and the initial `git status --short` was empty.
This note excludes the parent evaluator's design, typography, responsive-layout, and SVG-export findings.
All links below pin the inspected commit.

## Safety and execution

1. **Small packaged execution surface.** The skill contains three import extractors and `self_check.py`, all using Python's standard library. They parse local files without a subprocess, browser, or network client. Mermaid bounds input to 4 MiB and limits nodes/edges. Excalidraw bounds input to 16 MiB, rejects non-finite geometry, and discards links and embedded payloads. Draw.io rejects DTD/entity declarations and bounds decompression. These are meaningful defenses, not just README claims. Sources: [Mermaid lines 20–49, 218–235](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/skills/diagram-design/scripts/mermaid_extract.py#L20-L49), [Excalidraw lines 24–42, 144–206](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/skills/diagram-design/scripts/excalidraw_extract.py#L144-L206), [draw.io lines 42–94](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/skills/diagram-design/scripts/drawio_extract.py#L42-L94). Extractor `--out` paths use `write_text`, so they overwrite existing output without confirmation. Escaped labels remain untrusted semantic content for an AI reader.
2. **Self-check is not a security boundary.** All 160 shipped example/template HTML files passed. The adversarial suite also passed. However, an otherwise valid file with `<meta http-equiv="refresh" content="0;url=https://example.invalid/">` returned no errors. A local `<img src="../private.png">` also passed. SVG `<set>` with a remote `to` value passed because that attribute is outside the reference list. These are confirmed validator acceptances, not browser exploit demonstrations. The parser checks selected attributes and four forbidden tags, rather than an allowlist of inert HTML/SVG. Sources: [`self_check.py` lines 51–59, 86–102](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/skills/diagram-design/scripts/self_check.py#L51-L102), [reference handling lines 212–232](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/skills/diagram-design/scripts/self_check.py#L212-L232).
3. **Import correctness needs more than passing fixtures.** A three-level draw.io hierarchy with local x coordinates 10, 20, 30 produced absolute coordinates 10, 30, 70, instead of 10, 30, 60. The resolver reuses parent coordinates after earlier iterations mutate them to absolute coordinates. Source: [`drawio_extract.py` parent resolution](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/skills/diagram-design/scripts/drawio_extract.py#L463-L483). Source geometry therefore needs review before redraw. The three extractors' full source was inspected, but only the listed fixture smoke checks and this focused reproduction ran.
4. **Maintainer tooling has a different trust level.** `build-icons.py` uses vendored SVGs first, but missing files trigger HTTPS downloads from mutable branches/CDNs, without checksums. The normalizers preserve SVG bodies rather than sanitize active content. The builder writes the cache and generated assets. It is unnecessary for installed-skill use and was not run. Sources: [URLs lines 47–52](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/scripts/build-icons.py#L47-L52), [fetch/normalization lines 177–237](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/scripts/build-icons.py#L177-L237), [cache fallback lines 389–428](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/scripts/build-icons.py#L389-L428). Direct-fetch icons explicitly say “verify license before use.”

## Validation: real strengths and limits

- **Adversarial checks exist.** `test-self-check.py` exercises event attributes, remote images, CSS escapes/loaders, font-host lookalikes, scripts, accessibility, and motion mutations. Exact controller matching is stronger than a permissive script heuristic. However, these tests cover selected strings, not all browser parsing and navigation behavior. Sources: [tests lines 57–262](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/scripts/test-self-check.py#L57-L262), [controller enforcement lines 314–341](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/skills/diagram-design/scripts/self_check.py#L314-L341).
- **Repository CI is substantially broader than the packaged self-check.** It declares Linux/macOS/Windows with Python 3.11/3.12, import checks, mutation tests, chart-specific checks, and a rendered-layout gate. Its Python 3.9 job covers only accessibility/skin checks, not the complete skill. The skin invocation uses a legacy baseline. These are workflow definitions, not verified CI outcomes for this commit. Source: [`.github/workflows/ci.yml`](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/.github/workflows/ci.yml#L65-L170).
- **Render checks inspect pixels, but do not certify output.** `lint-render.py` compares screenshots with staged overflow release and includes adversarial fixtures. It blocks network through resolver rules plus request routing. It still runs contributor JavaScript, permits local-file/data/blob requests, and omits galleries from its general sweep. CI runs it on one Linux/Python leg, without `--fonts`, so it does not prove actual remote-font geometry. Documented limits include roughly 2px spill and scrolling ancestors. Sources: [algorithm/limits lines 9–65](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/scripts/lint-render.py#L9-L65), [selection/isolation lines 284–341](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/scripts/lint-render.py#L284-L341). This tool was inspected selectively, not run.
- **Gate names overstate generality.** `verify-geometry.py` recognizes only rectangles with a specific double-quoted x/y/width/height attribute order, then applies size and paint-order heuristics. It is not general label-fit validation. Screenshot freshness compares committed source/image hashes, dimensions, and metadata, not a fresh render against the image. Sources: [geometry lines 43–95](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/scripts/verify-geometry.py#L43-L95), [freshness lines 75–92](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/scripts/verify-screenshot-freshness.py#L75-L92).

## Dependencies and plugin packaging

Claude, Codex, and Factory manifests identify version `2.6.21` and contain no hooks, MCP servers, or install commands.
Codex points to `./skills/` and declares interface capabilities `Read` and `Write`. These metadata values are not a runtime sandbox.
The package verifier checks synchronized identity/version, local marketplace path containment, packaged skill presence, and command presence.
Its current-tree validation passed, but no host installation or host command discovery was tested.
Sources: [Claude manifest](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/.claude-plugin/plugin.json), [Codex manifest](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/.codex-plugin/plugin.json#L28-L42), [Factory manifest](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/.factory-plugin/plugin.json), [package containment lines 113–135](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/scripts/verify-plugin-package.py#L113-L135).

A shared-skill copy includes the four packaged scripts, but not repository-root validators, commands, prompts, or CI.
PNG export requires separate Playwright/Chromium installation. Its procedure explicitly forbids automatic installation, but its browser snippet has no network isolation.
CI pins Playwright `1.62.0`, Pillow `12.1.1`, and Claude Code `2.1.229` versions, but not dependency artifact hashes. Ordinary CI actions use version tags.
Sources: [export detection and rasterization](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/skills/diagram-design/references/export.md#L75-L118), [CI](https://github.com/cathrynlavery/diagram-design/blob/562dbdf93ff3c3da630be4f90f4f6c2548175058/.github/workflows/ci.yml).

## Checks performed

The local interpreter was Python `3.13.15`. Bytecode writes were disabled. Temporary files from the upstream self-check tests were confined to temporary directories.

Exact standalone commands:

```sh
git -C /Users/ivanpereira/.cache/checkouts/github.com/cathrynlavery/diagram-design rev-parse HEAD
git -C /Users/ivanpereira/.cache/checkouts/github.com/cathrynlavery/diagram-design status --short
PYTHONDONTWRITEBYTECODE=1 python3 /Users/ivanpereira/.cache/checkouts/github.com/cathrynlavery/diagram-design/scripts/test-self-check.py
PYTHONDONTWRITEBYTECODE=1 python3 /Users/ivanpereira/.cache/checkouts/github.com/cathrynlavery/diagram-design/scripts/verify-plugin-package.py --current-only
```

Results: matching commit, clean initial status, `All self-check tests passed`, and `OK plugin package (current tree): Claude, Codex, and Factory 2.6.21, marketplace paths, and packaged skill`.

The following exact Python payload ran through `PYTHONDONTWRITEBYTECODE=1 python3 -c` for focused validator checks:

```python
import importlib.util, pathlib, sys; root=pathlib.Path("/Users/ivanpereira/.cache/checkouts/github.com/cathrynlavery/diagram-design"); p=root/"skills/diagram-design/scripts/self_check.py"; spec=importlib.util.spec_from_file_location("self_check",p); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m); base=(root/"skills/diagram-design/assets/example-architecture.html").read_text(); cases={"meta-refresh": "<meta http-equiv=\"refresh\" content=\"0;url=https://example.invalid/\">", "local-image":"<img src=\"../private.png\">", "remote-srcset-second-entry":"<img srcset=\"local.png 1x, https://example.invalid/x.png 2x\">", "svg-animation-url":"<svg aria-hidden=\"true\"><a id=\"x\"><text>x</text></a><set href=\"#x\" attributeName=\"href\" to=\"https://example.invalid/\" /></svg>"}; print("Python",sys.version.split()[0]);
for name,markup in cases.items():
 source=base.replace("<body>","<body>"+markup,1); candidate=type("Source",(),{"read_text":lambda self,**kw:source})(); print(name,m.verify(candidate))
assets=sorted((root/"skills/diagram-design/assets").glob("*.html")); selected=[p for p in assets if p.name.startswith(("example-","template"))]; failures=[(p.name,m.verify(p)) for p in selected if m.verify(p)]; print("asset sweep",len(selected),"failures",failures)
```

Results: meta-refresh, local-image, and svg-animation-url returned `[]`. The remote srcset case was rejected. The asset sweep reported `160 failures []`.

The following exact Python payload ran through `PYTHONDONTWRITEBYTECODE=1 python3 -c` for extractor smoke checks and nested-coordinate reproduction:

```python
import importlib.util,json,pathlib,subprocess,sys; root=pathlib.Path("/Users/ivanpereira/.cache/checkouts/github.com/cathrynlavery/diagram-design");
for kind,fixture in [("drawio","sample-architecture.drawio"),("mermaid","sample-flowchart.mmd"),("mermaid","sample-adversarial.mmd"),("excalidraw","sample-whiteboard.excalidraw"),("excalidraw","sample-adversarial.excalidraw")]:
 r=subprocess.run([sys.executable,"-B",str(root/f"skills/diagram-design/scripts/{kind}_extract.py"),str(root/"scripts/fixtures"/fixture),"--json"],capture_output=True,text=True,timeout=10); payload=json.loads(r.stdout) if r.returncode==0 else {}; print(fixture,"exit",r.returncode,"valid JSON",bool(payload))
spec=importlib.util.spec_from_file_location("drawio",root/"skills/diagram-design/scripts/drawio_extract.py"); m=importlib.util.module_from_spec(spec);sys.modules[spec.name]=m;spec.loader.exec_module(m);xml="<diagram><mxGraphModel><root><mxCell id=\"a\" vertex=\"1\"><mxGeometry x=\"10\" y=\"0\"/></mxCell><mxCell id=\"b\" vertex=\"1\" parent=\"a\"><mxGeometry x=\"20\" y=\"0\"/></mxCell><mxCell id=\"c\" vertex=\"1\" parent=\"b\"><mxGeometry x=\"30\" y=\"0\"/></mxCell></root></mxGraphModel></diagram>";page=m.parse_page(m.ET.fromstring(xml),0);print("nested local x=10,20,30: expected absolute x=10,30,60; actual",[(n.id,n.x) for n in page.nodes])
```

All five fixtures exited 0 and produced valid JSON. The nested-coordinate output was `[('a', 10.0), ('b', 30.0), ('c', 70.0)]`.

Limitations: no broad upstream test suite, browser isolation test, host plugin installation, dependency vulnerability scan, or CI-result verification ran.
The successful fixture checks establish execution and JSON output only, not complete semantic preservation.
Recommended adoption boundary: retain a pinned copy, preserve license notices, review import output, and render generated HTML only in an isolated browser.
