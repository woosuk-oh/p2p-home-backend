import cors from "@elysiajs/cors";
import { Elysia, ValidationError } from "elysia";
import articlesController from "./api/articles/articles.controller";
import commentsController from "./api/comments/comments.controller";
import profilesController from "./api/profiles/profiles.controller";
import tagsController from "./api/tags/tags.controller";
import usersController from "./api/users/users.controller";
import { unprocessable } from "./common/utils";
import scrapingController from "./api/scraping/scraping.controller.ts";

export const app = new Elysia({ prefix: "/api" })
  .use(cors())
  .onError(({ set, error }) => {
    set.headers["content-type"] = "application/json";
    if (error instanceof ValidationError) {
      /* attempting to return detailed error response while maintaing realworld api error response structure
    {"errors": {"body": [
              "Error in /user/username of type:string: Required property",
              "Error in /user/username of type:string: Expected string"
    ]} }*/
      try {
        return unprocessable(
          JSON.parse(error.message)["errors"].map(
            (o: Record<string, string>) =>
              `Error in ${o.path}${
                o.schema &&
                ` of ${Object.entries(o.schema).map(arr => arr.join(" "))}`
              }: ${o.message}`
          )
        );
      } catch (e) {
        return unprocessable(error.message);
      }
    }
  })
  .use(usersController)
  .use(profilesController)
  .use(articlesController)
  .use(commentsController)
  .use(tagsController)
  .use(scrapingController)
  .listen(Bun.env.PORT || 3001);

export type App = typeof app;
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
