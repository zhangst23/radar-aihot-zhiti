# 项目改造任务：将 AIHOT 改造成全球原料行业热点情报站

请先完整阅读项目中的 `AGENTS.md` 和 `docs/customize.md`，理解项目架构、现有功能、数据采集机制、内容处理流程、页面结构、配置方式及开发规范。

在不破坏原有项目架构和核心功能的前提下，将当前网站改造成一个专业的：

**Global Ingredients Intelligence Radar（全球原料产业情报雷达）**

网站定位：

面向全球食品原料、天然植物原料、医药原料、化妆品原料、功能性成分及原料供应链从业者，提供全球行业新闻、市场趋势、产品创新、法规政策、供应链变化、企业动态和国际展会情报。

不要仅仅替换网站名称、Logo 和分类标签。需要围绕原料行业重新设计信息分类、信源体系、热点识别规则、内容标签、信息权重和首页信息架构，使网站真正成为一个可以长期使用的 B2B 原料行业情报平台。

---

# 一、网站定位与目标用户

## 1.1 核心定位

Global Ingredients Intelligence Radar

副标题：

Global Intelligence for Ingredients, APIs & Supply Chains.

中文定位：

全球原料行业情报与市场趋势监测平台。

## 1.2 目标用户

重点服务以下群体：

1. 食品原料及食品添加剂贸易商。
2. 天然植物提取物供应商。
3. 中药材、药食同源原料供应商。
4. 香料、香精及精油企业。
5. 膳食补充剂原料企业。
6. 功能性食品及营养健康企业。
7. 化妆品原料及活性成分供应商。
8. 制药企业及 API 原料药供应商。
9. 原料进口商、采购商和国际贸易商。
10. 原料行业市场研究人员及产品开发人员。

## 1.3 核心信息价值

用户打开网站后，应该快速了解：

- 最近有哪些值得关注的新原料？
- 哪些天然原料和功能性成分正在成为市场热点？
- 哪些食品添加剂、植物提取物和 API 出现新趋势？
- 哪些国家和地区的原料供应发生变化？
- 哪些原料价格出现明显上涨或下跌？
- 哪些国家出台了影响原料进出口的新法规？
- 哪些原料获得了新的应用批准或法规许可？
- 哪些原料企业发布了新品、扩产、收购或合作消息？
- CPHI、Vitafoods、in-cosmetics 等国际展会有哪些值得关注的动态？
- 哪些原料可能成为未来 6～12 个月的市场机会？

---

# 二、建立原料行业完整分类体系

必须建立多层级行业分类，避免简单地把所有内容混在一个新闻列表里。

建议采用一级分类 + 二级分类 + 三级标签的结构。

## 2.1 天然原料 Natural Ingredients

覆盖天然来源的植物、动物、微生物及矿物原料。

二级分类：

- 植物提取物 Plant Extracts
- 草本植物 Herbal Ingredients
- 中药材 Traditional Chinese Medicinal Materials
- 药食同源原料 Food-Medicine Homologous Ingredients
- 天然植物粉末 Botanical Powders
- 水果及蔬菜原料 Fruit & Vegetable Ingredients
- 食用菌及蘑菇 Mushroom Ingredients
- 海洋生物原料 Marine Ingredients
- 动物来源原料 Animal-derived Ingredients
- 天然色素 Natural Colors
- 天然抗氧化剂 Natural Antioxidants
- 天然甜味剂 Natural Sweeteners
- 天然防腐剂 Natural Preservatives
- 植物油及天然油脂 Vegetable Oils & Natural Lipids
- 天然树脂、胶及多糖 Natural Gums & Polysaccharides

重点关注：

姜黄、姜黄素、人参、黄芪、灵芝、白藜芦醇、槲皮素、绿茶提取物、葡萄籽提取物、接骨木莓、乳蓟、Ashwagandha、Moringa、Berberine、Lion's Mane 等。

注意区分天然原料、植物提取物、纯化单体和合成成分，不要混为一谈。

## 2.2 药材及传统草本原料 Herbal & Medicinal Materials

二级分类：

- 中药材 Chinese Medicinal Materials
- 中药饮片 Chinese Herbal Slices
- 药食同源 Medicinal and Edible Materials
- 印度阿育吠陀原料 Ayurvedic Ingredients
- 印度草本原料 Indian Botanicals
- 欧洲药用植物 European Medicinal Plants
- 日本汉方原料 Kampo Ingredients
- 东南亚传统草本 Southeast Asian Botanicals
- 药用植物提取物 Medicinal Plant Extracts
- 标准化草本提取物 Standardized Herbal Extracts

