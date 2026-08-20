# Nguồn skill

Skill `remotion-motion-graphics` được vendor (sao chép nguyên bản) từ:

- Repo: https://github.com/haidrrrry/claude-remotion-skill
- Thư mục gốc: `remotion-motion-graphics/`
- Tác giả: [@haidrrrry](https://github.com/haidrrrry)
- Giấy phép: MIT (xem `LICENSE` trong thư mục này)

## Nội dung

| File | Vai trò |
|---|---|
| `SKILL.md` | Quy trình 5 bước + 10 quy tắc motion bắt buộc |
| `references/motion-patterns.md` | 17 pattern component copy-paste (reveal, grade, grain, Ken Burns, counter, transition, caption...) |
| `references/design-rules.md` | Bảng màu, typography, nhịp cảnh, sound design, checklist trước khi giao |
| `assets/theme.ts` | Template `theme.ts` (màu, easing, spring preset) copy vào mỗi project Remotion |

## Cách cập nhật

```bash
git clone https://github.com/haidrrrry/claude-remotion-skill.git /tmp/crs
cp -r /tmp/crs/remotion-motion-graphics/. .claude/skills/remotion-motion-graphics/
```

Giữ lại `SOURCE.md` và `LICENSE` sau khi cập nhật.

## Lưu ý cho project này

VOICEFORGE- hiện là app Next.js (React 19 + three.js + gsap), chưa cài Remotion.
Khi dùng skill lần đầu, làm theo Step 2 trong `SKILL.md` — nên tạo Remotion
trong thư mục con riêng (ví dụ `video/`) để không đụng build của Next.js.
