# 매뉴얼 생성 도구 (장애인 편의시설 설치기준 검토)

| 파일 | 하는 일 |
|---|---|
| `build.sh <repo> <raw>` | 캡처 → WebP → HTML → PDF → 검증을 한 번에 |
| `capture_bff.js` | 앱 화면 27장 캡처, 번호 표시점(`_marks.json`) · 예제 A · B · C 판정(`_example.json`) 기록 (1440×900, 배율 1.25, 날짜 고정 2026-11-09) |
| `serve.js` | 로컬 서버 (Windows 실행판 — CDN 통과) |
| `gen_manual_bff.py` · `manual_engine.py` | 매뉴얼 본문 → `manual/index.html` (예제 판정은 `_example.json`에서 읽음) |
| `pdf_bff.js` | A4 PDF |
| `verify_bff_judge.js` | 시행령 별표 2 원문 49행 × 19열 · 별표 1 규모 하한 · 비고 규모 ↔ 앱 데이터, 경계값 · 비고 × 공사 구분 · 6층 2천㎡ · 주차 10대 판정 126건 |
| `verify_manual.py` | 그림 · 표시점 · 범례 수, 예제 판정, 내부 링크, 앱 근거 표기 · 매뉴얼 단추 검사 |
| `audit_responsive.js` | 매뉴얼 좁은 화면 점검(360 · 390 · 480 · 760 · 1024px) |

환경 변수: `MM_PW`(playwright 모듈 경로) · `NODE` · `PY` · `MANUAL_DIR`

이 PC(Windows) 실행 예:
`MM_PW=C:/Users/user/miniconda3/Lib/site-packages/playwright/driver/package NODE=/c/Users/user/miniconda3/Lib/site-packages/playwright/driver/node.exe bash build.sh ../.. <임시폴더>`

법령이 바뀌면 ① 앱 `index.html`의 별표 데이터 · 근거 표기를 고치고 ② `verify_bff_judge.js`의 원문 표와 `gen_manual_bff.py`의 4장을 고친 뒤 ③ `build.sh`를 다시 돌린다.
