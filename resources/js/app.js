import axios from 'axios'
import Noty from 'noty'
import { initAdmin } from './admin'
import moment from 'moment'
import { initSingleOrder } from './singleOrder'
import { initTotal } from './total'
import { initArchiv } from './archiv'

let addToCart = document.querySelectorAll('.add-to-cart')
let removeToCart = document.querySelectorAll(".remove-to-cart");
let cartCounter = document.querySelector('#cartCounter')
const orderHeaders = document.querySelectorAll('th[contenteditable="true"]:not(#order-name-header)');


let deferredPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;

  const installButton = document.getElementById('install-button');
  installButton.style.display = 'block';

  installButton.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  });
});

function updateCart(pizza, url, msg) {

  axios.post(url, pizza).then(res => {
      cartCounter.innerText = res.data.totalQty
      new Noty({
          type: 'success',
          timeout: 1000,
          text: msg,
          progressBar: false,
      }).show();
  }).catch(err => {
      new Noty({
          type: 'error',
          timeout: 1000,
          text: 'Something went wrong',
          progressBar: false,
      }).show();
  })
}


addToCart.forEach((btn) => {

 btn.addEventListener('click', (e) => {
     let pizza = JSON.parse(btn.dataset.pizza)
     // if data fetched from session , there will be have "item object" => (cart.ejs)
     if (pizza.item) {
         pizza = pizza.item;
     }
     let url = "/update-cart";
     updateCart(pizza, url, "Item added to cart, please refresh site");
     });
 });

 removeToCart.forEach((btn) => {
     btn.addEventListener("click", (e) => {
     let pizza = JSON.parse(btn.dataset.pizza);
     let url = "/remove-cart";
     updateCart(pizza.item, url, "Item removed from cart, please refresh site");
 })
})

const createOrderBtn = document.getElementById('create-order');
if (createOrderBtn) {
  createOrderBtn.addEventListener('click', () => {
    const orderNames = Array.from(orderHeaders).map(header => header.innerText);
    console.log(orderNames)
    const items = [];

    // Iterate through each item row in the table body
    const itemRows = document.querySelectorAll('#pizza-table-body tr');
    itemRows.forEach((row) => {
      const pizzaData = JSON.parse(row.querySelector('.quantity-input').dataset.pizza);

    
      const quantity1 = parseInt(row.querySelector('[data-order="1"]').value);
      const quantity2 = parseInt(row.querySelector('[data-order="2"]').value);
      const quantity3 = parseInt(row.querySelector('[data-order="3"]').value);
      const quantity4 = parseInt(row.querySelector('[data-order="4"]').value);
      const quantity5 = parseInt(row.querySelector('[data-order="5"]').value);
      const quantity6 = parseInt(row.querySelector('[data-order="6"]').value);
      const quantity7 = parseInt(row.querySelector('[data-order="7"]').value);
      const quantity8 = parseInt(row.querySelector('[data-order="8"]').value);
      const quantity9 = parseInt(row.querySelector('[data-order="9"]').value);
      const quantity10 = parseInt(row.querySelector('[data-order="10"]').value);
      const quantity11 = parseInt(row.querySelector('[data-order="11"]').value);
      const quantity12 = parseInt(row.querySelector('[data-order="12"]').value);
      const quantity13 = parseInt(row.querySelector('[data-order="13"]').value);
      const quantity14 = parseInt(row.querySelector('[data-order="14"]').value);
      const quantity15= parseInt(row.querySelector('[data-order="15"]').value);
      const quantity16 = parseInt(row.querySelector('[data-order="16"]').value);
      const quantity17 = parseInt(row.querySelector('[data-order="17"]').value);
      const quantity18 = parseInt(row.querySelector('[data-order="18"]').value);
      const quantity19 = parseInt(row.querySelector('[data-order="19"]').value);
      const quantity20 = parseInt(row.querySelector('[data-order="20"]').value);
      const quantity21 = parseInt(row.querySelector('[data-order="21"]').value);
      const quantity22 = parseInt(row.querySelector('[data-order="22"]').value);
      const quantity23 = parseInt(row.querySelector('[data-order="23"]').value);
      const quantity24 = parseInt(row.querySelector('[data-order="24"]').value);
    
      // Add the selected item and quantities to the items array
      if (quantity1 >= 0 || quantity2 >= 0|| quantity3 >= 0|| quantity4 >= 0|| quantity5 >= 0|| quantity6 >= 0|| quantity7 >= 0|| quantity8 >= 0|| quantity9 >= 0|| quantity10 >= 0|| quantity11 >= 0|| quantity12 >= 0|| quantity13 >= 0|| quantity14 >= 0|| quantity15 >= 0|| quantity16 >= 0|| quantity17 >= 0|| quantity18 >= 0|| quantity19 >= 0|| quantity20 >= 0|| quantity21 >= 0|| quantity22 >= 0|| quantity23 >= 0|| quantity24 >= 0) {
        items.push({ pizza: pizzaData, quantity1, quantity2, quantity3, quantity4, quantity5, quantity6, quantity7, quantity8, quantity9, quantity10, quantity11, quantity12, quantity13, quantity14, quantity15, quantity16, quantity17, quantity18, quantity19, quantity20, quantity21, quantity22, quantity23, quantity24});
      }
    });

    // Retrieve the user data from the server
    axios.get('/user')
      .then(res => {
        // Handle successful response
        const user = res.data; // Assuming the response data contains the user object

        // Extract the user ID and name
        const userId = user._id;
        const userName = user.name;

        // Extract additional order information from the form fields
        const phone = '1234567890'; // Replace with the desired phone number
        const lieferType = 'abholung'; // Replace with the desired delivery type ('abholung' or 'lieferung')
        const paymentType = 'bar'; // Replace with the desired payment type ('card' or 'bar')

        // Send the order creation request with the required parameters
        axios.post('/orders', { user: { _id: userId, name: userName }, items, name: userName, phone, lieferType, paymentType,orderNames: orderNames })
          .then(res => {
            // Handle successful order creation

            // Clear the selected item quantities
            const itemRows = document.querySelectorAll('#pizza-table-body tr');
            itemRows.forEach(row => {
              const quantityInput = row.querySelector('.quantity-input');
              quantityInput.value = 0;
            });

            // Show success message to the customer using Noty
            new Noty({
              type: 'success',
              text: 'Order placed successfully',
              timeout: 1000, // Adjust the timeout duration as needed
              progressBar: true
            }).show();
          })
          .catch(err => {
            // Handle order creation error
            console.error('Order creation failed:', err);
          });
      })
      .catch(err => {
        // Handle error
        console.error('Error requesting user:', err);
      });
  });
}







// Remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if(alertMsg) {
 setTimeout(() => {
     alertMsg.remove()
 }, 2000)
}



initSingleOrder()
initTotal()
initArchiv()

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