const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
const experienceCanvas = document.getElementById("experienceCanvas");
const experienceCtx = experienceCanvas.getContext("2d");
const detailEffectCanvas = document.getElementById("detailEffectCanvas");
const detailEffectCtx = detailEffectCanvas.getContext("2d");
const TD_LIVE_FRAME_PATH = "assets/td-live/frame.jpg";
const TD_BRIDGE_PORTS = [8911, 8912, 8913, 8914, 8915, 8899, 8766];

function shouldAttemptTouchDesignerBridge() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("td") === "0" || params.get("portable") === "1") return false;
  if (params.get("td") === "1") return true;
  return /^https?:$/.test(window.location.protocol) && /^(127\.0\.0\.1|localhost)$/.test(window.location.hostname);
}

let USE_TOUCHDESIGNER_BRIDGE = shouldAttemptTouchDesignerBridge();

function uniqueList(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildTdBridgeBases() {
  const bases = [];
  if (/^https?:$/.test(window.location.protocol)) bases.push(window.location.origin);
  TD_BRIDGE_PORTS.forEach((port) => {
    bases.push(`http://127.0.0.1:${port}`);
    bases.push(`http://localhost:${port}`);
  });
  return uniqueList(bases.map((base) => base.replace(/\/+$/, "")));
}

const TD_BRIDGE_BASES = buildTdBridgeBases();

const ui = {
  discoverView: document.getElementById("discoverView"),
  detailView: document.getElementById("detailView"),
  experienceView: document.getElementById("experienceView"),
  headline: document.getElementById("headline"),
  colorTab: document.getElementById("colorTab"),
  contentTab: document.getElementById("contentTab"),
  introCopy: document.getElementById("introCopy"),
  mapHint: document.getElementById("mapHint"),
  categoryRow: document.getElementById("categoryRow"),
  range: document.getElementById("range"),
  favoriteGrid: document.getElementById("favoriteGrid"),
  detailFavoriteGrid: document.getElementById("detailFavoriteGrid"),
  experienceFavoriteGrid: document.getElementById("experienceFavoriteGrid"),
  collectionGrid: document.getElementById("collectionGrid"),
  collectionOriginalGrid: document.getElementById("collectionOriginalGrid"),
  collectionFrameGrid: document.getElementById("collectionFrameGrid"),
  collectionEmpty: document.getElementById("collectionEmpty"),
  collectionOriginalEmpty: document.getElementById("collectionOriginalEmpty"),
  collectionFrameEmpty: document.getElementById("collectionFrameEmpty"),
  collectionCount: document.getElementById("collectionCount"),
  collectionOriginalCount: document.getElementById("collectionOriginalCount"),
  collectionFrameCount: document.getElementById("collectionFrameCount"),
  tdCollectionStage: document.getElementById("tdCollectionStage"),
  tdStageVisual: document.getElementById("tdStageVisual"),
  experienceTitle: document.getElementById("experienceTitle"),
  experienceMeta: document.getElementById("experienceMeta"),
  closeDetail: document.getElementById("closeDetail"),
  detailHeading: document.getElementById("detailHeading"),
  detailYear: document.getElementById("detailYear"),
  detailPage: document.getElementById("detailPage"),
  detailCategory: document.getElementById("detailCategory"),
  detailImage: document.getElementById("detailImage"),
  detailLiveImage: document.getElementById("detailLiveImage"),
  experienceLiveImage: document.getElementById("experienceLiveImage"),
  detailCopy: document.getElementById("detailCopy"),
  detailContextCard: document.getElementById("detailContextCard"),
  archiveStrip: document.getElementById("archiveStrip"),
  favoriteAction: document.getElementById("favoriteAction"),
  detailBack: document.getElementById("detailBack"),
  experienceBack: document.getElementById("experienceBack"),
  archivePrev: document.getElementById("archivePrev"),
  archiveNext: document.getElementById("archiveNext"),
  prevSampleLabel: document.getElementById("prevSampleLabel"),
  nextSampleLabel: document.getElementById("nextSampleLabel"),
  pauseEffect: document.getElementById("pauseEffect"),
  detailPauseEffect: document.getElementById("detailPauseEffect"),
  dragFrame: document.getElementById("dragFrame"),
  detailDragFrame: document.getElementById("detailDragFrame"),
  detailFrameSource: document.getElementById("detailFrameSource"),
  remixEntry: document.getElementById("remixEntry"),
  designView: document.getElementById("designView"),
  designFallbackCanvas: document.getElementById("designFallbackCanvas"),
  designStaticShape: document.getElementById("designStaticShape"),
  designCanvas: document.getElementById("designCanvas"),
  designStage: document.getElementById("designStage"),
  designProduct: document.getElementById("designProduct"),
  designBackground: document.getElementById("designBackground"),
  designPatternPreview: document.getElementById("designPatternPreview"),
  designSourceList: document.getElementById("designSourceList"),
  designPatternScale: document.getElementById("designPatternScale"),
  designRotation: document.getElementById("designRotation"),
  designZoom: document.getElementById("designZoom"),
  designTiling: document.getElementById("designTiling"),
  designPatternSize: document.getElementById("designPatternSize"),
  designVariantLabel: document.getElementById("designVariantLabel"),
  designLockRatio: document.getElementById("designLockRatio"),
  designTranslationCard: document.getElementById("designTranslationCard"),
  researchEvaluateOpen: document.getElementById("researchEvaluateOpen"),
  researchExportJson: document.getElementById("researchExportJson"),
  researchExportCsv: document.getElementById("researchExportCsv"),
  researchRecordCount: document.getElementById("researchRecordCount"),
  researchStudyDialog: document.getElementById("researchStudyDialog"),
  researchStudyForm: document.getElementById("researchStudyForm"),
  researchStudyClose: document.getElementById("researchStudyClose"),
  researchStudyCancel: document.getElementById("researchStudyCancel"),
  designBack: document.getElementById("designBack"),
  designReset: document.getElementById("designReset"),
  designUndo: document.getElementById("designUndo"),
  designTileToggle: document.getElementById("designTileToggle"),
  designSurfaceToggle: document.getElementById("designSurfaceToggle")
};

const unavailableDesignProducts = new Set(["scarf"]);

function removeUnavailableDesignProducts() {
  if (!ui.designProduct) return;
  Array.from(ui.designProduct.options).forEach((option) => {
    if (unavailableDesignProducts.has(option.value)) option.remove();
  });
  if (!ui.designProduct.value || unavailableDesignProducts.has(ui.designProduct.value)) {
    ui.designProduct.value = "seat";
  }
}

removeUnavailableDesignProducts();

const brocadeAssets = [
  { file: "narrative-01.jpg", category: "narrative", title: "福树与大吉纹样", page: 233, source: "中国织锦图像裁切样本", note: "以“福”“大吉”等吉祥文字和树形构图组织画面，适合作为福文化叙事母题。", words: ["福字", "大吉", "树形中心", "祈愿叙事"] },
  { file: "narrative-02.jpg", category: "narrative", title: "龙凤瑞兽叙事锦", page: 179, source: "中国织锦图像裁切样本", note: "瑞兽、祥云与满幅红金色形成热烈叙事，强调喜庆、护佑和富贵祝愿。", words: ["瑞兽", "祥云", "红金", "礼俗叙事"] },
  { file: "narrative-03.jpg", category: "narrative", title: "仪式建筑与神像锦", page: 143, source: "中国织锦图像裁切样本", note: "建筑、神像与对称层级构成仪式空间，可作为祖先崇拜和祈福场景的参考。", words: ["神像", "仪式", "对称层级", "祈福场景"] },
  { file: "narrative-04.jpg", category: "narrative", title: "花鸟连续叙事纹", page: 73, source: "中国织锦图像裁切样本", note: "花鸟与卷草在深色底上连续展开，把生命繁盛的寓意转译为可重复的纹样节奏。", words: ["花鸟", "卷草", "连续展开", "生命繁盛"] },
  { file: "narrative-05.jpg", category: "narrative", title: "坛城式祈福织物", page: 175, source: "福文化图像裁切样本", note: "中心化构图和层层环绕的神圣秩序，适合提取为福文化视觉系统中的主视觉结构。", words: ["中心构图", "层层环绕", "神圣秩序", "主视觉"] },
  { file: "narrative-06.jpg", category: "narrative", title: "红地动物故事锦", page: 155, source: "福文化图像裁切样本", note: "动物、花枝与红底形成节庆叙事，表达丰饶、兴旺和家族延续。", words: ["动物", "花枝", "红地", "丰饶兴旺"] },
  { file: "narrative-07.jpg", category: "narrative", title: "圆形人物故事纹", page: 113, source: "福文化图像裁切样本", note: "圆形边界包裹人物叙事，具有团圆、圆满和祝福聚合的视觉意味。", words: ["圆形", "人物", "团圆", "圆满"] },
  { file: "narrative-08.jpg", category: "narrative", title: "橙地服饰纹样", page: 125, source: "福文化图像裁切样本", note: "服饰上的团形纹和暖色底构成礼仪感，适合提取为节庆服饰与福礼包装素材。", words: ["服饰", "团形纹", "暖色底", "礼仪感"] },
  { file: "narrative-09.jpg", category: "narrative", title: "红地群像故事纹", page: 154, source: "福文化图像裁切样本", note: "人物与动物在红地中交织，形成热闹的民俗故事画面，可转译为节庆叙事插图。", words: ["群像", "民俗故事", "红地", "节庆插图"] },

  { file: "nature-01.jpg", category: "nature", title: "团花满地锦", page: 187, source: "中国织锦图像裁切样本", note: "团花重复排列，花心与枝叶形成稳定节奏，适合作为福文化中“花开富贵”的纹样来源。", words: ["团花", "枝叶", "满地纹", "花开富贵"] },
  { file: "nature-02.jpg", category: "nature", title: "黑花粉地织锦", page: 138, source: "中国织锦图像裁切样本", note: "大花轮廓清晰，黑色剪影强化植物形态，可用于提取花卉外形和负形关系。", words: ["花卉", "剪影", "负形", "植物母题"] },
  { file: "nature-03.jpg", category: "nature", title: "金地缠枝花纹", page: 91, source: "福文化图像裁切样本", note: "金色花枝在深底上连续盘绕，强调富贵、繁盛和福气绵延的自然寓意。", words: ["缠枝花", "金色", "连续盘绕", "福气绵延"] },
  { file: "nature-04.jpg", category: "nature", title: "四方式花卉锦", page: 110, source: "中国织锦图像裁切样本", note: "花朵被网格化地组织在连续单元中，兼具自然母题和几何秩序。", words: ["花朵", "网格", "连续单元", "自然秩序"] },
  { file: "nature-05.jpg", category: "nature", title: "深底牡丹织锦", page: 190, source: "中国织锦图像裁切样本", note: "牡丹、叶片与深色底形成高对比，强调富贵、繁盛和庄重的福文化气质。", words: ["牡丹", "深色底", "富贵", "繁盛"] },
  { file: "nature-06.jpg", category: "nature", title: "红花绿藤纹", page: 50, source: "中国织锦图像裁切样本", note: "红花与绿色藤蔓交错，适合拆分为花心、叶片和藤线三类可复用组件。", words: ["红花", "藤蔓", "叶片", "组件化"] },
  { file: "nature-07.jpg", category: "nature", title: "暖地小花满幅纹", page: 149, source: "中国织锦图像裁切样本", note: "小花以均匀节奏铺满画面，形成轻快的满地纹，可用于福文化礼品的背景系统。", words: ["小花", "满幅", "均匀节奏", "礼品背景"] },
  { file: "nature-08.jpg", category: "nature", title: "红地宝相花纹", page: 63, source: "福文化图像裁切样本", note: "宝相花居中展开，红蓝白对比鲜明，具有吉祥、庄严和节庆装饰意味。", words: ["宝相花", "红蓝", "中心花", "吉祥"] },
  { file: "nature-09.jpg", category: "nature", title: "织绣花枝局部", page: 13, source: "福文化图像裁切样本", note: "花枝以绣线质感呈现，可用于观察刺绣与织锦之间的材料表现差异。", words: ["花枝", "绣线", "材料质感", "局部观察"] },

  { file: "geometry-01.jpg", category: "geometry", title: "红地几何连续纹", page: 76, source: "中国织锦图像裁切样本", note: "三角、折线和连续单位构成强节奏，可解析为回纹、云雷纹一类线性构成。", words: ["三角", "折线", "连续纹", "线性构成"] },
  { file: "geometry-02.jpg", category: "geometry", title: "蜂巢与八角纹", page: 156, source: "中国织锦图像裁切样本", note: "六边形、八角形和交叉线形成蜂巢式秩序，适合转译为模块化福纹。", words: ["六边形", "八角", "蜂巢", "模块化"] },
  { file: "geometry-03.jpg", category: "geometry", title: "菱形梯级织锦", page: 241, source: "民族织锦图像裁切样本", note: "菱形、三角和阶梯边缘连续推进，形成方向性很强的编织结构。", words: ["菱形", "三角", "阶梯", "编织结构"] },
  { file: "geometry-04.jpg", category: "geometry", title: "蓝地菱格纹", page: 181, source: "民族织锦图像裁切样本", note: "蓝地菱格以斜向交错组织，适合提取为线性网格和斜向重复关系。", words: ["菱格", "斜向", "网格", "重复关系"] },
  { file: "geometry-05.jpg", category: "geometry", title: "回纹格栅样本", page: 152, source: "民族织锦图像裁切样本", note: "回纹路径在方形格内折返，直接对应福文化中“绵延不断”的连续寓意。", words: ["回纹", "方形", "折返", "绵延不断"] },
  { file: "geometry-06.jpg", category: "geometry", title: "黑红白菱形纹", page: 180, source: "民族织锦图像裁切样本", note: "黑、红、白色块围合成菱形单元，适合作为强识别度的福纹边饰。", words: ["黑红白", "菱形", "色块", "边饰"] },
  { file: "geometry-07.jpg", category: "geometry", title: "八角连续锦纹", page: 134, source: "民族织锦图像裁切样本", note: "八角花心与锯齿边重复排列，兼具几何构成和花形象征。", words: ["八角", "锯齿", "重复", "几何花形"] },
  { file: "geometry-08.jpg", category: "geometry", title: "菱格满地纹", page: 147, source: "民族织锦图像裁切样本", note: "小菱格高密度铺陈，适合解释满地纹、连续延展和 repeat pattern。", words: ["菱格", "满地纹", "连续延展", "repeat pattern"] },
  { file: "geometry-09.jpg", category: "geometry", title: "方形团花格纹", page: 147, source: "福文化图像裁切样本", note: "中心花形被方形边框包裹，圆、方与斜线共同组织出福纹的稳定结构。", words: ["圆", "方", "斜线", "稳定结构"] },

  { file: "material-01.jpg", category: "material", title: "彩色经纬编织图", page: 36, source: "织锦结构裁切样本", note: "彩色经纬线交错成格，直接呈现织锦的结构逻辑，可转译为网格与像素化纹样。", words: ["经纬", "交错", "格栅", "像素化"] },
  { file: "material-02.jpg", category: "material", title: "黑地织孔肌理", page: 185, source: "织锦结构裁切样本", note: "黑色织孔和线面组织形成强烈肌理，适合分析透孔、密度和织物颗粒感。", words: ["织孔", "密度", "黑地", "颗粒感"] },
  { file: "material-03.jpg", category: "material", title: "红地织线质感", page: 267, source: "民族织锦图像裁切样本", note: "红底上白色小纹呈现织线的起伏和颗粒感，可用于材质与像素化表达。", words: ["织线", "颗粒感", "红底", "像素化"] },
  { file: "material-04.jpg", category: "material", title: "深底花卉织锦", page: 105, source: "织锦材质裁切样本", note: "深底上的花卉色块带有明显织物厚度和光泽，可用于观察织锦的色层、绒感和反光。", words: ["深底", "花卉", "色层", "织物光泽"] },
  { file: "material-05.jpg", category: "material", title: "条带色彩织物", page: 314, source: "民族织锦图像裁切样本", note: "竖向条带和高饱和色彩形成撞色效果，适合分析色彩表现与材质节奏。", words: ["条带", "撞色", "竖向", "材质节奏"] },
  { file: "material-06.jpg", category: "material", title: "红绿织线微观纹", page: 275, source: "民族织锦图像裁切样本", note: "近距离可见织线交错和颜色叠压，是理解织锦像素感的基础样本。", words: ["微观", "交错", "颜色叠压", "像素感"] },
  { file: "material-07.jpg", category: "material", title: "蓝灰植物织纹", page: 107, source: "织锦材质裁切样本", note: "植物轮廓被织线压入布面，呈现低饱和色和线迹起伏，适合分析织绣质感。", words: ["植物轮廓", "线迹", "低饱和", "织绣质感"] },
  { file: "material-08.jpg", category: "material", title: "蓝橙点阵织纹", page: 94, source: "织锦结构裁切样本", note: "蓝橙色点阵和条带并置，突出纬线密度、撞色关系和数字化像素感。", words: ["点阵", "条带", "撞色", "像素感"] },
  { file: "material-09.jpg", category: "material", title: "红黑白满地织纹", page: 47, source: "民族织锦图像裁切样本", note: "高密度红黑白纹样铺满画面，能说明织锦在重复、密度和色彩节奏上的表现力。", words: ["红黑白", "高密度", "重复", "色彩节奏"] },

  { file: "symbol-01.jpg", category: "symbol", title: "团寿红盘纹", page: 35, source: "中国织锦图像裁切样本", note: "中心寿字与旋转花纹组合，直接服务福、寿、喜一类吉祥文字系统。", words: ["寿字", "团形", "红色", "吉祥文字"] },
  { file: "symbol-02.jpg", category: "symbol", title: "蝶形团花符号", page: 180, source: "民族织锦图像裁切样本", note: "蝴蝶与团花共同形成圆满图式，可转译为福文化中的生命、喜庆和美好寓意。", words: ["蝴蝶", "团花", "圆满", "喜庆"] },
  { file: "symbol-03.jpg", category: "symbol", title: "团形花盘符号", page: 74, source: "福文化图像裁切样本", note: "圆形花盘具有中心放射结构，适合提取为徽章、窗花和福礼贴纸。", words: ["团形", "中心放射", "徽章", "窗花"] },
  { file: "symbol-04.jpg", category: "symbol", title: "凤鸟团纹", page: 161, source: "福文化图像裁切样本", note: "凤鸟、花枝与圆形边界共同表达祥瑞，可作为福文化符号的高级母题。", words: ["凤鸟", "花枝", "圆形边界", "祥瑞"] },
  { file: "symbol-05.jpg", category: "symbol", title: "双寿木刻纹", page: 127, source: "福文化图像裁切样本", note: "两个寿字被纹饰包围，强调对称、长寿和成双成对的祝福。", words: ["双寿", "对称", "长寿", "成双"] },
  { file: "symbol-06.jpg", category: "symbol", title: "寿字冠形纹", page: 126, source: "福文化图像裁切样本", note: "寿字居中并与冠形轮廓结合，适合抽象为可识别的祝福标识。", words: ["寿字", "冠形", "标识", "祝福"] },
  { file: "symbol-07.jpg", category: "symbol", title: "黄地寿字织锦", page: 124, source: "福文化图像裁切样本", note: "寿字位于中心，四周以小型纹样满幅铺陈，适合提取为福寿主题的核心符号。", words: ["寿字", "中心符号", "满幅铺陈", "福寿主题"] },
  { file: "symbol-08.jpg", category: "symbol", title: "蓝地团寿云纹", page: 61, source: "福文化图像裁切样本", note: "寿字、回纹和云气共同组织，几何秩序与吉祥文字在同一图像中叠合。", words: ["寿字", "回纹", "云气", "叠合"] },
  { file: "symbol-09.jpg", category: "symbol", title: "黑白花卉剪影", page: 131, source: "福文化图像裁切样本", note: "黑白剪影降低色彩干扰，适合提取花卉轮廓并再编码为福文化标识。", words: ["黑白", "剪影", "花卉轮廓", "再编码"] },

  { file: "space-01.jpg", category: "space", title: "小花满地纹", page: 149, source: "中国织锦图像裁切样本", note: "小花点状铺陈，单元之间距离均匀，适合分析满地纹和连续背景。", words: ["满地纹", "点状", "均匀距离", "连续背景"] },
  { file: "space-02.jpg", category: "space", title: "四方团花网格", page: 86, source: "中国织锦图像裁切样本", note: "团花被放置在四方网格中，具有清晰的中心与边界关系。", words: ["网格", "团花", "中心", "边界"] },
  { file: "space-03.jpg", category: "space", title: "深底团花满地纹", page: 105, source: "织锦空间裁切样本", note: "团花在深底上按网格节奏铺展，适合解释满地纹、重复单元和空间均衡。", words: ["团花", "满地纹", "重复单元", "空间均衡"] },
  { file: "space-04.jpg", category: "space", title: "织物条带组合", page: 101, source: "民族织锦图像裁切样本", note: "条带被纵向组织并形成稳定分区，适合转译为页面分栏和包装腰封。", words: ["条带", "分区", "分栏", "包装腰封"] },
  { file: "space-05.jpg", category: "space", title: "菱形带状纹样", page: 153, source: "民族织锦图像裁切样本", note: "菱形连续串联为横向带状结构，适合用作福礼边饰。", words: ["菱形", "横向带", "连续", "边饰"] },
  { file: "space-06.jpg", category: "space", title: "红黑横向织带", page: 248, source: "民族织锦图像裁切样本", note: "横向分层和中央连续纹带共同形成空间节奏，适合分析边框与主体关系。", words: ["横向分层", "连续纹带", "边框", "主体关系"] },
  { file: "space-07.jpg", category: "space", title: "深底中心菱纹", page: 185, source: "民族织锦图像裁切样本", note: "中心菱形与周边纹样形成稳定视觉锚点，适合做主纹与辅纹关系分析。", words: ["中心菱形", "视觉锚点", "主纹", "辅纹"] },
  { file: "space-08.jpg", category: "space", title: "深蓝龙纹连续锦", page: 32, source: "织锦空间裁切样本", note: "龙纹以横向节奏连续排布，形成满幅叙事背景，可用于分析连续延展和主题重复。", words: ["龙纹", "横向节奏", "连续延展", "主题重复"] },
  { file: "space-09.jpg", category: "space", title: "蓝地团花散点纹", page: 100, source: "福文化图像裁切样本", note: "团花散点分布在深蓝底上，具有均衡而不拥挤的空间组织。", words: ["散点", "深蓝底", "均衡", "空间组织"] }
];

const brocadeImageBase = "assets/brocade-kaleidoscope-full";
const brocadeTileBase = "assets/brocade-kaleidoscope-tiles";

const excludedBrocadeFiles = new Set([
  "material-02.jpg",
  "material-03.jpg",
  "material-05.jpg",
  "material-06.jpg",
  "material-07.jpg",
  "narrative-01.jpg",
  "narrative-03.jpg",
  "narrative-06.jpg",
  "narrative-08.jpg",
  "narrative-09.jpg",
  "space-01.jpg",
  "space-04.jpg",
  "space-06.jpg",
  "symbol-05.jpg",
  "symbol-07.jpg"
]);

const kaleidoscopeExtraAssets = [
  ["kaleido-01.jpg", "geometry", "蝶纹黑白万花纹", 901, "黑白蝶形与花枝交错，适合生成清晰的中心放射和镜像轮廓。"],
  ["kaleido-02.jpg", "symbol", "圆盘瑞兽万花纹", 902, "圆形边界内有高密度动物与花叶，旋转后形成团花式祝福结构。"],
  ["kaleido-03.jpg", "nature", "团寿云纹万花样", 903, "寿字与云气共同围合，适合福寿主题的镜像再创作。"],
  ["kaleido-04.jpg", "geometry", "团寿近景万花样", 904, "截取寿字圆盘局部，让线条和色块在万花镜中形成连贯纹理。"],
  ["kaleido-05.jpg", "symbol", "黑底花鸟团纹", 905, "深色底上花鸟轮廓清晰，适合生成高对比的旋转花心。"],
  ["kaleido-06.jpg", "space", "回纹寿字局部", 906, "回纹、寿字和边饰形成强几何节奏，可用于福文化符号扩展。"],
  ["kaleido-07.jpg", "nature", "酒红团花盘纹", 907, "圆形花盘与小花点缀结合，适合形成柔和的团花万花效果。"],
  ["kaleido-08.jpg", "symbol", "凤鸟火纹团样", 908, "凤鸟和火焰形花纹集中排列，适合生成热烈的节庆中心图案。"],
  ["kaleido-09.jpg", "geometry", "蓝地花鸟连续纹", 909, "蓝红花鸟连续分布，镜像后能形成稳定的满地纹节奏。"],
  ["kaleido-10.jpg", "symbol", "深底寿纹团样", 910, "寿字与深色底纹结合，适合做庄重的福寿主题图案。"],
  ["kaleido-11.jpg", "nature", "红黑菱形锦纹", 911, "菱形和锯齿连续推进，适合形成硬朗的几何万花镜结构。"],
  ["kaleido-12.jpg", "geometry", "深色菱格福纹", 912, "深色菱格高密度铺陈，旋转后会出现清晰的中心花形。"],
  ["kaleido-13.jpg", "symbol", "灰地团花连续纹", 913, "团花和叶形规则排列，适合生成均衡的重复纹样。"],
  ["kaleido-14.jpg", "space", "蓝地小团花纹", 914, "深蓝底上的小团花间距均匀，适合做柔和背景型万花纹。"],
  ["kaleido-15.jpg", "nature", "八角花锦近景", 915, "八角花和锯齿边构成强中心结构，适合福文化主视觉。"],
  ["kaleido-16.jpg", "symbol", "橙地小花满幅纹", 916, "暖色底和小花满幅铺展，适合生成明快的节庆纹样。"],
  ["kaleido-17.jpg", "geometry", "金地缠枝花局部", 917, "金色缠枝花在深底上连续盘绕，适合表现富贵和福气绵延。"],
  ["kaleido-18.jpg", "symbol", "蓝白回纹近景", 918, "回纹折返路径清晰，适合做连续几何构成的再创作。"],
  ["kaleido-19.jpg", "nature", "四方花格局部", 919, "四方网格与花朵单元结合，适合生成有秩序的团花背景。"],
  ["kaleido-20.jpg", "geometry", "红黑白满地纹", 920, "红黑白小单元高密度重复，适合产品设计的满铺贴图。"],
  ["kaleido-21.jpg", "symbol", "深色星形菱纹", 921, "星形与菱形交织，适合生成更锐利的万花镜骨架。"],
  ["kaleido-22.jpg", "space", "黑地菱形火纹", 922, "红蓝菱形和黑底形成高对比，适合生成民族织锦感强的图案。"],
  ["kaleido-23.jpg", "nature", "蓝地细密菱格", 923, "蓝色细密菱格适合作为低调但有结构的二创底纹。"],
  ["kaleido-24.jpg", "symbol", "红寿团盘局部", 924, "红色寿字团盘具有明确福寿符号，适合节庆产品贴图。"],
  ["kaleido-25.jpg", "geometry", "红白几何锦纹", 925, "红白几何符号被连续组织，可形成节奏鲜明的镜像结构。"],
  ["kaleido-26.jpg", "symbol", "红花绿藤近景", 926, "花心、叶片和藤线色彩清晰，适合生成自然母题万花纹。"],
  ["kaleido-27.jpg", "nature", "花枝绣线局部", 927, "织绣线迹与花枝局部结合，适合表现材料质感。"],
  ["kaleido-28.jpg", "geometry", "黑粉花卉剪影", 928, "大花剪影和粉地形成强烈负形关系，适合生成柔性花形。"],
  ["kaleido-29.jpg", "symbol", "橙白几何构成", 929, "几何边框与中心图案结合，适合提取对称装饰结构。"],
  ["kaleido-30.jpg", "space", "圆形团花绿底纹", 930, "圆形团花和绿色底纹结合，适合生成复古团花万花样。"],
  ["kaleido-31.jpg", "nature", "黑红白边饰锦", 931, "黑红白连续边饰适合生成强方向性的几何纹样。"],
  ["kaleido-32.jpg", "symbol", "植物点阵织纹", 932, "植物轮廓和点阵织线结合，适合生成材料感更强的纹理。"],
  ["kaleido-33.jpg", "geometry", "深蓝龙纹连续样", 933, "龙纹和深蓝底构成连续主题，适合生成祥瑞主题二创纹。"],
  ["kaleido-34.jpg", "symbol", "橙地瑞兽连续样", 934, "瑞兽和橙红底组成高密度节庆纹，适合热烈的福文化图案。"]
].map(([file, category, title, page, note]) => ({
  file,
  category,
  title,
  page,
  source: "万花镜精选裁切样本",
  note,
  words: ["万花镜", "无白边", "满幅纹样", "二次创作"]
}));

const curatedBrocadeAssets = [
  ...brocadeAssets.filter((asset) => !excludedBrocadeFiles.has(asset.file)),
  ...kaleidoscopeExtraAssets
];

const assetMedia = new Map();

function isDrawableMedia(media) {
  if (!media) return false;
  if (typeof media.naturalWidth === "number") {
    return media.complete && media.naturalWidth > 0 && media.naturalHeight > 0;
  }
  if (typeof media.videoWidth === "number") {
    return media.readyState >= 2 && media.videoWidth > 0 && media.videoHeight > 0;
  }
  return media.width > 0 && media.height > 0;
}

function ensureAssetImage(image) {
  if (!image?._assetUrl || image._assetStarted) return image;
  image._assetStarted = true;
  image._assetAttempts += 1;
  const separator = image._assetUrl.includes("?") ? "&" : "?";
  const retry = image._assetAttempts > 1 ? `${separator}asset_retry=${image._assetAttempts}` : "";
  image.src = `${image._assetUrl}${retry}`;
  return image;
}

function sampleImageUrl(sample) {
  const url = sample?.image?._assetUrl || sample?.image?.src || sample?.tile?.src || "";
  return url ? new URL(url, document.baseURI).href : "";
}

function createAssetImage(url, deferred = false) {
  const image = new Image();
  image.decoding = "async";
  image._assetUrl = url;
  image._assetAttempts = 0;
  image.onload = () => {
    imageLoads += 1;
    state.needsRender = true;
    state.designNeedsRender = true;
    designFallback.key = "";
    if (state.activeView === "detail" && currentSample()?.image === image) {
      ui.detailImage.src = image.currentSrc || image.src;
    }
    if (state.activeView === "product-design") {
      const sample = currentDesignSample();
      if (sample?.image === image || sample?.tile === image) updateDesignTexture();
    }
  };
  image.onerror = () => {
    if (image._assetAttempts >= 3 || image._assetUrl.startsWith("data:")) return;
    window.setTimeout(() => {
      image._assetStarted = false;
      ensureAssetImage(image);
    }, image._assetAttempts * 900);
  };
  if (!deferred) ensureAssetImage(image);
  return image;
}

function mediaForAsset(asset) {
  const imageBase = asset.imageBase || brocadeImageBase;
  const tileBase = asset.tileBase || brocadeTileBase;
  const mediaKey = `${imageBase}/${asset.file}`;
  if (assetMedia.has(mediaKey)) return assetMedia.get(mediaKey);
  const image = createAssetImage(`${imageBase}/${asset.file}`, true);
  const tile = createAssetImage(`${tileBase}/${asset.file}`);
  const media = { image, tile };
  assetMedia.set(mediaKey, media);
  return media;
}

const categories = [
  {
    id: "narrative",
    short: "叙事",
    label: "叙事与文化母体类",
    year: 1780,
    copy: [
      "民间传说（神话、故事、寓言）",
      "历史人物 / 神祇 / 祖先形象",
      "民俗活动（节庆、仪式、舞蹈）",
      "宗教与信仰符号（佛教、道教、图腾等）"
    ],
    words: ["民间传说", "历史人物", "神祇", "祖先形象", "节庆仪式", "图腾信仰"]
  },
  {
    id: "nature",
    short: "自然",
    label: "自然生物类",
    year: 1815,
    copy: [
      "植物（树木、藤蔓、果实）",
      "花卉（牡丹、莲花、菊花等）",
      "动物（瑞兽、鸟类、鱼虫）",
      "微生物与自然现象（云纹、水纹、风、雷）"
    ],
    words: ["植物", "花卉", "动物", "瑞兽", "云纹", "水纹"]
  },
  {
    id: "geometry",
    short: "几何",
    label: "几何与构成类",
    year: 1855,
    copy: [
      "几何纹样（圆、方、三角、六边形）",
      "连续纹（回纹、万字纹、云雷纹）",
      "编织结构 / 线性构成",
      "图形符号化抽象"
    ],
    words: ["圆形", "方形", "回纹", "万字纹", "编织结构", "线性构成"]
  },
  {
    id: "material",
    short: "材质",
    label: "材质与表现技法类",
    year: 1895,
    copy: [
      "色彩表现（渐变、撞色、单色、晕染）",
      "笔触技法（刻线、填色、点彩）",
      "视觉效果（浮雕感、金属感、透光、磨砂）",
      "工艺模拟（刺绣、织锦、漆器、木刻）",
      "动态与数字效果（流动、扭曲、粒子感）"
    ],
    words: ["渐变", "撞色", "晕染", "刺绣", "织锦", "粒子感"]
  },
  {
    id: "symbol",
    short: "符号",
    label: "符号与文化抽象类",
    year: 1935,
    copy: [
      "吉祥文字（福、寿、喜）",
      "祥瑞符号（如意、祥云、宝相花）",
      "图腾简化形 / 宗教与信仰抽象符号",
      "可被再编码的文化标识"
    ],
    words: ["福字", "寿字", "喜字", "如意", "祥云", "宝相花"]
  },
  {
    id: "space",
    short: "空间",
    label: "空间与布局类",
    year: 1985,
    copy: [
      "满地纹（全覆盖）",
      "中心放射式 / 边框式",
      "对称构图",
      "连续延展纹样（repeat pattern）"
    ],
    words: ["满地纹", "中心放射", "边框式", "对称构图", "连续延展", "repeat pattern"]
  }
];

const categoryById = Object.fromEntries(categories.map((category) => [category.id, category]));

const state = {
  dpr: 1,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  scale: 1,
  targetScale: 1,
  mode: "color",
  activeCategory: "narrative",
  timelineProgress: 1,
  dragging: false,
  dragStart: null,
  hoverId: null,
  selectedId: null,
  timelineDragging: false,
  activeView: "discover",
  effectPaused: false,
  effectTime: 0,
  effectSource: null,
  effectFrameImage: null,
  tdInputSource: null,
  frameDataUrl: "",
  frameDragging: false,
  frameDragGhost: null,
  frameDragSource: null,
  frameDragPointerId: null,
  originalDragging: false,
  originalDragGhost: null,
  originalDragStart: null,
  designSource: null,
  designSourceKey: "",
  designPatternUrl: "",
  designPatternImage: null,
  designProduct: "seat",
  designScale: 1,
  designPatternScale: 2.2,
  designPatternRotation: 0.5,
  designTiling: "grid",
  designReturnView: "discover",
  designReturnFrame: null,
  designNeedsRender: true,
  needsRender: true
};

const world = {
  width: 1800,
  height: 1180,
  centerX: 900,
  centerY: 575
};

let samples = [];
let imageLoads = 0;
const favorites = [];
const frameFavorites = [];
const researchRecords = [];
const remixStyles = ["mirror", "weave", "orbit", "slice"];
const artSourceCanvas = document.createElement("canvas");
const offlineToeProgramCanvas = document.createElement("canvas");
const offlineToeProgramCtx = offlineToeProgramCanvas.getContext("2d");
const trimCache = new Map();
const tdPreviewCanvases = new Set();
const tdProgram = {
  mirrorAngles: [20, 40, 60, 80, 100, 120, 140, 160, 280],
  canvases: Array.from({ length: 13 }, () => document.createElement("canvas")),
  ctxs: [],
  sourceIndex: 0
};
tdProgram.ctxs = tdProgram.canvases.map((entry) => entry.getContext("2d"));
const tdLive = {
  path: TD_LIVE_FRAME_PATH,
  inputEndpoint: "",
  bridgeBase: TD_BRIDGE_BASES[0] || "",
  streamEndpoint: "",
  streamFailed: false,
  streamFailTimer: 0,
  streamMode: "frame",
  image: new Image(),
  loader: null,
  lastRequest: 0,
  requestGap: 260,
  nextUrl: "",
  loading: false,
  ready: false,
  failedAt: 0,
  frameVersion: 0,
  frameLoadedAt: 0,
  requiredFrameTime: 0,
  status: null,
  statusCheckedAt: 0,
  statusPromise: null,
  statusMinGap: 260,
  bridgeConnected: false,
  sourceKey: "",
  retryTimer: 0,
  inputSending: false,
  autoLaunchTried: false,
  autoLaunchInFlight: false,
  waitingText: "等待织纹进入影像"
};
tdLive.image.decoding = "async";

function disableTouchDesignerBridge() {
  if (!USE_TOUCHDESIGNER_BRIDGE) return;
  USE_TOUCHDESIGNER_BRIDGE = false;
  tdLive.bridgeConnected = false;
  tdLive.ready = false;
  tdLive.loading = false;
  tdLive.inputSending = false;
  tdLive.streamFailed = true;
  tdLive.requiredFrameTime = Number.POSITIVE_INFINITY;
  window.clearTimeout(tdLive.retryTimer || 0);
  window.clearTimeout(tdLive.streamFailTimer || 0);
  tdLive.retryTimer = 0;
  tdLive.streamFailTimer = 0;
  if (ui.experienceLiveImage) {
    ui.experienceLiveImage.onload = null;
    ui.experienceLiveImage.classList.add("is-disabled");
    ui.experienceLiveImage.removeAttribute("src");
    ui.experienceLiveImage.src = "";
  }
  if (state.activeView === "design") {
    drawToeProgramFrameToCanvas();
    updateExperienceLabels();
  }
  if (state.activeView === "experience") renderTdCollectionStage();
}

let THREE = null;
let GLTFLoader = null;
let OBJLoader = null;
let MTLLoader = null;
let cloneSkeletonModel = null;
const design3d = {
  renderer: null,
  scene: null,
  camera: null,
  productGroup: null,
  loader: null,
  modelCache: new Map(),
  texture: null,
  material: null,
  shadow: null,
  dragging: false,
  eventsBound: false,
  panning: false,
  pointer: null,
  rotationX: -0.06,
  rotationY: -0.28,
  panX: 0,
  panY: 0,
  distance: 6.8,
  ready: false
};

function setDesignStatus(message = "") {
  const help = ui.designStage?.querySelector(".design-help");
  if (!help) return;
  help.textContent = message || "拖动旋转 / 滚轮缩放 / Shift 平移";
  help.setAttribute("aria-live", "polite");
}

const designFallback = {
  key: "",
  canvas: null,
  textureKey: "",
  mockupImage: null,
  mockupLoaded: false
};
const artProcessor = {
  key: "",
  width: 0,
  height: 0,
  sourceCanvas: artSourceCanvas,
  sourceCtx: artSourceCanvas.getContext("2d", { willReadFrequently: true }),
  sourceData: null,
  hasSourcePixels: false,
  currentCanvas: null,
  nextCanvas: null,
  nextCtx: null,
  nextImageData: null,
  currentT: 0,
  nextT: 0,
  timeStep: 0.42,
  computeY: 0,
  computing: false,
  inTransition: false,
  transitionStart: 0,
  transitionDuration: 1500
};

function seededRandom(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = value * 16807 % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function hashString(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return hash;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function setCopy(element, copy) {
  element.innerHTML = "";
  const lines = Array.isArray(copy) ? copy : [copy];
  lines.forEach((line) => {
    const span = document.createElement("span");
    span.textContent = line;
    element.appendChild(span);
  });
}

function normalizeList(value) {
  return Array.isArray(value)
    ? value.filter(Boolean)
    : String(value || "").split(/[、,，/]/).map((entry) => entry.trim()).filter(Boolean);
}

function joinList(value, fallback = "待补充") {
  const list = normalizeList(value);
  return list.length ? list.join("、") : fallback;
}

function inferEmotionMeaning(sample) {
  const words = normalizeList(sample?.asset?.words || sample?.category?.words);
  const note = sample?.asset?.note || "";
  if (words.some((word) => /寿|长寿/.test(word)) || /寿|长寿/.test(note)) return "长寿安康、福泽延绵";
  if (words.some((word) => /圆|团|团花|团形/.test(word)) || /团圆|圆满/.test(note)) return "团圆圆满、祝福聚合";
  if (words.some((word) => /牡丹|富贵|金/.test(word)) || /富贵|繁盛/.test(note)) return "富贵繁盛、礼庆庄重";
  if (words.some((word) => /瑞兽|凤|龙|祥云/.test(word)) || /祥瑞|护佑|祈福/.test(note)) return "祥瑞护佑、喜庆祈愿";
  if (words.some((word) => /花|植物|藤/.test(word)) || /生命|丰饶|兴旺/.test(note)) return "生命繁盛、家族兴旺";
  if (words.some((word) => /回纹|连续|满地纹/.test(word)) || /绵延|连续/.test(note)) return "绵延不断、秩序稳定";
  return "吉祥祈愿、情感寄托";
}

function inferAdaptScenes(sample) {
  const words = normalizeList(sample?.asset?.words || sample?.category?.words);
  const category = sample?.category?.id || "";
  if (category === "symbol" || words.some((word) => /寿|福|喜|如意|祥云/.test(word))) return "节庆礼品、杯器、手袋、包装视觉";
  if (category === "nature" || words.some((word) => /花|植物|牡丹|藤/.test(word))) return "服饰面料、靠垫、围巾、家居软装";
  if (category === "geometry" || words.some((word) => /回纹|菱形|方|连续/.test(word))) return "边饰系统、坐垫、笔记本、织物满铺";
  if (category === "material") return "材质实验、近景纹理、产品表面肌理";
  if (category === "space") return "大面积铺陈、床品、毯子、空间软装";
  return "节庆陈设、文创载体、礼俗场景";
}

function localContextForSample(sample) {
  const asset = sample?.asset || {};
  return {
    source: asset.source || "福文化织锦样本",
    category: sample?.category?.label || "福文化纹样",
    page: sample?.page ? `第${sample.page}页 / 编号${String(sample.book || 0).padStart(3, "0")}` : `编号${String(sample?.book || 0).padStart(3, "0")}`,
    words: joinList(asset.words || sample?.category?.words),
    meaning: inferEmotionMeaning(sample),
    scenes: inferAdaptScenes(sample),
    note: asset.note || sampleIntro(sample)
  };
}

function productLabel(productKey = state.designProduct) {
  return productConfigs[productKey]?.label || "当前载体";
}

function generationMethodLabel(source = selectedDesignSource()) {
  if (source?.type === "frame") return "镜像回环生成";
  if (state.effectPaused && state.frameDataUrl) return "定格帧生成";
  return "原纹样转译";
}

function sourceFrameLabel(source = selectedDesignSource()) {
  if (source?.type === "frame") return source.frame?.treatment || source.frame?.remix || "saved-frame";
  if (state.effectPaused && state.frameDataUrl) return "paused-live-frame";
  return "original-sample";
}

function designParameters() {
  return {
    tiling: state.designTiling,
    patternScale: Number(state.designPatternScale.toFixed(2)),
    rotation: Number(state.designPatternRotation.toFixed(2)),
    productScale: Number(state.designScale.toFixed(2)),
    background: ui.designBackground?.value || "studio",
    lockRatio: !!ui.designLockRatio?.checked
  };
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp >= 0 && hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

function makeColorTile(hue, seed) {
  const rand = seededRandom(seed);
  const tile = document.createElement("canvas");
  tile.width = 48;
  tile.height = 48;
  const tctx = tile.getContext("2d");
  const base = hslToRgb(hue, 0.42 + rand() * 0.28, 0.34 + rand() * 0.22);
  tctx.fillStyle = `rgb(${base.r}, ${base.g}, ${base.b})`;
  tctx.fillRect(0, 0, 48, 48);
  for (let i = 0; i < 9; i += 1) {
    const c = hslToRgb((hue + rand() * 58 - 29 + 360) % 360, 0.35 + rand() * 0.45, 0.22 + rand() * 0.5);
    tctx.globalAlpha = 0.35 + rand() * 0.45;
    tctx.fillStyle = `rgb(${c.r}, ${c.g}, ${c.b})`;
    tctx.fillRect(Math.floor(rand() * 42), Math.floor(rand() * 42), 5 + rand() * 18, 5 + rand() * 18);
  }
  tctx.globalAlpha = 1;
  return tile;
}

function buildSamples() {
  const total = 882;
  const built = [];
  const ringRand = seededRandom(20260607);
  for (let i = 0; i < total; i += 1) {
    const asset = curatedBrocadeAssets[i % curatedBrocadeAssets.length];
    const category = categoryById[asset.category] || categories[i % categories.length];
    const { image, tile } = mediaForAsset(asset);
    const file = asset.file;
    const hue = (i * 137.508 + (i % 17) * 6) % 360;
    const angle = (hue - 35) * Math.PI / 180;
    const radius = 235 + Math.sqrt(ringRand()) * 405;
    const noise = seededRandom(hashString(`${file}-${i}`));
    const colorX = world.centerX + Math.cos(angle) * radius + (noise() - 0.5) * 230;
    const colorY = world.centerY + Math.sin(angle) * radius * 0.86 + (noise() - 0.5) * 210;
    const categoryIndex = categories.findIndex((entry) => entry.id === category.id);
    const clusterAngle = (-145 + categoryIndex * 58) * Math.PI / 180;
    const clusterRadius = 280 + Math.sqrt(noise()) * 280;
    const contentX = world.centerX + Math.cos(clusterAngle) * clusterRadius + (noise() - 0.5) * 260;
    const contentY = world.centerY + Math.sin(clusterAngle) * clusterRadius * 0.82 + (noise() - 0.5) * 230;
    const year = category.year + Math.floor(noise() * 32);
    built.push({
      id: `sample-${i}`,
      file,
      image,
      tile,
      colorTile: makeColorTile(hue, hashString(`${file}-color-${i}`)),
      asset,
      category,
      categoryIndex,
      hue,
      year,
      page: asset.page,
      book: i + 1,
      colorX,
      colorY,
      contentX,
      contentY,
      size: 9 + noise() * 10,
      text: `${asset.title} ${asset.note} ${category.label} ${category.words.join(" ")} ${asset.words.join(" ")} ${file}`.toLowerCase()
    });
  }
  samples = built;
}

function positionFor(sample) {
  return state.mode === "content"
    ? { x: sample.contentX, y: sample.contentY }
    : { x: sample.colorX, y: sample.colorY };
}

function maxVisibleIndex() {
  return Math.max(40, Math.round(samples.length * state.timelineProgress));
}

function filteredSamples() {
  const maxIndex = maxVisibleIndex();
  return samples.filter((sample, index) => index < maxIndex && (!state.activeCategory || sample.category.id === state.activeCategory || state.mode === "color"));
}

function resize() {
  state.dpr = Math.min(window.devicePixelRatio || 1, 2);
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = Math.round(state.width * state.dpr);
  canvas.height = Math.round(state.height * state.dpr);
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  experienceCanvas.width = Math.round(state.width * state.dpr);
  experienceCanvas.height = Math.round(state.height * state.dpr);
  experienceCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  resizeDetailEffectCanvas();
  fitView(false);
  state.needsRender = true;
}

function resizeDetailEffectCanvas() {
  const rect = detailEffectCanvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width * state.dpr));
  const height = Math.max(1, Math.round(rect.height * state.dpr));
  if (detailEffectCanvas.width !== width || detailEffectCanvas.height !== height) {
    detailEffectCanvas.width = width;
    detailEffectCanvas.height = height;
  }
  detailEffectCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
}

function fitView(animated = true) {
  const scaleX = state.width / world.width;
  const scaleY = state.height / world.height;
  const scale = Math.min(scaleX, scaleY) * 0.72;
  const centerX = world.centerX - 75;
  const centerY = world.centerY + 18;
  setView(centerX, centerY, scale, animated);
}

function setView(x, y, scale, animated = true) {
  state.targetScale = clamp(scale, 0.35, 4.8);
  state.targetX = x - state.width / (2 * state.targetScale);
  state.targetY = y - state.height / (2 * state.targetScale);
  if (!animated) {
    state.scale = state.targetScale;
    state.x = state.targetX;
    state.y = state.targetY;
  }
  state.needsRender = true;
}

function worldToScreen(x, y) {
  return {
    x: (x - state.x) * state.scale,
    y: (y - state.y) * state.scale
  };
}

function screenToWorld(x, y) {
  return {
    x: state.x + x / state.scale,
    y: state.y + y / state.scale
  };
}

function zoomAt(screenX, screenY, factor) {
  const oldScale = state.targetScale;
  const newScale = clamp(oldScale * factor, 0.35, 4.8);
  const worldX = state.targetX + screenX / oldScale;
  const worldY = state.targetY + screenY / oldScale;
  state.targetScale = newScale;
  state.targetX = worldX - screenX / newScale;
  state.targetY = worldY - screenY / newScale;
  state.needsRender = true;
}

function drawBackground() {
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, state.width, state.height);
}

function drawSample(sample) {
  const pos = positionFor(sample);
  const screen = worldToScreen(pos.x, pos.y);
  const size = sample.size * state.scale;
  if (screen.x < -30 || screen.x > state.width + 30 || screen.y < -30 || screen.y > state.height + 30) return;
  const selected = state.selectedId === sample.id;
  const hover = state.hoverId === sample.id;
  const source = state.mode === "color" || state.scale < 1.08 || !isDrawableMedia(sample.tile)
    ? sample.colorTile : sample.tile;
  ctx.save();
  ctx.globalAlpha = selected || hover ? 1 : 0.84;
  if (selected || hover) {
    ctx.shadowColor = "rgba(0,0,0,.22)";
    ctx.shadowBlur = 10;
  }
  const drawSize = selected || hover ? size * 1.45 : size;
  ctx.drawImage(source, screen.x - drawSize / 2, screen.y - drawSize / 2, drawSize, drawSize);
  if (selected || hover) {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(screen.x - drawSize / 2, screen.y - drawSize / 2, drawSize, drawSize);
  }
  ctx.restore();
}

function render() {
  if (!state.needsRender) return;
  drawBackground();
  filteredSamples().forEach(drawSample);
  state.needsRender = false;
}

function sourceImageFor(sample, preferFull = false) {
  if (!sample) return null;
  if (preferFull) ensureAssetImage(sample.image);
  if (preferFull && isDrawableMedia(sample.image)) return sample.image;
  if (isDrawableMedia(sample.tile)) return sample.tile;
  return isDrawableMedia(sample.image) ? sample.image : null;
}

function drawableSize(media) {
  return {
    width: media.naturalWidth || media.videoWidth || media.width || 1,
    height: media.naturalHeight || media.videoHeight || media.height || 1
  };
}

function mediaWidth(media) {
  return drawableSize(media).width;
}

function mediaHeight(media) {
  return drawableSize(media).height;
}

function drawImageCover(targetCtx, img, width, height) {
  if (!isDrawableMedia(img)) return;
  const sourceW = mediaWidth(img);
  const sourceH = mediaHeight(img);
  const scale = Math.max(width / sourceW, height / sourceH);
  const drawW = sourceW * scale;
  const drawH = sourceH * scale;
  targetCtx.drawImage(img, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
}

function drawImageCoverBleed(targetCtx, img, width, height, bleed = 1.035) {
  if (!isDrawableMedia(img)) return;
  const sourceW = mediaWidth(img);
  const sourceH = mediaHeight(img);
  const scale = Math.max(width / sourceW, height / sourceH) * bleed;
  const drawW = sourceW * scale;
  const drawH = sourceH * scale;
  targetCtx.drawImage(img, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
}

function trimmedSourceRect(img) {
  const sourceW = mediaWidth(img);
  const sourceH = mediaHeight(img);
  const key = img.currentSrc || img.src || `${sourceW}x${sourceH}`;
  if (trimCache.has(key)) return trimCache.get(key);
  const fallback = {
    sx: sourceW * 0.085,
    sy: sourceH * 0.085,
    sw: Math.max(1, sourceW * 0.83),
    sh: Math.max(1, sourceH * 0.83)
  };
  if (!sourceW || !sourceH) {
    trimCache.set(key, fallback);
    return fallback;
  }
  const maxProbeSize = 320;
  const probeScale = Math.min(1, maxProbeSize / Math.max(sourceW, sourceH));
  const probeW = Math.max(1, Math.round(sourceW * probeScale));
  const probeH = Math.max(1, Math.round(sourceH * probeScale));
  const trimCanvas = document.createElement("canvas");
  trimCanvas.width = probeW;
  trimCanvas.height = probeH;
  const trimCtx = trimCanvas.getContext("2d", { willReadFrequently: true });
  trimCtx.drawImage(img, 0, 0, probeW, probeH);
  try {
    const data = trimCtx.getImageData(0, 0, probeW, probeH).data;
    let minX = probeW;
    let minY = probeH;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < probeH; y += 1) {
      for (let x = 0; x < probeW; x += 1) {
        const index = (x + y * probeW) * 4;
        const alpha = data[index + 3];
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const saturation = Math.max(r, g, b) - Math.min(r, g, b);
        const brightness = (r + g + b) / 3;
        const motifPixel = saturation > 24 || brightness < 214;
        if (alpha > 16 && motifPixel) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    if (minX > maxX || minY > maxY) {
      trimCache.set(key, fallback);
      return fallback;
    }
    const invScale = 1 / probeScale;
    const pad = Math.max(2, Math.round(invScale * 2));
    const sx = clamp(Math.floor(minX * invScale) - pad, 0, sourceW - 1);
    const sy = clamp(Math.floor(minY * invScale) - pad, 0, sourceH - 1);
    const rect = {
      sx,
      sy,
      sw: clamp(Math.ceil((maxX - minX + 1) * invScale) + pad * 2, 1, sourceW - sx),
      sh: clamp(Math.ceil((maxY - minY + 1) * invScale) + pad * 2, 1, sourceH - sy)
    };
    trimCache.set(key, rect);
    return rect;
  } catch {
    trimCache.set(key, fallback);
    return fallback;
  }
}

function drawImageCoverTrimmed(targetCtx, img, width, height) {
  if (!isDrawableMedia(img)) return;
  const rect = trimmedSourceRect(img);
  const scale = Math.max(width / rect.sw, height / rect.sh);
  const drawW = rect.sw * scale;
  const drawH = rect.sh * scale;
  targetCtx.drawImage(img, rect.sx, rect.sy, rect.sw, rect.sh, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
}

function designTileSourceRect(img) {
  const sourceW = mediaWidth(img);
  const sourceH = mediaHeight(img);
  const trimmed = trimmedSourceRect(img);
  const hasDetectedBorder = trimmed.sw < sourceW * 0.94 || trimmed.sh < sourceH * 0.94;
  const base = hasDetectedBorder ? trimmed : {
    sx: sourceW * 0.08,
    sy: sourceH * 0.08,
    sw: sourceW * 0.84,
    sh: sourceH * 0.84
  };
  const inset = state.designTiling === "large" ? 0.035 : 0.12;
  const inner = {
    sx: base.sx + base.sw * inset,
    sy: base.sy + base.sh * inset,
    sw: Math.max(1, base.sw * (1 - inset * 2)),
    sh: Math.max(1, base.sh * (1 - inset * 2))
  };
  const side = Math.max(1, Math.min(inner.sw, inner.sh));
  return {
    sx: clamp(inner.sx + (inner.sw - side) / 2, 0, sourceW - side),
    sy: clamp(inner.sy + (inner.sh - side) / 2, 0, sourceH - side),
    sw: side,
    sh: side
  };
}

function drawImageCoverFromRect(targetCtx, img, rect, width, height) {
  if (!isDrawableMedia(img)) return;
  const scale = Math.max(width / rect.sw, height / rect.sh);
  const drawW = rect.sw * scale;
  const drawH = rect.sh * scale;
  targetCtx.drawImage(img, rect.sx, rect.sy, rect.sw, rect.sh, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
}

function drawImageContain(targetCtx, img, width, height) {
  if (!isDrawableMedia(img)) return;
  const sourceW = mediaWidth(img);
  const sourceH = mediaHeight(img);
  const scale = Math.min(width / sourceW, height / sourceH);
  const drawW = sourceW * scale;
  const drawH = sourceH * scale;
  targetCtx.drawImage(img, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
}

function cssUrl(value) {
  return `url("${String(value || "").replace(/"/g, "%22")}")`;
}

const productConfigs = {
  pillow: { label: "靠垫", kind: "pillowShowcase", model: "assets/models/throw_pillows_01/throw_pillows_01_1k.gltf", targetSize: 2.55, rotation: [0, -0.24, 0], position: [0, 0.1, 0], fallbackProduct: "pillow" },
  scarf: {
    label: "围巾",
    kind: "scarfShowcase",
    fallbackProduct: "scarf"
  },
  socks: { label: "运动袜", kind: "socks", obj: "assets/models/rigmodels-socks/4MXDB4XFSN6Y16MMDQKFBRRQ2.obj", mtl: "assets/models/rigmodels-socks/4MXDB4XFSN6Y16MMDQKFBRRQ2.mtl", targetSize: 2.72, rotation: [-0.03, -0.2, 0], position: [0, 0.22, 0], generatePaintUvs: true, forcePaintUvs: true, fallbackProduct: "socks" },
  dress: {
    label: "连衣裙",
    kind: "dress",
    obj: "assets/models/makehuman-f-dress-11/f_dress_11.obj",
    targetSize: 2.12,
    rotation: [0, -0.14, 0],
    position: [0, 0.26, 0],
    generatePaintUvs: true,
    forcePaintUvs: true,
    fallbackProduct: "dress"
  },
  cup: {
    label: "杯子",
    kind: "mug",
    obj: "assets/models/user_mug_14/mug_14_split.obj",
    mtl: "assets/models/user_mug_14/mug_14_split.mtl",
    targetSize: 2.9,
    rotation: [0, 0.02, 0],
    position: [0, 0.22, 0],
    paintNames: ["mug_body"],
    generatePaintUvs: true,
    forcePaintUvs: true,
    uvProjection: "cylindrical",
    preserveUnpaintedMaterial: true,
    textureRepeatScale: 0.72,
    fallbackProduct: "mug"
  },
  cushion: { label: "靠枕", kind: "pillow", model: "assets/models/throw_pillows_01/throw_pillows_01_1k.gltf", targetSize: 2.28, rotation: [0, 0.06, 0], position: [0, 0.38, 0], hideNames: ["pillow01"], fallbackProduct: "cushion" },
  seat: { label: "坐垫套装", kind: "seat", model: "assets/models/silk-pouf.glb", targetSize: 2.7, rotation: [0, 0.35, 0], position: [0, 0.86, 0], fallbackProduct: "seat" },
  bedding: { label: "床品", kind: "bed", model: "assets/models/vintage_day_bed/vintage_day_bed_1k.gltf", targetSize: 3.1, rotation: [0, 0.46, 0], position: [0, 0.08, 0], keepOriginalMaterial: true, supplement: "beddingTextile", fallbackProduct: "bedding" },
  shirt_m: { label: "T恤衫男士", kind: "shirt", model: "assets/models/poly_pizza/t_shirt_nour.glb", targetSize: 2.42, rotation: [0, -0.28, 0], position: [0, 1.02, 0], fallbackProduct: "shirt_m" },
  shirt_w: { label: "T恤衫女士", kind: "shirt", model: "assets/models/poly_pizza/t_shirt_nour.glb", targetSize: 2.24, rotation: [0, 0.28, 0], position: [0, 1.02, 0], fallbackProduct: "shirt_w" },
  blanket: { label: "毯子", kind: "blanketShowcase", fallbackProduct: "blanket" },
  silk_scarf: {
    label: "丝巾",
    kind: "openScarfModel",
    model: "assets/models/sheen_cloth/SheenCloth.gltf",
    targetSize: 2.28,
    rotation: [-0.82, 0.42, -0.22],
    position: [0, 0.32, 0],
    generatePaintUvs: true,
    forcePaintUvs: true,
    uvProjection: "top",
    bakeNormalizeGeometry: true,
    textureRepeatScale: 0.5,
    fallbackProduct: "silk_scarf"
  },
  leggings: { label: "紧身弹力裤", kind: "leggingsShowcase", fallbackProduct: "leggings" },
  notebook: { label: "笔记本", kind: "notebook", supplementOnly: true, rotation: [-0.58, 0.12, -0.1], supplement: "notebookCover", textureRepeatScale: 0.46, fallbackProduct: "notebook" },
  mug: {
    label: "咖啡杯",
    kind: "mug",
    obj: "assets/models/user_mug_14/mug_14_split.obj",
    mtl: "assets/models/user_mug_14/mug_14_split.mtl",
    targetSize: 2.9,
    rotation: [0, 0.02, 0],
    position: [0, 0.22, 0],
    paintNames: ["mug_body"],
    generatePaintUvs: true,
    forcePaintUvs: true,
    uvProjection: "cylindrical",
    preserveUnpaintedMaterial: true,
    textureRepeatScale: 0.72,
    fallbackProduct: "mug"
  },
  handbag_photo: { label: "包包样机", kind: "photoMockup", image: "assets/product-mockups/luoshen-handbag.jpg", fallbackProduct: "notebook" }
};

function currentDesignSample() {
  return state.designSource || state.effectSource || currentSample() || samples[0];
}

function sampleDisplayTitle(sample) {
  if (!sample) return "福文化纹样";
  return sample.asset?.title || `样本 ${String(sample.book).padStart(3, "0")}`;
}

function sampleIntro(sample) {
  if (!sample) return "以织锦图像作为福文化纹样样本，观察其图案、色彩和构成关系。";
  return sample.asset?.note || sample.category?.copy?.[0] || "以织锦图像作为福文化纹样样本，观察其图案、色彩和构成关系。";
}

function sampleMetaLine(sample) {
  if (!sample) return "福文化纹样";
  return `${sample.category?.label || "福文化纹样"} / 第${sample.page}页 / 编号${String(sample.book).padStart(3, "0")}`;
}

function sampleForFrame(frame) {
  return frame?.sample || samples.find((entry) => entry.id === frame?.sampleId) || state.effectSource || currentSample() || samples[0];
}

function frameDisplayTitle(frame, sample = sampleForFrame(frame)) {
  const base = frame?.sourceTitle || sampleDisplayTitle(sample);
  if (frame?.label && frame.label.includes("衍生织纹")) return frame.label;
  return `${base} 衍生织纹`;
}

function frameIntro(frame, sample = sampleForFrame(frame)) {
  return `由${sampleDisplayTitle(sample)}生成的定格织纹，可进入满屏影像，也可继续用于造物。`;
}

function createDataList(items, className) {
  const list = document.createElement("dl");
  list.className = className;
  items.forEach(([term, description]) => {
    const row = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = term;
    dd.textContent = description || "待补充";
    row.append(dt, dd);
    list.appendChild(row);
  });
  return list;
}

function renderDetailContextCard(sample) {
  if (!ui.detailContextCard || !sample) return;
  const context = localContextForSample(sample);
  ui.detailContextCard.innerHTML = "";
  const title = document.createElement("h3");
  title.textContent = "在地语境";
  ui.detailContextCard.append(
    title,
    createDataList([
      ["来源线索", context.source],
      ["类别", context.category],
      ["页码/编号", context.page],
      ["符号关键词", context.words],
      ["情感语义", context.meaning],
      ["适配场景", context.scenes]
    ], "context-list")
  );
}

function currentTranslationPath() {
  const source = selectedDesignSource();
  const sample = source?.sample || currentDesignSample();
  const context = localContextForSample(sample);
  return {
    sample,
    source,
    title: sampleDisplayTitle(sample),
    method: generationMethodLabel(source),
    retained: context.words,
    carrier: productLabel(),
    frameSource: sourceFrameLabel(source),
    parameters: designParameters()
  };
}

function renderTranslationPathCard() {
  if (!ui.designTranslationCard) return;
  const path = currentTranslationPath();
  ui.designTranslationCard.innerHTML = "";
  const title = document.createElement("h3");
  title.textContent = "转译路径";
  const flow = document.createElement("div");
  flow.className = "translation-flow";
  ["原始纹样", "生成织纹", "应用载体"].forEach((label, index) => {
    const span = document.createElement("span");
    span.textContent = label;
    flow.appendChild(span);
    if (index < 2) flow.appendChild(document.createElement("i"));
  });
  ui.designTranslationCard.append(
    title,
    flow,
    createDataList([
      ["纹样", path.title],
      ["生成方式", path.method],
      ["保留特征", path.retained],
      ["当前载体", `应用于${path.carrier}`]
    ], "translation-list")
  );
}

function loadResearchRecords() {
  try {
    const stored = JSON.parse(localStorage.getItem("fu-culture-user-study") || "[]");
    if (Array.isArray(stored)) researchRecords.push(...stored);
  } catch {
    // Ignore corrupt local records.
  }
  updateResearchRecordCount();
}

function persistResearchRecords() {
  try {
    localStorage.setItem("fu-culture-user-study", JSON.stringify(researchRecords));
  } catch {
    // Storage may be unavailable in strict browser modes.
  }
  updateResearchRecordCount();
}

function updateResearchRecordCount() {
  if (ui.researchRecordCount) ui.researchRecordCount.textContent = String(researchRecords.length);
}

function currentResearchRecordBase() {
  const path = currentTranslationPath();
  return {
    sampleId: path.sample?.id || "",
    patternName: path.title,
    generatedFrameSource: path.frameSource,
    carrierType: path.carrier,
    generationMethod: path.method,
    retainedFeatures: path.retained,
    parameters: path.parameters
  };
}

function openResearchDialog() {
  if (!ui.researchStudyDialog) return;
  ui.researchStudyDialog.classList.add("is-open");
  ui.researchStudyDialog.setAttribute("aria-hidden", "false");
}

function closeResearchDialog() {
  if (!ui.researchStudyDialog) return;
  ui.researchStudyDialog.classList.remove("is-open");
  ui.researchStudyDialog.setAttribute("aria-hidden", "true");
}

function collectResearchScores(form) {
  const scoreNames = [
    "localClarity",
    "meaningRecognition",
    "featureRetention",
    "translationCoherence",
    "carrierFit",
    "emotionDelivery"
  ];
  return Object.fromEntries(scoreNames.map((name) => [name, Number(form.elements[name]?.value || 0)]));
}

function submitResearchRecord(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const reasons = Array.from(form.querySelectorAll('input[name="reason"]:checked')).map((input) => input.value);
  const record = {
    ...currentResearchRecordBase(),
    scores: collectResearchScores(form),
    reasons,
    note: String(form.elements.note?.value || "").trim(),
    timestamp: new Date().toISOString()
  };
  researchRecords.push(record);
  persistResearchRecords();
  form.reset();
  form.querySelectorAll('.research-score-grid input[type="range"]').forEach((input) => {
    input.value = "4";
    const value = input.parentElement?.querySelector("strong");
    if (value) value.textContent = input.value;
  });
  closeResearchDialog();
}

function flattenResearchRecord(record) {
  return {
    sampleId: record.sampleId,
    patternName: record.patternName,
    generatedFrameSource: record.generatedFrameSource,
    carrierType: record.carrierType,
    generationMethod: record.generationMethod,
    retainedFeatures: record.retainedFeatures,
    parameters: JSON.stringify(record.parameters || {}),
    localClarity: record.scores?.localClarity,
    meaningRecognition: record.scores?.meaningRecognition,
    featureRetention: record.scores?.featureRetention,
    translationCoherence: record.scores?.translationCoherence,
    carrierFit: record.scores?.carrierFit,
    emotionDelivery: record.scores?.emotionDelivery,
    reasons: (record.reasons || []).join(" / "),
    note: record.note || "",
    timestamp: record.timestamp
  };
}

function downloadBlob(content, fileName, type) {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.remove();
  }, 0);
}

function exportResearchJson() {
  downloadBlob(JSON.stringify(researchRecords, null, 2), "fu-culture-user-study.json", "application/json;charset=utf-8");
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function exportResearchCsv() {
  const rows = researchRecords.map(flattenResearchRecord);
  const headers = rows[0] ? Object.keys(rows[0]) : Object.keys(flattenResearchRecord({ scores: {}, parameters: {} }));
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))
  ].join("\n");
  downloadBlob(csv, "fu-culture-user-study.csv", "text/csv;charset=utf-8");
}

function designSources() {
  const sources = [];
  frameFavorites.forEach((frame, index) => {
    if (!frame) return;
    const sample = sampleForFrame(frame);
    sources.push({
      key: `frame-${index}`,
      type: "frame",
      label: frameDisplayTitle(frame, sample),
      sample,
      frame,
      src: frame.frame
    });
  });
  favorites.forEach((sample) => {
    sources.push({
      key: `sample-${sample.id}`,
      type: "sample",
      label: sampleDisplayTitle(sample),
      sample,
      src: sampleImageUrl(sample)
    });
  });
  return sources;
}

function fallbackDesignSource(source) {
  const sample = source?.sample || source || currentSample() || state.effectSource || samples[0];
  return {
    key: sample ? `fallback-${sample.id}` : "fallback",
    type: "fallback",
    label: sampleDisplayTitle(sample) || "当前纹样",
    sample,
    src: source?.frame || sampleImageUrl(sample)
  };
}

function selectedDesignSource(source) {
  const sources = designSources();
  if (source?.frame) {
    const matchedFrame = sources.find((entry) => entry.type === "frame" && entry.sample?.id === source.sample?.id && entry.src === source.frame);
    if (matchedFrame) return matchedFrame;
    return {
      key: `direct-frame-${source.sample?.id || "sample"}`,
      type: "frame",
      label: frameDisplayTitle(source, source.sample),
      sample: source.sample,
      src: source.frame
    };
  }
  if (source?.id) {
    const matched = sources.find((entry) => entry.type === "sample" && entry.sample?.id === source.id);
    if (matched) return matched;
  }
  if (state.designSourceKey) {
    const matched = sources.find((entry) => entry.key === state.designSourceKey);
    if (matched) return matched;
  }
  return sources[0] || fallbackDesignSource(source);
}

function tdSourceFromSample(sample) {
  if (!sample) return null;
  return {
    key: `sample-${sample.id}`,
    label: sample.asset?.title || sample.category?.label || "纹样",
    src: sampleImageUrl(sample)
  };
}

function tdSourceFromFrame(frame) {
  if (!frame?.frame) return null;
  return {
    key: `frame-${frame.sampleId || "sample"}-${frame.time || 0}-${String(frame.frame).length}`,
    label: frame.label || "创新纹样",
    src: frame.frame
  };
}

function resetTdLiveFrame() {
  tdLive.ready = false;
  tdLive.loading = false;
  tdLive.loader = null;
  tdLive.lastRequest = 0;
  tdLive.frameVersion = 0;
  tdLive.frameLoadedAt = 0;
  if (ui.experienceLiveImage) {
    ui.experienceLiveImage.removeAttribute("src");
    ui.experienceLiveImage.src = "";
  }
}

function tdEndpoint(base, path) {
  return `${base.replace(/\/+$/, "")}${path}`;
}

function pageCanUseTouchDesigner() {
  return USE_TOUCHDESIGNER_BRIDGE && document.visibilityState !== "hidden";
}

async function connectTouchDesignerBridgeOnce() {
  if (!pageCanUseTouchDesigner()) return false;
  if (tdLive.autoLaunchTried || tdLive.autoLaunchInFlight) return false;
  tdLive.autoLaunchInFlight = true;
  try {
    for (const base of TD_BRIDGE_BASES) {
      if (!base) continue;
      try {
        const response = await fetch(tdEndpoint(base, "/td-launch"), { cache: "no-store" });
        if (!response.ok) continue;
        const result = await response.json().catch(() => ({}));
        if (!result?.ok) continue;
        tdLive.bridgeBase = base;
        tdLive.inputEndpoint = tdEndpoint(base, "/td-input");
        tdLive.streamEndpoint = tdEndpoint(base, "/td-stream");
        tdLive.bridgeConnected = true;
        tdLive.status = result;
        tdLive.statusCheckedAt = performance.now();
        tdLive.autoLaunchTried = true;
        return true;
      } catch {
        // The local bridge may not be running yet.
      }
    }
  } finally {
    tdLive.autoLaunchInFlight = false;
  }
  tdLive.autoLaunchTried = true;
  disableTouchDesignerBridge();
  return false;
}

async function readTdStatus(base = tdLive.bridgeBase, force = false) {
  if (!pageCanUseTouchDesigner() && !force) return tdLive.status;
  const now = performance.now();
  if (!force && tdLive.status && now - tdLive.statusCheckedAt < tdLive.statusMinGap) {
    return tdLive.status;
  }
  if (!force && tdLive.statusPromise) return tdLive.statusPromise;
  const statusPromise = (async () => {
    const bases = uniqueList([base, ...TD_BRIDGE_BASES]);
    for (const candidate of bases) {
      if (!candidate) continue;
      try {
        const response = await fetch(tdEndpoint(candidate, "/td-status"));
        if (!response.ok) continue;
        const status = await response.json();
        if (!status?.bridge) continue;
        tdLive.bridgeBase = candidate;
        tdLive.inputEndpoint = tdEndpoint(candidate, "/td-input");
        tdLive.streamEndpoint = tdEndpoint(candidate, "/td-stream");
        tdLive.bridgeConnected = true;
        tdLive.status = status;
        tdLive.statusCheckedAt = performance.now();
        return status;
      } catch {
        // Try the next local bridge candidate.
      }
    }
    tdLive.statusCheckedAt = performance.now();
    if (!force) disableTouchDesignerBridge();
    return null;
  })();
  tdLive.statusPromise = statusPromise;
  try {
    return await statusPromise;
  } finally {
    if (tdLive.statusPromise === statusPromise) tdLive.statusPromise = null;
  }
}

function normalizeTdInputSource(source) {
  if (!source) return "";
  if (source.startsWith("data:") || /^https?:\/\//i.test(source)) return source;
  try {
    return new URL(source, window.location.href).href;
  } catch {
    return source;
  }
}

async function sendTouchDesignerInput(source) {
  if (!source?.src) return;
  if (!pageCanUseTouchDesigner()) return;
  state.tdInputSource = source;
  const sourceKey = source.key;
  if (tdLive.sourceKey === sourceKey && !source.src.startsWith("data:")) return;
  if (tdLive.retryTimer) {
    window.clearTimeout(tdLive.retryTimer);
    tdLive.retryTimer = 0;
  }
  tdLive.sourceKey = sourceKey;
  tdLive.inputSending = true;
  tdLive.bridgeConnected = false;
  tdLive.requiredFrameTime = Number.POSITIVE_INFINITY;
  resetTdLiveFrame();
  await connectTouchDesignerBridgeOnce();
  try {
    const payload = JSON.stringify({
      src: normalizeTdInputSource(source.src),
      label: source.label || "纹样"
    });
    let lastError = null;
    for (const base of TD_BRIDGE_BASES) {
      try {
        const response = await fetch(tdEndpoint(base, "/td-input"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: payload
        });
        if (!response.ok) throw new Error(`td input ${response.status}`);
        const result = await response.json().catch(() => ({}));
        tdLive.bridgeBase = base;
        tdLive.inputEndpoint = tdEndpoint(base, "/td-input");
        tdLive.streamEndpoint = tdEndpoint(base, "/td-stream");
        tdLive.status = result;
        tdLive.streamFailed = false;
        tdLive.bridgeConnected = true;
        tdLive.requiredFrameTime = Math.max(result.input_mtime_ms || 0, Date.now() - 50);
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError) throw lastError;
    requestTdLiveFrame(true);
  } catch {
    tdLive.bridgeConnected = false;
    tdLive.requiredFrameTime = Number.POSITIVE_INFINITY;
    tdLive.sourceKey = "";
    tdLive.retryTimer = window.setTimeout(() => {
      tdLive.retryTimer = 0;
      sendTouchDesignerInput(source);
    }, 900);
  } finally {
    tdLive.inputSending = false;
    if (state.activeView === "design") updateExperienceLabels();
  }
}

function drawTdImageCover(ctx, img, width, height) {
  const sourceW = mediaWidth(img);
  const sourceH = mediaHeight(img);
  const scale = Math.max(width / sourceW, height / sourceH);
  const drawW = sourceW * scale;
  const drawH = sourceH * scale;
  ctx.drawImage(img, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
}

function tdMirrorLinePath(ctx, width, height, degrees, keepPositive) {
  const angle = degrees * Math.PI / 180;
  const nx = -Math.sin(angle);
  const ny = Math.cos(angle);
  const size = Math.max(width, height) * 3;
  const cx = width / 2;
  const cy = height / 2;
  const side = keepPositive ? 1 : -1;
  ctx.beginPath();
  ctx.moveTo(cx + Math.cos(angle) * size, cy + Math.sin(angle) * size);
  ctx.lineTo(cx - Math.cos(angle) * size, cy - Math.sin(angle) * size);
  ctx.lineTo(cx - Math.cos(angle) * size + nx * size * side, cy - Math.sin(angle) * size + ny * size * side);
  ctx.lineTo(cx + Math.cos(angle) * size + nx * size * side, cy + Math.sin(angle) * size + ny * size * side);
  ctx.closePath();
}

function drawTdMirrorPass(targetCtx, sourceCanvas, width, height, degrees) {
  const cx = width / 2;
  const cy = height / 2;
  targetCtx.drawImage(sourceCanvas, 0, 0, width, height);

  targetCtx.save();
  tdMirrorLinePath(targetCtx, width, height, degrees, false);
  targetCtx.clip();
  targetCtx.translate(cx, cy);
  targetCtx.rotate(degrees * Math.PI / 180);
  targetCtx.scale(1, -1);
  targetCtx.rotate(-degrees * Math.PI / 180);
  targetCtx.translate(-cx, -cy);
  targetCtx.drawImage(sourceCanvas, 0, 0, width, height);
  targetCtx.restore();
}

function ensureTdProgramCanvas(index, width, height) {
  const canvas = tdProgram.canvases[index];
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  return tdProgram.ctxs[index];
}

function drawToeFitOutside(ctx, img, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  drawImageCover(ctx, img, width, height);
}

function drawToeTile(ctx, sourceCanvas, width, height, time) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  const cropTop = 0.698;
  const overlapU = 0.137;
  const tileW = width * (1 - overlapU);
  const tileH = height;
  const drift = (time * width * 0.018) % tileW;
  const yShift = -height * cropTop;
  for (let y = -tileH * 2 + yShift; y < height + tileH * 2; y += tileH) {
    for (let x = -tileW - drift; x < width + tileW; x += tileW) {
      ctx.save();
      const flipX = Math.round((x + drift) / tileW) % 2 !== 0;
      const flipY = Math.round((y - yShift) / tileH) % 2 !== 0;
      ctx.translate(x + tileW / 2, y + tileH / 2);
      ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
      ctx.drawImage(sourceCanvas, -tileW / 2, -tileH / 2, tileW, tileH);
      ctx.restore();
    }
  }
}

function drawToeExtendedImage(ctx, sourceCanvas, width, height, radius = 2) {
  for (let row = -radius; row <= radius; row += 1) {
    for (let col = -radius; col <= radius; col += 1) {
      const x = -width / 2 + col * width;
      const y = -height / 2 + row * height;
      ctx.save();
      ctx.translate(x + width / 2, y + height / 2);
      ctx.scale(Math.abs(col) % 2 ? -1 : 1, Math.abs(row) % 2 ? -1 : 1);
      ctx.drawImage(sourceCanvas, -width / 2, -height / 2, width, height);
      ctx.restore();
    }
  }
}

function drawToeTransform(ctx, sourceCanvas, width, height, options = {}) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = options.background || "#000";
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2, height / 2);
  if (options.rotate) ctx.rotate(options.rotate);
  const scaleX = options.scaleX ?? options.scale ?? 1;
  const scaleY = options.scaleY ?? options.scale ?? 1;
  ctx.scale(scaleX, scaleY);
  if (options.extend === "mirror") drawToeExtendedImage(ctx, sourceCanvas, width, height, options.radius || 2);
  else ctx.drawImage(sourceCanvas, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function drawToeMirror(ctx, sourceCanvas, width, height, degrees) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  drawTdMirrorPass(ctx, sourceCanvas, width, height, degrees);
}

function toeSourceForFrame(frame) {
  if (isDrawableMedia(frame?.sourceFrameImage)) return frame.sourceFrameImage;
  if (frame?.frame) {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      frame.sourceFrameImage = image;
      if (state.activeView === "design") drawActiveEffect();
    };
    image.src = frame.frame;
    frame.sourceFrameImage = image;
    return image;
  }
  return null;
}

function toeCurrentSourceImage() {
  if (isDrawableMedia(state.effectFrameImage)) return state.effectFrameImage;
  const sample = state.effectSource || currentSample() || samples[0];
  return sourceImageFor(sample, true);
}

function drawToeSourceProgram(targetCtx, targetWidth, targetHeight, sourceImage, options = {}) {
  const img = isDrawableMedia(sourceImage) ? sourceImage : null;
  if (!img || !mediaWidth(img)) return false;
  const width = Math.max(1, Math.round(targetWidth));
  const height = Math.max(1, Math.round(targetHeight));
  const time = options.time ?? state.effectTime ?? performance.now() / 1000;
  const lfo = Math.sin(time * Math.PI * 2 * 0.05);
  const scale = 1 + ((lfo + 1) / 2) * 0.6;
  const rotate = time * 3 * Math.PI / 180;

  const fitCtx = ensureTdProgramCanvas(0, width, height);
  drawToeFitOutside(fitCtx, img, width, height);

  const tileCtx = ensureTdProgramCanvas(1, width, height);
  drawToeTile(tileCtx, tdProgram.canvases[0], width, height, time);

  const transform2Ctx = ensureTdProgramCanvas(2, width, height);
  drawToeTransform(transform2Ctx, tdProgram.canvases[1], width, height, { scale, extend: "mirror", radius: 2 });

  const transform1Ctx = ensureTdProgramCanvas(3, width, height);
  drawToeTransform(transform1Ctx, tdProgram.canvases[2], width, height, { rotate, extend: "mirror", radius: 2 });

  let sourceCanvas = tdProgram.canvases[3];
  tdProgram.mirrorAngles.forEach((degrees, index) => {
    const ctx = ensureTdProgramCanvas(4 + index, width, height);
    drawToeMirror(ctx, sourceCanvas, width, height, degrees);
    sourceCanvas = tdProgram.canvases[4 + index];
  });

  targetCtx.clearRect(0, 0, width, height);
  targetCtx.fillStyle = "#000";
  targetCtx.fillRect(0, 0, width, height);
  targetCtx.drawImage(sourceCanvas, 0, 0, width, height);
  return true;
}

function finishOfflineToeFrame(targetCtx, width, height, time, options = {}) {
  const card = !!options.card;
  targetCtx.save();
  targetCtx.globalCompositeOperation = "soft-light";
  targetCtx.globalAlpha = card ? 0.18 : 0.22;
  const wash = targetCtx.createLinearGradient(0, 0, width, height);
  wash.addColorStop(0, "rgba(255,244,226,.4)");
  wash.addColorStop(0.48, "rgba(255,255,255,.08)");
  wash.addColorStop(1, "rgba(45,30,20,.45)");
  targetCtx.fillStyle = wash;
  targetCtx.fillRect(0, 0, width, height);
  targetCtx.restore();

  targetCtx.save();
  targetCtx.globalCompositeOperation = "screen";
  targetCtx.globalAlpha = card ? 0.04 : 0.055;
  targetCtx.fillStyle = "#fffaf0";
  const yOffset = (time * 9) % 6;
  for (let y = yOffset; y < height; y += 6) targetCtx.fillRect(0, y, width, 1);
  const xOffset = (time * 5) % 8;
  for (let x = xOffset; x < width; x += 8) targetCtx.fillRect(x, 0, 1, height);
  targetCtx.restore();

  targetCtx.save();
  targetCtx.globalCompositeOperation = "multiply";
  const vignette = targetCtx.createRadialGradient(
    width * 0.5,
    height * 0.48,
    Math.min(width, height) * 0.12,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.74
  );
  vignette.addColorStop(0, "rgba(255,255,255,0)");
  vignette.addColorStop(0.7, "rgba(65,44,35,.08)");
  vignette.addColorStop(1, "rgba(30,22,18,.26)");
  targetCtx.fillStyle = vignette;
  targetCtx.fillRect(0, 0, width, height);
  targetCtx.restore();
}

function drawOfflineToeAccent(targetCtx, width, height, source, time, options = {}) {
  if (!offlineToeProgramCtx || !isDrawableMedia(source) || !mediaWidth(source)) return;
  if (offlineToeProgramCanvas.width !== width || offlineToeProgramCanvas.height !== height) {
    offlineToeProgramCanvas.width = width;
    offlineToeProgramCanvas.height = height;
  }
  offlineToeProgramCtx.setTransform(1, 0, 0, 1, 0, 0);
  if (!drawToeSourceProgram(offlineToeProgramCtx, width, height, source, { time, card: !!options.card })) return;
  targetCtx.save();
  targetCtx.globalCompositeOperation = "screen";
  targetCtx.globalAlpha = options.card ? 0.12 : 0.18;
  targetCtx.drawImage(offlineToeProgramCanvas, 0, 0, width, height);
  targetCtx.restore();
}

function drawOfflineTouchDesignerFrame(targetCtx, targetWidth, targetHeight, source, time) {
  if (!offlineToeProgramCtx || !isDrawableMedia(source) || !mediaWidth(source)) return false;
  const width = Math.max(1, Math.round(targetWidth));
  const height = Math.max(1, Math.round(targetHeight));
  const renderScale = Math.min(window.devicePixelRatio || 1, 2);
  const outputW = clamp(Math.round(Math.max(width, height * 16 / 9) * renderScale), 640, 1600);
  const outputH = Math.round(outputW * 9 / 16);
  if (offlineToeProgramCanvas.width !== outputW || offlineToeProgramCanvas.height !== outputH) {
    offlineToeProgramCanvas.width = outputW;
    offlineToeProgramCanvas.height = outputH;
  }
  offlineToeProgramCtx.setTransform(1, 0, 0, 1, 0, 0);
  if (!drawToeSourceProgram(offlineToeProgramCtx, outputW, outputH, source, { time })) return false;
  targetCtx.clearRect(0, 0, width, height);
  drawImageCoverBleed(targetCtx, offlineToeProgramCanvas, width, height, 1.04);
  return true;
}

function drawWebGeneratedToeFrame(targetCtx, targetWidth, targetHeight, options = {}) {
  const width = Math.max(1, Math.round(targetWidth));
  const height = Math.max(1, Math.round(targetHeight));
  const source = options.source || toeCurrentSourceImage();
  if (isDrawableMedia(source) && mediaWidth(source)) {
    const time = options.time ?? state.effectTime ?? performance.now() / 1000;
    return drawOfflineTouchDesignerFrame(targetCtx, width, height, source, time);
  }
  targetCtx.clearRect(0, 0, width, height);
  targetCtx.fillStyle = "#050505";
  targetCtx.fillRect(0, 0, width, height);
  targetCtx.fillStyle = "rgba(255,255,255,.82)";
  targetCtx.font = "800 18px Inter, system-ui, sans-serif";
  targetCtx.textAlign = "center";
  targetCtx.textBaseline = "middle";
  targetCtx.fillText("等待织纹载入", width / 2, height / 2);
  return false;
}

function tdLiveFrameUrl() {
  const base = tdLive.bridgeConnected && tdLive.bridgeBase ? `${tdLive.bridgeBase}/` : window.location.href;
  const url = new URL(TD_LIVE_FRAME_PATH, base);
  url.searchParams.set("v", String(Date.now()));
  return url.href;
}

function applyImageCrossOrigin(img, src) {
  let protocol = "";
  try {
    protocol = new URL(src, window.location.href).protocol;
  } catch {
    protocol = "";
  }
  if (protocol === "http:" || protocol === "https:") {
    img.crossOrigin = "anonymous";
  } else {
    img.removeAttribute("crossorigin");
    img.crossOrigin = null;
  }
}

function tdStreamUrl() {
  if (!tdLive.streamEndpoint) {
    tdLive.streamEndpoint = tdEndpoint(tdLive.bridgeBase || TD_BRIDGE_BASES[0] || "", "/td-stream");
  }
  return `${tdLive.streamEndpoint}?v=${Date.now()}`;
}

function frameIsCurrent(frameTime) {
  return Number.isFinite(tdLive.requiredFrameTime) && frameTime >= tdLive.requiredFrameTime;
}

function requestTdLiveFrame(force = false) {
  if (!pageCanUseTouchDesigner() && !force) return;
  if (state.effectPaused && !force) return;
  const now = performance.now();
  if (tdLive.loading || (!force && now - tdLive.lastRequest < tdLive.requestGap)) return;
  tdLive.loading = true;
  tdLive.lastRequest = now;
  tdLive.nextUrl = tdLiveFrameUrl();
  const loader = new Image();
  tdLive.loader = loader;
  loader.decoding = "async";
  applyImageCrossOrigin(loader, tdLive.nextUrl);
  loader.onload = () => {
    if (tdLive.loader !== loader) return;
    readTdStatus(tdLive.bridgeBase, force).then((status) => {
      if (tdLive.loader !== loader) return;
      if (status) tdLive.status = status;
      const frameTime = status?.frame_mtime_ms || Date.now();
      if (!frameIsCurrent(frameTime)) {
        tdLive.loading = false;
        tdLive.ready = false;
        tdLive.failedAt = performance.now();
        if (state.activeView === "design") updateExperienceLabels();
        return;
      }
      if (tdLive.ready && tdLive.frameLoadedAt && frameTime <= tdLive.frameLoadedAt) {
        tdLive.loading = false;
        if (state.activeView === "design") updateExperienceLabels();
        return;
      }
      tdLive.image = loader;
      tdLive.loading = false;
      tdLive.ready = true;
      tdLive.frameLoadedAt = frameTime;
      tdLive.frameVersion += 1;
      if (state.activeView === "design") updateExperienceLabels();
    });
  };
  loader.onerror = () => {
    if (tdLive.loader !== loader) return;
    tdLive.loading = false;
    tdLive.failedAt = performance.now();
    if (!tdLive.ready && state.activeView === "design") updateExperienceLabels();
  };
  loader.src = tdLive.nextUrl;
}

function tdLiveOnline() {
  return tdLive.ready && frameIsCurrent(tdLive.frameLoadedAt) && isDrawableMedia(tdLive.image) && mediaWidth(tdLive.image) > 1;
}

function drawTdLiveFrame(targetCtx, targetWidth, targetHeight, options = {}) {
  if (!USE_TOUCHDESIGNER_BRIDGE) {
    return drawWebGeneratedToeFrame(targetCtx, targetWidth, targetHeight, {
      source: toeCurrentSourceImage(),
      time: state.effectTime ?? performance.now() / 1000
    });
  }
  requestTdLiveFrame(options.force);
  const width = Math.max(1, Math.round(targetWidth));
  const height = Math.max(1, Math.round(targetHeight));
  if (!tdLiveOnline()) {
    const fallbackSource = currentLiveImageSource();
    if (fallbackSource) {
      targetCtx.clearRect(0, 0, width, height);
      drawImageCover(targetCtx, fallbackSource, width, height);
      return true;
    }
    targetCtx.clearRect(0, 0, width, height);
    targetCtx.fillStyle = "#050505";
    targetCtx.fillRect(0, 0, width, height);
    targetCtx.fillStyle = "rgba(255,255,255,.82)";
    targetCtx.font = "700 15px Inter, system-ui, sans-serif";
    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "middle";
    targetCtx.fillText(tdLive.inputSending ? "织纹正在入场" : tdLive.waitingText, width / 2, height / 2);
    return false;
  }
  targetCtx.clearRect(0, 0, width, height);
  drawImageCover(targetCtx, tdLive.image, width, height);
  return true;
}

function refreshTdStreamImage(img) {
  if (!img) return;
  if (!pageCanUseTouchDesigner()) {
    window.clearTimeout(img._tdFrameTimer || 0);
    img._tdFrameTimer = window.setTimeout(() => refreshTdStreamImage(img), 900);
    return;
  }
  window.clearTimeout(img._tdFrameTimer || 0);
  img._tdStopped = false;
  const nextUrl = tdLive.streamMode === "stream" && !tdLive.streamFailed ? tdStreamUrl() : tdLiveFrameUrl();
  const token = Date.now();
  img._tdFrameToken = token;
  const loader = new Image();
  loader.decoding = "async";
  applyImageCrossOrigin(loader, nextUrl);
  loader.onload = () => {
    if (img._tdStopped || img._tdFrameToken !== token) return;
    readTdStatus().then((status) => {
      if (img._tdStopped || img._tdFrameToken !== token) return;
      if (status) tdLive.status = status;
      const frameTime = status?.frame_mtime_ms || Date.now();
      if (!frameIsCurrent(frameTime)) {
        tdLive.ready = false;
        if (img === ui.experienceLiveImage) drawExperienceLivePlaceholder(true);
        if (state.activeView === "design") updateExperienceLabels();
        img._tdFrameTimer = window.setTimeout(() => refreshTdStreamImage(img), 320);
        return;
      }
      if (tdLive.ready && tdLive.frameLoadedAt && frameTime <= tdLive.frameLoadedAt && img.getAttribute("src")) {
        if (state.activeView === "design") updateExperienceLabels();
        img._tdFrameTimer = window.setTimeout(() => refreshTdStreamImage(img), state.effectPaused ? 900 : 320);
        return;
      }
      applyImageCrossOrigin(img, nextUrl);
      img.src = nextUrl;
      if (img === ui.experienceLiveImage) experienceCanvas.classList.remove("is-live-placeholder");
      tdLive.image = loader;
      tdLive.ready = true;
      tdLive.frameLoadedAt = frameTime;
      tdLive.frameVersion += 1;
      if (state.activeView === "design") updateExperienceLabels();
      if (tdLive.streamMode !== "stream" || tdLive.streamFailed) {
        img._tdFrameTimer = window.setTimeout(() => refreshTdStreamImage(img), state.effectPaused ? 900 : 260);
      }
    });
  };
  loader.onerror = () => {
    if (img._tdStopped || img._tdFrameToken !== token) return;
    tdLive.streamFailed = true;
    window.clearTimeout(tdLive.streamFailTimer);
    tdLive.streamFailTimer = window.setTimeout(() => {
      tdLive.streamFailed = false;
    }, 1600);
    if (img === ui.experienceLiveImage) drawExperienceLivePlaceholder(true);
    img._tdFrameTimer = window.setTimeout(() => refreshTdStreamImage(img), 500);
  };
  loader.src = nextUrl;
}

function stopTdStreamImage(img) {
  if (!img) return;
  img._tdStopped = true;
  window.clearTimeout(img._tdFrameTimer || 0);
  img._tdFrameTimer = 0;
  if (img === ui.experienceLiveImage) experienceCanvas.classList.remove("is-live-placeholder");
  if (img !== ui.experienceLiveImage) {
    img.removeAttribute("src");
    img.src = "";
  }
}

function stopInactiveTdStreams(active = "") {
  if (active !== "detail") stopTdStreamImage(ui.detailLiveImage);
  if (active !== "design") stopTdStreamImage(ui.experienceLiveImage);
  if (active !== "experience" && ui.tdStageVisual) {
    ui.tdStageVisual.querySelectorAll(".td-live-image").forEach((element) => {
      if (element.tagName === "IMG") stopTdStreamImage(element);
      tdPreviewCanvases.delete(element);
    });
  }
}

function startExperienceLiveStream() {
  experienceCanvas.classList.remove("has-paused-frame");
  if (!USE_TOUCHDESIGNER_BRIDGE) {
    if (ui.experienceLiveImage) {
      ui.experienceLiveImage.onload = null;
      ui.experienceLiveImage.classList.add("is-disabled");
      ui.experienceLiveImage.removeAttribute("src");
      ui.experienceLiveImage.src = "";
    }
    experienceCanvas.classList.add("is-web-generated");
    drawToeProgramFrameToCanvas();
    return;
  }
  drawExperienceLivePlaceholder(true);
  if (ui.experienceLiveImage) {
    ui.experienceLiveImage.onload = () => {
      tdLive.ready = true;
      experienceCanvas.classList.remove("is-live-placeholder");
      if (state.activeView === "design") updateExperienceLabels();
    };
  }
  refreshTdStreamImage(ui.experienceLiveImage);
}

function stopExperienceLiveStream() {
  if (!USE_TOUCHDESIGNER_BRIDGE) return;
  if (ui.experienceLiveImage) ui.experienceLiveImage.onload = null;
  stopTdStreamImage(ui.experienceLiveImage);
}

function handlePageVisibilityChange() {
  if (document.visibilityState === "hidden") {
    if (tdLive.retryTimer) {
      window.clearTimeout(tdLive.retryTimer);
      tdLive.retryTimer = 0;
    }
    stopExperienceLiveStream();
    if (ui.tdStageVisual) {
      ui.tdStageVisual.querySelectorAll(".td-live-image").forEach((element) => {
        if (element.tagName === "IMG") stopTdStreamImage(element);
        tdPreviewCanvases.delete(element);
      });
    }
    return;
  }
  if (state.tdInputSource) sendTouchDesignerInput(state.tdInputSource);
  if (state.activeView === "design") startExperienceLiveStream();
  if (state.activeView === "experience") renderTdCollectionStage();
}

function currentLiveImageSource() {
  if (!USE_TOUCHDESIGNER_BRIDGE && experienceCanvas?.width) return experienceCanvas;
  if (isDrawableMedia(ui.experienceLiveImage) && mediaWidth(ui.experienceLiveImage) > 1) return ui.experienceLiveImage;
  if (tdLiveOnline()) return tdLive.image;
  return null;
}

function captureExperienceLiveFrame(forceSnapshot = false) {
  if (!USE_TOUCHDESIGNER_BRIDGE) {
    const drew = drawToeProgramFrameToCanvas();
    if (!drew) return false;
    experienceCanvas.classList.add("has-paused-frame");
    updateFramePreview(experienceCanvas);
    return true;
  }
  const source = currentLiveImageSource();
  if (!source) {
    if (forceSnapshot) drawTdLiveFrame(experienceCtx, state.width, state.height, { force: true });
    return false;
  }
  experienceCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  experienceCtx.clearRect(0, 0, state.width, state.height);
  drawImageCover(experienceCtx, source, state.width, state.height);
  if (state.effectPaused || forceSnapshot) experienceCanvas.classList.add("has-paused-frame");
  else experienceCanvas.classList.remove("has-paused-frame", "is-live-placeholder");
  updateFramePreview(experienceCanvas);
  return true;
}

function drawExperienceLivePlaceholder(force = false) {
  if (state.activeView !== "design" || state.effectPaused) return;
  experienceCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  const drew = drawTdLiveFrame(experienceCtx, state.width, state.height, { force });
  experienceCanvas.classList.toggle("is-live-placeholder", !drew);
  if (!drew) {
    experienceCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    experienceCtx.clearRect(0, 0, state.width, state.height);
    experienceCtx.fillStyle = "#050505";
    experienceCtx.fillRect(0, 0, state.width, state.height);
    experienceCtx.fillStyle = "rgba(255,255,255,.82)";
    experienceCtx.font = "800 18px Inter, system-ui, sans-serif";
    experienceCtx.textAlign = "center";
    experienceCtx.textBaseline = "middle";
    experienceCtx.fillText(tdLive.bridgeConnected ? "等待织纹进入影像" : "影像通道未连接", state.width / 2, state.height / 2);
  }
}

function clearExperienceCapturedFrame() {
  experienceCanvas.classList.remove("has-paused-frame", "is-live-placeholder");
  state.frameDataUrl = "";
  [ui.dragFrame, ui.detailDragFrame].forEach((button) => {
    if (button) button.style.removeProperty("--frame-thumb");
  });
}

function clearDetailCapturedFrame() {
  detailEffectCanvas.classList.remove("has-captured-frame");
}

function captureTdStreamToCanvas(canvas, targetCtx, width, height) {
  requestTdLiveFrame(true);
  if (!tdLiveOnline()) return false;
  canvas.classList.add("has-captured-frame");
  targetCtx.clearRect(0, 0, width, height);
  drawImageCover(targetCtx, tdLive.image, width, height);
  return true;
}

function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function drawSoftKaleidoscopeBackground(targetCtx, width, height, phase) {
  const warm = smoothstep(0.28, 0.82, phase);
  const cx = width * (0.48 + Math.sin(phase * Math.PI * 2) * 0.08);
  const cy = height * (0.42 + Math.cos(phase * Math.PI * 2) * 0.06);
  const gradient = targetCtx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.9);
  gradient.addColorStop(0, `rgba(${Math.round(218 + warm * 26)}, ${Math.round(224 - warm * 22)}, ${Math.round(255 - warm * 35)}, 1)`);
  gradient.addColorStop(0.48, `rgba(${Math.round(230 + warm * 22)}, ${Math.round(222 + warm * 8)}, ${Math.round(232 + warm * 8)}, 1)`);
  gradient.addColorStop(1, `rgba(${Math.round(182 + warm * 70)}, ${Math.round(174 + warm * 36)}, ${Math.round(190 + warm * 32)}, 1)`);
  targetCtx.fillStyle = gradient;
  targetCtx.fillRect(0, 0, width, height);
}

function createKaleidoscopeMotif(img, time, size, options = {}) {
  const sourceW = mediaWidth(img);
  const sourceH = mediaHeight(img);
  const segments = options.segments || 12;
  const patch = document.createElement("canvas");
  patch.width = size;
  patch.height = size;
  const patchCtx = patch.getContext("2d");
  const orbit = time * 0.2 + (options.offset || 0);
  const cropSize = Math.min(sourceW, sourceH) * (options.cropScale || 0.48);
  const cropX = clamp(sourceW * (0.5 + Math.sin(orbit) * 0.22) - cropSize / 2, 0, Math.max(0, sourceW - cropSize));
  const cropY = clamp(sourceH * (0.5 + Math.cos(orbit * 0.73) * 0.22) - cropSize / 2, 0, Math.max(0, sourceH - cropSize));
  patchCtx.save();
  patchCtx.translate(size / 2, size / 2);
  patchCtx.rotate(time * 0.18);
  patchCtx.scale(1.18, 1.18);
  patchCtx.translate(-size / 2, -size / 2);
  patchCtx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, size, size);
  patchCtx.restore();

  patchCtx.save();
  patchCtx.globalAlpha = 0.34;
  patchCtx.globalCompositeOperation = "screen";
  patchCtx.filter = "blur(1.2px) saturate(1.3)";
  patchCtx.drawImage(img, 0, 0, sourceW, sourceH, -size * 0.08, -size * 0.08, size * 1.16, size * 1.16);
  patchCtx.restore();

  const motif = document.createElement("canvas");
  motif.width = size;
  motif.height = size;
  const motifCtx = motif.getContext("2d");
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.49;
  const slice = Math.PI * 2 / segments;

  motifCtx.save();
  motifCtx.filter = "saturate(1.08) contrast(1.04)";
  motifCtx.drawImage(patch, 0, 0, size, size);
  motifCtx.restore();

  motifCtx.save();
  motifCtx.translate(cx, cy);
  for (let index = 0; index < segments; index += 1) {
    motifCtx.save();
    motifCtx.rotate(index * slice);
    motifCtx.beginPath();
    motifCtx.moveTo(0, 0);
    motifCtx.arc(0, 0, radius, -slice * 0.58, slice * 0.58);
    motifCtx.closePath();
    motifCtx.clip();
    if (index % 2) motifCtx.scale(-1, 1);
    motifCtx.rotate(time * 0.05);
    motifCtx.drawImage(patch, -radius, -radius, radius * 2, radius * 2);
    motifCtx.restore();
  }
  motifCtx.restore();

  motifCtx.save();
  motifCtx.translate(cx, cy);
  motifCtx.globalCompositeOperation = "screen";
  motifCtx.globalAlpha = 0.55;
  motifCtx.strokeStyle = "rgba(255,255,255,.8)";
  motifCtx.lineWidth = Math.max(1, size * 0.018);
  for (let index = 0; index < segments; index += 1) {
    motifCtx.rotate(slice);
    motifCtx.beginPath();
    motifCtx.moveTo(radius * 0.18, 0);
    motifCtx.lineTo(radius * 0.86, 0);
    motifCtx.stroke();
  }
  motifCtx.globalAlpha = 0.42;
  motifCtx.lineWidth = Math.max(1, size * 0.01);
  motifCtx.beginPath();
  motifCtx.arc(0, 0, radius * 0.62, 0, Math.PI * 2);
  motifCtx.stroke();
  motifCtx.restore();
  return motif;
}

function drawKaleidoscopeMotif(targetCtx, motif, x, y, size, rotation = 0, alpha = 1, options = {}) {
  targetCtx.save();
  targetCtx.translate(x, y);
  targetCtx.rotate(rotation);
  targetCtx.globalAlpha = alpha;
  if (options.filter) targetCtx.filter = options.filter;
  if (options.blend) targetCtx.globalCompositeOperation = options.blend;
  targetCtx.drawImage(motif, -size / 2, -size / 2, size, size);
  targetCtx.restore();
}

function portableCropRect(img, time, variant = 0) {
  const sourceW = mediaWidth(img);
  const sourceH = mediaHeight(img);
  const base = Math.min(sourceW, sourceH);
  const cropSide = Math.max(1, base * (0.52 + Math.sin(time * 0.17 + variant) * 0.08));
  const travelX = Math.max(0, sourceW - cropSide);
  const travelY = Math.max(0, sourceH - cropSide);
  const xPhase = 0.5 + Math.sin(time * (0.11 + variant * 0.018) + variant * 1.7) * 0.38;
  const yPhase = 0.5 + Math.cos(time * (0.13 + variant * 0.021) + variant * 1.1) * 0.38;
  return {
    sx: clamp(travelX * xPhase, 0, travelX),
    sy: clamp(travelY * yPhase, 0, travelY),
    sw: cropSide,
    sh: cropSide
  };
}

function drawPortablePatch(ctx, img, crop, x, y, size, flipX, flipY, rotate = 0) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.clip();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate(rotate);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, -size / 2, -size / 2, size, size);
  ctx.restore();
}