重点关注：

- 药典标准及版本变化。
- 中药材种植和产地变化。
- 产地天气、减产、采收季节。
- 中药材价格波动。
- 农残、重金属、真菌毒素及污染物。
- 濒危植物及野生采集限制。
- CITES 相关管制。
- 草本原料国际贸易政策。
- 药食同源目录及应用限制变化。

特别关注中国、印度、东南亚、欧洲等主要草本原料产区。

## 2.3 香料及香精原料 Flavors & Fragrances

二级分类：

- 天然香料 Natural Spices
- 香辛料 Spice Ingredients
- 精油 Essential Oils
- 芳香植物 Aromatic Botanicals
- 天然香精 Natural Flavors
- 合成香料 Synthetic Aroma Chemicals
- 香精香料中间体 Fragrance Intermediates
- 食品风味原料 Food Flavor Ingredients
- 化妆品香料 Cosmetic Fragrance Ingredients
- 植物芳香提取物 Aromatic Extracts

重点关注：

- 肉桂、胡椒、姜、丁香、豆蔻、香草、藏红花。
- 薄荷油、薰衣草油、柑橘精油、茶树油。
- 香兰素、乙基麦芽酚、柠檬烯、芳樟醇等。
- 天然与合成香料的替代趋势。
- IFRA 标准及修订。
- 香料原料价格与产区变化。
- 食品及化妆品香料法规。
- 天然香料供应链和可持续采购。

## 2.4 食品添加剂 Food Additives

二级分类：

- 防腐剂 Preservatives
- 抗氧化剂 Antioxidants
- 甜味剂 Sweeteners
- 增稠剂 Thickeners
- 稳定剂 Stabilizers
- 乳化剂 Emulsifiers
- 酸度调节剂 Acidity Regulators
- 食用色素 Food Colors
- 增味剂 Flavor Enhancers
- 抗结剂 Anti-caking Agents
- 膨松剂 Raising Agents
- 酶制剂 Food Enzymes
- 载体及辅料 Carriers & Excipients
- 胶体及亲水胶体 Hydrocolloids
- 功能性糖醇 Polyols
- 淀粉及改性淀粉 Starches & Modified Starches

重点关注：

- 新型食品添加剂批准。
- FDA、EFSA、GB 2760、JECFA、Codex 等法规变化。
- 食品添加剂禁用、限量及使用范围调整。
- 天然添加剂替代合成添加剂。
- Clean Label 趋势。
- 乳化、稳定、保鲜技术创新。
- 食品酶制剂及发酵技术。
- 食品添加剂供应链变化。

## 2.5 功能性成分 Functional Ingredients

二级分类：

- 功能性蛋白 Functional Proteins
- 肽类 Peptides
- 氨基酸 Amino Acids
- 益生菌 Probiotics
- 益生元 Prebiotics
- 后生元 Postbiotics
- 膳食纤维 Dietary Fibers
- 功能性多糖 Functional Polysaccharides
- 植物活性成分 Phytochemicals
- 多酚 Polyphenols
- 黄酮 Flavonoids
- 类胡萝卜素 Carotenoids
- Omega 脂肪酸 Omega Fatty Acids
- 维生素 Vitamins
- 矿物质 Minerals
- 胶原蛋白 Collagen
- 功能性糖类 Functional Carbohydrates
- 核苷酸 Nucleotides
- 酶及生物活性成分 Enzymes & Bioactive Compounds
- 细胞培养及发酵来源成分 Fermentation-derived Ingredients

重点关注：

- 新功能性成分研究。
- 人体临床研究和科学证据。
- 新型益生菌菌株。
- 合成生物学生产原料。
- 精准发酵和生物制造。
- 功能性成分商业化。
- 新应用场景及配方创新。
- 新食品原料批准。
- 膳食补充剂市场趋势。

特别关注具有明确商业化潜力、研究进展和法规变化的原料。

## 2.6 化妆品原料 Cosmetic Ingredients

二级分类：

