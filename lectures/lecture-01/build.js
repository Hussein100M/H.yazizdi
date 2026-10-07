// Lecture 01 — Introduction to Interior Design (Arabic / RTL academic deck)
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa6");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");

const OUT = process.argv[2] || "Lecture01_Introduction_to_Interior_Design.pptx";

const THEME = {
  name: "Interior Studio",
  headFontFace: "Times New Roman",
  bodyFontFace: "Times New Roman",
  colors: {
    dk1: "1F2224", lt1: "FFFFFF", dk2: "3A4146", lt2: "EEF0F0",
    accent1: "C2593A", accent2: "2F6B6A", accent3: "8A9A9B",
    accent4: "D9A441", accent5: "5B6770", accent6: "B9C4C4",
    hlink: "2F6B6A", folHlink: "5B6770",
  },
};
const HEX = {
  ink: "1F2224", slate: "3A4146", stone: "EEF0F0", terra: "C2593A",
  teal: "2F6B6A", gray: "8A9A9B", ochre: "D9A441", mid: "5B6770", pale: "B9C4C4", white: "FFFFFF",
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Lecture 01 — Introduction to Interior Design";
pres.subject = "Introduction to Interior Design & Fundamentals — Studio 3";
pres.author = "Studio 3";
pres.rtlMode = true;
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const S = pres.shapes;
const W = 13.333, M = 0.6, CW = W - 2 * M;

// ---------- layouts ----------
pres.defineSlideMaster({
  title: "Title Dark",
  background: { color: C.text1 },
  objects: [],
});
pres.defineSlideMaster({
  title: "Section Dark",
  background: { color: C.text1 },
  objects: [
    { text: { text: "Introduction to Interior Design  ·  Lecture 01", options: { x: M, y: 6.95, w: 6, h: 0.3, fontSize: 10, color: C.accent3, margin: 0, align: "left", fontFace: "Times New Roman" } } },
  ],
  slideNumber: { x: W - M - 0.6, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: C.accent3, align: "right" },
});
pres.defineSlideMaster({
  title: "Content",
  background: { color: C.background1 },
  objects: [
    { placeholder: { options: { name: "kicker", type: "body", x: M, y: 0.38, w: CW, h: 0.35, fontSize: 13, bold: true, color: C.accent1, align: "right", margin: 0, charSpacing: 1 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.72, w: CW, h: 0.75, fontSize: 32, bold: true, color: C.text1, align: "right", valign: "middle", margin: 0 }, text: "" } },
    { text: { text: "Introduction to Interior Design  ·  Lecture 01", options: { x: M, y: 6.95, w: 6, h: 0.3, fontSize: 10, color: C.accent3, margin: 0, align: "left", fontFace: "Times New Roman" } } },
  ],
  slideNumber: { x: W - M - 0.6, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: C.accent3, align: "right" },
});

// ---------- helpers ----------
const iconCache = {};
async function icon(name, color, size = 256) {
  const key = name + color;
  if (iconCache[key]) return iconCache[key];
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(fa[name], { color: "#" + color, size }));
  const buf = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  return (iconCache[key] = "image/png;base64," + buf.toString("base64"));
}
const FONT = "Times New Roman";
const AR = { rtlMode: true, lang: "ar-SA", align: "right", isTextBox: true, fontFace: FONT };
function ar(slide, text, o) { slide.addText(text, Object.assign({}, AR, { margin: 0, valign: "top" }, o)); }
function en(slide, text, o) { slide.addText(text, Object.assign({ isTextBox: true, margin: 0, valign: "top", align: "left", fontFace: FONT }, o)); }
const shadow = () => ({ type: "outer", color: "000000", opacity: 0.12, blur: 8, offset: 2, angle: 90 });
function card(slide, x, y, w, h, fill, name, withShadow = true) {
  slide.addShape(S.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill || C.background2 }, line: { type: "none" }, shadow: withShadow ? shadow() : undefined, objectName: name });
}
async function iconCircle(slide, x, y, d, iconName, bg, fg, name) {
  slide.addShape(S.OVAL, { x, y, w: d, h: d, fill: { color: bg }, line: { type: "none" }, objectName: name + " circle" });
  const p = d * 0.25;
  slide.addImage({ data: await icon(iconName, fg), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, altText: name, objectName: name + " icon" });
}
function content(section, kicker, title) {
  const s = pres.addSlide({ masterName: "Content", sectionTitle: section });
  s.addText(kicker, { placeholder: "kicker", align: "right", fontFace: FONT });
  s.addText(title, { placeholder: "title", rtlMode: true, lang: "ar-SA", fontFace: FONT });
  return s;
}
// polygon via custom geometry, points in absolute inches
function poly(slide, pts, o) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys);
  const w = Math.max(Math.max(...xs) - x, 0.01), h = Math.max(Math.max(...ys) - y, 0.01);
  const points = pts.map(p => ({ x: p[0] - x, y: p[1] - y }));
  points.push({ close: true });
  slide.addShape(S.CUSTOM_GEOMETRY, Object.assign({ x, y, w, h, points }, o));
}
// isometric projection
function isoP(ox, oy, s) {
  const c = Math.cos(Math.PI / 6), sn = Math.sin(Math.PI / 6);
  return (X, Y, Z) => [ox + (X - Y) * c * s, oy + (X + Y) * sn * s - Z * s];
}
function box(slide, P, x0, y0, z0, dx, dy, dz, fills, line, name) {
  // top, left(front-left: y = y0+dy), right(front-right: x = x0+dx)
  const top = [P(x0, y0, z0 + dz), P(x0 + dx, y0, z0 + dz), P(x0 + dx, y0 + dy, z0 + dz), P(x0, y0 + dy, z0 + dz)];
  const left = [P(x0, y0 + dy, z0), P(x0 + dx, y0 + dy, z0), P(x0 + dx, y0 + dy, z0 + dz), P(x0, y0 + dy, z0 + dz)];
  const right = [P(x0 + dx, y0, z0), P(x0 + dx, y0 + dy, z0), P(x0 + dx, y0 + dy, z0 + dz), P(x0 + dx, y0, z0 + dz)];
  const ln = line || { color: HEX.ink, width: 0.75 };
  if (dz > 0.001) {
    poly(slide, left, { fill: { color: fills[1] }, line: Object.assign({}, ln), objectName: name + " side A" });
    poly(slide, right, { fill: { color: fills[2] }, line: Object.assign({}, ln), objectName: name + " side B" });
  }
  poly(slide, top, { fill: { color: fills[0] }, line: Object.assign({}, ln), objectName: name + " top" });
}
function person(slide, x, yFoot, hIn, color, name) {
  // simple scale figure: head + body, height hIn inches
  const head = hIn * 0.13;
  slide.addShape(S.OVAL, { x: x - head / 2, y: yFoot - hIn, w: head, h: head, fill: { color }, line: { type: "none" }, objectName: name + " head" });
  slide.addShape(S.ROUNDED_RECTANGLE, { x: x - hIn * 0.09, y: yFoot - hIn + head * 1.1, w: hIn * 0.18, h: hIn * 0.42, rectRadius: 0.05, fill: { color }, line: { type: "none" }, objectName: name + " torso" });
  slide.addShape(S.LINE, { x: x - hIn * 0.04, y: yFoot - hIn * 0.42, w: 0, h: hIn * 0.42, line: { color, width: 3 }, objectName: name + " leg L" });
  slide.addShape(S.LINE, { x: x + hIn * 0.04, y: yFoot - hIn * 0.42, w: 0, h: hIn * 0.42, line: { color, width: 3 }, objectName: name + " leg R" });
}
const IMG = __dirname + "/img/";
async function photo(slide, name, x, y, w, h) {
  const file = IMG + name + ".jpg";
  const m = await sharp(file).metadata();
  let cw = m.width, ch = Math.round(cw * h / w);
  if (ch > m.height) { ch = m.height; cw = Math.round(ch * w / h); }
  const buf = await sharp(file).extract({ left: Math.round((m.width - cw) / 2), top: Math.round((m.height - ch) / 2), width: cw, height: ch }).jpeg({ quality: 90 }).toBuffer();
  slide.addImage({ data: "image/jpeg;base64," + buf.toString("base64"), x, y, w, h, altText: name, objectName: "photo " + name });
}
function arrowR(slide, x, y, w, color, name) {
  slide.addShape(S.LINE, { x, y, w, h: 0, line: { color, width: 2, endArrowType: "triangle" }, objectName: name });
}

