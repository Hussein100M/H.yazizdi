import os, re, subprocess, json, sys
src, dst = sys.argv[1], sys.argv[2]
CAT = {'Camera_Shutters':'shutter','Clicks':'click','Data_Collect_':'data','Gear':'gear','Money_':'money','Pop':'pop','Risers':'riser','Ui_Sound_Effects_':'ui','Whooshes_':'whoosh'}
ALIAS = {'meadia_pop':'media_pop','high_and_fast_woosh':'high_and_fast_woosh'}
cat = []
for top, c in CAT.items():
    files = []
    for root, _, fs in os.walk(os.path.join(src, top)):
        for f in fs:
            if f.lower().endswith(('.wav','.mp3','.wma')): files.append(os.path.join(root, f))
    files.sort(key=lambda p: (os.path.basename(p).startswith(' ') , p))
    os.makedirs(os.path.join(dst, c), exist_ok=True); used = set()
    for p in sorted(files, key=lambda p: (os.path.splitext(p)[1] != '.wav', os.path.basename(p).strip().lower(), p)):
        n = re.sub(r'[^a-z0-9]+', '_', os.path.splitext(os.path.basename(p))[0].strip().lower()).strip('_')
        n = ALIAS.get(n, n); base = n; k = 2
        while n in used: n = f'{base}_{k}'; k += 1
        used.add(n); out = os.path.join(dst, c, n + '.wav')
        subprocess.run(['ffmpeg','-v','error','-y','-i',p,'-af','silenceremove=start_periods=1:start_threshold=-50dB','-ar','48000','-ac','2','-c:a','pcm_s16le',out], check=True)
        d = float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',out],capture_output=True,text=True).stdout)
        cat.append({'file': f'{c}/{n}', 'src': os.path.relpath(p, src), 'dur': round(d, 2)})
json.dump(cat, open(os.path.join(dst, 'catalog.json'), 'w'), indent=1, ensure_ascii=False)
for e in cat: print(f"{e['file']:45s} {e['dur']:6.2f}s  <- {e['src']}")
