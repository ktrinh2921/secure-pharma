# 🔄 Xử lý các luồng chính — SecurePharma

> **Mục đích:** Mô tả tổng quan các chuỗi nghiệp vụ chính của hệ thống bằng ngôn ngữ dễ hiểu — ai cũng hiểu được, không cần biết code.
>
> **Format:** Bảng theo từng luồng — *Tên luồng / Ai làm / Điều kiện / Các bước / Kết quả / Ghi chú*.
>
> **Đối tượng đọc:** Người không biết code, giảng viên, người dùng cuối muốn hiểu hệ thống.

---

## Bảng tổng hợp 7 luồng chính

| # | Tên luồng | Ai làm | UC liên quan | Ghi chú quan trọng |
|:-:|---|---|---|---|
| 1 | Đăng nhập & mở phiên làm việc | Mọi đối tượng | UC-01, UC-02, UC-03 | Token hết hạn sau 8h |
| 2 | Nhập thuốc vào kho | Quản lý, Thủ kho | UC-10, UC-11 | Mỗi lô có HSD riêng |
| 3 | Bán thuốc tại quầy | Quản lý, NV Bán hàng | UC-14, UC-15, UC-16, UC-17, UC-18 | FIFO — bán lô cũ trước |
| 4 | Quản lý nhân viên & phân quyền | Chỉ Quản lý | UC-06 | 3 vai trò, mỗi NV 1 TK |
| 5 | Theo dõi & cảnh báo tồn kho | Mọi đối tượng | UC-12, UC-13, UC-29 | Cảnh báo tự động |
| 6 | Quản lý tài chính (thu — chi — quỹ) | Chủ yếu Quản lý | UC-19, UC-20, UC-21, UC-22 | Phiếu chi không xoá được |
| 7 | Giám sát & cấu hình hệ thống | Chỉ Quản lý | UC-27, UC-28 | Log không xoá — vĩnh viễn |

---

## Luồng 1 — Đăng nhập & mở phiên làm việc

| Mục | Nội dung |
|---|---|
| **Tên luồng** | Đăng nhập & mở phiên làm việc |
| **Ai làm** | Mọi người dùng (Quản lý, NV Bán hàng, Thủ kho) |
| **Điều kiện** | Có tài khoản; tài khoản chưa bị khóa |
| **Các bước** | **1) Nhập** username + password vào form đăng nhập (hoặc bấm nút demo để tự điền nhanh). **2) Bấm "Đăng nhập".** **3) Hệ thống kiểm tra** — đúng → sinh mã token, chuyển sang trang chính. Sai → báo "Sai tài khoản hoặc mật khẩu". **4) Sai 5 lần** → tài khoản bị khóa tạm 15 phút, hiện thông báo. **5) Nếu bị ép đổi mật khẩu** (tài khoản mới hoặc vừa reset) → chuyển sang trang đổi mật khẩu, không cho vào app trước. |
| **Kết quả** | Vào được trang chính; mọi thao tác sau đều kèm token để hệ thống nhận diện ai đang dùng |
| **Ghi chú** | Token có thời hạn 8 giờ; hết hạn phải đăng nhập lại. Mỗi người dùng có 1 trong 3 vai trò: Quản lý (toàn quyền), NV Bán hàng (bán hàng + khách hàng), Thủ kho (nhập kho + lô thuốc). |

---

## Luồng 2 — Nhập thuốc vào kho

| Mục | Nội dung |
|---|---|
| **Tên luồng** | Nhập thuốc — từ đặt hàng đến cập nhật tồn kho |
| **Ai làm** | Quản lý, Thủ kho |
| **Điều kiện** | Đã có danh sách nhà cung cấp; thuốc đã được khai báo trong hệ thống |
| **Các bước** | **1) Chọn** nhà cung cấp từ danh sách (có thể gõ tìm). **2) Thêm dòng lô** — chọn thuốc, nhập số lượng, ngày sản xuất, hạn sử dụng, giá nhập. Có thể thêm nhiều dòng cho nhiều lô thuốc khác nhau. **3) Hệ thống tự tính** thành tiền từng dòng (= số lượng × giá nhập). **4) Bấm "Lưu phiếu nhập"** → hệ thống sinh mã phiếu nhập, cộng số lượng vào tồn kho từng lô. |
| **Kết quả** | Lô thuốc mới xuất hiện trong kho; sẵn sàng để bán |
| **Ghi chú** | Mỗi lô có hạn sử dụng riêng — hệ thống sẽ ưu tiên bán lô cũ trước (FIFO). Không thể sửa phiếu sau khi lưu; muốn sửa phải dùng chức năng "Điều chỉnh tồn kho" kèm lý do. |

