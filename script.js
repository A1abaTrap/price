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

// Sắp xếp danh sách theo mã sản phẩm
function sortByProductCode(data) {
    return data.sort((a, b) => a['Mã  SP'].localeCompare(b['Mã  SP']));
}

// So sánh hai danh sách đã sắp xếp
function compareSortedLists() {
    const tableBody = document.getElementById('productTable');
    tableBody.innerHTML = ''; // Xóa nội dung cũ

    let i = 0, j = 0;

    while (i < dataYesterday.length && j < dataToday.length) {
        const yesterdayProduct = dataYesterday[i];
        const todayProduct = dataToday[j];

        if (yesterdayProduct['Mã  SP'] === todayProduct['Mã  SP']) {
            // So sánh giá nếu mã sản phẩm trùng khớp
            const priceDifference = getPriceDifference(
                todayProduct['Giá Bán Đồng'], 
                yesterdayProduct['Giá Bán Đồng']
            );

            const row = `
                <tr>
                    <td>${todayProduct['Mã  SP']}</td>
                    <td>${todayProduct['Tên SP']}</td>
                    <td>${todayProduct['Quy Cách']}</td>
                    <td>${yesterdayProduct['Giá Bán Đồng']}</td>
                    <td>${todayProduct['Giá Bán Đồng']}</td>
                    <td>${priceDifference}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
            i++; j++; // Tiến tới sản phẩm tiếp theo trong cả hai danh sách
        } else if (yesterdayProduct['Mã  SP'] < todayProduct['Mã  SP']) {
            // Sản phẩm chỉ có trong bảng hôm qua
            const row = `
                <tr>
                    <td>${yesterdayProduct['Mã  SP']}</td>
                    <td>${yesterdayProduct['Tên SP']}</td>
                    <td>${yesterdayProduct['Quy Cách']}</td>
                    <td>${yesterdayProduct['Giá Bán Đồng']}</td>
                    <td>Không có trong bảng hôm nay</td>
                    <td>N/A</td>
                </tr>
            `;
            tableBody.innerHTML += row;
            i++; // Tiến tới sản phẩm tiếp theo trong bảng hôm qua
        } else {
            // Sản phẩm chỉ có trong bảng hôm nay
            const row = `
                <tr>
                    <td>${todayProduct['Mã  SP']}</td>
                    <td>${todayProduct['Tên SP']}</td>
                    <td>${todayProduct['Quy Cách']}</td>
                    <td>Không có trong bảng hôm qua</td>
                    <td>${todayProduct['Giá Bán Đồng']}</td>
                    <td>N/A</td>
                </tr>
            `;
            tableBody.innerHTML += row;
            j++; // Tiến tới sản phẩm tiếp theo trong bảng hôm nay
        }
    }

    // Xử lý các sản phẩm còn lại trong bảng hôm qua (nếu có)
    while (i < dataYesterday.length) {
        const product = dataYesterday[i++];
        const row = `
            <tr>
                <td>${product['Mã  SP']}</td>
                <td>${product['Tên SP']}</td>
                <td>${product['Quy Cách']}</td>
                <td>${product['Giá Bán Đồng']}</td>
                <td>Không có trong bảng hôm nay</td>
                <td>N/A</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    }

    // Xử lý các sản phẩm còn lại trong bảng hôm nay (nếu có)
    while (j < dataToday.length) {
        const product = dataToday[j++];
        const row = `
            <tr>
                <td>${product['Mã  SP']}</td>
                <td>${product['Tên SP']}</td>
                <td>${product['Quy Cách']}</td>
                <td>Không có trong bảng hôm qua</td>
                <td>${product['Giá Bán Đồng']}</td>
                <td>N/A</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    }
}

// Tính chênh lệch giá
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

// Tải dữ liệu từ GitHub và thực hiện sắp xếp và so sánh
async function loadDataAndCompare() {
    const urlYesterday = 'https://raw.githubusercontent.com/A1abaTrap/price/main/Gia_Hom_Qua.xlsx';
    const urlToday = 'https://raw.githubusercontent.com/A1abaTrap/price/main/Gia_Hom_Nay.xlsx';

    try {
        dataYesterday = await fetchExcelData(urlYesterday);
        dataToday = await fetchExcelData(urlToday);

        // Sắp xếp danh sách trước khi so sánh
        dataYesterday = sortByProductCode(dataYesterday);
        dataToday = sortByProductCode(dataToday);

        compareSortedLists(); // So sánh và hiển thị bảng
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
    }
}

// Tự động chạy khi trang web tải
window.onload = loadDataAndCompare;