function createPortableMirrorTile(img, time, tileSize, variant = 0) {
  const size = Math.max(96, Math.round(tileSize));
  const half = size / 2;
  const tile = document.createElement("canvas");
  tile.width = size;
  tile.height = size;
  const tileCtx = tile.getContext("2d");
  const crop = portableCropRect(img, time, variant);
  const rotate = Math.sin(time * 0.09 + variant) * 0.18;

  tileCtx.fillStyle = "#12100d";
  tileCtx.fillRect(0, 0, size, size);
  drawPortablePatch(tileCtx, img, crop, 0, 0, half, false, false, rotate);
  drawPortablePatch(tileCtx, img, crop, half, 0, half, true, false, -rotate);
  drawPortablePatch(tileCtx, img, crop, 0, half, half, false, true, -rotate);
  drawPortablePatch(tileCtx, img, crop, half, half, half, true, true, rotate);

  tileCtx.save();
  tileCtx.globalCompositeOperation = "soft-light";
  tileCtx.globalAlpha = 0.38;
  tileCtx.translate(size / 2, size / 2);
  tileCtx.rotate(Math.PI / 4 + Math.sin(time * 0.05 + variant) * 0.08);
  tileCtx.drawImage(tile, -size * 0.62, -size * 0.62, size * 1.24, size * 1.24);
  tileCtx.restore();

  tileCtx.save();
  tileCtx.globalCompositeOperation = "multiply";
  tileCtx.globalAlpha = 0.1;
  tileCtx.fillStyle = "#3b2a23";
  tileCtx.fillRect(0, 0, size, size);
  tileCtx.restore();

  tileCtx.save();
  tileCtx.globalCompositeOperation = "screen";
  tileCtx.globalAlpha = 0.12;
  tileCtx.strokeStyle = "#fff7e5";
  tileCtx.lineWidth = Math.max(1, size * 0.004);
  for (let x = 0; x <= size; x += size / 8) {
    tileCtx.beginPath();
    tileCtx.moveTo(x, 0);
    tileCtx.lineTo(x, size);
    tileCtx.stroke();
  }
  for (let y = 0; y <= size; y += size / 8) {
    tileCtx.beginPath();
    tileCtx.moveTo(0, y);
    tileCtx.lineTo(size, y);
    tileCtx.stroke();
  }
  tileCtx.restore();

  return tile;
}

