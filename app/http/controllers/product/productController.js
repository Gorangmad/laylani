const Menu = require('../../../models/menu');
const path = require('path');

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

                // Render the product information using EJS
                res.render(('product'), { product });
            } catch (error) {
                console.error('Error fetching product:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
        
    };
}

module.exports = productController;
