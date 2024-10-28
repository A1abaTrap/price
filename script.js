let dataYesterday = [], dataToday = [], selectedProducts = [];

// Đọc file Excel và chuyển thành JSON
async function fetchExcelData(url) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
}

// Sắp xếp theo mã sản phẩm
const sortByProductCode = data => data.sort((a, b) => a['Mã  SP'].localeCompare(b['Mã  SP']));

// So sánh và hiển thị danh sách sản phẩm
function compareSortedLists() {
    const tableBody = document.getElementById('productTable');
    tableBody.innerHTML = dataToday.map(product => `
        <tr onclick="toggleProductSelection('${product['Mã  SP']}', this)">
            <td style="display:none">${product['Mã  SP']}</td>
            <td>${product['Tên SP']}</td>
            <td>${product['Quy Cách']}</td>
            <td>${findPriceYesterday(product['Mã  SP'])}</td>
            <td>${product['Giá Bán Đồng']}</td>
            <td>${getPriceDifference(product)}</td>
        </tr>`).join('');
}

// Tìm giá hôm qua
const findPriceYesterday = code => dataYesterday.find(p => p['Mã  SP'] === code)?.['Giá Bán Đồng'] || 'Không có';

// Tính chênh lệch giá
function getPriceDifference(product) {
    const oldPrice = findPriceYesterday(product['Mã  SP']);
    const diff = product['Giá Bán Đồng'] - oldPrice;
    return oldPrice === 'Không có' ? 'Không có dữ liệu' :
           diff > 0 ? `Tăng ${diff} VND` : diff < 0 ? `Giảm ${-diff} VND` : 'Không đổi';
}

// Thêm hoặc xóa sản phẩm đã chọn
function toggleProductSelection(code, row) {
    const index = selectedProducts.findIndex(p => p['Mã  SP'] === code);
    index === -1 ? addProduct(code, row) : removeProduct(index, row);
    renderSelectedProducts();
}

function addProduct(code, row) {
    const product = dataToday.find(p => p['Mã  SP'] === code);
    selectedProducts.push({ ...product, quantity: 1 });
    row.classList.add('selected');
}

function removeProduct(index, row) {
    selectedProducts.splice(index, 1);
    row.classList.remove('selected');
}

// Hiển thị sản phẩm đã chọn
function renderSelectedProducts() {
    const tableBody = document.getElementById('selectedProductsTable');
    tableBody.innerHTML = selectedProducts.map((p, i) => `
        <tr onclick="removeSelectedProduct(${i})">
            <td>${p['Tên SP']}</td>
            <td>
                <input type="number" min="0.1" step="0.1" value="${p.quantity}" 
                       onchange="updateQuantity(${i}, this.value)" 
                       onclick="event.stopPropagation()" 
                       style="width:50px; border:none"/>
            </td>
            <td>${formatCurrency(p['Giá Bán Đồng'])}</td>
            <td>${formatCurrency(p['Giá Bán Đồng'] * p.quantity)}</td>
        </tr>`).join('');
    updateTotalAmount();
}

// Xóa sản phẩm trong bảng đã chọn
function removeSelectedProduct(index) {
    const productCode = selectedProducts[index]['Mã  SP'];
    selectedProducts.splice(index, 1);
    document.querySelectorAll('#productTable tr').forEach(row => {
        if (row.cells[0].textContent === productCode) row.classList.remove('selected');
    });
    renderSelectedProducts();
}

// Cập nhật số lượng và tổng tiền
const updateQuantity = (index, value) => {
    const quantity = parseFloat(value);
    if (!isNaN(quantity) && quantity > 0) {
        selectedProducts[index].quantity = quantity;
    } else {
        selectedProducts[index].quantity = 1; // Mặc định 1 nếu giá trị không hợp lệ
    }
    renderSelectedProducts();
};
const updateTotalAmount = () => {
    const total = selectedProducts.reduce((sum, p) => sum + p['Giá Bán Đồng'] * p.quantity, 0);
    document.getElementById('totalAmount').textContent = formatCurrency(total);
};

// Định dạng tiền tệ Việt Nam
const formatCurrency = amount => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

// Lọc sản phẩm theo tìm kiếm
function filterProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    document.getElementById('clearSearch').style.display = query ? 'inline' : 'none';
    document.querySelectorAll('#productTable tr').forEach(row => {
        const productName = row.cells[1].textContent.toLowerCase();
        row.style.display = productName.includes(query) ? '' : 'none';
    });
}

// Xóa tìm kiếm và làm mới danh sách
const clearSearch = () => {
    document.getElementById('searchInput').value = '';
    filterProducts();
};

// Tải dữ liệu và hiển thị khi trang tải xong
async function loadDataAndCompare() {
    try {
        const [yesterday, today] = await Promise.all([
            fetchExcelData('https://raw.githubusercontent.com/A1abaTrap/price/main/Gia_Hom_Qua.xlsx'),
            fetchExcelData('https://raw.githubusercontent.com/A1abaTrap/price/main/Gia_Hom_Nay.xlsx')
        ]);
        dataYesterday = sortByProductCode(yesterday);
        dataToday = sortByProductCode(today);
        compareSortedLists();
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
    }
}

window.onload = loadDataAndCompare;
