// 这个行业的分类体系：类别、标签词表、公司（主体）名录，以及防止张冠李戴的身份词典。
// 模型按这里的词表打标签，主题页（topics.json）按标签归类，筛选栏按类别分组。
// 换行业时：类别的 key 会出现在网址里（/all?category=…），上线后就不要再改；标签和名录可以随时增减。

/**
 * 网页上的类别（筛选栏、卡片角标、RSS 分类订阅）。key 是网址和接口里的身份，上线后不要改。
 * section 是日报里的分节标题（几个类别可以共用一节，按这里的顺序排）；guide 告诉结构抽取模型这一类收什么、
 * 和相邻类别的边界在哪（总的归类原则写在 prompts/structure.md 里）。
 * commentary 标出评论类（教程、观点）：日报写过的事又有评论类的后续报道，只占一行快讯（报道它的信源够多时除外）。
 * 没归上类的资料在日报里放进第一个 key 为 industry 的类别所在的节（没有就放最后一节）。
 * tagColor 是飞书推送卡片里跟在标题后面的这一类小标签的颜色（飞书 text_tag 的颜色名）。
 * feedLabel 是分类 RSS 标题里的名字（不写就用 label）。公开接口、RSS 和 MCP 里要把一类并进另一类发布，写在站点设置里（site/site.ts 的 PUBLIC_CATEGORIES）。
 */
