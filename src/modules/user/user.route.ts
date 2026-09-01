import {  NextFunction, Request, Response, Router } from "express";
import { userController } from "./user.controller";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { Role } from "../../../generated/prisma/enums";
import  httpStatus  from "http-status";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { auth } from "../../middleware/auth";


const router = Router()



router.post("/register", userController.registerUser )



router.get("/me",
//     (req: Request, res: Response, next: NextFunction)=>{

//     const {accessToken} = req.cookies;
//         console.log(accessToken)
//         const verifiedToken = jwtUtils.verifyToken(accessToken, config.jwt_access_secret)

//         if(!verifiedToken.success){
//             throw new Error(verifiedToken.error)
//         }

        
        
       
//         const {email, name, id, role}= verifiedToken.data as JwtPayload;
//         // const requiredRoles = ["ADMIN", "USER", "AUTHOR"];
//         const requiredRoles = [Role.ADMIN, Role.USER, Role.AUTHOR]
//         if(!requiredRoles.includes(role)){
//             return sendResponse(res,{
//                 success: true,
//                 statusCode: httpStatus.FORBIDDEN,
//                 message: "Forbidden. You don't have permission to access this resource.",
//                 data: null
//             })
//         }
//         req.user = {
//             email, name, id, role
//         }
//         next();

// },
 auth(Role.ADMIN, Role.AUTHOR, Role.USER),
userController.getMyProfile);

router.put("/my-profile", auth(Role.ADMIN, Role.AUTHOR, Role.USER), userController.updateMyProfile)

export const userRoutes = router;