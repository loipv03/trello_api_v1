import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, IUser } from "../interfaces/user";
import User from "../models/user";


const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new Error("Bạn phải đăng nhập để thực hiện hành động này");
        }

        const token = authHeader && (authHeader.split(" ")[1] as string);
        const secretKey: string = process.env.JWT_SECRET!;

        jwt.verify(
            token,
            secretKey,
            async (error: any, payload: any) => {
                if (error) {
                    if (error.name === "JsonWebTokenError") {
                        return res.status(400).json({
                            success: false,
                            message: "Token không hợp lệ",
                        });
                    }
                    if (error.name === "TokenExpiredError") {
                        return res.status(400).json({
                            success: false,
                            message: "Token đã hết hạn",
                        });
                    }
                }
                const user = (await User.findById(payload?.["user"]?._id)) as IUser;
                if (!user) {
                    return res.status(400).json({
                        success: false,
                        message: "người dùng không tồn tại",
                    });
                }
                req.user_id = String(user?._id)
                next();
            }
        )

    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

export default authenticate
