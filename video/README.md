# Bộ kit motion graphics — style explainer hoạt hình Việt

Tái tạo phong cách của các kênh edutainment hoạt hình Việt Nam (kiểu *Học viện
Bò và Gấu*): nền sunburst vàng xoay, chữ vàng viền đen dày có bóng đổ khối,
nhân vật cutout viền đậm, bản đồ quốc gia lấp cờ, số đếm, và SFX tổng hợp.

Dựng bằng [Remotion](https://remotion.dev) — video là React, render ra MP4.
Tách riêng khỏi app Next.js ở thư mục gốc: `video/` có `package.json` riêng,
không ảnh hưởng `next build`.

## Chạy

```bash
cd video
npm install

npm run studio    # mở Remotion Studio để xem/tua/chỉnh trực tiếp
npm run render    # xuất out/style-kit.mp4
```

Trong container không GPU, truyền thẳng Chromium cho lệnh render:

```bash
npm run render -- --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

## Cấu trúc

```
src/
├── theme.ts                 # NGUỒN SỰ THẬT DUY NHẤT: màu, easing, spring, độ dày viền
├── index.ts                 # registerRoot
├── Root.tsx                 # Composition + timeline scene + toàn bộ SFX
├── data/
│   ├── maps.ts              # GENERATED — path bản đồ quốc gia (Natural Earth)
│   └── fonts.ts             # GENERATED — font woff2 nhúng base64
├── components/
│   ├── FontStyles.tsx       # @font-face data URI
│   ├── Backgrounds.tsx      # Sunburst, SpeedLines, Grade, Grain, Vignette
│   ├── Motion.tsx           # Entrance, Pop, ScreenShake, Flash, Scene, useBreathe
│   ├── ChunkyText.tsx       # ChunkyText, ChunkyWords, Caption
│   ├── Counter.tsx          # số đếm bằng spring
│   ├── FlagMap.tsx          # bản đồ quốc gia lấp cờ
│   └── Plane.tsx            # máy bay Wright hai tầng cánh
├── mascots/
│   ├── rig.ts               # nháy mắt, mấp máy miệng, gật đầu
│   ├── Gau.tsx              # gấu
│   └── Bo.tsx               # bò
└── scenes/                  # Hook, Title, Stat, Maps, CTA
```

## Sinh lại asset

Cả hai script đều tất định — chạy lại cho ra file y hệt.

```bash
npm run gen:maps   # d3-geo + world-atlas -> src/data/maps.ts
npm run gen:fonts  # pyftsubset -> woff2 base64 -> src/data/fonts.ts
npm run gen:sfx    # tổng hợp WAV -> public/sfx/
```

`gen:fonts` cần `pyftsubset` (`pip install fonttools brotli`).
`gen:sfx` không cần gì ngoài Node — tự tổng hợp whoosh, pop, thump, ding,
riser và một nền nhạc 110 BPM bằng toán, không tải file nào.

## Font

`Baloo 2 ExtraBold` (chữ tiêu đề) và `Be Vietnam Pro` (chữ phụ), subset về
Latin + tiếng Việt, nén woff2, nhúng base64 vào `src/data/fonts.ts`.

Nhúng chứ không fetch là có lý do: `FontFace.load()` của JS thỉnh thoảng không
bao giờ resolve trong container headless này, mà nó giữ một handle
`delayRender` nên làm chết render ở frame ngẫu nhiên (đã gặp ở frame 89, 170,
583, 595). `@font-face` bằng CSS thuần với data URI thì không có gì để fetch,
trình duyệt giải mã ngay lúc tính style. `font-display: block` đảm bảo không
bao giờ vẽ ra font dự phòng.

Đổi font khác: thả file `.ttf` vào `public/fonts/`, sửa mảng `FACES` trong
`scripts/gen-fonts.mjs`, chạy `npm run gen:fonts`. Nhớ kiểm tra font mới có đủ
dấu tiếng Việt (khối Latin Extended Additional, U+1EA0–U+1EF9).

## Đổi sang thương hiệu của bạn

1. **Màu**: sửa `theme.colors` trong `src/theme.ts`. Giữ đúng công thức
   60/30/10 — một nền, MỘT màu hero, một màu nhấn. Màu hero chỉ được xuất hiện
   trên tối đa một phần tử mỗi khung hình.
2. **Nhân vật**: `src/mascots/Gau.tsx` và `Bo.tsx` là SVG thuần. Đổi màu qua
   `theme.colors`, đổi hình bằng cách sửa path. Rig (nháy mắt, mấp máy miệng,
   gật đầu) nằm ở `rig.ts` và dùng lại được cho nhân vật mới.
3. **Nội dung**: sửa chữ trong `src/scenes/*.tsx`.
4. **Thời lượng**: sửa `BEATS` trong `Root.tsx`. Mọi timing khác tự suy ra.

## Thêm bản đồ nước khác

Sửa mảng `WANT` trong `scripts/gen-maps.mjs` (dùng đúng tên tiếng Anh của
Natural Earth), chạy `npm run gen:maps`, rồi thêm hình cờ vào `FLAGS` trong
`src/components/FlagMap.tsx`. `rings` giới hạn số polygon lớn nhất được giữ —
nhờ vậy Mỹ chỉ hiện phần lục địa thay vì kéo dài tới Alaska.

## Quy tắc motion đang áp dụng

Kit này tuân thủ skill `remotion-motion-graphics` ở `.claude/skills/`:

- Không dùng nội suy tuyến tính. Mọi `interpolate()` đều có easing và clamp cả
  hai đầu; entrance ưu tiên `spring()`.
- Entrance chạy 2–3 thuộc tính cùng lúc (mờ + trồi + phóng), không bao giờ chỉ
  fade một mình.
- Stagger mọi thứ: chữ lệch 3 frame, thẻ/bản đồ lệch 5 frame.
- Exit có thật và nhanh hơn entrance.
- Đủ 5 lớp: nền → nội dung → grade → grain → vignette.
- Phần tử đứng trên màn hình >2s đều "thở" bằng sóng sin.
- Mọi timing suy ra từ `fps`, không có số frame ma.
- Không dùng emoji làm icon — chuông trong CTA vẽ bằng SVG theo màu theme.

## Việc chưa làm

- **Bản dọc 1080×1920 cho Shorts.** Layout hiện tuned cho 16:9. Cần một
  composition riêng với `ChunkyText` cỡ nhỏ hơn và xếp dọc, giữ chữ trong 75%
  giữa theo chiều cao.
- **Lồng tiếng + phụ đề khớp từ.** Xem mục captions trong
  `.claude/skills/remotion-motion-graphics/references/motion-patterns.md`.
- **Nhạc nền thật.** `public/sfx/music.wav` là loop tổng hợp để không phải giao
  video câm; nên thay bằng nhạc có bản quyền phù hợp.
