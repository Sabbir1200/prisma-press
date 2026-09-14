import { NextFunction, Request, Response } from "express";
import { SubscriptionStatus } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../lib/prisma";

export const subscriptionGuard = ()=>{
    return  catchAsync(
        async(req : Request, res: Response, next: NextFunction)=>{
            const userId = req.user?.id;
            const subscription = await prisma.subscription.findUnique({
                where :{
                    userId
                }
            })
            if(!subscription){
                throw new Error("Please subscribe to get access to premium Contents")
            }
            if(subscription?.status !== SubscriptionStatus.ACTIVE){
                throw new Error ("Please subscribe again to get access to premium Contents")
            }
            next()
        }
    )
}