let dataYesterday = [];
let dataToday = [];

// Đọc file Excel từ URL GitHub và chuyển thành JSON
async function fetchExcelData(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

    const sheetName = workbook.SheetNames[0]; // Lấy sheet đầu tiên
    const sheet = workbook.Sheets[sheetName];

    return XLSX.utils.sheet_to_json(sheet); // Chuyển sheet thành JSON
}

// Hàm tải dữ liệu từ GitHub và hiển thị bảng
async function loadDataAndCompare() {
    // Thay URL này bằng liên kết đến file trên GitHub của bạn
    const urlYesterday = '';
    const urlToday = '';

    try {
        dataYesterday = await fetchExcelData(urlYesterday);
        dataToday = await fetchExcelData(urlToday);
        comparePrices(); // So sánh và hiển thị bảng
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
    }
}

// Hàm tính toán chênh lệch giá
function getPriceDifference(todayPrice, yesterdayPrice) {
    if (yesterdayPrice === undefined) return 'N/A';

    const difference = todayPrice - yesterdayPrice;
    if (difference > 0) {
        return `Tăng ${difference} VND`;
    } else if (difference < 0) {
        return `Giảm ${Math.abs(difference)} VND`;
    } else {
        return 'Không đổi';
    }
}

// So sánh và hiển thị giá
function comparePrices() {
    const tableBody = document.getElementById('productTable');
    tableBody.innerHTML = ''; // Xóa nội dung cũ

    dataToday.forEach(todayProduct => {
        const yesterdayProduct = dataYesterday.find(p => p['Tên Sản Phẩm'] === todayProduct['Tên Sản Phẩm']);
        const priceDifference = getPriceDifference(todayProduct['Đơn Giá'], yesterdayProduct ? yesterdayProduct['Đơn Giá'] : undefined);

        const row = `
            <tr>
                <td>${todayProduct['Tên Sản Phẩm']}</td>
                <td>${todayProduct['Đơn Vị Tính']}</td>
                <td>${yesterdayProduct ? yesterdayProduct['Đơn Giá'] : 'N/A'}</td>
                <td>${todayProduct['Đơn Giá']}</td>
                <td>${priceDifference}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Tự động chạy khi trang web tải
window.onload = loadDataAndCompare;
