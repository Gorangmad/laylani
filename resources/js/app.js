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
    const items = [];

    // Iterate through each item row in the table body
    const itemRows = document.querySelectorAll('#pizza-table-body tr');
    itemRows.forEach((row) => {
      const quantityInput = row.querySelector('.quantity-input');
      const pizzaData = JSON.parse(quantityInput.dataset.pizza);
      const quantity = parseInt(quantityInput.value);

      // Add the selected item and quantity to the items array
      if (quantity >= 0) {
        items.push({ pizza: pizzaData, quantity });
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
        axios.post('/orders', { user: { _id: userId, name: userName }, items, name: userName, phone, lieferType, paymentType })
          .then(res => {
            // Handle successful order creation
            console.log('Order created:', res.data);

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

