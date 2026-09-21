# Bảng đặc tả chi tiết các chức năng — SecurePharma

> **File tách riêng** — chỉ chứa bảng đặc tả 29 Use Case, không có sơ đồ.
>
> **Mục đích:** Tra cứu nhanh khi viết báo cáo, đọc trên mobile, in PDF.
>
> **Format:** Bảng 7 cột — *Tên chức năng / Đối tượng SD / Điều kiện đầu vào / Nội dung / Cách xử lý / Kết quả / Ghi chú*.
>
> **Quy ước cột "Cách xử lý":** mô tả **thao tác người dùng trên giao diện** (bấm nút nào, nhập gì, chọn gì) + **phản hồi hiển thị** của hệ thống, theo từng bước 1→N. KHÔNG mô tả SQL/transaction.

---

## Mục lục (nhảy nhanh)

| Nhóm | UC | Mục |
|---|---|---|
| [4.1 Xác thực & Tài khoản](#41-nhóm-xác-thực--tài-khoản) | UC-01 → UC-06 | §4.1 |
| [4.2 Thuốc & Danh mục](#42-nhóm-thuốc--danh-mục) | UC-07, UC-08, UC-09 | §4.2 |
| [4.3 Kho & Lô thuốc](#43-nhóm-kho--lô-thuốc) | UC-10, UC-11, UC-12, UC-13, UC-29 | §4.3 |
| [4.4 Bán hàng](#44-nhóm-bán-hàng) | UC-14 → UC-18 | §4.4 |
| [4.5 Tài chính](#45-nhóm-tài-chính) | UC-19, UC-20, UC-21, UC-22 | §4.5 |
| [4.6 Thống kê](#46-nhóm-thống-kê) | UC-23, UC-24, UC-25, UC-26 | §4.6 |
| [4.7 Quản trị hệ thống](#47-nhóm-quản-trị-hệ-thống) | UC-27, UC-28 | §4.7 |

**Diễn giải Actor:**
- **A1** = Quản lý (Admin) — `TaiKhoan.VaiTro = 'Admin'`
- **A2** = NV Bán hàng — `TaiKhoan.VaiTro = 'NV_BanHang'`
- **A3** = Thủ kho — `TaiKhoan.VaiTro = 'NV_Kho'`

---

## 4.1. Nhóm Xác thực & Tài khoản

### UC-01 — Đăng nhập

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Đăng nhập |
| **Đối tượng SD** | A1, A2, A3 |
| **Điều kiện đầu vào** | Tài khoản đang `HoatDong`; nhân viên còn `DangLam`; nhập `username` + `password` |
| **Nội dung chức năng** | Xác thực người dùng, mở phiên làm việc |
| **Cách xử lý** | 1) Mở trang `/login` → form hiện 2 ô Tên đăng nhập + Mật khẩu + nút "Đăng nhập" + 3 nút tài khoản demo (Quản lý / Bán hàng / Thủ kho). 2) (Tuỳ chọn) Click 1 trong 3 nút demo → hệ thống tự điền username + password vào form. 3) Nhập tay username, password (bấm icon con mắt để hiện/ẩn MK). 4) Bấm nút **Đăng nhập**. 5) Nếu đúng → chuyển sang trang Dashboard (hoặc trang đang muốn vào trước đó). 6) Nếu sai → toast đỏ "Tài khoản hoặc mật khẩu không đúng". 7) Sai 5 lần → khoá 15 phút, hiện "Tài khoản bị khoá tạm thời". |
| **Kết quả** | Vào được trang chính; nếu `MustChangePassword=1` → bị đẩy sang trang đổi MK (UC-05) |
| **Ghi chú** | Bấm demo để autofill nhanh khi báo cáo. Không cần ghi nhớ MK phức tạp. |

### UC-02 — Đổi mật khẩu

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Đổi mật khẩu |
| **Đối tượng SD** | A1, A2, A3 (đã đăng nhập) |
| **Điều kiện đầu vào** | Đang trong phiên đăng nhập; có MK hiện tại |
| **Nội dung chức năng** | Thay MK hiện tại bằng MK mới |
| **Cách xử lý** | 1) Vào menu user (góc phải header) → chọn **Đổi mật khẩu** (hoặc bị đẩy vào `/doi-mat-khau` nếu `MustChangePassword=1`). 2) Trang đổi MK hiện form 3 ô: MK hiện tại, MK mới, Nhập lại MK mới. 3) Nhập đủ 3 ô. 4) Bấm **Đổi mật khẩu**. 5) Nếu hợp lệ → toast xanh "Đổi mật khẩu thành công" → tự đăng xuất về trang login. 6) Nếu MK cũ sai / MK mới không đạt yêu cầu → toast đỏ, yêu cầu nhập lại. |
| **Kết quả** | MK mới có hiệu lực từ lần đăng nhập sau; mọi refresh token cũ bị vô hiệu |
| **Ghi chú** | MK mới ≥ 8 ký tự, có chữ hoa + thường + số + ký tự đặc biệt. Phải khác MK cũ. |

