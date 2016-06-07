console.log("ejecuta index.js --models");
var path = require('path');

//Cargar modelo ORM
var Sequelize = require('sequelize');

//Usar BBDD SQLite:
// DATABASE_URL = sqlite:///
// DATABASE_STORAGE = quiz.sqlite
// Usar BBDD Postgres:
// DATABASE_URL = postgres:://user:passwd@host:port/database
var url, storage
if (!process.env.DATABASE_URL){
	url = "sqlite:///";
	storage = "quiz.sqlite";
}
else{
	url = process.env.DATABASE_URL;
	storage = process.env.DATABASE_STORAGE || "";
}
var sequelize = new Sequelize(url,
	{ storage: storage,
		omitNull:true
}
);
// Importar la definicion de la tabla Quiz de quiz.js
var Quiz = sequelize.import(path.join(__dirname,'quiz'));

// Importar la definicion de la tabla Comments de comment.js
var Comment = sequelize.import(path.join(__dirname,'comment'));

// Importar la definicion de la tabla Users de user.js
var User = sequelize.import(path.join(__dirname,'user'));

// Importar la definicion de la tabla Attachment de attachment.js
var Attachment = sequelize.import(path.join(__dirname,'attachment'));

// Relaciones entre modelos
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

// Relacion 1 a N entre User y Quiz:
User.hasMany(Quiz, {foreignKey: 'AuthorId'});
Quiz.belongsTo(User, {as: 'Author', foreignKey: 'AuthorId'});

// Relacion 1 a N entre Comments y User:
User.hasMany(Comment, {foreignKey: 'AuthorId'});
Comment.belongsTo(User, {as: 'Author', foreignKey: 'AuthorId'});

// Relacion 1-1 entre Quiz y Attachment
Attachment.belongsTo(Quiz);
Quiz.hasOne(Attachment);

// Favoritos:
//   Un Usuario tiene muchos quizzes favoritos.
//   Un quiz tiene muchos fans (los usuarios que lo han marcado como favorito)
User.belongsToMany(Quiz, {as: 'Favourites', 
                          through: 'Favourites'});
Quiz.belongsToMany(User, {as: 'Fans',
                          through: 'Favourites'}); 

exports.Quiz = Quiz; //Exportar definicion de la tabla Quiz
exports.Comment = Comment; // Exportar definición tabla Comments
exports.User = User;       // exportar definición de tabla Users
exports.Attachment = Attachment;       // exportar definición de tabla Users