console.log("Ejecuta quiz_controller.js");
var models = require('../models');
var Sequelize = require('sequelize');
// Autoload el quiz asociado a :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.findById(quizId, { include: [ models.Comment ] })
  		.then(function(quiz) {
      		if (quiz) {
        		req.quiz = quiz;
        		next();
      		} else { 
      			next(new Error('No existe quizId=' + quizId));
      		}
        })
        .catch(function(error) { next(error); });
};

// MW que permite acciones solamente si al usuario logeado es admin o es el autor del quiz.
exports.ownershipRequired = function(req, res, next){

    var isAdmin      = req.session.user.isAdmin;
    var quizAuthorId = req.quiz.AuthorId;
    var loggedUserId = req.session.user.id;

    if (isAdmin || quizAuthorId === loggedUserId) {
        next();
    } else {
      console.log('Operación prohibida: El usuario logeado no es el autor del quiz, ni un administrador.');
      res.send(403);
    }
};


// GET /quizzes
exports.index = function(req, res, next) {
	if(req.query.busqueda){
		var texto_a_buscar = '%' + req.query.busqueda + '%';
		texto_a_buscar = texto_a_buscar.replace(/ /g, "%"); //Reemplaza los espacios en blanco por %
		console.log(texto_a_buscar);
		models.Quiz.findAll({where: ["question like ?", texto_a_buscar]})
		.then(function(quizzes) {
			if(quizzes[0]!== undefined){
				req.flash('success', 'Su búsqueda produjo estos resultados:');
			}
			else{
				req.flash('error', 'No se encontraron coincidencias con su búsqueda');
			}
			
			res.render('quizzes/index.ejs', { quizzes: quizzes});
		})
		.catch(function(error) {
			next(error);
		});
	}
  else if(req.path.split(".")[1]==="json"){
   models.Quiz.findAll()
    .then(function(quizzes) {
      res.json({ quizzes: quizzes});
    })
    .catch(function(error) {
      next(error);
    });
  }

	else {
    console.log("Entra en el Else Final");
    console.log(req.path);
		models.Quiz.findAll()
		.then(function(quizzes) {
			res.render('quizzes/index.ejs', { quizzes: quizzes});
		})
		.catch(function(error) {
			next(error);
		});
	}
};

// GET /quizzes/:id
exports.show = function (req, res, next){
  if(req.path.split(".")[1]==="json"){  
      res.json({ quiz: req.quiz});
    }
  
  else {
  var answer = req.query.answer || '';
  res.render('quizzes/show.ejs', {quiz: req.quiz, answer : answer});
}
};

// GET /quizzes/:id/check
exports.check = function(req, res){
  var answer = req.query.answer || '';
  var result= answer === req.quiz.answer ? 'Correcta' : 'Incorrecta';
  res.render('quizzes/result.ejs', { quiz: req.quiz, result : result, answer : answer});
};

// GET /quizzes/new
exports.new = function(req, res, next) {
  var quiz = models.Quiz.build({question: "", answer: ""});
  res.render('quizzes/new.ejs', {quiz: quiz});
};

// POST /quizzes/create
exports.create = function(req, res, next) {

  var authorId = req.session.user && req.session.user.id || 0;

  var quiz = models.Quiz.build({ question: req.body.quiz.question, 
  	                             answer:   req.body.quiz.answer,
                                 AuthorId: authorId} );

// guarda en DB los campos pregunta y respuesta de quiz
  quiz.save({fields: ["question", "answer", "AuthorId"]})
  	.then(function(quiz) {
  		req.flash('success', 'Quiz creado con éxito.');
    	res.redirect('/quizzes');  // res.redirect: Redirección HTTP a lista de preguntas
    })
    .catch(Sequelize.ValidationError, function(error) {

     req.flash('error', 'Errores en el formulario:');
      for (var i in error.errors) {
          req.flash('error', error.errors[i].value);
     };

      res.render('quizzes/new.ejs', {quiz: quiz});
     })
    .catch(function(error) {
    	req.flash('error', 'Error al crear un Quiz: '+error.message);
		next(error);
	});  
};

// GET /quizzes/:id/edit
exports.edit = function(req, res, next) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizzes/edit.ejs', {quiz: quiz});
};


// PUT /quizzes/:id
exports.update = function(req, res, next) {

  req.quiz.question = req.body.quiz.question;
  req.quiz.answer   = req.body.quiz.answer;

  req.quiz.save({fields: ["question", "answer"]})
    .then(function(quiz) {
	  req.flash('success', 'Quiz editado con éxito.');
      res.redirect('/quizzes'); // Redirección HTTP a lista de preguntas.
    })
    .catch(Sequelize.ValidationError, function(error) {

      req.flash('error', 'Errores en el formulario:');
     for (var i in error.errors) {
          req.flash('error', error.errors[i].value);
      };

     res.render('quizzes/edit.ejs', {quiz: req.quiz});
    })
    .catch(function(error) {
	  req.flash('error', 'Error al editar el Quiz: '+error.message);
      next(error);
    });
};

// DELETE /quizzes/:id
exports.destroy = function(req, res, next) {
  req.quiz.destroy()
    .then( function() {
	  req.flash('success', 'Quiz borrado con éxito.');
      res.redirect('/quizzes');
    })
    .catch(function(error){
	  req.flash('error', 'Error al editar el Quiz: '+error.message);
      next(error);
    });
};