- 美白成分 Skin Whitening Ingredients
- 抗衰老成分 Anti-aging Ingredients
- 保湿成分 Moisturizing Ingredients
- 修护成分 Skin Barrier Repair Ingredients
- 抗氧化成分 Antioxidants
- 防晒剂 UV Filters
- 表面活性剂 Surfactants
- 乳化剂 Emulsifiers
- 防腐剂 Preservatives
- 增稠剂 Thickeners
- 活性肽 Cosmetic Peptides
- 植物提取物 Botanical Extracts
- 天然油脂 Natural Oils
- 精油 Essential Oils
- 维生素及衍生物 Vitamins & Derivatives
- 神经酰胺 Ceramides
- 透明质酸 Hyaluronic Acid
- 胶原蛋白 Collagen
- 生物发酵成分 Bio-fermented Ingredients
- 化妆品原料溶剂 Solvents
- 化妆品功能性聚合物 Functional Polymers
- 防晒及紫外线吸收剂 UV Absorbers

重点关注：

- INCI 新成分。
- 中国化妆品新原料注册备案。
- EU CosIng 和欧盟化妆品法规。
- MoCRA 美国化妆品法规。
- SCCS 安全评估意见。
- 化妆品禁限用成分调整。
- 功效成分研究。
- 生物发酵及绿色化学。
- 替代硅油、微塑料及传统防腐剂的新原料。
- 国际化妆品品牌新品及其成分创新。

## 2.7 原料药及医药中间体 APIs & Pharmaceutical Ingredients

二级分类：

- 原料药 Active Pharmaceutical Ingredients (APIs)
- 化学合成原料药 Synthetic APIs
- 生物药原料 Biopharmaceutical Ingredients
- 高活性原料药 HPAPIs
- 多肽原料药 Peptide APIs
- 核酸药物原料 Oligonucleotide Ingredients
- 维生素原料 Pharmaceutical Vitamins
- 医药中间体 Pharmaceutical Intermediates
- 药用辅料 Pharmaceutical Excipients
- 生物制剂原料 Biologics Ingredients
- 发酵原料 Fermentation-derived Pharmaceutical Ingredients
- 细胞及基因治疗原料 Cell & Gene Therapy Materials
- ADC 相关原料 ADC-related Materials
- 药物递送材料 Drug Delivery Materials
- CDMO/CMO 相关产业链 CDMO & CMO

重点关注：

- FDA、EMA、NMPA 等药品监管机构动态。
- API DMF、CEP、GMP 相关信息。
- EDQM 欧洲药典及 USP、EP、ChP 药典变化。
- API 新增产能和供应商变更。
- 原料药短缺及供应风险。
- 药品召回和质量警告。
- FDA Warning Letters。
- GMP 检查结果及监管措施。
- 医药中间体技术创新。
- 生物药、GLP-1、多肽及核酸药物产业链。
- CDMO 企业并购、扩产和新项目。

特别注意：必须区分 API、药用辅料、医药中间体、制剂和生物制品，不允许错误归类。

## 2.8 生物制造及新型原料 Biotechnology & Novel Ingredients

二级分类：

- 合成生物学 Synthetic Biology
- 精准发酵 Precision Fermentation
- 工业生物技术 Industrial Biotechnology
- 酶工程 Enzyme Engineering
- 微生物发酵 Microbial Fermentation
- 细胞培养 Cell Cultivation
- 替代蛋白 Alternative Proteins
- 生物基材料 Bio-based Materials
- 新型食品原料 Novel Food Ingredients
- 细胞培养食品 Cultivated Food

重点关注新技术从实验室走向工业化的进展、量产能力、成本变化及商业化合作。

## 2.9 原料产业链及贸易 Supply Chain & Trade

二级分类：

- 原料价格 Commodity & Ingredient Prices
- 国际贸易 International Trade
- 原料进出口 Import & Export
- 供应链 Supply Chain
- 产地及种植 Origin & Cultivation
- 工厂扩建 Manufacturing Expansion
- 企业并购 M&A
- 企业投资 Investment
- 原料短缺 Supply Shortage
- 物流与运输 Logistics
- 关税及贸易壁垒 Tariffs & Trade Barriers
- 可持续采购 Sustainable Sourcing
- 质量与认证 Quality & Certification

---

# 三、建立国际展会及行业组织监测体系

这是本项目的重要功能，必须独立建立展会情报分类。

重点监测全球食品、营养、药品、化妆品、天然原料领域的国际展会。

## 3.1 制药及 API 展会

- CPHI Worldwide
- CPHI China
- CPHI India
- CPHI Japan
- CPHI North America
- ICSE
- PMEC
- DCAT Week
- BIO International Convention
- BIO-Europe

关注：

