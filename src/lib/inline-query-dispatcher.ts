import { InlineQuery, InlineQueryHandler, InlineQueryResult } from "@/types/telegram";
import { NextResponse } from "next/server";

class InlineQueryDispatcher {
    private handlers: Map<string, InlineQueryHandler>;

    constructor() {
        this.handlers = new Map<string, InlineQueryHandler>();
    }

    /**
     * 注册内联查询处理器
     */
    registerHandler(handler: InlineQueryHandler) {
        this.handlers.set(handler.name.toLowerCase(), handler);
    }

    /**
     * 分发内联查询
     */
    async dispatch(inlineQuery: InlineQuery): Promise<NextResponse | null> {
        let handlerName = "";
        
        if (!inlineQuery.query) {
            // 如果查询为空，默认使用 help 处理器
            handlerName = "help";
        } else {
            // 获取查询的第一个单词作为处理器名称
            const queryParts = inlineQuery.query.trim().split(/\s+/);
            handlerName = queryParts[0].toLowerCase();
        }

        const handler = this.handlers.get(handlerName);
        if (!handler) {
            return null;
        }

        try {
            const results = await handler.execute(inlineQuery);
            
            // 返回内联查询结果
            return NextResponse.json({
                method: "answerInlineQuery",
                inline_query_id: inlineQuery.id,
                results: results,
                cache_time: 300,
            });
        } catch (error) {
            console.error("处理内联查询失败:", error);
            return null;
        }
    }

    /**
     * 获取所有已注册的处理器
     */
    getRegisteredHandlers(): InlineQueryHandler[] {
        return Array.from(this.handlers.values());
    }
}

export const inlineQueryDispatcher = new InlineQueryDispatcher();
