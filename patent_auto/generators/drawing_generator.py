# -*- coding: utf-8 -*-
"""
특허 도면 자동 생성기
- matplotlib / graphviz 기반으로 프로그래밍 방식으로 도면 생성
- 외부 AI 이미지 생성 API 불필요
- 블록 다이어그램, 흐름도, 시퀀스 다이어그램 지원
"""

import os
import json
from pathlib import Path

try:
    import matplotlib
    matplotlib.use('Agg')  # 헤드리스(화면 없음) 모드
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
    from matplotlib import font_manager

    # 한국어 폰트 자동 탐색 (Windows 우선)
    KO_FONTS = ["Malgun Gothic", "맑은 고딕", "NanumGothic", "AppleGothic", "UnDotum"]
    _ko_font = None
    for fname in KO_FONTS:
        try:
            fp = font_manager.findfont(font_manager.FontProperties(family=fname), fallback_to_default=False)
            if fp and "ttf" in fp.lower():
                _ko_font = fname
                break
        except Exception:
            pass

    if _ko_font:
        matplotlib.rcParams['font.family'] = _ko_font
    else:
        # 시스템에 한국어 폰트가 없으면 영문 폴백 사용
        matplotlib.rcParams['font.family'] = 'DejaVu Sans'

    matplotlib.rcParams['axes.unicode_minus'] = False
    HAS_MPL = True
except ImportError:
    HAS_MPL = False
    print("[WARN] matplotlib 미설치. pip install matplotlib")


# ─── 색상 팔레트 (흑백 patent 스타일) ────────────────────────────────────
COLORS = {
    "box": "#FFFFFF",
    "box_edge": "#000000",
    "arrow": "#000000",
    "diamond": "#FFFFFF",
    "start_end": "#E0E0E0",
    "text": "#000000",
    "layer_bg": "#F8F8F8",
}