- 展会日期及举办地点。
- 展商名单和新增参展企业。
- API 企业动态。
- CDMO/CMO 企业动态。
- 新产品和新技术。
- 企业合作与投资。
- 展会现场重要行业新闻。

## 3.2 食品原料及营养健康展会

- Vitafoods Europe
- Vitafoods Asia
- SupplySide Global
- Fi Europe
- Fi Asia
- Fi China
- IFT FIRST
- Gulfood Manufacturing
- Food Ingredients China
- Natural Products Expo West
- Natural Products Expo East
- Healthplex Expo

关注：

- 新型食品原料。
- 功能性食品配料。
- 膳食补充剂原料。
- 益生菌、益生元及后生元。
- 植物提取物。
- 蛋白质及功能性糖类。
- 新产品和应用技术。

## 3.3 化妆品原料展会

- in-cosmetics Global
- in-cosmetics Asia
- in-cosmetics Korea
- China Beauty Expo (CBE)
- PCHi
- NYSCC Suppliers' Day
- SEPAWA Congress
- Cosmoprof Worldwide Bologna
- Beautyworld Middle East

关注：

- 新化妆品原料。
- 新 INCI 成分。
- 活性成分技术。
- 植物提取物及天然原料。
- 防腐剂和表面活性剂。
- 配方创新。
- 原料供应商新品。
- 展商及供应商变化。

## 3.4 香料及天然原料展会

- WPC（World Perfumery Congress）
- IFEAT International Conference
- FI Europe
- Natural Products Expo
- BIOFACH
- 各国天然产品及植物提取物专业展会。

注意：WPC 应按 World Perfumery Congress 进行监测，避免与其他同名缩写活动混淆。

## 3.5 展会情报要求

每条展会信息应尽可能包含：

- Event Name
- Event Category
- Event Date
- Location
- Official Website
- Exhibitor Information
- Product Highlights
- Important Companies
- Industry Trends
- Related Ingredients

展会日期、地点和举办状态必须核实官方来源。

必须支持按展会名称、行业分类、国家、月份筛选。

---

# 四、全球行业信息信源体系

不要仅依赖普通新闻网站和 Google News。

需要建立专业信源库，并尽可能利用 RSS、官方 API、网站公开新闻页面、行业媒体和公开公告进行采集。

信源优先级分为五级。

## 4.1 S 级：政府监管及官方机构

食品：

- FDA
- EFSA
- USDA
- FSANZ
- Health Canada
- FSA UK
- JECFA
- Codex Alimentarius
- 中国国家市场监督管理总局 SAMR
- 中国国家卫生健康委员会 NHC
- 中国海关总署 GACC

药品：

- FDA
- EMA
- EDQM
- USP
- WHO
- PMDA Japan
- NMPA China
- MHRA UK
- CDSCO India

化妆品：

- European Commission
- CosIng
- SCCS
- FDA Cosmetics
- China NMPA
- ASEAN Cosmetic Committee
- Health Canada Cosmetics

其他：

- CITES
- FAO
- WHO
- OECD
- WTO
- UN Comtrade
- ITC Trade Map

## 4.2 A 级：国际专业行业媒体

食品及营养：

- FoodNavigator
- NutraIngredients
- Food Ingredients First
- FoodBev Media
- Food Business News
- New Hope Network
- Nutrition Insight
- Nutraceutical Business Review
- The World of Food Ingredients

制药及 API：

- Pharmaceutical Technology
- Fierce Pharma
- Pharmaceutical Online
- PharmaCompass
- CPHI Online
- Contract Pharma
- BioPharm International
- InPharma
- PharmaSource

化妆品：

- CosmeticsDesign
- Personal Care Insights
- Cosmetics Business
- Happi
- Premium Beauty News
- Global Cosmetic Industry
- Chemical Watch

香料及天然原料：

- Perfumer & Flavorist
- Cosmetics & Toiletries
- Essential Oils Magazine
- The Aromatherapy Trade Council
- IFEAT
- International Federation of Essential Oils and Aroma Trades

农业及天然原料：

- FeedNavigator（仅关注与原料相关内容）
- AgFunderNews
- AgroPages
- FreshPlaza
- FoodIngredientsFirst

## 4.3 B 级：行业协会及标准组织

重点关注：

- IFEAT
- IFRA
- IOFI
- IFT
- ISAPP
- IPA
- EHPM
- USP
- IPEC
- PQRI
- Personal Care Products Council
- European Federation of Pharmaceutical Industries and Associations
- China Food Additives & Ingredients Association
- 中国医药保健品进出口商会
- 中国香料香精化妆品工业协会

