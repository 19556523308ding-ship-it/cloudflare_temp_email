"""Apply only to the supplied fork snapshot; refuse conflicting local changes."""
from pathlib import Path
import json, hashlib, shutil, sys, zipfile, datetime
bundle = Path(__file__).resolve().parent.parent
repo = Path(sys.argv[1]).resolve()
if not (repo / 'frontend/package.json').is_file():
    raise SystemExit('Target must be the fork repository root')
manifest = json.loads((bundle / 'source-manifest.json').read_text())
changes = []
for rel, meta in manifest.items():
    dest = repo / rel
    src = bundle / 'source-overlay' / rel
    if hashlib.sha256(src.read_bytes()).hexdigest() != meta['patched_sha256']:
        raise SystemExit('Damaged patch file: ' + rel)
    actual = hashlib.sha256(dest.read_bytes()).hexdigest() if dest.exists() else None
    if actual == meta['patched_sha256']:
        continue
    if actual != meta['original_sha256']:
        raise SystemExit('Local file differs; review manually before applying: ' + rel)
    changes.append(rel)
if not changes:
    print('Already applied; no changes needed')
    raise SystemExit(0)
backup = repo / ('mailfix-source-backup-' + datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f') + '.zip')
with zipfile.ZipFile(backup, 'x', zipfile.ZIP_DEFLATED) as z:
    for rel in changes:
        if (repo / rel).exists(): z.write(repo / rel, rel)
    z.writestr('new-files.json', json.dumps([r for r in changes if not (repo / r).exists()]))
for rel in changes:
    dest = repo / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(bundle / 'source-overlay' / rel, dest)
print('Applied', len(changes), 'files. Backup:', backup)
