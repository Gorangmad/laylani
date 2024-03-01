import axios from 'axios';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export function initSingleOrder() {
  document.addEventListener('DOMContentLoaded', () => {
    const orderTableBody = document.querySelector('#orderBody');
    const url = window.location.pathname;
    const orderId = url.split('\\').pop().split('/').pop();

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

        // Add event listener for the print button
        const printButton = document.createElement('button');
        printButton.innerText = 'Print Order';
        printButton.style.position = 'absolute';
        printButton.style.top = '325px'; // Adjust the top position as needed
        printButton.style.right = '300px'; // Adjust the right position as needed
        printButton.style.padding = '10px';
        printButton.style.border = '1px solid #ccc';
        printButton.style.borderRadius = '5px';
        printButton.style.cursor = 'pointer';
        printButton.addEventListener('click', () => {
          printOrder();
        });

        // Append the print button to the document body or a specific container
        document.body.appendChild(printButton);
      })
      .catch((err) => {
        console.log(err);
      });

    function generateMarkup(orders) {
      return orders
        .map((order) => {
          if (order._id === orderId) {
            return `
              <div style="margin: 20px; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
                <h2 style="color: #333; margin-bottom: 10px">Order ID: ${order._id}</h2>
                <p style="margin-bottom: 10px;">Name: ${order.name}</p>
                <p style="margin-bottom: 10px;">Total Price: ${order.totalPrice}</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                  <tbody>
                    ${renderItems(order.items)}
                  </tbody>
                </table>
              </div>
            `;
          }
        })
        .join('');
    }

    function renderItems(items) {
      let parsedItems = Object.values(items);
      return `
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bild
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produkt
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Comment
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Größe
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantität
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preis
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${parsedItems.map((menuItem, index) => {
              return `
                <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}">
                  <td class="px-6 py-4 whitespace-nowrap w-8">
                   <img src="/img/${menuItem.item.image}" alt="${menuItem.item.name}" class="h-8 w-8 object-cover ">
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="text-sm font-medium text-gray-900">
                        ${menuItem.item.name}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="text-sm font-medium text-gray-900">
                        ${menuItem.item.comment}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">
                      ${menuItem.item.sizes}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">
                      ${menuItem.qty}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">
                      ${menuItem.item.price}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }

    function printOrder() {
      // Get the order details
      const orderDetails = getOrderDetails();


      // Define the document definition using pdfmake syntax
      const documentDefinition = {
        content: [
          { text: 'Order Details', style: 'header' },
          { text: `Order ID: ${orderDetails._id}`, margin: [0, 5] },
          { text: `Name: ${orderDetails.name}`, margin: [0, 5] },
          { text: `Total Price: ${orderDetails.totalPrice}`, margin: [0, 10] },
          { text: `Email: ${orderDetails.email}`, margin: [0, 10] },
          { text: `Telefonnummer: ${orderDetails.phone}`, margin: [0, 10] },
          { text: 'Items:', style: 'subheader' },
          renderItemsPDF(orderDetails.items),

        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10],
          },
          subheader: {
            fontSize: 16,
            bold: true,
            margin: [0, 5, 0, 5],
          },
        },
      };

      // Generate and open the PDF
      pdfMake.createPdf(documentDefinition).open();
    }

    function renderItemsPDF(items) {
      let parsedItems = Object.values(items);
      const body = parsedItems.map((menuItem, index) =>  [
        menuItem.item.name,
        menuItem.item.comment,
        menuItem.item.sizes,
        menuItem.qty,
        menuItem.item.price,
      ]);
    
      const table = {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Produkt', width: 'auto' },
              'Comment', // Adjust the width as needed
              'Größe',
              'Quantität',
              'Preis',
            ],
            ...body,
          ],
        },
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return rowIndex % 2 === 0 ? '#FFFFFF' : '#F0F0F0';
          },
        },
      };
    
      return table;
    }
    

    function getOrderDetails() {
      // Find the order with the specified orderId
      return orders.find((order) => order._id === orderId) || {};
    }
  });
}