### UC-03 — Đăng xuất

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Đăng xuất |
| **Đối tượng SD** | A1, A2, A3 |
| **Điều kiện đầu vào** | Đang trong phiên đăng nhập |
| **Nội dung chức năng** | Kết thúc phiên làm việc, quay về trang đăng nhập |
| **Cách xử lý** | 1) Người dùng nhấn nút **Đăng xuất** (ở menu user góc phải header). 2) Hệ thống đăng xuất, hiển thị trang đăng nhập. |
| **Kết quả** | Token bị xoá; mọi thao tác sau cần đăng nhập lại |
| **Ghi chú** | Không hiển thị popup xác nhận (đăng xuất là thao tác an toàn, luôn cho phép). |

### UC-04 — Xem hồ sơ cá nhân

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Xem hồ sơ cá nhân |
| **Đối tượng SD** | A1, A2, A3 |
| **Điều kiện đầu vào** | Đã đăng nhập |
| **Nội dung chức năng** | Xem thông tin tài khoản + nhân viên |
| **Cách xử lý** | 1) Click vào avatar / tên user ở góc phải header → menu xổ xuống. 2) Chọn **Hồ sơ cá nhân**. 3) Modal hiển thị: Username, Vai trò, Họ tên, SĐT, Giới tính, Ngày vào làm. 4) Bấm **Đóng** để thoát modal. |
| **Kết quả** | Xem được thông tin cá nhân; không cho sửa trực tiếp (phải nhờ Admin) |
| **Ghi chú** | Nếu cần đổi SĐT/giới tính → liên hệ Admin (UC-06). |

### UC-05 — Bắt buộc đổi mật khẩu lần đầu

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Bắt buộc đổi mật khẩu |
| **Đối tượng SD** | A1, A2, A3 mới được cấp TK / vừa reset MK |
| **Điều kiện đầu vào** | `TaiKhoan.MustChangePassword = 1` (đăng nhập bằng MK tạm) |
| **Nội dung chức năng** | Buộc user phải đổi MK trước khi dùng app |
| **Cách xử lý** | 1) User đăng nhập bằng MK tạm → toast vàng "Vui lòng đổi mật khẩu trước". 2) Hệ thống tự chuyển sang trang `/doi-mat-khau`, chặn mọi route khác. 3) User đổi MK theo UC-02. 4) Sau khi đổi thành công → set `MustChangePassword=0` → cho phép truy cập app bình thường. |
| **Kết quả** | User vào app được; lần sau không bị ép đổi nữa |
| **Ghi chú** | Áp dụng cho: tạo NV mới (UC-06), cấp TK cho NV cũ, Admin reset MK. |

### UC-06 — Quản lý nhân viên

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Quản lý nhân viên |
| **Đối tượng SD** | A1 |
| **Điều kiện đầu vào** | Đăng nhập với vai trò Quản lý |
| **Nội dung chức năng** | Tạo / sửa / xoá / cấp TK / reset MK / khoá NV; xem thống kê NV |
| **Cách xử lý** | 1) Sidebar → **Nhân viên**. 2) Trang hiển thị bảng NV (tên, SĐT, giới tính, lương, vai trò, trạng thái, SL tài khoản) + 4 ô thống kê trên đầu + ô tìm kiếm + bộ lọc (vai trò, trạng thái). 3) **Tạo NV mới:** bấm nút **+ Thêm nhân viên** → modal hiện form (Họ tên, SĐT, giới tính, lương, vai trò, có cấp tài khoản không) → điền → bấm **Tạo** → nếu chọn cấp TK → modal hiện thêm ô username + password (hoặc bấm "tự sinh") → bấm **Tạo** → toast xanh + hiện MK tạm 1 lần để Admin chuyển cho NV. 4) **Xem chi tiết NV:** bấm icon mắt trên dòng NV → modal hiện thông tin + lịch sử HĐ + lịch sử phiếu nhập. 5) **Sửa NV:** bấm icon bút → modal sửa → **Lưu**. 6) **Reset MK:** bấm icon chìa khoá → xác nhận → hệ thống sinh MK mới → hiện MK tạm để chuyển cho NV. 7) **Khoá/Mở TK:** bấm icon khoá → xác nhận. 8) **Xoá NV:** bấm icon thùng rác → xác nhận (chỉ xoá được NV chưa có TK). 9) Bấm **Đóng** để thoát modal. |
| **Kết quả** | NV mới / cập nhật / xoá / khoá thành công; NV mới phải đổi MK ở lần đăng nhập đầu |
| **Ghi chú** | MK tự sinh 12 ký tự (chữ + số); Admin cần ghi nhận và chuyển cho NV qua kênh ngoài (chat, giấy). |

