import axios from 'axios'
import moment from 'moment'
import Noty from 'noty'

export function initUsers(socket) {
    const userTableBody = document.querySelector('#userBody')
    let potentialUsers = []
    let markup

    axios.get('/admin/users', {
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    }).then(res => {
        potentialUsers = res.data
        markup = generateMarkup(potentialUsers)
        userTableBody.innerHTML = markup
    }).catch(err => {
        console.log(err)
    })

    function generateMarkup(users) {
        return users.map(user => {
            return `
                <tr>
                    <td class="border px-4 py-2 text-900">
                        <a class="link" href="/admin/users/${user._id}">${user._id}</a>
                    </td>
                    <td class="border px-4 py-2">
                        ${user.name}
                    </td>
                    <td class="border px-4 py-2">
                        ${user.email}
                    </td>
                    <td class="border px-4 py-2">
                        ${moment(user.createdAt).format('hh:mm A')}
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Socket
    socket.on('userRegistered', (user) => {
        new Noty({
            type: 'success',
            timeout: 1000,
            text: 'New user registered!',
            progressBar: false,
        }).show();
        potentialUsers.unshift(user)
        userTableBody.innerHTML = ''
        userTableBody.innerHTML = generateMarkup(potentialUsers)
    })
}