## 4.4 C 级：企业官方信息

关注全球头部原料企业的新闻、产品发布、投资和产能变化。

食品及功能性原料：

- ADM
- Cargill
- Ingredion
- Tate & Lyle
- DSM-Firmenich
- Kerry
- Roquette
- BENEO
- Givaudan
- IFF
- Symrise
- Glanbia Nutritionals
- AAK
- Novonesis

制药及 API：

- Lonza
- BASF Pharma Solutions
- Evonik
- Siegfried
- Cambrex
- WuXi AppTec
- WuXi STA
- Porton Pharma Solutions
- Divi's Laboratories
- Aurobindo Pharma
- Hetero Labs
- Dr. Reddy's Laboratories

化妆品原料：

- BASF
- Croda
- Lubrizol
- Clariant
- Evonik
- Ashland
- Seppic
- Solvay
- Givaudan Active Beauty
- Symrise
- dsm-firmenich Beauty & Care

天然原料及植物提取物：

- Indena
- Naturex / Givaudan
- Sabinsa
- Martin Bauer
- Nexira
- Euromed
- Layn Natural Ingredients
- Synthite Industries
- Kalsec

企业名单应作为初始信源，支持后续动态添加，不要硬编码成不可修改的固定列表。

## 4.5 D 级：市场及社区信息

辅助发现潜在热点：

- Google Trends
- Reddit
- LinkedIn
- X
- YouTube
- 行业专业论坛
- 企业公开招聘信息
- 公开招标信息
- 展会展商目录
- 公开进出口数据
- 专利数据库

社区信息主要用于热点发现，不应直接作为法规、价格或质量事实的最终依据。

---

# 五、热点识别与重要性评分

这是整个网站最重要的部分。

不能把所有新闻按照发布时间简单排列。

需要建立行业相关性、商业价值、信息可靠性、影响范围、时效性等综合评分。

建议评分范围为 0～100 分。

## 5.1 核心评分维度

| 维度 | 分值 | 评估标准 |
|---|---:|---|
| 行业相关性 | 20 | 是否与原料、配方、供应链直接相关 |
| 商业价值 | 20 | 是否影响采购、销售、成本及市场机会 |
| 影响范围 | 15 | 是否影响多个国家、行业或大量企业 |
| 信息可靠性 | 15 | 是否来自政府、协会、企业官方或可信媒体 |
| 创新程度 | 10 | 是否涉及新技术、新原料、新应用 |
| 时效性 | 10 | 是否为近期重要消息 |
| 供应链影响 | 10 | 是否影响供应、产能、价格、贸易 |

## 5.2 高优先级热点

以下事件应优先推送：

1. 重要原料价格大幅上涨或下跌。
2. 主要原料产地发生灾害、减产或供应中断。
3. FDA、EFSA、EMA、NMPA 等发布重要法规变化。
4. 某种原料获得新食品原料批准或新的应用许可。
5. 重要成分被禁用、限制使用或发布安全警告。
6. 大型原料企业宣布扩产、停产、收购或重大投资。
7. 新型功能性成分获得关键研究进展或商业化突破。
8. API 供应短缺、召回、GMP 警告或重要监管事件。
9. 国际贸易关税、出口管制或贸易政策发生重大变化。
10. 全球大型原料展会发布具有产业影响力的新产品和技术。
11. 新型植物提取物、天然添加剂或生物制造原料进入商业化阶段。
12. 重要供应商发生质量、产能或经营风险。

## 5.3 低优先级内容

以下内容应降低评分：

- 普通企业宣传软文。
- 没有实质内容的品牌营销。
- 无明确来源的市场传闻。
- 没有新信息的重复新闻。
- 与原料行业无直接关系的宏观经济新闻。
- 单纯介绍某个产品基本知识的文章。
- 无实际产业影响的普通学术论文。
- 纯粹的招聘信息。
- 只有展会宣传，没有具体行业价值的广告。

注意：学术研究、企业宣传及展会内容并非一律排除。如果具有明确的商业化价值或行业创新意义，仍然可以收录。

## 5.4 热点等级

- 90～100：重大产业事件
- 80～89：重要行业热点
- 65～79：值得关注
- 50～64：普通行业动态
- 50 以下：默认不进入首页热点

评分只是排序参考，不能代替事实核实。

重大法规、安全警告、供应链风险等事件应允许人工提升优先级。