---

## 4.2. Nhóm Thuốc & Danh mục

### UC-07 — Quản lý danh mục thuốc

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Quản lý danh mục thuốc |
| **Đối tượng SD** | A1 |
| **Điều kiện đầu vào** | Đăng nhập Quản lý |
| **Nội dung chức năng** | CRUD nhóm thuốc (VD: Kháng sinh, Giảm đau, Vitamin…) |
| **Cách xử lý** | 1) Sidebar → **Danh mục thuốc** (mục Thuốc). 2) Trang hiển thị bảng DM (Mã, Tên, Mô tả, Số thuốc) + ô tìm kiếm. 3) **Thêm:** bấm **+ Thêm danh mục** → modal form (Tên DM, Mô tả) → **Lưu**. 4) **Sửa:** bấm icon bút → modal sửa → **Lưu**. 5) **Xoá:** bấm icon thùng rác → xác nhận (chỉ xoá được DM chưa có thuốc). 6) **Đóng** modal. |
| **Kết quả** | DM mới xuất hiện trong dropdown chọn DM ở trang Thuốc |
| **Ghi chú** | Tên DM không được trùng nhau. |

### UC-08 — Quản lý thuốc

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Quản lý thuốc |
| **Đối tượng SD** | A1 |
| **Điều kiện đầu vào** | Đăng nhập Quản lý; đã có DM muốn gán |
| **Nội dung chức năng** | CRUD thông tin thuốc trong danh mục |
| **Cách xử lý** | 1) Sidebar → **Thuốc**. 2) Trang hiển thị bảng thuốc (Mã, Tên, Hoạt chất, Khối lượng, Giá bán tham khảo, DM, Tồn kho) + ô tìm kiếm + bộ lọc DM. 3) **Thêm:** bấm **+ Thêm thuốc** → modal form (Tên, Hoạt chất, Khối lượng, Giá bán, Mô tả, Liều dùng, Chống chỉ định, Ghi chú, chọn DM từ dropdown) → **Lưu**. 4) **Xem chi tiết:** bấm tên thuốc → trang chi tiết (thông tin + lịch sử giá nhập). 5) **Sửa:** bấm icon bút → modal sửa → **Lưu**. 6) **Xoá:** bấm icon thùng rác → xác nhận (chỉ xoá được thuốc chưa có lô). 7) **Đóng** modal. |
| **Kết quả** | DS thuốc cập nhật; thuốc mới có thể được nhập kho (UC-11) và bán (UC-15) |
| **Ghi chú** | Tìm nhanh bằng tên, Mã thuốc, hoặc lọc theo DM. |

### UC-09 — Tìm kiếm thuốc

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Tìm kiếm thuốc |
| **Đối tượng SD** | A1, A2, A3 |
| **Điều kiện đầu vào** | Đã đăng nhập |
| **Nội dung chức năng** | Gợi ý thuốc khi gõ tên/Mã |
| **Cách xử lý** | 1) Ở bất kỳ trang nào có ô tìm thuốc (bán hàng, nhập kho…), gõ từ khoá vào ô. 2) Sau 300ms không gõ thêm → dropdown hiện tối đa 10 gợi ý (Tên, Mã, DM). 3) Click chọn 1 gợi ý → điền vào form. 4) Nếu không thấy → gõ thêm ký tự hoặc nhấn Enter để xem toàn bộ kết quả. |
| **Kết quả** | Tìm thuốc nhanh không cần rời trang |
| **Ghi chú** | Có thể tìm bằng ký tự đặc biệt (VD "100%" tìm đúng thuốc có chữ "100%"). |

---

## 4.3. Nhóm Kho & Lô thuốc

### UC-10 — Quản lý nhà cung cấp

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Quản lý nhà cung cấp |
| **Đối tượng SD** | A1, A3 |
| **Điều kiện đầu vào** | Đăng nhập Quản lý hoặc Thủ kho |
| **Nội dung chức năng** | CRUD nhà cung cấp thuốc |
| **Cách xử lý** | 1) Sidebar → **Nhà cung cấp** (mục Kho). 2) Trang hiển thị bảng NCC (Mã, Tên, SĐT, Email, MST, Người liên hệ, Số phiếu nhập). 3) **Thêm:** bấm **+ Thêm NCC** → modal form (Tên NCC, Địa chỉ, SĐT, Email, MST, Người LH, Ghi chú) → **Lưu**. 4) **Sửa:** bấm icon bút → modal sửa → **Lưu**. 5) **Xoá:** bấm icon thùng rác → xác nhận (chỉ xoá được NCC chưa có phiếu nhập). 6) **Đóng** modal. |
| **Kết quả** | DS NCC cập nhật; NCC mới xuất hiện trong dropdown chọn NCC khi nhập kho (UC-11) |
| **Ghi chú** | SĐT được mã hoá AES-256 trong DB nhưng hiển thị plaintext khi xem. |

