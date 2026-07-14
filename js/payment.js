document.addEventListener("DOMContentLoaded", function() {
    let activeMethod = 'card-panel'; // Mặc định ban đầu chọn VISA
    let currentTotalAmount = 0;
    let isCapacityValid = true; // Biến cờ kiểm tra trạng thái hợp lệ của sức chứa

    // 1. Quản lý hoạt động chuyển đổi Tabs phương thức thanh toán
    const tabs = document.querySelectorAll('.method-tab-item');
    const panels = document.querySelectorAll('.panel-item');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.add('d-none'));

            this.classList.add('active');
            activeMethod = this.getAttribute('data-target');
            document.getElementById(`panel-${activeMethod}`).classList.remove('d-none');
        });
    });

    // 2. Trích xuất dữ liệu từ tham số URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomKey = urlParams.get('room') || 'nghinh-phong';
    const basePrice = parseInt(urlParams.get('price')) || 990000;
    const imgPath = urlParams.get('img') || 'rooms/nghinh-phong-main.jpg';

    const nameMapping = {
        "nghinh-phong": "Phòng Nghinh Phong",
        "hoa-vang": "Phòng Hoa Vàng",
        "vung-ro": "Phòng Vũng Rô",
        "mui-dien": "Phòng Mũi Điện"
    };

    const maxCapacityMapping = {
        "nghinh-phong": 3,
        "hoa-vang": 6,
        "vung-ro": 8,
        "mui-dien": 10
    };

    const roomCleanName = nameMapping[roomKey] || "Phòng Nghinh Phong";
    const maxCapacity = maxCapacityMapping[roomKey] || 3;

    document.getElementById('room-display-name').textContent = roomCleanName;
    document.getElementById('room-display-tag').textContent = "Phòng " + roomKey.toUpperCase().replace("-", " ");
    document.getElementById('room-display-img').src = "../images/" + imgPath;

    function toVNDString(num) {
        return num.toLocaleString('vi-VN') + 'đ';
    }

    function checkRoomCapacity(guestsCount) {
        const alertContainer = document.getElementById('capacity-alert-container');
        const btnSubmit = document.getElementById('btn-submit-payment');
        
        if (guestsCount > maxCapacity) {
            alertContainer.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show shadow-sm mb-4" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>Thông báo:</strong> Số lượng khách bạn chọn (${guestsCount} người) đã vượt quá sức chứa tối đa cho phép của <strong>${roomCleanName}</strong> (Tối đa: ${maxCapacity} khách). Vui lòng điều chỉnh lại!
                </div>
            `;
            btnSubmit.classList.add('disabled');
            isCapacityValid = false; 
            return false;
        } else {
            alertContainer.innerHTML = '';
            btnSubmit.classList.remove('disabled');
            isCapacityValid = true;
            return true;
        }
    }

    function handlePriceCalculation() {
        const checkinValue = document.getElementById('checkin-date').value;
        const checkoutValue = document.getElementById('checkout-date').value;
        const guestsCount = parseInt(document.getElementById('total-guests').value);

        checkRoomCapacity(guestsCount);

        const start = new Date(checkinValue);
        const end = new Date(checkoutValue);

        let calculatedNights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (calculatedNights <= 0 || isNaN(calculatedNights)) {
            calculatedNights = 1;
        }

        currentTotalAmount = basePrice * calculatedNights;

        document.getElementById('summary-guests').textContent = guestsCount;
        document.getElementById('summary-nights').textContent = calculatedNights;
        document.getElementById('calc-price-text').textContent = `Giá phòng (${toVNDString(basePrice)} × ${calculatedNights} đêm)`;
        document.getElementById('calc-subtotal-val').textContent = toVNDString(currentTotalAmount);
        document.getElementById('calc-total-val').textContent = toVNDString(currentTotalAmount);
    }

    document.getElementById('checkin-date').addEventListener('change', handlePriceCalculation);
    document.getElementById('checkout-date').addEventListener('change', handlePriceCalculation);
    document.getElementById('total-guests').addEventListener('change', handlePriceCalculation);

    handlePriceCalculation();

    // ================= XỬ LÝ ĐỔI GIAO DIỆN THANH TOÁN TRỰC TIẾP TRÊN TRANG =================
    const btnSubmitPayment = document.getElementById('btn-submit-payment');
    const formBookingSection = document.getElementById('form-booking-section');
    const inlineInvoiceSection = document.getElementById('inline-invoice-section');

    btnSubmitPayment.addEventListener('click', function() {
        if (!isCapacityValid) return false;

        // 1. Ẩn form nhập liệu đi
        formBookingSection.classList.add('d-none');
        // 2. Hiển thị bảng hóa đơn/QR thanh toán lên thay thế
        inlineInvoiceSection.classList.remove('d-none');

        // 3. Cập nhật số tiền vào bảng hóa đơn mới
        document.getElementById('inline-total-money').textContent = toVNDString(currentTotalAmount);

        // 4. Kiểm tra phương thức chọn để hiển thị QR tương ứng (Dùng API QR cho an toàn, đỡ lỗi 404)
        const inlineQrBox = document.getElementById('inline-qr-box');
        const inlineQrImage = document.getElementById('inline-qr-image');
        const inlineMethodTitle = document.getElementById('inline-method-title');

        if (activeMethod === 'card-panel') {
            inlineMethodTitle.textContent = "Thẻ Quốc Tế VISA/Mastercard";
            inlineQrBox.classList.add('d-none'); // Visa không cần quét mã QR
            // Tự động chuyển thẳng sang trạng thái thành công sau 2 giây để giả lập kết nối ngân hàng
            setTimeout(() => {
                document.getElementById('inline-processing-status').classList.add('d-none');
                document.getElementById('inline-success-status').classList.remove('d-none');
            }, 2000);
        } else {
            inlineQrBox.classList.remove('d-none');
            let dataQR = `Homeet_Pay_${currentTotalAmount}`;

            if (activeMethod === 'vnpay-panel') {
                inlineMethodTitle.textContent = "Cổng điện tử VNPAY-QR";
                inlineQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=VNPAY_${dataQR}`;
            } else if (activeMethod === 'momo-panel') {
                inlineMethodTitle.textContent = "Ví Điện Tử MoMo";
                inlineQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MOMO_${dataQR}`;
            } else if (activeMethod === 'bank-panel') {
                inlineMethodTitle.textContent = "Chuyển khoản Ngân hàng qua VietQR";
                inlineQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=BANK_${dataQR}`;
            }
        }
    });

    // Hành động nhấn nút "Xác nhận đã chuyển tiền" giả lập
    document.getElementById('btn-inline-verify').addEventListener('click', function() {
        document.getElementById('inline-processing-status').classList.add('d-none');
        document.getElementById('inline-success-status').classList.remove('d-none');
    });
});