## 5.5 热点去重

必须解决：

- 同一事件被多个媒体转载。
- 不同语言报道同一个事件。
- 同一企业重复发布新闻。
- 同一展会被不同网站重复报道。
- 新闻标题不同但核心事件相同。

建议建立事件级去重：

同一事件保留一个主要热点条目，将其他报道作为关联来源。

同时保存：

- Original Source
- Related Sources
- First Published At
- Last Updated At
- Event Date
- Confidence Level

不要简单地因为 URL 不同就认为是不同事件。

---

# 六、原料行业关键词雷达

建立多语言关键词体系。

## 6.1 通用行业关键词

Ingredients, Raw Materials, Ingredient Supplier, Bulk Ingredients, Botanical Extracts, Plant Extracts, Active Ingredients, Functional Ingredients, Natural Ingredients, Pharmaceutical Ingredients, Cosmetic Ingredients, Food Additives, Nutraceutical Ingredients, APIs, Excipients, Intermediates, Specialty Chemicals.

## 6.2 商业采购关键词

Manufacturer, Supplier, Distributor, Wholesale, Bulk Supply, Production Capacity, MOQ, Lead Time, Supply Shortage, Price Increase, Price Decrease, New Factory, Expansion, Raw Material Sourcing, Contract Manufacturing, Custom Manufacturing.

## 6.3 创新关键词

Novel Ingredient, New Ingredient, New Product Launch, Clinical Study, Human Trial, Patented Ingredient, New Application, Fermentation Technology, Precision Fermentation, Biotechnology, Bioactive Compounds, Sustainable Ingredients.

## 6.4 法规关键词

FDA Approval, FDA GRAS, GRAS Notice, EFSA Opinion, Novel Food Authorization, NMPA Registration, INCI, DMF, CEP, GMP, Pharmacopoeia, REACH, MoCRA, IFRA Standards, Regulatory Update, Safety Assessment, Banned Ingredients, Restricted Substances.

注意：FDA GRAS Notice、FDA Drug Approval、FDA Registration 等概念必须准确区分，不能将 FDA 注册描述为 FDA 批准。

## 6.5 多语言监测

至少覆盖：

- 英语
- 中文
- 日语
- 韩语
- 印地语（视信源可用性）
- 德语
- 法语
- 西班牙语

优先保证英语和中文信息质量，再逐步扩展其他语言。

原始标题、原文链接和原始发布日期必须保留。

---

# 七、首页信息架构设计

首页应该体现专业 B2B 情报站，而不是普通科技新闻网站。

建议设计以下模块。

## 7.1 顶部导航

- Home
- Ingredients
- Food Additives
- Functional Ingredients
- Herbal & Botanical
- Flavors & Fragrances
- Cosmetic Ingredients
- APIs & Pharma
- Biotechnology
- Supply Chain
- Regulations
- Trade Shows
- Companies

支持行业分类下拉菜单。

## 7.2 首页核心模块

### 模块一：Global Industry Pulse

展示全球原料行业最新的重要动态：

- 今日热点数量。
- 本周热点数量。
- 重大法规变化。
- 原料供应风险。
- 新品发布。
- 国际展会动态。

所有统计数据必须基于真实采集的数据，不允许展示虚构数字。

### 模块二：Breaking Industry News

重要行业新闻。

每条新闻显示：

- 标题
- 摘要
- 一级行业分类
- 二级分类
- 涉及原料
- 涉及企业
- 涉及国家
- 发布时间
- 来源
- 热度评分
- 重要性等级

### 模块三：Trending Ingredients

近期关注度增长较快的原料。

例如：

- Berberine
- Curcumin
- Astaxanthin
- Collagen Peptides
- Alpha-Lactalbumin
- Inulin
- N-Acetylglucosamine
- Beta-Glucan
- Hyaluronic Acid
- Ceramides
- Lion's Mane

上述仅为初始示例，实际趋势必须通过数据计算，不能将静态关键词列表伪装成实时趋势。

### 模块四：Regulatory Radar

独立展示：

- 食品法规
- 食品添加剂法规
- 新食品原料
- 化妆品原料法规
- API 药品监管
- 药典及标准更新
- 禁限用成分
- 安全警告及召回

### 模块五：Supply Chain Watch

展示：

- 原料价格变化。
- 原料供应短缺。
- 产地变化。
- 企业产能变化。
- 进出口政策。
- 关税及贸易壁垒。
- 重大物流风险。

