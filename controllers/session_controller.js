
var models = require('../models');
var url = require('url');

var userController = require('./user_controller');

/*
 * Autenticar un usuario: Comprueba si el usuario esta registrado en users
 *
 * Devuelve una Promesa que busca el usuario con el login dado y comprueba su password.
 * Si la autenticacion es correcta, la promesa se satisface devuelve un objeto con el User.
 * Si la autenticacion falla, la promesa se satisface pero devuelve null.
 */
var authenticate = function(login, password) {
    
    return models.User.findOne({where: {username: login}})
        .then(function(user) {
            if (user && user.verifyPassword(password)) {
                return user;
            } else {
                return null;
            }
        });
}; 

// GET /session   -- Formulario de login
exports.new = function(req, res, next) {
	var redir = req.query.redir || url.parse(req.headers.referer || "/").pathname;

	if (redir === '/session' || redir === '/users/new'){ redir= "/"; }
    res.render('session/new', {redir: redir});
};


// POST /session   -- Crear la sesion si usuario se autentica
exports.create = function(req, res, next) {

    var redir = req.body.redir || '/'

    var login     = req.body.login;
    var password  = req.body.password;

    authenticate(login, password)
        .then(function(user) {
            // Crear req.session.user y guardar campos id y username
	        // La sesión se define por la existencia de: req.session.user	
            if (user) {
            	req.session.user = {id:user.id, username:user.username, tiempoSesion:Date.now()};
            	res.redirect(redir);
            } else {
            	res.redirect("/session?redir="+redir); // redirección a la raiz
            }
		})
	 .catch(function(error) {
            req.flash('error', 'Se ha producido un error: ' + error);
            res.redirect("/session");        
    });
};


// DELETE /session   -- Destruir sesion 
exports.destroy = function(req, res, next) {

    delete req.session.user;
    
    res.redirect("/session"); // redirect a login
};