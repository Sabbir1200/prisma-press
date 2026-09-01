import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { commentController } from "./comment.controller";

const router = Router();



router.post("/", auth(Role.ADMIN, Role.AUTHOR, Role.USER), commentController.createComment)

router.get("/author/:authorId",commentController.getCommentByAuthorId)

router.get("/:commentId", commentController.getCommentByCommentId)

router.patch("/:commentId", auth(Role.ADMIN, Role.USER, Role.AUTHOR), commentController.updateComment)

router.delete("/:commentId", auth(Role.USER, Role.ADMIN, Role.AUTHOR), commentController.deleteComment)

router.patch("/:commentId/moderate", auth(Role.ADMIN), commentController.moderateComment)

export const commentRoutes = router;