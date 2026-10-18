# 🐸 Bố Cóc & Tí Hon — Đêm Hòa Nhạc Đom Đóm

Phim hoạt hình **GỐC** (nhân vật, tranh, kịch bản đều mới — không sao chép cuốn sách bản quyền),
dựng bằng **Remotion** (React → video). Tinh thần: hai bố con cóc phiêu lưu đi nghe hòa nhạc rồi về đi ngủ.

- **Độ phân giải:** 1920×1080 (Full HD), 30 fps
- **Thời lượng:** ~64 giây
- **File phim:** `coc-film/out/bo-coc-ti-hon.mp4`

## 🎬 Mạch phim (16 cảnh)
Title → Tí chán ở nhà → đom đóm mang giấy mời → đọc thư → lên đường → nghịch nước →
nhặt gậy hình rồng → cầu vồng đom đóm → bố nhảy "đại bác" → **cá chó ngậm bố** →
Tí giải cứu → ôm nhau "người hùng" → tới nơi concert vừa tan → về nhà dưới trăng (sao băng,
Tí ngủ gục trên lưng bố) → đi ngủ → "Hết".

Kỹ thuật điện ảnh đã dùng: khung hình letterbox 2.40:1, camera push-in/pan, parallax nhiều lớp,
cross-dissolve + slide + wipe xen kẽ, vignette, chữ tượng thanh (OẠP!, Tõm!, CỐP!), đom đóm/bong bóng/sao động.

## ⚠️ Nhạc cho YouTube (QUAN TRỌNG)
Phim hiện **chưa có nhạc nền** (mình không thể gắn nhạc có bản quyền). Để đăng YouTube, bạn nên thêm
một bản nhạc **miễn phí bản quyền** (royalty-free):
- YouTube Audio Library (miễn phí, có ngay trong YouTube Studio)
- Pixabay Music, Incompetech, Chosic...

**Cách gắn nhạc trong phim** (tùy chọn): bỏ file `nhac.mp3` vào thư mục `coc-film/public/`,
rồi thêm vào đầu `src/Film.tsx`:
```tsx
import { Audio, staticFile } from "remotion";
// ...bên trong <AbsoluteFill> của Film, thêm:
<Audio src={staticFile("nhac.mp3")} volume={0.6} />
```
Hoặc đơn giản hơn: ghép nhạc trực tiếp khi upload bằng trình chỉnh sửa của YouTube Studio.

## 🖥️ Xem & chỉnh sửa trong Studio
```bash
cd coc-film
npx remotion studio --no-open
```
Mở link in ra, chọn composition **Film** (hoặc từng cảnh trong thư mục *Scenes* để tinh chỉnh).

## 🔁 Render lại ra MP4
Môi trường này cần trỏ Chromium thủ công:
```bash
cd coc-film
HS=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx remotion render Film out/bo-coc-ti-hon.mp4 \
  --browser-executable="$HS" --ignore-certificate-errors \
  --concurrency=4 --codec=h264 --jpeg-quality=95
```
(Trên máy thường chỉ cần `npx remotion render Film`.)

## ✏️ Muốn sửa gì?
- **Lời thoại/phụ đề:** sửa chuỗi `vi=...` trong các file `src/scenes/*.tsx`
- **Màu sắc:** `src/theme.ts`
- **Thời lượng từng cảnh:** mảng `SCENES` trong `src/Film.tsx` (số `dur` tính theo frame, 30 frame = 1 giây)
- **Tạo hình nhân vật:** `src/components/Frog.tsx`
- **Bối cảnh:** `src/components/Backgrounds.tsx`

Chúc bạn làm kênh vui! 🎥🐸