### UC-11 — Tạo phiếu nhập

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Tạo phiếu nhập |
| **Đối tượng SD** | A1, A3 |
| **Điều kiện đầu vào** | Đã chọn NCC; thuốc trong DS; có ít nhất 1 dòng lô |
| **Nội dung chức năng** | Nhập lô thuốc mới vào kho |
| **Cách xử lý** | 1) Sidebar → **Kho** → **Tạo phiếu nhập**. 2) Trang hiển thị form: dropdown NCC + bảng các dòng lô trống. 3) **Chọn NCC** từ dropdown (có thể gõ để tìm). 4) **Thêm dòng lô:** bấm **+ Thêm dòng** → 1 hàng mới hiện ra: dropdown chọn thuốc (có ô tìm), ô Số lượng, ô Ngày SX, ô Hạn SD, ô Giá nhập. 5) Điền các ô → hệ thống tự tính Thành tiền = SL × Giá nhập. 6) Có thể thêm nhiều dòng cho nhiều thuốc/lô. 7) **Xoá dòng:** bấm icon X ở cuối hàng. 8) Bấm **Lưu phiếu nhập** → xác nhận trong popup → phiếu nhập được tạo, tự sinh Mã PN. 9) Trang chuyển sang chi tiết phiếu nhập vừa tạo. |
| **Kết quả** | Phiếu nhập mới ở trạng thái "Đã nhập"; tồn kho từng thuốc tăng theo; có thể bán ngay |
| **Ghi chú** | Hạn SD phải sau Ngày SX. Sau khi tạo → không thể sửa; muốn sửa dùng UC-29 (điều chỉnh tồn). |

### UC-12 — Quản lý lô thuốc

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Quản lý lô thuốc |
| **Đối tượng SD** | A1, A3 (A2 chỉ xem đơn giản) |
| **Điều kiện đầu vào** | Đã đăng nhập; thuốc đã có lô nhập |
| **Nội dung chức năng** | Xem chi tiết các lô của 1 thuốc |
| **Cách xử lý** | 1) Vào trang **Thuốc** → bấm tên 1 thuốc → trang chi tiết thuốc. 2) Click tab **Lô thuốc**. 3) Bảng hiển thị các lô (Mã lô, Ngày nhập, Số lượng nhập, Tồn kho, Ngày SX, Hạn SD, Số ngày còn lại) — sắp xếp lô cũ lên đầu (FIFO). 4) Có thể bấm icon **Lịch sử điều chỉnh** để xem lịch sử sửa tồn của từng lô. |
| **Kết quả** | Biết được thuốc còn bao nhiêu, lô nào sắp hết hạn |
| **Ghi chú** | NV Bán hàng chỉ thấy Mã lô, Tồn kho, Hạn SD; KHÔNG thấy giá nhập, NCC (bảo mật). |

### UC-13 — Xem cảnh báo tồn kho

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Xem cảnh báo tồn kho |
| **Đối tượng SD** | A1, A2, A3 |
| **Điều kiện đầu vào** | Đã đăng nhập |
| **Nội dung chức năng** | DS thuốc sắp hết + lô sắp hết hạn |
| **Cách xử lý** | 1) Sidebar → **Kho** → **Sắp hết hàng** (hoặc **Sắp hết hạn**). 2) Trang hiển thị bảng cảnh báo. 3) **Sắp hết hàng:** bảng thuốc có tồn ≤ 10 (ngưỡng mặc định, có thể đổi trong UC-27), sắp theo SL tăng dần. 4) **Sắp hết hạn:** bảng lô có hạn SD trong 30 ngày tới (ngưỡng mặc định), sắp theo hạn SD gần nhất. 5) Bấm tên thuốc / mã lô → chuyển sang trang chi tiết. 6) Dùng ô tìm để lọc nhanh. |
| **Kết quả** | Biết cần nhập thêm thuốc nào, xử lý lô nào trước |
| **Ghi chú** | Ngưỡng có thể đổi runtime ở trang Cấu hình (UC-27). |