export const CATEGORIES = [
  { key: "regulatory", tagColor: "indigo", label: "法规监管", feedLabel: "法规监管", section: "法规与科学", blurb: "新食品原料、化妆品原料、药用辅料与食品添加剂的批准、限量、禁限用和安全通报。", guide: "监管机构、标准组织和药典委员会对原料的动作：新食品原料/新化妆品原料的批准与受理、注册备案、限量与使用条件、禁限用、安全性评价、标准与检测方法、GMP 与现场检查、召回与安全警告。区分“批准/授权”“受理/审评中”“征求意见”“否决/撤回”，不把提交申请、立项或征求意见稿写成已批准。终端产品的召回或处罚，只有涉及原料或配料时才归这一类；企业自己的合规宣传归企业与市场。" },
  { key: "research", tagColor: "violet", label: "研究与临床", feedLabel: "研究与临床", section: "研究与临床", blurb: "临床、功效、安全性与检测方法的新研究，以及学术会议上的原料证据。", guide: "以新研究、临床试验、功效与安全性评价、检测方法和标准物质为核心的论文、报告与学术会议摘要。系统性综述、人体试验、生物利用度、毒理与过敏研究都在这里。只发布摘要而无产业意义的普通论文要压低；企业把研究当成新品卖点时，研究本身仍归这一类，产品发布归对应原料类别。" },
  { key: "natural", tagColor: "green", label: "天然与植物原料", feedLabel: "天然与植物原料", section: "天然与草本", blurb: "植物提取物、中药材、天然色素与甜味剂、精油等天然来源原料的规格与供应。", guide: "植物提取物、草本、中药材与药食同源、天然色素、天然甜味剂、天然抗氧化剂、食用菌、海洋与动物来源原料、植物油与天然胶体、精油与芳香植物。区分天然原料、标准化提取物、纯化单体与合成等同物：写清规格（提取比、标志性成分含量）与来源部位；批准与限量归法规监管，价格与产区变化归供应链。" },
  { key: "flavors", tagColor: "purple", label: "香料香精", feedLabel: "香料香精", section: "天然与草本", blurb: "香辛料、精油、天然与合成香料、香精配方和风味趋势。", guide: "香辛料、精油、芳香植物、天然与合成香料、香精配方与中间体，以及 IFRA 等香料行业标准与风味趋势。香料作为原料的产区、产量和价格变化归供应链；食品或化妆品终端产品的口味营销不算。" },
  { key: "food-additives", tagColor: "orange", label: "食品添加剂", feedLabel: "食品添加剂", section: "食品与营养", blurb: "防腐、抗氧化、乳化、增稠、甜味、酶制剂等添加剂的品种、替代与应用。", guide: "防腐、抗氧化、甜味剂、乳化、增稠与胶体、酸度调节、着色、酶制剂、膨松、抗结、淀粉与糖醇等食品添加剂和配料的替代、新品与应用技术。新增品种、扩大使用范围与限量调整归法规监管；作为功能成分宣传的剂量与功效研究归研究与临床。" },
  { key: "functional", tagColor: "turquoise", label: "功能成分与营养", feedLabel: "功能成分与营养", section: "食品与营养", blurb: "蛋白与肽、益生菌、纤维、维生素、Omega-3 等功能成分的配方与商业化。", guide: "蛋白与肽、氨基酸、益生菌/益生元/后生元、膳食纤维、多酚与类黄酮、类胡萝卜素、Omega-3、维生素与矿物质、胶原与透明质酸、辅酶 Q10 等功能成分的配方、剂型、生物利用度与商业化。人体试验和功效结论归研究与临床；只有营销话术的软文不算。" },
  { key: "cosmetic", tagColor: "carmine", label: "化妆品原料", feedLabel: "化妆品原料", section: "化妆品原料", blurb: "美白、抗衰、防晒、保湿等化妆品活性成分与 INCI 新原料。", guide: "美白、抗衰、保湿、修护、防晒、表面活性剂、防腐、增稠、活性肽、神经酰胺、透明质酸、发酵与植物活性成分等化妆品原料与 INCI 新成分。功效与安全评价可归研究与临床；禁限用、备案与原料目录调整归法规监管；终端品牌的新品营销不算。" },
  { key: "pharma", tagColor: "red", label: "原料药与医药", feedLabel: "原料药与医药", section: "原料药与医药", blurb: "原料药、中间体、药用辅料、CDMO 与 GMP/DMF/CEP 的供应和合规。", guide: "原料药（API）、高活性原料药、多肽与核酸原料、医药中间体、药用辅料、CDMO/CMO、GMP/DMF/CEP、药典标准与供应短缺。区分 API、中间体、辅料、制剂与生物制品；药品获批上市是制剂端消息，只有涉及原料供应或工艺时才归这一类。" },
  { key: "biotech", tagColor: "blue", label: "生物制造与创新", feedLabel: "生物制造与创新", section: "生物制造", blurb: "合成生物、精准发酵、替代蛋白与新型原料从实验室到量产。", guide: "合成生物学、精准发酵、酶工程、细胞培养、替代蛋白、生物基材料与新型食品原料从实验室到量产、成本与商业化合作。发酵生产的具体原料（如某种氨基酸或蛋白）仍归对应原料类别；融资与并购归企业与市场。" },
  { key: "supply", tagColor: "wathet", label: "供应链与贸易", feedLabel: "供应链与贸易", section: "市场与供应链", blurb: "原料价格、产地、产能、关税、物流与可持续采购。", guide: "原料价格、产地天气与减产、采收与库存、产能与停产检修、进出口与关税、贸易壁垒与制裁、物流与船期、可持续采购与认证（RSPO、有机、雨林联盟等）。价格与数字必须来自原文并写明产地、规格与时间；企业自己的扩产计划归企业与市场。" },
  { key: "market", tagColor: "yellow", label: "企业与市场", feedLabel: "企业与市场", section: "市场与供应链", blurb: "原料企业的并购、融资、合作、财报、扩产与经营风险。", guide: "原料企业的并购、融资、合作与代理、财报与人事、新工厂与扩产计划、业务重组与关停。发布具体原料或配方仍归对应原料类别；展会现场发布归展会与活动。" },
  { key: "events", tagColor: "grey", label: "展会与活动", feedLabel: "展会与活动", section: "展会与活动", blurb: "全球原料与配料展会的日程、地点、展商与现场发布。", guide: "国际原料与配料展会的日程、地点、展商与现场发布（如 Fi Europe、Vitafoods、SupplySide、CPHI、in-cosmetics、IFEAT、WPC），以及行业会议、评奖与培训。只写展位和报名优惠的招商稿不算；展会上的具体原料发布仍可归对应原料类别。" },
] as const satisfies ReadonlyArray<{ key: string; tagColor: string; label: string; feedLabel?: string; section: string; blurb: string; guide: string; commentary?: true }>;

