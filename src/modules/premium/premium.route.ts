import { NextFunction, Request, Response, Router } from "express";
import { PremiumController } from "./premium.controller";
import { auth } from "../../middleware/auth";
import { Role, SubscriptionStatus } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import { prisma } from "../../lib/prisma";
import { subscriptionGuard } from "../../middleware/premiumGuards";

const router = Router()

router.get(
    "/",
   
    auth(Role.ADMIN, Role.AUTHOR, Role.USER),
    subscriptionGuard(),
    PremiumController.getPremiumContent
)


export const premiumRoutes = router