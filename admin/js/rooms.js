// File: js/rooms.js

document.addEventListener("DOMContentLoaded", async function() {
    console.log("🚀 [ManageRooms] Đang tải danh sách 4 phòng cố định từ API...");

    const tableBody = document.getElementById("room-table-body");
    
    // Khởi tạo biến lưu trữ dữ liệu phòng lấy từ API để dùng chung
    let actualRoomsList = [];

    // =========================================================================
    // 1. GỌI API LẤY TOÀN BỘ DỮ LIỆU PHÒNG
    // =========================================================================
    async function fetchRoomsFromApi() {
        if (typeof HomeetBackend !== 'undefined' && typeof HomeetBackend.getAllRooms === 'function') {
            try {
                // ĐÂY LÀ HÀM GỌI API THẬT
                const data = await HomeetBackend.getAllRooms();
                
                // Vì danh sách này MockAPI sinh ra lộn xộn, đồ án chỉ có 4 phòng,
                // nên ta cần sắp xếp lại theoroomId hoặc id cố định để dễ quản lý.
                // Giả sử id trong API từ 1 đến 4 khớp với Nghinh Phong, Hoa Vàng, Vũng Rô, Mũi Điện.
                actualRoomsList = data.sort((a, b) => parseInt(a.id) - parseInt(b.id)).slice(0, 4);

                console.log(`✅ [ManageRooms] Đã tải ${actualRoomsList.length} phòng cố định.`);
                
                // Mặc định render toàn bộ danh sách khi tải xong
                renderRooms(actualRoomsList);
            } catch (error) {
                console.error("❌ Lỗi khi tải danh sách phòng từ API:", error);
                if(tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Lỗi khi tải dữ liệu phòng!</td></tr>`;
            }
        } else {
            console.error("❌ Không tìm thấy đối tượng HomeetBackend! Bạn đã nhúng file backend-service.js chưa?");
        }
    }

    // =========================================================================
    // 2. HÀM RENDER BẢNG PHÒNG (Dùng Data thật)
    // =========================================================================
    function renderRooms(dataToRender) {
        if (!tableBody) return;
        tableBody.innerHTML = "";
        
        if (dataToRender.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Chưa có dữ liệu phòng trong cơ sở dữ liệu!</td></tr>`;
            return;
        }

        dataToRender.forEach((room, index) => {
            let statusBadge = room.status === "active" 
                ? `<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Đang mở đón khách</span>` 
                : `<span class="badge bg-danger"><i class="bi bi-exclamation-triangle me-1"></i>Tạm đóng/Bảo trì</span>`;

            let actionButton = room.status === "active"
                ? `<button class="btn btn-sm btn-outline-danger btn-toggle-status" data-id="${room.id}" data-current-status="active"><i class="bi bi-toggle-on"></i> Tắt đón khách</button>`
                : `<button class="btn btn-sm btn-outline-success btn-toggle-status" data-id="${room.id}" data-current-status="repairing"><i class="bi bi-toggle-off"></i> Bật đón khách</button>`;

            // Lấy sức chứa tối đa thật, giá phòng thật
            const capacity = room.maxCapacity || room.capacity || "--";
            const price = room.price ? Number(room.price).toLocaleString('vi-VN') + "đ" : "0đ";

            let row = `
                <tr>
                    <td><strong>${index + 1}</strong></td>
                    <td><span class="fw-bold">${room.name || room.roomName}</span></td>
                    <td>${capacity} người tối đa</td>
                    <td class="fw-bold text-primary">${price} / đêm</td>
                    <td>${statusBadge}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-primary me-2 btn-edit-price" data-id="${room.id}" data-current-price="${room.price}"><i class="bi bi-pencil-square"></i> Đổi giá</button>
                        ${actionButton}
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        initEvents();
    }

    // =========================================================================
    // 3. XỬ LÝ NGHIỆP VỤ BẬT/TẮT ĐÓN KHÁCH VÀ ĐỔI GIÁ THẬT QUA API
    // =========================================================================
    function initEvents() {
        // Nút Đổi trạng thái (Bật/Tắt đón khách) thật
        document.querySelectorAll(".btn-toggle-status").forEach(btn => {
            btn.addEventListener("click", async function() {
                // Vô hiệu hóa nút và hiện spinner
                const originalContent = this.innerHTML;
                this.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span>`;
                this.disabled = true;

                const roomId = this.getAttribute("data-id");
                const currentStatus = this.getAttribute("data-current-status");

                console.log(`📡 [MockAPI] Đang đổi trạng thái phòng #${roomId} từ '${currentStatus}'...`);

                // --- KEY: GỌI API ĐỔI TRẠNG THÁI PHÒNG LÊN MOCKAPI ---
                if (typeof HomeetBackend !== 'undefined' && typeof HomeetBackend.toggleRoomStatus === 'function') {
                    try {
                        const updatedRoom = await HomeetBackend.toggleRoomStatus(roomId, currentStatus);
                        console.log(`✅ [MockAPI] Đổi trạng thái thành công!`, updatedRoom);
                        
                        // Tải lại danh sách phòng từ API để cập nhật giao diện chính xác nhất
                        fetchRoomsFromApi();
                    } catch (error) {
                        console.error("❌ Lỗi khi đổi trạng thái phòng qua API:", error);
                        alert(`❌ Lỗi: Không thể thay đổi trạng thái phòng này. Vui lòng thử lại!`);
                        
                        // Phục hồi lại nút nếu bị lỗi
                        this.innerHTML = originalContent;
                        this.disabled = false;
                    }
                }
            });
        });

        // Nút Đổi giá phòng thật
        document.querySelectorAll(".btn-edit-price").forEach(btn => {
            btn.addEventListener("click", async function() {
                const roomId = this.getAttribute("data-id");
                const currentPrice = this.getAttribute("data-current-price");
                
                // Lấy tên phòng từ mảng cục bộ
                const roomData = actualRoomsList.find(r => r.id === roomId);
                const roomName = roomData ? (roomData.name || roomData.roomName) : `Phòng #${roomId}`;

                // Hiện Prompt hỏi giá mới
                let newPriceInput = prompt(`Nhập số giá tiền mới (chỉ nhập số) cho ${roomName}:`, currentPrice);
                
                // Kiểm tra điều kiện đầu vào (có nhập, là số và khác giá cũ)
                if (newPriceInput && !isNaN(newPriceInput) && parseInt(newPriceInput) !== parseInt(currentPrice)) {
                    
                    const nextPriceNum = parseInt(newPriceInput);
                    this.disabled = true;

                    console.log(`📡 [MockAPI] Đang cập nhật giá mới cho ${roomName} là ${nextPriceNum.toLocaleString('vi-VN')}đ...`);

                    // --- KEY: GỌI API CẬP NHẬT GIÁ MỚI LÊN MOCKAPI ---
                    if (typeof HomeetBackend !== 'undefined' && typeof HomeetBackend.updateRoomPrice === 'function') {
                        try {
                            const updatedRoom = await HomeetBackend.updateRoomPrice(roomId, nextPriceNum);
                            console.log(`✅ [MockAPI] Cập nhật giá thành công!`, updatedRoom);
                            
                            // Tải lại danh sách phòng từ API để cập nhật giao diện
                            fetchRoomsFromApi();
                        } catch (error) {
                            console.error("❌ Lỗi khi cập nhật giá phòng qua API:", error);
                            alert(`❌ Lỗi: Không thể thay đổi giá phòng này. Vui lòng thử lại!`);
                            this.disabled = false; // Phục hồi nút
                        }
                    }
                } else if (newPriceInput !== null && parseInt(newPriceInput) === parseInt(currentPrice)) {
                    // Giá nhập trùng giá cũ, không làm gì cả
                } else if (newPriceInput !== null) {
                    alert("❌ Lỗi: Vui lòng chỉ nhập giá trị là Số!");
                }
            });
        });
    }

    // --- KÍCH HOẠT GỌI API LẦN ĐẦU TIÊN ---
    fetchRoomsFromApi();
});