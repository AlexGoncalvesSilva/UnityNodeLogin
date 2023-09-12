const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const validator = require('validator');
const { status } = require('express/lib/response');
const e = require('express');

//#region ############ CONFIG ############
var port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({extended : false}));

app.use(bodyParser.json());

var connection = mysql.createConnection({

    host: 'db4free.net',
    user: 'braintest',
    password: 'braintest',
    database: 'braintest',
    port: 3306,

});

connection.connect(function (err) {
    if(err){
        console.log('error connecting ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});

//#endregion

//#region ############ GET ############
//Raiz
app.get('/', function (req, res){
    console.log('Passando no: Entrando no GET/ ');
    res.send('Welcome!');
});

//Login
app.get('/login/:email/:password', function (req, res){

    console.log('Passando no: Entrando no GET/LOGIN ');

    var erro = false;

    var msg_res = {};
    msg_res.status = 200;
    msg_res.message = "";

    var login_temp = {};
    login_temp.email = req.params.email;
    login_temp.password = req.params.password;

    var status_code = 200;
    var msg_text = '';

    console.log(login_temp);

    if(!validator.isEmail(login_temp.email)){
        console.log('Passsando no: Login > Validação de formato de email ');
        status_code = 400;
        msg_text = 'Email em formato inválido!';
        erro = true;
    }

    if(erro == false){
        //consulta no banco de dados 
        //SELECT
                  
        login_select(login_temp).then((results) => {

            console.log('Passando no: Login > login_select.Then() ');

            //Caso não retrorne com dados compatíveis com email e senha

            if(results.length === 0){
                console.log('Passando no: Login > login_select.Then() > Verifica resultado = 0');
                status_code = 400;
                msg_text = 'Login ou Senha incorreto, verifique os dados!';
            }
            //Caso ocorra de conseguir fazer mais de um registro com os mesmos dados
            if(results.length > 1){
                console.log('Passando no: Login > login_select.Then() > Verifica resultado > 0');
                status_code = 400;
                msg_text = 'Há um problema nos dados de loguin, verifique os dados!';
            }
            //Carregando o objeto de resposta
            msg_res.status = status_code;
            msg_res.message = msg_text;

            //Retorno da mensagem com o status
            console.log(msg_res.status);
            res.status(msg_res.status).json(msg_res);

        }).catch((err) => {
            
            console.log('Passando no: Login > login_select.Catch() ');
            console.error('Erro no login_select:', err);
        
            //Retorno da mensagem com o status
            res.status(500).json({ status: 500, message: 'Erro interno do servidor' });
        });
    }else{
        msg_res.status = status_code;
        msg_res.message = msg_text;

        res.status(msg_res.status_code).json(msg_res);
    }

});


//#endregion

//#region ############ POST ############
app.post('/register', function (req, res){

    console.log('Passando no: Entrando no POST/REGISTER ');

    var erro = false;

    var msg_res = {};
    msg_res.status = 200;
    msg_res.message = "";

    var register_temp = {};
    register_temp = req.body;

    var status_code = 200;
    var msg_text = '';

    console.log(register_temp);
    
    if(!validator.isEmail(register_temp.email)){
    console.log('Passsando no: Login > Validação de formato de email ');
    status_code = 400;
    msg_text = 'Email em formato inválido!';
    erro = true;
    }

    if(erro == false){
        //consulta no banco de dados
        register_select(register_temp).then((result) => {
            //Verifica se existe email cadastrado
            if(result.length > 0) {
                console.log('Passando no: Register > register_select.Then() > Verfica o resultado > 0');
                status_code = 400;
                msg_text = 'Já existe um cadastro para esse email';

                msg_res.status = status_code;
                msg_res.message = msg_text;

                //Retorno da mensagem
                res.status(msg_res.status).json(msg_res);

            }else{
                //Se não existir, faz a inclusão
                register_insert(register_temp).then((result2) => {

                console.log('Passando no: Registger > register_insert.Then() ');

                msg_res.status = status_code;
                msg_res.message = msg_text;

                //Retorno da mensagem
                res.status(msg_res.status).json(msg_res);

                }).catch((err2) => {
                    console.log('Passando no: Register > register_insert.Catch() ');

                    msg_res.status = err2.status_code;
                    msg_res.message = err2.msg_text;
    
                    console.log('Register INSERT - catch - Erro: ' + msg_res.message);

                    //Retorno da mensagem
                    res.status(msg_res.status).json(msg_res);
                });
            }

        }).catch((err) => {
            console.log('Passando no: Register > register_select.Catch() ');

            if(err.status_code){
                msg_res.status = err.status_code;
                msg_res.message = err.msg_text;
            }else{
                msg_res.status = 500;
                msg_res.message = '--->>> Register - register_select - Catch = Erro no Then disparou a Catch...';
            }

            console.log('Register Select - catch - Erro: ' + msg_res.message);

            //Retorno da mensagem com o status e mensagem
            res.status(msg_res.status).json(msg_res);
        }); 



    }else{
        msg_res.status = status_code;
        msg_res.message = msg_text;

        res.status(msg_res.status).json(msg_res);
    }

});

//#endregion

//#region ############ FUNCTIONS ############

//LOGIN
function login_select(login_temp){
    console.log('ponto 1');
    return new Promise((resolve, reject) => {
        console.log('ponto 2'); 
        console.log('**********************' + login_temp.email + '.');
        console.log(login_temp.password  + '.');
        connection.query(`SELECT * FROM login WHERE email = '${login_temp.email}' AND password = '${login_temp.password}' `, function (err, results, field) {
            console.log('ponto 3'); 
            console.log(results);
            var obj_err = {};
            obj_err.msg_text = '--->>> login_select - Não entrou no erro ainda...';

            if(err){
                console.log('ponto 4'); 
                console.log('Erro: login_select dentro da PROMISE ' + err);
                obj_err.status_code = 400;
                obj_err.msg_text = err;
                reject(obj_err);
            }else{
                console.log('ponto 5'); 
                resolve(results);
            }
        });
        

    });
}

//REGISTER
function register_select(register_temp){
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM login WHERE email = '${register_temp.email}' `, function (err, results, field) {

            var obj_err = {};
            obj_err.msg_text = '--->>> register_select - Não entrou no erro ainda...';

            if(err){
                console.log('ponto 4'); 
                console.log('Erro: register_select dentro da PROMISE ' + err);
                obj_err.status_code = 400;
                obj_err.msg_text = err;
                reject(obj_err);
            }else{
                console.log('Dentro da Promise -> Selecionada: ' + results.length);
                resolve(results);
            }
        });

    });
}

function register_insert(register_temp){
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO login (email, password) VALUES ('${register_temp.email}', '${register_temp.password}') `, function (err, results, field) {

            var obj_err = {};
            obj_err.msg_text = '--->>> register_insert - Não entrou no erro ainda...';

            if(err){
                console.log('ponto 4'); 
                console.log('Erro: register_insert dentro da PROMISE ' + err);
                obj_err.status_code = 400;
                obj_err.msg_text = err;
                reject(obj_err);
            }else{
                console.log('Dentro da Promise -> Linhas afetadas: ' + results.length + ' | ID: ' + results.insertId);
                resolve(results);
            }
        });

    });
}

//#endregion



app.listen(port, () => {
    console.log(`Listering port ${port}`);
} );

