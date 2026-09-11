# 코코단 팀 페이지 — 인물 소개 교체 버전

3팀 랜딩페이지(https://ghlee050505-web.github.io/3-Team/)를 바탕으로,
**"02 침입자 DB" 인물 소개 섹션만** 코코단 캐릭터 장면으로 바꾼 버전입니다.
나머지 섹션(침입 인트로 · 영상 · 능력치 · 작전 파일 · 속보 · 투표)은 원본 그대로입니다.

## 바뀐 부분
- 팀원 3명이 한 명씩 화면 전체로 등장합니다.
  - 01 아메드 — 빠른 슬라이드
  - 02 김동규 — 카메라 줌 (LOCKED)
  - 03 이가현 — 플래시 + 도장
- 인물 소개는 `<kkd-crew>` 태그 하나로 들어가며, 내용은 Shadow DOM 안에 그려져
  팀 페이지(React 기반)와 서로 간섭하지 않습니다.

## 파일
| 파일 | 설명 |
|---|---|
| `index.html` | 팀 페이지 원본에서 인물 소개 섹션만 `<kkd-crew>`로 교체 |
| `support.js` | 팀 페이지 원본 런타임 (수정 없음) |
| `kkd-crew/crew.js` | 인물 소개 섹션 — 팀원 정보는 `===== TEAM INFORMATION =====` 에서 수정 |
| `kkd-crew/crew.css` | 인물 소개 섹션 디자인 |
| `assets/` | `ahmed.png`, `dongkyu.png`, `gahyun.png` 를 넣으면 실루엣 대신 사진 표시 |

## 로컬에서 보기
```bash
python -m http.server 8000
```
브라우저에서 `http://localhost:8000` 을 엽니다.