---

## Luồng 3 — Bán thuốc tại quầy

| Mục | Nội dung |
|---|---|
| **Tên luồng** | Bán thuốc — từ chọn thuốc đến in hóa đơn |
| **Ai làm** | Quản lý, NV Bán hàng |
| **Điều kiện** | Thuốc còn tồn trong kho |
| **Các bước** | **1) Tìm thuốc** bằng ô tìm kiếm (gõ tên hoặc quét mã). **2) Thêm vào giỏ** — bấm vào thuốc hoặc quét mã vạch → thuốc được thêm vào giỏ với số lượng = 1. **3) Điều chỉnh giỏ** — bấm +/− để thay đổi số lượng; bấm X để xóa khỏi giỏ. **4) (Tùy chọn) Chọn khách hàng** để lưu lịch sử mua; nhập số tiền giảm giá nếu có. **5) Nhập tiền khách đưa** → hệ thống tự tính tiền thối. **6) Bấm "Thanh toán"** → hệ thống tự trừ tồn kho (lấy từ lô cũ nhất trước), sinh hóa đơn + phiếu thu, hiện popup in hóa đơn. |
| **Kết quả** | Hóa đơn được tạo; tồn kho giảm; tiền được ghi nhận vào sổ quỹ |
| **Ghi chú** | Nếu tồn kho không đủ → báo lỗi, không cho bán. Hóa đơn chỉ bị huỷ bởi Quản lý; khi huỷ, tồn kho được hoàn lại. Hệ thống tự động chọn lô cũ nhất để bán trước (FIFO) nhằm tránh thuốc hết hạn trong kho. |

---

## Luồng 4 — Quản lý nhân viên & phân quyền

| Mục | Nội dung |
|---|---|
| **Tên luồng** | Quản lý nhân viên — tạo tài khoản, gán vai trò, khoá/mở |
| **Ai làm** | Chỉ Quản lý |
| **Điều kiện** | Đăng nhập với tài khoản Quản lý |
| **Các bước** | **1) Mở trang Nhân viên** → xem danh sách (tên, SĐT, vai trò, trạng thái). **2) Tạo nhân viên mới** — nhập họ tên, SĐT, giới tính, lương, vai trò, chọn có cấp tài khoản không. Hệ thống sinh tài khoản + mật khẩu tạm thời để Quản lý chuyển cho nhân viên. **3) Gán/sửa vai trò** — vai trò quyết định người đó được làm gì: Quản lý (toàn quyền), NV Bán hàng (bán + khách hàng), Thủ kho (nhập kho + lô). **4) Khoá/mở tài khoản** — bấm icon khoá nếu nhân viên nghỉ việc hoặc vi phạm. **5) Reset mật khẩu** — bấm icon chìa khoá để sinh mật khẩu mới cho nhân viên đã quên. |
| **Kết quả** | Nhân viên có tài khoản để đăng nhập; mỗi vai trò chỉ thấy chức năng được phép dùng |
| **Ghi chú** | Mỗi nhân viên chỉ có 1 tài khoản. Lương chỉ Quản lý thấy — nhân viên khác không nhìn thấy. Nhân viên mới phải đổi mật khẩu ở lần đăng nhập đầu tiên. |

---

## Luồng 5 — Theo dõi & cảnh báo tồn kho

