import axios from 'axios'
import moment from 'moment'

export function initTotal() {
    const orderTableBody = document.querySelector('#orderTotal')
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

       
    let now = moment().format('DD/MM/yyyy')



    function generateMarkup(orders) {
            let Sum = 0
            for(var i = 0; i < orders.length; i++){ 
                if(moment(orders[i].createdAt).format('DD/MM/yyyy') === now){
                 if(orders[i].paymentStatus === true){
                     Sum += Number(orders[i].totalPrice)
                 }
             }
             }

             let Mus = 0
             for(var e = 0; e < orders.length; e++){
                if(moment(orders[e].createdAt).format('DD/MM/yyyy') === now){
                if(orders[e].paymentStatus === false){
                    Mus += Number(orders[e].totalPrice)
                }
             }
             }

             return `
             <td class="border px-4 py-2">${ Sum }</td>
             <td class="border px-4 py-2">${ Mus }</td>
             `
    }


}