/**
 * 这个行业最受关注的一类发布（原料行业是新原料批准）：日报报头的“N 项新原料批准”、改分类后修订已出的报告都按它数。
 * category 是类别，tag 是标签，两者都对上才算；unit 接在数字后面。
 * 没有这样一类的行业设成 null，报头就不显示这个数。
 */
export const RELEASE: { category: string; tag: string; unit: string } | null = { category: "regulatory", tag: "新原料批准", unit: "项新原料批准" };

/** 周报月报的总述可以直接写、不必在报道里找到出处的行业通用词（小写）。站名会自动算进去。 */
export const PLAIN_TERMS: readonly string[] = ["api", "fda", "efsa", "ema", "gmp", "dmf", "cep", "inci", "gras", "usd", "eu"];

/**
 * 内容理解一步给每篇资料判的“内容类型”（写在 prompts/content-understanding.md 里，改了类型要同步改那份提示词）。
 * 评分提示词（prompts/selection-score.md）按类型给五个维度不同的权重。
 */
export const ITEM_TYPES = ["regulatory_update", "supply_event", "company_move", "ingredient_launch", "research_finding", "trade_show", "market_analysis"] as const;

// ── 标签词表 ────────────────────────────────────────────────────────────────────────────

/** 每篇资料的第一个标签必须是这些“分类标签”之一。 */
export const CATEGORY_TAGS = [
  "法规/批准", "供应/价格", "企业动态", "原料发布", "研究/临床", "展会/活动", "市场/趋势", "科普/解读", "观点",
  "其他",
] as const;

/** 可选的主题标签（原料品类、监管与贸易议题）。 */
export const TOPIC_TAGS = [
  "植物提取物", "中药材", "药食同源", "天然色素", "天然甜味剂", "精油", "香辛料", "天然香精", "合成香料",
  "防腐剂", "抗氧化剂", "乳化剂", "增稠剂", "甜味剂", "酶制剂", "益生菌", "益生元", "膳食纤维", "功能肽",
  "氨基酸", "维生素", "矿物质", "Omega-3", "胶原蛋白", "透明质酸", "类胡萝卜素", "防晒剂", "表面活性剂",
  "合成生物", "精准发酵", "替代蛋白", "原料药", "医药中间体", "药用辅料", "CDMO",
  "新原料批准", "价格行情", "关税/贸易", "产能扩张", "并购/融资", "展会",
] as const;

/**
 * 二级分类：每类下面的细分入口，key 出现在网址里（/category/<类别>/<key>），上线后不要再改。
 * 二级页就是“该类别 + 一个主题标签”的合集；label 与标签同名，改标签时同步改这里。
 */
