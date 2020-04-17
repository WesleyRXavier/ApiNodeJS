const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;

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
router.post("/", (req, res, next) => {
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
          return res.status(500).send({
            msg: "Existe um usuario cadastrado com este cpf.",
          });
        }
        //fim da verificacao
        conn.query(
          "INSERT INTO usuarios (nome,email,cpf,senha) VALUES(?,?,?,?)",
          [req.body.nome, req.body.email, req.body.cpf, req.body.senha],
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
                senha: req.body.senha,
                request: {
                  tipo: "POST",
                  descricao: "Retorna detalhes de um usuario",
                  url: "http://localhost:3000/usuario/" + result.insertId,
                },
              },
            };
            return res.status(200).send(response);
          }
        );
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
            msg: "Não existe um usuario com Id: "+req.body.id,
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
        req.body.nome,
        req.body.email,
        req.body.cpf,
        req.body.senha,
        req.body.id,
      ],
      (error, result, field) => {
        conn.release();
        if (error) {
          return res.status(500).send({ error: error });
        }
        const response = {
          msg: "Usuario atualizado com sucesso",
          usuarioAtualizado: {
            id: req.body.id,
            nome: req.body.nome,
            email: req.body.email,
            cpf: req.body.cpf,
            senha: req.body.senha,
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
      });
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
            msg: "Não existe um usuario com Id: "+req.body.id,
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
  });
});
});

module.exports = router;
