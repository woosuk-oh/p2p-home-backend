import {eq} from "drizzle-orm";
import {isDefined, notFound, unprocessable} from "../../common/utils";
import db from "../../db/connection";
import {chromium} from "playwright";
import {ApiService} from "../common/api.service.ts";
import {JSDOM} from "jsdom";
import iconv from 'iconv-lite';


interface Article {
    /*"id": 18571212,
                "subject": "대학동, 조용한 주택가, 리모델링, 분리형 풀옵션 원룸, 주택 서울특별시 관악구 신림동 원룸 월세 1000,48",
                "writerId": "vfgr",
                "writerMemberKey": "E7X196daUn5JU9ot-9ijgg",
                "writerNick": "vfgr",
                "writeDate": 1721108429710,
                "memberLevel": 110,
                "memberLevelIconId": 13,
                "commentCount": 0,
                "saleStatus": "NONE",
                "isAttachedMap": false,
                "isAttachedMovie": false,
                "isAttachedLink": false,
                "isAttachedMusic": false,
                "isAttachedCalendar": false,
                "isAttachedPoll": false,
                "isAttachedFile": false,
                "isAttachedImage": false,
                "isNewArticle": false,
                "isCafeBook": false,
                "isBadMenuByRestrict": false
            },
            {
                "id": 18568702,
                "subject": "위치1등, 가성비1등. 공과금 모두포함. 서울대생 1픽 서울특별시 관악구 신림동 원룸 월세 100,36",
                "writerId": "vfgr",
                "writerMemberKey": "E7X196daUn5JU9ot-9ijgg",
                "writerNick": "vfgr",
                "writeDate": 1721018721203,
                "memberLevel": 110,
                "memberLevelIconId": 13,
                "commentCount": 0,
                "saleStatus": "NONE",
                "isAttachedMap": false,
                "isAttachedMovie": false,
                "isAttachedLink": false,
                "isAttachedMusic": false,
                "isAttachedCalendar": false,
                "isAttachedPoll": false,
                "isAttachedFile": false,
                "isAttachedImage": false,
                "isNewArticle": false,
                "isCafeBook": false,
                "isBadMenuByRestrict": false */
    id: number;
    subject: string;
    writerId: string;
    writerMemberKey: string;
    writerNick: string;
    writeDate: number;

}

type ArticlesByMenuId = { [menuId: number]: number[] };

/**
 * 네이버카페 게시판 ID로 게시물 ID들을 가져옴
 */
export class ScrapingService extends ApiService {
    private static readonly NAVER_CAFE_CLUB_ID = '10322296';
    private static readonly NAVER_CAFE_BASE_URL = 'https://cafe.naver.com';
    private static readonly NAVER_API_BASE_URL = 'https://apis.naver.com/cafe-web';

    static async getArticleIds(menuId: number): Promise<number[]> {
        const requestUrl = this.createRequestUrl(menuId);
        const response = await fetch(requestUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch articles for menuId ${menuId}: ${response.statusText}`);
        }

        const articleIds: number[] = [];
        const buffer = await response.arrayBuffer();
        const decodedHtml = iconv.decode(Buffer.from(buffer), 'euc-kr');

        const dom = new JSDOM(decodedHtml);
        const doc = dom.window.document;
        const elements = doc.getElementsByClassName('inner_number');

        for (const element of elements) {
            const articleId = parseInt(element.textContent.trim(), 10);
            if (!isNaN(articleId)) {
                articleIds.push(articleId);
            }
        }

        return articleIds;
    }

    static async getArticleContent(articleId: number, menuId: number) {
        const requestUrl = this.createArticleContentUrl(articleId, menuId);
        const res = await ApiService.fetchFromExternalApi(requestUrl);
        if (res && res.result) {
            return res.result.article.contentHtml;
        }
    }

    private static createRequestUrl(menuId: number): string {
        return `${this.NAVER_CAFE_BASE_URL}/ArticleList.nhn?search.clubid=${this.NAVER_CAFE_CLUB_ID}&search.boardtype=L&search.menuid=${menuId}&search.marketBoardTab=D&search.specialmenutype=&userDisplay=30`;
    }

    private static createArticleContentUrl(articleId: number, menuId: number): string {
        return `${this.NAVER_API_BASE_URL}/cafe-articleapi/v2.1/cafes/${this.NAVER_CAFE_CLUB_ID}/articles/${articleId}?query=&menuId=${menuId}&boardType=L&useCafeId=true&requestFrom=A`;
    }

}