export const SUBCATEGORIES: Readonly<Record<string, ReadonlyArray<{ key: string; label: string; tag: string }>>> = {
  regulatory: [
    { key: "approvals", label: "新原料批准", tag: "新原料批准" },
    { key: "excipients", label: "药用辅料", tag: "药用辅料" },
    { key: "trade", label: "关税/贸易", tag: "关税/贸易" },
    { key: "food-medicine", label: "药食同源", tag: "药食同源" },
  ],
  research: [
    { key: "botanical-extracts", label: "植物提取物", tag: "植物提取物" },
    { key: "probiotics", label: "益生菌", tag: "益生菌" },
    { key: "peptides", label: "功能肽", tag: "功能肽" },
    { key: "omega-3", label: "Omega-3", tag: "Omega-3" },
    { key: "collagen", label: "胶原蛋白", tag: "胶原蛋白" },
  ],
  natural: [
    { key: "botanical-extracts", label: "植物提取物", tag: "植物提取物" },
    { key: "tcm", label: "中药材", tag: "中药材" },
    { key: "food-medicine", label: "药食同源", tag: "药食同源" },
    { key: "natural-colorants", label: "天然色素", tag: "天然色素" },
    { key: "natural-sweeteners", label: "天然甜味剂", tag: "天然甜味剂" },
    { key: "essential-oils", label: "精油", tag: "精油" },
  ],
  flavors: [
    { key: "spices", label: "香辛料", tag: "香辛料" },
    { key: "natural-flavors", label: "天然香精", tag: "天然香精" },
    { key: "synthetic-flavors", label: "合成香料", tag: "合成香料" },
    { key: "essential-oils", label: "精油", tag: "精油" },
  ],
  "food-additives": [
    { key: "preservatives", label: "防腐剂", tag: "防腐剂" },
    { key: "antioxidants", label: "抗氧化剂", tag: "抗氧化剂" },
    { key: "emulsifiers", label: "乳化剂", tag: "乳化剂" },
    { key: "thickeners", label: "增稠剂", tag: "增稠剂" },
    { key: "sweeteners", label: "甜味剂", tag: "甜味剂" },
    { key: "enzymes", label: "酶制剂", tag: "酶制剂" },
  ],
  functional: [
    { key: "probiotics", label: "益生菌", tag: "益生菌" },
    { key: "prebiotics", label: "益生元", tag: "益生元" },
    { key: "fiber", label: "膳食纤维", tag: "膳食纤维" },
    { key: "peptides", label: "功能肽", tag: "功能肽" },
    { key: "amino-acids", label: "氨基酸", tag: "氨基酸" },
    { key: "vitamins", label: "维生素", tag: "维生素" },
    { key: "minerals", label: "矿物质", tag: "矿物质" },
    { key: "omega-3", label: "Omega-3", tag: "Omega-3" },
    { key: "collagen", label: "胶原蛋白", tag: "胶原蛋白" },
    { key: "hyaluronic-acid", label: "透明质酸", tag: "透明质酸" },
    { key: "carotenoids", label: "类胡萝卜素", tag: "类胡萝卜素" },
  ],
  cosmetic: [
    { key: "hyaluronic-acid", label: "透明质酸", tag: "透明质酸" },
    { key: "collagen", label: "胶原蛋白", tag: "胶原蛋白" },
    { key: "sunscreens", label: "防晒剂", tag: "防晒剂" },
    { key: "surfactants", label: "表面活性剂", tag: "表面活性剂" },
    { key: "botanical-extracts", label: "植物提取物", tag: "植物提取物" },
  ],
  pharma: [
    { key: "api", label: "原料药", tag: "原料药" },
    { key: "intermediates", label: "医药中间体", tag: "医药中间体" },
    { key: "excipients", label: "药用辅料", tag: "药用辅料" },
    { key: "cdmo", label: "CDMO", tag: "CDMO" },
  ],
  biotech: [
    { key: "synthetic-biology", label: "合成生物", tag: "合成生物" },
    { key: "precision-fermentation", label: "精准发酵", tag: "精准发酵" },
    { key: "alternative-protein", label: "替代蛋白", tag: "替代蛋白" },
  ],
  supply: [
    { key: "prices", label: "价格行情", tag: "价格行情" },
    { key: "trade", label: "关税/贸易", tag: "关税/贸易" },
    { key: "capacity", label: "产能扩张", tag: "产能扩张" },
  ],
  market: [
    { key: "mna", label: "并购/融资", tag: "并购/融资" },
    { key: "capacity", label: "产能扩张", tag: "产能扩张" },
  ],
  events: [
    { key: "trade-shows", label: "展会", tag: "展会" },
  ],
};

/** 可选的实体标签（公司、机构、平台）。 */export const ENTITY_TAGS = [
  "ADM", "Cargill", "DSM-Firmenich", "Givaudan", "IFF", "Symrise", "BASF", "Croda", "Lonza", "Evonik",
  "Ingredion", "Tate & Lyle", "Kerry", "Roquette", "BENEO", "Novonesis", "Indena", "Sabinsa", "Martin Bauer", "Kalsec",
] as const;

