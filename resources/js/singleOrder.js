import axios from 'axios'
import QRCode from 'qrcode'

export function initSingleOrder() {
  document.addEventListener('DOMContentLoaded', () => {
    const orderTableBody = document.querySelector('#orderBody')
    const url = window.location.pathname
    const orderId = url.split('\\').pop().split('/').pop();

    let orders = []
    let markup

    axios.get('/admin/orders', {
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    }).then(res => {
      orders = res.data
      console.log(orders._id)
      markup = generateMarkup(orders)
      orderTableBody.innerHTML = markup
    }).catch(err => {
      console.log(err)
    })

    function renderItems(items) {
      let parsedItems = Object.values(items)
      return parsedItems.map((menuItem) => {
        return `
          <p>${menuItem.item.name} - ${menuItem.qty} pcs</p>
        `
      }).join('')
    }

    function generateMarkup(orders) {
      let qrCode = ''; // define qrCode variable before calling QRCode.toDataURL

      return orders.map(order => {
        QRCode.toDataURL(url, (err, dataURI) => {
          if (err) throw err;
          qrCode = `<img src="${dataURI}" />`; // assign the value of dataURI to qrCode
        });

        if (order._id === orderId) {
          return `
            <div id="order" class="bg-white shadow overflow-hidden sm:rounded-lg">
              <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Neue ${order.lieferType}
                </h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">
                  ${order._id}
                </p>
              </div>
              <div class="border-t border-gray-200">
                <dl>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">
                      Full Name
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      ${order.name}
                    </dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">
                      Application for
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      ${order.address}
                    </dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">
                      Total
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      ${order.totalPrice}
                    </dd>
                  </div>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">
                      Items
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      ${renderItems(order.items)}
                    </dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">
                      Payment
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <strong>${order.paymentStatus ? 'paid' : 'Not paid'}</strong>
                    </dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">
                      qrCode
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <strong>${qrCode}</strong>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          `
        }
      }).join('')
    }

    function renderItems(items) {
      let parsedItems = Object.values(items);
      return parsedItems.map((menuItem) => {
        return `
          <div class="flex items-center mb-2">
            <p class="mr-2">${menuItem.item.name}</p>
            <input
              type="number"
              class="quantity-input"
              value="${menuItem.qty}"
              data-order-id="${orderId}"
              data-item-id="${menuItem.item._id}"
            />
          </div>
        `;
      }).join('');
    }

    orderTableBody.addEventListener('change', function (event) {
      const target = event.target;
      if (target.classList.contains('quantity-input')) {
        const orderId = target.dataset.orderId;
        const itemId = target.dataset.itemId;
        const newQty = target.value;
        updateItemQuantity(orderId, itemId, newQty);
      }
    });

    function updateItemQuantity(orderId, itemId, newQty) {
      // Make the necessary updates in the orders data structure or send a request to the server
      // to update the item quantity for the specified order and item IDs.
      // For example, you can use axios to send a PUT request to the server.
      axios.put(`/admin/orders/${orderId}/items/${itemId}`, { qty: newQty })
        .then(res => {
          // Handle the successful update, if needed
          console.log('Item quantity updated successfully');
        })
        .catch(err => {
          // Handle the error, if needed
          console.log('Error updating item quantity:', err);
        });
    }
  });
}

