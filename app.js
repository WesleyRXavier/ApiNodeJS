const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const rotaUsuario = require("./routes/usuario");
app.use('/uploads', express.static('uploads'));//coloca a pasta uploads publica,
app.use(bodyParser.urlencoded({ extended: false })); //apenas dados simples
app.use(bodyParser.json()); //so aceita json na entrada no body

//config cors, cabecalho, define quem pode acessar a api , origem do acesso
app.use((req, res, next) => {
  res.header("Access-Control_Allow-Origin", "*"); //origin
 /* res.header(
    "Access-Control-Allow-Header",
    "Origin",
    "X-Requested-With", // cabecalho
    "Content-Type",
    "Accept",
    "Authorization"
  );*/

  //Tipos de metodos aceitos
  if (req.method == "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
    return res.status(200).send({});

  }
  next();//passa para as rotas
});

//rotas aqui
app.use("/usuario", rotaUsuario);

//tratamento quando nao encontrar nenhuma rota
app.use((req, res, next) => {
  const erro = new Error("nao Encontrado");
  erro.status = 404;
  next(erro);
});

//retorna a mensagem de erro que deu
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  return res.send({
    erro: {
      msg: error.message,
    },
  });
});

module.exports = app;