function fillPortablePatternLayer(targetCtx, tile, width, height, time, options = {}) {
  const pattern = targetCtx.createPattern(tile, "repeat");
  if (!pattern) return;
  const diagonal = Math.hypot(width, height);
  targetCtx.save();
  targetCtx.globalAlpha = options.alpha ?? 1;
  if (options.blend) targetCtx.globalCompositeOperation = options.blend;
  targetCtx.translate(width / 2, height / 2);
  targetCtx.rotate(options.rotate || 0);
  const scale = options.scale || 1;
  targetCtx.scale(scale, scale);
  targetCtx.translate(
    -diagonal + Math.sin(time * (options.driftRateX || 0.12)) * tile.width * 0.22,
    -diagonal + Math.cos(time * (options.driftRateY || 0.1)) * tile.height * 0.18
  );
  targetCtx.fillStyle = pattern;
  targetCtx.fillRect(0, 0, diagonal * 2.4, diagonal * 2.4);
  targetCtx.restore();
}

function drawPortableKaleidoscopeFrame(targetCtx, targetWidth, targetHeight, img, options = {}) {
  if (!isDrawableMedia(img) || !mediaWidth(img)) return false;
  const width = Math.max(1, Math.round(targetWidth));
  const height = Math.max(1, Math.round(targetHeight));
  const time = options.time ?? performance.now() / 1000;
  const baseSize = clamp(Math.min(width, height) * 0.62, 220, 520);
  const tileA = createPortableMirrorTile(img, time, baseSize, 0);
  const tileB = createPortableMirrorTile(img, time + 4.2, baseSize * 0.72, 2);
  const tileC = createPortableMirrorTile(img, time + 8.1, baseSize * 1.18, 5);

  targetCtx.clearRect(0, 0, width, height);
  targetCtx.fillStyle = "#15100d";
  targetCtx.fillRect(0, 0, width, height);
  fillPortablePatternLayer(targetCtx, tileC, width, height, time, {
    alpha: 0.92,
    rotate: Math.sin(time * 0.04) * 0.035,
    scale: 1.06,
    driftRateX: 0.08,
    driftRateY: 0.07
  });
  fillPortablePatternLayer(targetCtx, tileA, width, height, time, {
    alpha: 0.54,
    blend: "overlay",
    rotate: Math.PI / 4 + Math.sin(time * 0.035) * 0.04,
    scale: 0.96,
    driftRateX: 0.1,
    driftRateY: 0.09
  });
  fillPortablePatternLayer(targetCtx, tileB, width, height, time, {
    alpha: 0.28,
    blend: "soft-light",
    rotate: -Math.PI / 8 + Math.cos(time * 0.03) * 0.035,
    scale: 1.18,
    driftRateX: 0.13,
    driftRateY: 0.11
  });

  targetCtx.save();
  targetCtx.globalCompositeOperation = "multiply";
  const vignette = targetCtx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.08, width / 2, height / 2, Math.max(width, height) * 0.74);
  vignette.addColorStop(0, "rgba(255,255,255,0)");
  vignette.addColorStop(1, "rgba(50,32,24,.28)");
  targetCtx.fillStyle = vignette;
  targetCtx.fillRect(0, 0, width, height);
  targetCtx.restore();

  targetCtx.save();
  targetCtx.globalCompositeOperation = "screen";
  targetCtx.globalAlpha = 0.08;
  targetCtx.fillStyle = "#fff7e6";
  for (let y = (time * 8) % 7; y < height; y += 7) targetCtx.fillRect(0, y, width, 1);
  targetCtx.restore();
  return true;
}

