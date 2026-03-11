import { InlineQuery, InlineQueryHandler, InlineQueryResultArticle } from "@/types/telegram";

const PaimonQuotes = [
    {"zh": "前面的区域，以后再来探索吧。", "ja": "この先のエリアは、また今度探検しようね。", "en": "Let's explore the area ahead later."},
    {"zh": "「欸嘿」是什么意思啊！", "ja": "「えへっ」ってどういう意味なの！？", "en": "What does 'ehe~' even mean!?"},
    {"zh": "每个惹我生气的人我都要给他取个难听的绰号！", "ja": "パイモンを怒らせた人には、みんな変なあだ名をつけてやるんだから！", "en": "Anyone who makes Paimon angry gets a weird nickname!"},
    {"zh": "喂，你不会在拿派蒙寻开心吧！", "ja": "ねぇ、パイモンで遊んでるんじゃないでしょうね！", "en": "Hey! You're not making fun of Paimon, are you!?"},
    {"zh": "派蒙不是食物！", "ja": "パイモンは食べ物じゃないよ！", "en": "Paimon is not emergency food!"},
    {"zh": "欸？你要吃派蒙？！不可以！", "ja": "えっ？パイモンを食べるつもり！？だめだよ！", "en": "Eh? You want to eat Paimon?! No way!"},
    {"zh": "这个箱子里会不会有超稀有的宝藏？派蒙先打开看看！", "ja": "この箱の中、超レアなお宝があるかも！パイモンが先に開けてみるね！", "en": "Maybe there's something super rare in this chest! Paimon will open it first!"},
    {"zh": "哼，派蒙才不是紧急食品呢！", "ja": "ふん、パイモンは非常食なんかじゃないもん！", "en": "Hmph! Paimon is *not* emergency food!"},
    {"zh": "旅行者～你是不是又偷偷乱花摩拉了？", "ja": "旅人～またこっそりモラを使っちゃったんでしょ？", "en": "Traveler~ Did you secretly spend all your Mora again?"},
    {"zh": "派蒙感觉，这次的冒险，肯定有不一样的收获！", "ja": "今回の冒険は、きっと特別なものになる予感！", "en": "Paimon has a feeling this adventure will be special!"},
    {"zh": "哇哦～这风景，派蒙要多拍几张留作纪念！", "ja": "わあ～この景色！写真をいっぱい撮って記念にしよう！", "en": "Wow~ What a view! Paimon's taking a few pictures for memories!"},
    {"zh": "旅行者，派蒙觉得你看起来很可疑哦～", "ja": "旅人、なんか怪しいよ～", "en": "Traveler, you look kinda suspicious~"},
    {"zh": "派蒙可是超级可靠的向导呢！", "ja": "パイモンはとっても頼りになるガイドなんだから！", "en": "Paimon is a super reliable guide, you know!"},
    {"zh": "派蒙觉得，这种时候就该吃点甜甜花酿鸡！", "ja": "こういう時こそ、スイートフラワーのチキンを食べるべきだね！", "en": "This calls for some Sweet Madame!"},
    {"zh": "呼……派蒙累了，要休息一下！", "ja": "ふぅ……パイモン、ちょっと休憩するね。", "en": "Phew… Paimon's tired. Time for a little rest!"},
    {"zh": "派蒙才不是贪吃鬼！只是刚好饿了而已！", "ja": "パイモンは食いしん坊じゃないよ！ちょっとお腹が空いただけ！", "en": "Paimon's not a glutton! Just… a little hungry!"},
    {"zh": "派蒙听说璃月的美食特别多，我们快去看看吧！", "ja": "璃月の料理はすっごく美味しいって聞いたよ！早く行こう！", "en": "Paimon heard Liyue has amazing food! Let's go check it out!"},
    {"zh": "欸嘿～派蒙是不是超厉害？", "ja": "えへへ～パイモンってすごいでしょ？", "en": "Ehehe~ Paimon's amazing, right?"},
    {"zh": "派蒙要给这次冒险打满分！", "ja": "今回の冒険、満点だね！", "en": "Paimon gives this adventure a full score!"},
    {"zh": "旅行者，派蒙会一直陪着你的！", "ja": "旅人、パイモンはずっと一緒にいるよ！", "en": "Traveler, Paimon will always be with you!"}
];