### UC-29 — Điều chỉnh tồn kho

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Điều chỉnh tồn kho |
| **Đối tượng SD** | A1, A3 |
| **Điều kiện đầu vào** | Lô đang có tồn > 0; lý do ≥ 3 ký tự |
| **Nội dung chức năng** | Sửa SL tồn sau kiểm kê (hỏng, mất, đếm sai) |
| **Cách xử lý** | 1) Vào trang chi tiết thuốc → tab **Lô thuốc** → bấm icon **Điều chỉnh** trên dòng lô cần sửa. 2) Modal hiện: Mã lô, SL hiện tại (readonly), ô nhập **SL mới**, ô **Lý do** (bắt buộc). 3) Nhập SL mới + Lý do. 4) Bấm **Xác nhận** → popup hỏi "Bạn chắc chắn muốn điều chỉnh?" → **Đồng ý**. 5) Modal đóng → toast xanh → bảng lô tự cập nhật SL mới. 6) Xem lịch sử điều chỉnh ở tab **Lịch sử điều chỉnh** trên trang Kho. |
| **Kết quả** | Tồn kho được cập nhật; có 1 dòng audit lưu ai-sửa-gì-khi-nào |
| **Ghi chú** | Sau điều chỉnh, phiếu nhập gốc KHÔNG thể huỷ (ràng buộc nghiệp vụ). |

---

## 4.4. Nhóm Bán hàng

### UC-14 — Quản lý khách hàng

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Quản lý khách hàng |
| **Đối tượng SD** | A1, A2 |
| **Điều kiện đầu vào** | Đăng nhập Quản lý hoặc NV Bán hàng |
| **Nội dung chức năng** | CRUD khách hàng (lưu SĐT để truy xuất lịch sử mua) |
| **Cách xử lý** | 1) Sidebar → **Khách hàng**. 2) Trang hiển thị bảng KH (Mã, Tên, SĐT, Giới tính, Tổng chi tiêu). 3) **Thêm:** bấm **+ Thêm KH** → modal form (Tên, SĐT, Giới tính) → **Lưu**. 4) **Sửa:** bấm icon bút → modal sửa → **Lưu**. 5) **Xoá:** bấm icon thùng rác → xác nhận. 6) **Đóng** modal. |
| **Kết quả** | KH mới xuất hiện trong dropdown chọn KH khi bán (UC-15) |
| **Ghi chú** | SĐT phải là duy nhất (nếu có). Có thể bỏ qua SĐT (mua lẻ không cần lưu). |

### UC-15 — Lập hóa đơn bán hàng

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Lập hóa đơn bán hàng |
| **Đối tượng SD** | A1, A2 |
| **Điều kiện đầu vào** | Thuốc có tồn; đã chọn khách (hoặc bỏ qua); nhập tiền khách đưa |
| **Nội dung chức năng** | Bán thuốc, in hóa đơn, trừ tồn |
| **Cách xử lý** | 1) Sidebar → **Bán hàng**. 2) Trang POS: panel trái = danh sách thuốc (tìm bằng ô search + lọc DM), panel phải = giỏ hàng. 3) **Thêm thuốc vào giỏ:** click thuốc bên trái HOẶC quét mã → thuốc tự thêm vào giỏ với SL = 1. 4) **Sửa SL:** ở giỏ, bấm + / - hoặc gõ trực tiếp vào ô SL. 5) **Xoá khỏi giỏ:** bấm icon X ở cuối dòng. 6) **(Tuỳ chọn) Chọn khách hàng:** bấm dropdown "Chọn khách" → tìm theo tên/SĐT hoặc bấm **+ Thêm mới** để tạo nhanh. 7) **(Tuỳ chọn) Giảm giá:** nhập số tiền giảm vào ô "Giảm giá". 8) Hệ thống tự tính: Tạm tính, Giảm giá, **Tổng cộng**. 9) Nhập **Tiền khách đưa** → hệ thống tự tính **Tiền thối**. 10) Bấm **THANH TOÁN** → popup xác nhận → **Đồng ý**. 11) Modal in hóa đơn hiện ra với Mã HĐ, ngày, danh sách thuốc, tổng tiền. 12) Bấm **In** (mở popup in) hoặc **Đóng**. 13) Giỏ hàng tự reset về rỗng, sẵn sàng cho HĐ tiếp theo. |
| **Kết quả** | HĐ mới (trạng thái "Đã thanh toán"); tồn kho giảm; 1 phiếu thu tự sinh |
| **Ghi chú** | Hệ thống tự chọn lô FIFO (lô cũ → bán trước). Nếu không đủ tồn → toast đỏ "Không đủ tồn kho". |

### UC-16 — Áp dụng giảm giá hóa đơn

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Áp giảm giá hóa đơn |
| **Đối tượng SD** | A1, A2 |
| **Điều kiện đầu vào** | Đang ở trang Bán hàng, có giỏ hàng |
| **Nội dung chức năng** | Áp giảm giá cho cả hóa đơn |
| **Cách xử lý** | 1) Ở trang POS, khi đã có thuốc trong giỏ. 2) Nhập số tiền vào ô **Giảm giá** (góc phải). 3) Hệ thống tự tính lại: Tổng cộng = Tạm tính − Giảm giá. 4) Tiền thối cũng tự cập nhật theo. 5) Bấm **THANH TOÁN** như bình thường (UC-15). |
| **Kết quả** | HĐ lưu số tiền giảm giá; hiển thị trên hóa đơn in ra |
| **Ghi chú** | Giảm giá phải ≤ Tổng cộng (không cho giảm âm). Có thể giảm = 0. |

