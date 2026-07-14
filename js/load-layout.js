document.addEventListener("DOMContentLoaded", function () {
    // 1. Tìm tất cả các thẻ có định danh dữ liệu nhúng kèm layout chung
    const elements = document.querySelectorAll("[data-include]");
    let loadedCount = 0;

    elements.forEach(el => {
        const file = el.getAttribute("data-include");
        if (file) {
            fetch(file)
                .then(response => {
                    if (response.ok) return response.text();
                    throw new Error("Không thể tải file giao diện: " + file);
                })
                .then(html => {
                    el.innerHTML = html; // Trình duyệt render HTML của file vào trang
                    
                    // Sau khi nạp xong một component, tăng biến đếm
                    loadedCount++;
                    
                    // CHỈ CHẠY KHI TOÀN BỘ CÁC LAYOUT ĐÃ ĐƯỢC NẠP XONG VÀ XUẤT HIỆN TRÊN DOM
                    if (loadedCount === elements.length) {
                        handleHeaderAuthState(); // Khởi chạy kiểm tra đăng nhập
                        updateActiveMenu();      // Khởi chạy gạch chân menu active
                        updateHeaderCartBadge(); // Khởi chạy tính toán hiển thị badge số lượng giỏ hàng
                        
                        // CẬP NHẬT: Tự động kích hoạt nhúng file backend service
                        initBackendService();
                    }
                })
                .catch(error => console.error(error));
        }
    });

    // 2. Hàm xử lý ẩn/hiện cụm nút tài khoản trên Header dựa trên localStorage
    function handleHeaderAuthState() {
        const loggedOutBlock = document.getElementById('auth-logged-out');
        const loggedInBlock = document.getElementById('auth-logged-in');

        // Nếu kiểm tra thấy trình duyệt đang lưu trạng thái đăng nhập bằng true
        if (localStorage.getItem('isLoggedIn') === 'true') {
            if (loggedOutBlock) {
                loggedOutBlock.style.setProperty('display', 'none', 'important');
            }
            if (loggedInBlock) {
                loggedInBlock.classList.remove('d-none');
                loggedInBlock.style.setProperty('display', 'flex', 'important');
            }
        }

        // Bắt sự kiện khi người dùng bấm nút "Đăng xuất" trong menu thả xuống
        const logoutBtn = document.getElementById('auth-logout-trigger');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('isLoggedIn'); // Xóa trạng thái đăng nhập giả lập
            });
        }
    }

    // 3. Hàm tự động kiểm tra đường dẫn trang và chuyển dấu gạch chân (active)
    function updateActiveMenu() {
        // Lấy tên file hiện tại của trình duyệt (Ví dụ: "guidebook.html" hoặc "index.html")
        const currentPath = window.location.pathname.split("/").pop();
        
        // Tìm tất cả các link menu trong navbar vừa được nạp vào
        const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
        
        navLinks.forEach(link => {
            const linkHref = link.getAttribute("href");
            
            // Xóa bỏ class active cũ đang bị dính mặc định ở "Trang chủ"
            link.classList.remove("active");

            // Cách kiểm tra chuẩn xác:
            if (currentPath === "" || currentPath === "index.html") {
                // Nếu đang ở trang chủ
                if (linkHref.includes("index.html")) {
                    link.classList.add("active");
                }
            } else if (linkHref && linkHref.includes(currentPath)) {
                // Nếu tên file trên thanh địa chỉ trùng với thuộc tính href của menu nào thì gạch chân menu đó
                link.classList.add("active");
            }
        });
    }

    // 4. Hàm đồng bộ trạng thái số hiển thị (Badge) trên Icon giỏ hàng tại Header công cộng
    function updateHeaderCartBadge() {
        const headerContainer = document.querySelector('.site-header');
        if (!headerContainer) return;

        // ĐÃ SỬA: Chỉ định chính xác thẻ span mang class badge nằm trong thẻ liên kết giỏ hàng để tránh tìm sai phần tử
        const cartBadge = headerContainer.querySelector('a[href*="cart.html"] .badge') || 
                          headerContainer.querySelector('.badge');
        
        if (cartBadge) {
            const cart = JSON.parse(localStorage.getItem('myCart')) || [];
            
            if (cart.length > 0) {
                // Cập nhật số lượng thực tế và gỡ bỏ class ẩn d-none
                cartBadge.textContent = cart.length;
                cartBadge.classList.remove('d-none');
                cartBadge.style.setProperty('display', 'inline-block', 'important');
            } else {
                // ĐÃ SỬA: Đưa giá trị văn bản mặc định về 0 và ẩn triệt để bằng d-none của Bootstrap
                cartBadge.textContent = '0';
                cartBadge.classList.add('d-none');
                cartBadge.style.setProperty('display', 'none', 'important');
            }
        }
    }

    // 5. CẬP NHẬT THÊM: Hàm tự động chèn script backend sau khi hoàn thành DOM layout
    function initBackendService() {
        const script = document.createElement('script');
        
        // Nhận diện nếu URL đang chạy có chứa thư mục con /pages/
        if (window.location.pathname.includes('/pages/')) {
            script.src = '../js/backend-service.js'; // Lùi 1 cấp để ra ngoài gốc rồi đi vào js/
        } else {
            script.src = 'js/backend-service.js';    // Chạy trực tiếp từ thư mục gốc
        }
        
        document.body.appendChild(script);
    }

    // Đăng ký lắng nghe sự kiện toàn cục 'cartUpdated'.
    window.addEventListener('cartUpdated', updateHeaderCartBadge);
});