function drawKaleidoscopeCluster(targetCtx, motif, x, y, size, rotation, alpha, sparseAmount) {
  if (sparseAmount < 0.45) {
    drawKaleidoscopeMotif(targetCtx, motif, x, y, size, rotation, alpha);
    return;
  }
  const lobeRadius = size * 0.2 * sparseAmount;
  for (let index = 0; index < 3; index += 1) {
    const angle = rotation + index * Math.PI * 2 / 3;
    drawKaleidoscopeMotif(
      targetCtx,
      motif,
      x + Math.cos(angle) * lobeRadius,
      y + Math.sin(angle) * lobeRadius,
      size * (0.78 + sparseAmount * 0.08),
      angle,
      alpha,
      { blend: "source-over" }
    );
  }
}

function drawTdMirrorEffect(targetCtx, targetWidth, targetHeight, img, options = {}) {
  if (!isDrawableMedia(img) || !mediaWidth(img)) return;
  const time = options.time ?? performance.now() / 1000;
  const card = !!options.card;
  const width = Math.max(1, Math.round(targetWidth));
  const height = Math.max(1, Math.round(targetHeight));
  const duration = 7.2;
  const phase = ((time % duration) + duration) % duration / duration;
  const denseAmount = smoothstep(0.1, 0.28, phase) * (1 - smoothstep(0.42, 0.64, phase));
  const sparseAmount = smoothstep(0.52, 0.92, phase);
  const blurAmount = (1 - smoothstep(0.02, 0.18, phase)) * 14 + smoothstep(0.88, 1, phase) * 2;
  const motifSize = card ? 320 : 520;
  const motif = createKaleidoscopeMotif(img, time, motifSize, {
    segments: sparseAmount > 0.72 ? 6 : denseAmount > 0.35 ? 14 : 10,
    cropScale: sparseAmount > 0.66 ? 0.34 : 0.48
  });
  const diagonal = Math.hypot(width, height);

  targetCtx.clearRect(0, 0, width, height);
  drawSoftKaleidoscopeBackground(targetCtx, width, height, phase);

  const backdropSize = diagonal * (0.34 + denseAmount * 0.1 + sparseAmount * 0.08);
  const backdropSpacing = backdropSize * (sparseAmount > 0.6 ? 1.58 : 0.86 + sparseAmount * 0.32);
  const rows = Math.ceil(height / backdropSpacing) + 3;
  const cols = Math.ceil(width / backdropSpacing) + 4;
  const driftX = Math.sin(time * 0.24) * backdropSpacing * 0.28;
  const driftY = Math.cos(time * 0.19) * backdropSpacing * 0.22;
  for (let row = -1; row < rows; row += 1) {
    for (let col = -1; col < cols; col += 1) {
      const x = col * backdropSpacing + (row % 2 ? backdropSpacing * 0.52 : 0) + driftX;
      const y = row * backdropSpacing + driftY;
      const edgeAlpha = denseAmount > 0.15 ? 0.62 : 0.34 + sparseAmount * 0.34;
      drawKaleidoscopeCluster(
        targetCtx,
        motif,
        x,
        y,
        backdropSize * (denseAmount > 0.25 ? 0.88 : 0.55 + sparseAmount * 0.08),
        time * 0.18 + (row + col) * 0.58,
        edgeAlpha,
        sparseAmount
      );
    }
  }

  const centerFade = 1 - smoothstep(0.66, 0.92, phase);
  const centerAlpha = Math.max(0.18, centerFade * 0.88);
  const centerSize = diagonal * (0.34 + (1 - sparseAmount) * 0.12 + Math.sin(time * 0.34) * 0.015);
  drawKaleidoscopeMotif(
    targetCtx,
    motif,
    width * (0.5 + Math.sin(time * 0.08) * 0.02),
    height * (0.5 + Math.cos(time * 0.07) * 0.02),
    centerSize,
    time * 0.16,
    centerAlpha,
    { filter: blurAmount ? `blur(${blurAmount * 0.28}px)` : "" }
  );

  if (blurAmount > 0.5) {
    targetCtx.save();
    targetCtx.filter = `blur(${blurAmount}px)`;
    targetCtx.globalCompositeOperation = "screen";
    targetCtx.globalAlpha = 0.42;
    drawKaleidoscopeMotif(targetCtx, motif, width / 2, height / 2, diagonal * 0.78, -time * 0.08, 1);
    targetCtx.restore();
  }

  targetCtx.save();
  targetCtx.globalCompositeOperation = "multiply";
  targetCtx.globalAlpha = 0.04 + denseAmount * 0.05;
  targetCtx.fillStyle = "#6c5f69";
  targetCtx.fillRect(0, 0, width, height);
  targetCtx.restore();
  targetCtx.save();
  targetCtx.globalCompositeOperation = "screen";
  targetCtx.globalAlpha = 0.12;
  targetCtx.fillStyle = "#fff";
  for (let y = (time * 10) % 9; y < height; y += 9) targetCtx.fillRect(0, y, width, 1);
  targetCtx.restore();
}

function renderTdMirrorCanvas(canvas) {
  const img = canvas._tdImage;
  if (!isDrawableMedia(img)) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const pixelW = Math.round(width * dpr);
  const pixelH = Math.round(height * dpr);
  if (canvas.width !== pixelW || canvas.height !== pixelH) {
    canvas.width = pixelW;
    canvas.height = pixelH;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawTdMirrorEffect(ctx, width, height, img, { card: canvas._tdCard });
}

function createTdMirrorPreview(src, options = {}) {
  const preview = document.createElement("canvas");
  preview.className = `td-mirror-preview${options.card ? " is-card" : ""}`;
  preview._tdCard = !!options.card;
  const image = new Image();
  image.decoding = "async";
  image.onload = () => renderTdMirrorCanvas(preview);
  image.src = src;
  preview._tdImage = image;
  tdPreviewCanvases.add(preview);
  window.setTimeout(() => renderTdMirrorCanvas(preview), 0);
  return preview;
}

function renderToeProgramPreviewCanvas(canvas) {
  const img = canvas._tdImage;
  if (!isDrawableMedia(img) || !mediaWidth(img)) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const pixelW = Math.round(width * dpr);
  const pixelH = Math.round(height * dpr);
  if (canvas.width !== pixelW || canvas.height !== pixelH) {
    canvas.width = pixelW;
    canvas.height = pixelH;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawWebGeneratedToeFrame(ctx, width, height, {
    source: img,
    time: performance.now() / 1000
  });
}

function createToeProgramPreview(src) {
  const preview = document.createElement("canvas");
  preview.className = "td-mirror-preview is-toe-program";
  preview._tdRenderMode = "toe-program";
  const image = new Image();
  image.decoding = "async";
  image.onload = () => renderToeProgramPreviewCanvas(preview);
  image.src = src;
  preview._tdImage = image;
  tdPreviewCanvases.add(preview);
  window.setTimeout(() => renderToeProgramPreviewCanvas(preview), 0);
  return preview;
}

function collectionVisualSource() {
  const frame = frameFavorites.find(Boolean);
  if (frame?.frame) return frame.frame;
  const sample = favorites[0]
    || currentSample()
    || state.effectSource
    || samples.find((entry) => entry.file === "kaleido-09.jpg")
    || samples.find((entry) => entry.file === "kaleido-16.jpg")
    || samples.find((entry) => entry.file === "kaleido-26.jpg")
    || samples[0];
  return sampleImageUrl(sample);
}

function clearTdCollectionStage() {
  if (!ui.tdCollectionStage || !ui.tdStageVisual) return;
  ui.tdStageVisual.querySelectorAll(".td-live-image").forEach((element) => {
    if (element.tagName === "IMG") stopTdStreamImage(element);
    tdPreviewCanvases.delete(element);
  });
  ui.tdStageVisual.innerHTML = "";
  ui.tdCollectionStage.hidden = true;
}

function renderTdCollectionStage() {
  if (!ui.tdCollectionStage || !ui.tdStageVisual) return;
  ui.tdStageVisual.innerHTML = "";
  ui.tdCollectionStage.hidden = false;
  if (!USE_TOUCHDESIGNER_BRIDGE) {
    const source = collectionVisualSource();
    const preview = createToeProgramPreview(source);
    preview.classList.add("td-live-image");
    preview.setAttribute("aria-label", "镜像生成影像");
    ui.tdStageVisual.appendChild(preview);
    return;
  }
  const image = document.createElement("img");
  image.className = "td-live-image";
  image.alt = "实时生成影像";
  image.decoding = "async";
  ui.tdStageVisual.appendChild(image);
  refreshTdStreamImage(image);
}

function collectionTdSource(sample = currentSample() || state.effectSource || samples[0]) {
  const frame = frameFavorites.find(Boolean);
  if (frame?.frame) return tdSourceFromFrame(frame);
  if (favorites[0]) return tdSourceFromSample(favorites[0]);
  return tdSourceFromSample(sample);
}

function stopToeProgram() {}

function drawToeProgramFrameToCanvas() {
  if (USE_TOUCHDESIGNER_BRIDGE) {
    const source = currentLiveImageSource();
    if (source) {
      experienceCanvas.classList.remove("has-paused-frame", "is-live-placeholder", "is-web-generated");
      return true;
    }
    return captureExperienceLiveFrame();
  }
  if (ui.experienceLiveImage) {
    ui.experienceLiveImage.onload = null;
    ui.experienceLiveImage.classList.add("is-disabled");
    ui.experienceLiveImage.removeAttribute("src");
    ui.experienceLiveImage.src = "";
  }
  experienceCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  experienceCanvas.classList.add("is-web-generated");
  const drew = drawWebGeneratedToeFrame(experienceCtx, state.width, state.height, {
    source: toeCurrentSourceImage(),
    time: state.effectTime ?? performance.now() / 1000
  });
  experienceCanvas.classList.toggle("is-live-placeholder", !drew);
  if (drew && !state.effectPaused) experienceCanvas.classList.remove("has-paused-frame");
  return drew;
}

function drawToeProgramFrameToDetailCanvas() {
  resizeDetailEffectCanvas();
  const width = detailEffectCanvas.width / state.dpr;
  const height = detailEffectCanvas.height / state.dpr;
  detailEffectCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  if (USE_TOUCHDESIGNER_BRIDGE) {
    return captureTdStreamToCanvas(detailEffectCanvas, detailEffectCtx, width, height);
  }
  const drew = drawWebGeneratedToeFrame(detailEffectCtx, width, height, {
    source: toeCurrentSourceImage(),
    time: state.effectTime ?? performance.now() / 1000
  });
  detailEffectCanvas.classList.toggle("has-captured-frame", drew);
  return drew;
}

function renderDesignSourceList() {
  if (!ui.designSourceList) return;
  ui.designSourceList.innerHTML = "";
  const sources = designSources();
  if (!sources.length) {
    const empty = document.createElement("div");
    empty.className = "design-source-empty";
    empty.textContent = "藏纹尚空，暂以当前织纹入场";
    ui.designSourceList.appendChild(empty);
    return;
  }
  sources.forEach((entry) => {
    const button = document.createElement("button");
    button.className = "design-source-button";
    button.classList.toggle("is-active", entry.key === state.designSourceKey);
    button.type = "button";
    button.setAttribute("aria-label", `使用${entry.label}纹样`);
    const img = document.createElement("img");
    img.src = entry.src;
    img.alt = entry.label;
    const label = document.createElement("span");
    label.textContent = entry.label;
    button.append(img, label);
    button.addEventListener("click", () => applyDesignSource(entry));
    ui.designSourceList.appendChild(button);
  });
}

function applyDesignSource(entry) {
  state.designSource = entry.sample || null;
  state.designSourceKey = entry.key;
  state.designPatternUrl = entry.src || "";
  state.designPatternImage = null;
  sendTouchDesignerInput({ key: entry.key, label: entry.label, src: entry.src });
  if (state.designPatternUrl) {
    const image = createAssetImage(state.designPatternUrl, true);
    image.addEventListener("load", () => {
      if (state.designSourceKey !== entry.key) return;
      state.designPatternImage = image;
      designFallback.key = "";
      designFallback.canvas = null;
      updateDesignTexture();
      renderDesign();
    });
    ensureAssetImage(image);
    if (isDrawableMedia(image)) state.designPatternImage = image;
  }
  updateDesignPatternInfo();
  renderTranslationPathCard();
  updateDesignTexture();
  renderDesignSourceList();
  renderDesign();
}

function designPatternSource() {
  if (state.designPatternUrl) return state.designPatternUrl;
  const sample = currentDesignSample();
  return isDrawableMedia(sample?.image) ? sampleImageUrl(sample) : sample?.tile?.src || sampleImageUrl(sample);
}

function updateStaticDesignModel() {
  if (!ui.designStage) return;
  const productKey = state.designProduct || ui.designProduct?.value || "seat";
  ui.designStage.dataset.product = productConfigs[productKey]?.fallbackProduct || productKey;
  const source = designPatternSource();
  if (ui.designStaticShape && source) {
    ui.designStaticShape.style.setProperty("--design-pattern-url", cssUrl(source));
  }
  const density = state.designTiling === "large" ? "72% 72%" : `${Math.round(88 / clamp(state.designPatternScale, 0.7, 3.6))}% ${Math.round(88 / clamp(state.designPatternScale, 0.7, 3.6))}%`;
  ui.designStaticShape?.style.setProperty("background-size", density);
}

function updateDesignPatternInfo() {
  const source = designPatternSource();
  if (ui.designPatternPreview) ui.designPatternPreview.src = source;
  updateStaticDesignModel();
  const img = isDrawableMedia(state.designPatternImage) ? state.designPatternImage : currentDesignSample()?.image;
  if (ui.designPatternSize && img) {
    const width = img.naturalWidth || 512;
    const height = img.naturalHeight || 512;
    ui.designPatternSize.textContent = `${width}x${height}像素`;
  }
  if (ui.designVariantLabel) {
    const label = state.designTiling === "hex" ? "B" : state.designTiling === "stripe" ? "C" : "A";
    ui.designVariantLabel.textContent = label;
  }
  renderTranslationPathCard();
}

function makePatternCanvas(image, size = 768) {
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = size;
  patternCanvas.height = size;
  const pctx = patternCanvas.getContext("2d");
  pctx.fillStyle = "#f7f7f7";
  pctx.fillRect(0, 0, size, size);
  if (!isDrawableMedia(image)) return patternCanvas;
  const tileSize = size / 2;
  const sourceRect = designTileSourceRect(image);
  const rotation = (state.designPatternRotation - 0.5) * Math.PI * 0.5;
  const drawSeamlessTile = (x, y, flipX = false, flipY = false) => {
    pctx.save();
    pctx.beginPath();
    pctx.rect(x, y, tileSize, tileSize);
    pctx.clip();
    pctx.translate(x + tileSize / 2, y + tileSize / 2);
    pctx.rotate(rotation);
    if (state.designTiling === "hex") pctx.rotate(Math.PI / 4);
    pctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    pctx.translate(-tileSize / 2, -tileSize / 2);
    drawImageCoverFromRect(pctx, image, sourceRect, tileSize, tileSize);
    pctx.restore();
  };
  drawSeamlessTile(0, 0, false, false);
  drawSeamlessTile(tileSize, 0, true, false);
  drawSeamlessTile(0, tileSize, false, true);
  drawSeamlessTile(tileSize, tileSize, true, true);
  if (state.designTiling === "stripe") {
    pctx.save();
    pctx.globalCompositeOperation = "multiply";
    pctx.globalAlpha = 0.12;
    pctx.fillStyle = "#ffffff";
    for (let x = -size; x < size * 2; x += 42) {
      pctx.save();
      pctx.translate(x, 0);
      pctx.rotate(-0.18);
      pctx.fillRect(0, 0, 14, size * 2);
      pctx.restore();
    }
    pctx.restore();
  }
  pctx.globalCompositeOperation = "soft-light";
  pctx.fillStyle = "rgba(255,255,255,.16)";
  for (let x = 0; x < size; x += 7) pctx.fillRect(x, 0, 1, size);
  for (let y = 0; y < size; y += 9) pctx.fillRect(0, y, size, 1);
  pctx.globalCompositeOperation = "source-over";
  return patternCanvas;
}

function resizeFallbackCanvas() {
  if (!ui.designFallbackCanvas || !ui.designStage) return null;
  const rect = ui.designStage.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);
  if (ui.designFallbackCanvas.width !== pixelWidth || ui.designFallbackCanvas.height !== pixelHeight) {
    ui.designFallbackCanvas.width = pixelWidth;
    ui.designFallbackCanvas.height = pixelHeight;
    designFallback.key = "";
  }
  ui.designFallbackCanvas.style.width = `${width}px`;
  ui.designFallbackCanvas.style.height = `${height}px`;
  const fallbackCtx = ui.designFallbackCanvas.getContext("2d");
  fallbackCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx: fallbackCtx, width, height };
}

function productSilhouettePath(ctx, product, cx, cy, scale) {
  ctx.beginPath();
  if (product === "cup" || product === "mug") {
    ctx.ellipse(cx, cy + 62 * scale, 132 * scale, 26 * scale, 0, 0, Math.PI * 2);
    ctx.moveTo(cx - 132 * scale, cy - 52 * scale);
    ctx.bezierCurveTo(cx - 118 * scale, cy + 58 * scale, cx - 78 * scale, cy + 108 * scale, cx, cy + 112 * scale);
    ctx.bezierCurveTo(cx + 78 * scale, cy + 108 * scale, cx + 118 * scale, cy + 58 * scale, cx + 132 * scale, cy - 52 * scale);
    ctx.ellipse(cx, cy - 52 * scale, 134 * scale, 28 * scale, 0, 0, Math.PI * 2);
    if (product === "mug") {
      ctx.moveTo(cx + 120 * scale, cy - 20 * scale);
      ctx.bezierCurveTo(cx + 210 * scale, cy - 52 * scale, cx + 218 * scale, cy + 88 * scale, cx + 122 * scale, cy + 70 * scale);
    }
  } else if (product === "pillow" || product === "cushion") {
    const w = (product === "pillow" ? 280 : 250) * scale;
    const h = (product === "pillow" ? 205 : 172) * scale;
    roundedRectPath(ctx, cx - w / 2, cy - h / 2, w, h, 28 * scale);
  } else if (product === "seat" || product === "bedding") {
    const w = (product === "bedding" ? 430 : 320) * scale;
    const h = (product === "bedding" ? 210 : 190) * scale;
    roundedRectPath(ctx, cx - w / 2, cy - h / 2, w, h, 22 * scale);
    ctx.moveTo(cx - w * 0.43, cy - h * 0.72);
    roundedRectPath(ctx, cx - w * 0.43, cy - h * 0.72, w * 0.36, h * 0.28, 16 * scale);
    ctx.moveTo(cx + w * 0.07, cy - h * 0.72);
    roundedRectPath(ctx, cx + w * 0.07, cy - h * 0.72, w * 0.36, h * 0.28, 16 * scale);
  } else if (product === "scarf" || product === "blanket") {
    const w = (product === "scarf" ? 150 : 360) * scale;
    const h = (product === "scarf" ? 420 : 250) * scale;
    roundedRectPath(ctx, cx - w / 2, cy - h / 2, w, h, 14 * scale);
  } else if (product === "silk_scarf") {
    ctx.moveTo(cx - 170 * scale, cy - 98 * scale);
    ctx.quadraticCurveTo(cx - 58 * scale, cy - 132 * scale, cx - 8 * scale, cy - 66 * scale);
    ctx.quadraticCurveTo(cx + 62 * scale, cy - 136 * scale, cx + 178 * scale, cy - 76 * scale);
    ctx.lineTo(cx + 128 * scale, cy + 112 * scale);
    ctx.quadraticCurveTo(cx + 42 * scale, cy + 86 * scale, cx + 8 * scale, cy + 122 * scale);
    ctx.quadraticCurveTo(cx - 52 * scale, cy + 82 * scale, cx - 168 * scale, cy + 110 * scale);
    ctx.quadraticCurveTo(cx - 118 * scale, cy + 22 * scale, cx - 170 * scale, cy - 98 * scale);
  } else if (product === "socks") {
    roundedRectPath(ctx, cx - 86 * scale, cy - 170 * scale, 64 * scale, 250 * scale, 30 * scale);
    roundedRectPath(ctx, cx - 108 * scale, cy + 30 * scale, 128 * scale, 68 * scale, 34 * scale);
    ctx.moveTo(cx + 28 * scale, cy - 170 * scale);
    roundedRectPath(ctx, cx + 28 * scale, cy - 170 * scale, 64 * scale, 250 * scale, 30 * scale);
    roundedRectPath(ctx, cx + 6 * scale, cy + 30 * scale, 128 * scale, 68 * scale, 34 * scale);
  } else if (product === "leggings") {
    ctx.moveTo(cx - 82 * scale, cy - 210 * scale);
    ctx.lineTo(cx + 82 * scale, cy - 210 * scale);
    ctx.lineTo(cx + 132 * scale, cy + 210 * scale);
    ctx.lineTo(cx + 48 * scale, cy + 210 * scale);
    ctx.lineTo(cx, cy - 28 * scale);
    ctx.lineTo(cx - 48 * scale, cy + 210 * scale);
    ctx.lineTo(cx - 132 * scale, cy + 210 * scale);
    ctx.closePath();
  } else if (product === "notebook") {
    roundedRectPath(ctx, cx - 132 * scale, cy - 178 * scale, 264 * scale, 356 * scale, 14 * scale);
  } else if (product === "shirt_m" || product === "shirt_w") {
    const waist = product === "shirt_w" ? 0.82 : 1;
    ctx.moveTo(cx - 82 * scale, cy - 168 * scale);
    ctx.lineTo(cx - 190 * scale, cy - 92 * scale);
    ctx.lineTo(cx - 134 * scale, cy + 18 * scale);
    ctx.lineTo(cx - 88 * scale, cy - 18 * scale);
    ctx.lineTo(cx - 72 * waist * scale, cy + 178 * scale);
    ctx.lineTo(cx + 72 * waist * scale, cy + 178 * scale);
    ctx.lineTo(cx + 88 * scale, cy - 18 * scale);
    ctx.lineTo(cx + 134 * scale, cy + 18 * scale);
    ctx.lineTo(cx + 190 * scale, cy - 92 * scale);
    ctx.lineTo(cx + 82 * scale, cy - 168 * scale);
    ctx.quadraticCurveTo(cx, cy - 118 * scale, cx - 82 * scale, cy - 168 * scale);
  } else {
    ctx.moveTo(cx - 95 * scale, cy - 210 * scale);
    ctx.quadraticCurveTo(cx, cy - 250 * scale, cx + 95 * scale, cy - 210 * scale);
    ctx.lineTo(cx + 176 * scale, cy - 124 * scale);
    ctx.lineTo(cx + 128 * scale, cy - 36 * scale);
    ctx.lineTo(cx + 88 * scale, cy - 72 * scale);
    ctx.lineTo(cx + 184 * scale, cy + 248 * scale);
    ctx.lineTo(cx - 184 * scale, cy + 248 * scale);
    ctx.lineTo(cx - 88 * scale, cy - 72 * scale);
    ctx.lineTo(cx - 128 * scale, cy - 36 * scale);
    ctx.lineTo(cx - 176 * scale, cy - 124 * scale);
    ctx.closePath();
  }
}

function productDetailLines(ctx, product, cx, cy, scale) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.34)";
  ctx.lineWidth = Math.max(1, 1.4 * scale);
  ctx.lineCap = "round";
  if (product === "dress") {
    for (let i = -3; i <= 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(cx + i * 26 * scale, cy - 104 * scale);
      ctx.bezierCurveTo(cx + i * 18 * scale, cy - 10 * scale, cx + i * 34 * scale, cy + 118 * scale, cx + i * 44 * scale, cy + 238 * scale);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(0,0,0,.20)";
    ctx.beginPath();
    ctx.ellipse(cx, cy - 190 * scale, 72 * scale, 28 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (product === "shirt_m" || product === "shirt_w") {
    ctx.beginPath();
    ctx.ellipse(cx, cy - 140 * scale, 56 * scale, 22 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 84 * scale, cy - 18 * scale);
    ctx.lineTo(cx + 84 * scale, cy - 18 * scale);
    ctx.stroke();
  } else if (product === "scarf" || product === "blanket") {
    for (let x = -2; x <= 2; x += 1) {
      ctx.beginPath();
      ctx.moveTo(cx + x * 34 * scale, cy - 190 * scale);
      ctx.bezierCurveTo(cx + x * 42 * scale, cy - 80 * scale, cx + x * 20 * scale, cy + 80 * scale, cx + x * 36 * scale, cy + 190 * scale);
      ctx.stroke();
    }
  } else if (product === "silk_scarf") {
    ctx.strokeStyle = "rgba(255,255,255,.38)";
    [
      [-132, -74, -48, -24, -4, -4],
      [132, -64, 48, -22, 4, -4],
      [-118, 88, -42, 24, -4, 2],
      [116, 94, 44, 20, 4, 2]
    ].forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(cx + line[0] * scale, cy + line[1] * scale);
      ctx.bezierCurveTo(cx + line[2] * scale, cy + line[3] * scale, cx + line[4] * scale, cy + line[5] * scale, cx, cy);
      ctx.stroke();
    });
    ctx.strokeStyle = "rgba(0,0,0,.18)";
    ctx.beginPath();
    ctx.ellipse(cx, cy, 44 * scale, 28 * scale, -0.2, 0, Math.PI * 2);
    ctx.stroke();
  } else if (product === "pillow" || product === "cushion" || product === "seat" || product === "bedding") {
    ctx.strokeStyle = "rgba(0,0,0,.18)";
    ctx.strokeRect(cx - 126 * scale, cy - 82 * scale, 252 * scale, 164 * scale);
    ctx.strokeStyle = "rgba(255,255,255,.38)";
    ctx.beginPath();
    ctx.moveTo(cx - 116 * scale, cy - 50 * scale);
    ctx.bezierCurveTo(cx - 30 * scale, cy - 72 * scale, cx + 34 * scale, cy - 56 * scale, cx + 118 * scale, cy - 74 * scale);
    ctx.stroke();
  } else if (product === "cup" || product === "mug") {
    ctx.strokeStyle = "rgba(255,255,255,.48)";
    ctx.beginPath();
    ctx.ellipse(cx, cy - 52 * scale, 116 * scale, 22 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 80 * scale, cy - 18 * scale);
    ctx.bezierCurveTo(cx - 68 * scale, cy + 42 * scale, cx - 42 * scale, cy + 82 * scale, cx - 2 * scale, cy + 100 * scale);
    ctx.stroke();
  } else if (product === "socks" || product === "leggings") {
    ctx.strokeStyle = "rgba(255,255,255,.32)";
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.moveTo(cx + side * 48 * scale, cy - 160 * scale);
      ctx.bezierCurveTo(cx + side * 54 * scale, cy - 40 * scale, cx + side * 72 * scale, cy + 80 * scale, cx + side * 86 * scale, cy + 200 * scale);
      ctx.stroke();
    });
  } else if (product === "notebook") {
    ctx.strokeStyle = "rgba(0,0,0,.22)";
    ctx.beginPath();
    ctx.moveTo(cx - 104 * scale, cy - 168 * scale);
    ctx.lineTo(cx - 92 * scale, cy + 170 * scale);
    ctx.stroke();
  }
  ctx.restore();
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function ensureMockupImage(config) {
  if (!config?.image) return null;
  if (designFallback.mockupImage?.src?.includes(config.image)) return designFallback.mockupImage;
  const image = new Image();
  image.decoding = "async";
  image.onload = () => {
    designFallback.mockupLoaded = true;
    designFallback.key = "";
    state.designNeedsRender = true;
  };
  image.src = config.image;
  designFallback.mockupImage = image;
  designFallback.mockupLoaded = isDrawableMedia(image);
  return image;
}

