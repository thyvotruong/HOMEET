document.addEventListener("DOMContentLoaded", function () {
    // 1. KIỂM TRA BẢO MẬT (Nếu chưa đăng nhập -> Đá về trang login)
    const isLogin = sessionStorage.getItem("adminLoggedIn");
    const currentPage = window.location.pathname.split("/").pop();

    if (!isLogin && currentPage !== "login.html") {
        window.location.href = "login.html";
        return;
    }

    // 2. TỰ ĐỘNG CHÈN SIDEBAR MENU
    const sidebarContainer = document.getElementById("sidebar-container");
    if (sidebarContainer) {
        sidebarContainer.innerHTML = `
            <div class="admin-sidebar shadow">
                <div class="text-center mb-4">
                    <h4 class="fw-bold mb-0 text-warning">HOMEET ADMIN</h4>
                    <small class="text-muted">Hệ thống quản trị</small>
                </div>
                <hr class="text-secondary">
                <ul class="nav flex-column sidebar-menu gap-1">
                    <li class="nav-item">
                        <a href="index.html" class="nav-link ${currentPage === 'index.html' || currentPage === '' ? 'active' : ''}">
                            <i class="bi bi-speedometer2 me-3"></i>Tổng quan
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="manage-bookings.html" class="nav-link ${currentPage === 'manage-bookings.html' ? 'active' : ''}">
                            <i class="bi bi-receipt me-3"></i>Quản lý đơn hàng
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="manage-rooms.html" class="nav-link ${currentPage === 'manage-rooms.html' ? 'active' : ''}">
                            <i class="bi bi-door-open me-3"></i>Quản lý phòng
                        </a>
                    </li>
                </ul>
                <div class="position-absolute bottom-0 start-0 w-100 p-3">
                    <hr class="text-secondary">
                    <button id="btn-logout" class="btn btn-outline-danger w-100 btn-sm">
                        <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
                    </button>
                </div>
            </div>
        `;

        // Xử lý nút Đăng xuất
        document.getElementById("btn-logout").addEventListener("click", function() {
            sessionStorage.removeItem("adminLoggedIn");
            window.location.href = "login.html";
        });
    }
});