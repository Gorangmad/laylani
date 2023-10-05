import axios from 'axios';
import QRCode from 'qrcode';
import Noty from 'noty';

export function initSingleOrder() {
  document.addEventListener('DOMContentLoaded', () => {
    const orderTableBody = document.querySelector('#orderBody');
    const url = window.location.pathname;
    const orderId = url.split('\\').pop().split('/').pop();

    const data = `https://starfish-app-nki4g.ondigitalocean.app${url}`;

    let orders = [];
    let markup;

    axios
      .get('/admin/orders', {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
      .then((res) => {
        orders = res.data;
        markup = generateMarkup(orders);
        orderTableBody.innerHTML = markup;
      })
      .catch((err) => {
        console.log(err);
      });

    function generateMarkup(orders) { 
      let qrCode = '';

      return orders
        .map((order) => {
          if (order && order._id === orderId) {
            QRCode.toDataURL(data, (err, dataURI) => {
              if (err) throw err;
              qrCode = `<img src="${dataURI}"/>`;
            });

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
                      <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        ${order.name}
                      </dd>
                    </div>
                    <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-gray-500">
                        Items
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <table>
                          <thead>
                            <tr>
                              <th class="bg-gray-50 sticky left-0">Sweet Name</th>
                              <th>Order 1</th>
                <th>Order 2</th>
                <th>Order 3
                </th>
                <th>Order 4</th>
                <th>Order 5</th>
                <th>Order 6</th>
                <th>Order 7</th>
                <th>Order 8</th>
                <th>Order 9</th>
                <th>Order 10</th>
                <th>Order 11</th>
                <th>Order 12</th>
                <th>Order 13</th>
                <th>Order 14</th>
                <th>Order 15</th>
                <th>Order 16</th>
                <th>Order 17</th>
                <th>Order 18</th>
                <th>Order 19</th>
                <th>Order 20</th>
                <th>Order 21</th>
                <th>Order 22</th>
                <th>Order 23</th>
                <th>Order 24</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${renderItems(order.items)}
                          </tbody>
                        </table>
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
            `;
          }
        })
        .join('');
    }

    function renderItems(items) {
      let parsedItems = Object.values(items);
      return parsedItems
        .map((menuItem) => {
          return `
            <tr>
              <td class="bg-gray-50 sticky left-0">${menuItem.pizza.name}</td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity1}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity1"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity2}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"    
                  data-quantity="quantity2"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity3}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"    
                  data-quantity="quantity3"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity4}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity4"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity5}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity5"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity6}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity6"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity7}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity7"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity8}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity8"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity9}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity9"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity10}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity10"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity11}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity11"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity12}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity12"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity13}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity13"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity14}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity14"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity15}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity15"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity16}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity16"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity17}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity17"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity18}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity18"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity19}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity19"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity20}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity20"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity21}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity21"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity22}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity22"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity23}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity23"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="quantity-input"
                  value="${menuItem.quantity24}"
                  data-order-id="${orderId}"
                  data-item-id="${menuItem.pizza._id}"
                  data-quantity="quantity24"
                />
              </td>
            </tr>
          `;
        })
        .join('');
    }

    function updateItemQuantity(orderId, itemId, newQty, quantityType) {
      axios
        .put(`/admin/orders/${orderId}/items/${itemId}`, { [quantityType]: newQty }) // Use dynamic property name based on quantityType
        .then((res) => {
          new Noty({
            type: 'success',
            text: 'Item quantity updated successfully',
            timeout: 1000, // Adjust the timeout as needed
          }).show();
        })
        .catch((err) => {
          console.log('Error updating item quantity:', err);
        });
    }

    orderTableBody.addEventListener('change', function (event) {
      const target = event.target;
      if (target.classList.contains('quantity-input')) {
        console.log(target.dataset.itemId)
        const orderId = target.dataset.orderId;
        const itemId = target.dataset.itemId;
        const newQty = target.value;
        const quantityType = target.dataset.quantity; // Get the quantity type (quantity1, quantity2, etc.)

        console.log(newQty, itemId);

        // Update the appropriate quantity based on quantityType
        updateItemQuantity(orderId, itemId, newQty, quantityType);
      }
    });
  });
}

