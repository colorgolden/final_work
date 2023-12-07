const productList = document.querySelector('.productWrap');
const productFilter = document.querySelector('.productSelect');
const cartList = document.querySelector('.shoppingCart-tableList');
const totalPrice = document.getElementById('totalPrice');

let cartData = [];

//初始化
function init(){
    renderProduct();
    renderCartList();
}

init();

// API-取得產品資料
async function getProductData(){
    await axios.get(`${url}/products`)
        .then(res => {
            productData = res.data.products;
            return productData;
        })
        .catch(err => {
            console.log(err.res); 
        })
}

// 加入產品字串
function productContent(item){
    return `<li class="productCard">
    <h4 class="productType">${item.category}</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="addCardBtn" data-name="js-btn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">${toThousandth(item.origin_price)}</del>
    <p class="nowPrice">${toThousandth(item.price)}</p>
    </li>`;
}

// 渲染產品資料
async function renderProduct(){
    await getProductData();
    let cardContent = '';
    
    productData.forEach ( item => {
    cardContent += productContent(item);
    });
    productList.innerHTML = cardContent;
}



// 添加產品分類篩選事件
productFilter.addEventListener('change', async (e) => {
    await getProductData();

    if ( e.target.value === '全部' ){
        renderProduct();     
        return; 
    }
        
    let cardContent = '';
     
    productData.forEach ( function (item) {
        if ( e.target.value === item.category )
        cardContent += productContent(item);
        })
        productList.innerHTML = cardContent;
});


async function renderCartList(){
    await axios.get(`${url}/carts`)
        .then( res => {
            cartData = res.data.carts;
            const finalTotal = res.data.finalTotal;
            let content = '';

            cartData.forEach( function (item){

                content +=  
                `<tr> 
                    <td>
                        <div class="cardItem-title">
                            <img src="${item.product.images}" alt="">
                            <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>${toThousandth(item.product.price)}</td>
                    <td>${item.quantity}</td>  
                    <td>${toThousandth( item.product.price * item.quantity )}</td>
                    <td class="discardBtn">
                        <a href="#" class="material-icons" data-id="${item.id}">
                            clear
                        </a>
                    </td>
                 </tr>`;

            })    
        cartList.innerHTML = content; 
        totalPrice.textContent = `${toThousandth(finalTotal)}`;
     })
}


// API-加入購物車功能
async function addCart(data){
    await axios.post(`${url}/carts`,data)
        .then(res => {
            alert('加入購物車成功');
            renderCartList();
        })
        .catch(err => {
            console.log(err.res); 
        })
}


// 加入購物車的按鈕監聽事件
productList.addEventListener('click', async (e) => {
    e.preventDefault();
    await renderCartList();

    const dataName = e.target.getAttribute('data-name');
    let productId = e.target.getAttribute('data-id');
    let productNum = 1;

    cartData.forEach(function(item){
      if (item.product.id === productId){
        productNum = item.quantity+=1;
      }
    });
    if ( dataName !== "js-btn"){
        return;                                                           // 如果不是按到按鈕，則return
    }else{
        data = { "data": { "productId": productId,  "quantity": productNum } };   //回傳產品id & 數量
        addCart(data);
    }
});


// API-清空購物車
const delCartAllBtn = document.querySelector('.discardAllBtn');
delCartAllBtn.addEventListener('click', function(e){
    e.preventDefault(); 
    axios.delete(`${url}/carts`)
    .then(res => {
        alert('清空購物車成功');
        renderCartList();
    })
    .catch(err => {
        console.log(err.res); 
    })
})

// API-刪除購物車個別項目
cartList.addEventListener('click',function(e){
    e.preventDefault();

    let id = e.target.getAttribute('data-id');
    axios.delete(`${url}/carts/${id}`)
    .then(res => {
        renderCartList();
    })

})


// API-取得訂單資料
const orderInfoForm = document.querySelector('.orderInfo-form');
const form = document.querySelector(".orderInfo-form");
const inputs = document.querySelectorAll("input[name],select[data=payment]");
const orderBtn = document.querySelectorAll(".orderInfo-btn");

orderInfoForm.addEventListener('click',function(e){
    e.preventDefault();
    if ( e.target.getAttribute('class') !== 'orderInfo-btn' ){ return };
    if (cartData.length === 0){
        alert('您購物車內還沒有任何商品喔！');
        return;
    }
        const customerName = document.querySelector('#customerName').value;
        const customerPhone = document.querySelector('#customerPhone').value;
        const customerEmail = document.querySelector('#customerEmail').value;
        const customerAddress = document.querySelector('#customerAddress').value;
        const tradeWay = document.querySelector('#tradeWay').value;

    // validate.js - 表單格式驗證
        const constraints = {
            "姓名": {
              presence: {
                message: "必填欄位"
              }
            },
            "電話": {
              presence: {
                message: "必填欄位"
              },
              length: {
                minimum: 8,
                message: "需超過 8 碼"
              }
            },
            "Email": {
              presence: {
                message: "必填欄位"
              },
              email: {
                message: "格式錯誤"
              }
            },
            "寄送地址": {
              presence: {
                message: "必填欄位"
              }
            },
            "交易方式": {
              presence: {
                message: "必填欄位"
              }
            },
          };

        let errors = validate(form, constraints) || '';
        if (errors){
            //填寫表單錯誤，回傳錯誤訊息
                let errors = validate(form, constraints) || '';
                inputs.forEach((item) => {
                    Object.keys(errors).forEach(function (keys) {
                        document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
                 });  
            });
            return;
        }else{
            //填寫表單正確，送出表單
            let data = {
                "data": {
                    "user": {
                        "name": customerName,
                        "tel": customerPhone,
                        "email": customerEmail,
                        "address": customerAddress,
                        "payment": tradeWay
                    }
                }
            };

            axios.post(`${url}/orders`,data)
            .then( res => {
                alert('送出訂單成功');
                form.reset();                    // 清除表單內容
                init();
            });
        }
    
})


// 價格加上千分位
function toThousandth(num){
    const options = {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0   //最小分位設定0，去除小數點，預設值為2
    }
    return (num).toLocaleString('zh-CN',options);
}