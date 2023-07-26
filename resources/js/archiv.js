import axios from 'axios'
import moment from 'moment'

export function initArchiv() {
    const orderTableBody = document.querySelector('#archivBody')
    let orders = []
    let markup



    axios.get('/admin/orders', {
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
            return `
                <tr>
                <td class="border px-4 py-2 text-green-900">
                <a class="link" href="/admin/orders/${ order._id }">${order._id}</a>
                </td>
                <td class="border px-4 py-2">${ order.address }</td>
                <td class="border px-4 py-2">${ order.totalPrice }</td>
                <td class="border px-4 py-2">
                    ${ moment(order.createdAt).format('DD/MM/yyyy') }
                </td>
                <td class="border px-4 py-2">
                    ${ order.paymentStatus ? 'paid' : 'Not paid' }
                </td>
            </tr>
        `
        }).join('')
    }
}
