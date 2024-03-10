const Menu = require('../../models/menu');

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
                    query.name = regex;
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
                // Note: This does not account for the search filter in the count. Adjust if needed.
                const totalPizzas = await Menu.countDocuments();
        
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
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = 50; // Number of items per page
                let categoryValues = [];

                console.log(req.query)
        
                // Collect values from different query parameters
                if (req.query.Kollektion) {
                    categoryValues.push(req.query.Kollektion);
                }
                if (req.query.symbole) {
                    categoryValues.push(req.query.symbole);
                }
                if (req.query.category) {
                    categoryValues.push(req.query.category);
                }
                if (req.query.arten) {
                    categoryValues.push(req.query.arten);
                }
        
                // Construct the query using $in operator for category
                let query = {};
                if (categoryValues.length > 0) {
                    query.category = { $in: categoryValues };
                }
        
                
                let filteredPizzas = await Menu.find(query).skip((page - 1) * limit).limit(limit);
                console.log(filteredPizzas)
                const totalFiltered = await Menu.countDocuments(query);
        
                // Return the filtered pizzas to the frontend
                return res.render('menu', { 
                    pizzas: filteredPizzas,
                    currentPage: page,
                    totalPages: Math.ceil(totalFiltered / limit),
                    searchQuery: req.query.search || ''
                    // other properties you need to pass to the template
                });
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        }
        
        
        
    };
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = homeController;
