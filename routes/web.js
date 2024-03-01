const homeController = require('../app/http/controllers/homeController')
const menuController = require('../app/http/controllers/menuController')
const authController = require('../app/http/controllers/authController')
const cartController = require('../app/http/controllers/customers/cartController')
const orderController = require('../app/http/controllers/customers/orderController')
const guest = require('../app/http/middleware/guest')
const auth = require('../app/http/middleware/auth')
const admin = require('../app/http/middleware/admin')
const products = require('../app/http/controllers/product/productController')
const adminProductController = require('../app/http/controllers/admin/productController')
const adminOrderController = require('../app/http/controllers/admin/orderController')
const adminUserController = require('../app/http/controllers/admin/userController')
const statusController = require('../app/http/controllers/admin/statusController')
const adminController = require('../app/http/controllers/adminController');
const productController = require('../app/http/controllers/product/productController')
const menu = require('../app/models/menu')
const multer = require('multer');
const path = require("path")

// Configure storage for Multer
const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    const targetPath = path.join('./public/img/real_pictures');
    sysout
    callback(null, targetPath);
  },  
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });


function initRoutes(app) {

    app.get('/', homeController().index)


    //auth routes

    app.get('/login',guest, authController().login)
    app.post('/login', authController().postLogin)

    app.get('/register',guest,  authController().register)
    app.post('/register', authController().update)

    app.post('/logout', authController().logout)

    app.get('/wiederherstellung', authController().wiederherstellung)
    app.post('/wiederherstellen', authController().wiederherstellen)
    app.get('/reset-password', authController().resetpassword)
    app.get('/reset-password', authController().resetpassword)
    app.post('/neuesPasswort', authController().neuesPasswort)


    
    //cart routes

    app.get('/cart', auth, cartController().index)
    app.get('/menu', auth, menuController().index)
    app.get('/menu-filtered', auth, menuController().filter)
    app.post('/update-cart',auth,  cartController().update)
    app.post('/remove-cart',auth, cartController().remove)
    
    //Customer routes

    app.post('/orders',auth, orderController().store)

    app.get('/customer/orders',auth, orderController().index)

    app.get('/customer/orders/:id',auth, orderController().show)

    app.get('/product/:id', products().index)

    //Admin routes

    app.get('/admin', admin, adminUserController().render)
    app.get('/admin/orders/',admin , adminOrderController().index)
    app.get('/admin/delivery',admin , adminOrderController().twodex)
    app.get('/admin/archiv',admin , adminOrderController().threedex)
    app.get('/admin/products', admin, adminProductController().index)
    app.get('/admin/product/:id', admin, adminProductController().product)
    app.post('/admin/update/categories', admin, adminProductController().updateCategory)
    app.post('/admin/products/search/similiar', admin, adminProductController().productAdminSearch)
    app.post('/admin/products/link/:currentProductId', admin, adminProductController().relateProduct)
    app.delete('/admin/products/delete/:currentProductId', admin, adminProductController().deleteProdukt)
    app.get('/admin/products/search', admin, adminProductController().productSearch)
    app.get('/admin/users',admin, adminUserController().getAllUsers)
    app.get('/user-search',admin,  adminUserController().search)
    app.get('/admin/orders/:id', admin, adminOrderController().show)
    app.put('/admin/orders/:orderId/items/:itemId',admin,  adminController().index)

    //Admin changer routes 

    app.post('/admin/order/status',admin , statusController().update)
    app.post('/change-user-status',admin,  adminUserController().changeUserStatus) 
    app.post('/change-product', admin, adminProductController().productChanger )
    app.post('/admin/products/add', upload.single('image'),admin,  adminProductController().addProduct)


    setInterval(() => {
        app.post('/change-availability', admin, adminProductController().index);
      }, 30 * 1000);
      

    
}

module.exports = initRoutes