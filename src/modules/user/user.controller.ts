import { NextFunction, Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import jwt from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import { Role } from "../../../generated/prisma/enums";

declare global {
    namespace Express{
        interface Request {
            user?:{
                email: string;
                name: string;
                id: string;
                role: Role;

            }
        }
    }
}

// const registerUser = async (req: Request, res: Response) => {
//   try {
//     const payload = req.body;

//     const user = await userService.registerUserIntoDB(payload);

//     res.status(httpStatus.CREATED).json({
//       success: true,
//       statusCode: httpStatus.CREATED,
//       message: "User registered successfully",
//       data: {
//         user,
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//       message: "Failed to register user",
//       error: (error as Error).message,
//     });
//   }
// };

const getMyProfile = catchAsync(async(req:Request, res: Response, next: NextFunction)=>{

    // const {accessToken} = req.cookies;
    // console.log(accessToken)
    // const verifiedToken = jwtUtils.verifyToken(accessToken, config.jwt_access_secret)
    
    // if(typeof verifiedToken === "string"){
    //     throw new Error(verifiedToken);
    // }
    const profile = await userService.getMyProfileIntoDB(req.user?.id as string )
    sendResponse(res, {
        success : true,
        
        statusCode: httpStatus.OK,
        message: "User profile fetched successfully",
        data: {profile}
    })
   
})

const registerUser = catchAsync ( async(req: Request, res: Response, next: NextFunction)=>{

    const payload = req.body;
    const user = await userService.registerUserIntoDB(payload);
    // res.status(httpStatus.CREATED).json({
    //     success: true,
    //     statusCode: httpStatus.CREATED,
    //     message: "User registered successfully",
    //     data: {
    //         user
    //     }
    // })
    sendResponse(res,{
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User register successfully",
        data: {user}
    } )

})

const updateMyProfile = catchAsync ( async (req: Request, res: Response, next: NextFunction)=>{

    const userId = req.user?.id as string;

    const payload = req.body;

    const updatedProfile = await userService.updateMyProfileIntoDB(userId, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Profile updated successfully",
        data: { updatedProfile}
    })
})


export const userController = {
  registerUser,
  getMyProfile,
  updateMyProfile
};
