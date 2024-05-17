/**
 * 간단한 유튜브 회원 관리 실습 (유저 관리 API)
 */

const express = require("express");
const router = express.Router();
const conn = require("../mariadb");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
router.use(express.json());

//* err가 있는지 검증하는 함수
const validate = (req, res, next) => {
  const err = validationResult(req);

  if (err.isEmpty) {
    return next();
  } else {
    return res.status(400).json(err.array());
  }
};

//* 로그인
router.post(
  "/login",
  [
    body("email").notEmpty().isEmail().withMessage("이메일 확인 필요"),
    body("password").notEmpty().isString().withMessage("비밀번호 확인 필요"),
    validate,
  ],
  (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";

    conn.query(sql, email, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(400).end();
      }

      const loginUser = results[0];
      if (loginUser && loginUser.password === password) {
        // token 발급
        const token = jwt.sign(
          {
            email: loginUser.email,
            name: loginUser.name,
          },
          process.env.PRIVATE_KEY,
          {
            expiresIn: "5m",
          }
        );

        // 헤더에 있는 쿠키에 토큰을 담아서 보냄
        res.cookie("token", token, {
          httpOnly: true,
        });

        res.status(200).json({
          message: `${loginUser.name}님 환영합니다. 로그인 성공!`,
        });
      } else {
        res.status(403).json({
          message: "이메일 또는 비밀번호가 틀렸습니다",
        });
      }
    });
  }
);

//* 회원가입
router.post(
  "/join",
  [
    body("email").notEmpty().isEmail().withMessage("이메일 확인 필요"),
    body("name").notEmpty().isString().withMessage("이름 확인 필요"),
    body("password").notEmpty().isString().withMessage("비밀번호 확인 필요"),
    body("contact").notEmpty().isString().withMessage("연락처 확인 필요"),
    validate,
  ],
  (req, res) => {
    const { email, name, password, contact } = req.body;
    const sql =
      "INSERT INTO users(email, name, password, contact) VALUES(?, ?, ?, ?)";

    conn.query(sql, [email, name, password, contact], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(400).end();
      }

      res.status(201).json({
        results,
      });
    });
  }
);

router
  .route("/users")
  .get(
    [
      body("email").notEmpty().isEmail().withMessage("이메일 확인 필요"),
      validate,
    ],
    (req, res) => {
      //* 회원 개별 조회
      const { email } = req.body;
      const sql = "SELECT * FROM users WHERE email = ?";

      conn.query(sql, email, (err, results) => {
        if (err) {
          console.log(err);
          return res.status(400).end();
        }

        if (results.length) {
          res.status(200).json({
            results,
          });
        } else {
          res.status(404).json({
            message: "회원 정보가 없습니다",
          });
        }
      });
    }
  )
  .delete(
    [
      body("email").notEmpty().isEmail().withMessage("이메일 확인 필요"),
      validate,
    ],
    (req, res) => {
      //* 회원 개별 탈퇴
      const { email } = req.body;
      const sql = "DELETE FROM users WHERE email = ?";

      conn.query(sql, email, (err, results) => {
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
  );

module.exports = router;
