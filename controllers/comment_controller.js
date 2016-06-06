
var models = require('../models');
var Sequelize = require('sequelize');

// Autoload el comentario asociado a :commentId
exports.load = function(req, res, next, commentId) {
  models.Comment.findById(commentId)
      .then(function(comment) {
          if (comment) {
            req.comment = comment;
            next();
          } else { 
            next(new Error('No existe commentId=' + commentId));
          }
        })
        .catch(function(error) { next(error); });
};

exports.AdminOrOwnerQuizOrOwnerCommentRequired = function(req,res,next){
  
  var isAdmin = req.session.user.isAdmin;
  var quizAuthorId = req.quiz.AuthorId;
  var loggedUserId = req.session.user.id;
  var commentAuthorId = req.comment.AuthorId;

  if(isAdmin || loggedUserId===quizAuthorId || loggedUserId===commentAuthorId){
    next();
  }
  else {
      console.log('Operación prohibida: El usuario logeado no es el autor del quiz, ni un administrador, ni autor del comentario');
      res.send(403);
  }
};
// GET /quizzes/:quizId/comments/new
exports.new = function(req, res, next) {
  var comment = models.Comment.build({text: ""});

  res.render('comments/new', { comment: comment, 
  	                           quiz: req.quiz
  	                         });
};


// POST /quizes/:quizId/comments
exports.create = function(req, res, next) {

 var authorId = req.session.user && req.session.user.id || 0;

  var comment = models.Comment.build(
      { text:   req.body.comment.text,          
        QuizId: req.quiz.id,
        AuthorId: authorId
      });

  comment.save()
    .then(function(comment) {
      req.flash('success', 'Comentario creado con éxito.');
      res.redirect('/quizzes/' + req.quiz.id);
   }) 
	  .catch(Sequelize.ValidationError, function(error) {

      req.flash('error', 'Errores en el formulario:');
      for (var i in error.errors) {
          console.log(error);
          console.log(error.errors[i]);
          console.log(error.errors[i].value);
          req.flash('error', error.errors[i].message);
      };

      res.render('comments/new', { comment: comment,
      	                           quiz:    req.quiz});
    })
    .catch(function(error) {
      req.flash('error', 'Error al crear un Comentario: '+error.message);
		  next(error);
	  });    
};


// GET /quizzes/:quizId/comments/:commentId/accept
exports.accept = function(req, res, next) {

  req.comment.accepted = true;

  req.comment.save(["accepted"])
    .then(function(comment) {
      req.flash('success', 'Comentario aceptado con éxito.');
      res.redirect('/quizzes/'+req.params.quizId);
    })
    .catch(function(error) {
       req.flash('error', 'Error al aceptar un Comentario: '+error.message);
       next(error);
    });
  };

// Delete /quizzes/:quizId/comments/:commentId
exports.destroy = function(req,res,next){
  req.comment.destroy()
  .then(function(){
     req.flash('success', 'Comentario borrado con éxito.');
     res.redirect('/quizzes/'+req.params.quizId);
  })
  .catch(function(error){
      req.flash('error', 'Error al borrar el comentario: '+error.message);
        next(error);
      });
};