/** 模型常写的近义词，统一成词表里的写法。 */
export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  法规: "法规/批准", 监管: "法规/批准", 政策: "法规/批准", 批准: "法规/批准", 审批: "法规/批准", 备案: "法规/批准",
  标准: "法规/批准", 合规: "法规/批准", 召回: "法规/批准", 安全性: "法规/批准", 安全性评价: "法规/批准",
  价格: "价格行情", 行情: "价格行情", 涨价: "价格行情", 跌价: "价格行情", 报价: "价格行情", 成本: "价格行情",
  供应: "价格行情", 短缺: "价格行情", 减产: "价格行情", 库存: "价格行情",
  关税: "关税/贸易", 贸易: "关税/贸易", 进出口: "关税/贸易", 出口: "关税/贸易", 进口: "关税/贸易", 制裁: "关税/贸易",
  产能: "产能扩张", 扩产: "产能扩张", 新工厂: "产能扩张", 工厂: "产能扩张", 停产: "产能扩张",
  并购: "并购/融资", 收购: "并购/融资", 融资: "并购/融资", 投资: "并购/融资", 重组: "并购/融资",
  展会: "展会", 展览: "展会", 博览会: "展会", 会议: "展会", 论坛: "展会", 活动: "展会",
  企业: "企业动态", 公司: "企业动态", 合作: "企业动态", 人事: "企业动态", 财报: "企业动态", 业绩: "企业动态",
  研究: "研究/临床", 论文: "研究/临床", 临床: "研究/临床", 试验: "研究/临床", 功效: "研究/临床", 毒理: "研究/临床",
  提取物: "植物提取物", 植物提取: "植物提取物", 标准化提取物: "植物提取物", 草本: "植物提取物",
  中药: "中药材", 药材: "中药材", 中草药: "中药材", 药食同源: "药食同源",
  色素: "天然色素", 着色剂: "天然色素", 甜味剂: "甜味剂", 代糖: "甜味剂",
  精油: "精油", 香料: "香辛料", 香精: "天然香精", 风味: "天然香精",
  防腐: "防腐剂", 抗氧化: "抗氧化剂", 乳化: "乳化剂", 增稠: "增稠剂", 胶体: "增稠剂",
  酶: "酶制剂", 益生菌: "益生菌", 益生元: "益生元", 后生元: "益生元", 纤维: "膳食纤维",
  肽: "功能肽", 多肽: "功能肽", 蛋白: "替代蛋白", 植物蛋白: "替代蛋白", 替代蛋白: "替代蛋白",
  氨基酸: "氨基酸", 维生素: "维生素", 矿物质: "矿物质",
  "omega-3": "Omega-3", "omega 3": "Omega-3", 鱼油: "Omega-3", 磷虾油: "Omega-3",
  胶原: "胶原蛋白", "胶原蛋白肽": "胶原蛋白", 玻尿酸: "透明质酸", 透明质酸钠: "透明质酸",
  类胡萝卜素: "类胡萝卜素", 叶黄素: "类胡萝卜素", 虾青素: "类胡萝卜素", 番茄红素: "类胡萝卜素", "β-胡萝卜素": "类胡萝卜素",
  防晒: "防晒剂", 紫外线吸收剂: "防晒剂", 表面活性剂: "表面活性剂", 表活: "表面活性剂", 乳化剂: "乳化剂",
  合成生物学: "合成生物", 发酵: "精准发酵", 精密发酵: "精准发酵", 细胞培养: "替代蛋白",
  原料药: "原料药", api: "原料药", 中间体: "医药中间体", 辅料: "药用辅料", cdmo: "CDMO", cmo: "CDMO",
  新食品原料: "新原料批准", 新原料: "新原料批准", 新品种: "新原料批准", 新型食品: "新原料批准",
  趋势: "市场/趋势", 市场: "市场/趋势", 分析: "市场/趋势", 报告: "市场/趋势", 预测: "市场/趋势",
  科普: "科普/解读", 解读: "科普/解读", 指南: "科普/解读", 教程: "科普/解读",
  观点: "观点", 评论: "观点", 访谈: "观点",
  嘉吉: "Cargill", 帝斯曼: "DSM-Firmenich", "帝斯曼-芬美意": "DSM-Firmenich", 芬美意: "DSM-Firmenich",
  奇华顿: "Givaudan", 巴斯夫: "BASF", 禾大: "Croda", 龙沙: "Lonza", 赢创: "Evonik", 宜瑞安: "Ingredion",
  泰莱: "Tate & Lyle", 凯爱瑞: "Kerry", 罗盖特: "Roquette", 诺和新元: "Novonesis", 诺维信: "Novonesis",
};

