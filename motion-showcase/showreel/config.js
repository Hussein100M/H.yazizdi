// Everything editable lives here. Re-render after changing anything.
window.CFG = {
  accent: '#E8642C',

  // Personal brand (no logo yet: the wordmark is used)
  brand: {
    name: 'H.yazidi',
    logo: null,                      // e.g. 'assets/logo.png' (shown above the name when set)
    role_ar: 'مصمم موشن جرافيك',
    role_en: 'MOTION DESIGNER',
  },

  // PLACEHOLDERS: replace with real contact details before publishing
  contact: {
    email: 'email@example.com',
    phone: '+000 000 000 000',
    social: '@username',
  },

  // Asset slots. null = illustrative drawing. Set a path (jpg/png) to use your own render/photo.
  assets: {
    hero: null,       // exterior render, portrait or landscape
    interior: null,   // interior render
    site: null,       // construction-site photo (BEFORE)
    after: null,      // finished render of the same project (AFTER); falls back to hero
  },

  text: {
    hook_l1: 'مشاريعك تستاهل',
    hook_l2: ['أكثر', 'من', 'عرض', 'ثابت.'],
    hook_en: 'YOUR PROJECTS DESERVE MORE THAN STATIC PRESENTATIONS',
    kicker_ar: 'موشن جرافيك للمشاريع الهندسية والمعمارية',
    kicker_en: 'MOTION GRAPHICS FOR ARCHITECTURE & ENGINEERING',

    chapters: [
      ['فيديو ترويجي للمشروع', 'PROJECT PROMO FILM'],
      ['عرض الماستر بلان', 'MASTERPLAN PRESENTATION'],
      ['إنفوجرافيك هندسي', 'ENGINEERING INFOGRAPHICS'],
      ['توثيق مراحل التنفيذ', 'CONSTRUCTION PROGRESS'],
    ],

    // sample project (placeholder copy)
    project_ar: 'اسم مشروعك',
    project_en: 'YOUR PROJECT NAME',
    project_sub: 'الموقع · نوع المشروع',
    callouts: [['سطح أخضر', 'ROOF GARDEN'], ['واجهة زجاجية', 'GLASS FAÇADE']],
    interior: ['تصاميم داخلية', 'INTERIOR SPACES'],

    zones: [['سكني', 'RESIDENTIAL'], ['تجاري', 'COMMERCIAL'], ['مساحات خضراء', 'GREEN AREAS']],
    entrance: ['المدخل الرئيسي', 'MAIN ENTRANCE'],
    pin: ['اسم المشروع', '18,500 m²'],

    plan: ['مخطط الدور الأرضي', 'GROUND FLOOR PLAN'],
    room: 'الصالة · 42 m²',
    stats: [[12, '', 'طابق', 'FLOORS'], [48, '', 'وحدة سكنية', 'UNITS'], [18500, ' m²', 'مساحة البناء', 'BUILT-UP AREA']],

    progress: ['نسبة الإنجاز', 'PROGRESS'],
    stages: [['الأساسات', 'FOUNDATION'], ['الهيكل', 'STRUCTURE'], ['الواجهات', 'FAÇADE'], ['التسليم', 'HANDOVER']],
    before_after: [['قبل', 'BEFORE'], ['بعد', 'AFTER']],

    recap: ['فيديو ترويجي', 'ماستر بلان', 'إنفوجرافيك', 'مراحل التنفيذ'],
    headline_l1: 'مشاريعك…',
    headline_l2: ['بلغة', 'الحركة'],
    headline_en: 'YOUR PROJECTS. IN MOTION.',
    statement_ar: ['أحوّل مشاريعك الهندسية والمعمارية', 'إلى تجربة بصرية'],
    statement_en: 'TURNING ENGINEERING & ARCHITECTURAL PROJECTS INTO VISUAL EXPERIENCES',
    cta_ar: 'خلّنا نحرّك مشروعك الجاي',
    cta_en: "LET'S BRING YOUR NEXT PROJECT TO LIFE",
  },
};
