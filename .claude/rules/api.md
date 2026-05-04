# Rules — áp dụng cho app/api/**

Các quy tắc bắt buộc khi viết code trong thư mục `app/api/`:

1. **Không dùng `exec()`** — chỉ dùng `spawn()` để tránh shell injection
2. **Validate input** tại boundary: kiểm tra `text.trim()`, giới hạn độ dài
3. **Cleanup temp files** trong `finally` block (wav, mp3)
4. **Trả về lỗi rõ ràng** với HTTP status code phù hợp (400, 500)
5. **Không log** nội dung text của user
6. **Timeout** mọi external process call
