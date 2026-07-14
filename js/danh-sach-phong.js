// Dữ liệu phòng chạy hoàn toàn bằng ảnh Local (Ổn định 100%)
const LocalBackend = {
    backupRooms: [
        {
            id: "1",
            slug: "nghinh-phong",
            name: "Nghinh Phong",
            price: 990000,
            rating: "4.92",
            desc: "Không gian ấm cúng dành cho cặp đôi hoặc nhóm bạn nhỏ. Phòng được thiết kế theo phong cách tối giản với tông màu gỗ và trắng, cửa sổ lớn đón nắng sớm cùng làn gió biển mát lành.",
            capacity: "2-3 khách", size: "28 m²", bed: "1 giường Queen", view: "Sân vườn, đón gió biển",
            images: [
                "images/rooms/nghinh-phong-main.jpg",
                "images/rooms/nghinh-phong-2.jpg",
                "images/rooms/nghinh-phong-3.jpg",
                "images/rooms/nghinh-phong-4.jpg",
                "images/rooms/nghinh-phong-5.jpg"
            ]
        },
        {
            id: "2",
            slug: "hoa-vang",
            name: "Hoa Vàng",
            price: 1590000,
            rating: "4.85",
            desc: "Không gian yên tĩnh, đầy đủ tiện nghi, lấy cảm hứng từ vẻ đẹp mộc mạc của Phú Yên, phòng có không gian rộng rãi, nhiều ánh sáng tự nhiên.",
            capacity: "4-6 khách", size: "42 m²", bed: "2 giường Queen", view: "Vườn hoa & hồ bơi",
            images: [
                "images/rooms/hoa-vang-main.jpg",
                "images/rooms/hoa-vang-2.jpg",
                "images/rooms/hoa-vang-3.jpg",
                "images/rooms/hoa-vang-4.jpg",
                "images/rooms/hoa-vang-5.jpg"
            ]
        },
        {
            id: "3",
            slug: "vung-ro",
            name: "Vũng Rô",
            price: 2390000,
            rating: "4.90",
            desc: "Sở hữu ban công riêng hướng biển, phòng mang đến khung cảnh bình minh tuyệt đẹp cùng không gian sinh hoạt thoải mái cho nhóm đông người.",
            capacity: "6-8 khách", size: "58 m²", bed: "3 giường Queen", view: "Biển, ban công riêng",
            images: [
                "images/rooms/vungro-main.jpg",
                "images/rooms/vungro-2.jpg",
                "images/rooms/vungro-3.jpg",
                "images/rooms/vungro-4.jpg",
                "images/rooms/vungro-5.jpg"
            ]
        },
        {
            id: "4",
            slug: "mui-dien",
            name: "Mũi Điện",
            price: 3490000,
            rating: "5.0",
            desc: "Homestay view biển đẹp, đầy đủ tiện nghi, ban công lớn và cửa kính toàn cảnh hướng biển.",
            capacity: "8-10 khách", size: "80 m²", bed: "4 giường Queen", view: "Biển toàn cảnh",
            images: [
                "images/rooms/muidien-main.jpg",
                "images/rooms/muidien-2.jpg",
                "images/rooms/muidien-3.jpg",
                "images/rooms/muidien-4.jpg",
                "images/rooms/muidien-5.jpg"
            ]
        }
    ],
    async getAllRooms() {
        return this.backupRooms; // Bỏ qua API, lấy thẳng data trong máy
    }
};

// Hàm xử lý đường dẫn chuẩn xác dựa theo cấp thư mục
function formatImagePath(imagePath, isSubPage) {
    if (!imagePath) return "https://placehold.co/600x400?text=Homeet+Image";
    let cleanPath = imagePath.replace(/^(\.\.\/|\/)+/, '');
    return isSubPage ? "../" + cleanPath : cleanPath;
}

