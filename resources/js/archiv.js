import axios from 'axios'
import moment from 'moment'
import Noty from 'noty'

export function initArchiv() {
    const orderTableBody = document.querySelector('#archivBody')
    let orders = []
    let markup
   
    let now = moment().format('DD/MM/yyyy')

    console.log('hello')
    
    axios.get('/admin/archiv', {
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    }).then(res => {
        orders = res.data
        markup = generateMarkup(orders)
        orderTableBody.innerHTML = markup
    }).catch(err => {
        console.log(err)
    })



    function generateMarkup(orders) {
        return orders.map(order => {
            console.log(order.status)
            if(order.status === 'completed'){
            return `
                <tr>
                <td class="border px-4 py-2 text-900">
                <a class="link" href="/admin/orders/${ order._id }">${order._id}</a>
                </td>
                <td class="border px-4 py-2 text-900">
                <a class="link" href="/admin/orders/${ order._id }">${order.email}</a>
                </td>
                <td class="border px-4 py-2 text-900">
                <a class="link" href="/admin/orders/${ order._id }">${order.totalPrice}€</a>
                </td>
                <td class="border px-4 py-2">
                    <div class="inline-block relative w-64">
                        <form action="/admin/order/status" method="POST">
                            <input type="hidden" name="orderId" value="${ order._id }">
                            <select name="status" onchange="this.form.submit()"
                                class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                <option value="order_placed"
                                    ${ order.status === 'order_placed' ? 'selected' : '' }>
                                    Placed</option>
                                <option value="confirmed" ${ order.status === 'angenommen' ? 'selected' : '' }>
                                    Confirmed</option>
                                <option value="delivered" ${ order.status === 'verschickt' ? 'selected' : '' }>
                                    Delivered
                                </option>
                                <option value="completed" ${ order.status === 'completed' ? 'selected' : '' }>
                                    Completed
                                </option>
                            </select>
                        </form>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20">
                                <path
                                    d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </td>
            <td class="border px-4 py-2">
                ${ moment(order.createdAt).format('DD/MM/yyyy') }
            </td>
            </tr>
        `}
        }).join('')
    }
}

