import { NextResponse } from 'next/server';

/**
 * 临时测试接口 - 输出 Cloudflare 环境变量
 * 用于测试 Cloudflare 环境变量配置
 * 删除方法：直接删除此文件即可
 */
export async function GET() {
    try {
        const testEnv = process.env.test || 'undefined';

        return NextResponse.json({
            success: true,
            message: 'Test environment variable',
            test: testEnv,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Test API error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
