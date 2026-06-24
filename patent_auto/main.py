# -*- coding: utf-8 -*-
"""
특허 명세서 자동화 시스템 v1.0
=================================
사용법:
  python main.py                                    → 기본 템플릿으로 실행
  python main.py --input config/my_invention.json  → 내 발명 JSON으로 실행
  python main.py --ai claude --key sk-ant-xxxx     → AI 자동 생성 활성화
  python main.py --office KIPO                     → 특정 국가만 생성
  python main.py --skip-drawing                    → 도면 생성 건너뜀 (빠른 테스트)

출력:
  output/[발명명칭]_KIPO_출원완성본.docx
  output/[발명명칭]_USPTO_Final.docx
"""

import argparse
import json
import os
import sys
import shutil
import re
from datetime import datetime
from pathlib import Path

# 같은 패키지 내 모듈 import
sys.path.insert(0, str(Path(__file__).parent))
from generators.spec_generator import SpecificationGenerator
from generators.drawing_generator import PatentDrawingGenerator
from generators.document_builder import KIPODocumentBuilder, USPTODocumentBuilder
from verifiers.compliance_checker import ComplianceChecker


# ─── CLI 인수 파싱 ─────────────────────────────────────────────────────────
def parse_args():
    parser = argparse.ArgumentParser(
        description="특허 명세서 자동 생성 시스템",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument(
        "--input", "-i",
        default="config/invention_input_template.json",
        help="발명 내용 JSON 파일 경로 (기본: config/invention_input_template.json)"
    )
    parser.add_argument(
        "--output", "-o",
        default="output",
        help="출력 디렉토리 (기본: output/)"
    )
    parser.add_argument(
        "--ai",
        choices=["claude", "openai", "none"],
        default="none",
        help="AI 생성 공급자 선택 (기본: none = 템플릿 기반)"
    )
    parser.add_argument(
        "--key",
        default=None,
        help="AI API 키 (또는 환경변수 CLAUDE_API_KEY / OPENAI_API_KEY 설정)"
    )
    parser.add_argument(
        "--office",
        choices=["KIPO", "USPTO", "both"],
        default="both",
        help="생성할 특허청 선택 (기본: both)"
    )
    parser.add_argument(
        "--skip-drawing",
        action="store_true",
        help="도면 생성 건너뜀 (빠른 테스트용)"
    )
    parser.add_argument(
        "--no-verify",
        action="store_true",
        help="검증 단계 건너뜀"
    )
    return parser.parse_args()


# ─── 발명 데이터 로딩 ─────────────────────────────────────────────────────
def load_invention(input_path: str) -> dict:
    """JSON 파일에서 발명 데이터 로드"""
    path = Path(input_path)
    if not path.exists():
        print(f"[ERROR] 입력 파일 없음: {input_path}")
        print("       → config/invention_input_template.json 을 복사해서 사용하세요.")
        sys.exit(1)

    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    # 기본 검증
    required = ["meta", "invention", "claims", "drawings"]
    for key in required:
        if key not in data:
            print(f"[ERROR] JSON에 '{key}' 필드가 없습니다.")
            sys.exit(1)

    print(f"[OK] 발명 데이터 로드: {data['invention']['title_ko'][:30]}...")
    return data


# ─── 출력 파일명 생성 ─────────────────────────────────────────────────────
def make_filename(title: str, suffix: str) -> str:
    """발명 제목에서 파일명 생성 (특수문자 제거)"""
    clean = re.sub(r'[\\/:*?"<>|]', '', title)
    clean = clean[:40].strip()
    ts = datetime.now().strftime("%Y%m%d")
    return f"{clean}_{suffix}_{ts}"


# ─── 메인 파이프라인 ──────────────────────────────────────────────────────
def run_pipeline(args):
    print("\n" + "="*60)
    print("  특허 명세서 자동화 시스템 v1.0")
    print("="*60)

    # ── Step 1: 데이터 로드 ───────────────────────────────────────────
    print("\n[Step 1] 발명 데이터 로드")
    invention_data = load_invention(args.input)

    title_ko = invention_data["invention"]["title_ko"]
    title_en = invention_data["invention"]["title_en"]
    base_name_ko = make_filename(title_ko, "KIPO_출원완성본")
    base_name_en = make_filename(title_en, "USPTO_Final")

    output_dir = Path(args.output)
    drawing_dir_ko = output_dir / "drawings_ko"
    drawing_dir_en = output_dir / "drawings_en"

    # ── Step 2: AI 명세서 섹션 생성 ───────────────────────────────────
    print("\n[Step 2] 명세서 섹션 생성")
    api_key = args.key or os.environ.get("CLAUDE_API_KEY") or os.environ.get("OPENAI_API_KEY")
    provider = args.ai if args.ai != "none" else "claude"

    spec_gen = SpecificationGenerator(api_key=api_key, provider=provider)

    ko_sections = en_sections = None
    if args.office in ("KIPO", "both"):
        ko_sections = spec_gen.generate_all_sections(invention_data, lang="ko")
    if args.office in ("USPTO", "both"):
        en_sections = spec_gen.generate_all_sections(invention_data, lang="en")

    # ── Step 3: 도면 생성 ─────────────────────────────────────────────
    drawing_files_ko = []
    drawing_files_en = []

    if not args.skip_drawing:
        print("\n[Step 3] 도면 생성")
        if args.office in ("KIPO", "both"):
            drawing_gen_ko = PatentDrawingGenerator(str(drawing_dir_ko), lang="ko")
            drawing_files_ko = drawing_gen_ko.generate_all(invention_data)

        if args.office in ("USPTO", "both"):
            drawing_gen_en = PatentDrawingGenerator(str(drawing_dir_en), lang="en")
            drawing_files_en = drawing_gen_en.generate_all(invention_data)
    else:
        print("\n[Step 3] 도면 생성 건너뜀 (--skip-drawing)")

    # ── Step 4: Word 문서 생성 ────────────────────────────────────────
    print("\n[Step 4] Word 문서 생성")
    kipo_path = uspto_path = None

    if ko_sections and args.office in ("KIPO", "both"):
        kipo_path = str(output_dir / f"{base_name_ko}.docx")
        builder = KIPODocumentBuilder()
        builder.build(ko_sections, drawing_files_ko, kipo_path)

    if en_sections and args.office in ("USPTO", "both"):
        uspto_path = str(output_dir / f"{base_name_en}.docx")
        builder = USPTODocumentBuilder()
        builder.build(en_sections, drawing_files_en, uspto_path)

    # ── Step 5: 자동 검증 ─────────────────────────────────────────────
    all_passed = True
    if not args.no_verify:
        print("\n[Step 5] 자동 검증")
        checker = ComplianceChecker()

        if kipo_path:
            kipo_results = checker.check_kipo(kipo_path)
            checker.print_report("KIPO 양식 검증")
            kipo_ok = len(kipo_results.get("fail", [])) == 0

        if ko_sections and en_sections:
            checker.check_drawing_consistency(
                ko_sections, en_sections, drawing_files_ko, drawing_files_en
            )
            checker.print_report("도면-명세서 일치성 검증")

        if uspto_path:
            checker = ComplianceChecker()
            checker.check_uspto(uspto_path)
            checker.print_report("USPTO 양식 검증")

    # ── 최종 요약 ─────────────────────────────────────────────────────
    print("\n" + "="*60)
    print("  최종 생성 파일 목록")
    print("="*60)
    if kipo_path:
        sz = os.path.getsize(kipo_path) // 1024
        print(f"  [KIPO] {kipo_path} ({sz}KB)")
    if uspto_path:
        sz = os.path.getsize(uspto_path) // 1024
        print(f"  [USPTO] {uspto_path} ({sz}KB)")
    print(f"  [한국어 도면] {len(drawing_files_ko)}종 → {drawing_dir_ko}")
    print(f"  [영문 도면]   {len(drawing_files_en)}종 → {drawing_dir_en}")
    print("\n  제출 준비 완료!")
    print("="*60)


# ─── 진입점 ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    args = parse_args()
    run_pipeline(args)