// ── 公司与主体 ──────────────────────────────────────────────────────────────────────────

/**
 * 公司主题：id → 显示名、卡片上显示的标签（null 表示只用 entity:<id> 归类）、别名。
 * aliases 给结构抽取模型看；orgNames 是这家公司发消息时开头用的组织名（公司、实验室、团队），
 * 在它自己的主题页上读者知道说的是谁，可以省去；otherNames 是公司的其他称呼（官方账号名、子品牌）。
 * 所有这些名字都用来认出说的是哪家公司，比如把事实的主体对到发布方。
 */
export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[]; orgNames?: string[]; otherNames?: string[] }> = {
  adm: { name: "ADM", displayTag: "ADM", aliases: ["ADM", "Archer Daniels Midland"], orgNames: ["ADM"], otherNames: ["ADM Nutrition"] },
  cargill: { name: "Cargill", displayTag: "Cargill", aliases: ["Cargill", "嘉吉"], orgNames: ["Cargill", "嘉吉"] },
  "dsm-firmenich": { name: "DSM-Firmenich", displayTag: "DSM-Firmenich", aliases: ["DSM-Firmenich", "DSM Firmenich", "帝斯曼-芬美意", "帝斯曼芬美意", "Firmenich", "芬美意"], orgNames: ["DSM-Firmenich", "dsm-firmenich", "帝斯曼-芬美意"], otherNames: ["DSM Nutritional Products"] },
  givaudan: { name: "Givaudan", displayTag: "Givaudan", aliases: ["Givaudan", "奇华顿"], orgNames: ["Givaudan", "奇华顿"], otherNames: ["Givaudan Active Beauty"] },
  iff: { name: "IFF", displayTag: "IFF", aliases: ["IFF", "International Flavors & Fragrances", "国际香精香料"], orgNames: ["IFF"], otherNames: ["IFF Health & Biosciences", "IFF Nourish"] },
  symrise: { name: "Symrise", displayTag: "Symrise", aliases: ["Symrise", "德之馨"], orgNames: ["Symrise", "德之馨"] },
  basf: { name: "BASF", displayTag: "BASF", aliases: ["BASF", "巴斯夫"], orgNames: ["BASF", "巴斯夫"], otherNames: ["BASF Nutrition & Health", "BASF Pharma Solutions"] },
  croda: { name: "Croda", displayTag: "Croda", aliases: ["Croda", "禾大"], orgNames: ["Croda", "禾大"], otherNames: ["Croda Beauty", "Sederma"] },
  lonza: { name: "Lonza", displayTag: "Lonza", aliases: ["Lonza", "龙沙"], orgNames: ["Lonza", "龙沙"], otherNames: ["Capsugel"] },
  evonik: { name: "Evonik", displayTag: null, aliases: ["Evonik", "赢创"], orgNames: ["Evonik", "赢创"], otherNames: ["Evonik Health Care"] },
  ingredion: { name: "Ingredion", displayTag: null, aliases: ["Ingredion", "宜瑞安"], orgNames: ["Ingredion", "宜瑞安"] },
  "tate-lyle": { name: "Tate & Lyle", displayTag: null, aliases: ["Tate & Lyle", "Tate and Lyle", "泰莱"], orgNames: ["Tate & Lyle", "泰莱"] },
  kerry: { name: "Kerry", displayTag: "Kerry", aliases: ["Kerry", "Kerry Group", "凯爱瑞"], orgNames: ["Kerry", "Kerry Group", "凯爱瑞"] },
  roquette: { name: "Roquette", displayTag: null, aliases: ["Roquette", "罗盖特"], orgNames: ["Roquette", "罗盖特"] },
  beneo: { name: "BENEO", displayTag: "BENEO", aliases: ["BENEO", "Beneo"], orgNames: ["BENEO"] },
  novonesis: { name: "Novonesis", displayTag: null, aliases: ["Novonesis", "诺和新元", "诺维信", "Novozymes"], orgNames: ["Novonesis", "诺和新元", "Novozymes", "诺维信"] },
  indena: { name: "Indena", displayTag: null, aliases: ["Indena", "意迪那"], orgNames: ["Indena", "意迪那"] },
  sabinsa: { name: "Sabinsa", displayTag: null, aliases: ["Sabinsa"], orgNames: ["Sabinsa"] },
  "martin-bauer": { name: "Martin Bauer", displayTag: null, aliases: ["Martin Bauer", "Martin Bauer Group"], orgNames: ["Martin Bauer", "Martin Bauer Group"] },
  kalsec: { name: "Kalsec", displayTag: null, aliases: ["Kalsec"], orgNames: ["Kalsec"] },
};