// 为每条语录提供详细的说明文字
const QuoteDescriptions = [
    {"zh": "派蒙的经典台词 - 探索的邀请", "ja": "パイモンの名台詞 - 探検への招待", "en": "Paimon's classic quote - An invitation to explore"},
    {"zh": "派蒙的困惑 - 对\"欸嘿\"的疑惑", "ja": "パイモンの困惑 - \"えへっ\"の意味について", "en": "Paimon's confusion - About the meaning of 'ehe~'"},
    {"zh": "派蒙的威胁 - 给惹她生气的人取绰号", "ja": "パイモンの脅し - 怒らせた人へのあだ名", "en": "Paimon's threat - Nicknames for those who anger her"},
    {"zh": "派蒙的抗议 - 对被戏弄的不满", "ja": "パイモンの抗議 - からかわれることへの不満", "en": "Paimon's protest - Dissatisfaction with being teased"},
    {"zh": "派蒙的宣言 - 坚决否认是食物", "ja": "パイモンの宣言 - 食べ物ではないことの主張", "en": "Paimon's declaration - Firmly denying being food"},
    {"zh": "派蒙的拒绝 - 对被吃掉的强烈反对", "ja": "パイモンの拒否 - 食べられることへの強い反対", "en": "Paimon's refusal - Strong opposition to being eaten"},
    {"zh": "派蒙的期待 - 对宝藏的渴望", "ja": "パイモンの期待 - 宝物への憧れ", "en": "Paimon's anticipation - Longing for treasure"},
    {"zh": "派蒙的坚持 - 再次强调不是食物", "ja": "パイモンの主張 - 再度の食べ物否定", "en": "Paimon's insistence - Reaffirming she's not food"},
    {"zh": "派蒙的指责 - 对旅行者挥霍摩拉的吐槽", "ja": "パイモンの指摘 - 旅人のモラ浪費への突っ込み", "en": "Paimon's accusation - Complaining about Traveler's spending"},
    {"zh": "派蒙的乐观 - 对冒险充满期待", "ja": "パイモンの楽観 - 冒険への期待に満ちた言葉", "en": "Paimon's optimism - Full of anticipation for adventure"},
    {"zh": "派蒙的感叹 - 对美景的赞美", "ja": "パイモンの感動 - 美しい景色への感嘆", "en": "Paimon's admiration - Praise for beautiful scenery"},
    {"zh": "派蒙的疑虑 - 对旅行者的怀疑", "ja": "パイモンの疑い - 旅人への不信感", "en": "Paimon's suspicion - Doubting the Traveler"},
    {"zh": "派蒙的自豪 - 对自己能力的肯定", "ja": "パイモンの自信 - 自分の能力への確信", "en": "Paimon's pride - Confidence in her abilities"},
    {"zh": "派蒙的建议 - 推荐美食甜甜花酿鸡", "ja": "パイモンの提案 - スイートフラワーのチキンをお勧め", "en": "Paimon's suggestion - Recommending Sweet Madame"},
    {"zh": "派蒙的疲惫 - 需要休息的时刻", "ja": "パイモンの疲労 - 休憩が必要な時", "en": "Paimon's exhaustion - Time for a break"},
    {"zh": "派蒙的辩解 - 否认自己是贪吃鬼", "ja": "パイモンの言い訳 - 食いしん坊ではないと主張", "en": "Paimon's excuse - Denying she's a glutton"},
    {"zh": "派蒙的美食推荐 - 对璃月美食的期待", "ja": "パイモンのグルメ情報 - 璃月の料理への期待", "en": "Paimon's food recommendation - Excitement for Liyue cuisine"},
    {"zh": "派蒙的得意 - 对自己的夸耀", "ja": "パイモンの自慢 - 自分の素晴らしさの自慢", "en": "Paimon's boasting - Showing off her greatness"},
    {"zh": "派蒙的评价 - 给冒险打满分", "ja": "パイモンの評価 - 冒険に満点をつける", "en": "Paimon's rating - Giving the adventure a perfect score"},
    {"zh": "派蒙的承诺 - 永远陪伴旅行者", "ja": "パイモンの約束 - 旅人への永遠の付き添い", "en": "Paimon's promise - Always staying with the Traveler"}
];

/**
 * 将派蒙语录转换为内联查询结果
 */
function quotesToInlineResults(quotes: typeof PaimonQuotes, lang: "zh" | "ja" | "en" = "zh"): InlineQueryResultArticle[] {
    return quotes.map((quote, index) => ({
        type: "article",
        id: `pm_${index}_${lang}`,
        title: quote[lang],
        description: QuoteDescriptions[index][lang],
        input_message_content: {
            message_text: quote[lang],
        },
    }));
}

const pmInlineHandler: InlineQueryHandler = {
    name: "pm",
    execute: async (query: InlineQuery) => {
        // 获取语言参数，默认为中文
        let lang: "zh" | "ja" | "en" = "zh";
        
        const queryParts = query.query.trim().split(/\s+/);
        if (queryParts.length > 1) {
            const langParam = queryParts[1].toLowerCase();
            if (langParam === "ja" || langParam === "jp") {
                lang = "ja";
            } else if (langParam === "en") {
                lang = "en";
            } else if (langParam === "zh" || langParam === "cn") {
                lang = "zh";
            }
        }

        // 返回所有派蒙语录作为内联查询结果
        return quotesToInlineResults(PaimonQuotes, lang);
    },
};

export default pmInlineHandler;
