document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const alertBox = document.getElementById("login-alert");

    // Kiểm tra thông tin tài khoản đúng yêu cầu của bạn
    if (email === "homeet999@999" && password === "9999") {
        sessionStorage.setItem("adminLoggedIn", "true");
        window.location.href = "index.html"; // Vào trang chủ admin
    } else {
        alertBox.classList.remove("d-none");
        alertBox.innerText = "Tài khoản hoặc mật khẩu không chính xác!";
    }
});