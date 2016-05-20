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

// Relaciones entre modelos
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);


exports.Quiz = Quiz; //Exportar definicion de la tabla Quiz
exports.Comment = Comment; // Exportar definición tabla Comments