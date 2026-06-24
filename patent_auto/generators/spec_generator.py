# -*- coding: utf-8 -*-
"""
AI 기반 특허 명세서 섹션 자동 생성기
- Claude API 또는 OpenAI API를 사용해 각 섹션을 자동 생성
- API 키가 없으면 템플릿 기반 생성으로 폴백
"""

import json
import os
import re
import time

# ─── AI API 호출 (선택) ────────────────────────────────────────────────────
def call_ai_api(prompt: str, api_key: str = None, provider: str = "claude") -> str:
    """
    AI API를 호출하여 텍스트 생성
    provider: "claude" | "openai"
    api_key: 환경 변수 CLAUDE_API_KEY 또는 OPENAI_API_KEY 로도 설정 가능
    """
    if not api_key:
        api_key = os.environ.get("CLAUDE_API_KEY") or os.environ.get("OPENAI_API_KEY")

    if not api_key:
        print("  [INFO] AI API 키 없음 → 템플릿 기반 생성으로 대체합니다.")
        return None

    try:
        if provider == "claude":
            import anthropic
            client = anthropic.Anthropic(api_key=api_key)
            msg = client.messages.create(
                model="claude-opus-4-5",
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}]
            )
            return msg.content[0].text

        elif provider == "openai":
            import openai
            client = openai.OpenAI(api_key=api_key)
            resp = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=4096
            )
            return resp.choices[0].message.content

    except ImportError:
        print(f"  [WARN] {provider} 라이브러리 미설치. pip install anthropic 또는 pip install openai")
        return None
    except Exception as e:
        print(f"  [WARN] AI API 오류: {e}")
        return None


# ─── 섹션별 프롬프트 빌더 ──────────────────────────────────────────────────
class PatentPromptBuilder:
    """각 특허 섹션에 맞는 프롬프트를 구성"""

    def build_background_prompt(self, invention: dict, lang: str = "ko") -> str:
        prior_arts = "\n".join([
            f"- {pa['patent_no']} ({pa['assignee']}): {pa['differentiation']}"
            for pa in invention.get("prior_art", [])
        ])
        problems = "\n".join([f"- {p}" for p in invention.get("problem_statement", [])])

        if lang == "ko":
            return f"""당신은 20년 경력의 한국/미국 전문 변리사입니다.
아래 발명 정보를 바탕으로 KIPO 특허법 제42조에 맞는 【발명의 배경이 되는 기술】 섹션을 작성하세요.

발명 제목: {invention['title_ko']}
기술분야: {invention['technical_field_ko']}

기존 기술의 문제점:
{problems}

관련 선행특허 (차별화 포인트 포함):
{prior_arts}

요구사항:
1. [0002]~[0008] 단락번호 형식 사용
2. 각 선행특허에 대해 "이 기술은 [특허번호]에서 알려져 있다. 그러나 [한계점]이 있다" 형식으로 작성
3. 본 발명과의 차별화 포인트를 기술적으로 명확히 기재
4. 선행특허 번호를 괄호 안에 반드시 포함
5. 전문 변리사 수준의 법적 문체 사용"""
        else:
            return f"""You are a licensed patent attorney with 20 years of experience in US and Korean patent law.
Based on the invention information below, write the BACKGROUND OF THE INVENTION section compliant with 37 CFR 1.77.

Title: {invention['title_en']}
Technical Field: {invention['technical_field_en']}

Problems with existing technology:
{problems}

Related Prior Art (with differentiation):
{prior_arts}

Requirements:
1. Use paragraph numbers [0003]-[0009] format
2. For each prior art: "A technique of [description] is known (Patent No.). However, [limitation]..."
3. Clearly state technical differentiation from the present invention
4. Use professional patent attorney language and style"""

    def build_detailed_description_prompt(self, invention: dict, component: dict, lang: str = "ko") -> str:
        if lang == "ko":
            return f"""당신은 20년 경력의 전문 변리사입니다.
아래 구성요소 정보를 바탕으로 특허 명세서의 【발명을 실시하기 위한 구체적인 내용】 중 해당 구성요소 섹션을 작성하세요.

발명 제목: {invention['title_ko']}
구성요소 번호: ({component['ref_num']})
구성요소 명칭: {component['name_ko']}
핵심 기술 특징: {component['key_feature']}
상세 설명: {component['description_ko']}

요구사항:
1. 단락번호 형식 [00XX] 사용
2. 기술적 동작 원리를 단계별로 상세히 기술
3. 도면 참조를 포함 (예: 도 N 참조)
4. 선행기술과의 차별성을 언급
5. 청구항 언어와 일관성 유지
6. 전문 변리사 수준의 법적/기술적 문체"""
        else:
            return f"""You are a licensed patent attorney with 20 years of experience.
Write the DETAILED DESCRIPTION section for this component:

Invention Title: {invention['title_en']}
Component Reference: ({component['ref_num']})
Component Name: {component['name_en']}
Key Feature: {component['key_feature']}
Description: {component['description_en']}

Requirements:
1. Use paragraph number format [00XX]
2. Describe technical operation step-by-step in detail
3. Include drawing references (e.g., see FIG. N)
4. Mention differentiation from prior art
5. Maintain consistency with claim language
6. Use professional patent attorney style"""