### UC-17 — Xem chi tiết / in hóa đơn

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Xem / in hóa đơn |
| **Đối tượng SD** | A1, A2, A3 |
| **Điều kiện kiện đầu vào** | Mã HĐ hợp lệ |
| **Nội dung chức năng** | Xem lại hoặc in lại hóa đơn đã lập |
| **Cách xử lý** | 1) Sidebar → **Hóa đơn** (mục Bán hàng). 2) Trang hiển thị bảng HĐ (Mã, Ngày, Khách, NV, Tổng tiền, Trạng thái). 3) **Tìm:** nhập Mã HĐ / tên KH / NV vào ô tìm, lọc theo ngày. 4) **Xem chi tiết:** bấm icon mắt ở dòng HĐ → modal hiện đầy đủ (tên cửa hàng, địa chỉ, ngày, NV bán, khách, bảng dòng thuốc, tạm tính, giảm giá, tổng, tiền khách đưa, tiền thối). 5) Bấm **In hóa đơn** trong modal → mở popup in (Ctrl+P). 6) **Đóng** modal. |
| **Kết quả** | Xem/in được hóa đơn bất kỳ lúc nào |
| **Ghi chú** | Tên cửa hàng + địa chỉ in ra lấy từ UC-27. |

### UC-18 — Huỷ hóa đơn

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Huỷ hóa đơn |
| **Đối tượng SD** | A1 |
| **Điều kiện đầu vào** | HĐ đang "Đã thanh toán"; chưa bị huỷ trước đó |
| **Nội dung chức năng** | Huỷ HĐ sai/lỗi, hoàn tồn kho |
| **Cách xử lý** | 1) Vào trang **Hóa đơn** → bấm icon mắt HĐ cần huỷ. 2) Trong modal chi tiết → bấm nút **Huỷ hóa đơn** (chỉ Admin thấy nút này). 3) Popup xác nhận "Bạn chắc chắn muốn huỷ? Hành động này sẽ hoàn tồn kho" → nhập lý do (bắt buộc) → **Xác nhận**. 4) Modal đóng → toast xanh "Đã huỷ hóa đơn". 5) Bảng HĐ cập nhật trạng thái = "Đã huỷ" (badge xám). 6) Tồn kho các thuốc trong HĐ được hoàn về. |
| **Kết quả** | HĐ chuyển trạng thái "Đã huỷ"; phiếu thu mất hiệu lực; tồn kho phục hồi |
| **Ghi chú** | Không xoá HĐ khỏi DB (giữ để truy vết). Lý do huỷ bắt buộc để audit. |

---

## 4.5. Nhóm Tài chính

### UC-19 — Lập phiếu thu khác

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Lập phiếu thu khác |
| **Đối tượng SD** | A1 |
| **Điều kiện đầu vào** | Đăng nhập Quản lý |
| **Nội dung chức năng** | Ghi nhận khoản thu không phải từ bán hàng (hợp đồng, hoa hồng…) |
| **Cách xử lý** | 1) Sidebar → **Tài chính** → **Phiếu thu** → tab **Khác**. 2) Trang DS phiếu thu khác + ô tìm + bộ lọc ngày. 3) Bấm **+ Lập phiếu thu** → modal form (Số tiền, Nội dung). 4) Điền → bấm **Lưu**. 5) Modal đóng → phiếu mới xuất hiện trên đầu bảng. |
| **Kết quả** | Phiếu thu mới (loại "Khác"); sổ quỹ tăng |
| **Ghi chú** | Phiếu thu từ BÁN HÀNG không lập ở đây — nó tự sinh khi thanh toán (UC-15). |

### UC-20 — Lập phiếu chi

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Lập phiếu chi |
| **Đối tượng SD** | A1 |
| **Điều kiện đầu vào** | Số dư quỹ hiện tại ≥ số tiền muốn chi |
| **Nội dung chức năng** | Ghi nhận khoản chi (lương, NCC, vận hành…) |
| **Cách xử lý** | 1) Sidebar → **Tài chính** → **Phiếu chi**. 2) Trang DS phiếu chi + ô tìm + bộ lọc ngày + ô chọn khoảng ngày. 3) Bấm **+ Lập phiếu chi** → modal form (Số tiền, Nội dung). Hệ thống hiển thị "Số dư hiện tại: X đ". 4) Điền số tiền + nội dung. 5) Bấm **Lưu**. 6) Nếu số tiền > số dư → toast đỏ "Vượt quá số dư". 7) Nếu hợp lệ → toast xanh + phiếu mới xuất hiện trên đầu bảng. |
| **Kết quả** | Phiếu chi mới; sổ quỹ giảm |
| **Ghi chú** | Không thể chi vượt số dư. Không cho sửa/xoá phiếu chi (giữ để audit). |

