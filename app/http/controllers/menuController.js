const Menu = require('../../models/menu');
const Category = require('../../models/categories'); // Assuming you have a Category model


function homeController() {
    return {
        async index(req, res) {
            try {
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
        
                // Adding a field to check if timestamps exist
                const aggregationPipeline = [
                    {
                        $addFields: {
                            hasTimestamp: {
                                $cond: {
                                    if: { $or: [{ $ifNull: ["$createdAt", false] }] },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    },
                    { $match: query },
                    { $sort: { hasTimestamp: -1, createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ];
        
                // Fetch pizzas with priority on timestamps
                const pizzas = await Menu.aggregate(aggregationPipeline).exec();
        
                // Fetch total number of pizzas for pagination
                const totalPizzas = await Menu.countDocuments(query);
        
                return res.render('menu', { 
                    pizzas, 
                    currentPage: page,
                    totalPages: Math.ceil(totalPizzas / limit),
                    searchQuery: req.query.search || ''
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

        async filterMenu(req, res) {
            try {
                const categoryId = req.query.category;
                const page = parseInt(req.query.page) || 1;
                const limit = 50; // Number of items per page
                const skip = (page - 1) * limit;
        
                // Fetch all products where the category field contains the provided categoryId
                const pizzas = await Menu.find({ category: { $regex: new RegExp('\\b' + categoryId + '\\b') } }).skip(skip).limit(limit).exec();
        
                const totalPizzas = await Menu.countDocuments({ category: { $regex: new RegExp('\\b' + categoryId + '\\b') } });
        
                // Render the 'menu' template with the fetched products
                res.render('menu', {
                    pizzas,
                    currentPage: page,
                    totalPages: Math.ceil(totalPizzas / limit),
                    searchQuery: req.query.search || ''
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
