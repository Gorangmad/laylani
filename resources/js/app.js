import axios from 'axios'
import Noty from 'noty'
import { initAdmin } from './admin'
import moment from 'moment'
import { initSingleOrder } from './singleOrder'
import { initTotal } from './total'
import { initArchiv } from './archiv'
import { initUsers } from './user'

let addToCart = document.querySelectorAll('.add-to-cart-button');
let addToOldCart = document.querySelectorAll('.add-to-old-cart-button');
let removeToCart = document.querySelectorAll(".remove-to-cart");
let updateToCart = document.querySelectorAll(".update-cart-button")

function updateCartItem(button, pizzaData, totalPrice, size) {
    const itemSizeElement = button.parentElement.parentElement.querySelector(".sizes").textContent.trim();

    if (itemSizeElement === size) {
        const quantityElement = button.parentElement.querySelector('.itemQty');
        const itemPriceElement = button.parentElement.parentElement.querySelector(".itemPrice");

        if (pizzaData.qty > 0) {
            quantityElement.textContent = pizzaData.qty;
            const itemPrice = pizzaData.qty * Number(pizzaData.item.price);
            itemPriceElement.textContent = itemPrice.toFixed(2);
        } else {
            button.parentElement.remove();
        }

        const totalPriceElement = document.querySelector('.totalPrice');
        totalPriceElement.textContent = totalPrice.toFixed(2);
    }
}

function updateCart(pizza, url, msg, button) {
    axios.post(url, pizza)
        .then(res => {
            new Noty({
                type: 'success',
                timeout: 1000,
                text: msg,
                progressBar: false,
            }).show();

            updateCartCounter(res.data.totalQty);
            updateCartItem(button, res.data.cartItems[`${pizza._id}_${pizza.sizes}`], res.data.totalPrice, pizza.sizes);
        })
        .catch(err => {});

    // Reset sizeSelected to false
    localStorage.setItem('sizeSelected', false);
}

function updateCartCounter(totalQty) {
  const cartCounter = document.getElementById('cartCounter');
  if (cartCounter) {
      cartCounter.textContent = totalQty;
  }
}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let pizza = JSON.parse(btn.dataset.pizza);
        
        // Check if size has been selected
        const sizeSelected = localStorage.getItem('sizeSelected');
        const isUniversalSize = pizza.sizes === "";
        if (!isUniversalSize && (!sizeSelected || sizeSelected === "false")) {
            alert('Suchen Sie eine Größe aus');
            return; // Prevent adding to cart
        }

        // If data fetched from session, there will be an "item object" => (cart.ejs)
        if (pizza.item) {
            pizza = pizza.item;
        }

        let url = "/update-cart";
        updateCart(pizza, url, "Item added to cart", btn);
    });
});

updateToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let pizza = JSON.parse(btn.dataset.pizza);

        // If data fetched from session, there will be an "item object" => (cart.ejs)
        if (pizza.item) {
            pizza = pizza.item;
        }

        let url = "/update-cart";
        updateCart(pizza, url, "Item added to cart", btn);
    });
});

addToOldCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let pizza = JSON.parse(btn.dataset.pizza);
        
        console.log(pizza.item)

        // If data fetched from session, there will be an "item object" => (cart.ejs)
        if (pizza.item) {
            pizza = pizza.item;
        }

        let url = "/update-cart";
        updateCart(pizza, url, "Item added to cart", btn);
    });
});

removeToCart.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        let pizza = JSON.parse(btn.dataset.pizza);
        let url = "/remove-cart";
        updateCart(pizza.item, url, "Item removed from cart", btn);
    });
});





initSingleOrder()
initArchiv()
initTotal()




// Remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if(alertMsg) {
 setTimeout(() => {
     alertMsg.remove()
 }, 2000)
}

initAdmin(socket)
initUsers()

// Change order status
let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
let time = document.createElement('small')

function updateStatus(order) {
  statuses.forEach((status) => {
    status.classList.remove('step-completed')
    status.classList.remove('current')
})
let stepCompleted = true;
statuses.forEach((status) => {
   let dataProp = status.dataset.status
   if(stepCompleted) {
        status.classList.add('step-completed')
   }
   if(dataProp === order.status) {
        stepCompleted = false
        time.innerText = moment(order.updatedAt).format('hh:mm A')
        status.appendChild(time)
       if(status.nextElementSibling) {
        status.nextElementSibling.classList.add('current')
       }
   }
})
}

updateStatus(order);

// Socket
const socket = io()

// Join
if(order) {
   socket.emit('join', `order_${order._id}`)
}
let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin')) {
   initAdmin(socket)
   socket.emit('join', 'adminRoom')
}


socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateStatus(updatedOrder)
    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order updated',
        progressBar: false,
    }).show();
})