# ─── 명세서 섹션 생성기 ───────────────────────────────────────────────────
class SpecificationGenerator:
    """
    발명 JSON 입력을 받아 완전한 특허 명세서 데이터를 생성
    - AI API 사용 시: 각 섹션을 LLM이 자동 생성
    - API 없을 시: 입력 데이터를 그대로 조합해 생성
    """

    def __init__(self, api_key: str = None, provider: str = "claude"):
        self.api_key = api_key
        self.provider = provider
        self.prompt_builder = PatentPromptBuilder()

    def generate_all_sections(self, invention_data: dict, lang: str = "ko") -> dict:
        """모든 명세서 섹션을 생성하여 딕셔너리로 반환"""
        inv = invention_data["invention"]
        meta = invention_data["meta"]
        claims = invention_data["claims"]

        print(f"\n[명세서 생성 시작] 언어={lang.upper()}, AI={self.provider}")

        sections = {}

        # ① 기술분야
        sections["technical_field"] = self._get_field(inv, lang)
        print("  [OK] 기술분야 생성 완료")

        # ② 배경기술 (AI 또는 템플릿)
        sections["background"] = self._get_background(inv, lang)
        print("  [OK] 배경기술 생성 완료")

        # ③ 발명의 내용
        sections["summary"] = self._get_summary(inv, lang)
        print("  [OK] 발명의 내용 생성 완료")

        # ④ 도면의 간단한 설명
        sections["brief_drawings"] = self._get_brief_drawings(invention_data, lang)
        print("  [OK] 도면 설명 생성 완료")

        # ⑤ 발명의 실시예 (각 구성요소별)
        sections["detailed"] = self._get_detailed(inv, lang)
        print("  [OK] 발명 실시예 생성 완료")

        # ⑥ 청구항
        sections["claims"] = self._get_claims(claims, lang)
        print(f"  [OK] 청구항 {len(claims)}개 생성 완료")

        # ⑦ 요약
        sections["abstract"] = self._get_abstract(inv, lang)
        print("  [OK] 요약서 생성 완료")

        # 메타 정보 포함
        sections["meta"] = meta
        sections["invention"] = inv

        return sections

    def _get_field(self, inv: dict, lang: str) -> str:
        if lang == "ko":
            return f"[0001]\n{inv['technical_field_ko']}"
        else:
            return f"[0002] {inv['technical_field_en']}"

    def _get_background(self, inv: dict, lang: str) -> list:
        """배경기술 - AI 사용 또는 템플릿 조합"""
        ai_result = None
        if self.api_key:
            prompt = self.prompt_builder.build_background_prompt(inv, lang)
            ai_result = call_ai_api(prompt, self.api_key, self.provider)

        if ai_result:
            return [{"para_num": None, "text": ai_result}]

        # 템플릿 기반 생성
        paragraphs = []
        base_num = 2 if lang == "ko" else 3

        # 일반 배경 문제점
        problems_text = "; ".join(inv.get("problem_statement", []))
        paragraphs.append({
            "para_num": f"[{base_num:04d}]",
            "text": f"현재 기술 환경에서는 {problems_text} 등의 문제점이 있다." if lang == "ko"
                    else f"In the current technology landscape, problems include: {problems_text}."
        })

        # 선행특허별 단락
        for i, pa in enumerate(inv.get("prior_art", []), 1):
            paragraphs.append({
                "para_num": f"[{base_num + i:04d}]",
                "text": (
                    f"{pa['patent_no']} ({pa['assignee']})의 기술이 알려져 있다. "
                    f"그러나 이 기술은 {pa['differentiation']}."
                ) if lang == "ko" else (
                    f"A technique disclosed in {pa['patent_no']} ({pa['assignee']}) is known. "
                    f"However, {pa['differentiation']}."
                )
            })

        return paragraphs

    def _get_summary(self, inv: dict, lang: str) -> dict:
        components = inv.get("components", [])
        effects = inv.get("effects", [])

        if lang == "ko":
            problem_text = " ".join([f"과제 {i+1}) {p}" for i, p in enumerate(inv.get("problem_statement", []))])
            solution_text = "\n".join([
                f"({chr(97+i)}) {c['name_ko']}({c['ref_num']}): {c['description_ko']}"
                for i, c in enumerate(components)
            ])
            effect_text = "\n".join([f"효과 {i+1}) {e}" for i, e in enumerate(effects)])
            return {"problems": problem_text, "solutions": solution_text, "effects": effect_text}
        else:
            problem_text = " ".join([f"Problem {i+1}: {p}" for i, p in enumerate(inv.get("problem_statement", []))])
            solution_text = "\n".join([
                f"({chr(97+i)}) {c['name_en']} ({c['ref_num']}): {c['description_en']}"
                for i, c in enumerate(components)
            ])
            effect_text = "\n".join([f"Effect {i+1}: {e}" for i, e in enumerate(effects)])
            return {"problems": problem_text, "solutions": solution_text, "effects": effect_text}

    def _get_brief_drawings(self, invention_data: dict, lang: str) -> list:
        drawings = invention_data.get("drawings", [])
        result = []
        for d in drawings:
            if lang == "ko":
                result.append({
                    "fig_no": f"도 {d['fig_no']}",
                    "description": d["description_ko"]
                })
            else:
                result.append({
                    "fig_no": f"FIG. {d['fig_no']}",
                    "description": d["description_en"]
                })
        return result

    def _get_detailed(self, inv: dict, lang: str) -> list:
        """각 구성요소별 상세 설명"""
        sections = []
        para_base = 13 if lang == "ko" else 12

        for i, comp in enumerate(inv.get("components", [])):
            # 알고리즘 섹션 추가
            algos = [a for a in inv.get("algorithms", []) if comp["ref_num"] in a.get("figure_ref", "")]

            if lang == "ko":
                text = f"{comp['name_ko']}({comp['ref_num']})는 {comp['description_ko']}"
                if comp.get("key_feature"):
                    text += f" 이 구성요소의 핵심 특징은 {comp['key_feature']}이다."
            else:
                text = f"The {comp['name_en']} ({comp['ref_num']}) {comp['description_en']}"
                if comp.get("key_feature"):
                    text += f" The key feature is: {comp['key_feature']}."

            section = {
                "section_title": comp["name_ko"] if lang == "ko" else comp["name_en"],
                "para_num": f"[{para_base + i:04d}]",
                "text": text,
                "algorithms": algos
            }
            sections.append(section)

        # 수학식 섹션
        if inv.get("mathematical_formulas"):
            sections.append({
                "section_title": "수학식" if lang == "ko" else "Mathematical Formulas",
                "para_num": f"[{para_base + len(inv.get('components', [])):04d}]",
                "text": "",
                "formulas": inv["mathematical_formulas"]
            })

        return sections

    def _get_claims(self, claims: list, lang: str) -> list:
        """청구항 생성"""
        result = []
        for claim in claims:
            if lang == "ko":
                elements = "\n\n".join(claim.get("elements_ko", []))
                full_text = f"{claim.get('preamble_ko', '')}\n\n{elements}\n\n{claim.get('closing_ko', '')}"
                result.append({
                    "claim_no": claim["claim_no"],
                    "type": claim["type"],
                    "depends_on": claim.get("depends_on"),
                    "text": full_text
                })
            else:
                elements = "\n\n".join(claim.get("elements_en", []))
                full_text = f"{claim.get('preamble_en', '')}\n\n{elements}\n\n{claim.get('closing_en', '')}"
                result.append({
                    "claim_no": claim["claim_no"],
                    "type": claim["type"],
                    "depends_on": claim.get("depends_on"),
                    "text": full_text
                })
        return result

    def _get_abstract(self, inv: dict, lang: str) -> str:
        if lang == "ko":
            return inv.get("abstract_ko", "요약 미작성")
        else:
            return inv.get("abstract_en", "Abstract not provided.")


# ─── 단독 테스트 실행 ──────────────────────────────────────────────────────
if __name__ == "__main__":
    import json

    template_path = os.path.join(os.path.dirname(__file__), "..", "config", "invention_input_template.json")
    with open(template_path, encoding="utf-8") as f:
        data = json.load(f)

    gen = SpecificationGenerator()
    ko_sections = gen.generate_all_sections(data, lang="ko")
    en_sections = gen.generate_all_sections(data, lang="en")

    print("\n[OK] 명세서 섹션 생성 완료")
    print(f"  한국어 섹션 키: {list(ko_sections.keys())}")
    print(f"  영문 섹션 키: {list(en_sections.keys())}")