class PatentDrawingGenerator:
    """특허 도면 자동 생성기"""

    def __init__(self, output_dir: str, lang: str = "ko"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.lang = lang  # "ko" or "en"
        self.generated_files = []

    def generate_all(self, invention_data: dict) -> list:
        """발명 데이터의 모든 도면을 생성"""
        drawings = invention_data.get("drawings", [])
        inv = invention_data.get("invention", {})

        print(f"\n[도면 생성 시작] 언어={self.lang.upper()}, 총 {len(drawings)}종")

        for drawing in drawings:
            fig_no = drawing["fig_no"]
            draw_type = drawing.get("type", "block_diagram")
            lang_label = "KO" if self.lang == "ko" else "EN"

            output_path = self.output_dir / f"fig{fig_no:02d}_{lang_label}.png"

            if draw_type == "block_diagram":
                self._generate_block_diagram(drawing, inv, output_path)
            elif draw_type == "flowchart":
                self._generate_flowchart(drawing, inv, output_path)
            elif draw_type == "sequence":
                self._generate_sequence(drawing, inv, output_path)
            else:
                self._generate_generic(drawing, inv, output_path)

            self.generated_files.append(str(output_path))
            print(f"  [OK] 도 {fig_no} / FIG. {fig_no} 생성 완료: {output_path.name}")

        return self.generated_files

    def _setup_figure(self, title: str, figsize=(12, 8)):
        """matplotlib 기본 설정"""
        if not HAS_MPL:
            return None, None
        fig, ax = plt.subplots(figsize=figsize)
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 8)
        ax.axis('off')
        # 제목
        fig.suptitle(title, fontsize=14, fontweight='bold', y=0.98)
        return fig, ax

    def _draw_box(self, ax, x, y, w, h, text, ref_num=None, fontsize=9):
        """직사각형 박스 그리기"""
        box = FancyBboxPatch((x - w/2, y - h/2), w, h,
                              boxstyle="round,pad=0.05",
                              facecolor=COLORS["box"],
                              edgecolor=COLORS["box_edge"],
                              linewidth=1.2)
        ax.add_patch(box)
        label = f"({ref_num})\n{text}" if ref_num else text
        ax.text(x, y, label, ha='center', va='center',
                fontsize=fontsize, wrap=True,
                multialignment='center', color=COLORS["text"])

    def _draw_diamond(self, ax, x, y, w, h, text, fontsize=8):
        """마름모 결정 노드 그리기"""
        diamond = plt.Polygon(
            [[x, y+h/2], [x+w/2, y], [x, y-h/2], [x-w/2, y]],
            facecolor=COLORS["diamond"], edgecolor=COLORS["box_edge"], linewidth=1.2
        )
        ax.add_patch(diamond)
        ax.text(x, y, text, ha='center', va='center',
                fontsize=fontsize, multialignment='center')

    def _draw_arrow(self, ax, x1, y1, x2, y2, label="", color="#000000"):
        """화살표 그리기"""
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="->", color=color, lw=1.2))
        if label:
            mx, my = (x1+x2)/2, (y1+y2)/2
            ax.text(mx+0.1, my, label, fontsize=7, color=color)

    def _generate_block_diagram(self, drawing: dict, inv: dict, output_path: Path):
        """블록 다이어그램 생성"""
        if not HAS_MPL:
            self._create_placeholder(output_path, drawing)
            return

        title_key = "title_ko" if self.lang == "ko" else "title_en"
        fig_label = "도" if self.lang == "ko" else "FIG."
        title = f"{fig_label} {drawing['fig_no']}  {drawing.get(title_key, '')}"

        fig, ax = self._setup_figure(title, figsize=(14, 9))

        # 구성요소 박스들을 자동 배치
        components_shown = drawing.get("components_shown", [])
        all_components = {c["ref_num"]: c for c in inv.get("components", [])}

        shown = [all_components[r] for r in components_shown if r in all_components]
        if not shown:
            shown = list(all_components.values())

        n = len(shown)
        if n == 0:
            ax.text(5, 4, "구성요소 정보 없음", ha='center', va='center', fontsize=12)
        else:
            # 2열 또는 1열 배치
            cols = min(n, 3)
            rows = (n + cols - 1) // cols
            x_positions = [2.5 + (i % cols) * 3.0 for i in range(n)]
            y_positions = [6.5 - (i // cols) * 2.5 for i in range(n)]

            for i, comp in enumerate(shown):
                name = comp["name_ko"] if self.lang == "ko" else comp["name_en"]
                self._draw_box(ax, x_positions[i], y_positions[i], 2.5, 1.2,
                               name, comp["ref_num"], fontsize=9)

            # 화살표 연결 (순서대로)
            for i in range(len(shown) - 1):
                if y_positions[i] == y_positions[i+1]:
                    self._draw_arrow(ax, x_positions[i]+1.25, y_positions[i],
                                    x_positions[i+1]-1.25, y_positions[i+1])
                else:
                    self._draw_arrow(ax, x_positions[i], y_positions[i]-0.6,
                                    x_positions[i+1], y_positions[i+1]+0.6)

        plt.tight_layout(rect=[0, 0, 1, 0.95])
        plt.savefig(output_path, dpi=150, bbox_inches='tight',
                    facecolor='white', edgecolor='none')
        plt.close()

    def _generate_flowchart(self, drawing: dict, inv: dict, output_path: Path):
        """흐름도 생성"""
        if not HAS_MPL:
            self._create_placeholder(output_path, drawing)
            return

        title_key = "title_ko" if self.lang == "ko" else "title_en"
        fig_label = "도" if self.lang == "ko" else "FIG."
        title = f"{fig_label} {drawing['fig_no']}  {drawing.get(title_key, '')}"

        fig, ax = self._setup_figure(title, figsize=(10, 12))

        # 알고리즘에서 단계 추출
        algos = inv.get("algorithms", [])
        steps = []
        for algo in algos:
            steps.extend(algo.get("pseudocode", []))

        if not steps:
            steps = [
                "START" if self.lang == "en" else "시작",
                "Step 1: Process A" if self.lang == "en" else "단계 1: 처리 A",
                "Condition?" if self.lang == "en" else "조건 판단?",
                "Step 2: Process B" if self.lang == "en" else "단계 2: 처리 B",
                "END" if self.lang == "en" else "종료",
            ]

        # 단계 수에 따라 Y 간격 조정
        n_steps = len(steps) + 2  # start/end 포함
        y_step = min(1.5, 7.0 / n_steps)
        y_start = 7.5

        # START 노드
        start_label = "START" if self.lang == "en" else "시작"
        end_label = "END" if self.lang == "en" else "종료"

        ax.add_patch(mpatches.Ellipse((5, y_start), 2, 0.6,
                                      facecolor=COLORS["start_end"],
                                      edgecolor=COLORS["box_edge"]))
        ax.text(5, y_start, start_label, ha='center', va='center', fontsize=9, fontweight='bold')

        prev_y = y_start - 0.3
        for i, step in enumerate(steps):
            cur_y = y_start - (i+1) * y_step

            # '?' 포함하면 마름모
            if '?' in step:
                self._draw_arrow(ax, 5, prev_y, 5, cur_y + 0.35)
                self._draw_diamond(ax, 5, cur_y, 3.0, 0.7, step, fontsize=7)
            else:
                self._draw_arrow(ax, 5, prev_y, 5, cur_y + 0.4)
                self._draw_box(ax, 5, cur_y, 3.5, 0.7, step, fontsize=7)
            prev_y = cur_y - 0.35

        # END 노드
        end_y = y_start - (len(steps)+1) * y_step
        self._draw_arrow(ax, 5, prev_y, 5, end_y + 0.3)
        ax.add_patch(mpatches.Ellipse((5, end_y), 2, 0.6,
                                      facecolor=COLORS["start_end"],
                                      edgecolor=COLORS["box_edge"]))
        ax.text(5, end_y, end_label, ha='center', va='center', fontsize=9, fontweight='bold')

        plt.tight_layout(rect=[0, 0, 1, 0.95])
        plt.savefig(output_path, dpi=150, bbox_inches='tight',
                    facecolor='white', edgecolor='none')
        plt.close()

    def _generate_sequence(self, drawing: dict, inv: dict, output_path: Path):
        """시퀀스 다이어그램 생성"""
        if not HAS_MPL:
            self._create_placeholder(output_path, drawing)
            return

        title_key = "title_ko" if self.lang == "ko" else "title_en"
        fig_label = "도" if self.lang == "ko" else "FIG."
        title = f"{fig_label} {drawing['fig_no']}  {drawing.get(title_key, '')}"

        fig, ax = self._setup_figure(title, figsize=(14, 9))

        # 구성요소를 열로 배치
        components_shown = drawing.get("components_shown", [])
        all_components = {c["ref_num"]: c for c in inv.get("components", [])}
        shown = [all_components[r] for r in components_shown if r in all_components]

        if not shown:
            shown = list(all_components.values())[:4]

        n = len(shown)
        if n == 0:
            ax.text(5, 4, "구성요소 없음", ha='center', fontsize=12)
        else:
            x_positions = [1.5 + i * (8.0 / max(n-1, 1)) for i in range(n)]
            # 헤더 박스
            for i, comp in enumerate(shown):
                name = comp["name_ko"] if self.lang == "ko" else comp["name_en"]
                self._draw_box(ax, x_positions[i], 7.5, 2.0, 0.7, f"({comp['ref_num']})\n{name}", fontsize=8)
                # 수직선
                ax.plot([x_positions[i], x_positions[i]], [7.15, 0.5],
                        'k--', linewidth=0.8, alpha=0.5)

            # 시퀀스 화살표
            for i in range(min(n-1, 5)):
                y = 6.5 - i * 1.0
                label = inv.get("algorithms", [{}])[0].get("pseudocode", [""])[i] if i < len(inv.get("algorithms", [{}])[0].get("pseudocode", [])) else f"Step {i+1}"
                self._draw_arrow(ax, x_positions[i]+0.5, y, x_positions[i+1]-0.5, y, label[:30])

        plt.tight_layout(rect=[0, 0, 1, 0.95])
        plt.savefig(output_path, dpi=150, bbox_inches='tight',
                    facecolor='white', edgecolor='none')
        plt.close()

    def _generate_generic(self, drawing: dict, inv: dict, output_path: Path):
        """기본 다이어그램"""
        self._generate_block_diagram(drawing, inv, output_path)

    def _create_placeholder(self, output_path: Path, drawing: dict):
        """matplotlib 없을 때 텍스트 기반 플레이스홀더 생성"""
        with open(str(output_path) + ".txt", "w", encoding="utf-8") as f:
            f.write(f"도면 {drawing['fig_no']}: {drawing.get('title_ko', '')}\n")
            f.write("matplotlib 설치 후 이미지 생성 가능: pip install matplotlib\n")
        print(f"  [INFO] 플레이스홀더 생성: {output_path}.txt")


# ─── 단독 테스트 ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    template_path = os.path.join(os.path.dirname(__file__), "..", "config", "invention_input_template.json")
    with open(template_path, encoding="utf-8") as f:
        data = json.load(f)

    out_dir = os.path.join(os.path.dirname(__file__), "..", "output", "test_drawings")
    gen_ko = PatentDrawingGenerator(out_dir, lang="ko")
    files = gen_ko.generate_all(data)
    print(f"\n생성된 도면: {files}")
