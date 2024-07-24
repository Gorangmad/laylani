const Menu = require('../../models/menu');
const Category = require('../../models/categories'); // Assuming you have a Category model

function homeController() {
    return {
        // async index(req, res) {
        //     try {
        //         const { sort } = req.query;
        //         console.log(sort)
        //                         let sortOrder;
                
        //                         switch (sort) {
        //                             case 'price-high-to-low':
        //                                 sortOrder = { price: -1 };
        //                                 break;
        //                             case 'price-low-to-high':
        //                                 sortOrder = { price: 1 };
        //                                 break;
        //                             case 'name-a-z':
        //                                 sortOrder = { name: 1 };
        //                                 break;
        //                             case 'name-z-a':
        //                                 sortOrder = { name: -1 };
        //                                 break;
        //                             default:
        //                                 sortOrder =  {   createdAt: -1};
        //                         }
        //         const page = parseInt(req.query.page) || 1;
        //         const limit = 50; // Number of items per page
        //         const skip = (page - 1) * limit;

        //         // Base query for filtering
        //         let query = {};

        //         if (req.query.search) {
        //             const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        //             query = {
        //                 $or: [
        //                     { name: regex },
        //                     { comment: regex }
        //                 ]
        //             };
        //         }

        //         // Adding a field to check if timestamps exist
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
        //             { $match: query },
        //             { $sort: sortOrder  },

        //             { $skip: skip },
        //             { $limit: limit }
        //         ];

        //         // Fetch pizzas with priority on timestamps
        //         const pizzas = await Menu.aggregate(aggregationPipeline).exec();

        //         // Fetch total number of pizzas for pagination
        //         const totalPizzas = await Menu.countDocuments(query);

        //         return res.render('menu', { 
        //             pizzas, 
        //             currentPage: page,
        //             totalPages: Math.ceil(totalPizzas / limit),
        //             searchQuery: req.query.search || '',
        //             category: '' // Add an empty category for the main menu page
        //         });
        //     } catch (error) {
        //         console.error(error);
        //         res.status(500).send('Internal Server Error');
        //     }
        // },
        async index(req, res) {
            try {
                const { sort } = req.query;
                console.log(sort);
        
                let sortOrder;
                switch (sort) {
                    case 'price-high-to-low':
                        sortOrder = { price: -1 };
                        break;
                    case 'price-low-to-high':
                        sortOrder = { price: 1 };
                        break;
                    case 'name-a-z':
                        sortOrder = { name: 1 };
                        break;
                    case 'name-z-a':
                        sortOrder = { name: -1 };
                        break;
                    default:
                        sortOrder = { createdAt: -1 };
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
                    pizza.price = parseFloat(pizza.price);
                });
        
                // Sort the pizzas array based on sortOrder
                pizzas.sort((a, b) => {
                    if (sortOrder.price) {
                        return sortOrder.price * (a.price - b.price);
                    } else if (sortOrder.name) {
                        return sortOrder.name * a.name.localeCompare(b.name);
                    } else {
                        return sortOrder.createdAt * (new Date(a.createdAt) - new Date(b.createdAt));
                    }
                });
        
                // Paginate the sorted results
                const paginatedPizzas = pizzas.slice(skip, skip + limit);
        
                const totalPizzas = pizzas.length;
        
                return res.render('menu', {
                    pizzas: paginatedPizzas,
                    currentPage: page,
                    totalPages: Math.ceil(totalPizzas / limit),
                    searchQuery: req.query.search || '',
                    category: '', // Add an empty category for the main menu page
                    sort
                });
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        },
        
        async filter(req, res) {
            // Route to fetch categories
            try {
                const categories = await Category.find(); // Fetch all categories from the database
                res.json(categories); // Send categories as JSON response
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        },

//         async filterMenu(req, res) {
//             try {
//                 const categoryId = req.query.category;
//                 console.log("IDDDD:",categoryId)
//                 const { sort } = req.query;
// console.log(sort)
//                 let sortOrder;

//                 switch (sort) {
//                     case 'price-high-to-low':
//                         sortOrder = { price: -1 };
//                         break;
//                     case 'price-low-to-high':
//                         sortOrder = { price: 1 };
//                         break;
//                     case 'name-a-z':
//                         sortOrder = { name: 1 };
//                         break;
//                     case 'name-z-a':
//                         sortOrder = { name: -1 };
//                         break;
//                     default:
//                         sortOrder =  {   createdAt: -1};
//                 }
//                 const page = parseInt(req.query.page) || 1;
//                 const limit = 50; // Number of items per page
//                 const skip = (page - 1) * limit;
        
//                 // Fetch all products where the category field contains the provided categoryId
//                 const query = categoryId ? { category: { $regex: new RegExp('\\b' + categoryId + '\\b') } } : {};
//                 const pizzas = await Menu.find(query).sort(sortOrder).skip(skip).limit(limit).exec();
        
//                 const totalPizzas = await Menu.countDocuments(query);
        
//                 // Render the 'menu' template with the fetched products
//                 res.render('categoryMenu', {
//                     pizzas,
//                     currentPage: page,
//                     totalPages: Math.ceil(totalPizzas / limit),
//                     searchQuery: req.query.search || '',
//                     category: categoryId // Pass the category to the template
//                 });
        
//             } catch (error) {
//                 res.status(500).json({ message: error.message });
//             }
//         }

async filterMenu(req, res) {
    try {
        const categoryId = req.query.category;
        console.log("IDDDD:", categoryId);
        const { sort } = req.query;
        console.log(sort);

        let sortOrder;
        switch (sort) {
            case 'price-high-to-low':
                sortOrder = { price: -1 };
                break;
            case 'price-low-to-high':
                sortOrder = { price: 1 };
                break;
            case 'name-a-z':
                sortOrder = { name: 1 };
                break;
            case 'name-z-a':
                sortOrder = { name: -1 };
                break;
            default:
                sortOrder = { createdAt: -1 };
        }

        const page = parseInt(req.query.page) || 1;
        const limit = 50; // Number of items per page
        const skip = (page - 1) * limit;

        // Fetch all products where the category field contains the provided categoryId
        const query = categoryId ? { category: { $regex: new RegExp('\\b' + categoryId + '\\b') } } : {};
        const pizzas = await Menu.find(query).exec();

        // Convert prices to numbers if they are not already
        pizzas.forEach(pizza => {
            pizza.price = parseFloat(pizza.price);
        });

        // Sort the pizzas array based on sortOrder
        pizzas.sort((a, b) => {
            if (sortOrder.price) {
                return sortOrder.price * (a.price - b.price);
            } else if (sortOrder.name) {
                return sortOrder.name * a.name.localeCompare(b.name);
            } else {
                return sortOrder.createdAt * (new Date(a.createdAt) - new Date(b.createdAt));
            }
        });

        // Paginate the sorted results
        const paginatedPizzas = pizzas.slice(skip, skip + limit);

        const totalPizzas = pizzas.length;

        // Render the 'menu' template with the fetched products
        res.render('categoryMenu', {
            pizzas: paginatedPizzas,
            currentPage: page,
            totalPages: Math.ceil(totalPizzas / limit),
            searchQuery: req.query.search || '',
            category: categoryId, // Pass the category to the template
            sort
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

    };
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = homeController;

// function homeController() {
//     return {
//         async index(req, res) {
//             try {
//                 const page = parseInt(req.query.page) || 1;
//                 const limit = 50; // Number of items per page
//                 const skip = (page - 1) * limit;

//                 // Base query for filtering
//                 let query = {};

//                 if (req.query.search) {
//                     const regex = new RegExp(escapeRegex(req.query.search), 'gi');
//                     query = {
//                         $or: [
//                             { name: regex },
//                             { comment: regex }
//                         ]
//                     };
//                 }

//                 // Determine sorting
//                 let sort = { createdAt: -1 }; // Default sorting
//                 if (req.query.sortBy) {
//                     const sortField = req.query.sortBy;
//                     const sortOrder = req.query.order === 'asc' ? 1 : -1;
//                     sort = { [sortField]: sortOrder };
//                 }

//                 // Adding a field to check if timestamps exist
//                 const aggregationPipeline = [
//                     {
//                         $addFields: {
//                             hasTimestamp: {
//                                 $cond: {
//                                     if: { $or: [{ $ifNull: ["$createdAt", false] }] },
//                                     then: true,
//                                     else: false
//                                 }
//                             }
//                         }
//                     },
//                     { $match: query },
//                     { $sort: { hasTimestamp: -1, ...sort } },
//                     { $skip: skip },
//                     { $limit: limit }
//                 ];

//                 // Fetch pizzas with priority on timestamps
//                 const pizzas = await Menu.aggregate(aggregationPipeline).exec();

//                 // Fetch total number of pizzas for pagination
//                 const totalPizzas = await Menu.countDocuments(query);

//                 return res.render('menu', { 
//                     pizzas, 
//                     currentPage: page,
//                     totalPages: Math.ceil(totalPizzas / limit),
//                     searchQuery: req.query.search || '',
//                     category: '', // Add an empty category for the main menu page
//                     sortBy: req.query.sortBy || '',
//                     order: req.query.order || ''
//                 });
//             } catch (error) {
//                 console.error(error);
//                 res.status(500).send('Internal Server Error');
//             }
//         },

//         async filter(req, res) {
//             // Route to fetch categories
//             try {
//                 const categories = await Category.find(); // Fetch all categories from the database
//                 res.json(categories); // Send categories as JSON response
//             } catch (error) {
//                 res.status(500).json({ message: error.message });
//             }
//         },

//         async filterMenu(req, res) {
//             try {
//                 const categoryId = req.query.category;
//                 const page = parseInt(req.query.page) || 1;
//                 const limit = 50; // Number of items per page
//                 const skip = (page - 1) * limit;

//                 // Determine sorting
//                 let sort = { createdAt: -1 }; // Default sorting
//                 if (req.query.sortBy) {
//                     const sortField = req.query.sortBy;
//                     const sortOrder = req.query.order === 'asc' ? 1 : -1;
//                     sort = { [sortField]: sortOrder };
//                 }

//                 // Fetch all products where the category field contains the provided categoryId
//                 const query = categoryId ? { category: { $regex: new RegExp('\\b' + categoryId + '\\b') } } : {};
//                 const pizzas = await Menu.find(query).sort(sort).skip(skip).limit(limit).exec();

//                 const totalPizzas = await Menu.countDocuments(query);

//                 // Render the 'menu' template with the fetched products
//                 res.render('categoryMenu', {
//                     pizzas,
//                     currentPage: page,
//                     totalPages: Math.ceil(totalPizzas / limit),
//                     searchQuery: req.query.search || '',
//                     category: categoryId, // Pass the category to the template
//                     sortBy: req.query.sortBy || '',
//                     order: req.query.order || ''
//                 });

//             } catch (error) {
//                 res.status(500).json({ message: error.message });
//             }
//         }
//     };
// }

// function escapeRegex(text) {
//     return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
// }

// module.exports = homeController;