没有可靠价格数据时，不要展示虚构价格和涨跌幅。

### 模块六：Innovation Radar

展示：

- 新型原料。
- 新功能性成分。
- 生物制造技术。
- 新型食品添加剂。
- 新化妆品活性成分。
- 新型 API 技术。
- 临床研究和技术商业化。

### 模块七：Global Trade Shows

展示未来即将举行的国际展会：

- CPHI
- Vitafoods
- SupplySide Global
- Fi Europe
- in-cosmetics
- PCHi
- WPC
- IFEAT

显示日期、地点、行业及官网。

### 模块八：Company Watch

展示重要原料企业动态：

- 新产品发布
- 产能扩张
- 企业并购
- 战略合作
- 新工厂建设
- 投融资
- 经营风险

---

# 八、新闻详情页设计

每条重要新闻应形成结构化情报页面。

建议包括：

1. Original Headline
2. Chinese Headline
3. Executive Summary
4. Key Facts
5. Industry Category
6. Related Ingredients
7. Related Companies
8. Related Countries
9. Business Impact
10. Supply Chain Impact
11. Regulatory Impact
12. Industry Outlook
13. Original Source
14. Related Reports

内容要求：

- 不得编造事实。
- 不得编造价格、数量、产能、市场份额。
- 明确区分新闻事实和 AI 分析。
- 重要结论尽量附带原始信源。
- AI 生成的内容必须保留原始来源。
- 原文发布日期和采集时间不能混淆。
- 对于存在争议的消息，应明确说明不确定性。

---

# 九、技术实现及配置要求

在阅读项目源码后，根据现有架构实现，不要盲目重构。

重点检查：

- 数据源配置。
- RSS 采集。
- API 数据采集。
- 新闻解析。
- AI 摘要。
- 新闻分类。
- 标签管理。
- 热点评分。
- 去重逻辑。
- 定时任务。
- 数据库结构。
- 前端首页。
- 新闻详情页。
- 分类页面。
- SEO 元数据。
- Sitemap。
- Robots.txt。

## 9.1 配置文件

尽可能将以下内容做成可配置数据：

- 行业分类。
- 二级分类。
- 三级标签。
- 信源列表。
- 信源优先级。
- 关键词。
- 热点评分规则。
- 行业展会。
- 重点监测企业。
- 多语言设置。

不要将所有规则写死在业务代码中。

如果项目已有配置体系，优先沿用。

## 9.2 数据结构

根据原项目的数据模型，合理扩展字段。

建议支持：

- industry_category
- sub_category
- ingredient_tags
- company_tags
- country_tags
- event_tags
- source_type
- source_authority
- importance_score
- relevance_score
- commercial_value
- confidence_level
- original_language
- original_url
- published_at
- collected_at
- event_date
- related_sources

不要重复创建已经存在的字段。

## 9.3 SEO

网站应面向全球 B2B 搜索流量。

重点：

- 英文为主，中文为辅助。
- 每个行业分类具有独立 SEO 页面。
- 每个二级分类具有独立 URL。
- 新闻详情页具有独立 Metadata。
- 正确配置 Canonical。
- 新闻页面使用适当的 Article / NewsArticle Schema。
- 展会使用适当的 Event Schema。
- 分类页面使用 BreadcrumbList。
- 生成 Sitemap。
- 避免大量低质量 AI 内容被索引。
- 不要生成空分类页面。
- 不要为了 SEO 批量制造无意义页面。

---

# 十、产品设计原则

1. 全球化：以全球原料行业为核心，而不是仅关注中国市场。
2. B2B：优先考虑采购、供应、产品开发、法规和商业价值。
3. 专业性：正确使用食品、药品、化妆品及化学行业术语。
4. 可信度：优先官方信息和可靠行业媒体。
5. 实时性：突出近期发生的重要事件。
6. 可追溯：每条新闻必须保留来源。
7. 可扩展：方便未来增加新的原料分类和信源。
8. 简洁：不要把首页做成信息密集但没有重点的新闻瀑布流。
9. 数据驱动：热点排名必须来自真实采集和计算。
10. 不造假：没有采集到的数据就不要展示。

---

# 十一、执行步骤

请按照以下顺序执行。

## Step 1：项目审查

完整阅读：

- AGENTS.md
- docs/customize.md

然后检查项目目录、技术栈、数据模型、采集模块、配置体系和现有页面。

先理解原项目如何工作，再决定如何改造。

