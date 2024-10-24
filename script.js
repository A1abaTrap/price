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
    // Lọc ra các mục không có 'Mã Sản Phẩm'
    const filteredData = data.filter(item => item['Mã Sản Phẩm'] !== undefined);

    // Sắp xếp dữ liệu đã lọc
    return filteredData.sort((a, b) => {
        return a['Mã Sản Phẩm'].localeCompare(b['Mã Sản Phẩm']);
    });
}

// So sánh hai danh sách đã được sắp xếp
function compareSortedLists() {
    const tableBody = document.getElementById('productTable');
    tableBody.innerHTML = ''; // Xóa nội dung cũ

    let i = 0, j = 0;

    while (i < dataYesterday.length && j < dataToday.length) {
        const yesterdayProduct = dataYesterday[i];
        const todayProduct = dataToday[j];

        if (yesterdayProduct['Mã Sản Phẩm'] === todayProduct['Mã Sản Phẩm']) {
            // So sánh giá nếu mã sản phẩm trùng khớp
            const priceDifference = getPriceDifference(
                todayProduct['Đơn Giá'], 
                yesterdayProduct['Đơn Giá']
            );

            const row = `
                <tr>
                    <td>${todayProduct['Mã Sản Phẩm']}</td>
                    <td>${todayProduct['Tên Sản Phẩm']}</td>
                    <td>${todayProduct['Đơn Vị Tính']}</td>
                    <td>${yesterdayProduct['Đơn Giá']}</td>
                    <td>${todayProduct['Đơn Giá']}</td>
                    <td>${priceDifference}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
            i++; j++; // Tiến tới sản phẩm tiếp theo trong cả hai danh sách
        } else if (yesterdayProduct['Mã Sản Phẩm'] < todayProduct['Mã Sản Phẩm']) {
            // Sản phẩm chỉ có trong bảng hôm qua
            const row = `
                <tr>
                    <td>${yesterdayProduct['Mã Sản Phẩm']}</td>
                    <td>${yesterdayProduct['Tên Sản Phẩm']}</td>
                    <td>${yesterdayProduct['Đơn Vị Tính']}</td>
                    <td>${yesterdayProduct['Đơn Giá']}</td>
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
                    <td>${todayProduct['Mã Sản Phẩm']}</td>
                    <td>${todayProduct['Tên Sản Phẩm']}</td>
                    <td>${todayProduct['Đơn Vị Tính']}</td>
                    <td>Không có trong bảng hôm qua</td>
                    <td>${todayProduct['Đơn Giá']}</td>
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
                <td>${product['Mã Sản Phẩm']}</td>
                <td>${product['Tên Sản Phẩm']}</td>
                <td>${product['Đơn Vị Tính']}</td>
                <td>${product['Đơn Giá']}</td>
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
                <td>${product['Mã Sản Phẩm']}</td>
                <td>${product['Tên Sản Phẩm']}</td>
                <td>${product['Đơn Vị Tính']}</td>
                <td>Không có trong bảng hôm qua</td>
                <td>${product['Đơn Giá']}</td>
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
