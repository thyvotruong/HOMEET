// File: js/backend-service.js

// ĐÂY LÀ ĐƯỜNG DẪN MOCKAPI RIÊNG BIỆT CỦA BẠN
const BASE_URL = "https://6a552246e49d9eb2cc558eae.mockapi.io"; 

const HomeetBackend = {
    // ==========================================
    // 1. NGHIỆP VỤ PHÒNG (ROOMS)
    // ==========================================
    // Lấy danh sách tất cả các phòng (đầy đủ Diện tích, Giường, View, Giá...)
    async getAllRooms() {
        try {
            const res = await fetch(`${BASE_URL}/rooms`);
            return await res.json();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách phòng:", error);
            return [];
        }
    },

    // Admin cập nhật giá phòng mới
    async updateRoomPrice(id, newPrice) {
        const res = await fetch(`${BASE_URL}/rooms/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: parseInt(newPrice) })
        });
        return await res.json();
    },

    // Admin bật/tắt trạng thái phòng (Đang đón khách 'active' hoặc Đang sửa chữa 'repairing')
    async toggleRoomStatus(id, currentStatus) {
        const nextStatus = currentStatus === "active" ? "repairing" : "active";
        const res = await fetch(`${BASE_URL}/rooms/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus })
        });
        return await res.json();
    },

    // ==========================================
    // 2. NGHIỆP VỤ ĐẶT PHÒNG (BOOKINGS)
    // ==========================================
    // Lấy toàn bộ danh sách đơn đặt phòng phục vụ trang Dashboard Admin
    async getAllBookings() {
        try {
            const res = await fetch(`${BASE_URL}/bookings`);
            return await res.json();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đơn đặt phòng:", error);
            return [];
        }
    },

    // Tạo đơn đặt phòng mới khi Client bấm thanh toán thành công
    async createBooking(bookingData) {
        const res = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        return await res.json();
    },

    // Admin cập nhật trạng thái đơn (Đã thanh toán -> Đã Check-in -> Đã Check-out)
    async updateBookingStatus(id, nextStatus) {
        const res = await fetch(`${BASE_URL}/bookings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus })
        });
        return await res.json();
    },

    // ==========================================
    // 3. XỬ LÝ ĐĂNG NHẬP (AUTH LAYER)
    // ==========================================
    // Đăng nhập cho Admin (Quét tài khoản cố định trên MockAPI)
    async loginAdmin(email, password) {
        const res = await fetch(`${BASE_URL}/users`);
        const users = await res.json();
        const adminUser = users.find(u => u.email === email && u.password === password && u.role === "admin");
        return adminUser || null;
    },

    // Đăng nhập giả lập cho Client (Bấm phát ăn ngay - Tự động tạo và lưu user vào database)
    async loginClientMock(providerName) {
        const mockClient = {
            email: `client.${providerName.toLowerCase()}@homeet.com`,
            password: `mock123`,
            role: "client",
            name: `Khách hàng ${providerName} (Đồ án)`
        };

        const res = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockClient)
        });
        return await res.json();
    }
};

// Log kiểm tra kết nối khi file được load tự động thành công
console.log("🚀 [HomeetBackend] Đối tượng xử lý API đã được nạp thành công và sẵn sàng sử dụng toàn cục!");