function handbagMaterialMask(mockup, drawX, drawY, boxW, boxH, width, height) {
  const maskWidth = Math.max(1, Math.round(width));
  const maskHeight = Math.max(1, Math.round(height));
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = maskWidth;
  sourceCanvas.height = maskHeight;
  const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
  sourceCtx.drawImage(mockup, drawX, drawY, boxW, boxH);
  const source = sourceCtx.getImageData(0, 0, maskWidth, maskHeight);
  const maskImage = sourceCtx.createImageData(maskWidth, maskHeight);
  for (let py = 0; py < maskHeight; py += 1) {
    for (let px = 0; px < maskWidth; px += 1) {
      const nx = (px - drawX) / boxW;
      const ny = (py - drawY) / boxH;
      if (nx < 0 || nx > 1 || ny < 0 || ny > 1) continue;
      const inHandle = nx > 0.27 && nx < 0.72 && ny > 0.24 && ny < 0.43;
      const inFlap = nx > 0.31 && nx < 0.66 && ny > 0.44 && ny < 0.575;
      const inBody = nx > 0.25 && nx < 0.73 && ny > 0.585 && ny < 0.755;
      if (!inHandle && !inFlap && !inBody) continue;
      const index = (py * maskWidth + px) * 4;
      const r = source.data[index];
      const g = source.data[index + 1];
      const b = source.data[index + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const coolness = clamp((b - r - 8) / 70, 0, 1);
      const saturation = clamp((max - min - 14) / 82, 0, 1);
      const blueGreen = clamp((b + g - r * 1.75 - 18) / 125, 0, 1);
      const darkLeather = b > 42 && g > 34 && r < 120;
      const score = darkLeather ? Math.max(coolness, blueGreen) * (0.38 + saturation * 0.62) : 0;
      if (score <= 0.06) continue;
      maskImage.data[index] = 255;
      maskImage.data[index + 1] = 255;
      maskImage.data[index + 2] = 255;
      maskImage.data[index + 3] = Math.round(236 * clamp(score, 0, 1));
    }
  }
  const hardMask = document.createElement("canvas");
  hardMask.width = maskWidth;
  hardMask.height = maskHeight;
  hardMask.getContext("2d").putImageData(maskImage, 0, 0);
  const softMask = document.createElement("canvas");
  softMask.width = maskWidth;
  softMask.height = maskHeight;
  const softCtx = softMask.getContext("2d");
  softCtx.filter = "blur(1.4px)";
  softCtx.drawImage(hardMask, 0, 0);
  softCtx.filter = "none";
  return { mask: softMask, source: sourceCanvas };
}

function renderPhotoMockupDesign(config, sourceImage, sourceKey, patternCanvas, width, height) {
  const mockup = ensureMockupImage(config);
  const key = [
    width,
    height,
    state.designProduct,
    state.designPatternScale.toFixed(3),
    state.designPatternRotation.toFixed(3),
    state.designTiling,
    sourceKey,
    state.designScale.toFixed(3),
    design3d.panX.toFixed(3),
    design3d.panY.toFixed(3),
    isDrawableMedia(mockup) ? "mockup-ready" : "mockup-loading",
    isDrawableMedia(sourceImage) ? "ready" : "loading"
  ].join("|");
  if (designFallback.key === key) return true;
  designFallback.key = key;
  const ctx = resizeFallbackCanvas()?.ctx;
  if (!ctx) return true;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f7f5f1";
  ctx.fillRect(0, 0, width, height);
  if (!isDrawableMedia(mockup)) {
    ctx.fillStyle = "#1c1c1c";
    ctx.font = "700 16px sans-serif";
    ctx.fillText(`正在载入${config.label || "产品"}样机`, 40, 60);
    return true;
  }
  const imageRatio = mockup.naturalWidth / mockup.naturalHeight;
  const boxW = Math.min(width * 0.72, height * imageRatio * 0.92);
  const boxH = boxW / imageRatio;
  const drawX = (width - boxW) / 2 + design3d.panX * 28;
  const drawY = (height - boxH) / 2 + design3d.panY * 28;
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.scale(state.designScale, state.designScale);
  ctx.translate(-width / 2, -height / 2);
  ctx.drawImage(mockup, drawX, drawY, boxW, boxH);
  const material = handbagMaterialMask(mockup, drawX, drawY, boxW, boxH, width, height);
  const overlay = document.createElement("canvas");
  overlay.width = Math.max(1, Math.round(width));
  overlay.height = Math.max(1, Math.round(height));
  const overlayCtx = overlay.getContext("2d");
  const pattern = ctx.createPattern(patternCanvas, "repeat");
  if (pattern?.setTransform && window.DOMMatrix) {
    const repeat = state.designTiling === "large"
      ? (config.mockupLargeRepeat || 0.86)
      : state.designPatternScale * (config.mockupRepeat || 0.62);
    const anchor = config.patternAnchor || [0.26, 0.43];
    pattern.setTransform(new DOMMatrix()
      .translateSelf(drawX + boxW * anchor[0], drawY + boxH * anchor[1])
      .scaleSelf(1 / repeat, 1 / repeat));
  }
  overlayCtx.fillStyle = pattern || "#23402d";
  overlayCtx.fillRect(0, 0, overlay.width, overlay.height);
  overlayCtx.globalCompositeOperation = "destination-in";
  overlayCtx.drawImage(material.mask, 0, 0);
  ctx.globalAlpha = config.overlayAlpha ?? 0.86;
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(overlay, 0, 0);
  const detail = document.createElement("canvas");
  detail.width = overlay.width;
  detail.height = overlay.height;
  const detailCtx = detail.getContext("2d");
  detailCtx.drawImage(material.source, 0, 0);
  detailCtx.globalCompositeOperation = "destination-in";
  detailCtx.drawImage(material.mask, 0, 0);
  ctx.globalAlpha = config.detailMultiplyAlpha ?? 0.32;
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(detail, 0, 0);
  ctx.globalAlpha = config.detailScreenAlpha ?? 0.14;
  ctx.globalCompositeOperation = "screen";
  ctx.drawImage(detail, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
  return true;
}

function renderFallbackDesign() {
  const surface = resizeFallbackCanvas();
  if (!surface) return;
  const { ctx: fallbackCtx, width, height } = surface;
  const sourceImage = isDrawableMedia(state.designPatternImage) ? state.designPatternImage : sourceImageFor(currentDesignSample(), true);
  const sourceKey = sourceImage?.currentSrc || sourceImage?.src || "";
  const cx = width * 0.55 + design3d.panX * 42;
  const cy = height * 0.52 + design3d.panY * 42;
  const scale = Math.min(width, height) / 720 * state.designScale;
  const viewKey = [
    design3d.rotationX.toFixed(3),
    design3d.rotationY.toFixed(3),
    design3d.panX.toFixed(3),
    design3d.panY.toFixed(3),
    design3d.distance.toFixed(3)
  ].join(",");
  const key = [
    width,
    height,
    state.designProduct,
    state.designScale.toFixed(3),
    state.designPatternScale.toFixed(3),
    state.designPatternRotation.toFixed(3),
    state.designTiling,
    viewKey,
    sourceKey,
    isDrawableMedia(sourceImage) ? "ready" : "loading"
  ].join("|");
  if (designFallback.key === key) return;
  designFallback.key = key;
  fallbackCtx.clearRect(0, 0, width, height);
  const textureKey = `${sourceKey}|${state.designPatternRotation.toFixed(3)}|${state.designTiling}`;
  const patternCanvas = designFallback.canvas && designFallback.textureKey === textureKey
    ? designFallback.canvas.canvas
    : makePatternCanvas(sourceImage, 384);
  designFallback.canvas = {
    canvas: patternCanvas
  };
  designFallback.textureKey = textureKey;
  const productConfig = productConfigs[state.designProduct] || {};
  if (productConfig.kind === "photoMockup") {
    renderPhotoMockupDesign(productConfig, sourceImage, sourceKey, patternCanvas, width, height);
    return;
  }
  fallbackCtx.save();
  fallbackCtx.translate(cx, cy);
  const yaw = Math.sin(design3d.rotationY);
  const pitch = Math.sin(design3d.rotationX);
  fallbackCtx.scale(1 + yaw * 0.18, 1 + pitch * 0.08);
  fallbackCtx.translate(-cx, -cy);
  fallbackCtx.fillStyle = "rgba(0,0,0,.08)";
  fallbackCtx.beginPath();
  fallbackCtx.ellipse(cx + yaw * 24 * scale, cy + 258 * scale, 246 * scale, 34 * scale, 0, 0, Math.PI * 2);
  fallbackCtx.fill();
  fallbackCtx.beginPath();
  const fallbackProduct = productConfig.fallbackProduct || state.designProduct;
  productSilhouettePath(fallbackCtx, fallbackProduct, cx, cy, scale);
  fallbackCtx.save();
  fallbackCtx.clip();
  const pattern = fallbackCtx.createPattern(patternCanvas, "repeat");
  if (pattern?.setTransform && window.DOMMatrix) {
    const repeat = state.designTiling === "large" ? 0.92 : state.designPatternScale;
    pattern.setTransform(new DOMMatrix().scaleSelf(1 / repeat, 1 / repeat));
  }
  fallbackCtx.fillStyle = pattern || "#d5b24a";
  fallbackCtx.fillRect(cx - 360 * scale, cy - 420 * scale, 720 * scale, 840 * scale);
  fallbackCtx.globalCompositeOperation = "multiply";
  const gradient = fallbackCtx.createLinearGradient(cx - 260 * scale, cy - 180 * scale, cx + 260 * scale, cy + 190 * scale);
  gradient.addColorStop(0, "rgba(0,0,0,.22)");
  gradient.addColorStop(0.32, "rgba(255,255,255,.12)");
  gradient.addColorStop(0.56, "rgba(0,0,0,.08)");
  gradient.addColorStop(1, "rgba(0,0,0,.28)");
  fallbackCtx.fillStyle = gradient;
  fallbackCtx.fillRect(cx - 360 * scale, cy - 420 * scale, 720 * scale, 840 * scale);
  fallbackCtx.globalCompositeOperation = "screen";
  const sheen = fallbackCtx.createLinearGradient(cx - 180 * scale, cy - 260 * scale, cx + 80 * scale, cy + 260 * scale);
  sheen.addColorStop(0, "rgba(255,255,255,0)");
  sheen.addColorStop(0.45, "rgba(255,255,255,.18)");
  sheen.addColorStop(0.52, "rgba(255,255,255,.02)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  fallbackCtx.fillStyle = sheen;
  fallbackCtx.fillRect(cx - 360 * scale, cy - 420 * scale, 720 * scale, 840 * scale);
  fallbackCtx.restore();
  productDetailLines(fallbackCtx, fallbackProduct, cx, cy, scale);
  fallbackCtx.globalCompositeOperation = "source-over";
  fallbackCtx.lineWidth = Math.max(1, 2.2 * scale);
  fallbackCtx.strokeStyle = "rgba(35,35,35,.36)";
  fallbackCtx.stroke();
  fallbackCtx.restore();
}

function updateDesignTexture() {
  designFallback.key = "";
  renderFallbackDesign();
  if (!THREE || !design3d.material) return;
  const sample = currentDesignSample();
  const sourceImage = isDrawableMedia(state.designPatternImage) ? state.designPatternImage : sourceImageFor(sample, true);
  const patternCanvas = makePatternCanvas(sourceImage, 768);
  if (design3d.texture) design3d.texture.dispose();
  design3d.texture = new THREE.CanvasTexture(patternCanvas);
  design3d.texture.wrapS = THREE.MirroredRepeatWrapping;
  design3d.texture.wrapT = THREE.MirroredRepeatWrapping;
  const repeat = state.designTiling === "large" ? clamp(state.designPatternScale * 0.48, 0.45, 1.8) : clamp(state.designPatternScale, 0.6, 3.6);
  const productRepeatScale = productConfigs[state.designProduct]?.textureRepeatScale ?? 1;
  const adjustedRepeat = clamp(repeat * productRepeatScale, 0.35, 3.6);
  design3d.texture.repeat.set(adjustedRepeat, adjustedRepeat);
  design3d.texture.anisotropy = 8;
  design3d.texture.colorSpace = THREE.SRGBColorSpace;
  design3d.material.map = design3d.texture;
  design3d.material.needsUpdate = true;
  updateDesignPatternInfo();
  state.designNeedsRender = true;
}

function clearProductGroup() {
  if (!design3d.productGroup) return;
  design3d.productGroup.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    if (object.material && object.material !== design3d.material) {
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose?.());
      else object.material.dispose?.();
    }
  });
  design3d.scene.remove(design3d.productGroup);
  design3d.productGroup = null;
}

function cloneDesignModel(source) {
  const clone = cloneSkeletonModel ? cloneSkeletonModel(source) : source.clone(true);
  clone.traverse((node) => {
    if (node.isMesh && node.geometry) node.geometry = node.geometry.clone();
  });
  return clone;
}

function flattenSkinnedMeshes(model) {
  const replacements = [];
  model.traverse((node) => {
    if (!node.isSkinnedMesh || !node.parent) return;
    const staticMesh = new THREE.Mesh(node.geometry.clone(), node.material);
    staticMesh.name = node.name;
    staticMesh.position.copy(node.position);
    staticMesh.quaternion.copy(node.quaternion);
    staticMesh.scale.copy(node.scale);
    replacements.push([node, staticMesh]);
  });
  replacements.forEach(([node, staticMesh]) => {
    node.parent.add(staticMesh);
    node.parent.remove(node);
  });
}

function meshMaterialName(mesh, material = mesh.material) {
  const materialName = Array.isArray(material)
    ? material.map((item) => item?.name || "").join(" ")
    : material?.name || "";
  return `${mesh.name || ""} ${materialName}`.toLowerCase();
}

function modelLooksPaintable(mesh, config = {}, material = mesh.material, materialIndex = -1) {
  const name = meshMaterialName(mesh, material);
  if (config.keepOriginalMaterial) return false;
  if (materialIndex >= 0 && config.paintMaterialIndices?.includes(materialIndex)) return true;
  if (config.paintNames?.length) {
    return config.paintNames.some((part) => name.includes(part.toLowerCase()));
  }
  if (name.includes("avatarskin") || name.includes("avatar_skin")) return false;
  if (config.trimNames?.some((part) => name.includes(part.toLowerCase()))) return false;
  if (name.includes("glass") || name.includes("liquid") || name.includes("coffee") || name.includes("shadow")) return false;
  if (name.includes("rim") || name.includes("saucer") || name.includes("plate")) return false;
  return true;
}

function projectGeometryUvs(geometry, projection = "front") {
  const pos = geometry?.attributes?.position;
  if (!pos || !THREE?.BufferAttribute) return;
  const bounds = {
    minX: Infinity, minY: Infinity, minZ: Infinity,
    maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity
  };
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    bounds.minX = Math.min(bounds.minX, x);
    bounds.minY = Math.min(bounds.minY, y);
    bounds.minZ = Math.min(bounds.minZ, z);
    bounds.maxX = Math.max(bounds.maxX, x);
    bounds.maxY = Math.max(bounds.maxY, y);
    bounds.maxZ = Math.max(bounds.maxZ, z);
  }
  const sizeX = Math.max(0.0001, bounds.maxX - bounds.minX);
  const sizeY = Math.max(0.0001, bounds.maxY - bounds.minY);
  const sizeZ = Math.max(0.0001, bounds.maxZ - bounds.minZ);
  const uv = new Float32Array(pos.count * 2);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerZ = (bounds.minZ + bounds.maxZ) / 2;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    let u = projection === "top" ? (x - bounds.minX) / sizeX : (x - bounds.minX) / sizeX;
    let v = projection === "top" ? (z - bounds.minZ) / sizeZ : (y - bounds.minY) / sizeY;
    if (projection === "cylindrical") {
      const angle = Math.atan2(z - centerZ, x - centerX);
      u = (angle + Math.PI) / (Math.PI * 2);
      v = (y - bounds.minY) / sizeY;
    }
    uv[i * 2] = u;
    uv[i * 2 + 1] = v;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geometry.attributes.uv.needsUpdate = true;
}

function ensurePaintableModelUvs(model, config = {}) {
  if (!config.generatePaintUvs) return;
  model.traverse((node) => {
    if (!node.isMesh || !node.geometry) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    const shouldProject = Array.isArray(node.material)
      ? materials.some((material, materialIndex) => modelLooksPaintable(node, config, material, materialIndex))
      : modelLooksPaintable(node, config, node.material, -1);
    if (!shouldProject) return;
    if (node.geometry.attributes?.uv && !config.forcePaintUvs) return;
    projectGeometryUvs(node.geometry, config.uvProjection || "front");
  });
}

function applyDesignMaterialToModel(model, config = {}) {
  const trimMaterial = new THREE.MeshStandardMaterial({ color: "#f7f2ea", roughness: 0.5, metalness: 0.02 });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: "#d8c8ad", roughness: 0.72, metalness: 0.01 });
  const hiddenSkinMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });
  const baseMaterial = config.baseMaterialColor
    ? new THREE.MeshStandardMaterial({
      color: config.baseMaterialColor,
      roughness: config.baseMaterialRoughness ?? 0.48,
      metalness: config.baseMaterialMetalness ?? 0.02,
      transparent: (config.baseMaterialOpacity ?? 1) < 1,
      opacity: config.baseMaterialOpacity ?? 1,
      side: THREE.DoubleSide
    })
    : null;
  model.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
    if (baseMaterial && config.keepOriginalMaterial) {
      node.material = baseMaterial;
      return;
    }
    if (Array.isArray(node.material)) {
      node.material = node.material.map((material, materialIndex) => {
        const name = meshMaterialName(node, material);
        if (modelLooksPaintable(node, config, material, materialIndex)) return design3d.material;
        if (config.hideSkin && (name.includes("avatarskin") || name.includes("avatar_skin"))) return hiddenSkinMaterial;
        if (config.preserveUnpaintedMaterial || config.keepOriginalMaterial) return material;
        if (name.includes("avatarskin") || name.includes("avatar_skin")) return skinMaterial;
        return trimMaterial;
      });
    } else if (modelLooksPaintable(node, config, node.material, -1)) node.material = design3d.material;
    else if (!config.keepOriginalMaterial) {
      const name = meshMaterialName(node);
      if (config.hideSkin && (name.includes("avatarskin") || name.includes("avatar_skin"))) node.material = hiddenSkinMaterial;
      else if (!config.preserveUnpaintedMaterial) {
        node.material = name.includes("avatarskin") || name.includes("avatar_skin") ? skinMaterial : trimMaterial;
      }
    }
  });
}

function pruneModelParts(model, config) {
  const hidden = config.hideNames || [];
  if (!hidden.length) return;
  const hiddenLower = hidden.map((name) => name.toLowerCase());
  const removable = [];
  model.traverse((node) => {
    const name = meshMaterialName(node);
    if (hiddenLower.some((part) => name.includes(part))) removable.push(node);
  });
  removable.forEach((node) => {
    node.parent?.remove(node);
  });
}

function expandBoxFromGeometryGroup(box, node, group) {
  const geometry = node.geometry;
  const position = geometry?.attributes?.position;
  if (!position) return false;
  const index = geometry.index;
  const start = group?.start || 0;
  const count = group?.count || (index ? index.count : position.count);
  const point = new THREE.Vector3();
  for (let i = start; i < start + count; i += 1) {
    const vertexIndex = index ? index.getX(i) : i;
    point.fromBufferAttribute(position, vertexIndex).applyMatrix4(node.matrixWorld);
    box.expandByPoint(point);
  }
  return count > 0;
}

function paintableModelBox(model, config) {
  if (!config.fitPaintableOnly) return null;
  const box = new THREE.Box3();
  let found = false;
  model.updateMatrixWorld(true);
  model.traverse((node) => {
    if (!node.isMesh || !node.geometry) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    const defaultCount = node.geometry.index?.count || node.geometry.attributes?.position?.count || 0;
    const groups = node.geometry.groups?.length
      ? node.geometry.groups
      : materials.map((_, materialIndex) => ({ start: 0, count: defaultCount, materialIndex }));
    groups.forEach((group) => {
      const materialIndex = group.materialIndex ?? 0;
      const material = materials[materialIndex] || materials[0];
      if (!modelLooksPaintable(node, config, material, materialIndex)) return;
      if (expandBoxFromGeometryGroup(box, node, group)) found = true;
    });
  });
  return found ? box : null;
}

function bakeNormalizedModelGeometry(model) {
  const sourceBox = new THREE.Box3().setFromObject(model);
  const sourceSize = sourceBox.getSize(new THREE.Vector3());
  const sourceCenter = sourceBox.getCenter(new THREE.Vector3());
  const maxSize = Math.max(sourceSize.x, sourceSize.y, sourceSize.z) || 1;
  const normalized = new THREE.Group();
  model.updateMatrixWorld(true);
  model.traverse((node) => {
    if (!node.isMesh || !node.geometry) return;
    const geometry = node.geometry.clone();
    geometry.applyMatrix4(node.matrixWorld);
    geometry.translate(-sourceCenter.x, -sourceCenter.y, -sourceCenter.z);
    geometry.scale(1 / maxSize, 1 / maxSize, 1 / maxSize);
    geometry.computeBoundingBox();
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, node.material);
    mesh.name = node.name;
    normalized.add(mesh);
  });
  return normalized.children.length ? normalized : model;
}

function fitModelToStage(model, config) {
  const targetSize = config.targetSize || 2.8;
  model.updateMatrixWorld(true);
  const box = paintableModelBox(model, config) || new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z) || 1;
  model.position.sub(center);
  model.scale.setScalar(targetSize / maxSize);
  if (config.rotation) model.rotation.set(...config.rotation);
  model.updateMatrixWorld(true);
  const fittedBox = paintableModelBox(model, config) || new THREE.Box3().setFromObject(model);
  const fittedCenter = fittedBox.getCenter(new THREE.Vector3());
  model.position.sub(fittedCenter);
  model.position.y -= fittedBox.min.y + 1.45;
  if (config.position) model.position.add(new THREE.Vector3(...config.position));
}

async function retryModelLoad(load) {
  try {
    return await load();
  } catch {
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    return load();
  }
}

async function loadProductModel(config) {
  if (config.obj) {
    if (!OBJLoader) return null;
    const cacheKey = `${config.obj}|${config.mtl || ""}`;
    if (!design3d.modelCache.has(cacheKey)) {
      const loadPromise = retryModelLoad(async () => {
        let objectLoader = new OBJLoader();
        if (config.mtl && MTLLoader) {
          const materialLoader = new MTLLoader();
          const basePath = config.mtl.slice(0, config.mtl.lastIndexOf("/") + 1);
          materialLoader.setPath(basePath);
          const materialCreator = await materialLoader.loadAsync(config.mtl.slice(basePath.length));
          materialCreator.preload();
          objectLoader.setMaterials(materialCreator);
          objectLoader.setPath(basePath);
          return objectLoader.loadAsync(config.obj.slice(basePath.length));
        }
        return objectLoader.loadAsync(config.obj);
      }).catch(() => {
        design3d.modelCache.delete(cacheKey);
        return null;
      });
      design3d.modelCache.set(cacheKey, loadPromise);
    }
    const source = await design3d.modelCache.get(cacheKey);
    if (!source) return null;
    const model = cloneDesignModel(source);
    pruneModelParts(model, config);
    fitModelToStage(model, config);
    ensurePaintableModelUvs(model, config);
    applyDesignMaterialToModel(model, config);
    return model;
  }
  const modelPaths = config.models || (config.model ? [config.model] : []);
  if (!modelPaths.length || !design3d.loader) return null;
  const loadedModels = [];
  for (const modelPath of modelPaths) {
    if (!design3d.modelCache.has(modelPath)) {
      const loadPromise = retryModelLoad(() => design3d.loader.loadAsync(modelPath))
      .then((gltf) => gltf.scene)
      .catch(() => {
        design3d.modelCache.delete(modelPath);
        return null;
      });
      design3d.modelCache.set(modelPath, loadPromise);
    }
    const source = await design3d.modelCache.get(modelPath);
    if (!source) return null;
    loadedModels.push(cloneDesignModel(source));
  }
  let model = new THREE.Group();
  loadedModels.forEach((loadedModel) => model.add(loadedModel));
  if (config.flattenSkinned) flattenSkinnedMeshes(model);
  pruneModelParts(model, config);
  if (config.bakeNormalizeGeometry) model = bakeNormalizedModelGeometry(model);
  fitModelToStage(model, config);
  ensurePaintableModelUvs(model, config);
  applyDesignMaterialToModel(model, config);
  return model;
}

function roundedBoxGeometry(width, height, depth) {
  const geometry = new THREE.BoxGeometry(width, height, depth, 28, 28, 8);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i) / (width / 2);
    const y = pos.getY(i) / (height / 2);
    const edge = Math.max(Math.abs(x), Math.abs(y));
    const puff = Math.max(0, 1 - (x * x * 0.42 + y * y * 0.42));
    pos.setZ(i, pos.getZ(i) + Math.sign(pos.getZ(i) || 1) * depth * 0.16 * puff);
    pos.setX(i, pos.getX(i) * (1 - 0.035 * Math.max(0, edge - 0.72)));
    pos.setY(i, pos.getY(i) * (1 - 0.035 * Math.max(0, edge - 0.72)));
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function addMesh(group, geometry, material = design3d.material, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function roundedFlatBoxGeometry(width, height, depth, radius = 0.12) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.22,
    bevelSize: Math.min(radius * 0.22, depth * 0.8),
    bevelSegments: 4,
    curveSegments: 18
  });
  geometry.center();
  projectGeometryUvs(geometry, "front");
  return geometry;
}

function roundedPanelGeometry(width, height, radius = 0.12) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  const geometry = new THREE.ShapeGeometry(shape, 18);
  geometry.center();
  projectGeometryUvs(geometry, "front");
  return geometry;
}

function productTrimMaterial(color = "#f7f2ea", roughness = 0.68, metalness = 0.01, opacity = 1) {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    side: THREE.DoubleSide
  });
  if (opacity < 1) {
    material.transparent = true;
    material.opacity = opacity;
  }
  return material;
}

function addExtrudedClothShape(group, outline, options = {}) {
  const shape = new THREE.Shape();
  outline.forEach((point, index) => {
    const [x, y, c1x, c1y, c2x, c2y] = point;
    if (index === 0) shape.moveTo(x, y);
    else if (point.length >= 6) shape.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: options.depth || 0.18,
    bevelEnabled: true,
    bevelThickness: options.bevelThickness || 0.035,
    bevelSize: options.bevelSize || 0.035,
    bevelSegments: 5,
    curveSegments: 18
  });
  geometry.center();
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const fold = Math.sin((x + (options.foldOffset || 0)) * (options.foldFreq || 5.4)) * (options.foldDepth || 0.018);
    const bodyCurve = Math.max(0, 1 - Math.abs(x) * 0.34) * (options.bodyCurve || 0.045);
    pos.setZ(i, z + fold + bodyCurve);
    pos.setY(i, y + Math.sin((y + 1.1) * 5.8) * (options.verticalWave || 0.006));
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  return addMesh(group, geometry, design3d.material, options.position || [0, 0, 0], options.rotation || [0, 0, 0], options.scale || [1, 1, 1]);
}

function addSoftBox(group, config) {
  const [w, h, d] = config.size;
  const position = config.position || [0, 0, 0];
  const main = addMesh(group, roundedBoxGeometry(w, h, d), design3d.material, position);
  main.geometry.computeVertexNormals();
  const seamMaterial = productTrimMaterial("#f2eadf", 0.82);
  [-1, 1].forEach((side) => {
    addMesh(
      group,
      new THREE.TorusGeometry(Math.max(w, h) * 0.5, 0.022, 8, 96),
      seamMaterial,
      [position[0], position[1], position[2] + d * 0.56 * side],
      [0, 0, 0],
      [w / Math.max(w, h), h / Math.max(w, h), 1]
    );
  });
  const buttonMaterial = productTrimMaterial("#eee4d8", 0.78);
  [
    [-0.28, -0.2],
    [0.28, -0.2],
    [-0.28, 0.22],
    [0.28, 0.22]
  ].forEach(([x, y]) => {
    addMesh(
      group,
      new THREE.CylinderGeometry(Math.min(w, h) * 0.035, Math.min(w, h) * 0.035, 0.024, 28),
      buttonMaterial,
      [position[0] + x * w, position[1] + y * h, position[2] + d * 0.62],
      [Math.PI / 2, 0, 0]
    );
  });
}

function addCloth(group, config) {
  const [w, h, d] = config.size;
  const cloth = addMesh(group, new THREE.PlaneGeometry(w, h, 42, 96), design3d.material, [0, 0, 0], [0, 0, config.drape ? 0.08 : 0]);
  const pos = cloth.geometry.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const edgeFalloff = 1 - Math.min(0.8, Math.abs(x) / (w * 0.52));
    const longWave = Math.sin((y + h / 2) * 5.2) * 0.08 * edgeFalloff;
    const crossWave = Math.cos((x + w / 2) * 4.4) * 0.035;
    pos.setZ(i, pos.getZ(i) + longWave + crossWave);
    if (config.drape) pos.setX(i, x + Math.sin((y + h / 2) * 2.4) * 0.04);
  }
  pos.needsUpdate = true;
  cloth.geometry.computeVertexNormals();
  const edgeMaterial = productTrimMaterial("#f5eee4", 0.76);
  const top = addMesh(group, new THREE.CylinderGeometry(0.012, 0.012, w, 12), edgeMaterial, [0, h / 2, 0.01], [0, 0, Math.PI / 2]);
  const bottom = addMesh(group, new THREE.CylinderGeometry(0.012, 0.012, w, 12), edgeMaterial, [0, -h / 2, 0.01], [0, 0, Math.PI / 2]);
  const left = addMesh(group, new THREE.CylinderGeometry(0.01, 0.01, h, 10), edgeMaterial, [-w / 2, 0, 0.01]);
  const right = addMesh(group, new THREE.CylinderGeometry(0.01, 0.01, h, 10), edgeMaterial, [w / 2, 0, 0.01]);
  top.receiveShadow = false;
  bottom.receiveShadow = false;
  left.receiveShadow = false;
  right.receiveShadow = false;
  if (config.fringe) {
    const count = config.drape ? 16 : 24;
    for (let i = 0; i < count; i += 1) {
      const x = -w / 2 + (w * (i + 0.5)) / count;
      const strandLength = config.drape ? 0.18 : 0.12;
      addMesh(group, new THREE.CylinderGeometry(0.004, 0.004, strandLength, 6), edgeMaterial, [x, h / 2 + strandLength / 2, 0.014]);
      addMesh(group, new THREE.CylinderGeometry(0.004, 0.004, strandLength, 6), edgeMaterial, [x, -h / 2 - strandLength / 2, 0.014]);
    }
  }
}

function addCup(group, mug = false) {
  addMesh(group, new THREE.CylinderGeometry(0.78, 0.68, 1.65, 72, 6, true), design3d.material, [0, 0.05, 0]);
  const rim = new THREE.MeshStandardMaterial({ color: "#fafafa", roughness: 0.42, metalness: 0.02 });
  addMesh(group, new THREE.TorusGeometry(0.78, 0.035, 12, 72), rim, [0, 0.88, 0], [Math.PI / 2, 0, 0]);
  addMesh(group, new THREE.CylinderGeometry(0.64, 0.58, 0.04, 72), rim, [0, -0.8, 0]);
  if (mug) {
    addMesh(group, new THREE.TorusGeometry(0.36, 0.055, 12, 40), rim, [0.72, 0.1, 0], [0, Math.PI / 2, 0], [0.74, 1.08, 1]);
  }
}

function addDress(group) {
  const dressGroup = new THREE.Group();
  dressGroup.scale.setScalar(0.68);
  dressGroup.position.y = 0.36;
  group.add(dressGroup);
  const trim = productTrimMaterial("#f8f2e8", 0.62);
  const darkTrim = productTrimMaterial("#1f1f1f", 0.64);
  const bodice = addMesh(dressGroup, new THREE.CylinderGeometry(0.5, 0.76, 1.12, 80, 26), design3d.material, [0, 0.82, 0]);
  const skirt = addMesh(dressGroup, new THREE.CylinderGeometry(0.74, 1.42, 2.16, 96, 34, true), design3d.material, [0, -0.86, 0]);
  [bodice, skirt].forEach((mesh) => {
    const pos = mesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      const y = pos.getY(i);
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const angle = Math.atan2(z, x);
      const fall = mesh === skirt ? clamp((0.24 - y) / 2.16, 0.15, 1) : 0.45;
      const pleat = Math.sin(angle * 12) * 0.045 * fall;
      pos.setX(i, x * (1 + pleat));
      pos.setZ(i, z * (1 + pleat));
      pos.setY(i, y + Math.sin((y + 1.1) * 7) * 0.012);
    }
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  });
  addMesh(dressGroup, new THREE.CylinderGeometry(0.22, 0.32, 0.9, 40, 12), design3d.material, [-0.68, 0.92, 0], [0.12, 0, -0.82]);
  addMesh(dressGroup, new THREE.CylinderGeometry(0.22, 0.32, 0.9, 40, 12), design3d.material, [0.68, 0.92, 0], [0.12, 0, 0.82]);
  addMesh(dressGroup, new THREE.TorusGeometry(0.34, 0.026, 10, 64), darkTrim, [0, 1.42, 0], [Math.PI / 2, 0, 0], [1.28, 0.78, 1]);
  addMesh(dressGroup, new THREE.TorusGeometry(0.72, 0.026, 10, 96), trim, [0, 0.23, 0], [Math.PI / 2, 0, 0], [1.08, 0.82, 1]);
  addMesh(dressGroup, new THREE.TorusGeometry(1.4, 0.02, 10, 120), trim, [0, -1.94, 0], [Math.PI / 2, 0, 0], [1, 0.72, 1]);
  addMesh(dressGroup, new THREE.TorusGeometry(0.28, 0.018, 8, 52), trim, [-0.9, 0.58, 0], [Math.PI / 2, 0, 0], [0.8, 0.58, 1]);
  addMesh(dressGroup, new THREE.TorusGeometry(0.28, 0.018, 8, 52), trim, [0.9, 0.58, 0], [Math.PI / 2, 0, 0], [0.8, 0.58, 1]);
}

