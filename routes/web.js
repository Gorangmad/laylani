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
const path = require("path")
const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");

// Configure the S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  region: "fra1", 
  credentials: {
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET_KEY,
  },
  endpoint: "https://fra1.digitaloceanspaces.com", 
});


const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: "bahl",
    acl: "public-read",
    key: function (request, file, cb) {
      // Extract the filename without its extension
      const filenameWithoutExtension = file.originalname.split('.').slice(0, -1).join('.');
      const newFilename = `${filenameWithoutExtension}.jpg`;
      cb(null, newFilename);
    },
  }),
});





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
    app.get('/set-password', authController().setPasswortScreen)
    app.post('/passwortSetzen', authController().setPasswort)


    
    //cart routes

    // app.get('/', homeController().index);
     

    app.get('/cart', auth, cartController().index)
    app.get('/menu', auth, menuController().index)
    app.get('/products', auth, menuController().filterMenu);
    app.get('/categories', auth, menuController().filter)
    app.post('/update-cart',auth,  cartController().update)
    app.post('/remove-cart',auth, cartController().remove)
    app.get("/success",auth, cartController().success)
    
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
    
    app.get('/admin/categories', admin, adminProductController().categories)
  
    app.post('/delete-categorie', admin, adminProductController().deleteCategories)
    app.post('/admin/add-categories', admin, adminProductController().AddCategories)
    app.get('/admin/product/:id', admin, adminProductController().product)
    app.post('/admin/update/categories', admin, adminProductController().updateCategory)
    app.post('/admin/products/search/similiar', admin, adminProductController().productAdminSearch)
    app.post('/admin/products/link/:currentProductId', admin, adminProductController().relateProduct)
    app.post('/admin/products/update-checked', admin, adminProductController().checkProduct)

    app.delete('/admin/products/delete/:currentProductId', admin, adminProductController().deleteProdukt)
    app.delete('/admin/products/:productId/delete', admin, adminProductController().deleteSimilarProduct)

    app.get('/admin/products/search', admin, adminProductController().productSearch)
    app.get('/admin/changes', admin, adminProductController().changeTracker)

    app.get('/admin/users',admin, adminUserController().getAllUsers)
    app.get('/admin/users-asked',admin, adminUserController().getAllUsersAsked)
    app.get('/user-search',admin,  adminUserController().search)
    app.get('/admin/orders/:id', admin, adminOrderController().show)
    app.put('/admin/orders/:orderId/items/:itemId',admin,  adminController().index)
    app.get('/user-detail/:id',admin, adminUserController().getOneUser)
    app.post('/update-user/:id', admin, adminUserController().updateOneUser)
    app.post('/delete-user', admin, adminUserController().deleteUser)
  

    //Admin changer routes 

    app.post('/admin/order/status',admin , statusController().update)
    app.post('/change-user-status',admin,  adminUserController().changeUserStatus) 
    app.post('/change-product', admin, adminProductController().productChanger )
    app.post('/change-availability', admin, adminProductController().availabilityChanger )
    app.post('/admin/products/add', upload.array('images', 5),admin,  adminProductController().addProduct)
    app.post('/admin/products/imageReupload', upload.array('images', 5),admin, adminProductController().addProductImage)

    //rechtlich

    app.get('/impressum', homeController().impressum)
    app.get('/datenschutzerklaerung', homeController().daten)

    setInterval(() => {
        app.post('/change-availability', admin, adminProductController().index);
      }, 30 * 1000);
      

    
}

module.exports = initRoutes