| Mục | Nội dung |
|---|---|
| **Tên luồng** | Theo dõi tồn kho — phát hiện thuốc sắp hết hàng, sắp hết hạn |
| **Ai làm** | Mọi người dùng |
| **Điều kiện** | Đã có lô thuốc trong kho |
| **Các bước** | **1) Vào trang "Sắp hết hàng"** — hệ thống tự liệt kê thuốc có tồn ≤ ngưỡng (mặc định ≤ 10). **2) Vào trang "Sắp hết hạn"** — hệ thống tự liệt kê lô sắp hết hạn trong 30 ngày tới, sắp theo hạn gần nhất. **3) Bấm** vào tên thuốc / mã lô để xem chi tiết từng lô. **4) Quản lý hoặc Thủ kho** có thể điều chỉnh số lượng tồn nếu phát hiện hỏng, mất hoặc đếm sai — nhập số lượng mới + lý do bắt buộc. |
| **Kết quả** | Biết thuốc nào cần nhập gấp, lô nào cần xử lý trước hạn |
| **Ghi chú** | Ngưỡng cảnh báo có thể thay đổi ở trang Cấu hình. Mỗi lần điều chỉnh tồn đều được ghi log (ai sửa, sửa gì, khi nào, lý do gì). Không ai xoá được log để đảm bảo tính kiểm toán. |

---

## Luồng 6 — Quản lý tài chính (thu — chi — quỹ)

| Mục | Nội dung |
|---|---|
| **Tên luồng** | Quản lý dòng tiền — ghi nhận thu, chi, theo dõi sổ quỹ |
| **Ai làm** | Chủ yếu Quản lý |
| **Điều kiện** | Đã có giao dịch bán hàng hoặc chi phí phát sinh |
| **Các bước** | **Thu tiền:** Mỗi khi bán hàng (Luồng 3), hệ thống tự sinh 1 phiếu thu gắn với hóa đơn. Quản lý cũng có thể lập phiếu thu khác (hợp đồng, hoa hồng…). **Chi tiền:** Quản lý vào trang Phiếu chi → bấm "Lập phiếu chi" → nhập số tiền + nội dung. Hệ thống kiểm tra số dư; nếu số tiền lớn hơn số dư → từ chối, báo "Vượt quá số dư". **Xem sổ quỹ:** Trang Tài chính hiển thị tổng thu, tổng chi, số dư + biểu đồ theo ngày. Chọn khoảng ngày để xem chi tiết kỳ cụ thể, có so sánh với kỳ trước (tăng bao nhiêu %, giảm bao nhiêu %). |
| **Kết quả** | Nắm được dòng tiền ra/vào; biết lãi/lỗ theo từng khoảng thời gian |
| **Ghi chú** | Phiếu chi không thể xoá/sửa sau khi lưu (để giữ tính toàn vẹn kế toán). Hóa đơn bị huỷ thì phiếu thu tương ứng không còn tính vào sổ quỹ. Lợi nhuận tính = Doanh thu − Giá vốn (tính theo đúng lô đã bán, FIFO). |

---

## Luồng 7 — Giám sát & cấu hình hệ thống

| Mục | Nội dung |
|---|---|
| **Tên luồng** | Giám sát & cấu hình — ai làm gì, thay đổi tham số hệ thống |
| **Ai làm** | Chỉ Quản lý |
| **Điều kiện** | Đăng nhập với tài khoản Quản lý |
| **Các bước** | **Xem nhật ký thao tác:** Vào trang "Nhật ký thao tác" → thấy bảng ghi lại: ai đăng nhập, ai tạo/sửa/xoá bản ghi nào, lúc mấy giờ, từ địa chỉ IP nào. Có thể lọc theo ngày, theo bảng dữ liệu, theo từ khoá. Bấm icon mắt để xem chi tiết dòng log — hệ thống hiện dữ liệu cũ và dữ liệu mới dạng JSON. **Thay đổi cấu hình:** Vào trang "Cấu hình hệ thống" → sửa các tham số: tên cửa hàng, địa chỉ, số ngày cảnh báo hết hạn, ngưỡng cảnh báo hết hàng, tỷ lệ VAT. Thay đổi có hiệu lực ngay trên toàn app mà không cần restart server. |
| **Kết quả** | Quản lý nắm toàn bộ hoạt động trên hệ thống; điều chỉnh tham số vận hành dễ dàng |
| **Ghi chú** | Nhật ký thao tác không ai được xoá — lưu vĩnh viễn phục vụ kiểm toán. Các thông tin nhạy cảm (mật khẩu, khoá API) không lưu ở trang cấu hình mà nằm trong file `.env` của backend — không ai truy cập qua giao diện web. |
