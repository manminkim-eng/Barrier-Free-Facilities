# -*- coding: utf-8 -*-
"""매뉴얼 검사 — usage: python verify_manual.py <repoDir>
   ① 그림 파일·표시점(0~100%) ② 범례 수 = 표시점 수 ③ 예제 판정(_example.json)이 본문에 있음 ④ 내부 링크 ⑤ 앱 근거 표기 · 매뉴얼 단추 (편의시설판)"""
import sys, os, re, json
repo = sys.argv[1]; M = os.path.join(repo, 'manual'); ok = True
def chk(name, cond, info=''):
    global ok; ok &= bool(cond); print(('✓' if cond else '✗'), name, info)
h = open(os.path.join(M, 'index.html'), encoding='utf-8').read()
marks = json.load(open(os.path.join(M, 'images', '_marks.json'), encoding='utf-8'))
ex = json.load(open(os.path.join(M, '_tools', '_example.json'), encoding='utf-8'))
figs = re.findall(r'<figure class="shot[^"]*" id="fig-([^"]+)">(.*?)</figure>', h, re.S)
chk('그림 수 = 캡처 수', len(figs) == len(marks), f'{len(figs)}/{len(marks)}')
chk('그림 파일 존재', all(os.path.exists(os.path.join(M, 'images', k + '.webp')) for k in marks))
out = [f'{k}:{m["label"]}' for k, v in marks.items() for m in v['marks'] if 'x' not in m or m['x'] < 0 or m['y'] < 0 or m['x'] + m['w'] > 100.5 or m['y'] + m['h'] > 100.5]
chk('표시점이 이미지 안', not out, str(out[:5]))
bad = [sid for sid, body in figs if body.count('<li><b>') and body.count('<li><b>') != len(marks[sid]['marks'])]
chk('범례 수 = 표시점 수', not bad, str(bad))
need = [ex['A']['banner'], ex['B']['banner'], ex['C']['banner']] + [f['nm'] for f in ex['B']['FL'] if f['s'] == 'M']
miss = [n for n in need if n not in h]
chk('예제 판정이 본문에 있음', not miss, str(miss))
chk('예제 A 판정', ex['A']['banner'] == '의무 7 · 권장 4' and ex['A']['BF']['st'] == 'N')
chk('예제 B 판정', ex['B']['nM'] == 14 and ex['B']['BF']['st'] == 'Y')
chk('예제 C 대상 편입', ex['C']['J'][0]['inc'] == 'new' and any(f['k'] == 'parking' and f['s'] == 'X' for f in ex['C']['FL']))
ids = set(re.findall(r'id="([^"]+)"', h)); links = set(re.findall(r'href="#([^"]+)"', h))
chk('내부 링크', links <= ids, str(sorted(links - ids)[:5]))
app = open(os.path.join(repo, 'index.html'), encoding='utf-8').read()
chk('앱 — 시행본 표기', '2026.7.2. 시행본 기준' in app and '2026.1.2. 시행' in app and '2025.12.21. 시행' in app)
chk('앱 — 매뉴얼 단추', 'class="tb tb-manual"' in app and 'Barrier-Free-Facilities/manual/' in app and '매뉴얼은 인터넷 연결 시 열립니다' in app)
sw = open(os.path.join(repo, 'sw.js'), encoding='utf-8').read()
chk('SW — 매뉴얼 프리캐시 안 함', "'./manual" not in sw and '"./manual' not in sw and 'bff-v1.2.1' in sw)
sys.exit(0 if ok else 1)
