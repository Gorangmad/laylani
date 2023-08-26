const homeController = require('../app/http/controllers/homeController')
const menuController = require('../app/http/controllers/menuController')
const authController = require('../app/http/controllers/authController')
const cartController = require('../app/http/controllers/customers/cartController')
const orderController = require('../app/http/controllers/customers/orderController')
const guest = require('../app/http/middleware/guest')
const auth = require('../app/http/middleware/auth')
const admin = require('../app/http/middleware/admin')
const adminOrderController = require('../app/http/controllers/admin/orderController')
const statusController = require('../app/http/controllers/admin/statusController')
const adminController = require('../app/http/controllers/adminController');


function initRoutes(app) {

    app.get('/', menuController().index)

    app.get('/login',guest, authController().login)
    app.post('/login', authController().postLogin)

    app.get('/register',guest,  authController().register)
    app.post('/register', authController().update)

    app.post('/logout', authController().logout)

    app.get('/cart', cartController().index)
    app.post('/update-cart', cartController().update)
    app.post('/remove-cart', cartController().remove)

    //Customer routes

    app.post('/orders',auth, orderController().store)

    app.get('/customer/orders',auth, orderController().index)

    app.get('/customer/orders/:id',auth, orderController().show)

    //Admin routes

    app.get('/admin/orders/',admin , adminOrderController().index)
    app.get('/admin/orders/total',admin , adminOrderController().twodex)
    app.get('/admin/orders/archiv',admin , adminOrderController().threedex)
    app.get('/admin/orders/:id', adminOrderController().show)
    app.post('/admin/order/status',admin , statusController().update)
    app.put('/admin/orders/:orderId/items/:itemId',admin,  adminController().index)

    
}

module.exports = initRoutes