# 🛠️ ECC (Everything Claude Code) - Hướng dẫn sử dụng
*Nâng tầm trải nghiệm phát triển với Claude Code CLI*

---

## 🚀 3 Phương Thức Sử Dụng Chính

### 1. ⌨️ Lệnh Slash Command (Claude Code CLI)
Gõ `/` + tên lệnh để kích hoạt các workflow tự động.

| Lệnh | Chức năng |
| :--- | :--- |
| `/plan "mô tả"` | 📋 Lập kế hoạch chi tiết cho task |
| `/code-review` | 🔍 Đánh giá và review code hiện tại |
| `/feature-dev` | 🏗️ Phát triển tính năng mới từ đầu |
| `/refactor-clean` | 🧹 Tối ưu và dọn dẹp mã nguồn |
| `/test-coverage` | 🧪 Kiểm tra độ phủ của unit test |
| `/quality-gate` | ⚖️ Kiểm soát tiêu chuẩn chất lượng code |
| `/build-fix` | 🛠️ Tự động tìm và sửa lỗi build |
| `/review-pr` | 👁️ Phân tích Pull Request |
| `/checkpoint` | 💾 Lưu lại trạng thái công việc hiện tại |
| `/evolve` | 🧬 Nâng cấp code theo yêu cầu |
| `/learn` | 📖 Phân tích và học hỏi từ codebase |
| `/multi-plan` | 🗺️ Lập kế hoạch đa thành phần phức tạp |
| `/loop-start` | 🔄 Chạy task tự động theo vòng lặp |
| `/sessions` | 📑 Quản lý (Lưu/Khôi phục) phiên làm việc |

> [!TIP]
> **Pipeline PRP:** Sử dụng chuỗi `/prp-plan` → `/prp-implement` → `/prp-commit` để thực hiện quy trình từ Lập kế hoạch đến Triển khai và Commit một cách chuyên nghiệp.

#### 💡 Ví dụ thực tế:
```bash
/plan "Thêm chức năng đăng nhập bằng Google OAuth"
/code-review
/feature-dev "Xây dựng API quản lý sản phẩm"
```

---

### 2. 🧩 Skills Tự Động (148 Skills)
Skills sẽ **tự động kích hoạt** dựa trên ngữ cảnh công nghệ bạn đang làm việc. Claude sẽ tự nhận diện và áp dụng các Best Practices phù hợp.

| Nhóm | Các Skill Nổi Bật |
| :--- | :--- |
| **🐍 Python** | `python-patterns`, `django-tdd`, `django-security` |
| **🐹 Golang** | `golang-patterns`, `golang-testing` |
| **📱 Kotlin** | `kotlin-coroutines-flows`, `kotlin-ktor-patterns` |
| **🦀 Rust** | `rust-patterns`, `rust-testing` |
| **🎨 Frontend** | `frontend-patterns`, `ui-to-vue`, `frontend-slides` |
| **☁️ DevOps** | `docker-patterns`, `deployment-patterns` |
| **🗄️ Database** | `database-migrations`, `postgres-patterns` |
| **🛡️ Security** | `security-scan`, `security-bounty-hunter`, `hipaa-compliance` |
| **🤖 AI/Agent** | `agentic-engineering`, `prompt-optimizer`, `token-budget-advisor` |
| **🎬 Video** | `remotion-video-creation`, `video-editing`, `manim-video` |
| **🔬 Research** | `deep-research`, `market-research`, `iterative-retrieval` |

---

### 3. 🛠️ Công Cụ CLI `npx ecc`
Sử dụng dòng lệnh để cấu hình và tra cứu nhanh.

```bash
# 🔍 Tra cứu skill/rule phù hợp cho mục tiêu cụ thể
npx ecc consult "security reviews" --target claude

# 📦 Cài đặt môi trường cho ngôn ngữ cụ thể
npx ecc typescript
npx ecc python
npx ecc golang

# 📊 Khởi chạy Dashboard GUI (Yêu cầu Python)
python scripts/ecc_dashboard.py
```

---

## 🧠 Cơ Chế Hoạt Động Hệ Thống

ECC hoạt động dựa trên sự kết hợp của 3 thành phần cốt lõi:

*   **Rules** (89 files): Định nghĩa các tiêu chuẩn và quy ước nghiêm ngặt. Tự động áp dụng theo ngôn ngữ lập trình.
*   **Skills** (148 files): Cung cấp hướng dẫn thực thi chi tiết (how-to) cho từng nghiệp vụ.
*   **Commands**: Các workflow đóng gói sẵn để tăng tốc quy trình làm việc.

> [!IMPORTANT]
> Bạn không cần cấu hình phức tạp. ECC được thiết kế để **chạy ngầm**. Khi bạn code, Claude sẽ tự động load Rules và kích hoạt Skills phù hợp để hỗ trợ bạn tạo ra mã nguồn chất lượng cao nhất.