/**
 * 身份词典：摘要和标题里出现的公司，必须在原文里也出现过，否则退回原标题、丢掉摘要（防止模型张冠李戴）。
 * 行业没有这个问题时可以留空数组。
 */
export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = [
  { id: "adm", name: "ADM", patterns: [/\bADM\b|Archer\s+Daniels/i] },
  { id: "cargill", name: "Cargill", patterns: [/cargill|嘉吉/i] },
  { id: "dsm-firmenich", name: "DSM-Firmenich", patterns: [/dsm[\s-]?firmenich|firmenich|帝斯曼|芬美意/i, /\bDSM\b/i] },
  { id: "givaudan", name: "Givaudan", patterns: [/givaudan|奇华顿/i] },
  { id: "iff", name: "IFF", patterns: [/\bIFF\b|International\s+Flavors/i] },
  { id: "symrise", name: "Symrise", patterns: [/symrise|德之馨/i] },
  { id: "basf", name: "BASF", patterns: [/\bBASF\b|巴斯夫/i] },
  { id: "croda", name: "Croda", patterns: [/croda|禾大|\bSederma\b/i] },
  { id: "lonza", name: "Lonza", patterns: [/lonza|龙沙|\bCapsugel\b/i] },
  { id: "novonesis", name: "Novonesis", patterns: [/novonesis|novozymes|诺和新元|诺维信/i] },
];

/** 这些域名上的文章，发布方就是对应的公司（托管平台不算）。 */
export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  { entityId: "adm", domains: ["adm.com"] },
  { entityId: "cargill", domains: ["cargill.com"] },
  { entityId: "dsm-firmenich", domains: ["dsm-firmenich.com"] },
  { entityId: "givaudan", domains: ["givaudan.com"] },
  { entityId: "iff", domains: ["iff.com"] },
  { entityId: "symrise", domains: ["symrise.com"] },
  { entityId: "basf", domains: ["basf.com"] },
  { entityId: "croda", domains: ["croda.com"] },
  { entityId: "lonza", domains: ["lonza.com"] },
  { entityId: "ingredion", domains: ["ingredion.com"] },
  { entityId: "tate-lyle", domains: ["tateandlyle.com"] },
  { entityId: "kerry", domains: ["kerry.com"] },
  { entityId: "roquette", domains: ["roquette.com"] },
  { entityId: "beneo", domains: ["beneo.com"] },
  { entityId: "novonesis", domains: ["novonesis.com"] },
  { entityId: "indena", domains: ["indena.com"] },
  { entityId: "sabinsa", domains: ["sabinsa.com"] },
  { entityId: "martin-bauer", domains: ["martin-bauer-group.com"] },
  { entityId: "kalsec", domains: ["kalsec.com"] },
];

/** 原文里的这些写法也算提到了对应公司。 */
export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [];