function sculptDressCylinder(mesh, options = {}) {
  const pos = mesh.geometry.attributes.position;
  const pleatCount = options.pleats || 14;
  const pleatDepth = options.pleatDepth || 0.035;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const angle = Math.atan2(z, x);
    const vertical = (y + (options.height || 1) * 0.5) / (options.height || 1);
    const fall = options.invertFall ? 1 - vertical : vertical;
    const pleat = Math.sin(angle * pleatCount + (options.phase || 0)) * pleatDepth * clamp(fall, 0.12, 1);
    const frontSoftness = 1 + Math.cos(angle) * (options.frontBias || 0.025);
    pos.setX(i, x * (1 + pleat));
    pos.setZ(i, z * (1 + pleat) * frontSoftness);
    pos.setY(i, y + Math.sin(angle * 8 + vertical * 2.4) * (options.yWave || 0.006) * clamp(fall, 0.2, 1));
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

function addShapePanel(group, points, material, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => {
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape);
  return addMesh(group, geometry, material, position, rotation, scale);
}

function addWrapDressShowcase(group) {
  const dressGroup = new THREE.Group();
  dressGroup.rotation.set(0, -0.16, 0);
  dressGroup.position.y = 0.12;
  dressGroup.scale.setScalar(0.82);
  group.add(dressGroup);

  const trim = productTrimMaterial("#f4efe7", 0.64);
  const shadow = productTrimMaterial("#171717", 0.78);
  const seam = productTrimMaterial("#2b2520", 0.74);

  const bodice = addMesh(
    dressGroup,
    new THREE.CylinderGeometry(0.52, 0.42, 1.08, 112, 28, true),
    design3d.material,
    [0, 0.86, 0],
    [0, 0, 0],
    [1, 1, 0.56]
  );
  sculptDressCylinder(bodice, { height: 1.08, pleats: 8, pleatDepth: 0.014, yWave: 0.004, frontBias: 0.04 });

  const skirt = addMesh(
    dressGroup,
    new THREE.CylinderGeometry(0.42, 1.12, 2.78, 144, 54, true),
    design3d.material,
    [0, -1.08, 0],
    [0, 0, 0],
    [1, 1, 0.58]
  );
  sculptDressCylinder(skirt, { height: 2.78, pleats: 18, pleatDepth: 0.05, yWave: 0.012, frontBias: 0.06, invertFall: true });

  addMesh(dressGroup, new THREE.CylinderGeometry(0.18, 0.26, 0.74, 48, 16, true), design3d.material, [-0.62, 0.98, 0.02], [0.04, 0, -0.9], [1, 1, 0.82]);
  addMesh(dressGroup, new THREE.CylinderGeometry(0.18, 0.26, 0.74, 48, 16, true), design3d.material, [0.62, 0.98, 0.02], [0.04, 0, 0.9], [1, 1, 0.82]);
  addShapePanel(dressGroup, [[-0.18, 1.34], [0, 0.86], [0.18, 1.34], [0.12, 1.4], [0, 1.18], [-0.12, 1.4]], shadow, [0, 0, 0.32]);

  addMesh(dressGroup, new THREE.TorusGeometry(0.44, 0.026, 12, 112), design3d.material, [0, 0.24, 0], [Math.PI / 2, 0, 0], [1.18, 0.62, 1]);
  addMesh(dressGroup, new THREE.CapsuleGeometry(0.08, 0.18, 8, 24), design3d.material, [0.58, 0.25, 0.38], [0.28, 0.12, 0.72], [1.35, 0.72, 0.8]);
  addExtrudedClothShape(dressGroup, [
    [0.42, 0.22],
    [0.68, 0.16],
    [0.58, -0.76],
    [0.44, -0.86],
    [0.38, -0.06]
  ], { depth: 0.06, bevelThickness: 0.012, bevelSize: 0.012, foldFreq: 7.4, foldDepth: 0.012, bodyCurve: 0.025, position: [0.18, -0.06, 0.37], rotation: [0.05, 0.12, -0.05], scale: [0.7, 0.9, 1] });
  addExtrudedClothShape(dressGroup, [
    [0.52, 0.18],
    [0.78, 0.12],
    [0.72, -0.56],
    [0.56, -0.7],
    [0.48, -0.04]
  ], { depth: 0.06, bevelThickness: 0.012, bevelSize: 0.012, foldFreq: 8.4, foldDepth: 0.012, bodyCurve: 0.025, position: [0.12, -0.12, 0.38], rotation: [0.04, 0.08, 0.08], scale: [0.55, 0.78, 1] });

  addMesh(dressGroup, new THREE.TorusGeometry(1.1, 0.018, 10, 144), trim, [0, -2.46, 0], [Math.PI / 2, 0, 0], [1, 0.58, 1]);
  addMesh(dressGroup, new THREE.CylinderGeometry(0.012, 0.012, 2.22, 8), seam, [-0.28, -1.26, 0.36], [0.04, 0.02, -0.02]);
  addMesh(dressGroup, new THREE.CylinderGeometry(0.012, 0.012, 2.18, 8), seam, [0.24, -1.28, 0.36], [0.04, -0.02, 0.02]);
}

function addDressSkirtSupplement(group) {
  const trim = new THREE.MeshStandardMaterial({ color: "#f8f2e8", roughness: 0.68, metalness: 0.01 });
  const skirt = addMesh(group, new THREE.CylinderGeometry(0.3, 0.88, 1.72, 128, 34, true), design3d.material, [0, -0.7, 0]);
  const pos = skirt.geometry.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const angle = Math.atan2(z, x);
    const fall = 1 - ((y + 0.86) / 1.72);
    const pleat = Math.sin(angle * 14) * 0.05 * clamp(fall, 0.18, 1);
    const bias = 1 + Math.cos(angle * 2) * 0.055;
    pos.setX(i, x * (1 + pleat));
    pos.setZ(i, z * (1 + pleat) * bias);
    pos.setY(i, y + Math.sin(angle * 8) * 0.01);
  }
  pos.needsUpdate = true;
  skirt.geometry.computeVertexNormals();
  addMesh(group, new THREE.TorusGeometry(0.31, 0.022, 10, 96), trim, [0, 0.2, 0], [Math.PI / 2, 0, 0], [1.08, 0.72, 1]);
  addMesh(group, new THREE.TorusGeometry(0.86, 0.018, 10, 128), trim, [0, -1.58, 0], [Math.PI / 2, 0, 0], [1, 0.78, 1]);
  addMesh(group, new THREE.CylinderGeometry(0.014, 0.014, 1.02, 8), trim, [-0.32, -0.62, 0.06], [0.02, 0, -0.08]);
  addMesh(group, new THREE.CylinderGeometry(0.014, 0.014, 1.02, 8), trim, [0.32, -0.62, 0.06], [0.02, 0, 0.08]);
}

function addDressOverlaySupplement(group) {
  const trim = productTrimMaterial("#fbf7ee", 0.64);
  const bodice = addMesh(group, new THREE.CylinderGeometry(0.28, 0.43, 0.72, 96, 18, true), design3d.material, [0, 0.54, 0.05], [0.02, 0, 0], [1, 0.98, 0.72]);
  const skirt = addMesh(group, new THREE.CylinderGeometry(0.4, 0.86, 1.58, 128, 32, true), design3d.material, [0, -0.58, 0.05], [0.01, 0, 0], [1, 1, 0.76]);
  [bodice, skirt].forEach((mesh) => {
    const pos = mesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const angle = Math.atan2(z, x);
      const fall = mesh === skirt ? clamp((0.22 - y) / 1.58, 0.18, 1) : 0.35;
      const pleat = Math.sin(angle * (mesh === skirt ? 16 : 8)) * (mesh === skirt ? 0.048 : 0.018) * fall;
      const oval = 1 + Math.cos(angle * 2) * (mesh === skirt ? 0.05 : 0.035);
      pos.setX(i, x * (1 + pleat));
      pos.setZ(i, z * (1 + pleat) * oval);
      pos.setY(i, y + Math.sin(angle * 6) * 0.008 * fall);
    }
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  });
  addMesh(group, new THREE.TorusGeometry(0.31, 0.018, 10, 96), trim, [0, 0.88, 0.05], [Math.PI / 2, 0, 0], [1.08, 0.72, 1]);
  addMesh(group, new THREE.TorusGeometry(0.43, 0.022, 10, 96), trim, [0, 0.16, 0.05], [Math.PI / 2, 0, 0], [1.08, 0.7, 1]);
  addMesh(group, new THREE.TorusGeometry(0.86, 0.018, 10, 128), trim, [0, -1.37, 0.05], [Math.PI / 2, 0, 0], [1, 0.74, 1]);
  addMesh(group, new THREE.CylinderGeometry(0.016, 0.016, 0.88, 8), trim, [-0.26, -0.54, 0.18], [0.02, 0, -0.06]);
  addMesh(group, new THREE.CylinderGeometry(0.016, 0.016, 0.88, 8), trim, [0.26, -0.54, 0.18], [0.02, 0, 0.06]);
}

function addShirt(group, config) {
  const w = config.width || 1.75;
  const half = w / 2;
  const waist = config.waist ? 0.74 : 0.9;
  addExtrudedClothShape(group, [
    [-half * 0.48, 1.05],
    [-half * 0.95, 0.72],
    [-half * 1.25, 0.2, -half * 1.18, 0.52, -half * 1.25, 0.34],
    [-half * 0.8, -0.06],
    [-half * waist, -1.02],
    [half * waist, -1.02],
    [half * 0.8, -0.06],
    [half * 1.25, 0.2],
    [half * 0.95, 0.72, half * 1.25, 0.34, half * 1.18, 0.52],
    [half * 0.48, 1.05],
    [0.22, 0.86, half * 0.24, 1.0, half * 0.12, 0.94],
    [-0.22, 0.86, -half * 0.12, 0.94, -half * 0.24, 1.0]
  ], { depth: 0.2, foldFreq: 5.2, foldDepth: 0.018, bodyCurve: 0.055, verticalWave: 0.008 });
  const trim = productTrimMaterial("#f7f2ea", 0.58);
  addMesh(group, new THREE.TorusGeometry(0.25, 0.018, 8, 48), trim, [0, 0.86, 0.15], [Math.PI / 2, 0, 0], [1.25, 0.72, 1]);
  addMesh(group, new THREE.BoxGeometry(w * waist * 1.62, 0.05, 0.04), trim, [0, -1.02, 0.14], [0, 0, 0.01]);
  addMesh(group, new THREE.BoxGeometry(0.55, 0.05, 0.04), trim, [-half * 1.02, 0.1, 0.15], [0, 0, -0.72]);
  addMesh(group, new THREE.BoxGeometry(0.55, 0.05, 0.04), trim, [half * 1.02, 0.1, 0.15], [0, 0, 0.72]);
}

function addSocks(group) {
  const trim = productTrimMaterial("#f8f2ea", 0.62);
  [-0.34, 0.34].forEach((x) => {
    addMesh(group, new THREE.CylinderGeometry(0.22, 0.26, 1.45, 32, 10), design3d.material, [x, 0.22, 0], [0.08, 0, 0]);
    addMesh(group, new THREE.CapsuleGeometry(0.25, 0.72, 8, 24), design3d.material, [x, -0.64, 0.28], [Math.PI / 2, 0, 0]);
    addMesh(group, new THREE.CylinderGeometry(0.24, 0.235, 0.15, 36, 3), trim, [x, 0.96, 0], [0.08, 0, 0]);
    addMesh(group, new THREE.TorusGeometry(0.23, 0.006, 6, 36), trim, [x, 1.03, 0.01], [Math.PI / 2, 0, 0]);
    addMesh(group, new THREE.SphereGeometry(0.24, 28, 14), trim, [x, -0.63, 0.66], [0, 0, 0], [1, 0.46, 0.58]);
    addMesh(group, new THREE.SphereGeometry(0.19, 24, 12), trim, [x, -0.52, -0.02], [0, 0, 0], [0.92, 0.58, 0.72]);
  });
}

function addLeggings(group) {
  const trim = productTrimMaterial("#171717", 0.58);
  [-0.26, 0.26].forEach((x) => {
    addMesh(group, new THREE.CylinderGeometry(0.24, 0.33, 2.2, 36, 16), design3d.material, [x, -0.42, 0], [0, 0, x > 0 ? -0.08 : 0.08]);
    addMesh(group, new THREE.CylinderGeometry(0.235, 0.235, 0.08, 36, 2), trim, [x + (x > 0 ? 0.14 : -0.14), -1.52, 0], [0, 0, x > 0 ? -0.08 : 0.08]);
  });
  addMesh(group, new THREE.BoxGeometry(0.88, 0.58, 0.34, 16, 10, 4), design3d.material, [0, 0.92, 0]);
  addMesh(group, new THREE.BoxGeometry(0.98, 0.14, 0.36, 18, 3, 4), trim, [0, 1.22, 0]);
  addMesh(group, new THREE.BoxGeometry(0.025, 1.72, 0.04), trim, [0, -0.34, 0.19], [0, 0, 0.02]);
}

function addSeat(group) {
  addSoftBox(group, { size: [2.4, 0.52, 1.6] });
  addMesh(group, new THREE.BoxGeometry(2.4, 1.45, 0.28, 16, 16, 4), design3d.material, [0, 0.98, -0.72], [-0.18, 0, 0]);
}

function addBedding(group) {
  const base = productTrimMaterial("#f5efe6", 0.76);
  const hem = productTrimMaterial("#f8f2ea", 0.64);
  addMesh(group, roundedBoxGeometry(3.18, 0.36, 2.12), base, [0, -0.42, 0]);
  const duvet = addMesh(group, new THREE.BoxGeometry(3.02, 0.2, 2.38, 46, 4, 36), design3d.material, [0, 0.02, 0.2], [-0.04, 0, 0]);
  const pos = duvet.geometry.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = pos.getY(i);
    const wave = Math.sin((x + 1.4) * 4.2) * 0.025 + Math.cos((z + 0.8) * 5.1) * 0.018;
    pos.setY(i, y + wave);
  }
  pos.needsUpdate = true;
  duvet.geometry.computeVertexNormals();
  addMesh(group, new THREE.BoxGeometry(3.06, 0.045, 0.08), hem, [0, 0.15, 1.36], [-0.04, 0, 0]);
  addSoftBox(group, { size: [1.1, 0.34, 0.62], position: [-0.78, 0.38, -0.85] });
  addSoftBox(group, { size: [1.1, 0.34, 0.62], position: [0.78, 0.38, -0.85] });
}

function addNotebook(group) {
  const pages = productTrimMaterial("#f8f4ed", 0.52);
  const band = productTrimMaterial("#171717", 0.62);
  addMesh(group, new THREE.BoxGeometry(1.65, 2.25, 0.16, 24, 30, 3), pages, [0.06, -0.02, -0.08], [-0.15, 0.18, 0]);
  addMesh(group, new THREE.BoxGeometry(1.72, 2.34, 0.09, 28, 32, 2), design3d.material, [0, 0, 0.03], [-0.15, 0.18, 0]);
  addMesh(group, new THREE.BoxGeometry(0.16, 2.36, 0.12, 4, 30, 2), band, [-0.78, 0, 0.08], [-0.15, 0.18, 0]);
  addMesh(group, new THREE.BoxGeometry(0.05, 2.08, 0.13, 3, 28, 2), band, [0.58, 0, 0.11], [-0.15, 0.18, 0]);
  addMesh(group, new THREE.BoxGeometry(0.08, 0.72, 0.035), productTrimMaterial("#b82828", 0.58), [0.1, -1.04, 0.14], [-0.15, 0.18, 0]);
}

