// GET /question
exports.question = function(req, res, next){
var answer = req.query.answer || '';
res.render('../quizzes/question', {question: '¿Cual es la capital de Italia?', answer : answer});
};

// GET /check
exports.check = function(req, res, next){
var answer = req.query.answer || '';
var result= req.query.answer === 'Roma' ? 'Correcta' : 'Incorrecta';
res.render('../quizzes/result', {result : result, answer : answer});
};
