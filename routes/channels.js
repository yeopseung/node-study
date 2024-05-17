/**
 * 간단한 유튜브 회원 관리 실습 (채널 관리 API)
 */

const express = require("express");
const router = express.Router();
const conn = require("../mariadb");
const { body, validationResult, param } = require("express-validator");

router.use(express.json());

const validate = (req, res, next) => {
  const err = validationResult(req);

  if (err.isEmpty) {
    return next();
  } else {
    return res.status(400).json(err.array());
  }
};

router
  .route("/")
  .get(
    [body("userId").notEmpty().isInt().withMessage("숫자 입력 필요"), validate],
    (req, res) => {
      //* 채널 전체 조회
      const { userId } = req.body;
      const sql = "SELECT * FROM channels WHERE user_id = ?";

      conn.query(sql, userId, (err, results) => {
        if (err) {
          console.log(err);
          return res.status(400).end();
        }

        if (results.length) {
          res.status(200).json(results);
        } else {
          return res.status(400).end();
        }
      });
    }
  )
  .post(
    [
      body("userId").notEmpty().isInt().withMessage("숫자 입력 필요"),
      body("name").notEmpty().isString().withMessage("문자 입력 필요"),
    ],
    (req, res) => {
      //* 채널 개별 생성
      const err = validationResult(req);

      if (!err.isEmpty()) {
        return res.status(400).json(err.array());
      }

      const { name, userId } = req.body;
      const sql = "INSERT INTO channels(name, user_id) VALUES(?, ?)";

      conn.query(sql, [name, userId], (err, results) => {
        if (err) {
          console.log(err);
          return res.status(400).end();
        }

        res.status(201).json(results);
      });
    }
  );

router
  .route("/:id")
  .get(param("id").notEmpty().withMessage("채널 id 필요"), (req, res) => {
    //* 채널 개별 조회
    const err = validationResult(req);

    if (!err.isEmpty()) {
      return res.status(400).json(err.array());
    }

    const id = parseInt(req.params.id);
    const sql = "SELECT * FROM channels WHERE id = ?";

    conn.query(sql, id, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(400).end();
      }

      if (results.length) {
        res.status(200).json(results);
      } else {
        return res.status(400).end();
      }
    });
  })
  .put(
    [
      param("id").notEmpty().withMessage("채널 id 필요"),
      body("name").notEmpty().isString().withMessage("채널명 오류"),
    ],
    (req, res) => {
      //* 채널 개별 수정
      const err = validationResult(req);

      if (!err.isEmpty()) {
        return res.status(400).json(err.array());
      }

      let { id } = req.params;
      id = parseInt(id);
      const { name } = req.body;

      const sql = "UPDATE channels SET name=? WHERE id=?";
      const values = [name, id];

      conn.query(sql, values, (err, results) => {
        if (err) {
          console.log(err);
          return res.status(400).end();
        }

        if (results.affectedRows == 0) {
          res.status(400).json(results);
        } else {
          res.status(200).json(results);
        }
      });
    }
  )
  .delete([param("id").notEmpty().withMessage("채널 id 필요")], (req, res) => {
    //* 채널 개별 삭제
    const err = validationResult(req);

    if (!err.isEmpty()) {
      return res.status(400).json(err.array());
    }

    let { id } = req.params;
    id = parseInt(id);

    const sql = "DELETE FROM channels WHERE id = ?";
    conn.query(sql, id, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(400).end();
      }

      if (results.affectedRows == 0) {
        res.status(400).json(results);
      } else {
        res.status(200).json(results);
      }
    });
  });

module.exports = router;
