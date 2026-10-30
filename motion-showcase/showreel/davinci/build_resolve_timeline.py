# Builds the H.yazidi showreel edit inside DaVinci Resolve from the files in this folder:
# a 1080x1920 / 30 fps project, the six scene clips on V1, music on A1, SFX on A2,
# a marker per chapter, and the showreel LUT on every clip.
#
# Run it inside Resolve (the free version runs scripts from inside the app):
#   Workspace > Console > Py3, then paste (with your own path):
#     exec(open(r"C:\path\to\davinci\build_resolve_timeline.py", encoding="utf-8").read())
# If the folder isn't found automatically, put its full path in FOLDER below.
import os, shutil, sys

FOLDER = r""
PROJECT = "H.yazidi Showreel"
TIMELINE = "Showreel 9x16"
CLIPS = ["00_Hook.mp4", "01_Promo_Film.mp4", "02_Masterplan.mp4", "03_Infographics.mp4", "04_Construction.mp4", "05_Closing.mp4"]
MUSIC, SFX, MIX, GRADED = "Audio_1_Music_Bed.wav", "Audio_2_SFX.wav", "Audio_3_Final_Mix.wav", "Showreel_Graded_9x16.mp4"
LUT = "H_yazidi_Showreel_Look.cube"
MARKERS = [(0, "Orange", "Hook", "مشاريعك تستاهل أكثر من عرض ثابت"),
           (114, "Blue", "01 Promo Film", "فيديو ترويجي للمشروع"),
           (258, "Green", "02 Masterplan", "عرض الماستر بلان"),
           (396, "Purple", "03 Infographics", "إنفوجرافيك هندسي"),
           (528, "Yellow", "04 Construction", "توثيق مراحل التنفيذ"),
           (645, "Red", "Closing / CTA", "مشاريعك… بلغة الحركة")]


def folder():
    cands = [FOLDER] if FOLDER else []
    try:
        cands.append(os.path.dirname(os.path.abspath(__file__)))
    except NameError:
        pass
    cands.append(os.getcwd())
    for c in cands:
        if c and os.path.isfile(os.path.join(c, CLIPS[0])):
            return c
    sys.exit("Showreel files not found. Set FOLDER at the top of the script to the davinci folder path.")


def get_resolve():
    g = globals()
    if g.get("resolve"):
        return g["resolve"]
    if g.get("bmd"):
        return g["bmd"].scriptapp("Resolve")
    import DaVinciResolveScript as dvr
    return dvr.scriptapp("Resolve")


D = folder()
resolve = get_resolve()
pm = resolve.GetProjectManager()
proj = pm.CreateProject(PROJECT)
if not proj:  # already exists: open it and build a fresh timeline name
    proj = pm.LoadProject(PROJECT)
    TIMELINE += " (new)"
for k, v in (("timelineResolutionWidth", "1080"), ("timelineResolutionHeight", "1920"),
             ("timelineFrameRate", "30"), ("timelinePlaybackFrameRate", "30")):
    if not proj.SetSetting(k, v):
        print("note: could not set", k, "- check Project Settings > Master Settings")

mp = proj.GetMediaPool()
bin_ = mp.AddSubFolder(mp.GetRootFolder(), "H.yazidi Showreel")
if bin_:
    mp.SetCurrentFolder(bin_)
items = mp.ImportMedia([os.path.join(D, f) for f in CLIPS + [MUSIC, SFX, MIX, GRADED]]) or []
by_name = {it.GetName(): it for it in items}
missing = [f for f in CLIPS + [MUSIC, SFX] if f not in by_name]
if missing:
    sys.exit("could not import: " + ", ".join(missing))

tl = mp.CreateEmptyTimeline(TIMELINE)
proj.SetCurrentTimeline(tl)
video = mp.AppendToTimeline([by_name[f] for f in CLIPS]) or []
start = tl.GetStartFrame()

# audio: music on A1, SFX on A2, both from the first frame
try:
    tl.AddTrack("audio", "stereo")
except Exception:
    pass
placed = []
for name, track in ((MUSIC, 1), (SFX, 2)):
    res = mp.AppendToTimeline([{"mediaPoolItem": by_name[name], "trackIndex": track, "recordFrame": start, "mediaType": 2}]) or []
    placed += res
if not placed or any(it.GetStart() != start for it in placed):
    print("note: drag", MUSIC, "to A1 and", SFX, "to A2 at the start of the timeline (this Resolve version ignored the placement)")

for frame, color, name, note in MARKERS:
    tl.AddMarker(frame, color, name, note, 1)

# LUT: copy into Resolve's master LUT folder so Resolve can find it, then put it on node 1 of every clip
lut_src, lut_ok = os.path.join(D, LUT), False
for lut_dir in (r"C:\ProgramData\Blackmagic Design\DaVinci Resolve\Support\LUT",
                "/Library/Application Support/Blackmagic Design/DaVinci Resolve/LUT",
                os.path.expanduser("~/.local/share/DaVinciResolve/LUT")):
    if os.path.isdir(lut_dir):
        try:
            dst = os.path.join(lut_dir, "H.yazidi", LUT)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copyfile(lut_src, dst)
            proj.RefreshLUTList()
            lut_ok = all(it.SetLUT(1, dst) for it in video)
        except Exception as e:
            print("note: LUT copy failed:", e)
        break
if not lut_ok:
    print("note: apply the LUT by hand: Color page > node 1 > right-click > LUTs > H.yazidi >", LUT,
          "(copy it first via Project Settings > Color Management > Open LUT Folder, then Update Lists)")

print("done:", PROJECT, "/", TIMELINE, "-", len(video), "clips,", len(placed), "audio tracks, LUT", "applied" if lut_ok else "NOT applied")