(async () => {
  // =====================================================================
  // 1. TITLE
  pres.addSection({ title: "Opening" });
  {
    const s = pres.addSlide({ masterName: "Title Dark", sectionTitle: "Opening" });
    // isometric room motif on the left
    const P = isoP(3.4, 2.95, 0.55);
    box(s, P, 0, 0, 0, 5, 5, 0.12, [HEX.terra, "9E4429", "B04F33"], { color: HEX.ink, width: 0.5 }, "floor");
    poly(s, [P(0, 0, 0.12), P(5, 0, 0.12), P(5, 0, 4.0), P(0, 0, 4.0)], { fill: { color: HEX.slate }, line: { color: HEX.ink, width: 0.5 }, objectName: "back wall" });
    poly(s, [P(0, 0, 0.12), P(0, 5, 0.12), P(0, 5, 4.0), P(0, 0, 4.0)], { fill: { color: HEX.mid }, line: { color: HEX.ink, width: 0.5 }, objectName: "side wall" });
    poly(s, [P(1.4, 0, 1.0), P(3.6, 0, 1.0), P(3.6, 0, 3.2), P(1.4, 0, 3.2)], { fill: { color: HEX.ochre, transparency: 20 }, line: { type: "none" }, objectName: "window" });
    poly(s, [P(0, 1.6, 0.12), P(0, 2.8, 0.12), P(0, 2.8, 2.9), P(0, 1.6, 2.9)], { fill: { color: HEX.ink }, line: { type: "none" }, objectName: "door" });
    box(s, P, 2.2, 2.4, 0.12, 1.8, 0.8, 0.5, [HEX.stone, HEX.pale, HEX.gray], { color: HEX.ink, width: 0.5 }, "sofa");
    ar(s, "المحاضرة الأولى", { x: 6.9, y: 1.25, w: 5.83, h: 0.45, fontSize: 18, bold: true, color: HEX.terra });
    ar(s, "مقدمة في التصميم الداخلي", { x: 6.4, y: 1.75, w: 6.33, h: 0.95, fontSize: 40, bold: true, color: HEX.white, fit: "shrink" });
    en(s, "Introduction to Interior Design", { x: 6.4, y: 2.75, w: 6.33, h: 0.6, fontSize: 24, color: HEX.pale, align: "right" });
    s.addShape(S.LINE, { x: 9.73, y: 3.65, w: 3.0, h: 0, line: { color: HEX.mid, width: 0.75 }, objectName: "divider" });
    ar(s, [
      { text: "المادة: ", options: { bold: true, color: HEX.terra } },
      { text: "Introduction to Interior Design & Fundamentals", options: { color: HEX.white, breakLine: true } },
      { text: "المرسم: ", options: { bold: true, color: HEX.terra } },
      { text: "Studio 3", options: { color: HEX.white, breakLine: true } },
      { text: "Lecture 01", options: { bold: true, color: HEX.ochre } },
    ], { x: 6.4, y: 3.85, w: 6.33, h: 1.4, fontSize: 15, paraSpaceAfter: 6 });
    en(s, "Theory reference: Ching, F.D.K. — Architecture: Form, Space, and Order", { x: 6.4, y: 6.75, w: 6.33, h: 0.3, fontSize: 10, color: HEX.gray, align: "right" });
    s.addNotes("افتتاحية المحاضرة: في المحاضرة الأولى لا ندخل في الألوان والخامات والأثاث. نضع الأساس الفكري: ما هو التصميم الداخلي؟ وما هو الشيء الذي نصممه أصلًا؟");
  }

  // 2. OBJECTIVES
  {
    const s = content("Opening", "LECTURE OBJECTIVES", "ماذا نريد من هذه المحاضرة؟");
    ar(s, "في أول محاضرة لا ندخل في الألوان والخامات والأثاث؛ بل نضع الأساس الفكري للمادة.", { x: M, y: 1.6, w: CW, h: 0.45, fontSize: 16, color: HEX.slate });
    const objs = [
      ["FaLightbulb", "تعريف التصميم", "فهم التصميم كعملية اتخاذ قرارات منظمة وليس رسمًا لشكل جميل."],
      ["FaCouch", "التمييز عن الديكور", "التفريق بين Interior Design و Interior Decoration."],
      ["FaCubes", "فهم الفراغ", "إدراك أن الفراغ هو موضوع التصميم، وأنه يتحدد بما يحدث داخله."],
      ["FaLayerGroup", "عناصر تشكيل الفراغ", "التعرف على Point · Line · Plane · Volume ومستويات الفراغ الثلاثة."],
      ["FaPersonWalking", "الإنسان أولًا", "ربط قرارات التصميم بالإنسان والحركة والمقياس والوظيفة."],
      ["FaPenRuler", "قراءة فراغ", "تطبيق التحليل على فراغ حقيقي من خلال Exercise 01."],
    ];
    const cw = (CW - 2 * 0.3) / 3, ch = 2.15;
    for (let i = 0; i < objs.length; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const x = W - M - cw - col * (cw + 0.3), y = 2.25 + row * (ch + 0.3);
      card(s, x, y, cw, ch, C.background2, "objective " + (i + 1));
      await iconCircle(s, x + cw - 0.95, y + 0.3, 0.65, objs[i][0], HEX.teal, HEX.white, "objective " + (i + 1));
      en(s, String(i + 1).padStart(2, "0"), { x: x + 0.3, y: y + 0.35, w: 1, h: 0.5, fontSize: 24, bold: true, color: HEX.pale });
      ar(s, objs[i][1], { x: x + 0.3, y: y + 1.05, w: cw - 0.6, h: 0.4, fontSize: 17, bold: true, color: HEX.ink });
      ar(s, objs[i][2], { x: x + 0.3, y: y + 1.45, w: cw - 0.6, h: 0.65, fontSize: 13, color: HEX.slate });
    }
    s.addNotes("وضّح للطلاب أن الهدف ليس الحفظ بل تكوين طريقة تفكير. هذه الأهداف هي ما سيُقاس من خلال تمرين نهاية المحاضرة.");
  }

  // 3. AGENDA
  {
    const s = content("Opening", "LECTURE OUTLINE", "محاور المحاضرة");
    const items = [
      ["01–03", "التصميم والتصميم الداخلي", "What is Design? · What is Interior Design? · NOT Decoration"],
      ["04–06", "العمارة والفراغ", "Architecture & Interior · What are we designing? · What is Space?"],
      ["07–12", "عناصر تشكيل الفراغ", "Point → Line → Plane → Volume · Base · Wall · Overhead"],
      ["13–15", "الفتحات والإنسان", "Openings · Human & Space · Living-room example"],
      ["16–17", "الفكرة الأساسية والتمرين", "Function → Space → Experience → Form · Exercise 01"],
    ];
    const y0 = 1.75, rh = 0.92;
    for (let i = 0; i < items.length; i++) {
      const y = y0 + i * (rh + 0.07);
      card(s, 3.2, y, W - M - 3.2, rh, i % 2 ? C.background1 : C.background2, "agenda row " + (i + 1), false);
      s.addShape(S.ROUNDED_RECTANGLE, { x: W - M - 1.45, y: y + 0.17, w: 1.25, h: rh - 0.34, rectRadius: 0.06, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "agenda tag " + (i + 1) });
      en(s, items[i][0], { x: W - M - 1.45, y: y + 0.17, w: 1.25, h: rh - 0.34, fontSize: 15, bold: true, color: HEX.white, align: "center", valign: "middle" });
      ar(s, items[i][1], { x: 3.5, y: y + 0.12, w: W - M - 1.75 - 3.5, h: 0.4, fontSize: 18, bold: true, color: HEX.ink });
      en(s, items[i][2], { x: 3.5, y: y + 0.52, w: W - M - 1.75 - 3.5, h: 0.32, fontSize: 12, color: HEX.mid, align: "right" });
    }
    // left visual: big lecture marker
    s.addShape(S.RECTANGLE, { x: M, y: y0, w: 2.3, h: 5 * rh + 4 * 0.07, fill: { color: C.text1 }, line: { type: "none" }, objectName: "duration panel" });
    en(s, "90", { x: M, y: y0 + 0.6, w: 2.3, h: 1.2, fontSize: 66, bold: true, color: HEX.white, align: "center" });
    ar(s, "دقيقة", { x: M, y: y0 + 1.8, w: 2.3, h: 0.4, fontSize: 16, color: HEX.pale, align: "center" });
    ar(s, "شرح تفاعلي + تمرين تطبيقي داخل المرسم", { x: M + 0.2, y: y0 + 2.6, w: 1.9, h: 1.4, fontSize: 13, color: HEX.ochre, align: "center" });
    s.addNotes("استعرض المحاور سريعًا. نبدأ من سؤال (ما التصميم؟) وننتهي بتمرين قراءة فراغ حقيقي. لا تترك الطلاب يستمعون ساعة ونصف دون مشاركة.");
  }

  // =====================================================================
  pres.addSection({ title: "Design & Interior Design" });
  // 4. WHAT IS DESIGN
  {
    const s = content("Design & Interior Design", "01 — WHAT IS DESIGN?", "ما هو التصميم؟");
    // definition panel (right)
    const px = 7.0, pw = W - M - px;
    s.addShape(S.RECTANGLE, { x: px, y: 1.75, w: pw, h: 4.95, fill: { color: C.text1 }, line: { type: "none" }, objectName: "definition panel" });
    ar(s, "التصميم ليس مجرد رسم شكل جميل.", { x: px + 0.4, y: 2.05, w: pw - 0.8, h: 0.5, fontSize: 18, color: HEX.pale });
    ar(s, "التصميم هو عملية اتخاذ قرارات منظمة للوصول إلى حل يحقق مجموعة من المتطلبات.", { x: px + 0.4, y: 2.6, w: pw - 0.8, h: 1.6, fontSize: 21, bold: true, color: HEX.white });
    en(s, "Design is an organized decision-making process that leads to a solution meeting a set of requirements.", { x: px + 0.4, y: 4.35, w: pw - 0.8, h: 0.9, fontSize: 13, italic: true, color: HEX.ochre, align: "right" });
    ar(s, "في التصميم الداخلي ترتبط هذه المتطلبات بالفراغ والإنسان والوظيفة.", { x: px + 0.4, y: 5.4, w: pw - 0.8, h: 0.9, fontSize: 15, color: HEX.pale });
    // questions (left)
    ar(s, "عندما نصمم غرفة لا نسأل فقط: كيف ستبدو؟ بل نسأل:", { x: M, y: 1.75, w: 6.0, h: 0.4, fontSize: 15, bold: true, color: HEX.terra });
    const q = [
      ["FaUserGroup", "من سيستخدمها؟"], ["FaListCheck", "ماذا سيفعل داخلها؟"], ["FaRoute", "كيف سيتحرك؟"],
      ["FaRulerCombined", "ما مقدار المساحة المطلوبة؟"], ["FaSun", "كيف يدخل الضوء؟"], ["FaDiagramProject", "كيف تتصل بالفراغات الأخرى؟"],
      ["FaFaceSmile", "كيف يشعر المستخدم داخلها؟"],
    ];
    for (let i = 0; i < q.length; i++) {
      const y = 2.3 + i * 0.62;
      await iconCircle(s, 6.0 - 0.0, y, 0.48, q[i][0], HEX.stone, HEX.teal, "question " + (i + 1));
      ar(s, q[i][1], { x: M, y: y + 0.04, w: 5.25, h: 0.42, fontSize: 16, color: HEX.ink, valign: "middle" });
    }
    s.addNotes("ابدأ بسؤال الطلاب: ما هو التصميم؟ ثم صحّح المفهوم: التصميم عملية اتخاذ قرارات. اطلب منهم إضافة أسئلة أخرى قبل عرض القائمة.");
  }

  // 5. WHAT IS INTERIOR DESIGN
  {
    const s = content("Design & Interior Design", "02 — WHAT IS INTERIOR DESIGN?", "ما هو التصميم الداخلي؟");
    ar(s, [
      { text: "Interior Design ", options: { bold: true, color: HEX.terra } },
      { text: "هو عملية تصميم وتنظيم وتشكيل الفراغ الداخلي بما يتناسب مع أربعة محاور متكاملة:", options: { color: HEX.ink } },
    ], { x: M, y: 1.65, w: CW, h: 0.55, fontSize: 18 });
    const pillars = [
      ["FaUser", "Human", "الإنسان", "من يستخدم المكان؟", HEX.terra],
      ["FaGears", "Function", "الوظيفة", "ماذا يحدث داخل المكان؟", HEX.teal],
      ["FaVectorSquare", "Space", "الفراغ", "كيف يتم تنظيم المساحة؟", HEX.slate],
      ["FaHeart", "Experience", "التجربة", "كيف يشعر الإنسان ويتصرف داخل المكان؟", HEX.ochre],
    ];
    const pw = (CW - 3 * 0.55) / 4;
    for (let i = 0; i < 4; i++) {
      const x = W - M - pw - i * (pw + 0.55), y = 2.5;
      card(s, x, y, pw, 3.6, C.background2, "pillar " + pillars[i][1]);
      await iconCircle(s, x + pw / 2 - 0.5, y + 0.35, 1.0, pillars[i][0], pillars[i][4], HEX.white, "pillar " + pillars[i][1]);
      en(s, pillars[i][1], { x, y: y + 1.5, w: pw, h: 0.5, fontSize: 22, bold: true, color: HEX.ink, align: "center" });
      ar(s, pillars[i][2], { x, y: y + 2.0, w: pw, h: 0.4, fontSize: 17, color: pillars[i][4], bold: true, align: "center" });
      ar(s, pillars[i][3], { x: x + 0.2, y: y + 2.5, w: pw - 0.4, h: 0.9, fontSize: 14, color: HEX.slate, align: "center" });
      if (i < 3) en(s, "+", { x: x - 0.55, y: y + 1.4, w: 0.55, h: 0.6, fontSize: 30, bold: true, color: HEX.gray, align: "center" });
    }
    en(s, "Human  +  Function  +  Space  +  Experience", { x: M, y: 6.3, w: CW, h: 0.45, fontSize: 18, bold: true, color: HEX.teal, align: "center" });
    s.addNotes("التصميم الداخلي = الإنسان + الوظيفة + الفراغ + التجربة. أكّد أن غياب أي محور يجعل التصميم ناقصًا: فراغ جميل لا يعمل، أو فراغ وظيفي بلا تجربة.");
  }

  // 6. NOT DECORATION
  {
    const s = content("Design & Interior Design", "03 — INTERIOR DESIGN IS NOT DECORATION", "التصميم الداخلي ليس ديكورًا");
    const colW = 5.0, gap = 0.4, xD = W - M - colW, xI = M + 1.13;
    // Decoration column (right)
    card(s, xD, 1.7, colW, 3.75, C.background2, "decoration column");
    en(s, "Interior Decoration", { x: xD + 0.35, y: 1.9, w: colW - 0.7, h: 0.45, fontSize: 20, bold: true, color: HEX.mid, align: "right" });
    ar(s, "يركّز بصورة أكبر على المظهر:", { x: xD + 0.35, y: 2.35, w: colW - 0.7, h: 0.35, fontSize: 14, color: HEX.slate });
    const dec = ["الألوان", "الأثاث", "الستائر", "الإكسسوارات", "التشطيبات", "المظهر"];
    for (let i = 0; i < dec.length; i++) {
      const cx = xD + colW - 0.35 - (i % 2 + 1) * 2.1 - (i % 2) * 0.1, cy = 2.95 + Math.floor(i / 2) * 0.75;
      s.addShape(S.ROUNDED_RECTANGLE, { x: cx, y: cy, w: 2.1, h: 0.55, rectRadius: 0.06, fill: { color: C.background1 }, line: { color: HEX.pale, width: 0.75 }, objectName: "decoration item " + (i + 1) });
      ar(s, dec[i], { x: cx, y: cy, w: 2.1, h: 0.55, fontSize: 15, color: HEX.slate, align: "center", valign: "middle" });
    }
    // Interior design column (left, bigger system)
    card(s, M, 1.7, xD - gap - M, 3.75, C.text1, "design column");
    en(s, "Interior Design", { x: M + 0.35, y: 1.9, w: xD - gap - M - 0.7, h: 0.45, fontSize: 20, bold: true, color: HEX.white, align: "right" });
    ar(s, "يتعامل مع منظومة أكبر:", { x: M + 0.35, y: 2.35, w: xD - gap - M - 0.7, h: 0.35, fontSize: 14, color: HEX.pale });
    const des = ["Space Planning", "Function", "Circulation", "Human Scale", "Furniture", "Lighting", "Materials", "Color", "Form", "Spatial Experience"];
    const tw = (xD - gap - M - 0.7 - 0.2) / 2;
    for (let i = 0; i < des.length; i++) {
      const cx = M + 0.35 + (1 - (i % 2)) * (tw + 0.2), cy = 2.85 + Math.floor(i / 2) * 0.5;
      s.addShape(S.ROUNDED_RECTANGLE, { x: cx, y: cy, w: tw, h: 0.4, rectRadius: 0.06, fill: { color: i < 4 ? HEX.terra : HEX.slate }, line: { type: "none" }, objectName: "design item " + (i + 1) });
      en(s, des[i], { x: cx, y: cy, w: tw, h: 0.4, fontSize: 13, bold: i < 4, color: HEX.white, align: "center", valign: "middle" });
    }
    // key sentence
    s.addShape(S.RECTANGLE, { x: M, y: 5.65, w: CW, h: 1.15, fill: { color: C.background2 }, line: { type: "none" }, objectName: "key sentence panel" });
    en(s, [
      { text: "Decoration changes the appearance of a space. ", options: { color: HEX.mid } },
      { text: "Interior Design shapes the space and the experience within it.", options: { bold: true, color: HEX.terra } },
    ], { x: M + 0.3, y: 5.72, w: CW - 0.6, h: 0.45, fontSize: 16, align: "center", italic: true });
    ar(s, "الديكور يهتم بمظهر الفراغ، أما التصميم الداخلي فيهتم بتشكيل الفراغ وطريقة استخدامه وتجربته.", { x: M + 0.3, y: 6.2, w: CW - 0.6, h: 0.45, fontSize: 15, bold: true, color: HEX.ink, align: "center" });
    s.addNotes("نقطة يجب التأكيد عليها من البداية. لاحظ أن عناصر الديكور (اللون، الأثاث، الخامات) موجودة أيضًا داخل منظومة التصميم الداخلي، لكنها تأتي ضمن قرارات أكبر: تخطيط الفراغ، الوظيفة، الحركة، ومقياس الإنسان.");
  }

  // 7. ARCHITECTURE & INTERIOR
  {
    const s = content("Design & Interior Design", "04 — ARCHITECTURE & INTERIOR DESIGN", "العمارة والتصميم الداخلي");
    s.addShape(S.RECTANGLE, { x: M, y: 1.65, w: CW, h: 1.05, fill: { color: C.background2 }, line: { type: "none" }, objectName: "definition band" });
    ar(s, "العمارة فنٌّ وعلمٌ للبناء وإنشاء فراغات وظيفية بصورة مقصودة، تجمع بين الكفاءة التقنية والجودة الجمالية.", { x: M + 0.3, y: 1.75, w: CW - 0.6, h: 0.5, fontSize: 15, bold: true, color: HEX.ink });
    en(s, "Theory of Architecture — Ching: Architecture, Form, Space & Order  ·  Vitruvius: Firmitas · Utilitas · Venustas", { x: M + 0.3, y: 2.25, w: CW - 0.6, h: 0.35, fontSize: 12, color: HEX.mid, align: "right" });
    // two flows
    const rows = [
      ["Architecture", "العمارة — المبنى ككل", ["Site", "Building", "Form", "Structure", "Envelope"], HEX.slate],
      ["Interior Design", "التصميم الداخلي — الداخل", ["Building", "Space", "Human", "Function", "Experience"], HEX.terra],
    ];
    for (let r = 0; r < 2; r++) {
      const y = 3.0 + r * 1.45;
      ar(s, rows[r][1], { x: W - M - 3.2, y: y + 0.05, w: 3.2, h: 0.4, fontSize: 16, bold: true, color: rows[r][3] });
      en(s, rows[r][0], { x: W - M - 3.2, y: y + 0.45, w: 3.2, h: 0.35, fontSize: 13, color: HEX.mid, align: "right" });
      const steps = rows[r][2], bw = 1.45, ag = 0.38;
      for (let i = 0; i < 5; i++) {
        const x = W - M - 3.45 - bw - i * (bw + ag);
        s.addShape(S.ROUNDED_RECTANGLE, { x, y, w: bw, h: 0.85, rectRadius: 0.08, fill: { color: rows[r][3] }, line: { type: "none" }, objectName: rows[r][0] + " step " + (i + 1) });
        en(s, steps[i], { x, y, w: bw, h: 0.85, fontSize: 13, bold: true, color: HEX.white, align: "center", valign: "middle" });
        if (i < 4) s.addShape(S.LINE, { x: x - ag + 0.05, y: y + 0.425, w: ag - 0.1, h: 0, line: { color: HEX.gray, width: 1.5, beginArrowType: "triangle" }, objectName: "arrow" });
      }
    }
    // shared idea
    card(s, M, 5.95, CW, 0.85, C.text1, "shared idea", false);
    await iconCircle(s, W - M - 0.8, 6.07, 0.6, "FaArrowsLeftRight", HEX.terra, HEX.white, "two-way");
    ar(s, "لا يوجد جدار حقيقي بين التخصصين: المبنى يؤثر على الداخل، والداخل يؤثر على إدراك المبنى واستخدامه.", { x: M + 0.3, y: 5.95, w: CW - 1.4, h: 0.85, fontSize: 15, bold: true, color: HEX.white, valign: "middle" });
    s.addNotes("المرجع يبدأ من Theory of Architecture بتعريف العمارة كفن وعلم. نستخدم ذلك مدخلًا للعلاقة: العمارة تنتقل من الموقع إلى الغلاف، والتصميم الداخلي ينتقل من المبنى إلى التجربة. يمكن الإشارة إلى ثلاثية فيتروفيوس: المتانة، المنفعة، الجمال.");
  }

  // =====================================================================
  pres.addSection({ title: "Space" });
  // 8. WHAT ARE WE DESIGNING (dark statement)
  {
    const s = pres.addSlide({ masterName: "Section Dark", sectionTitle: "Space" });
    en(s, "05 — WHAT ARE WE DESIGNING?", { x: M, y: 0.6, w: CW, h: 0.4, fontSize: 14, bold: true, color: HEX.terra, align: "right" });
    ar(s, "ماذا نصمم في التصميم الداخلي؟", { x: M, y: 1.05, w: CW, h: 0.7, fontSize: 30, bold: true, color: HEX.white });
    const qs = [["FaChair", "هل نصمم الأثاث؟"], ["FaBorderAll", "هل نصمم الجدران فقط؟"]];
    for (let i = 0; i < 2; i++) {
      const x = W - M - 5.2 - i * 5.6, y = 2.2;
      card(s, x, y, 5.2, 1.3, HEX.slate, "question " + (i + 1), false);
      await iconCircle(s, x + 5.2 - 1.0, y + 0.3, 0.7, qs[i][0], HEX.mid, HEX.white, "question " + (i + 1));
      ar(s, qs[i][1], { x: x + 1.3, y, w: 2.75, h: 1.3, fontSize: 19, color: HEX.white, valign: "middle" });
      ar(s, "لا", { x: x + 0.3, y, w: 0.9, h: 1.3, fontSize: 30, bold: true, color: HEX.terra, align: "center", valign: "middle" });
    }
    ar(s, "إذن ماذا نصمم؟", { x: M, y: 3.85, w: CW, h: 0.5, fontSize: 20, color: HEX.pale, align: "center" });
    ar(s, "نحن نصمم الفراغ", { x: M, y: 4.4, w: CW, h: 1.2, fontSize: 60, bold: true, color: HEX.white, align: "center" });
    en(s, "WE DESIGN SPACE", { x: M, y: 5.65, w: CW, h: 0.6, fontSize: 24, bold: true, color: HEX.ochre, align: "center", charSpacing: 6 });
    s.addNotes("اسأل الطلاب: هل نحن نصمم الأثاث؟ لا. هل نصمم الجدران فقط؟ لا. إذن ماذا نصمم؟ نحن نصمم الفراغ — وهذه أهم فكرة في المحاضرة الأولى. انتظر إجاباتهم قبل كشف الجواب.");
  }

  // 9. WHAT IS SPACE
  {
    const s = content("Space", "06 — WHAT IS SPACE?", "ما هو الفراغ؟");
    card(s, 7.4, 1.7, W - M - 7.4, 2.15, C.text1, "definition", false);
    ar(s, "الفراغ ليس مجرد مساحة فارغة؛", { x: 7.7, y: 1.9, w: W - M - 8.0, h: 0.45, fontSize: 17, color: HEX.pale });
    ar(s, "هو الحيّز الذي يحدث داخله النشاط الإنساني.", { x: 7.7, y: 2.35, w: W - M - 8.0, h: 1.0, fontSize: 22, bold: true, color: HEX.white });
    // equations
    const eq = [
      ["غرفة النوم", "Bedroom", ["Space", "Sleeping", "Movement", "Storage", "Privacy", "Light"], "FaBed"],
      ["غرفة المعيشة", "Living Room", ["Space", "Sitting", "Communication", "Movement", "Social Interaction"], "FaCouch"],
    ];
    for (let r = 0; r < 2; r++) {
      const y = 4.15 + r * 1.2;
      await iconCircle(s, W - M - 0.75, y + 0.1, 0.7, eq[r][3], HEX.teal, HEX.white, eq[r][1]);
      ar(s, eq[r][0], { x: W - M - 2.7, y: y + 0.1, w: 1.8, h: 0.4, fontSize: 16, bold: true, color: HEX.ink });
      en(s, eq[r][1], { x: W - M - 2.7, y: y + 0.5, w: 1.8, h: 0.3, fontSize: 12, color: HEX.mid, align: "right" });
      const terms = eq[r][2];
      const tx = M, avail = W - M - 2.9 - M;
      const lens = terms.map(t => 0.35 + t.length * 0.095);
      const total = lens.reduce((a, b) => a + b, 0) + (terms.length - 1) * 0.3;
      let x = tx + (avail - total);
      for (let i = 0; i < terms.length; i++) {
        s.addShape(S.ROUNDED_RECTANGLE, { x, y: y + 0.12, w: lens[i], h: 0.62, rectRadius: 0.06, fill: { color: i === 0 ? HEX.terra : C.background2 }, line: { type: "none" }, objectName: eq[r][1] + " term " + (i + 1) });
        en(s, terms[i], { x, y: y + 0.12, w: lens[i], h: 0.62, fontSize: 13, bold: i === 0, color: i === 0 ? HEX.white : HEX.ink, align: "center", valign: "middle" });
        if (i < terms.length - 1) en(s, "+", { x: x + lens[i], y: y + 0.12, w: 0.3, h: 0.62, fontSize: 16, bold: true, color: HEX.gray, align: "center", valign: "middle" });
        x += lens[i] + 0.3;
      }
    }
    // left: "not 4 walls" iso
    const P = isoP(2.3, 2.85, 0.3);
    box(s, P, 0, 0, 0, 4.5, 4.5, 0.08, [HEX.stone, HEX.pale, HEX.gray], { color: HEX.slate, width: 0.5 }, "floor");
    poly(s, [P(0, 0, 0.08), P(4.5, 0, 0.08), P(4.5, 0, 3.0), P(0, 0, 3.0)], { fill: { color: HEX.pale, transparency: 30 }, line: { color: HEX.slate, width: 0.5 }, objectName: "wall a" });
    poly(s, [P(0, 0, 0.08), P(0, 4.5, 0.08), P(0, 4.5, 3.0), P(0, 0, 3.0)], { fill: { color: HEX.gray, transparency: 30 }, line: { color: HEX.slate, width: 0.5 }, objectName: "wall b" });
    en(s, "4 Walls + Floor + Ceiling", { x: M, y: 1.5, w: 4.9, h: 0.3, fontSize: 13, color: HEX.mid, strike: "sngStrike", align: "left" });
    // activity dots inside
    const acts = [[2.2, 2.6], [3.3, 1.4], [1.2, 3.3]];
    acts.forEach((a, i) => { const p = P(a[0], a[1], 0.08); s.addShape(S.OVAL, { x: p[0] - 0.13, y: p[1] - 0.13, w: 0.26, h: 0.26, fill: { color: HEX.terra }, line: { color: HEX.white, width: 1 }, objectName: "activity " + (i + 1) }); });
    s.addShape(S.RECTANGLE, { x: M, y: 6.25, w: CW, h: 0.55, fill: { color: C.background2 }, line: { type: "none" }, objectName: "conclusion band" });
    ar(s, "إذن: الفراغ يتحدد من خلال ما يحدث داخله، وليس من خلال أبعاده فقط.", { x: M + 0.3, y: 6.25, w: CW - 0.6, h: 0.55, fontSize: 16, bold: true, color: HEX.teal, valign: "middle" });
    s.addNotes("غرفة النوم ليست أربعة جدران وأرضية وسقف، بل فراغ + نوم + حركة + تخزين + خصوصية + ضوء. اطلب من الطلاب صياغة معادلة مشابهة لفصل دراسي أو مطبخ.");
  }

  // 10. ELEMENTS OF SPACE
  {
    const s = content("Space", "07 — PRIMARY ELEMENTS OF FORM", "عناصر تشكيل الفراغ");
    ar(s, "يقدّم المرجع العناصر الأولية للشكل؛ كل عنصر ينتج من امتداد العنصر الذي قبله في بُعد جديد.", { x: M, y: 1.6, w: CW, h: 0.45, fontSize: 16, color: HEX.slate });
    const items = [
      ["POINT", "نقطة", "بُعد صفري", "يحدد موقعًا في الفراغ — بلا طول أو عرض أو عمق.", "Position"],
      ["LINE", "خط", "بُعد واحد", "امتداد النقطة؛ له طول واتجاه وموقع.", "Length · Direction"],
      ["PLANE", "مستوى", "بُعدان", "امتداد الخط؛ له طول وعرض وشكل وسطح واتجاه.", "Shape · Surface"],
      ["VOLUME", "حجم", "ثلاثة أبعاد", "امتداد المستوى في البُعد الثالث؛ له طول وعرض وعمق.", "Form & Space"],
    ];
    const cw = (CW - 3 * 0.45) / 4, y = 2.3;
    for (let i = 0; i < 4; i++) {
      // RTL reading: first element on the right
      const x = W - M - cw - i * (cw + 0.45);
      card(s, x, y, cw, 4.35, C.background2, items[i][0]);
      const cx = x + cw / 2, cy = y + 1.15;
      if (i === 0) s.addShape(S.OVAL, { x: cx - 0.13, y: cy - 0.13, w: 0.26, h: 0.26, fill: { color: HEX.terra }, line: { type: "none" }, objectName: "point" });
      if (i === 1) {
        s.addShape(S.LINE, { x: cx - 0.95, y: cy, w: 1.9, h: 0, line: { color: HEX.terra, width: 3.5 }, objectName: "line" });
        s.addShape(S.OVAL, { x: cx - 1.03, y: cy - 0.08, w: 0.16, h: 0.16, fill: { color: HEX.ink }, line: { type: "none" }, objectName: "line end a" });
        s.addShape(S.OVAL, { x: cx + 0.87, y: cy - 0.08, w: 0.16, h: 0.16, fill: { color: HEX.ink }, line: { type: "none" }, objectName: "line end b" });
      }
      if (i === 2) { const P = isoP(cx - 0.05, cy - 0.55, 0.42); poly(s, [P(0, 0, 0), P(2.4, 0, 0), P(2.4, 2.4, 0), P(0, 2.4, 0)], { fill: { color: HEX.terra, transparency: 15 }, line: { color: HEX.ink, width: 1 }, objectName: "plane" }); }
      if (i === 3) { const P = isoP(cx, cy - 0.35, 0.4); box(s, P, -1.0, -1.0, -0.5, 2.0, 2.0, 1.6, [HEX.terra, "9E4429", "B04F33"], { color: HEX.ink, width: 1 }, "volume"); }
      en(s, items[i][0], { x, y: y + 2.1, w: cw, h: 0.45, fontSize: 20, bold: true, color: HEX.ink, align: "center", charSpacing: 3 });
      ar(s, items[i][1] + "  ·  " + items[i][2], { x, y: y + 2.55, w: cw, h: 0.4, fontSize: 15, bold: true, color: HEX.terra, align: "center" });
      ar(s, items[i][3], { x: x + 0.25, y: y + 3.0, w: cw - 0.5, h: 0.85, fontSize: 13, color: HEX.slate, align: "center" });
      en(s, items[i][4], { x, y: y + 3.85, w: cw, h: 0.35, fontSize: 12, italic: true, color: HEX.mid, align: "center" });
      if (i < 3) s.addShape(S.LINE, { x: x - 0.4, y: cy, w: 0.35, h: 0, line: { color: HEX.gray, width: 2, endArrowType: "triangle", beginArrowType: "none" }, flipH: true, objectName: "progression arrow " + (i + 1) });
    }
    s.addNotes("التسلسل POINT → LINE → PLANE → VOLUME مهم جدًا للمحاضرات القادمة. النقطة ذات بُعد صفري، والخط ينتج من امتداد النقطة، والمستوى من امتداد الخط، والحجم من امتداد المستوى إلى البعد الثالث. الخصائص المذكورة (Position, Length, Direction, Shape, Surface, Orientation) مأخوذة من تصنيف Ching للعناصر الأولية.");
  }

  // 10-A. PLANE & VOLUME (from course PDF)
  {
    const s = content("Space", "07-A — PLANE & VOLUME", "المستوى والحجم");
    // wireframe cube (left)
    const ox = 1.35, oy = 2.35, a = 2.3, d = 0.85;
    const F = [[ox, oy + d], [ox + a, oy + d], [ox + a, oy + d + a], [ox, oy + d + a]];
    const Bk = F.map(p => [p[0] + d, p[1] - d]);
    s.addShape(S.RECTANGLE, { x: M, y: 1.7, w: 5.3, h: 4.95, fill: { color: C.background2 }, line: { type: "none" }, objectName: "cube panel" });
    const ln = (p, q, dash, nm) => s.addShape(S.LINE, { x: Math.min(p[0], q[0]), y: Math.min(p[1], q[1]), w: Math.abs(q[0] - p[0]), h: Math.abs(q[1] - p[1]), flipV: (q[0] - p[0]) * (q[1] - p[1]) < 0, line: { color: HEX.terra, width: 2, dashType: dash ? "dash" : "solid" }, objectName: nm });
    ln(Bk[0], Bk[1], false, "back top"); ln(Bk[1], Bk[2], false, "back right"); ln(Bk[2], Bk[3], true, "back bottom"); ln(Bk[3], Bk[0], true, "back left");
    for (let i = 0; i < 4; i++) ln(F[i], Bk[i], i === 3, "depth " + i);
    poly(s, F, { fill: { color: HEX.terra, transparency: 85 }, line: { color: HEX.terra, width: 2 }, objectName: "front face" });
    [F[0], F[1], F[2], F[3], Bk[0], Bk[1], Bk[2]].forEach((p, i) => s.addShape(S.OVAL, { x: p[0] - 0.08, y: p[1] - 0.08, w: 0.16, h: 0.16, fill: { color: HEX.ink }, line: { type: "none" }, objectName: "vertex " + i }));
    const lab = [
      [M + 0.1, 5.75, "Points / Vertices", "النقاط — الرؤوس"],
      [M + 1.83, 5.75, "Lines / Edges", "الخطوط — الحواف (التقاء مستويين)"],
      [M + 3.56, 5.75, "Planes / Surfaces", "المستويات — الأسطح"],
    ];
    lab.forEach((l, i) => {
      en(s, l[2], { x: l[0], y: l[1], w: 1.65, h: 0.3, fontSize: 12, bold: true, color: HEX.ink, align: "center" });
      ar(s, l[3], { x: l[0], y: l[1] + 0.3, w: 1.65, h: 0.55, fontSize: 11, color: HEX.slate, align: "center" });
    });
    // text cards (right)
    const rx = 6.25, rw = W - M - rx;
    card(s, rx, 1.7, rw, 2.35, C.background2, "plane card");
    en(s, "PLANE", { x: rx + 0.3, y: 1.85, w: rw - 0.6, h: 0.35, fontSize: 16, bold: true, color: HEX.terra, align: "right", charSpacing: 2 });
    ar(s, [
      { text: "الشكل (Shape) هو الخاصية الأساسية التي تميّز المستوى.", options: { bullet: { code: "25A0" }, breakLine: true } },
      { text: "خصائص مكمّلة: السطح، اللون، النمط، الملمس — تؤثر في وزنه البصري واستقراره.", options: { bullet: { code: "25A0" }, breakLine: true } },
      { text: "يعمل المستوى على تحديد حدود الحجم.", options: { bullet: { code: "25A0" } } },
    ], { x: rx + 0.3, y: 2.25, w: rw - 0.6, h: 1.7, fontSize: 14, color: HEX.ink, paraSpaceAfter: 6 });
    card(s, rx, 4.3, rw, 2.35, C.text1, "volume card", false);
    en(s, "VOLUME", { x: rx + 0.3, y: 4.45, w: rw - 0.6, h: 0.35, fontSize: 16, bold: true, color: HEX.ochre, align: "right", charSpacing: 2 });
    ar(s, [
      { text: "الهيئة (Form) هي الخاصية الأساسية التي تميّز الحجم.", options: { bullet: { code: "25A0" }, breakLine: true } },
      { text: "تتحدد بأشكال المستويات والعلاقات بينها.", options: { bullet: { code: "25A0" }, breakLine: true } },
      { text: "الحجم إما كتلة صلبة (Solid) أو فراغ (Void) تحتويه المستويات — وهذا الفراغ هو ما نصممه.", options: { bullet: { code: "25A0" } } },
    ], { x: rx + 0.3, y: 4.85, w: rw - 0.6, h: 1.7, fontSize: 14, color: HEX.white, paraSpaceAfter: 6 });
    s.addNotes("من ملف Theory of Architecture: المستوى يُعرف أولًا بشكله، ثم بخصائص السطح واللون والنمط والملمس التي تؤثر في وزنه البصري، ووظيفته تحديد حدود الحجم. الحجم يتكون من نقاط (رؤوس) وخطوط (حواف يلتقي عندها مستويان) ومستويات (أسطح)، والحجم قد يكون كتلة صلبة أو فراغًا تحتويه المستويات. أكّد للطلاب: المصمم الداخلي يعمل على الـ Void.");
  }

  // 11. FROM ELEMENTS TO INTERIOR SPACE
  {
    const s = content("Space", "08 — FROM ELEMENTS TO INTERIOR SPACE", "من العناصر إلى الفراغ الداخلي");
    ar(s, "المستوى (Plane) هو العنصر الأهم في تشكيل الفراغ الداخلي، ويظهر في ثلاثة أنواع عامة:", { x: 6.4, y: 1.6, w: W - M - 6.4, h: 0.7, fontSize: 15, color: HEX.slate });
    // exploded iso diagram on left
    const P = isoP(3.2, 3.95, 0.4);
    box(s, P, 0, 0, 0, 4.5, 4.5, 0.1, [HEX.terra, "9E4429", "B04F33"], { color: HEX.ink, width: 0.75 }, "base plane");
    poly(s, [P(0, 0, 0.6), P(4.5, 0, 0.6), P(4.5, 0, 3.4), P(0, 0, 3.4)], { fill: { color: HEX.teal, transparency: 10 }, line: { color: HEX.ink, width: 0.75 }, objectName: "wall plane a" });
    poly(s, [P(0, 0, 0.6), P(0, 4.5, 0.6), P(0, 4.5, 3.4), P(0, 0, 3.4)], { fill: { color: "4D8786" }, line: { color: HEX.ink, width: 0.75 }, objectName: "wall plane b" });
    poly(s, [P(0, 0, 4.4), P(4.5, 0, 4.4), P(4.5, 4.5, 4.4), P(0, 4.5, 4.4)], { fill: { color: HEX.ochre, transparency: 10 }, line: { color: HEX.ink, width: 0.75 }, objectName: "overhead plane" });
    // labels right
    const L = [
      ["Overhead Plane", "السقف", "سقف الفراغ أو سطح المبنى.", HEX.ochre, "FaArrowUp", "munich", "Munich Olympic Stadium"],
      ["Wall Plane", "الجدار", "أساسي لاحتواء الفراغ، والأكثر حضورًا في مجال الرؤية.", HEX.teal, "FaArrowsLeftRight", "interior", "Modern interior"],
      ["Base Plane", "الأرضية", "عليه يندمج المبنى أو يستقر أو يرتفع عنه.", HEX.terra, "FaArrowDown", "precast", "Precast house"],
    ];
    for (let i = 0; i < 3; i++) {
      const y = 2.35 + i * 1.35, x = 6.6, w = W - M - x;
      card(s, x, y, w, 1.25, C.background2, L[i][0]);
      await iconCircle(s, x + w - 0.9, y + 0.3, 0.65, L[i][4], L[i][3], HEX.white, L[i][0]);
      await photo(s, L[i][5], x + 0.1, y + 0.1, 1.6, 0.8);
      en(s, L[i][6], { x: x + 0.1, y: y + 0.93, w: 1.6, h: 0.25, fontSize: 10, italic: true, color: HEX.mid, align: "center" });
      en(s, L[i][0], { x: x + 1.9, y: y + 0.17, w: w - 2.95, h: 0.4, fontSize: 18, bold: true, color: HEX.ink, align: "right" });
      ar(s, L[i][1] + " — " + L[i][2], { x: x + 1.9, y: y + 0.58, w: w - 2.95, h: 0.6, fontSize: 13, color: HEX.slate });
    }
    ar(s, "هذه المستويات الثلاثة هي أهم العناصر التي تحدد الفراغ المعماري والداخلي.", { x: 6.6, y: 6.42, w: W - M - 6.6, h: 0.45, fontSize: 13, bold: true, color: HEX.teal });
    s.addNotes("المرجع يوضح ثلاثة أنواع عامة من المستويات المستخدمة في تشكيل الفراغ: Base Plane و Wall Plane و Overhead Plane. المخطط المفكك (exploded) على اليسار يوضح كيف تتحول المستويات المجردة إلى أرضية وجدران وسقف.");
  }

  // 12. BASE PLANE
  {
    const s = content("Space", "09 — BASE PLANE", "الأرضية — المستوى الأساسي");
    ar(s, "الأرضية هي أول مستوى يلامس جسم الإنسان وتحدد قاعدة الفراغ، لكنها لا يجب أن تكون مجرد سطح أفقي.", { x: M, y: 1.6, w: CW, h: 0.45, fontSize: 16, color: HEX.slate });
    const v = [
      ["Continuous", "أرضية مستمرة", "إحساس بالاستمرارية والوحدة."],
      ["Elevated", "أرضية مرتفعة", "تحدد منطقة مختلفة وتمنحها أهمية."],
      ["Depressed", "أرضية منخفضة", "تصنع إحساسًا مختلفًا بالاحتواء."],
      ["Articulated", "تغيير اللون أو الخامة", "يجعل المنطقة أوضح كعنصر مستقل."],
    ];
    const cw = (CW - 3 * 0.35) / 4;
    for (let i = 0; i < 4; i++) {
      const x = W - M - cw - i * (cw + 0.35), y = 2.25;
      card(s, x, y, cw, 3.3, C.background2, "base " + v[i][0]);
      const P = isoP(x + cw / 2, y + 0.55, 0.34);
      const lnc = { color: HEX.ink, width: 0.5 };
      if (i === 0) box(s, P, -1.6, -1.6, 0, 3.2, 3.2, 0.25, [HEX.pale, HEX.gray, HEX.mid], lnc, "slab");
      if (i === 1) { box(s, P, -1.6, -1.6, 0, 3.2, 3.2, 0.25, [HEX.pale, HEX.gray, HEX.mid], lnc, "slab"); box(s, P, -0.9, -0.9, 0.25, 1.8, 1.8, 0.55, [HEX.terra, "9E4429", "B04F33"], lnc, "platform"); }
      if (i === 2) {
        box(s, P, -1.6, -1.6, 0, 3.2, 3.2, 0.25, [HEX.pale, HEX.gray, HEX.mid], lnc, "slab");
        poly(s, [P(-0.9, -0.9, 0.25), P(0.9, -0.9, 0.25), P(0.9, 0.9, 0.25), P(-0.9, 0.9, 0.25)], { fill: { color: HEX.terra }, line: lnc, objectName: "sunken area" });
        poly(s, [P(-0.9, -0.9, 0.25), P(0.9, -0.9, 0.25), P(0.9, -0.9, -0.2), P(-0.9, -0.9, -0.2)], { fill: { color: "7E3620" }, line: lnc, objectName: "sunken wall a" });
        poly(s, [P(-0.9, -0.9, 0.25), P(-0.9, 0.9, 0.25), P(-0.9, 0.9, -0.2), P(-0.9, -0.9, -0.2)], { fill: { color: "9E4429" }, line: lnc, objectName: "sunken wall b" });
        poly(s, [P(-0.9, -0.9, -0.2), P(0.9, -0.9, -0.2), P(0.9, 0.9, -0.2), P(-0.9, 0.9, -0.2)], { fill: { color: HEX.terra }, line: lnc, objectName: "sunken floor" });
      }
      if (i === 3) { box(s, P, -1.6, -1.6, 0, 3.2, 3.2, 0.25, [HEX.pale, HEX.gray, HEX.mid], lnc, "slab"); poly(s, [P(-0.9, -0.9, 0.25), P(0.9, -0.9, 0.25), P(0.9, 0.9, 0.25), P(-0.9, 0.9, 0.25)], { fill: { color: HEX.ochre }, line: lnc, objectName: "material change" }); }
      en(s, v[i][0], { x, y: y + 1.95, w: cw, h: 0.35, fontSize: 14, bold: true, color: HEX.mid, align: "center" });
      ar(s, v[i][1], { x, y: y + 2.3, w: cw, h: 0.4, fontSize: 17, bold: true, color: HEX.ink, align: "center" });
      ar(s, v[i][2], { x: x + 0.2, y: y + 2.7, w: cw - 0.4, h: 0.5, fontSize: 13, color: HEX.slate, align: "center" });
    }
    s.addShape(S.RECTANGLE, { x: M, y: 5.8, w: CW, h: 0.95, fill: { color: C.text1 }, line: { type: "none" }, objectName: "tools band" });
    ar(s, "متى تتضح الأرضية؟", { x: W - M - 3.0, y: 5.8, w: 2.7, h: 0.95, fontSize: 16, bold: true, color: HEX.ochre, valign: "middle" });
    ar(s, "يتضح المستوى الأرضي عند: تغيّر محسوس في اللون أو الملمس · تحديد الحواف · معالجة السطح (سجاد، عشب، بلاط)", { x: M + 0.3, y: 5.8, w: CW - 3.6, h: 0.95, fontSize: 15, color: HEX.white, valign: "middle" });
    s.addNotes("المرجع يوضح أن تغيير اللون أو الملمس أو تحديد الحواف يمكن أن يجعل المستوى الأرضي أكثر وضوحًا كعنصر مستقل داخل الفراغ. أعط أمثلة: منصة في قاعة محاضرات (مرتفعة)، جلسة عربية منخفضة (Sunken)، سجادة تحدد منطقة جلوس (تغيير خامة).");
  }

  // 12-A. ELEVATED BASE PLANE — principles
  {
    const s = content("Space", "09-A — ELEVATED BASE PLANE", "الأرضية المرتفعة");
    ar(s, [
      { text: "رفع جزء من الأرضية يصنع مجالًا (Domain) خاصًا داخل الفراغ الأكبر.", options: { bullet: { code: "25A0" }, breakLine: true } },
      { text: "إذا استمرت خصائص السطح فوق الجزء المرتفع، يبدو جزءًا من المستوى المحيط.", options: { bullet: { code: "25A0" }, breakLine: true } },
      { text: "إذا عولجت حافته بتغيير الشكل أو اللون أو الملمس، يصبح «هضبة» مستقلة عن محيطها.", options: { bullet: { code: "25A0" } } },
    ], { x: M, y: 1.6, w: CW, h: 1.25, fontSize: 15, color: HEX.ink, paraSpaceAfter: 4 });
    const sc = 0.45; // in per metre
    const cases = [
      [0.4, "Edge defined · continuity kept", "الحافة واضحة؛ تبقى الاستمرارية الفراغية والبصرية، والوصول سهل.", HEX.teal],
      [1.1, "Spatial broken · visual kept", "تنقطع الاستمرارية الفراغية وتبقى البصرية؛ يحتاج الوصول إلى درج.", HEX.ochre],
      [2.2, "Spatial & visual broken", "تنقطع الاستمرارية البصرية والفراغية؛ ينعزل المستوى المرتفع عن الأرض.", HEX.terra],
    ];
    const cw = (CW - 2 * 0.35) / 3;
    for (let i = 0; i < 3; i++) {
      const x = W - M - cw - i * (cw + 0.35), y = 3.0, g = y + 2.15;
      card(s, x, y, cw, 3.75, C.background2, "elevated case " + (i + 1));
      s.addShape(S.LINE, { x: x + 0.2, y: g, w: cw - 0.4, h: 0, line: { color: HEX.ink, width: 1.5 }, objectName: "ground" });
      const ph = cases[i][0] * sc, px = x + 1.55, pw = cw - 1.75;
      s.addShape(S.RECTANGLE, { x: px, y: g - ph, w: pw, h: ph, fill: { color: cases[i][3] }, line: { color: HEX.ink, width: 0.75 }, objectName: "platform" });
      if (i === 1) for (let k = 0; k < 4; k++) s.addShape(S.RECTANGLE, { x: px - 0.18 * (k + 1), y: g - ph * (4 - k) / 4.6, w: 0.18, h: ph * (4 - k) / 4.6, fill: { color: HEX.pale }, line: { color: HEX.ink, width: 0.5 }, objectName: "step " + k });
      person(s, x + 0.55, g, 1.7 * sc, HEX.slate, "viewer");
      person(s, px + pw / 2, g - ph, 1.7 * sc, HEX.gray, "user on platform");
      s.addShape(S.LINE, { x: x + 0.6, y: g - 1.55 * sc, w: px - x - 0.6, h: 0, line: { color: HEX.terra, width: 1.25, dashType: "dash", endArrowType: "triangle" }, objectName: "sight line" });
      en(s, cases[i][0].toFixed(1) + " m", { x: px + pw - 0.7, y: g + 0.05, w: 0.7, h: 0.25, fontSize: 10, bold: true, color: HEX.mid, align: "right" });
      en(s, cases[i][1], { x: x + 0.2, y: y + 2.45, w: cw - 0.4, h: 0.3, fontSize: 12, bold: true, color: HEX.mid, align: "center" });
      ar(s, cases[i][2], { x: x + 0.2, y: y + 2.8, w: cw - 0.4, h: 0.85, fontSize: 13, color: HEX.ink, align: "center" });
    }
    s.addNotes("من ملف Theory of Architecture: Elevated Base Plane — spatial & visual continuity. الحالة 1: حافة واضحة مع بقاء الاستمرارية والوصول سهل. الحالة 2: تنقطع الاستمرارية الفراغية وتبقى البصرية ويلزم درج. الحالة 3: ينقطع الاتصال البصري والفراغي ويصبح المستوى معزولًا. الارتفاعات تقريبية للتوضيح.");
  }

  // 12-B. ELEVATED BASE PLANE — examples
  {
    const s = content("Space", "09-B — ELEVATED PLANE: EXAMPLES", "الأرضية المرتفعة: أمثلة");
    ar(s, "قد ينتج الارتفاع عن طبيعة الموقع أو يُنشأ عمدًا لرفع المبنى عن محيطه وتعزيز صورته، ويُستخدم لتمييز المباني المقدسة أو المهمة.", { x: M, y: 1.6, w: CW, h: 0.7, fontSize: 15, color: HEX.slate });
    const ex = [
      ["acropolis", "Acropolis, Athens", "مرتفع طبيعي يميّز المعبد ويمنحه المكانة."],
      ["savoye", "Villa Savoye, Paris — Le Corbusier", "رفع المبنى على أعمدة عن الأرض."],
      ["cept", "CEPT University canteen, Ahmedabad", "منصة منخفضة تحدد منطقة جلوس خارجية."],
      ["elev_room", "Elevated zone in an interior", "أرضية مرتفعة تحدد منطقة عمل داخل الفراغ."],
    ];
    const pw = (CW - 3 * 0.3) / 4, ph = 2.75;
    for (let i = 0; i < 4; i++) {
      const x = W - M - pw - i * (pw + 0.3), y = 2.5;
      await photo(s, ex[i][0], x, y, pw, ph);
      en(s, ex[i][1], { x, y: y + ph + 0.1, w: pw, h: 0.5, fontSize: 12, bold: true, color: HEX.ink, align: "right" });
      ar(s, ex[i][2], { x, y: y + ph + 0.6, w: pw, h: 0.7, fontSize: 13, color: HEX.slate });
    }
    en(s, "Images: Theory of Architecture — course reference", { x: M, y: 6.62, w: 6, h: 0.25, fontSize: 10, italic: true, color: HEX.gray, align: "left" });
    s.addNotes("أمثلة من ملف المرجع: الأكروبوليس (ارتفاع ناتج عن الموقع يميّز المبنى المقدس)، فيلا سافوي (رفع المبنى عن الأرض)، ساحة كانتين CEPT (منصة تحدد منطقة جلوس)، ومثال داخلي لمنصة تحدد منطقة عمل. اسأل الطلاب عن أمثلة محلية: منبر المسجد، المجلس المرتفع، منصة المحاضر.");
  }

  // 12-C. DEPRESSED BASE PLANE
  {
    const s = content("Space", "09-C — DEPRESSED BASE PLANE", "الأرضية المنخفضة");
    ar(s, "الأسطح الرأسية للانخفاض هي التي تحدد حدوده، ويمكن تعزيزه بتباين الشكل أو الهندسة أو الاتجاه عن المحيط.", { x: M, y: 1.6, w: CW, h: 0.45, fontSize: 15, color: HEX.slate });
    const sc = 0.32;
    const cases = [[0.3, "Remains an integral part", "يبقى جزءًا من الفراغ المحيط"], [1.0, "The space is distinct", "يصبح فراغًا مميزًا"], [1.8, "Separates", "ينفصل عن الفراغ المحيط"]];
    const cw = (CW - 2 * 0.35) / 3;
    for (let i = 0; i < 3; i++) {
      const x = W - M - cw - i * (cw + 0.35), y = 2.2, g = y + 0.6, dp = cases[i][0] * sc;
      card(s, x, y, cw, 2.0, C.background2, "depressed case " + (i + 1));
      const x1 = x + 0.9, x2 = x + cw - 0.9;
      s.addShape(S.RECTANGLE, { x: x1, y: g, w: x2 - x1, h: dp, fill: { color: HEX.terra, transparency: 70 }, line: { type: "none" }, objectName: "sunken field" });
      [[x + 0.2, g, x1 - x - 0.2, 0], [x1, g, 0, dp], [x1, g + dp, x2 - x1, 0], [x2, g, 0, dp], [x2, g, x + cw - 0.2 - x2, 0]].forEach((l, k) =>
        s.addShape(S.LINE, { x: l[0], y: l[1], w: l[2], h: l[3], line: { color: HEX.ink, width: 1.75 }, objectName: "section line " + k }));
      if (i === 2) s.addShape(S.LINE, { x: x1 + 0.25, y: g - 0.25, w: x2 - x1 - 0.1, h: 0, line: { color: HEX.ink, width: 1.75 }, objectName: "canopy" });
      person(s, (x1 + x2) / 2, g + dp, 1.7 * sc, HEX.slate, "user");
      en(s, cases[i][1], { x, y: y + 1.3, w: cw, h: 0.3, fontSize: 12, bold: true, color: HEX.mid, align: "center" });
      ar(s, cases[i][2], { x, y: y + 1.6, w: cw, h: 0.35, fontSize: 14, bold: true, color: HEX.ink, align: "center" });
    }
    const ex = [
      ["amph_forest", "Outdoor amphitheatre", "انخفاض في طبوغرافيا الموقع يصبح مسرحًا مفتوحًا."],
      ["amph_stone", "Classical theatre", "يحسّن خطوط الرؤية والإحساس بالاحتواء والجودة الصوتية."],
      ["steps_up", "Steps up — extrovert", "الصعود انفتاحي (Extrovert)؛ أما النزول فانطوائي (Introvert)."],
    ];
    for (let i = 0; i < 3; i++) {
      const x = W - M - cw - i * (cw + 0.35), y = 4.4;
      await photo(s, ex[i][0], x, y, 1.75, 1.55);
      en(s, ex[i][1], { x: x + 1.9, y, w: cw - 1.9, h: 0.5, fontSize: 12, bold: true, color: HEX.ink, align: "right" });
      ar(s, ex[i][2], { x: x + 1.9, y: y + 0.5, w: cw - 1.9, h: 1.1, fontSize: 13, color: HEX.slate });
    }
    en(s, "Images: Theory of Architecture — course reference", { x: M, y: 6.62, w: 6, h: 0.25, fontSize: 10, italic: true, color: HEX.gray, align: "left" });
    s.addNotes("من ملف المرجع: Depressed Base Plane — spatial & visual continuity. كلما زاد عمق الانخفاض قلّ اتصاله بالفراغ المحيط: يبقى جزءًا منه، ثم يصبح مميزًا، ثم ينفصل. المدرجات مثال كلاسيكي: الانخفاض يحسّن الرؤية والصوت والإحساس بالاحتواء. النزول للفراغ يعطي طابعًا انطوائيًا، والصعود طابعًا انفتاحيًا. مثال داخلي: الجلسة المنخفضة (Sunken living).");
  }

  // 13. WALL PLANE
  {
    const s = content("Space", "10 — WALL PLANE", "الجدار — المستوى الرأسي");
    // left: section diagram with person and wall heights
    const gx = M, gy = 6.2, sc = 2.05; // 1 m = sc inches (vertical)
    s.addShape(S.LINE, { x: gx, y: gy, w: 6.3, h: 0, line: { color: HEX.ink, width: 1.5 }, objectName: "ground" });
    person(s, gx + 0.45, gy, 1.7 * sc * 0.98, HEX.slate, "scale figure");
    s.addShape(S.LINE, { x: gx + 0.1, y: gy - 1.55 * sc, w: 6.1, h: 0, line: { color: HEX.terra, width: 1, dashType: "dash" }, objectName: "eye level" });
    en(s, "Eye level\n≈ 1.55 m", { x: gx + 5.62, y: gy - 1.55 * sc - 0.48, w: 0.85, h: 0.45, fontSize: 9, color: HEX.terra, align: "left" });
    const walls = [[0.6, "0.6 m"], [1.0, "1.0 m"], [1.6, "1.6 m"], [2.1, "2.1 m+"]];
    for (let i = 0; i < 4; i++) {
      const x = gx + 1.3 + i * 1.3, h = walls[i][0] * sc;
      s.addShape(S.RECTANGLE, { x, y: gy - h, w: 0.32, h, fill: { color: i === 3 ? HEX.teal : HEX.pale }, line: { color: HEX.ink, width: 0.75 }, objectName: "wall " + walls[i][1] });
      en(s, walls[i][1], { x: x - 0.3, y: gy + 0.05, w: 0.92, h: 0.25, fontSize: 11, bold: true, color: HEX.ink, align: "center" });
      en(s, String(i + 1), { x: x - 0.04, y: gy - h - 0.38, w: 0.4, h: 0.3, fontSize: 12, bold: true, color: HEX.terra, align: "center" });
    }
    const effects = [
      ["1", "عند مستوى الركبة: يحدد حافة المجال دون إحساس بالاحتواء."],
      ["2", "عند مستوى الخصر: يبدأ الاحتواء مع بقاء الاستمرارية البصرية."],
      ["3", "قرب مستوى العين: يبدأ في فصل فراغ عن آخر."],
      ["4", "أعلى من قامة الإنسان: يقطع الاستمرارية البصرية ويحتوي الفراغ بقوة."],
    ];
    const rx = 7.2, rw = W - M - rx;
    ar(s, "أثر ارتفاع الجدار بالنسبة لمستوى العين:", { x: rx, y: 1.65, w: rw, h: 0.4, fontSize: 15, bold: true, color: HEX.terra });
    for (let i = 0; i < 4; i++) {
      const y = 2.1 + i * 0.6;
      s.addShape(S.OVAL, { x: W - M - 0.4, y: y + 0.06, w: 0.4, h: 0.4, fill: { color: HEX.terra }, line: { type: "none" }, objectName: "marker " + (i + 1) });
      en(s, effects[i][0], { x: W - M - 0.4, y: y + 0.06, w: 0.4, h: 0.4, fontSize: 12, bold: true, color: HEX.white, align: "center", valign: "middle" });
      ar(s, effects[i][1], { x: rx, y: y + 0.03, w: rw - 0.55, h: 0.5, fontSize: 13, color: HEX.ink, valign: "middle" });
    }
    card(s, rx, 4.65, rw, 2.1, C.background2, "wall roles");
    ar(s, "يمكن للجدار أن:", { x: rx + 0.25, y: 4.75, w: rw - 0.5, h: 0.35, fontSize: 14, bold: true, color: HEX.teal });
    const roles = ["يحدد حدود الفراغ", "يفصل بين نشاطين", "يوجّه الحركة", "يصنع الخصوصية", "يخلق علاقة بصرية", "يحدد اتجاه الحركة"];
    for (let i = 0; i < 6; i++) {
      const cx = rx + rw - 0.25 - (i % 2 + 1) * ((rw - 0.6) / 2) - (i % 2) * 0.1, cy = 5.15 + Math.floor(i / 2) * 0.5;
      ar(s, [{ text: roles[i], options: { bullet: { code: "25A0" } } }], { x: cx, y: cy, w: (rw - 0.6) / 2, h: 0.42, fontSize: 13, color: HEX.ink, valign: "middle" });
    }
    s.addNotes("وظيفة الجدار ليست الفصل فقط. المرجع يوضح أن المستوى الرأسي يحدد مجالًا فراغيًا، وأن ارتفاعه بالنسبة لجسم الإنسان ومستوى العين يؤثر في مدى قدرته على وصف الفراغ بصريًا. الارتفاعات المعروضة تقريبية للتوضيح (Ching).");
  }

  // 13-A. VERTICAL ELEMENTS DEFINING SPACE
  {
    const s = content("Space", "10-A — VERTICAL ELEMENTS DEFINING SPACE", "تشكيلات المستويات الرأسية");
    const cfg = [
      ["Vertical linear elements", "عناصر خطية رأسية", "تحدد حواف حجم الفراغ.", "cols"],
      ["Single vertical plane", "مستوى رأسي منفرد", "يُبرز الفراغ الذي يواجهه.", "single"],
      ["L-shaped plane", "مستوى على شكل L", "يولّد فراغًا من الزاوية نحو الخارج قطريًا.", "L"],
      ["Parallel planes", "مستويان متوازيان", "فراغ محوري موجّه نحو الطرفين المفتوحين.", "par"],
      ["U-shaped plane", "مستوى على شكل U", "فراغ موجّه نحو الطرف المفتوح.", "U"],
      ["Closure — four planes", "الإغلاق الكامل", "فراغ منطوٍ تحدده المستويات من كل الجهات.", "box"],
    ];
    const gx = 4.05, cw = (W - M - gx - 2 * 0.25) / 3, ch = 2.45;
    for (let i = 0; i < 6; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const x = W - M - cw - col * (cw + 0.25), y = 1.7 + row * (ch + 0.25);
      card(s, x, y, cw, ch, C.background2, cfg[i][0]);
      const d = 1.05, dx = x + (cw - d) / 2, dy = y + 0.2, t = 0.1;
      s.addShape(S.RECTANGLE, { x: dx, y: dy, w: d, h: d, fill: { color: HEX.terra, transparency: 75 }, line: { color: HEX.gray, width: 0.5, dashType: "dash" }, objectName: "defined field" });
      const bar = (bx, by, bw, bh, k) => s.addShape(S.RECTANGLE, { x: bx, y: by, w: bw, h: bh, fill: { color: HEX.ink }, line: { type: "none" }, objectName: "plane " + k });
      const k = cfg[i][3];
      if (k === "cols") [[0, 0], [1, 0], [0, 1], [1, 1]].forEach((c, j) => bar(dx - 0.07 + c[0] * d, dy - 0.07 + c[1] * d, 0.14, 0.14, j));
      if (k === "single") bar(dx, dy - t, d, t, 0);
      if (k === "L") { bar(dx - t, dy - t, d + t, t, 0); bar(dx - t, dy, t, d, 1); }
      if (k === "par") { bar(dx, dy - t, d, t, 0); bar(dx, dy + d, d, t, 1); }
      if (k === "U") { bar(dx - t, dy - t, d + t, t, 0); bar(dx - t, dy, t, d, 1); bar(dx - t, dy + d, d + t, t, 2); }
      if (k === "box") { bar(dx - t, dy - t, d + 2 * t, t, 0); bar(dx - t, dy, t, d, 1); bar(dx - t, dy + d, d + 2 * t, t, 2); bar(dx + d, dy, t, d, 3); }
      en(s, cfg[i][0], { x: x + 0.15, y: y + 1.38, w: cw - 0.3, h: 0.28, fontSize: 11, bold: true, color: HEX.mid, align: "center" });
      ar(s, cfg[i][1], { x: x + 0.15, y: y + 1.65, w: cw - 0.3, h: 0.32, fontSize: 14, bold: true, color: HEX.ink, align: "center" });
      ar(s, cfg[i][2], { x: x + 0.15, y: y + 1.97, w: cw - 0.3, h: 0.45, fontSize: 12, color: HEX.slate, align: "center" });
    }
    // examples column
    const ex = [["stone_wall", "Single plane"], ["l_pavilion", "L-shaped plane"], ["corridor", "Parallel planes"]];
    const pw = gx - 0.3 - M, ph = 1.38;
    for (let i = 0; i < 3; i++) {
      const y = 1.7 + i * (ph + 0.42);
      await photo(s, ex[i][0], M, y, pw, ph);
      en(s, ex[i][1], { x: M, y: y + ph + 0.04, w: pw, h: 0.28, fontSize: 10, italic: true, color: HEX.mid, align: "right" });
    }
    s.addNotes("من ملف Theory of Architecture: العناصر الخطية الرأسية تحدد حواف حجم الفراغ؛ المستوى المنفرد يُبرز الفراغ الذي يواجهه؛ المستوى L يولّد فراغًا من مركزه نحو الخارج قطريًا؛ المستويان المتوازيان يحددان فراغًا موجّهًا محوريًا نحو الطرفين المفتوحين؛ مستوى U يحدد فراغًا موجهًا نحو الطرف المفتوح (مثل مطبخ U)؛ والإغلاق بأربعة مستويات يصنع فراغًا منطويًا. المنطقة المظللة في كل مخطط هي المجال الفراغي الذي يتحدد.");
  }

  // 14. OVERHEAD PLANE
  {
    const s = content("Space", "11 — CEILING / OVERHEAD PLANE", "السقف — المستوى العلوي");
    // section diagram (left)
    const gx = M, gy = 5.6, sc = 1.25, gw = 6.2;
    s.addShape(S.RECTANGLE, { x: gx, y: gy, w: gw, h: 0.12, fill: { color: HEX.ink }, line: { type: "none" }, objectName: "floor section" });
    s.addShape(S.RECTANGLE, { x: gx, y: gy - 3.2 * sc - 0.12, w: gw, h: 0.12, fill: { color: HEX.ink }, line: { type: "none" }, objectName: "slab section" });
    s.addShape(S.RECTANGLE, { x: gx, y: gy - 3.2 * sc - 0.12, w: 0.12, h: 3.2 * sc + 0.24, fill: { color: HEX.ink }, line: { type: "none" }, objectName: "wall section a" });
    s.addShape(S.RECTANGLE, { x: gx + gw - 0.12, y: gy - 3.2 * sc - 0.12, w: 0.12, h: 3.2 * sc + 0.24, fill: { color: HEX.ink }, line: { type: "none" }, objectName: "wall section b" });
    // lowered ceiling zone on right part
    s.addShape(S.RECTANGLE, { x: gx + gw * 0.55, y: gy - 2.5 * sc, w: gw * 0.45 - 0.12, h: 0.18, fill: { color: HEX.terra }, line: { type: "none" }, objectName: "lowered ceiling" });
    s.addShape(S.RECTANGLE, { x: gx + gw * 0.55, y: gy - 3.2 * sc, w: 0.06, h: 0.7 * sc, fill: { color: HEX.terra }, line: { type: "none" }, objectName: "drop edge" });
    // light cone under lowered ceiling
    poly(s, [[gx + gw * 0.77 - 0.1, gy - 2.5 * sc + 0.18], [gx + gw * 0.77 + 0.1, gy - 2.5 * sc + 0.18], [gx + gw * 0.77 + 0.9, gy - 0.9], [gx + gw * 0.77 - 0.9, gy - 0.9]], { fill: { color: HEX.ochre, transparency: 55 }, line: { type: "none" }, objectName: "light cone" });
    s.addShape(S.RECTANGLE, { x: gx + gw * 0.77 - 0.7, y: gy - 0.9, w: 1.4, h: 0.1, fill: { color: HEX.slate }, line: { type: "none" }, objectName: "table top" });
    s.addShape(S.RECTANGLE, { x: gx + gw * 0.77 - 0.05, y: gy - 0.8, w: 0.1, h: 0.8, fill: { color: HEX.slate }, line: { type: "none" }, objectName: "table leg" });
    person(s, gx + 1.3, gy, 1.7 * sc, HEX.slate, "figure a");
    person(s, gx + 2.4, gy, 1.7 * sc, HEX.gray, "figure b");
    en(s, "3.2 m", { x: gx + 0.2, y: gy - 3.2 * sc + 0.05, w: 0.8, h: 0.3, fontSize: 11, bold: true, color: HEX.mid });
    en(s, "2.5 m", { x: gx + gw * 0.55 + 0.15, y: gy - 2.5 * sc + 0.22, w: 0.8, h: 0.3, fontSize: 11, bold: true, color: HEX.terra });
    ar(s, "سقف مرتفع: اتساع ورسمية", { x: gx, y: gy + 0.2, w: gw * 0.5, h: 0.35, fontSize: 12, bold: true, color: HEX.mid, align: "center" });
    ar(s, "سقف منخفض: احتواء وتحديد", { x: gx + gw * 0.5, y: gy + 0.2, w: gw * 0.5, h: 0.35, fontSize: 12, bold: true, color: HEX.terra, align: "center" });
    // functions (right)
    const rx = 7.3, rw = W - M - rx;
    ar(s, "هنا تظهر أهمية التصميم الداخلي بوضوح؛ فالسقف يستطيع أن:", { x: rx, y: 1.65, w: rw, h: 0.7, fontSize: 15, color: HEX.slate });
    const f = [
      ["FaBullseye", "يحدد منطقة معينة"], ["FaUpDown", "يغير الإحساس بالارتفاع"], ["FaLightbulb", "يؤثر على الضوء"],
      ["FaVolumeHigh", "يؤثر على الصوت"], ["FaEye", "يوجه الانتباه"], ["FaObjectGroup", "يفرق بين مناطق مختلفة داخل الفراغ"],
    ];
    for (let i = 0; i < 6; i++) {
      const y = 2.45 + i * 0.68;
      await iconCircle(s, W - M - 0.55, y, 0.52, f[i][0], HEX.ochre, HEX.ink, "ceiling role " + (i + 1));
      ar(s, f[i][1], { x: rx, y: y + 0.02, w: rw - 0.75, h: 0.48, fontSize: 15, color: HEX.ink, valign: "middle" });
    }
    s.addNotes("المرجع يذكر أن مستوى السقف يمكن تعديله ورفعه أو خفضه وتغيير شكله ولونه وملمسه للمساعدة في تحديد المناطق وتحسين جودة الضوء والصوت والإحساس الاتجاهي. المقطع يوضح منطقة طعام تحت سقف منخفض مع إضاءة مركّزة.");
  }

  // 14-A. OVERHEAD PLANE — principles & examples
  {
    const s = content("Space", "11-A — OVERHEAD PLANE: PRINCIPLES", "المستوى العلوي: مبادئ وأمثلة");
    const rx = 6.9, rw = W - M - rx;
    const pts = [
      ["FaTree", "يشبه مظلة الشجرة؛ يمنح إحساسًا بالاحتواء."],
      ["FaArrowsUpDown", "يحدد مجالًا فراغيًا بينه وبين الأرضية."],
      ["FaVectorSquare", "حوافه ترسم حدود هذا المجال."],
      ["FaLayerGroup", "العناصر الرأسية وحواف السقف والأرضيات المرتفعة والمنخفضة تعزز حدود الحجم."],
      ["FaUmbrella", "سقف المبنى يوفر الحماية ويحدد هيئته العامة، ويعكس المواد والنظام الإنشائي."],
    ];
    for (let i = 0; i < pts.length; i++) {
      const y = 1.75 + i * 0.98;
      await iconCircle(s, W - M - 0.6, y + 0.08, 0.6, pts[i][0], HEX.ochre, HEX.ink, "overhead point " + (i + 1));
      ar(s, pts[i][1], { x: rx, y, w: rw - 0.8, h: 0.8, fontSize: 15, color: HEX.ink, valign: "middle" });
    }
    const ex = [["valencia", "Valencia Opera House, Spain"], ["salamanca", "Salamanca House, New Zealand"], ["munich", "Munich Olympic Stadium"]];
    await photo(s, ex[0][0], M, 1.75, 5.9, 2.75);
    en(s, ex[0][1], { x: M, y: 4.53, w: 5.9, h: 0.28, fontSize: 10, italic: true, color: HEX.mid, align: "right" });
    await photo(s, ex[1][0], M + 3.05, 4.95, 2.85, 1.55);
    en(s, ex[1][1], { x: M + 3.05, y: 6.52, w: 2.85, h: 0.28, fontSize: 10, italic: true, color: HEX.mid, align: "right" });
    await photo(s, ex[2][0], M, 4.95, 2.85, 1.55);
    en(s, ex[2][1], { x: M, y: 6.52, w: 2.85, h: 0.28, fontSize: 10, italic: true, color: HEX.mid, align: "right" });
    s.addNotes("من ملف Theory of Architecture: المستوى العلوي يشبه الشجرة، يعطي إحساسًا بالاحتواء ويحدد مجالًا بينه وبين الأرض، وحوافه تحدد حدود هذا المجال. العناصر الرأسية وحواف السقف والأرضيات المرتفعة والمنخفضة تساعد على تثبيت حدود الفراغ بصريًا. سقف المبنى يوفر الحماية ويحدد الهيئة العامة ويعبّر عن المواد والنظام الإنشائي (أوبرا فالنسيا، ملعب ميونخ الأولمبي).");
  }

  // 15. FLOOR + WALL + CEILING = SPACE
  {
    const s = content("Space", "12 — FLOOR + WALL + CEILING", "من العلاقة بين المستويات يتكوّن الفراغ");
    const blocks = [["BASE", "الأرضية", HEX.terra], ["VERTICAL", "الجدران", HEX.teal], ["OVERHEAD", "السقف", HEX.ochre]];
    const bw = 2.35, y = 2.1, gap = 0.75;
    for (let i = 0; i < 3; i++) {
      const x = W - M - bw - i * (bw + gap);
      s.addShape(S.ROUNDED_RECTANGLE, { x, y, w: bw, h: 1.6, rectRadius: 0.1, fill: { color: blocks[i][2] }, line: { type: "none" }, objectName: blocks[i][0] });
      en(s, blocks[i][0], { x, y: y + 0.35, w: bw, h: 0.5, fontSize: 22, bold: true, color: HEX.white, align: "center", charSpacing: 2 });
      ar(s, blocks[i][1], { x, y: y + 0.9, w: bw, h: 0.45, fontSize: 18, color: HEX.white, align: "center" });
      en(s, i < 2 ? "+" : "=", { x: x - gap, y: y + 0.45, w: gap, h: 0.7, fontSize: 34, bold: true, color: HEX.gray, align: "center", valign: "middle" });
    }
    const sx = M, sw = W - M - 3 * bw - 3 * gap - M;
    s.addShape(S.ROUNDED_RECTANGLE, { x: sx, y, w: sw, h: 1.6, rectRadius: 0.1, fill: { color: C.text1 }, line: { type: "none" }, objectName: "SPACE" });
    en(s, "SPACE", { x: sx, y: y + 0.3, w: sw, h: 0.6, fontSize: 30, bold: true, color: HEX.white, align: "center", charSpacing: 4 });
    ar(s, "الفراغ", { x: sx, y: y + 0.9, w: sw, h: 0.45, fontSize: 18, color: HEX.ochre, align: "center" });
    // assembled iso room
    const P = isoP(3.1, 4.95, 0.28);
    box(s, P, 0, 0, 0, 5, 5, 0.1, [HEX.terra, "9E4429", "B04F33"], { color: HEX.ink, width: 0.5 }, "base");
    poly(s, [P(0, 0, 0.1), P(5, 0, 0.1), P(5, 0, 3.0), P(0, 0, 3.0)], { fill: { color: HEX.teal }, line: { color: HEX.ink, width: 0.5 }, objectName: "wall a" });
    poly(s, [P(0, 0, 0.1), P(0, 5, 0.1), P(0, 5, 3.0), P(0, 0, 3.0)], { fill: { color: "4D8786" }, line: { color: HEX.ink, width: 0.5 }, objectName: "wall b" });
    poly(s, [P(0, 0, 3.0), P(5, 0, 3.0), P(5, 1.6, 3.0), P(0, 1.6, 3.0)], { fill: { color: HEX.ochre }, line: { color: HEX.ink, width: 0.5 }, objectName: "ceiling" });
    card(s, 6.2, 4.15, W - M - 6.2, 2.55, C.background2, "designer note");
    await iconCircle(s, W - M - 0.95, 4.4, 0.65, "FaLink", HEX.terra, HEX.white, "relationship");
    ar(s, "المصمم الداخلي لا يتعامل مع هذه العناصر كأشياء منفصلة؛", { x: 6.5, y: 4.45, w: W - M - 6.5 - 1.1, h: 0.6, fontSize: 16, color: HEX.slate });
    ar(s, "بل يتعامل مع العلاقة بينها لصناعة تجربة فراغية متكاملة.", { x: 6.5, y: 5.1, w: W - M - 6.8, h: 1.2, fontSize: 21, bold: true, color: HEX.ink });
    s.addNotes("اعرض صورة فراغ داخلي بسيط (من المرسم أو من الكتاب) وقل للطلاب: لدينا ثلاثة عناصر رئيسية: الأرضية والجدران والسقف، ومن العلاقة بينها يتكوّن الفراغ.");
  }

  // =====================================================================
  pres.addSection({ title: "Openings & Human" });
  // 16. OPENINGS
  {
    const s = content("Openings & Human", "13 — OPENINGS", "الفتحات");
    ar(s, "بعد أن حددنا الفراغ بالجدران نحتاج إلى فتحات: الأبواب · النوافذ · الفتحات. وموقع الفتحة في المستوى يغيّر طبيعة الفراغ:", { x: M, y: 1.6, w: CW, h: 0.7, fontSize: 15, color: HEX.slate });
    const t = [["Within Plane", "داخل المستوى", "تبدو الفتحة محاطة بالجدار وتحافظ على وضوحه."], ["At Corner", "عند الزاوية", "تُضعف حدود الزاوية وتوجّه الفراغ نحو الخارج."], ["Between Planes", "بين المستويات", "تفصل المستويات بصريًا وتُبرز استقلالها."]];
    const cw = 2.55;
    for (let i = 0; i < 3; i++) {
      const x = W - M - cw - i * (cw + 0.3), y = 2.45;
      card(s, x, y, cw, 2.75, C.background2, "opening " + t[i][0]);
      const ex = x + 0.35, ey = y + 0.3, ew = cw - 0.7, eh = 1.1;
      s.addShape(S.RECTANGLE, { x: ex, y: ey, w: ew, h: eh, fill: { color: HEX.pale }, line: { color: HEX.ink, width: 0.75 }, objectName: "wall elevation" });
      const op = i === 0 ? [ex + ew * 0.3, ey + eh * 0.25, ew * 0.4, eh * 0.5] : i === 1 ? [ex + ew * 0.72, ey + eh * 0.2, ew * 0.28, eh * 0.6] : [ex, ey, ew, eh * 0.18];
      s.addShape(S.RECTANGLE, { x: op[0], y: op[1], w: op[2], h: op[3], fill: { color: HEX.ochre }, line: { color: HEX.ink, width: 0.75 }, objectName: "opening" });
      en(s, t[i][0], { x, y: y + 1.5, w: cw, h: 0.35, fontSize: 13, bold: true, color: HEX.mid, align: "center" });
      ar(s, t[i][1], { x, y: y + 1.82, w: cw, h: 0.35, fontSize: 15, bold: true, color: HEX.ink, align: "center" });
      ar(s, t[i][2], { x: x + 0.15, y: y + 2.17, w: cw - 0.3, h: 0.55, fontSize: 12, color: HEX.slate, align: "center" });
    }
    // functions (left)
    const lx = M, lw = W - M - 3 * cw - 2 * 0.3 - 0.4 - M;
    s.addShape(S.RECTANGLE, { x: lx, y: 2.45, w: lw, h: 4.3, fill: { color: C.text1 }, line: { type: "none" }, objectName: "openings role panel" });
    ar(s, "النافذة ليست مجرد عنصر في الجدار؛ هي أداة للتحكم في:", { x: lx + 0.3, y: 2.6, w: lw - 0.6, h: 0.7, fontSize: 14, bold: true, color: HEX.white });
    const fn = [["FaSun", "Light", "الضوء"], ["FaEye", "View", "الرؤية"], ["FaWind", "Ventilation", "التهوية"], ["FaDoorOpen", "Connection", "الاتصال"]];
    for (let i = 0; i < 4; i++) {
      const col = i % 2, row = Math.floor(i / 2);
      const bw = (lw - 0.9) / 2, x = lx + 0.3 + (1 - col) * (bw + 0.3), y = 3.45 + row * 1.55;
      await iconCircle(s, x + bw / 2 - 0.35, y, 0.7, fn[i][0], HEX.ochre, HEX.ink, fn[i][1]);
      en(s, fn[i][1], { x, y: y + 0.78, w: bw, h: 0.3, fontSize: 13, bold: true, color: HEX.white, align: "center" });
      ar(s, fn[i][2], { x, y: y + 1.08, w: bw, h: 0.3, fontSize: 13, color: HEX.pale, align: "center" });
    }
    ar(s, "تحدد الفتحات أنماط الحركة، وتخلق علاقات بصرية بين الفراغات، وتؤثر على الاستمرارية البصرية والفراغية.", { x: W - M - 3 * cw - 0.6, y: 5.4, w: 3 * cw + 0.6, h: 1.0, fontSize: 15, bold: true, color: HEX.teal });
    s.addNotes("المرجع يوضح أن الفتحات تؤثر على الاستمرارية البصرية والفراغية، وأنها تحدد أنماط الحركة وتسمح بدخول الضوء وتوفر الرؤية والتهوية وتخلق علاقات بصرية بين الفراغات. التصنيف (داخل المستوى/عند الزاوية/بين المستويات) من Ching.");
  }

  // 17. HUMAN & SPACE
  {
    const s = content("Openings & Human", "14 — HUMAN & SPACE", "الإنسان والفراغ");
    ar(s, "لا نصمم الفراغ ليكون جميلًا في صورة؛ نحن نصممه لكي يُستخدم.", { x: M, y: 1.6, w: CW, h: 0.45, fontSize: 18, bold: true, color: HEX.terra });
    const f = [["FaRulerVertical", "Human Scale", "مقياس الإنسان"], ["FaPersonWalking", "Movement", "الحركة"], ["FaCouch", "Comfort", "الراحة"], ["FaGears", "Function", "الوظيفة"], ["FaUserShield", "Privacy", "الخصوصية"]];
    const cw = (CW - 4 * 0.3) / 5;
    for (let i = 0; i < 5; i++) {
      const x = W - M - cw - i * (cw + 0.3), y = 2.25;
      card(s, x, y, cw, 2.05, C.background2, f[i][1]);
      await iconCircle(s, x + cw / 2 - 0.42, y + 0.25, 0.84, f[i][0], HEX.teal, HEX.white, f[i][1]);
      en(s, f[i][1], { x, y: y + 1.2, w: cw, h: 0.35, fontSize: 15, bold: true, color: HEX.ink, align: "center" });
      ar(s, f[i][2], { x, y: y + 1.55, w: cw, h: 0.35, fontSize: 14, color: HEX.terra, align: "center" });
    }
    // anthropometric reference strip
    s.addShape(S.RECTANGLE, { x: M, y: 4.6, w: CW, h: 2.15, fill: { color: C.text1 }, line: { type: "none" }, objectName: "anthropometrics panel" });
    ar(s, "أرقام مرجعية تقريبية لمقياس الإنسان (للاستخدام في المرسم):", { x: M + 0.3, y: 4.72, w: CW - 0.6, h: 0.4, fontSize: 15, bold: true, color: HEX.ochre });
    const d = [["90 cm", "عرض ممر لشخص واحد"], ["120–150 cm", "ممر لشخصين متقابلين"], ["≈ 155 cm", "مستوى العين (وقوفًا)"], ["40–45 cm", "ارتفاع مقعد الجلوس"], ["≈ 75 cm", "ارتفاع طاولة الطعام/المكتب"]];
    const dw = (CW - 0.6) / 5;
    for (let i = 0; i < 5; i++) {
      const x = W - M - 0.3 - dw - i * dw;
      en(s, d[i][0], { x, y: 5.25, w: dw, h: 0.6, fontSize: 24, bold: true, color: HEX.white, align: "center" });
      ar(s, d[i][1], { x: x + 0.1, y: 5.9, w: dw - 0.2, h: 0.6, fontSize: 13, color: HEX.pale, align: "center" });
    }
    s.addNotes("أهم عنصر هو الإنسان. الأرقام المرجعية تقريبية مأخوذة من مراجع المقاييس الإنسانية (Neufert / Panero & Zelnik: Human Dimension & Interior Space) وستُفصّل لاحقًا في محاضرة الأبعاد الإنسانية.");
  }

  // 18. LIVING ROOM EXAMPLE
  {
    const s = content("Openings & Human", "15 — A SIMPLE EXAMPLE: LIVING ROOM", "مثال: أين أضع الكنبة؟");
    // plan drawing (left)
    const px = M + 0.2, py = 1.85, pw = 5.6, ph = 4.6, t = 0.14;
    s.addShape(S.RECTANGLE, { x: px, y: py, w: pw, h: ph, fill: { color: "FAFAFA" }, line: { color: HEX.ink, width: 4 }, objectName: "room outline" });
    // door gap bottom-left + swing
    s.addShape(S.RECTANGLE, { x: px + 0.5, y: py + ph - 0.06, w: 0.95, h: 0.12, fill: { color: "FAFAFA" }, line: { type: "none" }, objectName: "door gap" });
    s.addShape(S.LINE, { x: px + 0.5, y: py + ph - 0.95, w: 0, h: 0.95, line: { color: HEX.ink, width: 1.25 }, objectName: "door leaf" });
    s.addShape(S.ARC, { x: px + 0.5 - 0.95, y: py + ph - 0.95, w: 1.9, h: 1.9, angleRange: [270, 0], line: { color: HEX.gray, width: 0.75, dashType: "dash" }, fill: { type: "none" }, objectName: "door swing" });
    // window top
    s.addShape(S.RECTANGLE, { x: px + 1.6, y: py - 0.06, w: 2.4, h: 0.12, fill: { color: HEX.ochre }, line: { color: HEX.ink, width: 0.75 }, objectName: "window" });
    // tv unit right wall
    s.addShape(S.RECTANGLE, { x: px + pw - 0.45, y: py + 1.4, w: 0.3, h: 1.7, fill: { color: HEX.slate }, line: { type: "none" }, objectName: "tv unit" });
    // sofa facing tv
    s.addShape(S.ROUNDED_RECTANGLE, { x: px + 1.7, y: py + 1.15, w: 0.75, h: 2.2, rectRadius: 0.08, fill: { color: HEX.teal }, line: { type: "none" }, objectName: "sofa" });
    s.addShape(S.ROUNDED_RECTANGLE, { x: px + 3.05, y: py + 1.65, w: 0.9, h: 1.2, rectRadius: 0.06, fill: { color: HEX.pale }, line: { color: HEX.mid, width: 0.5 }, objectName: "coffee table" });
    s.addShape(S.ROUNDED_RECTANGLE, { x: px + 3.0, y: py + 0.35, w: 0.95, h: 0.75, rectRadius: 0.08, fill: { color: "4D8786" }, line: { type: "none" }, objectName: "armchair" });
    s.addShape(S.ROUNDED_RECTANGLE, { x: px + 0.35, y: py + 0.35, w: 1.0, h: 1.0, rectRadius: 0.5, fill: { color: HEX.stone }, line: { color: HEX.gray, width: 0.5 }, objectName: "plant" });
    // circulation path
    s.addShape(S.LINE, { x: px + 0.97, y: py + 3.75, w: 0, h: 0.75, line: { color: HEX.terra, width: 2.25, dashType: "dash", beginArrowType: "triangle" }, flipV: false, objectName: "path in" });
    s.addShape(S.LINE, { x: px + 0.97, y: py + 3.75, w: 3.6, h: 0, line: { color: HEX.terra, width: 2.25, dashType: "dash", endArrowType: "triangle" }, objectName: "path across" });
    // focal marker on tv
    s.addShape(S.OVAL, { x: px + pw - 0.95, y: py + 2.0, w: 0.4, h: 0.4, fill: { color: HEX.ochre }, line: { color: HEX.white, width: 1 }, objectName: "focal point" });
    // numbered tags
    const tags = [[px + 0.75, py + ph + 0.12, "1"], [px + 2.4, py + 3.55, "3"], [px + pw - 0.85, py + 2.55, "4"], [px + 2.7, py - 0.48, "7"]];
    tags.forEach((tg, i) => {
      s.addShape(S.OVAL, { x: tg[0], y: tg[1], w: 0.36, h: 0.36, fill: { color: HEX.ink }, line: { type: "none" }, objectName: "plan tag " + tg[2] });
      en(s, tg[2], { x: tg[0], y: tg[1], w: 0.36, h: 0.36, fontSize: 11, bold: true, color: HEX.white, align: "center", valign: "middle" });
    });
    en(s, "Living Room — Plan (schematic)", { x: px, y: py + ph + 0.15, w: pw, h: 0.3, fontSize: 10, italic: true, color: HEX.mid, align: "right" });
    // questions right
    const rx = 6.85, rw = W - M - rx;
    ar(s, [{ text: "هل أضع الكنبة هنا لأنها أجمل؟ ", options: { color: HEX.ink } }, { text: "لا", options: { color: HEX.terra, bold: true } }], { x: rx, y: 1.7, w: rw, h: 0.45, fontSize: 18, bold: true });
    ar(s, "أسأل أولًا:", { x: rx, y: 2.15, w: rw, h: 0.35, fontSize: 14, color: HEX.slate });
    const q = ["أين المدخل؟", "كيف يدخل المستخدم؟", "أين مسار الحركة؟", "أين التلفزيون؟ أين نقطة التركيز؟", "هل هناك مساحة كافية للحركة؟", "هل الأثاث مناسب للمقياس؟", "هل هناك علاقة جيدة مع النافذة؟"];
    for (let i = 0; i < q.length; i++) {
      const y = 2.55 + i * 0.5;
      s.addShape(S.OVAL, { x: W - M - 0.36, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: [0, 2, 3, 6].includes(i) ? HEX.ink : HEX.pale }, line: { type: "none" }, objectName: "q tag " + (i + 1) });
      en(s, String(i + 1), { x: W - M - 0.36, y: y + 0.05, w: 0.36, h: 0.36, fontSize: 11, bold: true, color: HEX.white, align: "center", valign: "middle" });
      ar(s, q[i], { x: rx, y: y + 0.03, w: rw - 0.5, h: 0.4, fontSize: 14, color: HEX.ink, valign: "middle" });
    }
    s.addShape(S.RECTANGLE, { x: rx, y: 6.15, w: rw, h: 0.6, fill: { color: C.background2 }, line: { type: "none" }, objectName: "then form" });
    ar(s, "ثم يأتي الشكل والجمال.", { x: rx + 0.2, y: 6.15, w: rw - 0.4, h: 0.6, fontSize: 17, bold: true, color: HEX.teal, valign: "middle" });
    s.addNotes("اعرض مخطط غرفة معيشة واسأل: هل أضع الكنبة هنا لأنها أجمل؟ لا. ناقش الأسئلة واحدًا تلو الآخر على المخطط: المدخل (1)، مسار الحركة (3)، نقطة التركيز (4)، النافذة (7). الكنبة وُضعت لتواجه نقطة التركيز دون أن تقطع مسار الحركة.");
  }

  // =====================================================================
  pres.addSection({ title: "Synthesis & Exercise" });
  // 19. FUNDAMENTAL IDEA (dark)
  {
    const s = pres.addSlide({ masterName: "Section Dark", sectionTitle: "Synthesis & Exercise" });
    en(s, "16 — THE FUNDAMENTAL IDEA", { x: M, y: 0.6, w: CW, h: 0.4, fontSize: 14, bold: true, color: HEX.terra, align: "right" });
    ar(s, "العقلية التي نبدأ بها المادة", { x: M, y: 1.05, w: CW, h: 0.7, fontSize: 30, bold: true, color: HEX.white });
    const st = [["FUNCTION", "ماذا يحدث؟", HEX.terra], ["SPACE", "كيف ننظم الفراغ؟", HEX.teal], ["EXPERIENCE", "كيف سيشعر ويتحرك المستخدم؟", HEX.ochre], ["FORM", "كيف سيظهر الفراغ؟", HEX.pale]];
    const bw = 2.6, gap = 0.55, total = 4 * bw + 3 * gap, x0 = (W - total) / 2;
    for (let i = 0; i < 4; i++) {
      const x = x0 + i * (bw + gap), y = 2.45;
      s.addShape(S.OVAL, { x: x + bw / 2 - 0.35, y, w: 0.7, h: 0.7, fill: { color: st[i][2] }, line: { type: "none" }, objectName: st[i][0] + " number" });
      en(s, String(i + 1), { x: x + bw / 2 - 0.35, y, w: 0.7, h: 0.7, fontSize: 20, bold: true, color: HEX.ink, align: "center", valign: "middle" });
      en(s, st[i][0], { x, y: y + 0.95, w: bw, h: 0.6, fontSize: 24, bold: true, color: st[i][2], align: "center", charSpacing: 2 });
      ar(s, st[i][1], { x, y: y + 1.6, w: bw, h: 0.8, fontSize: 16, color: HEX.white, align: "center" });
      if (i < 3) arrowR(s, x + bw + 0.08, y + 1.25, gap - 0.16, HEX.mid, "flow arrow " + (i + 1));
    }
    s.addShape(S.LINE, { x: x0, y: 5.25, w: total, h: 0, line: { color: HEX.slate, width: 0.75 }, objectName: "rule" });
    ar(s, "الشكل نتيجة، وليس نقطة البداية.", { x: M, y: 5.5, w: CW, h: 0.6, fontSize: 24, bold: true, color: HEX.white, align: "center" });
    en(s, "Form follows the function, the space and the experience.", { x: M, y: 6.1, w: CW, h: 0.4, fontSize: 14, italic: true, color: HEX.gray, align: "center" });
    s.addNotes("اكتب هذه الجملة وحدها على الشاشة: FUNCTION → SPACE → EXPERIENCE → FORM. ثم اشرح كل خطوة. هذه هي العقلية التي نريد أن يبدأ بها الطالب المادة. لاحظ أن الترتيب هنا يُقرأ باللغة الإنجليزية من اليسار إلى اليمين.");
  }

  // 20. EXERCISE
  {
    const s = content("Synthesis & Exercise", "17 — EXERCISE 01: READ A SPACE", "تمرين المحاضرة الأولى: اقرأ فراغًا");
    ar(s, "كل طالب يختار غرفة واحدة ويعمل تحليلًا بسيطًا لها:", { x: 5.0, y: 1.6, w: W - M - 5.0, h: 0.4, fontSize: 15, color: HEX.slate });
    const rooms = ["Bedroom", "Living Room", "Classroom", "Office"];
    rooms.forEach((r, i) => {
      const x = W - M - 1.75 - i * 1.85;
      s.addShape(S.ROUNDED_RECTANGLE, { x, y: 2.05, w: 1.75, h: 0.42, rectRadius: 0.2, fill: { color: C.background2 }, line: { color: HEX.pale, width: 0.75 }, objectName: "room option " + r });
      en(s, r, { x, y: 2.05, w: 1.75, h: 0.42, fontSize: 12, bold: true, color: HEX.teal, align: "center", valign: "middle" });
    });
    const steps = [["Base Plane", "حدّد الأرضية"], ["Vertical Planes", "حدّد الجدران"], ["Overhead Plane", "حدّد السقف"], ["Openings", "حدّد الفتحات"], ["Circulation", "حدّد مسار الحركة"], ["Function", "حدّد الوظيفة"]];
    const cw = 2.45, ch = 1.35;
    for (let i = 0; i < 6; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const x = W - M - cw - col * (cw + 0.3), y = 2.75 + row * (ch + 0.3);
      card(s, x, y, cw, ch, C.background2, "step " + (i + 1));
      en(s, String(i + 1).padStart(2, "0"), { x: x + cw - 0.85, y: y + 0.18, w: 0.7, h: 0.45, fontSize: 22, bold: true, color: HEX.terra, align: "right" });
      en(s, steps[i][0], { x: x + 0.2, y: y + 0.25, w: cw - 1.05, h: 0.35, fontSize: 13, bold: true, color: HEX.ink, align: "left" });
      ar(s, steps[i][1], { x: x + 0.2, y: y + 0.75, w: cw - 0.4, h: 0.4, fontSize: 15, color: HEX.slate });
    }
    // question + deliverable (left)
    const lx = M, lw = W - M - 3 * cw - 2 * 0.3 - 0.4 - M;
    s.addShape(S.RECTANGLE, { x: lx, y: 1.65, w: lw, h: 2.3, fill: { color: C.text1 }, line: { type: "none" }, objectName: "question panel" });
    ar(s, "ثم يكتب سؤالًا واحدًا:", { x: lx + 0.3, y: 1.8, w: lw - 0.6, h: 0.35, fontSize: 13, color: HEX.pale });
    en(s, "What makes this space work?", { x: lx + 0.3, y: 2.2, w: lw - 0.6, h: 1.0, fontSize: 22, bold: true, color: HEX.white, align: "right" });
    ar(s, "ما الذي يجعل هذا الفراغ يعمل؟", { x: lx + 0.3, y: 3.25, w: lw - 0.6, h: 0.4, fontSize: 14, color: HEX.ochre });
    card(s, lx, 4.15, lw, 2.6, C.background2, "deliverable");
    ar(s, "المُخرَج المقترح", { x: lx + 0.3, y: 4.25, w: lw - 0.6, h: 0.35, fontSize: 14, bold: true, color: HEX.terra });
    ar(s, [
      { text: "لوحة A3 واحدة", options: { bullet: { code: "25A0" }, breakLine: true } },
      { text: "مخطط يدوي مع صورة أو اسكتش", options: { bullet: { code: "25A0" }, breakLine: true } },
      { text: "ترميز لوني للمستويات والفتحات والحركة", options: { bullet: { code: "25A0" }, breakLine: true } },
      { text: "فقرة قصيرة تجيب عن السؤال", options: { bullet: { code: "25A0" } } },
    ], { x: lx + 0.3, y: 4.65, w: lw - 0.6, h: 2.0, fontSize: 13, color: HEX.ink, paraSpaceAfter: 5 });
    s.addNotes("لا تترك الطلاب يجلسون ساعة ونصف يستمعون. التمرين يبدأ داخل المرسم ويُستكمل للمحاضرة القادمة. المُخرَج (لوحة A3 وترميز لوني) مقترح ويمكن تعديله حسب سياسة المرسم. استخدم نفس ألوان المحاضرة: الأرضية بالتيراكوتا، الجدران بالأخضر المزرق، السقف بالأصفر.");
  }

  // 21. KEY TAKEAWAYS
  {
    const s = content("Synthesis & Exercise", "KEY TAKEAWAYS", "خلاصة المحاضرة");
    const k = [
      ["FaLightbulb", "التصميم عملية اتخاذ قرارات منظمة، وليس رسم شكل جميل."],
      ["FaUser", "التصميم الداخلي = إنسان + وظيفة + فراغ + تجربة"],
      ["FaCouch", "الديكور يغيّر المظهر؛ التصميم الداخلي يشكّل الفراغ والتجربة."],
      ["FaCubes", "نحن نصمم الفراغ، والفراغ يتحدد بما يحدث داخله."],
      ["FaLayerGroup", "الأرضية والجدار والسقف والفتحات أدوات لتشكيل الفراغ."],
      ["FaArrowRight", "الوظيفة ← الفراغ ← التجربة ← الشكل"],
    ];
    const cw = (CW - 0.4) / 2, ch = 1.4;
    for (let i = 0; i < 6; i++) {
      const col = i % 2, row = Math.floor(i / 2);
      const x = W - M - cw - col * (cw + 0.4), y = 1.75 + row * (ch + 0.3);
      card(s, x, y, cw, ch, C.background2, "takeaway " + (i + 1));
      await iconCircle(s, x + cw - 1.05, y + 0.32, 0.76, k[i][0], i === 5 ? HEX.terra : HEX.teal, HEX.white, "takeaway " + (i + 1));
      ar(s, k[i][1], { x: x + 0.3, y, w: cw - 1.55, h: ch, fontSize: 16, bold: true, color: HEX.ink, valign: "middle" });
    }
    s.addNotes("راجع الأفكار الست بسرعة مع الطلاب واطلب من أحدهم صياغة كل فكرة بكلماته.");
  }

  // 22. CLOSING
  {
    const s = pres.addSlide({ masterName: "Section Dark", sectionTitle: "Synthesis & Exercise" });
    s.addImage({ data: await icon("FaQuoteRight", HEX.terra), x: W / 2 - 0.4, y: 1.0, w: 0.8, h: 0.8, altText: "quote", objectName: "quote mark" });
    ar(s, "«قبل أن نتعلم كيف نجمّل الفراغ، يجب أن نتعلم كيف نفهمه.»", { x: 1.2, y: 2.0, w: W - 2.4, h: 1.5, fontSize: 36, bold: true, color: HEX.white, align: "center", valign: "middle" });
    en(s, "Before we learn how to beautify a space, we must learn how to understand it.", { x: 1.2, y: 3.5, w: W - 2.4, h: 0.5, fontSize: 16, italic: true, color: HEX.gray, align: "center" });
    card(s, 2.2, 4.55, W - 4.4, 1.85, HEX.slate, "next lecture", false);
    ar(s, "المحاضرات القادمة", { x: 2.5, y: 4.7, w: W - 5.0, h: 0.4, fontSize: 15, bold: true, color: HEX.ochre, align: "center" });
    ar(s, "نبدأ بتفكيك الفراغ إلى عناصره الأساسية، ونرى كيف تتحول هذه العناصر البسيطة إلى فراغات معمارية وداخلية حقيقية.", { x: 2.5, y: 5.1, w: W - 5.0, h: 0.75, fontSize: 15, color: HEX.white, align: "center" });
    en(s, "POINT  ·  LINE  ·  PLANE  ·  VOLUME", { x: 2.5, y: 5.85, w: W - 5.0, h: 0.4, fontSize: 16, bold: true, color: HEX.terra, align: "center", charSpacing: 3 });
    s.addNotes("أنهِ المحاضرة بهذه الجملة: قبل أن نتعلم كيف نجمّل الفراغ، يجب أن نتعلم كيف نفهمه. ثم أخبرهم أن المحاضرات القادمة ستبدأ بتفكيك الفراغ إلى عناصره الأساسية: Point, Line, Plane & Volume.");
  }

  // 23. REFERENCES
  {
    const s = content("Synthesis & Exercise", "REFERENCES", "المراجع");
    const refs = [
      "Ching, F. D. K. (2015). Architecture: Form, Space, and Order (4th ed.). Hoboken, NJ: Wiley.  — Course reference: Theory of Architecture",
      "Ching, F. D. K., & Binggeli, C. (2018). Interior Design Illustrated (4th ed.). Hoboken, NJ: Wiley.",
      "Pile, J. F., & Gura, J. (2014). A History of Interior Design (4th ed.). London: Laurence King.",
      "Panero, J., & Zelnik, M. (1979). Human Dimension & Interior Space. New York: Whitney Library of Design.",
      "Neufert, E., & Neufert, P. (2019). Architects' Data (5th ed.). Chichester: Wiley-Blackwell.",
      "Theory of Architecture — course lecture notes (SRM University). Source of example images.",
    ];
    await iconCircle(s, W - M - 0.8, 1.8, 0.8, "FaBookOpen", HEX.teal, HEX.white, "references");
    en(s, refs.map((r, i) => ({ text: r, options: { bullet: { type: "number" }, breakLine: i < refs.length - 1 } })), { x: M, y: 1.8, w: CW - 1.2, h: 4.2, fontSize: 16, color: HEX.ink, paraSpaceAfter: 14, align: "left", rtlMode: false });
    ar(s, "المخططات رُسمت توضيحيًا اعتمادًا على مفاهيم المرجع؛ والصور التوضيحية مأخوذة من ملف المادة.", { x: M, y: 6.3, w: CW, h: 0.4, fontSize: 12, italic: true, color: HEX.mid });
    s.addNotes("المرجع الأساسي للمادة هو Ching: Architecture: Form, Space, and Order. بقية المراجع للاستزادة.");
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  // theme: make complex-script (Arabic) fonts Times New Roman too
  const JSZip = require("jszip");
  const fs = require("fs");
  const zip = await JSZip.loadAsync(fs.readFileSync(OUT));
  const tp = "ppt/theme/theme1.xml";
  let t = await zip.file(tp).async("string");
  t = t.replace(/<a:cs typeface="[^"]*"/g, '<a:cs typeface="Times New Roman"').replace(/script="Arab" typeface="[^"]*"/g, 'script="Arab" typeface="Times New Roman"');
  zip.file(tp, t);
  fs.writeFileSync(OUT, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
  console.log("wrote", OUT);
})().catch(e => { console.error(e); process.exit(1); });
