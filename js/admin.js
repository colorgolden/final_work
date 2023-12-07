const orderList = document.querySelector('.orderPage-tableList');

// C3.js
function renderC3(c3Data){
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: c3Data,
            colors:{
                "Antony 雙人床架／雙人加大":"#DACBFF",
                "Jordan 雙人床架／雙人加大":"#9D7FEA",
                "Antony 床邊桌": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });
}


// API- 後端取得訂單資料
function getOrderInfo(){
    axios.get(`${admin_url}/orders`,{
        headers:{
            'Authorization':token,
        }
    })
        .then( res => {
            orderData = res.data.orders;
            renderOrderList(orderData);   
            getC3Data(orderData);
    })    
}

getOrderInfo();


//取得產品項目&銷售額
function getC3Data(orderData){
    let productObj = {};
    orderData.forEach(function(item){
        item.products.forEach((productItem) => {
             if ( productObj[productItem.title] == undefined) { 
                productObj[ productItem.title ] = (productItem.price)*(productItem.quantity); 
             }else{ 
                productObj[ productItem.title ] +=  (productItem.price)*(productItem.quantity);
             }
        })
    }); 
    sortProduct(productObj);
}

//c3圖表排序
function sortProduct(productObj){
    const productAry = Object.entries(productObj);   // 直接轉換成相對應的陣列格式
    productAry.sort((a, b) => b[1] - a[1]);          // 從大至小，排序陣列
    
    //console.log(productAry);
    //formatC3Data(rankedObj);

    //銷售排名第3之後的品項，歸類到'其他'
    let combinedArray;
    const combinedAry = productAry.map((item, index) => {
        if (index < 3) {
            return item;
        } else {
            return ['其他', (item[1] || 0) + ([3][1] || 0)];
        }
    });
    
     // 轉換成entries前原本的物件格式，也就是c3資料的格式
    const rankedObj = Object.fromEntries(combinedAry);   //轉換回"已排序 & 合併後" 的物件格式
    formatC3Data(rankedObj);
}

//轉換c3 chart格式
function formatC3Data(rankedObj){
    //console.log('rankedObj',rankedObj);
    let ary = Object.keys(rankedObj);
    let c3Data = [];
    ary.forEach(function(item){
        c3Data.push([item,rankedObj[item]]);    
    }); 
    renderC3(c3Data);
}


// 渲染訂單清單
function renderOrderList(orderData){
    let content = '';
    orderData.forEach(item => {
        //取得時間資料
        const year = new Date(item.createdAt*1000).getFullYear();
        const month = (new Date(item.createdAt*1000).getMonth())+1;
        const day = new Date(item.createdAt*1000).getDate();
        
        //轉換訂單狀態成文字
        let paidState = '';
        if (item.paid == false){ paidState = "未付款" }
        if (item.paid == true){ paidState = "已付款" };

        //產品字串
        let productStr = "";
        item.products.forEach((productItem) => {
            productStr += `${ productItem.title }*${ productItem.quantity }`;
        })
        
        content += ` <tr class="orderPage-item">
        <td>${item.id}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          <p>${productStr}</p>
        </td>
        <td>${year}/${month}/${day}</td>
        <td class="orderStatus">
          <a href="#" class="changePaidState" data-id="${item.id}" data-state="${item.paid}">${paidState}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
        </td>
        </tr>`
        
    }) 
    orderList.innerHTML = content;    
}


// API-後端刪除單筆訂單
const delSingleOrderBtn = document.querySelector('.orderPage-item');

orderList.addEventListener('click',function(e){
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");

    let id = e.target.getAttribute('data-id');

    if (targetClass == 'delSingleOrder-Btn'){
    axios.delete(`${admin_url}/orders/${id}`,{
        headers:{
            'Authorization':token,
            }
        })
        .then( res => {
            alert('刪除該筆訂單成功');
            getOrderInfo();
        })
    }
    if(targetClass == 'changePaidState'){ 
        const paid = e.target.getAttribute('data-state');
        let newState = "";

        const orderId = e.target.getAttribute('data-id');
        if (paid !== true){ 
            newState = true;                              //這一段無法切換回false
        }else{
            newState = false; 
        }
        //console.log(orderId,newState);
        changeOrderStatus(orderId,newState); }
})

// API-變更訂單狀態
function changeOrderStatus(orderId,newState){
    data = {
        "data": {
          "id": orderId,
          "paid": newState
        }
      }
    axios.put(`${admin_url}/orders`,data,{
        headers:{
            'Authorization':token,
            }
        })
        .then( res => {
            alert('變更訂單狀態成功');
            getOrderInfo();
        })
}


// API-刪除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',function(e){
    axios.delete(`${admin_url}/orders`,{
        headers:{
            'Authorization':token,
            }
        })
        .then( res => {
            alert('刪除全部訂單成功');
            getOrderInfo();
        })
});
