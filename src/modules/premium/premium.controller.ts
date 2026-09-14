import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus  from "http-status";
import { PremiumServices } from "./premium.service";

const getPremiumContent = catchAsync(
    async(req : Request, res: Response, next: NextFunction)=>{

        const query = req.query;
        const result = await PremiumServices.getPremiumContent(query)
        sendResponse(res, {
            success : true,
            statusCode : httpStatus.OK,
            message: "Premium Content Retrieved Successfully",
            data : result.data,
            meta: result.meta
        })
    }
)

export const PremiumController = {
    getPremiumContent
}