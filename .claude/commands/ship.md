# /ship — Build, lint và deploy trong một bước

Chạy toàn bộ pipeline CI/CD cục bộ:

1. **Lint**: `npm run lint`
2. **Build static**: `NEXT_EXPORT=1 npm run build`
3. **Verify**: kiểm tra `out/index.html` tồn tại
4. **Commit**: stage tất cả thay đổi, tạo commit với message mô tả
5. **Push**: `git push -u origin <current-branch>`

Nếu bất kỳ bước nào fail, dừng lại và báo lỗi rõ ràng.
