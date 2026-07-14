// File: js/bookings.js

document.addEventListener("DOMContentLoaded", async function() {
    console.log("🚀 [ManageBookings] Đang tải danh sách đơn hàng thực tế từ API...");

    const tableBody = document.getElementById("booking-table-body");
    const searchInput = document.getElementById("search-input");
    const btnSearch = document.getElementById("btn-search");

    // Khởi tạo biến lưu trữ dữ liệu đơn hàng lấy từ API để dùng chung
    let allBookingsList = [];

    // =========================================================================
    // 1. GỌI API LẤY TOÀN BỘ DỮ LIỆU ĐẶT PHÒNG
    // =========================================================================
    async function fetchBookingsFromApi() {
        if (typeof HomeetBackend !== 'undefined' && typeof HomeetBackend.getAllBookings === 'function') {
            try {
                // ĐÂY LÀ HÀM GỌI API THẬT
                const data = await HomeetBackend.getAllBookings();
                // Sắp xếp đơn hàng mới nhất lên đầu dựa trên ID hoặc createdAt (nếu có)
                allBookingsList = data.reverse(); 
                console.log(`✅ [ManageBookings] Đã tải ${allBookingsList.length} đơn hàng.`);
                
                // Mặc định render toàn bộ danh sách khi tải xong
                renderTable(allBookingsList);
            } catch (error) {
                console.error("❌ Lỗi khi tải đơn hàng từ API:", error);
                if(tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Lỗi khi tải dữ liệu đơn hàng!</td></tr>`;
            }
        } else {
            console.error("❌ Không tìm thấy đối tượng HomeetBackend! Bạn đã nhúng file backend-service.js chưa?");
        }
    }

    // =========================================================================
    // 2. HÀM RENDER BẢNG DỮ LIỆU ĐƠN HÀNG (Dùng Data thật)
    // =========================================================================
    function renderTable(dataToRender) {
        if (!tableBody) return;
        tableBody.innerHTML = "";
        
        if (dataToRender.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Không tìm thấy mã đặt phòng nào trùng khớp!</td></tr>`;
            return;
        }

        dataToRender.forEach((item) => {
            let statusBadge = "";
            let actionButtons = "";

            // Xử lý hiển thị Badge và bộ nút cập nhật Check-in/Check-out thật tương ứng
            if (item.status === "Đã thanh toán") {
                statusBadge = `<span class="badge bg-primary">Đã thanh toán</span>`;
                // Nút "Khách đến" thực tế sẽ gọi cập nhật trạng thái thành "Đã Check-in"
                actionButtons = `<button class="btn btn-sm btn-warning btn-action btn-checkin" data-id="${item.id}" data-next-status="Đã Check-in"><i class="bi bi-box-arrow-in-right"></i> Khách đến (Check-in)</button>`;
            } else if (item.status === "Đã Check-in") {
                statusBadge = `<span class="badge bg-warning text-dark">Đang ở (Checked-in)</span>`;
                // Nút "Trả phòng" thực tế sẽ gọi cập nhật trạng thái thành "Đã Check-out"
                actionButtons = `<button class="btn btn-sm btn-success btn-action btn-checkout" data-id="${item.id}" data-next-status="Đã Check-out"><i class="bi bi-box-arrow-left"></i> Trả phòng (Check-out)</button>`;
            } else {
                statusBadge = `<span class="badge bg-secondary">Hoàn thành (Checked-out)</span>`;
                // Trạng thái đã Check-out không còn nút hành động nữa
                actionButtons = `<span class="text-muted small"><i class="bi bi-check2-all text-muted"></i> Lịch trình kết thúc</span>`;
            }

            // Đồng bộ tên trường dữ liệu từ API thật (từ Seed Data đẹp)
            const gName = item.guestName || item.customerName || "Khách lẻ";
            const fPrice = item.totalPrice ? Number(item.totalPrice).toLocaleString('vi-VN') + "đ" : "0đ";
            const fSchedule = `${item.checkIn} - ${item.checkOut}`;

            let row = `
                <tr>
                    <td><strong>#${item.id}</strong></td>
                    <td>${gName}</td>
                    <td>${item.roomName}</td>
                    <td><small>${fSchedule}</small></td>
                    <td class="fw-bold">${fPrice}</td>
                    <td>${statusBadge}</td>
                    <td class="text-center">${actionButtons}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        attachActionEvents();
    }

    // =========================================================================
    // 3. XỬ LÝ NGHIỆP VỤ CHECK-IN / CHECK-OUT THẬT QUA API
    // =========================================================================
    function attachActionEvents() {
        // Lấy toàn bộ các nút action (Check-in và Check-out)
        document.querySelectorAll(".btn-action").forEach(btn => {
            btn.addEventListener("click", async function() {
                // Hiển thị trạng thái đang xử lý trên nút
                const originalContent = this.innerHTML;
                this.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status"></span> Đang xử lý...`;
                this.disabled = true;

                // Lấy ID đơn hàng và trạng thái tiếp theo từ dataset trên nút bấm
                const bookingId = this.getAttribute("data-id");
                const nextStatus = this.getAttribute("data-next-status");

                console.log(`📡 [MockAPI] Đang cập nhật đơn hàng #${bookingId} thành trạng thái '${nextStatus}'...`);

                // --- KEY: GỌI API CẬP NHẬT TRẠNG THÁI LÊN MOCKAPI ---
                if (typeof HomeetBackend !== 'undefined' && typeof HomeetBackend.updateBookingStatus === 'function') {
                    try {
                        const updatedBooking = await HomeetBackend.updateBookingStatus(bookingId, nextStatus);
                        console.log(`✅ [MockAPI] Cập nhật thành công!`, updatedBooking);
                        
                        // Cập nhật lại trạng thái trong mảng dữ liệu đang lưu cục bộ để đồng bộ giao diện
                        const bookingIndex = allBookingsList.findIndex(b => b.id === bookingId);
                        if (bookingIndex !== -1) {
                            allBookingsList[bookingIndex].status = nextStatus;
                        }

                        // Render lại bảng với dữ liệu mới (Hoặc có thể gọi lại API để tải lại hoàn toàn)
                        executeCurrentRender();
                    } catch (error) {
                        console.error("❌ Lỗi khi cập nhật trạng thái đơn hàng qua API:", error);
                        alert(`❌ Lỗi hệ thống: Không thể thực hiện hành động này. Vui lòng thử lại sau!`);
                        
                        // Phục hồi lại nút nếu bị lỗi
                        this.innerHTML = originalContent;
                        this.disabled = false;
                    }
                }
            });
        });
    }

    // =========================================================================
    // 4. XỬ LÝ TÌM KIẾM VÀ TẢI DỮ LIỆU LẦN ĐẦU
    // =========================================================================
    // Hàm hỗ trợ render lại đúng theo bộ lọc tìm kiếm hiện tại
    function executeCurrentRender() {
        const keyword = searchInput.value.trim().toLowerCase();
        if (keyword !== "") {
            const filtered = allBookingsList.filter(b => b.id.toString().includes(keyword));
            renderTable(filtered);
        } else {
            renderTable(allBookingsList);
        }
    }

    // Sự kiện Tìm kiếm mã phòng
    if (btnSearch) btnSearch.addEventListener("click", executeCurrentRender);
    if (searchInput) searchInput.addEventListener("keyup", function(e) {
        if (e.key === "Enter") executeCurrentRender();
    });

    // --- KÍCH HOẠT GỌI API LẦN ĐẦU TIÊN ---
    fetchBookingsFromApi();
});