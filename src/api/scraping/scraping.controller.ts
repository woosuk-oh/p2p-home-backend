import {Elysia, t} from "elysia";
import jwt from "../../common/jwt";
import {badGateway, getAuthUserId, internalServerError, unauthorized, unprocessable} from "../../common/utils";
import {ScrapingService} from "./scraping.service.ts";


//긁어올 게시판의 아이디. 해당 아이디에 포함되어있는 게시글의 id들을 가져온다. (ex. 2540는 '✅[찐 매물]서울' 게시판)
const TARGET_MENU_IDS = ['2540']

export const scrapingController = new Elysia({
    prefix: "/scraping",
})
    .get(
        '',
        async () => {
            const articleIdByMenuId: { [menuId: string]: number[] } = {};

            for (const menuId of TARGET_MENU_IDS) {
                try {
                    const result = await ScrapingService.getArticleIds(menuId);
                    articleIdByMenuId[menuId] = result;
                } catch (e: any) {
                    console.error('Error fetching articles:', e);

                    if (e.message.includes('Failed to fetch articles')) {
                        return badGateway(e);
                    } else {
                        return internalServerError(e);
                    }
                }
            }

            return {
                status: 'success',
                data: articleIdByMenuId
            };
        }
    )/*
    .guard(
        {
            beforeHandle({headers: {authorization, ...headers}}) {
                if (!authorization || authorization.toString() === "") {
                    throw unauthorized();
                }
            },
        },
    );*/

export default scrapingController;