## Step 2：制定改造方案

明确：

- 哪些现有功能可以复用。
- 哪些功能需要修改。
- 哪些功能需要新增。
- 数据库是否需要迁移。
- 哪些配置需要调整。
- 哪些功能受到当前项目技术架构限制。

不要仅输出计划，继续执行实际改造。

## Step 3：建立原料行业配置

建立完整行业分类、关键词、信源库、展会库、企业库和热点评分规则。

优先使用结构化配置文件，便于后续维护。

## Step 4：改造数据处理流程

实现：

- 新闻采集。
- 多语言识别。
- 行业分类。
- 原料实体识别。
- 企业实体识别。
- 国家和地区识别。
- 热点评分。
- 事件去重。
- AI 摘要。
- 可信度标记。

如果现有项目已经有这些能力，应尽可能复用。

## Step 5：改造前端

重新设计：

- 网站品牌及 Logo。
- 首页。
- 顶部导航。
- 行业分类。
- 热点列表。
- 原料趋势。
- 法规雷达。
- 供应链雷达。
- 展会日历。
- 新闻详情页。

保证 PC 和移动端均可正常使用。

## Step 6：检查内容质量

检查是否存在：

- 不合理的分类。
- 重复新闻。
- 错误的行业术语。
- 没有来源的新闻。
- 虚构的热点统计。
- 虚构的展会日期。
- 虚构的价格数据。
- 误导性的法规表述。

## Step 7：运行测试

改造完成后必须执行：

```bash
npm run typecheck
npm test
node scripts/smoke.ts
```

逐项记录运行结果。

如果某项失败：

1. 分析失败原因。
2. 修复本次改造引入的问题。
3. 重新运行对应测试。
4. 不要通过删除测试、跳过检查或降低类型检查标准来制造通过结果。

如果某项因环境、依赖、数据库或缺失配置无法执行，必须明确说明，不得伪造通过结果。

---

# 十二、最终交付报告

完成后，请提供详细报告。

## 12.1 已完成的改造

列出实际修改的功能和文件。

## 12.2 行业分类

列出最终建立的一级和二级分类。

## 12.3 信源体系

说明：

- 已配置多少个信源。
- 哪些信源能够实际采集。
- 哪些只是预留配置。
- 哪些需要 API Key。
- 哪些需要额外适配。

不能把仅添加到配置文件中的信源说成已经成功采集。

## 12.4 热点识别

说明热点评分、分类、去重和重要性识别机制。

## 12.5 测试结果

提供：

| 检查项目 | 结果 | 备注 |
|---|---|---|
| npm run typecheck | PASS/FAIL/BLOCKED | 具体原因 |
| npm test | PASS/FAIL/BLOCKED | 测试数量及失败情况 |
| node scripts/smoke.ts | PASS/FAIL/BLOCKED | 具体结果 |

## 12.6 需要我自己决定的事项

将需要产品负责人决定的事情单独列出来，例如：

- 网站最终品牌名称和域名。
- 英文版还是中英文双语。
- 是否需要增加其他语言。
- 是否需要接入付费行业数据库。
- 是否需要 Google News、DataForSEO 等数据源。
- 是否需要实时原料价格监控。
- 是否需要建立企业及供应商数据库。
- 是否需要增加用户订阅、邮件日报和 Telegram 推送。
- 是否需要付费会员和商业情报报告。
- 是否需要增加人工审核后台。

每个事项说明：

1. 为什么需要决定。
2. 推荐方案。
3. 不决定会有什么影响。

不要因为存在待决事项而停止可以独立完成的开发工作。

---

# 最终目标

将原项目从普通 AI 热点聚合站升级为一个真正服务于全球原料产业的专业情报平台。

它应该能够持续发现、筛选、分类和分析：

- 天然原料
- 药材及草本原料
- 香料及香精
- 食品添加剂
- 功能性食品及营养成分
- 化妆品原料及活性成分
- 原料药 API
- 医药中间体及药用辅料
- 生物制造及新型原料
- 全球供应链和国际贸易
- CPHI、Vitafoods、in-cosmetics、WPC 等国际展会

最重要的是：

**不要做成一个简单的新闻 RSS 聚合器，而要做成一个能够帮助原料行业从业者发现市场机会、供应链风险、法规变化和新产品趋势的 Global Ingredients Intelligence Platform。**

请直接在当前项目中实施改造，保留原项目可复用的能力，完成后运行全部指定测试，并提供真实的交付报告。
