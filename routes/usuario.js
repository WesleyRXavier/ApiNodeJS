const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
const multer = require("multer");
var  bcrypt  = require ( 'bcryptjs' ) ; 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});
//tratamento de imagem
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, //5 mb
  },
  fileFilter: fileFilter,
});

//retorna todos os usuarios
router.get("/", (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query("SELECT *FROM usuarios;", (error, result, field) => {
      if (error) {
        return res.status(500).send({ error: error });
      }
      const response = {
        quantidade: result.length,
        usuarios: result.map((usuario) => {
          return {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            cpf: usuario.cpf,
            senha: usuario.senha,
            avatar: usuario.avatar,
            request: {
              tipo: "GET",
              descricao: "Retorna detalhes de um usuario",
              url: "http://localhost:3000/usuario/" + usuario.id,
            },
          };
        }),
      };
      return res.status(200).send({ response });
    });
  });
});

//salva um usuario
router.post("/", upload.single("usuario_imagem"), (req, res, next) => {
  console.log(req.file);
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    //verifica se ja existe o usuario
    conn.query(
      "SELECT * FROM usuarios WHERE cpf = ?",
      [req.body.cpf],
      (error, result, field) => {
        if (error) {
          return res.status(500).send({ error: error });
        }
        if (result.length > 0) {
          return res.status(409).send({
            msg: "Existe um usuario cadastrado com este cpf.",
          });
        }
        //fim da verificacao
        bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
          if (errBcrypt) {
            return res.status(500).send({ error: errBcrypt });
          }

          conn.query(
            "INSERT INTO usuarios (nome,email,cpf,senha,avatar) VALUES(?,?,?,?,?)",
            [req.body.nome, req.body.email, req.body.cpf, hash, req.file.path],
            (error, result, field) => {
              conn.release(); //fecha a conexao
              if (error) {
                return res.status(500).send({ error: error });
              }
              const response = {
                msg: "Usuario criado com sucesso",
                usuarioCriado: {
                  id: result.insertId,
                  nome: req.body.nome,
                  email: req.body.email,
                  cpf: req.body.cpf,
                  avatar: req.file.path,

                  request: {
                    tipo: "POST",
                    descricao: "Retorna detalhes de um usuario",
                    url: "http://localhost:3000/usuario/" + result.insertId,
                    //image:"http://localhost:3000/"+req.file.path,
                  },
                },
              };
              return res.status(200).send(response);
            }
          );
        });
      }
    );
  });
});

//retorna um usuario definido
router.get("/:idUsuario", (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      `SELECT *FROM usuarios WHERE id = ?;`,
      [req.params.idUsuario],
      (error, result, fields) => {
        if (error) {
          return res.status(500).send({ error: error });
        }
        if (result.length == 0) {
          return res.status(404).send({ msg: " Usuario não foi encontrado!" });
        }
        const response = {
          usuario: {
            id: result[0].id,
            nome: result[0].nome,
            email: result[0].email,
            cpf: result[0].cpf,
            senha: result[0].senha,
            avatar: result[0].avatar,

            request: {
              tipo: "GET",
              descricao: "Retorna dados de um usuario",
              url: "http://localhost:3000/usuario/" + result[0].id,
            },
          },
        };
        return res.status(200).send(response);
      }
    );
  });
});

router.patch("/", (req, res, next) => {

  const {email,nome,cpf,senha}= req.body;

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    //verifica  existe o usuario
    conn.query(
      "SELECT * FROM usuarios WHERE id = ?",
      [req.body.id],
      (error, result, field) => {
        if (error) {
          return res.status(500).send({ error: error });
        }
        if (result.length == 0) {
          return res.status(404).send({
            msg: "Não existe um usuario com Id: " + req.body.id,
          });
        }
        //fim da verificacao
        conn.query(
          `UPDATE usuarios
                SET nome        = ?,
                    email       = ?,
                    cpf         = ?,
                    senha       = ?
              WHERE id  = ?`,
          [
            nome,
            email,
            cpf,
            senha,
            id,
          ],
          (error, result, field) => {
            conn.release();
            if (error) {
              return res.status(500).send({ error: error });
            }
            const response = {
              msg: "Usuario atualizado com sucesso",
              usuarioAtualizado: {
                id: id,
                nome: nome,
                email: email,
                cpf: cpf,
                senha: senha,
                request: {
                  tipo: "GET",
                  descricao: "Retorna detalhe do usuario",
                  url: "http://localhost:3000/usuario/" + result,
                },
              },
            };
            return res.status(202).send(response);
          }
        );
      }
    );
  });
});

//deleta produto
router.delete("/", (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    //verifica  existe o usuario
    conn.query(
      "SELECT * FROM usuarios WHERE id = ?",
      [req.body.id],
      (error, result, field) => {
        if (error) {
          return res.status(500).send({ error: error });
        }
        if (result.length == 0) {
          return res.status(404).send({
            msg: "Não existe um usuario com Id: " + req.body.id,
          });
        }
        //fim da verificacao
        conn.query(
          `DELETE FROM usuarios WHERE id = ?`,
          [req.body.id],
          (error, result, field) => {
            conn.release();
            if (error) {
              return res.status(500).send({ error: error });
            }
            const response = {
              msg: " Usuario removido com sucesso",
              request: {
                tipo: "GET",
                descricao: "Retorna todos usuarios",
                url: "http://localhost:3000/usuario",
              },
            };

            return res.status(202).send(response);
          }
        );
      }
    );
  });
});

router.post("/login", (req, res, next) => {
  const { senha, cpf } = req.body;
  if (cpf) {
    if (senha) {
      mysql.getConnection((error, conn) => {
        if (error) {
          return res.status(500).send({ error: error });
        }
        const query = `SELECT * FROM usuarios WHERE cpf = ?`;
        conn.query(query, [cpf], async (error, results, fields) => {
          conn.release();
          if (error) {
            return res.status(500).send({ error: error });
          }
          if (results.length < 1) {
            return res.status(401).send({ msg: "Falha na autenticação 1" });
          }
          var  eee  = bcrypt.hashSync ( 'senha' , 10 ) ;
          bcrypt.compare(senha, results[0].senha, (err, result) => {
            if (err) {
              return res.status(401).send({msg: "Falha na autenticação 2"});
            }
            if (result) {
              return res.status(200).send({ msg: "Autenticado com sucesso" });
            }
            return res.status(401).send({ msg: "Falha na autenticação 3" +eee});
          });
        });
      });
    } else {
      return res.status(500).send({ msg: "Campo senha obrigatorio" });
    }
  } else {
    return res.status(500).send({ msg: "Campo email obrigatorio" });
  }
});

module.exports = router;
