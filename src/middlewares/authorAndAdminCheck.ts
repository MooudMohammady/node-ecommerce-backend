import jwt from "jsonwebtoken";
import createError from "http-errors";
import { Router } from "express";
import { db } from "../lib/db";
import getCookies from "../lib/getCookies";

const router = Router();

router.use(async (req, res, next) => {
  let token = getCookies(req).token;
  if (token) req.headers.authorization = `Bearer ${token}`;
  if (!req.headers.authorization) {
    return next(createError.Unauthorized("Access token is required"));
  }
  token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return next(createError.Unauthorized());
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    const user = await db.user.findFirst({
      where: {
        id: decoded.id as string,
      },
    });
    if (
      user?.Role !== "SUPER_ADMIN" &&
      user?.Role !== "ADMIN" &&
      user?.Role !== "AUTHOR"
    )
      next(
        createError.Forbidden(
          "Access denied. You do not have permission to perform this action"
        )
      );
    //@ts-ignore
    req.userRole = user?.Role;
    //@ts-ignore
    req.userId = userId;
    next();
  } catch (error: any) {
    next(createError.Unauthorized(error?.message));
  }
});

const authorAndAdminCheck = router;
export default authorAndAdminCheck;
