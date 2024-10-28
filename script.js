let dataYesterday = [], dataToday = [], mergedData = [], selectedProducts = [];

// Đọc file Excel và chuyển thành JSON
async function fetchExcelData(url) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
}

// Sắp xếp theo mã sản phẩm
const sortByProductCode = data => data.sort((a, b) => a['Mã  SP'].localeCompare(b['Mã  SP']));


// Gộp dữ liệu từ hôm qua và hôm nay
function mergeProductData() {
    const productMap = new Map();

    // Thêm sản phẩm của hôm qua vào Map
    dataYesterday.forEach(product => {
        productMap.set(product['Mã  SP'], {
            code: product['Mã  SP'],
            name: product['Tên SP'],
            spec: product['Quy Cách'],
            oldPrice: product['Giá Bán Đồng'],
            newPrice: 'Không có'
        });
    });

    // Cập nhật sản phẩm từ hôm nay hoặc thêm mới vào Map
    dataToday.forEach(product => {
        if (productMap.has(product['Mã  SP'])) {
            productMap.get(product['Mã  SP']).newPrice = product['Giá Bán Đồng'];
        } else {
            productMap.set(product['Mã  SP'], {
                code: product['Mã  SP'],
                name: product['Tên SP'],
                spec: product['Quy Cách'],
                oldPrice: 'Không có',
                newPrice: product['Giá Bán Đồng']
            });
        }
    });

    mergedData = Array.from(productMap.values());
}



// Hiển thị danh sách sản phẩm
function renderProductList() {
    const tableBody = document.getElementById('productTable');
    tableBody.innerHTML = mergedData.map(product => `
        <tr onclick="toggleProductSelection('${product.code}', this)">
            <td style="display:none">${product.code}</td>
            <td>${product.name}</td>
            <td>${product.spec}</td>
            <td>${product.oldPrice}</td>
            <td>${product.newPrice}</td>
            <td>${getPriceDifference(product)}</td>
        </tr>`).join('');
}


// Tìm giá hôm qua
const findPriceYesterday = code => dataYesterday.find(p => p['Mã  SP'] === code)?.['Giá Bán Đồng'] || 'Không có';

// Tính chênh lệch giá
function getPriceDifference(product) {
    const { oldPrice, newPrice } = product;

    if (oldPrice === 'Không có' || newPrice === 'Không có') {
        return 'Không có dữ liệu';
    }

    const diff = newPrice - oldPrice;
    return diff > 0 ? `Tăng ${diff} VND` : diff < 0 ? `Giảm ${-diff} VND` : 'Không đổi';
}


// Thêm hoặc xóa sản phẩm đã chọn
function toggleProductSelection(code, row) {
    const index = selectedProducts.findIndex(p => p.code === code);
    index === -1 ? addProduct(code, row) : removeProduct(index, row);
    renderSelectedProducts();
}

function addProduct(code, row) {
    const product = mergedData.find(p => p.code === code);
    if (product) {
        selectedProducts.push({ ...product, quantity: 1 });
        row.classList.add('selected');
    }
}

function removeProduct(index, row) {
    const productCode = selectedProducts[index].code;
    selectedProducts.splice(index, 1);
    document.querySelectorAll('#productTable tr').forEach(row => {
        if (row.cells[0].textContent === productCode) row.classList.remove('selected');
    });
    renderSelectedProducts();
}


// Hiển thị sản phẩm đã chọn
function renderSelectedProducts() {
    const tableBody = document.getElementById('selectedProductsTable');
    tableBody.innerHTML = selectedProducts.map((p, i) => `
        <tr onclick="removeSelectedProduct(${i})">
            <td>${p.name}</td>
            <td>
                <input type="number" min="0.1" step="0.1" value="${p.quantity}" 
                       onchange="updateQuantity(${i}, this.value)" 
                       onclick="event.stopPropagation()" 
                       style="width:50px; border:none"/>
            </td>
            <td>${formatCurrency(p.newPrice)}</td>
            <td>${formatCurrency(p.newPrice * p.quantity)}</td>
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

// Cập nhật số lượng và làm mới bảng
const updateQuantity = (index, value) => {
    const quantity = parseFloat(value);
    if (!isNaN(quantity) && quantity > 0) {
        selectedProducts[index].quantity = quantity;
    } else {
        selectedProducts[index].quantity = 1; // Mặc định 1 nếu giá trị không hợp lệ
    }
    renderSelectedProducts();
};

// Cập nhật tổng tiền
const updateTotalAmount = () => {
    const total = selectedProducts.reduce((sum, p) => {
        const price = parseFloat(p.newPrice) || 0; // Lấy đúng thuộc tính newPrice
        return sum + price * p.quantity;
    }, 0); // Khởi tạo tổng là 0

    document.getElementById('totalAmount').textContent = formatCurrency(total);
};


// Định dạng tiền tệ Việt Nam
const formatCurrency = amount => 
    amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

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
        mergeProductData(); // Gộp dữ liệu từ hôm qua và hôm nay
        renderProductList(); // Hiển thị danh sách sản phẩm

    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
    }
}


window.onload = loadDataAndCompare;
