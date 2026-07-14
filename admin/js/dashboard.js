// File: js/dashboard.js

document.addEventListener("DOMContentLoaded", async function() {
    console.log("🚀 [Dashboard] Đang tải dữ liệu thực từ API...");

    // =========================================================================
    // 1. GỌI API LẤY TOÀN BỘ DỮ LIỆU ĐẶT PHÒNG
    // =========================================================================
    let allBookings = [];
    if (typeof HomeetBackend !== 'undefined' && typeof HomeetBackend.getAllBookings === 'function') {
        try {
            // ĐÂY LÀ HÀM GỌI API THẬT
            allBookings = await HomeetBackend.getAllBookings();
            console.log(`✅ [Dashboard] Đã lấy ${allBookings.length} đơn hàng thành công!`);
        } catch (error) {
            console.error("❌ Lỗi khi gọi API getAllBookings:", error);
            return;
        }
    } else {
        console.error("❌ Không tìm thấy đối tượng HomeetBackend! Bạn đã nhúng file backend-service.js chưa?");
        return;
    }

    // =========================================================================
    // 2. TỰ ĐỘNG TÍNH TOÁN CÁC THẺ THỐNG KÊ (CARDS) TỪ DATA THẬT
    // =========================================================================
    let totalRevenue = 0, paidCount = 0, checkedInCount = 0;
    
    allBookings.forEach(booking => {
        // Cộng tổng doanh thu (ép kiểu về Số để tránh lỗi data ảo)
        if (booking.totalPrice && !isNaN(booking.totalPrice)) {
            totalRevenue += Number(booking.totalPrice);
        }
        
        // Đếm số đơn đã thanh toán (bất kể đang checkin hay chưa)
        if (booking.status === "Đã thanh toán" || booking.status === "Đã Check-in" || booking.status === "Đã Check-out") {
            paidCount++;
        }
        
        // Đếm số khách đang ở thực tế
        if (booking.status === "Đã Check-in") {
            checkedInCount++;
        }
    });

    // Hiển thị lên giao diện
    const revenueEl = document.querySelector(".stat-card.border-primary h3");
    if (revenueEl) revenueEl.innerText = totalRevenue.toLocaleString('vi-VN') + "đ";
    
    const paidCountEl = document.getElementById("count-paid");
    if (paidCountEl) paidCountEl.innerText = paidCount + " Đơn";
    
    const activeCountEl = document.getElementById("count-active");
    if (activeCountEl) activeCountEl.innerText = checkedInCount + " Phòng";

    // =========================================================================
    // 3. ĐỔ DANH SÁCH HOẠT ĐỘNG ĐẶT PHÒNG MỚI NHẤT RA BẢNG (Data thật)
    // =========================================================================
    const tbodyBookings = document.getElementById("latest-bookings-tbody");
    if (tbodyBookings) {
        tbodyBookings.innerHTML = "";
        
        // Hiển thị tối đa 5 đơn mới nhất (giả sử dữ liệu trả về đã được sắp xếp theo thời gian)
        const latestFiveBookings = allBookings.slice(-5).reverse();

        if (latestFiveBookings.length === 0) {
            tbodyBookings.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Chưa có hoạt động đặt phòng nào!</td></tr>`;
        } else {
            latestFiveBookings.forEach(item => {
                let badgeClass = "bg-primary";
                if (item.status === "Đã Check-in") badgeClass = "bg-warning text-dark";
                if (item.status === "Đã Check-out") badgeClass = "bg-secondary";
                
                const fPrice = item.totalPrice ? Number(item.totalPrice).toLocaleString('vi-VN') + "đ" : "0đ";

                tbodyBookings.innerHTML += `
                    <tr>
                        <td><strong>#${item.id}</strong></td>
                        <td>${item.guestName || item.customerName || "Khách ẩn danh"}</td>
                        <td>${item.roomName}</td>
                        <td class="fw-bold text-dark">${fPrice}</td>
                        <td><span class="badge ${badgeClass}">${item.status || "Chờ xử lý"}</span></td>
                    </tr>
                `;
            });
        }
    }

    // =========================================================================
    // 4. THUẬT TOÁN ĐIỀU HƯỚNG MA TRẬN LỊCH PHÒNG ĐỘNG VÔ HẠN (Dùng Data thật)
    // =========================================================================
    // Mảng mã phòng khớp với dữ liệu trong `roomsDataset` bên client
    const roomCodes = ["nghinh-phong", "hoa-vang", "vung-ro", "mui-dien"];
    const roomNamesDisplay = ["Nghinh Phong", "Hoa Vàng", "Vũng Rô", "Mũi Điện"];
    
    // Mốc thời gian hệ thống thực tế (Hoặc bạn có thể dùng Date.now() để ra ngày hôm nay)
    let currentPivotDate = new Date(); 
    if (currentPivotDate.getFullYear() < 2026) currentPivotDate = new Date("2026-07-14"); // Dùng ngày giả lập tháng 7/2026

    function renderDynamicCalendar() {
        const theadTr = document.getElementById("calendar-thead-tr");
        const tbodyCalendar = document.getElementById("room-calendar-tbody");
        const monthBadge = document.getElementById("calendar-current-month");
        
        if (!theadTr || !tbodyCalendar) return;

        // Tìm ngày Thứ Hai của tuần chứa ngày mốc hiện tại
        const dayOfWeek = currentPivotDate.getDay(); 
        const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; 
        const mondayOfWeek = new Date(currentPivotDate);
        mondayOfWeek.setDate(currentPivotDate.getDate() + distanceToMonday);

        // Tạo mảng danh sách 7 ngày trong tuần
        const weekDays = [];
        const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
        
        for (let i = 0; i < 7; i++) {
            const nextDay = new Date(mondayOfWeek);
            nextDay.setDate(mondayOfWeek.getDate() + i);
            weekDays.push(nextDay);
        }

        // Cập nhật nhãn tiêu đề tháng/năm hiển thị ở góc
        if (monthBadge) {
            const displayMonth = String(weekDays[0].getMonth() + 1).padStart(2, '0');
            const displayYear = weekDays[0].getFullYear();
            monthBadge.innerText = `Tháng ${displayMonth} / ${displayYear}`;
        }

        // Render lại tiêu đề Header cột ngày tháng (T2 -> CN)
        theadTr.innerHTML = `<th style="width: 180px;" class="text-start">Hạng Phòng</th>`;
        weekDays.forEach((dateObj, index) => {
            const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
            theadTr.innerHTML += `<th>${dayNames[index]} <br><small class="text-muted fw-normal">${dateStr}</small></th>`;
        });

        // Render nội dung trạng thái bận/trống của từng phòng
        tbodyCalendar.innerHTML = "";
        
        roomCodes.forEach((rCode, index) => {
            const rName = roomNamesDisplay[index];
            let rowHtml = `<tr><td class="fw-bold text-start text-secondary small">Phòng ${rName}</td>`;
            
            // Duyệt qua từng ngày trong tuần đang xem để kiểm tra xem có ai đặt trùng không
            weekDays.forEach(dateObj => {
                // Chuyển đổi dateObj sang định dạng YYYY-MM-DD tương thích chuỗi chuẩn (ví dụ từ Seed Data "2026-07-13")
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                const currentStr = `${year}-${month}-${day}`;

                // --- KEY: TÌM KIẾM BOOKING THẬT BAO TRỌN NGÀY NÀY ---
                const activeBooking = allBookings.find(b => {
                    // Kiểm tra đúng phòng và ngày nằm trong khoảng Check-in/Check-out
                    const isCorrectRoom = b.roomCode === rCode;
                    // Seed data dùng YYYY-MM-DD, data cũ có thể dùng DD/MM/YYYY nên cần code convert (tạm thời giả sử YYYY-MM-DD chuẩn)
                    const normalizedCheckIn = b.checkIn; 
                    const normalizedCheckOut = b.checkOut;

                    const isInRange = currentStr >= normalizedCheckIn && currentStr <= normalizedCheckOut;
                    return isCorrectRoom && isInRange;
                });

                if (activeBooking) {
                    // Nếu có booking thật -> Hiển thị ô màu Navy thương hiệu có tên khách
                    const gName = activeBooking.guestName || activeBooking.customerName || "Khách lẻ";
                    rowHtml += `
                        <td style="background-color: var(--color-navy); color: #ffffff; font-size: 0.75rem; font-weight: 600;" class="p-1">
                            <div class="rounded p-1 text-truncate" title="${gName} (#${activeBooking.id})">
                                <i class="bi bi-person-fill text-warning me-1"></i>${gName}
                            </div>
                        </td>`;
                } else {
                    // Nếu không có booking nào đặt ngày này -> Hiển thị trạng thái TRỐNG
                    rowHtml += `<td><i class="bi bi-calendar-check text-success opacity-50"></i></td>`;
                }
            });

            rowHtml += `</tr>`;
            tbodyCalendar.innerHTML += rowHtml;
        });
    }

    // Sự kiện tương tác chuyển tuần khi bấm nút điều hướng
    const prevBtn = document.getElementById("btn-prev-week");
    const nextBtn = document.getElementById("btn-next-week");

    if (prevBtn) {
        prevBtn.addEventListener("click", function() {
            currentPivotDate.setDate(currentPivotDate.getDate() - 7); // Lùi 7 ngày
            renderDynamicCalendar();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", function() {
            currentPivotDate.setDate(currentPivotDate.getDate() + 7); // Tiến 7 ngày
            renderDynamicCalendar();
        });
    }

    // Kích hoạt render bảng lịch động lần đầu tiên
    renderDynamicCalendar();
});