function fabricPanelGeometry(width, height, options = {}) {
  const geometry = new THREE.PlaneGeometry(width, height, options.segmentsX || 42, options.segmentsY || 72);
  const pos = geometry.attributes.position;
  const curve = options.curve ?? 0.1;
  const wave = options.wave ?? 0.04;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const nx = x / (width / 2);
    const ny = y / (height / 2);
    const fold = Math.sin((ny + 1) * (options.foldFreq || 7.5) + (options.foldOffset || 0)) * wave * (1 - Math.abs(nx) * 0.4);
    const barrel = curve * (1 - nx * nx) * (options.reverseCurve ? -1 : 1);
    pos.setZ(i, pos.getZ(i) + fold + barrel);
    pos.setX(i, x + Math.sin((ny + 1) * 3.8) * (options.sway || 0.015));
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function taperedFabricGeometry(widthTop, widthBottom, height, options = {}) {
  const segmentsX = options.segmentsX || 34;
  const segmentsY = options.segmentsY || 58;
  const positions = [];
  const uvs = [];
  const indices = [];
  const curve = options.curve ?? 0.08;
  const wave = options.wave ?? 0.028;
  for (let yIndex = 0; yIndex <= segmentsY; yIndex += 1) {
    const v = yIndex / segmentsY;
    const ny = v * 2 - 1;
    const width = widthTop + (widthBottom - widthTop) * v;
    for (let xIndex = 0; xIndex <= segmentsX; xIndex += 1) {
      const u = xIndex / segmentsX;
      const nx = u * 2 - 1;
      const x = nx * width * 0.5 + Math.sin((v + 0.12) * Math.PI * 2) * (options.sway || 0.012);
      const y = (v - 0.5) * height;
      const z = curve * (1 - nx * nx) + Math.sin((v + (options.foldOffset || 0)) * (options.foldFreq || 7.6)) * wave * (1 - Math.abs(nx) * 0.32);
      positions.push(x, y, z);
      uvs.push(u * (options.uRepeat || 1), v * (options.vRepeat || 1));
    }
  }
  for (let yIndex = 0; yIndex < segmentsY; yIndex += 1) {
    for (let xIndex = 0; xIndex < segmentsX; xIndex += 1) {
      const a = yIndex * (segmentsX + 1) + xIndex;
      const b = a + segmentsX + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

function pinchedSilkScarfGeometry(width, height, options = {}) {
  const segmentsX = options.segmentsX || 64;
  const segmentsY = options.segmentsY || 64;
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let yIndex = 0; yIndex <= segmentsY; yIndex += 1) {
    const v = yIndex / segmentsY;
    const ny = v * 2 - 1;
    for (let xIndex = 0; xIndex <= segmentsX; xIndex += 1) {
      const u = xIndex / segmentsX;
      const nx = u * 2 - 1;
      const radius = Math.sqrt(nx * nx + ny * ny);
      const pinch = Math.exp(-radius * radius * 3.9);
      const corner = Math.pow(Math.abs(nx) * Math.abs(ny), 4);
      const edgeX = Math.pow(Math.abs(nx), 7);
      const edgeY = Math.pow(Math.abs(ny), 7);
      const edgeLift = Math.pow(Math.max(Math.abs(nx), Math.abs(ny)), 5) * 0.045;
      const radialFold = Math.sin(Math.atan2(ny, nx) * 8 + radius * 7.5) * 0.018 * (1 - pinch * 0.35);
      const weaveFold = Math.sin((nx * 5.8 + ny * 3.5) + (options.foldOffset || 0)) * 0.014;
      const x = nx * width * 0.5 * (1 - pinch * 0.18 - corner * 0.055)
        + Math.sin(ny * Math.PI * 2.6) * 0.018
        + Math.sin(ny * Math.PI * 3.4) * edgeX * 0.042;
      const y = ny * height * 0.5 * (1 - pinch * 0.22 - corner * 0.045)
        + Math.cos(nx * Math.PI * 2.2) * 0.014
        + Math.sin(nx * Math.PI * 3.1) * edgeY * 0.036;
      const z = pinch * 0.24 + edgeLift + corner * 0.055 + radialFold + weaveFold;
      positions.push(x, y, z);
      uvs.push(u * (options.uRepeat || 1), v * (options.vRepeat || 1));
    }
  }
  for (let yIndex = 0; yIndex < segmentsY; yIndex += 1) {
    for (let xIndex = 0; xIndex < segmentsX; xIndex += 1) {
      const a = yIndex * (segmentsX + 1) + xIndex;
      const b = a + segmentsX + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

function scarfLoopBandGeometry(radiusX, radiusZ, bandHeight, options = {}) {
  const segmentsU = options.segmentsU || 160;
  const segmentsV = options.segmentsV || 16;
  const phase = options.phase || 0;
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let i = 0; i <= segmentsU; i += 1) {
    const u = (i / segmentsU) * Math.PI * 2;
    const ripple = Math.sin(u * 2.2 + phase) * 0.026 + Math.sin(u * 5.4 + phase) * 0.008;
    const radialFold = Math.sin(u * 3.2 + phase) * 0.022;
    for (let j = 0; j <= segmentsV; j += 1) {
      const t = j / segmentsV;
      const v = t - 0.5;
      const softEdge = 1 - Math.abs(v) * 0.34;
      const radiusLift = radialFold * softEdge + Math.cos(t * Math.PI * 2 + phase) * 0.012;
      const x = (radiusX + radiusLift) * Math.cos(u);
      const z = (radiusZ + radiusLift * 0.55) * Math.sin(u);
      const y = v * bandHeight + ripple * softEdge + Math.sin((t + 0.12) * Math.PI) * 0.012;
      positions.push(x, y, z);
      uvs.push((i / segmentsU) * (options.uRepeat || 2.4), t * (options.vRepeat || 1));
    }
  }
  for (let i = 0; i < segmentsU; i += 1) {
    for (let j = 0; j < segmentsV; j += 1) {
      const a = i * (segmentsV + 1) + j;
      const b = a + segmentsV + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

function addHanger(group, width = 1.45, y = 1.08, z = -0.04) {
  const wood = productTrimMaterial("#1c1b19", 0.56);
  const metal = productTrimMaterial("#c4b28d", 0.4, 0.18);
  addMesh(group, new THREE.CylinderGeometry(0.025, 0.025, width, 18), wood, [0, y, z], [0, 0, Math.PI / 2]);
  addMesh(group, new THREE.TorusGeometry(0.16, 0.012, 8, 36), metal, [0, y + 0.16, z], [0, 0, 0], [0.62, 1, 1]);
}

function addScarfShowcase(group) {
  const thread = productTrimMaterial("#3c352e", 0.78, 0.01, 0.55);
  const wrap = new THREE.Group();
  wrap.position.set(0, 0.15, 0.08);
  wrap.rotation.set(-0.34, -0.1, 0);
  group.add(wrap);

  addMesh(wrap, new THREE.TorusGeometry(0.58, 0.12, 18, 148), design3d.material, [0, 1.08, 0.02], [0, 0, 0], [1.32, 0.56, 0.74]);
  addMesh(wrap, scarfLoopBandGeometry(0.76, 0.34, 0.26, { phase: 0.2, uRepeat: 3.2 }), design3d.material, [0, 0.99, 0.1], [0.02, 0, 0], [1.02, 1, 1]);
  addMesh(wrap, scarfLoopBandGeometry(0.69, 0.29, 0.22, { phase: 1.6, uRepeat: 2.8 }), design3d.material, [0.01, 0.83, 0.18], [0.04, 0, 0], [1.05, 1, 1]);

  const left = addMesh(
    wrap,
    fabricPanelGeometry(0.54, 2.12, { curve: 0.1, wave: 0.036, foldFreq: 8.2, foldOffset: 0.5, sway: 0.034 }),
    design3d.material,
    [-0.62, -0.3, 0.26],
    [0.12, 0.24, -0.08]
  );
  const right = addMesh(
    wrap,
    fabricPanelGeometry(0.56, 2.22, { curve: 0.08, wave: 0.034, foldFreq: 8.6, foldOffset: 1.7, reverseCurve: true, sway: 0.03 }),
    design3d.material,
    [0.6, -0.34, 0.2],
    [0.1, -0.2, 0.08]
  );
  [left, right].forEach((panel) => { panel.castShadow = true; });

  [
    { x: -0.62, y: -1.44, z: 0.3, angle: -0.08 },
    { x: 0.6, y: -1.52, z: 0.24, angle: 0.08 }
  ].forEach((end) => {
    for (let i = 0; i < 14; i += 1) {
      const offset = -0.25 + i * 0.038;
      const length = 0.24 + (i % 3) * 0.018;
      addMesh(
        wrap,
        new THREE.CylinderGeometry(0.0042, 0.0042, length, 5),
        thread,
        [end.x + offset * Math.cos(end.angle), end.y - length / 2, end.z + offset * 0.16],
        [0.08, 0, end.angle]
      );
    }
  });
}

function addSilkScarfShowcase(group) {
  const silk = new THREE.Group();
  silk.position.set(0, -0.08, 0.08);
  silk.rotation.set(-0.2, 0.18, -0.12);
  group.add(silk);

  const shadowFold = productTrimMaterial("#2a2520", 0.86, 0.01, 0.22);

  const base = addMesh(
    silk,
    pinchedSilkScarfGeometry(2.36, 1.92, { uRepeat: 1.1, vRepeat: 1.04 }),
    design3d.material,
    [0, -0.03, 0.02],
    [0.03, 0, 0.18]
  );
  base.castShadow = true;

  [
    { rotation: [0.1, 0.02, 0.62], position: [-0.02, -0.01, 0.15], foldOffset: 0.7 },
    { rotation: [0.1, -0.02, -0.62], position: [0.02, -0.02, 0.16], foldOffset: 2.2 }
  ].forEach((fold) => {
    addMesh(
      silk,
      taperedFabricGeometry(0.44, 0.58, 1.34, {
        curve: 0.038,
        wave: 0.018,
        foldFreq: 7.4,
        foldOffset: fold.foldOffset,
        uRepeat: 0.54,
        vRepeat: 0.82
      }),
      design3d.material,
      fold.position,
      fold.rotation
    );
  });

  addMesh(
    silk,
    new THREE.SphereGeometry(0.29, 56, 24),
    design3d.material,
    [0, -0.02, 0.34],
    [0.18, 0.08, -0.18],
    [1.28, 0.78, 0.58]
  );
  addMesh(silk, new THREE.TorusGeometry(0.24, 0.018, 8, 64), shadowFold, [0.02, -0.01, 0.33], [0.12, 0.05, -0.18], [1.48, 0.58, 0.34]);
}

function addPillowShowcase(group) {
  addSoftBox(group, { size: [2.0, 1.18, 0.42], position: [-0.18, 0.1, 0.1] });
  addMesh(group, roundedBoxGeometry(1.66, 1.0, 0.34), design3d.material, [0.42, -0.28, 0.42], [0.02, -0.12, 0.04]);
  const seam = productTrimMaterial("#efe6d8", 0.78);
  addMesh(group, new THREE.TorusGeometry(0.82, 0.018, 8, 80), seam, [0.42, -0.28, 0.62], [0, 0, 0], [1.66 / 1.64, 1.0 / 1.64, 1]);
}

function addSocksShowcase(group) {
  const trim = productTrimMaterial("#f5efe6", 0.62);
  [-0.34, 0.34].forEach((x, index) => {
    const angle = index === 0 ? -0.16 : 0.16;
    addMesh(group, new THREE.CylinderGeometry(0.2, 0.27, 1.34, 52, 18), design3d.material, [x, 0.38, 0], [0.1, 0, angle]);
    addMesh(group, new THREE.CapsuleGeometry(0.26, 0.82, 14, 38), design3d.material, [x + (index === 0 ? -0.09 : 0.09), -0.53, 0.34], [Math.PI / 2, 0, angle * 0.4], [1.05, 0.92, 1]);
    addMesh(group, new THREE.CylinderGeometry(0.23, 0.22, 0.16, 44, 4), trim, [x, 1.1, 0], [0.1, 0, angle]);
    addMesh(group, new THREE.SphereGeometry(0.24, 36, 18), trim, [x + (index === 0 ? -0.1 : 0.1), -0.5, 0.74], [0, 0, 0], [1.05, 0.48, 0.58]);
    addMesh(group, new THREE.SphereGeometry(0.18, 28, 16), trim, [x, -0.35, 0.04], [0, 0, 0], [0.9, 0.62, 0.8]);
  });
  addMesh(group, new THREE.BoxGeometry(1.22, 0.06, 0.36), productTrimMaterial("#181818", 0.6), [0, -1.0, 0.08]);
}

function addDressShowcase(group) {
  addHanger(group, 1.52, 1.38, -0.06);
  const trim = productTrimMaterial("#f8f1e7", 0.62);
  addExtrudedClothShape(group, [
    [-0.34, 1.14],
    [-0.66, 0.92],
    [-0.86, 0.36, -0.9, 0.72, -0.9, 0.52],
    [-0.58, 0.12],
    [-1.02, -1.6],
    [1.02, -1.6],
    [0.58, 0.12],
    [0.86, 0.36, 0.9, 0.52, 0.9, 0.72],
    [0.66, 0.92],
    [0.34, 1.14],
    [0.17, 0.92, 0.28, 1.12, 0.2, 1.02],
    [-0.17, 0.92, -0.2, 1.02, -0.28, 1.12]
  ], { depth: 0.24, foldFreq: 8.4, foldDepth: 0.028, bodyCurve: 0.08, verticalWave: 0.01 });
  addMesh(group, new THREE.TorusGeometry(0.22, 0.018, 8, 48), trim, [0, 0.94, 0.17], [Math.PI / 2, 0, 0], [1.35, 0.72, 1]);
  addMesh(group, new THREE.BoxGeometry(1.06, 0.07, 0.05), trim, [0, 0.18, 0.16]);
  addMesh(group, new THREE.BoxGeometry(1.92, 0.06, 0.05), trim, [0, -1.58, 0.16]);
}

function addTshirtShowcase(group, config) {
  const display = new THREE.Group();
  display.rotation.set(-0.03, -0.16, 0.02);
  display.position.set(0, 0.02, 0.02);
  group.add(display);
  const trim = productTrimMaterial("#f7f2ea", 0.58);
  const w = config.width || 1.75;
  const half = w / 2;
  const waist = config.waist ? 0.68 : 0.86;
  addExtrudedClothShape(display, [
    [-half * 0.46, 1.02],
    [-half * 0.98, 0.72],
    [-half * 1.22, 0.22, -half * 1.14, 0.5, -half * 1.22, 0.36],
    [-half * 0.76, -0.04],
    [-half * waist, -1.04],
    [half * waist, -1.04],
    [half * 0.76, -0.04],
    [half * 1.22, 0.22],
    [half * 0.98, 0.72, half * 1.22, 0.36, half * 1.14, 0.5],
    [half * 0.46, 1.02],
    [0.23, 0.84, half * 0.22, 1.0, half * 0.1, 0.93],
    [-0.23, 0.84, -half * 0.1, 0.93, -half * 0.22, 1.0]
  ], { depth: 0.34, foldFreq: 7.4, foldDepth: 0.036, bodyCurve: 0.13, verticalWave: 0.012 });
  addMesh(display, new THREE.TorusGeometry(0.25, 0.019, 8, 56), trim, [0, 0.84, 0.25], [Math.PI / 2, 0, 0], [1.32, 0.7, 1]);
  addMesh(display, new THREE.BoxGeometry(w * waist * 1.58, 0.062, 0.066), trim, [0, -1.04, 0.22]);
  addMesh(display, new THREE.BoxGeometry(0.56, 0.062, 0.06), trim, [-half * 1.02, 0.1, 0.24], [0, 0, -0.72]);
  addMesh(display, new THREE.BoxGeometry(0.56, 0.062, 0.06), trim, [half * 1.02, 0.1, 0.24], [0, 0, 0.72]);
  addMesh(display, new THREE.BoxGeometry(0.035, 1.62, 0.032), trim, [-half * waist, -0.23, 0.25], [0, 0, -0.015]);
  addMesh(display, new THREE.BoxGeometry(0.035, 1.62, 0.032), trim, [half * waist, -0.23, 0.25], [0, 0, 0.015]);
}

function addLeggingsShowcase(group) {
  const trim = productTrimMaterial("#151515", 0.58);
  addExtrudedClothShape(group, [
    [-0.52, 1.06],
    [-0.14, 1.1],
    [-0.06, 0.4],
    [-0.18, -1.46],
    [-0.46, -1.46],
    [-0.58, 0.26],
    [-0.72, 1.02]
  ], { depth: 0.18, foldFreq: 9, foldDepth: 0.014, bodyCurve: 0.035, verticalWave: 0.004 });
  addExtrudedClothShape(group, [
    [0.52, 1.06],
    [0.14, 1.1],
    [0.06, 0.4],
    [0.18, -1.46],
    [0.46, -1.46],
    [0.58, 0.26],
    [0.72, 1.02]
  ], { depth: 0.18, foldFreq: 9, foldDepth: 0.014, bodyCurve: 0.035, verticalWave: 0.004, foldOffset: 1.4 });
  addMesh(group, roundedBoxGeometry(1.24, 0.32, 0.2), design3d.material, [0, 0.94, 0]);
  addMesh(group, new THREE.BoxGeometry(1.26, 0.1, 0.05), trim, [0, 1.12, 0.12]);
  addMesh(group, new THREE.BoxGeometry(0.03, 1.8, 0.04), trim, [0, -0.32, 0.12]);
  addMesh(group, new THREE.BoxGeometry(0.3, 0.06, 0.04), trim, [-0.32, -1.47, 0.12]);
  addMesh(group, new THREE.BoxGeometry(0.3, 0.06, 0.04), trim, [0.32, -1.47, 0.12]);
}

function addBlanketShowcase(group) {
  const rail = productTrimMaterial("#1d1b19", 0.55);
  const trim = productTrimMaterial("#f6efe4", 0.68);
  addMesh(group, new THREE.CylinderGeometry(0.035, 0.035, 2.45, 24), rail, [0, 0.72, -0.12], [0, 0, Math.PI / 2]);
  addMesh(group, fabricPanelGeometry(2.24, 1.6, { curve: 0.12, wave: 0.035, foldFreq: 8.5 }), design3d.material, [0, -0.12, 0.08], [0.08, 0, 0]);
  addMesh(group, fabricPanelGeometry(2.16, 1.36, { curve: -0.04, wave: 0.028, foldFreq: 7.2, foldOffset: 1.1, reverseCurve: true }), design3d.material, [0, -0.34, -0.18], [-0.08, 0, 0]);
  addMesh(group, new THREE.CylinderGeometry(0.013, 0.013, 2.24, 10), trim, [0, -0.94, 0.12], [0, 0, Math.PI / 2]);
  for (let i = 0; i < 30; i += 1) {
    const x = -1.08 + i * (2.16 / 29);
    addMesh(group, new THREE.CylinderGeometry(0.0035, 0.0035, 0.13, 6), trim, [x, -1.03, 0.13]);
  }
}

function addBeddingShowcase(group) {
  const frame = productTrimMaterial("#2b2118", 0.58);
  const mattress = productTrimMaterial("#f4eee6", 0.76);
  const hem = productTrimMaterial("#f8f1e8", 0.64);
  addMesh(group, roundedBoxGeometry(3.08, 0.36, 2.08), frame, [0, -0.78, 0]);
  addMesh(group, roundedBoxGeometry(2.86, 0.26, 1.88), mattress, [0, -0.48, 0.03]);
  const duvet = addMesh(group, new THREE.BoxGeometry(2.76, 0.16, 1.72, 46, 4, 36), design3d.material, [0, -0.18, 0.18], [-0.04, 0, 0]);
  const pos = duvet.geometry.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = pos.getY(i);
    pos.setY(i, y + Math.sin((x + 1.2) * 4.6) * 0.022 + Math.cos((z + 0.7) * 5.2) * 0.016);
  }
  pos.needsUpdate = true;
  duvet.geometry.computeVertexNormals();
  addMesh(group, new THREE.BoxGeometry(2.8, 0.052, 0.08), hem, [0, -0.06, 0.98], [-0.04, 0, 0]);
  addSoftBox(group, { size: [0.88, 0.28, 0.52], position: [-0.52, 0.06, -0.72] });
  addSoftBox(group, { size: [0.88, 0.28, 0.52], position: [0.52, 0.06, -0.72] });
  addMesh(group, new THREE.BoxGeometry(3.18, 0.92, 0.16), frame, [0, -0.18, -1.06], [-0.06, 0, 0]);
  [-1.25, 1.25].forEach((x) => {
    [-0.78, 0.78].forEach((z) => addMesh(group, new THREE.CylinderGeometry(0.045, 0.045, 0.42, 16), frame, [x, -1.22, z]));
  });
}

function addMugShowcase(group) {
  const ceramic = productTrimMaterial("#f9f6ef", 0.46);
  const inner = productTrimMaterial("#ecebea", 0.52, 0.02, 0.88);
  const body = addMesh(group, new THREE.CylinderGeometry(0.72, 0.68, 1.52, 108, 24, true), design3d.material, [0, -0.03, 0]);
  const pos = body.geometry.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const y = pos.getY(i) / 0.76;
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const bulge = 1 + 0.018 * Math.cos(y * Math.PI * 0.72);
    pos.setX(i, x * bulge);
    pos.setZ(i, z * bulge);
  }
  pos.needsUpdate = true;
  body.geometry.computeVertexNormals();
  addMesh(group, new THREE.TorusGeometry(0.73, 0.045, 16, 108), ceramic, [0, 0.76, 0], [Math.PI / 2, 0, 0]);
  addMesh(group, new THREE.CylinderGeometry(0.58, 0.56, 0.026, 96), inner, [0, 0.75, 0]);
  addMesh(group, new THREE.CylinderGeometry(0.62, 0.58, 0.045, 108), ceramic, [0, -0.81, 0]);
  addMesh(group, new THREE.TorusGeometry(0.38, 0.058, 16, 64), ceramic, [0.76, 0.04, 0], [0, Math.PI / 2, 0], [0.72, 1.16, 1]);
  addMesh(group, new THREE.TorusGeometry(0.22, 0.014, 8, 52), ceramic, [0, -0.84, 0], [Math.PI / 2, 0, 0], [2.75, 2.75, 1]);
}

function addBeddingTextileSupplement(group, config = {}) {
  const textileGroup = new THREE.Group();
  textileGroup.rotation.y = config.rotation?.[1] || 0;
  group.add(textileGroup);
  addMesh(textileGroup, fabricPanelGeometry(2.2, 1.26, { curve: 0.07, wave: 0.025, foldFreq: 6.8 }), design3d.material, [0.02, -0.54, 0.35], [-Math.PI / 2 + 0.1, 0, 0.03]);
  addSoftBox(textileGroup, { size: [0.72, 0.22, 0.42], position: [-0.45, -0.18, -0.48] });
  addSoftBox(textileGroup, { size: [0.72, 0.22, 0.42], position: [0.45, -0.18, -0.48] });
}

function addNotebookCoverSupplement(group, config = {}) {
  const rotation = config.rotation || [-0.62, 0.36, -0.14];
  const notebook = new THREE.Group();
  notebook.position.set(0.01, 0.04, 0.28);
  notebook.rotation.set(...rotation);
  group.add(notebook);

  const dark = productTrimMaterial("#161616", 0.58);
  const pages = productTrimMaterial("#eeeae2", 0.82);
  addMesh(notebook, roundedFlatBoxGeometry(1.56, 2.06, 0.13, 0.085), pages, [0, 0, 0]);
  addMesh(notebook, roundedPanelGeometry(1.62, 2.12, 0.1), design3d.material, [0, 0, 0.105]);
  addMesh(notebook, roundedPanelGeometry(0.04, 1.84, 0.014), dark, [0.55, 0, 0.118]);
}

function addProductSupplement(group, config) {
  if (config.supplement === "beddingTextile") addBeddingTextileSupplement(group, config);
  else if (config.supplement === "notebookCover") addNotebookCoverSupplement(group, config);
}

function buildFallbackProductModel(group, config) {
  if (config.kind === "softBox") addSoftBox(group, config);
  else if (config.kind === "cloth") addCloth(group, config);
  else if (config.kind === "cup") addCup(group, false);
  else if (config.kind === "mug") addCup(group, true);
  else if (config.kind === "dress") addDress(group);
  else if (config.kind === "shirt") addShirt(group, config);
  else if (config.kind === "socks") addSocks(group);
  else if (config.kind === "leggings") addLeggings(group);
  else if (config.kind === "scarfShowcase") addScarfShowcase(group);
  else if (config.kind === "silkScarfShowcase") addSilkScarfShowcase(group);
  else if (config.kind === "pillowShowcase") addPillowShowcase(group);
  else if (config.kind === "socksShowcase") addSocksShowcase(group);
  else if (config.kind === "dressShowcase") addDressShowcase(group);
  else if (config.kind === "wrapDressShowcase") addWrapDressShowcase(group);
  else if (config.kind === "tshirtShowcase") addTshirtShowcase(group, config);
  else if (config.kind === "leggingsShowcase") addLeggingsShowcase(group);
  else if (config.kind === "blanketShowcase") addBlanketShowcase(group);
  else if (config.kind === "beddingShowcase") addBeddingShowcase(group);
  else if (config.kind === "mugShowcase") addMugShowcase(group);
  else if (config.kind === "seat") addSeat(group);
  else if (config.kind === "bedding") addBedding(group);
  else if (config.kind === "notebook") addNotebook(group);
}

async function buildProductModel(productKey = state.designProduct) {
  if (!THREE || !design3d.scene) return;
  ui.designStage.classList.remove("is-3d-ready");
  state.designNeedsRender = true;
  renderFallbackDesign();
  clearProductGroup();
  const config = productConfigs[productKey] || productConfigs.seat;
  const hasExternalModel = !!(config.obj || config.model || config.models?.length);
  setDesignStatus(hasExternalModel ? "模型正在载入，可先调整纹样预览" : "");
  const group = new THREE.Group();
  design3d.productGroup = group;
  design3d.scene.add(group);
  if (config.kind === "photoMockup") {
    state.designNeedsRender = true;
    renderDesign();
    return;
  }
  if (config.supplementOnly) {
    addProductSupplement(group, config);
    state.designNeedsRender = true;
    renderDesign();
    return;
  }
  const model = await loadProductModel(config);
  if (model) {
    group.add(model);
    if (config.supplement === "dressSkirt") addDressSkirtSupplement(group);
    else if (config.supplement === "dressOverlay") addDressOverlaySupplement(group);
    else addProductSupplement(group, config);
  } else {
    buildFallbackProductModel(group, config);
  }
  if (productKey === state.designProduct) {
    setDesignStatus(!model && hasExternalModel ? "已显示预览模型，重新选择产品可重试加载" : "");
  }
  group.scale.setScalar(state.designScale);
  state.designNeedsRender = true;
  renderDesign();
}

async function ensureDesign3d() {
  if (design3d.ready) return;
  try {
    THREE = await import("three");
    ({ GLTFLoader } = await import("./vendor/three/GLTFLoader.js"));
    ({ OBJLoader } = await import("./vendor/three/OBJLoader.js"));
    ({ MTLLoader } = await import("./vendor/three/MTLLoader.js"));
    ({ clone: cloneSkeletonModel } = await import("./vendor/three/SkeletonUtils.js"));
  } catch (error) {
    console.warn("3D engine unavailable, using canvas preview.", error);
    setDesignStatus("已显示纹样预览，3D 暂未载入");
    renderFallbackDesign();
    return;
  }
  const rect = ui.designStage.getBoundingClientRect();
  try {
    design3d.renderer = new THREE.WebGLRenderer({ canvas: ui.designCanvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  } catch (error) {
    console.warn("WebGL unavailable, using canvas preview.", error);
    setDesignStatus("已显示纹样预览，当前浏览器未开启 3D");
    renderFallbackDesign();
    return;
  }
  design3d.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  design3d.renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
  design3d.renderer.shadowMap.enabled = true;
  design3d.scene = new THREE.Scene();
  design3d.camera = new THREE.PerspectiveCamera(34, Math.max(1, rect.width) / Math.max(1, rect.height), 0.1, 100);
  design3d.camera.position.set(0, 0.15, design3d.distance);
  design3d.scene.add(new THREE.HemisphereLight(0xffffff, 0x9b9b9b, 1.8));
  const key = new THREE.DirectionalLight(0xffffff, 2.5);
  key.position.set(2.8, 4.2, 4);
  key.castShadow = true;
  design3d.scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 1.0);
  fill.position.set(-3, 2, -2);
  design3d.scene.add(fill);
  design3d.shadow = new THREE.Mesh(
    new THREE.CircleGeometry(2.8, 80),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.08 })
  );
  design3d.shadow.rotation.x = -Math.PI / 2;
  design3d.shadow.position.y = -1.65;
  design3d.scene.add(design3d.shadow);
  design3d.material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.64,
    metalness: 0.02,
    side: THREE.DoubleSide
  });
  design3d.loader = new GLTFLoader();
  design3d.ready = true;
  bindDesignCanvasEvents();
  updateDesignTexture();
}

function resizeDesignRenderer() {
  if (!design3d.renderer || !ui.designStage) return;
  const rect = ui.designStage.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  design3d.renderer.setSize(width, height, false);
  design3d.camera.aspect = width / height;
  design3d.camera.updateProjectionMatrix();
  state.designNeedsRender = true;
}

function updateDesignCamera() {
  if (!design3d.camera) return;
  design3d.camera.position.set(design3d.panX, design3d.panY + 0.1, design3d.distance);
  design3d.camera.lookAt(design3d.panX, design3d.panY, 0);
}

function renderDesign() {
  if (!design3d.ready || state.designNeedsRender) renderFallbackDesign();
  if (!design3d.ready || !state.designNeedsRender) return;
  resizeDesignRenderer();
  updateDesignCamera();
  if (design3d.productGroup) {
    design3d.productGroup.rotation.x = design3d.rotationX;
    design3d.productGroup.rotation.y = design3d.rotationY;
    design3d.productGroup.scale.setScalar(state.designScale);
  }
  design3d.renderer.render(design3d.scene, design3d.camera);
  if (design3d.material?.map && design3d.productGroup?.children.length) ui.designStage.classList.add("is-3d-ready");
  state.designNeedsRender = false;
}

function resetDesignView() {
  design3d.rotationX = -0.06;
  design3d.rotationY = -0.28;
  design3d.panX = 0;
  design3d.panY = 0;
  design3d.distance = 6.8;
  state.designScale = Number(ui.designZoom?.value || 1);
  state.designNeedsRender = true;
}

function bindDesignCanvasEvents() {
  if (!ui.designCanvas || design3d.eventsBound) return;
  design3d.eventsBound = true;
  ui.designCanvas.addEventListener("pointerdown", (event) => {
    ui.designCanvas.setPointerCapture(event.pointerId);
    design3d.dragging = true;
    design3d.panning = event.shiftKey;
    design3d.pointer = {
      x: event.clientX,
      y: event.clientY,
      rotationX: design3d.rotationX,
      rotationY: design3d.rotationY,
      panX: design3d.panX,
      panY: design3d.panY
    };
    ui.designCanvas.classList.add("is-dragging");
  });
  ui.designCanvas.addEventListener("pointermove", (event) => {
    if (!design3d.dragging || !design3d.pointer) return;
    const dx = event.clientX - design3d.pointer.x;
    const dy = event.clientY - design3d.pointer.y;
    if (design3d.panning) {
      design3d.panX = design3d.pointer.panX - dx * 0.006;
      design3d.panY = design3d.pointer.panY + dy * 0.006;
    } else {
      design3d.rotationY = design3d.pointer.rotationY + dx * 0.008;
      design3d.rotationX = clamp(design3d.pointer.rotationX + dy * 0.006, -0.9, 0.8);
    }
    designFallback.key = "";
    state.designNeedsRender = true;
  });
  const endDesignDrag = (event) => {
    if (ui.designCanvas.hasPointerCapture(event.pointerId)) ui.designCanvas.releasePointerCapture(event.pointerId);
    design3d.dragging = false;
    design3d.pointer = null;
    ui.designCanvas.classList.remove("is-dragging");
  };
  ui.designCanvas.addEventListener("pointerup", endDesignDrag);
  ui.designCanvas.addEventListener("pointercancel", endDesignDrag);
  ui.designCanvas.addEventListener("lostpointercapture", () => {
    design3d.dragging = false;
    design3d.pointer = null;
    ui.designCanvas.classList.remove("is-dragging");
  });
  ui.designCanvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    design3d.distance = clamp(design3d.distance + event.deltaY * 0.006, 3.4, 10.5);
    state.designScale = clamp(state.designScale - event.deltaY * 0.0012, 0.7, 2.2);
    if (ui.designZoom) ui.designZoom.value = state.designScale.toFixed(2);
    state.designNeedsRender = true;
    designFallback.key = "";
  }, { passive: false });
}

async function openProductDesign(source = currentSample() || state.effectSource || samples[0], options = {}) {
  const sourceEntry = selectedDesignSource(source);
  stopToeProgram();
  stopInactiveTdStreams();
  state.designReturnView = options.returnView || state.activeView || "discover";
  state.designReturnFrame = options.frame || null;
  state.activeView = "product-design";
  ui.detailView.classList.remove("is-open");
  ui.experienceView.classList.remove("is-open", "is-design");
  ui.designView.classList.add("is-open");
  ui.designStage.classList.remove("is-3d-ready");
  setActiveNav("design");
  state.designProduct = ui.designProduct.value || "seat";
  state.designScale = Number(ui.designZoom.value || 1);
  state.designPatternScale = Number(ui.designPatternScale.value || 2.2);
  state.designPatternRotation = Number(ui.designRotation.value || 0.5);
  state.designTiling = ui.designTiling.value || "grid";
  resetDesignView();
  bindDesignCanvasEvents();
  applyDesignSource(sourceEntry);
  updateStaticDesignModel();
  renderTranslationPathCard();
  renderFallbackDesign();
  renderDesign();
  if (!design3d.ready) setDesignStatus("模型正在载入，可先调整纹样预览");
  await ensureDesign3d();
  await buildProductModel(state.designProduct);
}

function closeProductDesign() {
  ui.designView.classList.remove("is-open");
  if (state.designReturnView === "experience") openExperience();
  else if (state.designReturnView === "frame" && state.designReturnFrame) openFrameFavorite(state.designReturnFrame);
  else openDiscover();
}

function shaderPalette(t) {
  const d = [0.263, 0.416, 0.557];
  return [
    0.5 + 0.5 * Math.cos(Math.PI * 2 * (t + d[0])),
    0.5 + 0.5 * Math.cos(Math.PI * 2 * (t + d[1])),
    0.5 + 0.5 * Math.cos(Math.PI * 2 * (t + d[2]))
  ];
}

function fract(value) {
  return value - Math.floor(value);
}

function artFrameKey(sample, img, renderW, renderH, fillMode) {
  const sourceKey = img.currentSrc || img.src || `${mediaWidth(img)}x${mediaHeight(img)}`;
  return `${sample.id}:${sourceKey}:${renderW}x${renderH}:${fillMode}`;
}

function artRenderSize(img, compact, patternMode) {
  const source = drawableSize(img);
  const ratio = source.width / Math.max(1, source.height);
  if (patternMode) {
    const edge = compact ? 220 : 520;
    return ratio >= 1
      ? { width: edge, height: Math.max(1, Math.round(edge / ratio)) }
      : { width: Math.max(1, Math.round(edge * ratio)), height: edge };
  }
  const renderH = compact ? 300 : 420;
  return {
    width: Math.max(1, Math.round(renderH * ratio)),
    height: renderH
  };
}

function resetArtProcessor(sample, img, renderW, renderH, fillMode) {
  artProcessor.key = artFrameKey(sample, img, renderW, renderH, fillMode);
  artProcessor.width = renderW;
  artProcessor.height = renderH;
  artProcessor.sourceCanvas.width = renderW;
  artProcessor.sourceCanvas.height = renderH;
  artProcessor.sourceCtx.clearRect(0, 0, renderW, renderH);
  artProcessor.sourceCtx.fillStyle = "#050505";
  artProcessor.sourceCtx.fillRect(0, 0, renderW, renderH);
  if (fillMode === "cover-crop") drawImageCoverTrimmed(artProcessor.sourceCtx, img, renderW, renderH);
  else if (fillMode === "cover") drawImageCover(artProcessor.sourceCtx, img, renderW, renderH);
  else drawImageContain(artProcessor.sourceCtx, img, renderW, renderH);
  try {
    artProcessor.sourceData = artProcessor.sourceCtx.getImageData(0, 0, renderW, renderH).data;
    artProcessor.hasSourcePixels = true;
  } catch {
    artProcessor.sourceData = null;
    artProcessor.hasSourcePixels = false;
  }
  artProcessor.currentCanvas = null;
  artProcessor.nextCanvas = null;
  artProcessor.currentT = 0;
  artProcessor.nextT = 0;
  artProcessor.transitionStart = 0;
  artProcessor.inTransition = false;
  startComputingArtFrame(0);
}

function startComputingArtFrame(nextT) {
  artProcessor.nextCanvas = document.createElement("canvas");
  artProcessor.nextCanvas.width = artProcessor.width;
  artProcessor.nextCanvas.height = artProcessor.height;
  artProcessor.nextCtx = artProcessor.nextCanvas.getContext("2d");
  artProcessor.nextImageData = artProcessor.nextCtx.createImageData(artProcessor.width, artProcessor.height);
  artProcessor.nextT = nextT;
  artProcessor.computeY = 0;
  artProcessor.computing = true;
}

function computeArtRows() {
  if (!artProcessor.computing || state.effectPaused) return;
  const started = performance.now();
  const maxComputeTime = 8;
  while (artProcessor.computeY < artProcessor.height && performance.now() - started < maxComputeTime) {
    computeArtRow(artProcessor.computeY, artProcessor.nextT);
    artProcessor.computeY += 1;
  }
  if (artProcessor.computeY >= artProcessor.height) {
    artProcessor.nextCtx.putImageData(artProcessor.nextImageData, 0, 0);
    artProcessor.computing = false;
    if (!artProcessor.currentCanvas) {
      artProcessor.currentCanvas = artProcessor.nextCanvas;
      artProcessor.currentT = artProcessor.nextT;
      startComputingArtFrame(artProcessor.currentT + artProcessor.timeStep);
    } else {
      artProcessor.transitionStart = performance.now();
      artProcessor.inTransition = true;
    }
  }
}

function sourceChannel(src, width, height, x, y, channel, fallback = 0) {
  if (!src) return fallback;
  const sx = clamp(Math.round(x), 0, width - 1);
  const sy = clamp(Math.round(y), 0, height - 1);
  return src[(sx + sy * width) * 4 + channel] / 255;
}

function sourceBrightness(src, width, height, x, y, fallback = 0.5) {
  if (!src) return fallback;
  const sx = clamp(Math.round(x), 0, width - 1);
  const sy = clamp(Math.round(y), 0, height - 1);
  const index = (sx + sy * width) * 4;
  return (src[index] + src[index + 1] + src[index + 2]) / 765;
}

function computeArtRow(y, t) {
  const width = artProcessor.width;
  const height = artProcessor.height;
  const src = artProcessor.sourceData;
  const out = artProcessor.nextImageData.data;
  for (let x = 0; x < width; x += 1) {
    const u = x / Math.max(1, width - 1);
    const v = y / Math.max(1, height - 1);
    const cx = u - 0.5;
    const cy = v - 0.5;
    const len = Math.sqrt(cx * cx + cy * cy);
    const base = sourceBrightness(src, width, height, x, y, 0.52 + Math.sin(len * 9 + t) * 0.16);
    const fiber = Math.sin(v * 54 + t * 1.2) * 0.5 + Math.sin((u + v) * 38 - t * 0.72) * 0.5;
    const wave = Math.sin(v * 18 + t * 1.55 + base * 2.4) + Math.cos(u * 14 - t * 1.1);
    const twist = Math.sin((cx * cx - cy * cy) * 18 + t * 0.8);
    const amp = (2.5 + base * 8.5) * (0.65 + Math.sin(t * 0.37 + len * 8) * 0.18);
    const sx = x + wave * amp + Math.sin(cy * 20 + t) * amp * 0.35;
    const sy = y + fiber * amp * 0.72 + twist * amp * 0.42;
    const chroma = 1.8 + Math.sin(t + len * 10) * 1.4;
    const fallback = shaderPalette(len + t * 0.18 + base * 0.4);
    const sr = sourceChannel(src, width, height, sx + chroma, sy - chroma * 0.35, 0, fallback[0]);
    const sg = sourceChannel(src, width, height, sx, sy, 1, fallback[1]);
    const sb = sourceChannel(src, width, height, sx - chroma, sy + chroma * 0.45, 2, fallback[2]);
    const edge = Math.abs(sourceBrightness(src, width, height, sx + 1.5, sy, base) - sourceBrightness(src, width, height, sx - 1.5, sy, base))
      + Math.abs(sourceBrightness(src, width, height, sx, sy + 1.5, base) - sourceBrightness(src, width, height, sx, sy - 1.5, base));
    const palette = shaderPalette(base * 0.58 + len * 0.46 + t * 0.22);
    const ink = Math.pow(clamp(edge * 2.9 + Math.abs(fiber) * 0.18, 0, 1), 0.72);
    const shimmer = 0.82 + Math.sin((u - v) * 32 + t * 1.4) * 0.08 + Math.sin(y * 0.9 + t * 2.4) * 0.04;
    const originalWeight = 0.78;
    const paletteWeight = 0.26 + ink * 0.42;
    const index = (x + y * width) * 4;
    out[index] = clamp((sr * originalWeight + palette[0] * paletteWeight) * shimmer * 255, 0, 255);
    out[index + 1] = clamp((sg * originalWeight + palette[1] * paletteWeight) * shimmer * 255, 0, 255);
    out[index + 2] = clamp((sb * originalWeight + palette[2] * paletteWeight) * shimmer * 255, 0, 255);
    out[index + 3] = 255;
  }
}

function drawPatternStage(targetCtx, targetWidth, targetHeight, currentCanvas, nextCanvas, transition) {
  const time = state.effectTime;
  const hue = Math.sin(time * 0.72) * 22;
  const saturation = 1.08 + Math.sin(time * 0.52) * 0.18;
  const contrast = 1.04 + Math.cos(time * 0.44) * 0.08;
  targetCtx.clearRect(0, 0, targetWidth, targetHeight);
  targetCtx.fillStyle = "#050505";
  targetCtx.fillRect(0, 0, targetWidth, targetHeight);
  targetCtx.save();
  targetCtx.globalAlpha = 0.92;
  targetCtx.filter = `blur(18px) saturate(${1.35 + Math.sin(time * 0.4) * 0.16}) contrast(1.08) hue-rotate(${hue * 0.55}deg)`;
  drawImageCover(targetCtx, currentCanvas, targetWidth, targetHeight);
  targetCtx.restore();
  targetCtx.save();
  targetCtx.globalAlpha = 0.98;
  targetCtx.filter = `saturate(${saturation}) contrast(${contrast}) hue-rotate(${hue}deg)`;
  drawImageCover(targetCtx, currentCanvas, targetWidth, targetHeight);
  targetCtx.restore();
  targetCtx.save();
  targetCtx.globalCompositeOperation = "screen";
  targetCtx.globalAlpha = 0.12 + Math.sin(time * 0.62) * 0.035;
  targetCtx.translate(Math.sin(time * 0.9) * 9, Math.cos(time * 0.76) * 6);
  targetCtx.filter = `blur(8px) saturate(1.4) hue-rotate(${hue + 82}deg)`;
  drawImageCover(targetCtx, currentCanvas, targetWidth, targetHeight);
  targetCtx.restore();
  if (nextCanvas && transition > 0) {
    targetCtx.save();
    targetCtx.globalCompositeOperation = "source-over";
    targetCtx.globalAlpha = transition * 0.54;
    targetCtx.filter = `blur(18px) saturate(1.35) contrast(1.08) hue-rotate(${hue * 0.55}deg)`;
    drawImageCover(targetCtx, nextCanvas, targetWidth, targetHeight);
    targetCtx.restore();
    targetCtx.save();
    targetCtx.globalAlpha = transition;
    targetCtx.filter = `saturate(${saturation}) contrast(${contrast}) hue-rotate(${hue}deg)`;
    drawImageCover(targetCtx, nextCanvas, targetWidth, targetHeight);
    targetCtx.restore();
  }
  targetCtx.save();
  targetCtx.globalCompositeOperation = "soft-light";
  targetCtx.globalAlpha = 0.18;
  targetCtx.fillStyle = "#ffffff";
  for (let y = (time * 14) % 7; y < targetHeight; y += 7) targetCtx.fillRect(0, y, targetWidth, 1);
  targetCtx.restore();
}

function drawContainedStage(targetCtx, targetWidth, targetHeight, currentCanvas, nextCanvas, transition) {
  targetCtx.clearRect(0, 0, targetWidth, targetHeight);
  targetCtx.fillStyle = "#050505";
  targetCtx.fillRect(0, 0, targetWidth, targetHeight);
  targetCtx.save();
  targetCtx.globalAlpha = 0.24;
  targetCtx.filter = "blur(18px)";
  drawImageCover(targetCtx, currentCanvas, targetWidth, targetHeight);
  targetCtx.restore();
  targetCtx.save();
  drawImageContain(targetCtx, currentCanvas, targetWidth, targetHeight);
  if (nextCanvas && transition > 0) {
    targetCtx.globalAlpha = transition;
    drawImageContain(targetCtx, nextCanvas, targetWidth, targetHeight);
  }
  targetCtx.restore();
}

function drawArtFrame(targetCtx, targetWidth, targetHeight, sample, compact = false, designMode = false) {
  const patternMode = !compact;
  const img = sourceImageFor(sample, patternMode);
  targetCtx.clearRect(0, 0, targetWidth, targetHeight);
  targetCtx.fillStyle = "#050505";
  targetCtx.fillRect(0, 0, targetWidth, targetHeight);
  if (!img) return;
  const renderSize = artRenderSize(img, compact, patternMode);
  const fillMode = patternMode ? "cover-crop" : "contain";
  const key = artFrameKey(sample, img, renderSize.width, renderSize.height, fillMode);
  if (artProcessor.key !== key) resetArtProcessor(sample, img, renderSize.width, renderSize.height, fillMode);
  computeArtRows();

  let transition = 0;
  let nextCanvas = null;
  if (artProcessor.inTransition && !state.effectPaused) {
    transition = clamp((performance.now() - artProcessor.transitionStart) / artProcessor.transitionDuration, 0, 1);
    nextCanvas = artProcessor.nextCanvas;
  }

  const currentCanvas = artProcessor.currentCanvas || artProcessor.sourceCanvas;
  if (patternMode) drawPatternStage(targetCtx, targetWidth, targetHeight, currentCanvas, nextCanvas, transition);
  else drawContainedStage(targetCtx, targetWidth, targetHeight, currentCanvas, nextCanvas, transition);

  if (artProcessor.inTransition && transition >= 1 && !state.effectPaused) {
    artProcessor.currentCanvas = artProcessor.nextCanvas;
    artProcessor.currentT = artProcessor.nextT;
    artProcessor.inTransition = false;
    startComputingArtFrame(artProcessor.currentT + artProcessor.timeStep);
  }
}

function drawExperienceBackground() {
  const sample = state.effectSource || currentSample() || samples[0];
  if (state.activeView === "design") {
    drawToeProgramFrameToCanvas();
    return;
  }
  drawArtFrame(experienceCtx, state.width, state.height, sample, false, state.activeView === "design");
}

function drawDetailEffect() {
  drawToeProgramFrameToDetailCanvas();
}

function drawActiveEffect() {
  if (state.activeView === "experience" || state.activeView === "design") drawExperienceBackground();
}

function updateFramePreview(source = activeFrameCanvas()) {
  if (!source?.width) return;
  try {
    state.frameDataUrl = source.toDataURL("image/png");
  } catch {
    const sample = state.effectSource || currentSample();
    state.frameDataUrl = sample?.tile?.src || sample?.image?.src || "";
  }
  syncFrameDragPreview();
}

function syncFrameDragPreview(frame = state.frameDataUrl) {
  if (!frame) return;
  [ui.dragFrame, ui.detailDragFrame].forEach((button) => {
    if (button) button.style.setProperty("--frame-thumb", cssUrl(frame));
  });
}

function lockedFrameDataUrl() {
  if (state.frameDataUrl?.startsWith("data:image/")) return state.frameDataUrl;
  if (state.activeView === "design" && experienceCanvas.classList.contains("has-paused-frame")) {
    updateFramePreview(experienceCanvas);
    if (state.frameDataUrl?.startsWith("data:image/")) return state.frameDataUrl;
  }
  return "";
}

function activeFrameCanvas() {
  return state.activeView === "design" ? experienceCanvas : detailEffectCanvas;
}

function animate() {
  requestAnimationFrame(animate);
  const dx = Math.abs(state.targetX - state.x);
  const dy = Math.abs(state.targetY - state.y);
  const ds = Math.abs(state.targetScale - state.scale);
  if (dx > 0.01 || dy > 0.01 || ds > 0.0005) {
    state.x = lerp(state.x, state.targetX, 0.18);
    state.y = lerp(state.y, state.targetY, 0.18);
    state.scale = lerp(state.scale, state.targetScale, 0.18);
    state.needsRender = true;
  }
  render();
  if (state.activeView === "detail") clearDetailCapturedFrame();
  if (state.activeView === "design") {
    if (!state.effectPaused) state.effectTime += 0.016;
    if (USE_TOUCHDESIGNER_BRIDGE) {
      if (!isDrawableMedia(ui.experienceLiveImage) || mediaWidth(ui.experienceLiveImage) <= 1) drawExperienceLivePlaceholder();
    } else {
      drawToeProgramFrameToCanvas();
    }
  }
  if (state.activeView === "experience") {
    tdPreviewCanvases.forEach((preview) => {
      if (!preview.isConnected) tdPreviewCanvases.delete(preview);
      else if (preview._tdRenderMode === "toe-program") renderToeProgramPreviewCanvas(preview);
      else renderTdMirrorCanvas(preview);
    });
  }
  if (state.activeView === "product-design") renderDesign();
}

function hitTest(screenX, screenY) {
  const point = screenToWorld(screenX, screenY);
  let best = null;
  let bestDist = Infinity;
  filteredSamples().forEach((sample) => {
    const pos = positionFor(sample);
    const size = Math.max(30 / state.scale, sample.size * 3.2);
    const dx = point.x - pos.x;
    const dy = point.y - pos.y;
    if (Math.abs(dx) < size && Math.abs(dy) < size) {
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        best = sample;
        bestDist = dist;
      }
    }
  });
  return best;
}

function setMode(mode) {
  state.mode = mode;
  ui.colorTab.classList.toggle("is-active", mode === "color");
  ui.contentTab.classList.toggle("is-active", mode === "content");
  if (mode === "color") {
    setCopy(ui.introCopy, [
      "从红、金、青、蓝、墨色进入福文化视觉档案。",
      "拖拽与缩放这片色谱，选取可以继续生长的织锦片段。"
    ]);
    ui.mapHint.textContent = "滚轮缩放，点击织纹观览细节";
    state.activeCategory = "";
    document.querySelectorAll(".category").forEach((button) => {
      button.classList.remove("is-active");
    });
  } else {
    setCopy(ui.introCopy, [
      "按照叙事、自然、几何、材质、符号与空间重新组织样本。",
      "先辨认纹脉，再让它进入生成影像与器物表面。"
    ]);
    ui.mapHint.textContent = "切换底部分类，查看不同纹脉";
    state.activeCategory = "";
    document.querySelectorAll(".category").forEach((button) => {
      button.classList.remove("is-active");
    });
  }
  fitView(true);
  state.needsRender = true;
}

function setCategory(id) {
  state.activeCategory = id;
  const category = categories.find((entry) => entry.id === id);
  if (category) {
    if (state.mode !== "content") setMode("content");
    state.activeCategory = id;
    setCopy(ui.introCopy, category.copy);
    document.querySelectorAll(".category").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.category === id);
    });
    const focus = samples.find((sample) => sample.category.id === id);
    if (focus) setView(focus.contentX, focus.contentY, 1.1, true);
  }
  state.needsRender = true;
}

function activateMapCategory(id) {
  const category = categories.find((entry) => entry.id === id);
  if (!category) return;
  if (state.mode !== "content") {
    state.mode = "content";
    ui.colorTab.classList.remove("is-active");
    ui.contentTab.classList.add("is-active");
    ui.mapHint.textContent = "切换底部分类，查看不同纹脉";
  }
  state.activeCategory = id;
  setCopy(ui.introCopy, category.copy);
  document.querySelectorAll(".category").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.category === id);
  });
}

function focusSampleOnMap(sample) {
  if (!sample) return;
  stopToeProgram();
  state.selectedId = sample.id;
  state.effectSource = sample;
  state.effectFrameImage = null;
  state.hoverId = null;
  state.activeView = "discover";
  ui.detailView.classList.remove("is-open");
  ui.experienceView.classList.remove("is-open", "is-design");
  setActiveNav("discover");
  activateMapCategory(sample.category.id);
  const focusScale = Math.max(1.55, Math.min(2.35, state.targetScale < 1.2 ? 1.9 : state.targetScale));
  setView(sample.contentX, sample.contentY, focusScale, true);
  state.needsRender = true;
}

