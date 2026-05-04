# Skill: drill

Tạo các bước triển khai (deployment checklist) chi tiết cho một tính năng hoặc release.

## Cách dùng
```
/drill <mô tả tính năng hoặc release>
```

## Output
Danh sách checkbox theo thứ tự:
- [ ] Pre-deploy: tests, lint, build
- [ ] Deploy steps: từng lệnh cụ thể
- [ ] Post-deploy: smoke test, monitor
- [ ] Rollback plan nếu fail