// RENDER DANH SÁCH TRANG CHỦ
async function initIndexPage() {
    const container = document.getElementById('homeet-room-container');
    if (!container) return;

    const rooms = await LocalBackend.getAllRooms();
    container.innerHTML = ''; 

    rooms.forEach(room => {
        let displayImg = room.images[0];
        let formattedImg = formatImagePath(displayImg, false);

        const cardHtml = `
            <div class="col-md-6">
                <article class="room-card">
                    <div class="room-card-image">
                        <img src="${formattedImg}" alt="Phòng ${room.name}">
                    </div>
                    <div class="room-card-body">
                        <div>
                            <h3 class="room-name">PHÒNG ${room.name.toUpperCase()}</h3>
                            <p class="room-price">${parseInt(room.price).toLocaleString('vi-VN')} VNĐ / ĐÊM</p>
                        </div>
                        <a href="pages/room-detail.html?id=${room.id}" class="btn btn-detail">Chi tiết</a>
                    </div>
                </article>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// RENDER TRANG CHI TIẾT
async function initDetailPage() {
    if (!document.getElementById('room-header-title')) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || '1';

    const rooms = await LocalBackend.getAllRooms();
    const currentRoom = rooms.find(r => r.id == id);

    if (!currentRoom) return;

    document.title = `Phòng ${currentRoom.name} - Homeet`;
    document.getElementById('room-header-title').textContent = currentRoom.name;
    if(document.getElementById('room-body-title')) document.getElementById('room-body-title').textContent = "Phòng " + currentRoom.name;
    if(document.getElementById('room-desc')) document.getElementById('room-desc').textContent = currentRoom.desc;
    if(document.getElementById('room-price')) document.getElementById('room-price').textContent = parseInt(currentRoom.price).toLocaleString('vi-VN') + " VNĐ";

    if(document.getElementById('spec-capacity')) document.getElementById('spec-capacity').textContent = currentRoom.capacity;
    if(document.getElementById('spec-size')) document.getElementById('spec-size').textContent = currentRoom.size;
    if(document.getElementById('spec-bed')) document.getElementById('spec-bed').textContent = currentRoom.bed;
    if(document.getElementById('spec-view')) document.getElementById('spec-view').textContent = currentRoom.view;

    // Gắn link sang trang thanh toán kèm thông tin phòng
    const dynamicPaymentUrl = `payment.html?room=${currentRoom.id}&price=${currentRoom.price}`;
    if(document.getElementById("room-btn-book")) document.getElementById("room-btn-book").setAttribute("href", dynamicPaymentUrl);

    // Đổ 5 ảnh vào lưới ảnh
    for (let i = 0; i < 5; i++) {
        const gridImg = document.getElementById(`img-grid-${i}`);
        if (gridImg && currentRoom.images[i]) gridImg.src = formatImagePath(currentRoom.images[i], true);
        const lightImg = document.getElementById(`img-light-${i}`);
        if (lightImg && currentRoom.images[i]) lightImg.src = formatImagePath(currentRoom.images[i], true);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initIndexPage();
    initDetailPage();
});

// ==========================================================
// THỰC HIỆN BACK-END: LƯU VẾT ĐƠN ĐẶT PHÒNG LÊN MOCKAPI
// ==========================================================
async function saveBookingToBackend(customerName, customerPhone, roomId, totalPrice) {
    const bookingApiUrl = "https://6a552246e49d9eb2cc558eae.mockapi.io/bookings";

    const bookingData = {
        name: customerName,
        phone: customerPhone,
        roomId: roomId,
        totalPrice: totalPrice,
        createdAt: new Date().toISOString()
    };

    try {
        const response = await fetch(bookingApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingData)
        });

        if (response.ok) {
            console.log("🚀 [Backend] Đã lưu vết đơn đặt phòng thành công lên MockAPI!");
            return true;
        }
        return false;
    } catch (error) {
        console.error("❌ [Backend] Lỗi kết nối server lưu vết:", error);
        return false;
    }
}