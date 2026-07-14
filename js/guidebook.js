document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search-input");
    
    // Nếu không tìm thấy ô search trên trang thì dừng lại để tránh lỗi
    if (!searchInput) return;

    searchInput.addEventListener("input", function (e) {
        // Lấy từ khóa người dùng gõ, chuyển về chữ thường và xóa khoảng trắng thừa
        const keyword = e.target.value.toLowerCase().trim();
        
        // Tìm tất cả các thẻ bài viết đang xuất hiện trên giao diện
        const articles = document.querySelectorAll(".article-card");

        articles.forEach(article => {
            // Lấy nội dung tiêu đề bài viết
            const titleEl = article.querySelector(".article-title, .article-title-sm");
            const title = titleEl ? titleEl.textContent.toLowerCase() : "";
            
            // Lấy nội dung đoạn trích dẫn ngắn
            const excerptEl = article.querySelector(".article-excerpt");
            const excerpt = excerptEl ? excerptEl.textContent.toLowerCase() : "";
            
            // Lấy nội dung của thẻ tag/badge (ví dụ: [Cẩm nang], [Ẩm thực]...)
            const badgeEl = article.querySelector(".badge");
            const badge = badgeEl ? badgeEl.textContent.toLowerCase() : "";

            // Kiểm tra xem từ khóa gõ vào có nằm trong tiêu đề, trích dẫn hay thẻ tag không
            if (title.includes(keyword) || excerpt.includes(keyword) || badge.includes(keyword)) {
                // Nếu khớp từ khóa: Hiển thị lại bài viết (bằng cách trả lại cấu trúc grid)
                const parentDiv = article.parentElement; 
                parentDiv.style.display = ""; 
            } else {
                // Nếu không khớp từ khóa: Ẩn khối bao ngoài bài viết đó đi
                const parentDiv = article.parentElement;
                parentDiv.style.display = "none";
            }
        });
    });
});