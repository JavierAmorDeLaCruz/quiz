
var models = require('../models');

// GET /users/25/favourites
exports.index = function(req, res, next) {

    req.user.getFavourites({include: [ models.Attachment, {model: models.User, as:'Author', attributes: ['username']} ]})
        .then(function(favourites) {

            favourites.forEach(function(favourite) {
                favourite.favourite = true;
            });

            res.render('favourites/index', {
                quizzes: favourites
            });
        })
        .catch(function(error) {
            next(error);
        });
};



// PUT /users/25/favourites/44
exports.add = function(req, res, next) {

    var redir = req.body.redir || '/users/' + req.user.id + '/favourites';

    req.user.addFavourite(req.quiz)
        .then(function() {
            res.redirect(redir);
        })
        .catch(function(error) {
            next(error);
        });
};


// DELETE /users/25/favourites/44
exports.del = function(req, res, next) {

    var redir = req.body.redir || '/users/' + req.user.id + '/favourites';

    req.user.removeFavourite(req.quiz)
        .then(function() {
            res.redirect(redir);
        })
        .catch(function(error) {
            next(error);
        });
};