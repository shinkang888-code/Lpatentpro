# 특허 명세서 자동화 시스템 v1.0

> 새로운 발명 내용만 입력하면 KIPO/USPTO 제출용 Word 파일을 자동 생성합니다.

---

## 빠른 시작 (3단계)

### 1단계: 발명 내용 JSON 작성
```
config/invention_input_template.json  ← 이 파일을 복사해서 수정
```

예시: `config/my_ai_patent.json` 로 저장

### 2단계: 실행
```powershell
cd c:\cursor\Lpatentdoc\patent_auto
python main.py --input config/my_ai_patent.json
```

### 3단계: 출력 확인
```
output/
├── [발명명칭]_KIPO_출원완성본_YYYYMMDD.docx   ← 한국 제출용
├── [발명명칭]_USPTO_Final_YYYYMMDD.docx       ← 미국 제출용
├── drawings_ko/  ← 한국어 도면 PNG
└── drawings_en/  ← 영문 도면 PNG
```

---

## 전체 옵션

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `--input` | 템플릿 JSON | 발명 내용 JSON 파일 경로 |
| `--output` | `output/` | 결과 저장 디렉토리 |
| `--ai` | `none` | AI 생성: `claude` / `openai` / `none` |
| `--key` | (환경변수) | API 키 직접 입력 |
| `--office` | `both` | `KIPO` / `USPTO` / `both` |
| `--skip-drawing` | False | 도면 생성 건너뜀 (빠른 테스트) |
| `--no-verify` | False | 검증 단계 건너뜀 |

### 사용 예시
```powershell
# 기본 실행 (템플릿 기반)
python main.py

# 내 발명 파일로 실행
python main.py --input config/my_invention.json

# Claude AI로 섹션 자동 생성
python main.py --input config/my_invention.json --ai claude --key sk-ant-xxx

# 한국 출원만 생성 (빠르게)
python main.py --input config/my_invention.json --office KIPO --skip-drawing

# OpenAI로 생성
python main.py --ai openai --key sk-xxx
```

---

## AI API 연동 방법 (선택사항)

AI 없이도 동작하지만, API 연동 시 각 섹션을 전문 변리사 수준으로 자동 생성합니다.

### Claude (권장)
```powershell
# 환경 변수 설정 (PowerShell)
$env:CLAUDE_API_KEY = "sk-ant-api03-xxxx"

# 또는 실행 시 직접 입력
python main.py --ai claude --key sk-ant-api03-xxxx
```

### OpenAI
```powershell
$env:OPENAI_API_KEY = "sk-xxxx"
python main.py --ai openai
```

---

## JSON 입력 파일 구조

```json
{
  "meta": {                          // 출원인 정보
    "applicant_ko": "회사명",
    "applicant_en": "Company Inc.",
    "inventor": "발명자 이름",
    "ipc_codes": ["G06F 3/00"],
    "filing_date": "2026-06-24"
  },
  "invention": {                     // 발명 핵심 내용
    "title_ko": "한국어 발명 제목",
    "title_en": "ENGLISH TITLE",
    "technical_field_ko": "기술분야",
    "problem_statement": [...],       // 기존 기술 문제점 목록
    "prior_art": [...],               // 선행특허 목록
    "components": [...],              // 구성요소 목록 (참조번호, 명칭, 설명)
    "algorithms": [...],              // 핵심 알고리즘 (의사코드)
    "mathematical_formulas": [...],   // 수학식
    "effects": [...]                  // 발명 효과 목록
  },
  "claims": [...],                   // 청구항 목록 (독립항/종속항)
  "drawings": [...],                 // 도면 목록 (블록도/흐름도/시퀀스)
  "abstract_ko": "...",              // 한국어 요약
  "abstract_en": "..."               // 영문 요약
}
```

---

## 시스템 구조

```
patent_auto/
├── main.py                      ← 실행 진입점
├── config/
│   └── invention_input_template.json  ← 입력 템플릿
├── generators/
│   ├── spec_generator.py        ← AI 기반 명세서 섹션 생성
│   ├── drawing_generator.py     ← 도면 자동 생성 (matplotlib)
│   └── document_builder.py      ← Word 문서 조립 (python-docx)
├── verifiers/
│   └── compliance_checker.py    ← KIPO/USPTO 양식 자동 검증
└── output/                      ← 생성 결과물
```

---

## 검증 항목

### KIPO (특허법 제42조)
- 필수 섹션: 기술분야, 배경기술, 과제, 해결수단, 효과, 도면설명, 실시예, 청구범위, 요약서
- 단락번호 [0001] 형식 확인
- 청구항 1 존재 확인
- 도면 참조 (도 1) 확인

### USPTO (37 CFR 1.77)
- 필수 섹션: TITLE, CROSS-REFERENCE, FIELD, BACKGROUND, SUMMARY, BRIEF DRAWINGS, DETAILED, CLAIMS, ABSTRACT
- 37 CFR 준수 표기 확인
- FIG. 1 참조 확인
- 영문 텍스트 확인

---

## 필수 패키지 설치

```powershell
pip install python-docx matplotlib pillow
# AI 사용 시 추가 설치
pip install anthropic    # Claude
pip install openai       # OpenAI
```
