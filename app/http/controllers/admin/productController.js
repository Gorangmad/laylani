const Menu = require('../../../models/menu');
const Category = require('../../../models/categories');
const path = require('path');
const moment = require('moment');
const multer = require('multer');
const ChangeLog = require("../../../models/change");



function productController() {
    return {
       
        
        // async index(req, res) {
        //     try {
        //         let query = {}; // Initial query to fetch all products
        //         const { sort } = req.query;
        //         // console.log(sort);
        
        //         // let sortOrder;
        //         // switch (sort) {
        //         //     case 'price-high-to-low':
        //         //         sortOrder = { price: -1 };
        //         //         break;
        //         //     case 'price-low-to-high':
        //         //         sortOrder = { price: 1 };
        //         //         break;
        //         //     case 'name-a-z':
        //         //         sortOrder = { name: 1 };
        //         //         break;
        //         //     case 'name-z-a':
        //         //         sortOrder = { name: -1 };
        //         //         break;
        //         //     default:
        //         //         sortOrder = { hasTimestamp: -1,createdAt: -1 };
        //         // }
        
        
        //         // Pagination parameters
        //         const pageSize = 50; // Number of products per page
        //         const page = req.query.page ? parseInt(req.query.page) : 1; // Current page number, default to 1 if not specified
        
        //         // Find the total number of products to calculate total pages
        //         const totalProducts = await Menu.countDocuments(query);
        
        //         // Aggregation pipeline to sort products with timestamps first
        //         const aggregationPipeline = [
        //             {
        //                 $addFields: {
        //                     hasTimestamp: {
        //                         $cond: {
        //                             if: { $or: [{ $ifNull: ["$createdAt", false] }] },
        //                             then: true,
        //                             else: false
        //                         }
        //                     }
        //                 }
        //             },
        //             // { $sort: { hasTimestamp: -1, createdAt: -1 } }, // Sorting by hasTimestamp then by createdAt and updatedAt
        //             { $sort:  { hasTimestamp: -1,createdAt: -1 } },
        //             { $skip: (page - 1) * pageSize },
        //             { $limit: pageSize }
        //         ];
        
        //         // Execute the aggregation pipeline
        //         const updatedProducts = await Menu.aggregate(aggregationPipeline).exec();
        
        //         const totalPages = Math.ceil(totalProducts / pageSize); // Calculate total pages
        
        //         // Render the EJS template and pass the 'products' array and pagination data
        //         res.render('admin/products', {
        //             products: updatedProducts,
        //             showNavbar: false,
        //             currentPage: page,
        //             totalPages: totalPages,
        //             sort
        //         });
        //     } catch (error) {
        //         console.error('Error updating availability:', error);
        //         res.status(500).json({ error: 'Internal Server Error' });
        //     }
        // }
        async index(req, res) {
            try {
                const { sort } = req.query;
                console.log(sort);
        
                let sortOrder;
                switch (sort) {
                    case 'price-high-to-low':
                        sortOrder = 'desc';
                        break;
                    case 'price-low-to-high':
                        sortOrder = 'asc';
                        break;
                    case 'name-a-z':
                        sortOrder = 'name-asc';
                        break;
                    case 'name-z-a':
                        sortOrder = 'name-desc';
                        break;
                    default:
                        sortOrder = 'createdAt-desc';
                }
        
                const page = parseInt(req.query.page) || 1;
                const limit = 50; // Number of items per page
                const skip = (page - 1) * limit;
        
                // Base query for filtering
                let query = {};
        
                if (req.query.search) {
                    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
                    query = {
                        $or: [
                            { name: regex },
                            { comment: regex }
                        ]
                    };
                }
        
                // Fetch data without sorting
                const pizzas = await Menu.find(query).exec();
        
                // Convert prices to numbers if they are not already
                pizzas.forEach(pizza => {
                    // Handle cases where the price might be in different formats
                    if (typeof pizza.price === 'string') {
                        // Remove non-numeric characters except for the decimal point
                        pizza.price = parseFloat(pizza.price.replace(/[^0-9.]/g, ''));
                    } else {
                        pizza.price = parseFloat(pizza.price);
                    }
                });
        
                // Sort the pizzas array based on sortOrder
                pizzas.sort((a, b) => {
                    if (sortOrder === 'desc' || sortOrder === 'asc') {
                        if (sortOrder === 'desc') {
                            return b.price - a.price; // price-high-to-low
                        } else {
                            return a.price - b.price; // price-low-to-high
                        }
                    } else if (sortOrder === 'name-asc' || sortOrder === 'name-desc') {
                        if (sortOrder === 'name-asc') {
                            return a.name.localeCompare(b.name); // name-a-z
                        } else {
                            return b.name.localeCompare(a.name); // name-z-a
                        }
                    } else if (sortOrder === 'createdAt-desc' || sortOrder === 'createdAt-asc') {
                        if (sortOrder === 'createdAt-desc') {
                            return new Date(b.createdAt) - new Date(a.createdAt); // createdAt-desc
                        } else {
                            return new Date(a.createdAt) - new Date(b.createdAt); // createdAt-asc
                        }
                    }
                });
        
                // Paginate the sorted results
                const paginatedPizzas = pizzas.slice(skip, skip + limit);
        
                const totalPizzas = pizzas.length;
        
                return res.render('admin/products', {
                    products: paginatedPizzas,
                    showNavbar: false,
                    currentPage: page,
                    totalPages: Math.ceil(totalPizzas / limit),
                    searchQuery: req.query.search || '',
                    sort
                });
            } catch (error) {
                console.error('Error updating availability:', error);
                res.status(500).send('Internal Server Error');
            }
        }
        
        ,
        async categories(req, res) {
            try {
                const categories = await Category.find({});
                res.render('admin/categories', { categories: categories });
            } catch (error) {
                console.error('Error fetching categories:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        },
        
        async deleteCategories(req, res) {
            try {
                const categoryId = req.body.userId;
        
                // Check if categoryId is provided
                if (!categoryId) {
                    return res.status(400).json({ error: 'Category ID is required' });
                }
        
                // Find and delete the category by ID
                const deletedCategory = await Category.findByIdAndDelete(categoryId);
        
                // Check if the category was found and deleted
                if (!deletedCategory) {
                    return res.status(404).json({ error: 'Category not found' });
                }
        
                res.json({ message: 'Category deleted successfully', deletedCategory });
        
            } catch (error) {
                console.error('Error deleting category:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        },

        async AddCategories(req, res) {
            try {
                const { categoryName, subcategories } = req.body;
                
                // Ensure subcategories is always an array of objects
                let subcategoriesArray = [];
                if (typeof subcategories === 'string') {
                    // Split the comma-separated string and map each value to an object
                    subcategoriesArray = subcategories.split(',').map((subcat, index) => ({
                        name: subcat.trim(),
                        Visibility: "true",  // Default value for visibility, modify as needed
                        No: "",              // To be assigned later
                        Global_Rank: ""      // To be assigned later
                    }));
                } else if (Array.isArray(subcategories)) {
                    subcategoriesArray = subcategories;
                } else {
                    subcategoriesArray = [subcategories];
                }
        
        
                // Get all global ranks
                const allCategories = await Category.find({});
                const globalRanks = await Category.distinct('Global_Rank');
                const globalNos = allCategories.flatMap(category => [category.No, ...category.subcategories.map(subcat => subcat.No)]);
                
                // Sort the globalRanks and globalNos arrays in ascending order
                globalRanks.sort((a, b) => a - b);
                globalNos.sort((a, b) => a - b);
        
                // Determine the next No value
                const lastGlobalRank = globalRanks.length > 0 ? parseInt(globalRanks[globalRanks.length - 1]) : 0;
                const lastGlobalNo = globalNos.length > 0 ? parseInt(globalNos[globalNos.length - 1]) : 0;
                const nextNo = (lastGlobalNo + 1).toString();
                const nextRank = (lastGlobalRank + 1).toString();
        

                // Create the new category object
                const newCategory = new Category({
                    No: nextNo,
                    Parent_Category: categoryName,
                    Global_Rank: nextRank,
                    subcategories: subcategoriesArray.map((subcat, index) => ({
                        ...subcat,
                        No: (lastGlobalNo + 1 + index + 1).toString(), // Incremental No for each subcategory
                        Global_Rank: `${nextRank}.${index + 1}` // Global_Rank in the format Global_Rank.1, Global_Rank.2, etc.
                    }))
                });
        
                // Save the new category to the database
                await newCategory.save();
        
                res.json({ message: 'Category added successfully'});
        
            } catch (error) {
                console.error('Error adding category:', error);
                res.json({ error: 'Internal Server Error' });
            }
        },
        
        
        async changeTracker(req, res) {
            const totalLogs = await ChangeLog.find();
            res.render('admin/changeLog', { totalLogs: totalLogs , showNavbar:false});
        },

        async updateCategory(req, res) {
            try {
                const { categories } = req.body; // This is the string of 'No' values
                const productId = req.body.currentProductId;
        
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

                const productCategoryNames = categoryDetails
                  .filter(details => details != null)
                  .flatMap(details => {
                    const names = [];
                    // Check if the category itself is selected
                    if (categoryIds.includes(details.No)) {
                      names.push(details.Parent_Category);
                    }
                    // Now, check subcategories
                    details.subcategories.forEach(sub => {
                      if (categoryIds.includes(sub.No)) {
                        names.push(sub.name);
                      }
                    });
                    return names;
                  });
        
                // Fetch related menus if they exist
                const relatedMenuPromises = productDetails.relatedMenus ? productDetails.relatedMenus.map(id => Menu.findById(id)) : [];
                const relatedMenus = await Promise.all(relatedMenuPromises);
        
                // Extract names of related menus
                const relatedMenuNames = relatedMenus
                    .filter(menu => menu != null)
                    .map(menu => menu);
        
                const categories = await Category.find({});
        
                // Render the template with all necessary data
                res.render('admin/singleProdukt', {
                    showNavbar:false,
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
        
        async deleteProdukt(req, res) {
            try {
                const { currentProductId } = req.params;
                await Menu.findByIdAndRemove(currentProductId);
                res.status(200).send('Product deleted successfully');
            } catch (error) {
                console.error(error);
                res.status(500).send('Error deleting product');
            }
        },
        
        async relateProduct(req, res) {
            try {
                const currentProductId = req.params.currentProductId;
                const { relatedProductId } = req.body;

               // Add the related product ID to the current product's relatedMenus field
                await Menu.findOneAndUpdate({ _id: currentProductId }, {
                   $addToSet: { relatedMenus: relatedProductId } // Use $addToSet to avoid duplicates
                });
                 
                await Menu.findOneAndUpdate({ _id: relatedProductId }, {
                   $addToSet: { relatedMenus: currentProductId } // Use $addToSet to avoid duplicates
                });

                res.json({ message: 'Product linked successfully' });
            } catch (error) {
                console.error('Error linking products:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        },
        
        async addProduct(req, res) {
            try {
                const { name, comment, price, sizes } = req.body;
        
                let finalNames = req.files.map(file => {
                    // Process each file to obtain the desired final name
                    const originalNameWithoutExtension = file.originalname.split('.').slice(0, -1).join('.');
                    return "/" + originalNameWithoutExtension; // You might want to store the full path or URL
                });
        
                // Add "0," at the start of prices
                const processedPrice = price.split(',').map(p => p.trim());
                const updatedPrice = ["0", ...processedPrice].join(',');
        
                // Create a new product instance
                const newProduct = new Menu({
                    name,
                    comment,
                    price: updatedPrice,
                    sizes,
                    image: finalNames,
                });
        
                // Save the new product to the database
                await newProduct.save();
        
                res.status(201).json({ message: 'Product added successfully', product: newProduct });
            } catch (error) {
                console.error('Failed to add product:', error);
                res.status(500).json({ message: 'Failed to add product', error: error.message });
            }
        },
        
        async addProductImage(req, res) {
            try {
                const { productId } = req.body; // Assuming you have the product ID in the request body
        
                let finalNames = req.files.map(file => {
                    // Process each file to obtain the desired final name
                    const originalNameWithoutExtension = file.originalname.split('.').slice(0, -1).join('.');
                    return "/" + originalNameWithoutExtension; // You might want to store the full path or URL
                });
        
                // Find the product by ID
                const product = await Menu.findById(productId);
        
                if (!product) {
                    return res.status(404).json({ message: 'Product not found' });
                }
        
                // Concatenate the existing image array with the new image names
                product.image = product.image.concat(finalNames);
        
                // Save the updated product
                await product.save();
        
                res.status(200).json({ message: 'Product image added successfully', product });
            } catch (error) {
                console.error('Failed to add product image:', error);
                res.status(500).json({ message: 'Failed to add product image', error: error.message });
            }
        },

        async productSearch(req, res) {
            try {
                const searchQuery = req.query.name; // Get the search term from the request body
        
                const searchResult = await Menu.find({ 
                    $or: [
                        { name: { $regex: searchQuery, $options: 'i' } }, // Search for name
                        { comment: { $regex: searchQuery, $options: 'i' } } // Search for comment
                    ]
                });

                const currentPage = 1;
                const itemsPerPage = 30; // Adjust based on your setup
                const totalPages = Math.ceil(searchResult.length / itemsPerPage);
        
                // Render a view with the search results or return JSON
                res.render('admin/products', {
                    products: searchResult,
                    currentPage: currentPage,
                    totalPages: totalPages,
                    showNavbar:false,
                    searchQuery
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
                    const searchRegex = new RegExp(req.body.query, 'i'); // Creating a case-insensitive regex
        
                    // Constructing the search query for both 'name' and 'comment' fields
                    searchQuery = {
                        $or: [
                            { name: { $regex: searchRegex } }, // Search for name
                            { comment: { $regex: searchRegex } } // Search for comment
                        ]
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

                // Check if availability is provided and is one of the enum values
                if (editedValue.availability && ['AVAILABLE', 'SOLDOUT', 'NEW', 'BACK IN', 'WSL', 'HIDDEN'].includes(editedValue.availability)) {
                    product.availability = editedValue.availability;
                } else {
                    // If the value is not valid, you can set a default value or handle the error
                    product.availability = 'AVAILABLE'; // Or handle the error accordingly
                }

                // Save the updated product
                await product.save();

                res.json({ success: true, message: 'Product updated successfully' });
            } catch (error) {
                console.error('Error updating product:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        },

        async availabilityChanger(req, res) {
            const { productId, rowIndex, columnIndex, availability } = req.body;
            
            const product = await Menu.findById(productId);

            // Check if availability is provided and is one of the enum values
            if (availability && ['AVAILABLE', 'SOLDOUT', 'NEW', 'BACK IN', 'WSL', 'HIDDEN'].includes(availability)) {
                product.availability = availability;
            } else {
                // If the value is not valid, you can set a default value or handle the error
                product.availability = 'AVAILABLE'; // Or handle the error accordingly
            }

            await product.save();
        },

        async checkProduct(req, res) {
            const { productId, isChecked } = req.body;

            Menu.findByIdAndUpdate(productId, { isChecked: isChecked }, { new: true })
                .then(updatedProduct => {
                    res.status(200).json(updatedProduct);
                })
                .catch(error => {
                    console.error('Error updating product:', error);
                    res.status(500).json({ error: 'Failed to update product' });
                });
        },

        async deleteSimilarProduct(req, res) {
            try {
                const currentProductId = req.body.currentProductId;
                const productId = req.body.productId;
        
                // Find the current product by ID
                const currentProduct = await Menu.findById(currentProductId);
        
                // Check if the current product exists
                if (!currentProduct) {
                    return res.status(404).json({ error: 'Current product not found' });
                }
        
                // Check if productId exists in the relatedMenus array
                const index = currentProduct.relatedMenus.indexOf(productId);
                if (index !== -1) {
                    // If productId exists, remove it from the relatedMenus array
                    currentProduct.relatedMenus.splice(index, 1);
                    // Save the updated document
                    await currentProduct.save();
                    // Send success response
                    return res.status(200).json({ message: 'Product removed from relatedMenus' });
                } else {
                    // If productId doesn't exist in relatedMenus, send appropriate response
                    return res.status(404).json({ error: 'Product not found in relatedMenus' });
                }
            } catch (error) {
                // Handle any errors
                console.error('Error deleting similar product:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }        
    };
}

module.exports = productController;
