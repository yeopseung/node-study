//* 프로젝트 대표 파일
const express = require("express");
const app = express();

const db = require("./mariadb");
db.connect();

const dotenv = require("dotenv");
dotenv.config();

app.listen(process.env.PORT_NUMBER);

const userRouter = require("./routes/users");
const channelRouter = require("./routes/channels");

app.use("/", userRouter);
app.use("/channels", channelRouter);
