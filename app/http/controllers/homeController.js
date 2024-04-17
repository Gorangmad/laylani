const Menu = require('../../models/menu')
function homeController() {
    return {
        async index(req, res) {


            return res.render('home')

        },

        async impressum(req, res) {
            return res.render('rechtlich/impressum')
        }, 

        async daten(req, res) {
            return res.render('rechtlich/daten')
        }
    }
}

module.exports = homeController