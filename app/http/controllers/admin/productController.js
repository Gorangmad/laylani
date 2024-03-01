const Menu = require('../../../models/menu');
const Category = require('../../../models/categories')
const path = require('path');
const moment = require('moment')
const multer = require('multer');


function productController() {
    return {
        async index(req, res) {
            try {
                let query = {}; // Initial query to fetch all products
        
                // Pagination parameters
                const pageSize = 50; // Number of products per page
                const page = req.query.page ? parseInt(req.query.page) : 1; // Current page number, default to 1 if not specified
        
                // Find the total number of products to calculate total pages
                const totalProducts = await Menu.countDocuments();
        
                // Fetch the current page of products after updating the availability
                const updatedProducts = await Menu.find()
                    .skip((page - 1) * pageSize) // Skip the previous pages' products
                    .limit(pageSize); // Limit the number of products to the page size
        
        
                const totalPages = Math.ceil(totalProducts / pageSize); // Calculate total pages

                
                // Render the EJS template and pass the 'products' array and pagination data
                res.render('admin/products', {
                    products: updatedProducts,
                    showNavbar: false,
                    currentPage: page,
                    totalPages: totalPages
                });
            } catch (error) {
                console.error('Error updating availability:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        },

        async updateCategory (req, res) {
            try {
                const { categories } = req.body; // This is the string of 'No' values
                const productId = req.body.currentProductId;
        
                // Assuming 'categories' is a field in your product schema where you want to save the string
                await Menu.findByIdAndUpdate(productId, { category: categories });
        
                res.json({ message: 'Categories updated successfully!' });
            } catch (error) {
                console.error('Failed to save categories:', error);
                res.status(500).send('Error saving categories');
            }
        },

        async product(req, res) {
            try {
                const productId = req.params.id;
                const productDetails = await Menu.findById(productId);
        
                // Split and trim category IDs if they exist
                const categoryIds = productDetails.category ? productDetails.category.split(',').map(id => id.trim()) : [];
        
                // Fetch details for each category
                const categoryPromises = categoryIds.map(id => Category.findOne({ "No": id }));
                const categoryDetails = await Promise.all(categoryPromises);
        
                // Extract and aggregate parent category names
                const productCategoryNames = categoryDetails
                    .filter(details => details != null)
                    .map(details => details.Parent_Category);
        
                // Fetch related menus if they exist
                const relatedMenuPromises = productDetails.relatedMenus ? productDetails.relatedMenus.map(id => Menu.findById(id)) : [];
                const relatedMenus = await Promise.all(relatedMenuPromises);
        
                // Extract names of related menus
                const relatedMenuNames = relatedMenus
                    .filter(menu => menu != null)
                    .map(menu => menu.name);
        
                const categories = await Category.find({});
        
                // Render the template with all necessary data
                res.render('admin/singleProdukt', {
                    product: productDetails,
                    categories: categories,
                    productCategoryName: productCategoryNames, // List of parent category names
                    relatedMenuNames: relatedMenuNames // List of related menu names
                });
            } catch (error) {
                console.error('Error fetching product details:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        },
        

        async deleteProdukt (req, res) {
            try {
                const { currentProductId } = req.params;
                await Menu.findByIdAndRemove(currentProductId);
                res.status(200).send('Product deleted successfully');
            } catch (error) {
                console.error(error);
                res.status(500).send('Error deleting product');
            }
        },
        
        
        async relateProduct (req, res) {
            try {
                const currentProductId = req.params.id;
                const { relatedProductId } = req.body;

        
                // Add the related product ID to the current product's relatedMenus field
                const menu = await Menu.findOneAndUpdate(currentProductId, {
                    $addToSet: { relatedMenus: relatedProductId } // Use $addToSet to avoid duplicates
                });
        
                console.log(menu)

                res.json({ message: 'Product linked successfully' });
            } catch (error) {
                console.error('Error linking products:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        },
        
        
        

        async addProduct(req, res) {
            try {
                
              const { name, comment, price, sizes} = req.body;
              const imagePath = req.file ? req.file.path : null; // Get the path of the uploaded image
          

              const imageName = imagePath.split('\\').pop().split('.')[0];
              const finalImageName = "/"+imageName
              console.log(finalImageName); 
              
              // Create a new product instance
              const newProduct = new Menu({
                name,
                comment,
                price,
                sizes,
                image: finalImageName, // Use the image path saved by Multer
              });
          
              // Save the product to the database
              await newProduct.save();
          
              res.status(201).json({ message: 'Product added successfully', product: newProduct });
            } catch (error) {
              console.error('Failed to add product:', error);
              res.status(500).json({ message: 'Failed to add product', error: error.message });
            }
          },
          

        async productSearch(req, res) {
            try {
                const searchQuery = req.query.name; // Get the search term from the request body
        
        
                const searchResult = await Menu.find({ 
                    name: { $regex: searchQuery, $options: 'i' } // Case-insensitive regex search
                });
        

                const currentPage = 1;
                const itemsPerPage = 30; // Adjust based on your setup
                const totalPages = Math.ceil(searchResult.length / itemsPerPage);
        
                // Render a view with the search results or return JSON
                res.render('admin/products', {
                    products: searchResult,
                    currentPage: currentPage,
                    totalPages: totalPages
                    // Include any other variables your view might expect
                });
            } catch (error) {
                console.error('Search error:', error);
                res.status(500).send('Error performing product search');
            }
        },
        


        async productAdminSearch(req, res) {
            try {
                let searchQuery = {};
        
                if (req.body && req.body.query) {
                    // Assuming 'query' is the field you want to search within your 'Menu' collection
                    // You need to construct your regex search like this
                    searchQuery = {
                        "comment": { 
                            $regex: req.body.query,
                            $options: 'i' // Case-insensitive search
                        }
                    };
                }
        
        
                const products = await Menu.find(searchQuery);
        
                res.status(200).json({ products: products });
            } catch (error) {
                console.error('Error in product search:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        },
        
        
        async productChanger(req, res) {

            
            const { productId, rowIndex, columnIndex, editedValue } = req.body;

            try {
                // Find the product by ID
            const product = await Menu.findById(productId);

            product.name = editedValue.name;
            product.comment = editedValue.comment;
            product.price = editedValue.price; // Assuming price is stored as a string
            product.sizes = editedValue.sizes;


            // Save the updated product
            await product.save();

            res.json({ success: true, message: 'Product updated successfully' });
            } catch (error) {
                console.error('Error updating product:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    };
}

module.exports = productController;
