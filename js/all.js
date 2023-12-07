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
            //console.log(res.data.products);  
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
    <del class="originPrice">NT$${item.origin_price}</del>
    <p class="nowPrice">NT$${item.price}</p>
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


// API-取得購物車資料
// async function getCartList(){
//     await axios.get(`${url}/carts`)
//         .then(res => {
//             cartData = res.data;
//             console.log('cartData',cartData);
//             return cartData;
//         })
//         .catch(err => {
//             console.log(err.res); 
//         })
// }

// getCartList();


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
                    <td>NT$${item.product.price}</td>
                    <td>1</td>  
                    <td>NT$${item.product.price}</td>
                    <td class="discardBtn">
                        <a href="#" class="material-icons" data-id="${item.id}">
                            clear
                        </a>
                    </td>
                 </tr>`
                 //數量要記得改，總額跟產品單價不一樣，要注意
            })    
        cartList.innerHTML = content; 
        totalPrice.textContent = `NT$${finalTotal}`;
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


//未完 - 加入購物車的按鈕監聽事件-還未加上數量
productList.addEventListener('click', async (e) => {
    e.preventDefault();
    await renderCartList();

    const dataName = e.target.getAttribute('data-name');
    let productId = e.target.getAttribute('data-id');
    let quantity = 1;
    //let numAdd = 1;

    if ( dataName !== 'js-btn'){
        return;
    }
    if ( dataName === 'js-btn'){

        data = { "data": { "productId": productId,  "quantity": quantity } };
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
    //console.log('id',id);
    axios.delete(`${url}/carts/${id}`)
    .then(res => {
        renderCartList();
    })

})


// API-取得訂單資料
const orderInfoBtn = document.querySelector('.orderInfo-btn');

orderInfoBtn.addEventListener('click',function(e){
    e.preventDefault();
    if (cartData.length == 0){
        alert('您購物車內還沒有任何商品喔！');
        return;
    }
        const customerName = document.querySelector('#customerName').value;
        const customerPhone = document.querySelector('#customerPhone').value;
        const customerEmail = document.querySelector('#customerEmail').value;
        const customerAddress = document.querySelector('#customerAddress').value;
        const tradeWay = document.querySelector('#tradeWay').value;


    if ( customerName =="" || customerPhone =="" || customerEmail =="" || customerAddress =="" || tradeWay =="" ){
        alert('請確認訂單資料是否輸入正確！');
        return;
    }
    if validate()
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
        }
        axios.post(`${url}/orders`,data)
        .then( res => {
            alert('送出訂單成功');
            init();
        })
    
})


// validate.js - 表單格式驗證
const inputs = document.querySelectorAll("input[name],select[data=payment]");
const orderBtn = document.querySelector(".orderInfo-btn");
const form = document.querySelector(".orderInfo-form");
function validate(){

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
      "信箱": {
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


    inputs.forEach((item) => {
      orderBtn.addEventListener("click", function () {
        
        item.nextElementSibling.textContent = '';
        let errors = validate(form, constraints) || '';
        console.log(errors)

        if (errors) {
          Object.keys(errors).forEach(function (keys) {
            // console.log(document.querySelector(`[data-message=${keys}]`))
            document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
          })
        }
      });
    });    
}
