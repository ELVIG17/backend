"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hashPass_1 = require("../utils/hashPass");
const db_1 = __importDefault(require("../db"));
const router = express_1.default.Router();
router.post("/login", async function (params) { });
router.post("/logout", async function (params) { });
router.post("/register", async function (req, res) {
    try {
        const { username, email, password } = req.body;
        if (!email || !password || !username)
            throw new Error("Email or password error1");
        if (email) {
        } // есть ли такой пользователь в бд
        const hashedPass = await (0, hashPass_1.hashPass)(password);
        const newUser = db_1.default.user.create({
            data: { username, email, password: hashedPass },
        });
        return res.status(200).json({ text: newUser });
    }
    catch (e) {
        return res.status(400).json({ error: e });
    }
});
exports.default = router;
