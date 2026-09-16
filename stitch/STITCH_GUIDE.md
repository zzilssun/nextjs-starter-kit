# 🎨 Google Stitch AI UI 리디자인 및 3기둥 연동 가이드

본 문서는 **Google Stitch (`stitch.withgoogle.com`)** AI 디자인 도구를 활용하여 애플리케이션의 화면을 검토하고 리디자인할 때 준수해야 하는 **공식 표준 가이드라인**입니다.

---

## 🎯 1. 핵심 철학: 3기둥 하이브리드 리팩토링 (3-Pillar Hybrid Context)

Stitch AI에게 "새 화면을 만들어달라"고 단순 텍스트 프롬프트만 전달하면, 기존 기능 누락이나 허구적 요소(환각)가 반드시 발생합니다.
이를 방지하기 위해 다음 **3대 기둥(3-Pillar)**을 프롬프트 컨텍스트로 완전 통합 주입합니다:

```
┌─────────────────────────────────────────────────────────────┐
│                 3-PILLAR MULTIMODAL CONTEXT                 │
├──────────────────────────────┬──────────────────────────────┤
│ 1. 시각적 사실 (Visual)      │ Playwright Zero-Spinner 캡처본│
│ 2. 도메인 기획서 (Spec)      │ 화면 단위 기능/컬럼 Living Spec│
│ 3. 컴포넌트 뼈대 (Skeleton)  │ 순수 JSX 마크업 & Tailwind   │
└──────────────────────────────┴──────────────────────────────┘
```

1. **제1기둥: 시각적 닻 (Visual Ground Truth)**
   - 로컬 웹서버에서 Playwright를 통해 로딩 스피너/스켈레톤이 완전히 소멸(`waitForDataReady`)한 상태를 바닥까지 스크롤하여 캡처한 고해상도 Base Screen.
2. **제2기둥: 도메인 지능 (Domain Living Spec)**
   - `docs/designs/pages/[pageName]/index.md`에 문서화된 비즈니스 규칙, 테이블 컬럼 목록, 반응형 요구사항.
3. **제3기둥: 실제 DOM 뼈대 (Component JSX Skeleton)**
   - React TSX 컴포넌트 소스에서 비즈니스 로직(useState, 핸들러)을 정제한 순수 JSX 마크업 및 Tailwind 클래스.

---

## 🔄 2. 스티치-UI 양방향 라이프사이클 5단계 루틴

```
[ 루틴 1: 스티치 화면 사전 탐색 ]
  - 스티치 프로젝트에 대상 화면이 이미 존재하는지 확인
       │
[ 루틴 2: 3기둥 하이브리드 리팩토링 (screen.edit) ]
  - (1) 캡처 스크린샷 + (2) 마크다운 기획서 + (3) 컴포넌트 JSX 뼈대 주입
       │
[ 루틴 3: 산출물 다운로드 및 하네스 대조 검증 ]
  - HTML 다운로드 및 `npm run stitch:check <target>` 100점 감사
       │
[ 루틴 4: 로컬 React 컴포넌트 스킨 이식 ]
  - MVVM viewData 및 Server Actions 100% 보존하며 Tailwind 스타일만 이식
       │
[ 루틴 5: 스티치 역동기화 (Sync-Back) ]
  - 수정된 로컬 화면을 다시 캡처하여 스티치 캔버스에 업로드 (SSOT 유지)
```

---

## 📱 3. 모바일-퍼스트 반응형 보장 원칙

- **768px 미만 뷰포트**: 모바일 기기에서의 터치 친화적 사용성을 완벽히 보장합니다.
- **KPI 요약 카드**: 데스크톱 4열 와이드 그리드 ➔ 모바일 **2열 2행(2x2) 미니 컴팩트 그리드**.
- **테이블 ➔ 카드 뷰(Card View) 변환**: 가로 스크롤이 발생하는 데이터 테이블은 화면 폭 768px 미만에서 **개별 모바일 카드 리스트**로 변환합니다.

---

## 🧭 4. 주요 Stitch CLI 명령어

| 명령어                                    | 기능 및 설명                                                  |
| :---------------------------------------- | :------------------------------------------------------------ |
| **`npm run stitch`**                      | Google Stitch 클라우드 연결 상태 및 프로젝트 목록 조회        |
| **`npm run stitch init-project <title>`** | 신규 스티치 클라우드 프로젝트 생성 및 `.env` 설정 자동 갱신   |
| **`npm run stitch sync-design`**          | `DESIGN.md` 토큰을 스티치 디자인 시스템으로 동기화            |
| **`npm run stitch:capture <pageName>`**   | Playwright를 이용한 로컬 화면 풀페이지 스크린샷 캡처          |
| **`npm run stitch:flow <pageName>`**      | 탐색 ➔ 캡처 ➔ 3기둥 주입 ➔ AI 리팩토링 ➔ 다운로드 올인원 실행 |
| **`npm run stitch:skeleton <pageName>`**  | 대상 컴포넌트의 비즈니스 로직을 정제한 순수 JSX 뼈대 추출     |
| **`npm run stitch:sync-back <pageName>`** | 로컬 수정 화면을 다시 캡처하여 스티치 캔버스에 최신 동기화    |
| **`npm run stitch:check <pageName>`**     | 기획서 점수, 뼈대 무결성, 산출물 요소 100% 배치 감사          |
