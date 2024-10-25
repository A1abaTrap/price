let dataYesterday = [];
let dataToday = [];
let selectedProducts = [];

// Đọc file Excel từ URL GitHub và chuyển thành JSON
async function fetchExcelData(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

    const sheetName = workbook.SheetNames[0]; 
    const sheet = workbook.Sheets[sheetName];

    return XLSX.utils.sheet_to_json(sheet);
}

// Sắp xếp danh sách theo mã sản phẩm
function sortByProductCode(data) {
    return data.sort((a, b) => a['Mã  SP'].localeCompare(b['Mã  SP']));
}

// So sánh và hiển thị danh sách sản phẩm
function compareSortedLists() {
    const tableBody = document.getElementById('productTable');
    tableBody.innerHTML = '';

    dataToday.forEach(product => {
        const row = `
            <tr>
                <td style="display:none">${product['Mã  SP']}</td>
                <td>${product['Tên SP']}</td>
                <td>${product['Quy Cách']}</td>
                <td>${findPriceYesterday(product['Mã  SP'])}</td>
                <td>${product['Giá Bán Đồng']}</td>
                <td>${getPriceDifference(product)}</td>
                <td>
                    <input type="checkbox" value="${product['Mã  SP']}" 
                           onchange="toggleProductSelection(this)" />
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Tìm giá hôm qua của sản phẩm
function findPriceYesterday(productCode) {
    const product = dataYesterday.find(p => p['Mã  SP'] === productCode);
    return product ? product['Giá Bán Đồng'] : 'Không có';
}

// Tính chênh lệch giá
function getPriceDifference(product) {
    const priceYesterday = findPriceYesterday(product['Mã  SP']);
    const priceToday = product['Giá Bán Đồng'];

    if (priceYesterday === 'Không có') return 'Không có dữ liệu';

    const difference = priceToday - priceYesterday;
    return difference > 0 ? `Tăng ${difference} VND` :
           difference < 0 ? `Giảm ${Math.abs(difference)} VND` : 'Không đổi';
}

// Hàm xử lý khi chọn/bỏ chọn sản phẩm
function toggleProductSelection(checkbox) {
    const productCode = checkbox.value;
    const product = dataToday.find(p => p['Mã  SP'] === productCode);

    if (checkbox.checked) {
        selectedProducts.push({ ...product, quantity: 1 });
    } else {
        selectedProducts = selectedProducts.filter(p => p['Mã  SP'] !== productCode);
    }

    renderSelectedProducts();
}

// Hiển thị danh sách sản phẩm đã chọn
function renderSelectedProducts() {
    const tableBody = document.getElementById('selectedProductsTable');
    tableBody.innerHTML = '';

    selectedProducts.forEach((product, index) => {
        const row = `
            <tr>
                <td>${product['Tên SP']}</td>
                <td>
                    <input type="number" min="1" value="${product.quantity}" 
                           onchange="updateQuantity(${index}, this.value)" />
                </td>
                <td>${formatCurrency(product['Giá Bán Đồng'])}</td>
                <td>${formatCurrency(product['Giá Bán Đồng'] * product.quantity)}</td>
                <td><input type="checkbox" checked onchange="toggleProductSelection(this)" value="${product['Mã  SP']}" /></td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    updateTotalAmount();
}

// Cập nhật số lượng sản phẩm
function updateQuantity(index, quantity) {
    selectedProducts[index].quantity = parseInt(quantity);
    renderSelectedProducts();
}

// Cập nhật tổng tiền
function updateTotalAmount() {
    const total = selectedProducts.reduce((sum, product) => 
        sum + product['Giá Bán Đồng'] * product.quantity, 0);
    document.getElementById('totalAmount').textContent = formatCurrency(total);
}

// Hàm định dạng tiền tệ Việt Nam
function formatCurrency(amount) {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// Lọc sản phẩm theo tìm kiếm
function filterProducts() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const table = document.getElementById('productTable');
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const productName = cells[1]?.textContent.toLowerCase() || '';

        rows[i].style.display = productName.includes(input) ? '' : 'none';
    }
}

// Tải dữ liệu từ GitHub và hiển thị kết quả
async function loadDataAndCompare() {
    const urlYesterday = 'https://raw.githubusercontent.com/A1abaTrap/price/main/Gia_Hom_Qua.xlsx';
    const urlToday = 'https://raw.githubusercontent.com/A1abaTrap/price/main/Gia_Hom_Nay.xlsx';

    try {
        dataYesterday = await fetchExcelData(urlYesterday);
        dataToday = await fetchExcelData(urlToday);

        dataYesterday = sortByProductCode(dataYesterday);
        dataToday = sortByProductCode(dataToday);

        compareSortedLists();
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
    }
}

// Tự động chạy khi trang web tải
window.onload = loadDataAndCompare;