function buildCategories() {
  ui.categoryRow.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = "category";
    button.type = "button";
    button.dataset.category = category.id;
    button.textContent = category.label;
    button.addEventListener("click", () => setCategory(category.id));
    ui.categoryRow.appendChild(button);
  });
  setMode("color");
}

function buildFavorites() {
  [ui.favoriteGrid, ui.detailFavoriteGrid, ui.experienceFavoriteGrid].forEach((grid) => {
    grid.innerHTML = "";
    for (let i = 0; i < 10; i += 1) {
      const slot = document.createElement("button");
      slot.className = "favorite-slot";
      slot.type = "button";
      slot.disabled = true;
      slot.setAttribute("aria-label", "空纹样位");
      slot.dataset.favoriteIndex = String(i);
      grid.appendChild(slot);
    }
  });
}

function syncFavorites() {
  [ui.favoriteGrid, ui.detailFavoriteGrid].forEach((grid) => {
    Array.from(grid.children).forEach((slot, index) => {
      const sample = favorites[index];
      renderOriginalSlot(slot, sample, index, grid === ui.detailFavoriteGrid ? "detail" : "map");
    });
  });
  renderCollectionList();
  syncFrameFavorites();
  syncFavoriteAction();
}

function renderOriginalSlot(slot, sample, index, mode = "map") {
    slot.className = "favorite-slot";
    slot.innerHTML = "";
    slot.onclick = null;
    if (sample) {
      const img = document.createElement("img");
      img.src = sample.tile.src;
      img.alt = sampleDisplayTitle(sample);
      slot.classList.add("has-image");
      slot.disabled = false;
      slot.setAttribute("aria-label", `${mode === "detail" ? "查看" : "定位"}${sampleDisplayTitle(sample)}`);
      slot.onclick = () => (mode === "detail" ? openDetail(sample) : focusSampleOnMap(sample));
      slot.appendChild(img);
    } else {
      slot.disabled = mode !== "detail";
      slot.setAttribute("aria-label", "空纹样位");
      if (mode === "detail") slot.onclick = () => addFavorite(currentSample());
    }
}

function createFrameCollectionCard(frame, index) {
  const sample = sampleForFrame(frame);
  const card = document.createElement("article");
  card.className = "collection-card collection-frame-card";

  const imageButton = document.createElement("button");
  imageButton.className = "collection-image-button";
  imageButton.type = "button";
  imageButton.setAttribute("aria-label", `观览${frameDisplayTitle(frame, sample)}`);
  imageButton.addEventListener("click", () => openFrameFavorite(frame));
  const frameImage = document.createElement("img");
  frameImage.src = frame.frame;
  frameImage.alt = frameDisplayTitle(frame, sample);
  imageButton.appendChild(frameImage);

  const body = document.createElement("div");
  body.className = "collection-card-body";
  const title = document.createElement("h3");
  title.textContent = frameDisplayTitle(frame, sample);
  const meta = document.createElement("div");
  meta.className = "collection-meta";
  meta.textContent = `${sample?.category?.label || "福文化纹样"} / 衍生 ${index + 1}`;
  const note = document.createElement("p");
  note.textContent = frameIntro(frame, sample);

  const actions = document.createElement("div");
  actions.className = "collection-actions";
  const view = document.createElement("button");
  view.className = "is-primary";
  view.type = "button";
  view.textContent = "观览";
  view.addEventListener("click", () => openFrameFavorite(frame));
  const design = document.createElement("button");
  design.type = "button";
  design.textContent = "生成";
  design.addEventListener("click", () => openFrameFavorite(frame));
  const remove = document.createElement("button");
  remove.className = "is-danger";
  remove.type = "button";
  remove.textContent = "移除";
  remove.addEventListener("click", () => removeFrameFavorite(index));
  actions.append(view, design, remove);

  body.append(title, meta, note, actions);
  card.append(imageButton, body);
  return card;
}

function createOriginalCollectionCard(sample) {
  const card = document.createElement("article");
  card.className = "collection-card collection-original-card";

  const imageButton = document.createElement("button");
  imageButton.className = "collection-image-button";
  imageButton.type = "button";
  imageButton.setAttribute("aria-label", `观览${sampleDisplayTitle(sample)}`);
  imageButton.addEventListener("click", () => openDetail(sample));
  const sampleImage = document.createElement("img");
  sampleImage.src = sampleImageUrl(sample);
  sampleImage.alt = sampleDisplayTitle(sample);
  imageButton.appendChild(sampleImage);

  const body = document.createElement("div");
  body.className = "collection-card-body";
  const title = document.createElement("h3");
  title.textContent = sampleDisplayTitle(sample);
  const meta = document.createElement("div");
  meta.className = "collection-meta";
  meta.textContent = sampleMetaLine(sample);
  const note = document.createElement("p");
  note.textContent = sampleIntro(sample);

  const actions = document.createElement("div");
  actions.className = "collection-actions";
  const view = document.createElement("button");
  view.className = "is-primary";
  view.type = "button";
  view.textContent = "观览";
  view.addEventListener("click", () => openDetail(sample));
  const design = document.createElement("button");
  design.type = "button";
  design.textContent = "生成";
  design.addEventListener("click", () => openSampleRemix(sample));
  const remove = document.createElement("button");
  remove.className = "is-danger";
  remove.type = "button";
  remove.textContent = "移除";
  remove.addEventListener("click", () => removeOriginalFavorite(sample.id));
  actions.append(view, design, remove);

  body.append(title, meta, note, actions);
  card.append(imageButton, body);
  return card;
}

function renderCollectionList() {
  const originalGrid = ui.collectionOriginalGrid || ui.collectionGrid;
  const frameGrid = ui.collectionFrameGrid || ui.collectionGrid;
  if (!originalGrid || !frameGrid || !ui.collectionEmpty || !ui.collectionCount) return;
  originalGrid.innerHTML = "";
  frameGrid.innerHTML = "";
  const savedFrames = frameFavorites.map((frame, index) => ({ frame, index })).filter((entry) => entry.frame);
  ui.collectionCount.textContent = `${favorites.length} 枚典藏 / ${savedFrames.length} 枚衍生`;
  if (ui.collectionOriginalCount) ui.collectionOriginalCount.textContent = `${favorites.length} 个`;
  if (ui.collectionFrameCount) ui.collectionFrameCount.textContent = `${savedFrames.length} 个`;
  ui.collectionEmpty.hidden = favorites.length + savedFrames.length > 0;
  if (ui.collectionOriginalEmpty) ui.collectionOriginalEmpty.hidden = favorites.length > 0;
  if (ui.collectionFrameEmpty) ui.collectionFrameEmpty.hidden = savedFrames.length > 0;

  if (state.activeView === "experience" && !ui.experienceView.classList.contains("is-design")) {
    sendTouchDesignerInput(collectionTdSource());
    renderTdCollectionStage();
  } else {
    clearTdCollectionStage();
  }

  savedFrames.forEach(({ frame, index }) => {
    frameGrid.appendChild(createFrameCollectionCard(frame, index));
  });

  favorites.forEach((sample) => {
    originalGrid.appendChild(createOriginalCollectionCard(sample));
  });
  renderDesignSourceList();
}

function syncFrameFavorites() {
  Array.from(ui.experienceFavoriteGrid.children).forEach((slot, index) => {
    renderFrameSlot(slot, frameFavorites[index], index);
  });
}

function renderFrameSlot(slot, frame, index) {
  const dropTarget = slot.classList.contains("is-drop-target");
  slot.className = `favorite-slot${dropTarget ? " is-drop-target" : ""}`;
  slot.innerHTML = "";
  slot.onclick = null;
  slot.disabled = false;
  slot.setAttribute("aria-label", "空衍生织纹位");
  if (frame) {
    const remix = document.createElement("img");
    remix.src = frame.frame;
    remix.alt = frame.label || `衍生织纹 ${index + 1}`;
    slot.classList.add("has-image", "has-frame");
    slot.disabled = false;
    slot.setAttribute("aria-label", `${frame.label}，衍生织纹 ${index + 1}`);
    slot.onclick = () => openFrameFavorite(frame);
    slot.appendChild(remix);
    const remove = document.createElement("button");
    remove.className = "slot-remove";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `移除衍生织纹 ${index + 1}`);
    remove.addEventListener("click", (event) => {
      event.stopPropagation();
      removeFrameFavorite(index);
    });
    slot.appendChild(remove);
  } else {
    slot.onclick = () => saveFrameToSlot(index);
  }
}

function applyFrameFavorite(frame) {
  const sample = sampleForFrame(frame);
  if (sample) state.effectSource = sample;
  sendTouchDesignerInput(tdSourceFromFrame(frame));
  state.effectFrameImage = toeSourceForFrame(frame);
  state.effectTime = frame.time || 0;
  state.effectPaused = false;
  startExperienceLiveStream();
  updateExperienceLabels();
  syncPauseControls();
}

function openSampleRemix(sample = currentSample() || state.effectSource || samples[0]) {
  if (!sample) return;
  state.selectedId = sample.id;
  state.effectSource = sample;
  state.effectFrameImage = null;
  state.effectPaused = false;
  state.activeView = "design";
  stopInactiveTdStreams();
  clearTdCollectionStage();
  ui.detailView.classList.remove("is-open");
  ui.designView.classList.remove("is-open");
  ui.experienceView.classList.add("is-open", "is-design");
  setActiveNav("experience");
  sendTouchDesignerInput(tdSourceFromSample(sample));
  startExperienceLiveStream();
  updateExperienceLabels();
  syncFrameFavorites();
  syncPauseControls();
}

function openFrameFavorite(frame) {
  stopInactiveTdStreams();
  clearTdCollectionStage();
  state.activeView = "design";
  ui.detailView.classList.remove("is-open");
  ui.designView.classList.remove("is-open");
  ui.experienceView.classList.add("is-open", "is-design");
  setActiveNav("experience");
  applyFrameFavorite(frame);
  syncFrameFavorites();
}

function goBackFromExperience() {
  if (ui.experienceView.classList.contains("is-design")) {
    openExperience();
    return;
  }
  openDiscover();
}

function syncPauseControls() {
  [ui.pauseEffect, ui.detailPauseEffect].forEach((button) => {
    if (!button) return;
    button.classList.toggle("is-paused", state.effectPaused);
    button.textContent = state.effectPaused ? "继续" : "定格";
  });
}

function currentSample() {
  return samples.find((sample) => sample.id === state.selectedId) || null;
}

function updateExperienceLabels() {
  const sample = state.effectSource || currentSample() || samples[0];
  if (!sample) return;
  ui.experienceTitle.textContent = state.activeView === "design"
    ? "镜像织境"
    : sample.asset?.title || `第${sample.book}枚织纹`;
  ui.experienceMeta.innerHTML = "";
  const label = document.createElement("strong");
  const generationStatusLabel = USE_TOUCHDESIGNER_BRIDGE
    ? (tdLiveOnline() ? "影像已入场" : (tdLive.bridgeConnected ? "等待织纹" : "通道未启"))
    : (state.effectPaused ? "定格已就绪" : "织境流动中");
  label.textContent = state.activeView === "design" ? generationStatusLabel : sample.category.short;
  ui.experienceMeta.appendChild(label);
  const lines = state.activeView === "design"
    ? [sampleDisplayTitle(sample), "定格后收入藏纹"]
    : [`${sample.year}`, `原始页 ${sample.page}`, sample.asset?.source || sample.file.replace(/\.[^.]+$/, "")];
  lines.forEach((line) => {
    const span = document.createElement("span");
    span.textContent = line;
    ui.experienceMeta.appendChild(span);
    ui.experienceMeta.appendChild(document.createElement("br"));
  });
}

function isFavorite(sample) {
  return !!sample && favorites.some((entry) => entry.id === sample.id);
}

function addFavorite(sample) {
  if (!sample || isFavorite(sample)) return;
  favorites.push(sample);
  syncFavorites();
}

function removeOriginalFavorite(sampleId) {
  const index = favorites.findIndex((entry) => entry.id === sampleId);
  if (index === -1) return;
  favorites.splice(index, 1);
  syncFavorites();
}

function removeFrameFavorite(index) {
  if (index < 0 || index >= frameFavorites.length || !frameFavorites[index]) return;
  frameFavorites[index] = null;
  syncFrameFavorites();
  renderCollectionList();
}

function syncFavoriteAction() {
  ui.favoriteAction.classList.remove("is-added");
  ui.favoriteAction.setAttribute("aria-label", "下载高清 PNG");
}

function safeFileName(text) {
  return (text || "fu-culture-brocade")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "fu-culture-brocade";
}

function imageReady(image) {
  if (!image) return Promise.reject(new Error("missing image"));
  if (isDrawableMedia(image)) return Promise.resolve(image);
  if (image._assetAttempts >= 3) return Promise.reject(new Error("image unavailable"));
  return new Promise((resolve, reject) => {
    image.addEventListener("load", () => resolve(image), { once: true });
    image.addEventListener("error", reject, { once: true });
    ensureAssetImage(image);
  });
}

async function downloadCurrentOriginal() {
  const sample = currentSample();
  if (!sample) return;
  try {
    const image = await imageReady(sample.image);
    const width = Math.max(1, mediaWidth(image));
    const height = Math.max(1, mediaHeight(image));
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = width;
    exportCanvas.height = height;
    const exportCtx = exportCanvas.getContext("2d");
    exportCtx.drawImage(image, 0, 0, width, height);
    const link = document.createElement("a");
    link.href = exportCanvas.toDataURL("image/png");
    link.download = `${safeFileName(sample.asset?.title || sample.file)}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch {
    const link = document.createElement("a");
    link.href = sampleImageUrl(sample);
    link.download = `${safeFileName(sample.asset?.title || sample.file)}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

function visibleArchiveSamples() {
  const visible = filteredSamples();
  return visible.length ? visible : samples;
}

function adjacentSample(step) {
  const archiveSamples = visibleArchiveSamples();
  const active = currentSample() || archiveSamples[0];
  const index = Math.max(0, archiveSamples.findIndex((sample) => sample.id === active.id));
  return archiveSamples[(index + step + archiveSamples.length) % archiveSamples.length];
}

function openDetail(sample) {
  ensureAssetImage(sample.image);
  const switchingSample = state.selectedId !== sample.id;
  state.selectedId = sample.id;
  state.effectSource = sample;
  state.effectFrameImage = null;
  if (switchingSample) state.effectPaused = false;
  state.activeView = "detail";
  stopInactiveTdStreams();
  ui.detailView.classList.add("is-open");
  ui.experienceView.classList.remove("is-open");
  ui.experienceView.classList.remove("is-design");
  ui.designView.classList.remove("is-open");
  setActiveNav("discover");
  ui.detailHeading.textContent = sample.asset?.title || `第${sample.book}枚织纹`;
  ui.detailYear.textContent = `编号 ${String(sample.book).padStart(3, "0")}`;
  ui.detailPage.textContent = String(sample.page);
  ui.detailCategory.textContent = sample.category.label;
  ui.detailImage.src = sampleImageUrl(sample);
  ui.detailImage.alt = sample.asset?.title || sample.category.label;
  clearDetailCapturedFrame();
  stopTdStreamImage(ui.detailLiveImage);
  setCopy(ui.detailCopy, detailCopyLines(sample));
  renderDetailContextCard(sample);
  buildArchive(sample);
  syncFavoriteAction();
  syncFavorites();
  syncPauseControls();
  state.needsRender = true;
}

function detailCopyLines(sample) {
  const categoryLines = sample.category.copy;
  const asset = sample.asset || {};
  return [
    `纹脉：${categoryLines.join("；")}`,
    `释义：${asset.note || "以织锦图像作为福文化纹样样本，观察其图案、色彩和构成关系。"}`,
    `可取：${(asset.words || sample.category.words).join(" / ")}`,
    `图像：已保留织纹主体，文字信息移入旁侧说明。`
  ];
}

function closeDetail() {
  stopInactiveTdStreams();
  ui.detailView.classList.remove("is-open");
  state.selectedId = null;
  state.activeView = "discover";
  state.needsRender = true;
}

function setActiveNav(target) {
  document.querySelectorAll("[data-nav-target]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.navTarget === target);
  });
}

function openDiscover() {
  stopToeProgram();
  stopInactiveTdStreams();
  state.activeView = "discover";
  state.effectFrameImage = null;
  ui.experienceView.classList.remove("is-open");
  ui.experienceView.classList.remove("is-design");
  ui.detailView.classList.remove("is-open");
  ui.designView.classList.remove("is-open");
  setActiveNav("discover");
}

function openExperience(sample = currentSample() || state.effectSource || samples[0]) {
  stopToeProgram();
  stopInactiveTdStreams("experience");
  if (sample) state.effectSource = sample;
  if (sample) sendTouchDesignerInput(tdSourceFromSample(sample));
  state.effectFrameImage = null;
  state.activeView = "experience";
  ui.experienceView.classList.remove("is-design");
  ui.detailView.classList.remove("is-open");
  ui.designView.classList.remove("is-open");
  ui.experienceView.classList.add("is-open");
  setActiveNav("experience");
  renderCollectionList();
}

function openDesign(sample = currentSample() || state.effectSource || samples[0]) {
  if (sample) state.effectSource = sample;
  if (sample) sendTouchDesignerInput(tdSourceFromSample(sample));
  const returnView = state.activeView === "experience" ? "experience" : "discover";
  openProductDesign(sample, { returnView });
}

function captureCurrentFrame() {
  if (state.activeView === "design") {
    const locked = lockedFrameDataUrl();
    if (state.effectPaused && locked) {
      return locked;
    }
    if (!captureExperienceLiveFrame(true) && !state.frameDataUrl) return "";
  } else {
    drawActiveEffect();
    updateFramePreview(activeFrameCanvas());
  }
  return state.frameDataUrl;
}

function ensureDragFrame() {
  let frame = lockedFrameDataUrl();
  if (!frame && state.activeView === "design") {
    if (!state.effectPaused) toggleEffectPause();
    frame = lockedFrameDataUrl() || captureCurrentFrame();
  }
  if (!frame?.startsWith("data:image/")) return "";
  syncFrameDragPreview(frame);
  return frame;
}

function saveFrameToSlot(index) {
  const sample = state.effectSource || samples[0];
  if (state.activeView !== "design") return;
  if (!state.effectPaused) {
    if (!captureExperienceLiveFrame(true)) return;
    state.effectPaused = true;
    syncPauseControls();
    stopExperienceLiveStream();
  }
  const frame = ensureDragFrame();
  if (!frame) return;
  frameFavorites[index] = {
    frame,
    sampleId: sample?.id,
    sourceTitle: sampleDisplayTitle(sample),
    label: `${sampleDisplayTitle(sample)} 衍生织纹`,
    time: state.effectTime,
    treatment: "web-toe-source",
    remix: "web-generated-frame"
  };
  syncFrameFavorites();
  renderCollectionList();
}

function saveFrameToFirstOpenSlot() {
  const index = frameFavorites.findIndex((frame) => !frame);
  saveFrameToSlot(index === -1 ? 0 : index);
}

function toggleEffectPause() {
  state.effectPaused = !state.effectPaused;
  syncPauseControls();
  if (state.activeView === "design") {
    if (state.effectPaused) {
      captureExperienceLiveFrame(true);
      syncFrameDragPreview(lockedFrameDataUrl());
      stopExperienceLiveStream();
    } else {
      startExperienceLiveStream();
    }
    return;
  }
  if (state.effectPaused) updateFramePreview(activeFrameCanvas());
}

function buildArchive(activeSample) {
  ui.archiveStrip.innerHTML = "";
  const archiveSamples = visibleArchiveSamples();
  const activeIndex = Math.max(0, archiveSamples.findIndex((sample) => sample.id === activeSample.id));
  const stripSamples = [];
  for (let offset = -7; offset <= 10; offset += 1) {
    stripSamples.push(archiveSamples[(activeIndex + offset + archiveSamples.length) % archiveSamples.length]);
  }
  stripSamples.forEach((sample) => {
    const button = document.createElement("button");
    button.className = `archive-tile${sample.id === activeSample.id ? " is-active" : ""}`;
    button.type = "button";
    const img = document.createElement("img");
    img.src = sample.tile.src;
    img.alt = sample.category.label;
    button.appendChild(img);
    button.addEventListener("click", () => openDetail(sample));
    ui.archiveStrip.appendChild(button);
  });
  const previous = adjacentSample(-1);
  const next = adjacentSample(1);
  ui.prevSampleLabel.textContent = `${previous.category.short} / 编号${String(previous.book).padStart(3, "0")}`;
  ui.nextSampleLabel.textContent = `${next.category.short} / 编号${String(next.book).padStart(3, "0")}`;
}

function updateTimeline(clientX) {
  const rect = ui.range.getBoundingClientRect();
  const progress = clamp((clientX - rect.left) / rect.width, 0.08, 1);
  state.timelineProgress = progress;
  ui.range.style.setProperty("--end", `${progress * 100}%`);
  state.needsRender = true;
}

function prepareFrameDrag(event) {
  if (state.activeView !== "design") return;
  const frame = ensureDragFrame();
  if (!frame) {
    event.preventDefault();
    return;
  }
  event.dataTransfer.setData("application/x-fu-pattern-kind", "frame");
  event.dataTransfer.setData("text/plain", frame);
  event.dataTransfer.effectAllowed = "copy";
}

function prepareOriginalDrag(event) {
  const sample = currentSample();
  if (!sample) return;
  event.dataTransfer.setData("application/x-fu-pattern-kind", "original");
  event.dataTransfer.setData("application/x-fu-sample-id", String(sample.id));
  event.dataTransfer.setData("text/plain", sampleImageUrl(sample));
  event.dataTransfer.effectAllowed = "copy";
}

function saveCurrentOriginalFromButton(event) {
  event.preventDefault();
  event.stopPropagation();
  addFavorite(currentSample());
  ui.detailFrameSource.classList.add("is-favorite-added");
  window.setTimeout(() => {
    ui.detailFrameSource.classList.remove("is-favorite-added");
  }, 700);
}

function quickSaveFrame() {
  if (!state.effectPaused) toggleEffectPause();
  saveFrameToFirstOpenSlot();
}

function frameDropSlots() {
  return state.activeView === "detail"
    ? [...ui.detailFavoriteGrid.children]
    : [...ui.experienceFavoriteGrid.children];
}

function slotAtPoint(clientX, clientY) {
  return frameDropSlots().find((slot) => {
    const rect = slot.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  }) || null;
}

function clearFrameDropHighlights() {
  frameDropSlots().forEach((slot) => slot.classList.remove("is-drop-target"));
}

function beginPointerFrameDrag(event) {
  if (event.button !== 0) return;
  if (state.activeView !== "design") return;
  event.preventDefault();
  event.currentTarget.setPointerCapture?.(event.pointerId);
  const frame = ensureDragFrame();
  if (!frame) return;
  const ghost = document.createElement("span");
  ghost.className = "frame-drag-ghost";
  ghost.style.setProperty("--frame-thumb", `url(${frame})`);
  document.body.appendChild(ghost);
  state.frameDragging = true;
  state.frameDragGhost = ghost;
  state.frameDragSource = event.currentTarget;
  state.frameDragPointerId = event.pointerId;
  event.currentTarget.classList.add("is-dragging");
  movePointerFrameDrag(event);
}

function movePointerFrameDrag(event) {
  if (!state.frameDragging || !state.frameDragGhost) return;
  state.frameDragGhost.style.left = `${event.clientX}px`;
  state.frameDragGhost.style.top = `${event.clientY}px`;
  clearFrameDropHighlights();
  const slot = slotAtPoint(event.clientX, event.clientY);
  if (slot) slot.classList.add("is-drop-target");
}

function endPointerFrameDrag(event) {
  if (!state.frameDragging) return;
  const slot = slotAtPoint(event.clientX, event.clientY);
  if (slot) saveFrameToSlot(Number(slot.dataset.favoriteIndex));
  clearFrameDropHighlights();
  if (state.frameDragGhost) state.frameDragGhost.remove();
  if (state.frameDragSource) state.frameDragSource.classList.remove("is-dragging");
  if (state.frameDragSource?.hasPointerCapture?.(state.frameDragPointerId)) {
    state.frameDragSource.releasePointerCapture(state.frameDragPointerId);
  }
  state.frameDragging = false;
  state.frameDragGhost = null;
  state.frameDragSource = null;
  state.frameDragPointerId = null;
}

function beginOriginalFavoriteDrag(event) {
  if (event.button !== 0 || event.target.closest("button")) return;
  const sample = currentSample();
  if (!sample) return;
  event.preventDefault();
  ui.detailFrameSource.setPointerCapture(event.pointerId);
  const ghost = document.createElement("span");
  ghost.className = "original-drag-ghost";
  ghost.style.setProperty("--source-thumb", `url(${sample.tile.src || sample.image.src})`);
  document.body.appendChild(ghost);
  state.originalDragging = true;
  state.originalDragGhost = ghost;
  state.originalDragStart = {
    x: event.clientX,
    y: event.clientY,
    pointerId: event.pointerId,
    sampleId: sample.id
  };
  ui.detailFrameSource.classList.add("is-dragging-original");
  moveOriginalFavoriteDrag(event);
}

function moveOriginalFavoriteDrag(event) {
  if (!state.originalDragging || !state.originalDragGhost) return;
  state.originalDragGhost.style.left = `${event.clientX}px`;
  state.originalDragGhost.style.top = `${event.clientY}px`;
  clearFrameDropHighlights();
  const slot = slotAtPoint(event.clientX, event.clientY);
  if (slot) slot.classList.add("is-drop-target");
}

function endOriginalFavoriteDrag(event) {
  if (!state.originalDragging) return;
  const start = state.originalDragStart;
  const slot = slotAtPoint(event.clientX, event.clientY);
  if (slot && start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 18) {
    const sample = samples.find((entry) => entry.id === start.sampleId) || currentSample();
    addFavorite(sample);
    ui.detailFrameSource.classList.add("is-favorite-added");
    window.setTimeout(() => {
      ui.detailFrameSource.classList.remove("is-favorite-added");
    }, 700);
  }
  clearFrameDropHighlights();
  if (start && ui.detailFrameSource.hasPointerCapture(start.pointerId)) {
    ui.detailFrameSource.releasePointerCapture(start.pointerId);
  }
  if (state.originalDragGhost) state.originalDragGhost.remove();
  ui.detailFrameSource.classList.remove("is-dragging-original");
  state.originalDragging = false;
  state.originalDragGhost = null;
  state.originalDragStart = null;
}

function bindFrameDropTargets(grid) {
  Array.from(grid.children).forEach((slot) => {
    slot.addEventListener("dragover", (event) => {
      event.preventDefault();
      slot.classList.add("is-drop-target");
    });
    slot.addEventListener("dragleave", () => {
      slot.classList.remove("is-drop-target");
    });
    slot.addEventListener("drop", (event) => {
      event.preventDefault();
      slot.classList.remove("is-drop-target");
      const kind = event.dataTransfer?.getData("application/x-fu-pattern-kind");
      if (grid === ui.experienceFavoriteGrid && kind !== "original") saveFrameToSlot(Number(slot.dataset.favoriteIndex));
      if (grid === ui.detailFavoriteGrid) {
        const sampleId = Number(event.dataTransfer?.getData("application/x-fu-sample-id"));
        addFavorite(samples.find((sample) => sample.id === sampleId) || currentSample());
      }
    });
  });
}

function bindEvents() {
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", handlePageVisibilityChange);
  document.querySelectorAll('[data-nav-target="discover"]').forEach((button) => {
    button.addEventListener("click", openDiscover);
  });
  document.querySelectorAll('[data-nav-target="experience"]').forEach((button) => {
    button.addEventListener("click", () => openExperience());
  });
  document.querySelectorAll('[data-nav-target="design"]').forEach((button) => {
    button.addEventListener("click", () => openDesign());
  });
  ui.colorTab.addEventListener("click", () => setMode("color"));
  ui.contentTab.addEventListener("click", () => setMode("content"));
  ui.closeDetail.addEventListener("click", closeDetail);
  ui.detailBack.addEventListener("click", closeDetail);
  ui.experienceBack.addEventListener("click", goBackFromExperience);
  ui.favoriteAction.addEventListener("click", downloadCurrentOriginal);
  ui.remixEntry.addEventListener("click", () => openDesign(currentSample()));
  ui.designBack.addEventListener("click", closeProductDesign);
  ui.designReset.addEventListener("click", () => {
    resetDesignView();
    renderDesign();
  });
  ui.designUndo.addEventListener("click", () => {
    resetDesignView();
    renderDesign();
  });
  ui.designProduct.addEventListener("change", async () => {
    state.designProduct = ui.designProduct.value;
    ui.designStage.classList.remove("is-3d-ready");
    updateDesignTexture();
    updateStaticDesignModel();
    renderTranslationPathCard();
    renderFallbackDesign();
    state.designNeedsRender = true;
    if (design3d.ready) await buildProductModel(state.designProduct);
  });
  ui.designBackground.addEventListener("change", () => {
    ui.designStage.className = `design-stage bg-${ui.designBackground.value}${ui.designStage.classList.contains("is-3d-ready") ? " is-3d-ready" : ""}`;
    state.designNeedsRender = true;
    renderTranslationPathCard();
    renderFallbackDesign();
  });
  ui.designPatternScale.addEventListener("input", () => {
    state.designPatternScale = Number(ui.designPatternScale.value);
    updateStaticDesignModel();
    renderTranslationPathCard();
    updateDesignTexture();
  });
  ui.designRotation.addEventListener("input", () => {
    state.designPatternRotation = Number(ui.designRotation.value);
    renderTranslationPathCard();
    updateDesignTexture();
  });
  ui.designZoom.addEventListener("input", () => {
    state.designScale = Number(ui.designZoom.value);
    state.designNeedsRender = true;
    renderTranslationPathCard();
    renderFallbackDesign();
  });
  ui.designTiling.addEventListener("change", () => {
    state.designTiling = ui.designTiling.value;
    updateStaticDesignModel();
    renderTranslationPathCard();
    updateDesignTexture();
  });
  ui.designTileToggle.addEventListener("click", () => {
    ui.designTileToggle.classList.toggle("is-active");
    state.designTiling = ui.designTileToggle.classList.contains("is-active") ? "grid" : ui.designTiling.value;
    updateStaticDesignModel();
    renderTranslationPathCard();
    updateDesignTexture();
  });
  ui.designSurfaceToggle.addEventListener("click", () => {
    ui.designSurfaceToggle.classList.toggle("is-active");
    state.designPatternScale = ui.designSurfaceToggle.classList.contains("is-active") ? 2.1 : Number(ui.designPatternScale.value);
    updateStaticDesignModel();
    renderTranslationPathCard();
    updateDesignTexture();
  });
  ui.researchEvaluateOpen?.addEventListener("click", openResearchDialog);
  ui.researchStudyClose?.addEventListener("click", closeResearchDialog);
  ui.researchStudyCancel?.addEventListener("click", closeResearchDialog);
  ui.researchExportJson?.addEventListener("click", exportResearchJson);
  ui.researchExportCsv?.addEventListener("click", exportResearchCsv);
  ui.researchStudyForm?.addEventListener("submit", submitResearchRecord);
  ui.researchStudyForm?.querySelectorAll('.research-score-grid input[type="range"]').forEach((input) => {
    input.addEventListener("input", () => {
      const value = input.parentElement?.querySelector("strong");
      if (value) value.textContent = input.value;
    });
  });
  ui.pauseEffect.addEventListener("click", toggleEffectPause);
  ui.dragFrame.addEventListener("dragstart", prepareFrameDrag);
  ui.detailFrameSource.addEventListener("dragstart", prepareOriginalDrag);
  ui.detailImage.addEventListener("dragstart", prepareOriginalDrag);
  window.addEventListener("pointermove", movePointerFrameDrag);
  window.addEventListener("pointerup", endPointerFrameDrag);
  ui.dragFrame.addEventListener("pointerdown", beginPointerFrameDrag);
  ui.detailFrameSource.addEventListener("pointerdown", beginOriginalFavoriteDrag);
  window.addEventListener("pointermove", moveOriginalFavoriteDrag);
  window.addEventListener("pointerup", endOriginalFavoriteDrag);
  ui.dragFrame.addEventListener("click", quickSaveFrame);
  ui.detailDragFrame.addEventListener("pointerdown", saveCurrentOriginalFromButton, true);
  ui.detailDragFrame.addEventListener("click", saveCurrentOriginalFromButton, true);
  bindFrameDropTargets(ui.detailFavoriteGrid);
  bindFrameDropTargets(ui.experienceFavoriteGrid);
  ui.archivePrev.addEventListener("click", () => openDetail(adjacentSample(-1)));
  ui.archiveNext.addEventListener("click", () => openDetail(adjacentSample(1)));

  ui.range.addEventListener("pointerdown", (event) => {
    state.timelineDragging = true;
    ui.range.classList.add("is-dragging");
    ui.range.setPointerCapture(event.pointerId);
    updateTimeline(event.clientX);
  });

  ui.range.addEventListener("pointermove", (event) => {
    if (state.timelineDragging) updateTimeline(event.clientX);
  });

  ui.range.addEventListener("pointerup", (event) => {
    if (ui.range.hasPointerCapture(event.pointerId)) ui.range.releasePointerCapture(event.pointerId);
    state.timelineDragging = false;
    ui.range.classList.remove("is-dragging");
  });

  canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture(event.pointerId);
    state.dragging = true;
    canvas.classList.add("is-dragging");
    state.dragStart = {
      x: event.clientX,
      y: event.clientY,
      viewX: state.targetX,
      viewY: state.targetY
    };
  });

  canvas.addEventListener("pointermove", (event) => {
    if (state.dragging && state.dragStart) {
      state.targetX = state.dragStart.viewX - (event.clientX - state.dragStart.x) / state.targetScale;
      state.targetY = state.dragStart.viewY - (event.clientY - state.dragStart.y) / state.targetScale;
      state.needsRender = true;
      return;
    }
    const hit = hitTest(event.clientX, event.clientY);
    const id = hit?.id || null;
    if (id !== state.hoverId) {
      state.hoverId = id;
      canvas.style.cursor = id ? "pointer" : "grab";
      state.needsRender = true;
    }
  });

  canvas.addEventListener("pointerup", (event) => {
    canvas.releasePointerCapture(event.pointerId);
    canvas.classList.remove("is-dragging");
    const start = state.dragStart;
    state.dragging = false;
    state.dragStart = null;
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 8) {
      const hit = hitTest(event.clientX, event.clientY);
      if (hit) openDetail(hit);
    }
  });

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoomAt(event.clientX, event.clientY, Math.exp(-event.deltaY * 0.0012));
  }, { passive: false });
}

function boot() {
  buildSamples();
  buildFavorites();
  buildCategories();
  resize();
  bindEvents();
  loadResearchRecords();
  renderTranslationPathCard();
  connectTouchDesignerBridgeOnce();
  animate();
}

boot();