### UC-21 — Xem sổ quỹ

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Xem sổ quỹ |
| **Đối tượng SD** | A1 |
| **Điều kiện đầu vào** | Đăng nhập Quản lý |
| **Nội dung chức năng** | Xem tổng thu/chi/số dư + biểu đồ + top chi phí |
| **Cách xử lý** | 1) Sidebar → **Tài chính** → **Tổng quan** (hoặc trang chủ Dashboard). 2) Trang hiển thị: 4 ô stat card lớn (Tổng thu, Tổng chi, Số dư, Số phiếu chi tháng này) + 2 biểu đồ (đường: thu-chi theo ngày; tròn: cơ cấu chi phí) + bảng 5 phiếu chi gần nhất. 3) Chọn khoảng ngày (mặc định 30 ngày gần nhất) → biểu đồ + bảng tự cập nhật. 4) Click vào 1 cột trong biểu đồ → lọc ra bảng phiếu thu/chi của ngày đó. |
| **Kết quả** | Nắm được tình hình tài chính realtime |
| **Ghi chú** | Phiếu thu gắn HĐ đã huỷ KHÔNG tính vào số dư. |

### UC-22 — Xem doanh thu / chi phí theo khoảng thời gian

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Xem DT/CP theo khoảng thời gian |
| **Đối tượng SD** | A1 |
| **Điều kiện đầu vào** | Chọn từ ngày – đến ngày |
| **Nội dung chức năng** | Lọc thu/chi/lợi nhuận trong khoảng + so sánh kỳ trước |
| **Cách xử lý** | 1) Sidebar → **Tài chính** → **Tổng quan** (cùng trang UC-21). 2) Chọn **Từ ngày** / **Đến ngày** ở date picker trên đầu. 3) Bấm **Áp dụng** → 4 ô stat + 2 biểu đồ cập nhật. 4) Mỗi stat card có dòng phụ "So với kỳ trước: +X% (màu xanh) hoặc -X% (màu đỏ)". 5) Bấm vào chip khoảng nhanh (7 ngày / 30 ngày / Tháng này / Quý này) để lọc nhanh. |
| **Kết quả** | So sánh được hiệu quả kinh doanh qua từng kỳ |
| **Ghi chú** | Kỳ trước = cùng độ dài, ngay trước kỳ hiện tại. |

---

## 4.6. Nhóm Thống kê

### UC-23 — Thống kê doanh thu

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Thống kê doanh thu |
| **Đối tượng SD** | A1, A2 |
| **Điều kiện đầu vào** | Chọn khoảng ngày (mặc định 30 ngày gần nhất) |
| **Nội dung chức năng** | Xem tổng doanh thu + chart theo ngày + top thuốc bán chạy |
| **Cách xử lý** | 1) Sidebar → **Thống kê** → tab **Doanh thu**. 2) Trang hiển thị: 4 ô stat (Số HĐ, Tổng DT, DT trung bình, DT cao nhất) + biểu đồ cột doanh thu theo ngày + bảng Top 10 thuốc bán chạy + 3 ô so sánh kỳ trước. 3) Đổi khoảng ngày → toàn bộ tự cập nhật. 4) Bấm tên thuốc trong bảng top → chuyển sang trang chi tiết thuốc. 5) Bấm **Xuất Excel** (nếu có) để tải báo cáo. |
| **Kết quả** | Nắm được xu hướng doanh thu + thuốc nào đang hot |
| **Ghi chú** | Chỉ tính HĐ "Đã thanh toán", bỏ HĐ "Đã huỷ". |

### UC-24 — Thống kê tồn kho

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Thống kê tồn kho |
| **Đối tượng SD** | A1, A2, A3 |
| **Điều kiện đầu vào** | Đã đăng nhập |
| **Nội dung chức năng** | Tổng quan tồn kho + cơ cấu theo DM + cảnh báo |
| **Cách xử lý** | 1) Sidebar → **Thống kê** → tab **Tồn kho**. 2) Trang hiển thị: 4 ô stat (Tổng SL tồn, Số mặt hàng, SL sắp hết hàng, SL sắp hết hạn) + biểu đồ tròn (cơ cấu tồn theo DM) + bảng top 10 sắp hết hàng + bảng top 10 lô sắp hết hạn. 3) Bấm vào phần biểu đồ tròn → lọc bảng theo DM đó. 4) Click tên thuốc → sang trang chi tiết. |
| **Kết quả** | Biết được tổng tài sản tồn kho + phân bổ + cảnh báo sớm |
| **Ghi chú** | A3 (Thủ kho) xem được nhưng không xem được doanh thu. |

