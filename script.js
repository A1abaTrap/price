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

// Tải dữ liệu từ GitHub và so sánh giá dựa trên mã sản phẩm
async function loadDataAndCompare() {
    const urlYesterday = 'https://raw.githubusercontent.com/A1abaTrap/price/main/Gia_Hom_Qua.xlsx';
    const urlToday = 'https://raw.githubusercontent.com/A1abaTrap/price/main/Gia_Hom_Nay.xlsx';

    try {
        dataYesterday = await fetchExcelData(urlYesterday);
        dataToday = await fetchExcelData(urlToday);
        comparePrices(); // So sánh và hiển thị bảng
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
    }
}

// Tính toán chênh lệch giá
function getPriceDifference(todayPrice, yesterdayPrice) {
    if (yesterdayPrice === undefined) return 'Không có trong bảng hôm qua';

    const difference = todayPrice - yesterdayPrice;
    if (difference > 0) {
        return `Tăng ${difference} VND`;
    } else if (difference < 0) {
        return `Giảm ${Math.abs(difference)} VND`;
    } else {
        return 'Không đổi';
    }
}

// So sánh giá và hiển thị dữ liệu trên bảng
function comparePrices() {
    const tableBody = document.getElementById('productTable');
    tableBody.innerHTML = ''; // Xóa nội dung cũ

    // Tạo một tập hợp các mã sản phẩm để xử lý tất cả sản phẩm
    const allProductCodes = new Set([
        ...dataToday.map(p => p['Mã Sản Phẩm']),
        ...dataYesterday.map(p => p['Mã Sản Phẩm'])
    ]);

    allProductCodes.forEach(code => {
        const todayProduct = dataToday.find(p => p['Mã Sản Phẩm'] === code);
        const yesterdayProduct = dataYesterday.find(p => p['Mã Sản Phẩm'] === code);

        const todayPrice = todayProduct ? todayProduct['Đơn Giá'] : 'Không có trong bảng hôm nay';
        const yesterdayPrice = yesterdayProduct ? yesterdayProduct['Đơn Giá'] : undefined;
        const priceDifference = getPriceDifference(todayPrice, yesterdayPrice);

        const row = `
            <tr>
                <td>${code}</td>
                <td>${todayProduct ? todayProduct['Tên Sản Phẩm'] : 'Không có trong bảng hôm nay'}</td>
                <td>${todayProduct ? todayProduct['Đơn Vị Tính'] : ''}</td>
                <td>${yesterdayPrice !== undefined ? yesterdayPrice : 'Không có trong bảng hôm qua'}</td>
                <td>${todayPrice}</td>
                <td>${priceDifference}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Tự động chạy khi trang web tải
window.onload = loadDataAndCompare;
