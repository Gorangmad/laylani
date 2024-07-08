const Menu = require('../../../models/menu');
const mongoose = require('mongoose');

function productController() {
    return {
        async index(req, res) {
            const currentPageLink = req.originalUrl;
            const productId = currentPageLink.split('/').pop();

            try {
                const product = await Menu.findById(productId);

                if (!product) {
                    return res.status(404).json({ error: 'Product not found' });
                }

                // Extract related menu IDs as strings
                const relatedIds = product.relatedMenus.map(menu => menu._id.toString());


                const relatedMenus = [];
                for (const id of relatedIds) {
                    const relatedMenu = await Menu.findById(id);
                    if (relatedMenu) {
                        relatedMenus.push(relatedMenu);
                    }
                }


                // Render the product information using EJS and pass related menus
                res.render('product', { product, relatedMenus });
            } catch (error) {
                console.error('Error fetching product:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    };
}

module.exports = productController;