### UC-25 — Thống kê tài chính

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Thống kê tài chính |
| **Đối tượng SD** | A1 |
| **Điều kiện đầu vào** | Chọn khoảng ngày |
| **Nội dung chức năng** | Tổng thu/chi/lợi nhuận + top 5 loại chi + so sánh kỳ trước |
| **Cách xử lý** | 1) Sidebar → **Thống kê** → tab **Tài chính**. 2) Trang hiển thị: 6 ô stat (Tổng thu, Tổng chi, Doanh thu, Giá vốn đã bán, Lợi nhuận bán, Số dư tiền mặt) + biểu đồ đường thu-chi theo ngày + bảng top 5 loại chi + 5 ô so sánh kỳ trước. 3) Đổi khoảng ngày → toàn bộ cập nhật. 4) Bấm vào 1 dòng top 5 chi → lọc phiếu chi có cùng nội dung. |
| **Kết quả** | Báo cáo tài chính tổng hợp cho chủ cửa hàng |
| **Ghi chú** | Lợi nhuận = Doanh thu - Giá vốn (tính theo đúng lô FIFO đã bán). |

### UC-26 — Top thuốc bán chạy

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Top thuốc bán chạy |
| **Đối tượng SD** | A1, A2 |
| **Điều kiện đầu vào** | Xem trong trang UC-23 (tab Doanh thu) |
| **Nội dung chức năng** | Top 10 thuốc bán chạy theo SL + doanh thu |
| **Cách xử lý** | 1) Vào trang Thống kê → tab Doanh thu (UC-23). 2) Cuộn xuống bảng **Top 10 thuốc bán chạy** (xếp theo SL bán giảm dần). 3) Cột hiển thị: #, Tên thuốc, DM, SL bán, Doanh thu. 4) Bấm tên thuốc → sang trang chi tiết thuốc. |
| **Kết quả** | Biết thuốc nào đang bán chạy để lên kế hoạch nhập hàng |
| **Ghi chú** | Bỏ HĐ đã huỷ. Cùng dữ liệu với UC-23 — chỉ tách ra đặc tả rõ. |

---

## 4.7. Nhóm Quản trị hệ thống

### UC-27 — Cấu hình hệ thống

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Cấu hình hệ thống |
| **Đối tượng SD** | A1 |
| **Điều kiện đầu vào** | Đăng nhập Quản lý |
| **Nội dung chức năng** | Xem/sửa tham số runtime (tên cửa hàng, ngưỡng cảnh báo, VAT…) |
| **Cách xử lý** | 1) Sidebar → **Quản trị** → **Cấu hình hệ thống**. 2) Trang hiển thị danh sách cấu hình dạng key-value (Tên cửa hàng, Địa chỉ, SĐT, Số ngày cảnh báo hết hạn, Số lượng cảnh báo hết hàng, Tỷ lệ VAT, …). 3) **Sửa 1 mục:** click icon bút bên cạnh → ô input hiện ra → sửa → bấm ✓ (lưu) hoặc × (huỷ). 4) Hệ thống lưu ngay → toast xanh "Đã cập nhật". 5) Có hiệu lực ngay trên toàn app (không cần restart). |
| **Kết quả** | Cấu hình thay đổi áp dụng cho toàn hệ thống |
| **Ghi chú** | JWT_SECRET, mật khẩu DB không lưu ở đây (nằm trong `.env` backend). |

### UC-28 — Xem nhật ký thao tác (Audit log)

| Mục | Nội dung |
|---|---|
| **Tên chức năng** | Xem audit log |
| **Đối tượng SD** | A1 |
| **Điều kiện đầu vào** | Đăng nhập Quản lý |
| **Nội dung chức năng** | Tra cứu lịch sử thao tác: ai, làm gì, bảng nào, khi nào, IP |
| **Cách xử lý** | 1) Sidebar → **Quản trị** → **Nhật ký thao tác**. 2) Trang hiển thị bảng log (Thời gian, User, Hành động, Bảng, Mã record, IP). 3) **Lọc:** chọn khoảng ngày, chọn bảng (dropdown), nhập từ khoá tìm. 4) **Xem chi tiết 1 dòng:** bấm icon mắt → modal hiện OldValue / NewValue (JSON). 5) Phân trang ở cuối bảng. |
| **Kết quả** | Truy vết được ai đã thao tác gì với dữ liệu nào, khi nào |
| **Ghi chú** | Log không xoá được — lưu vĩnh viễn để phục vụ kiểm toán. |
