/* =====================================================================
   I18N — English / Arabic

   HOW IT WORKS
   The English copy in the HTML stays the source of truth. Nothing in the
   markup is tagged with translation keys; the dictionary below is keyed
   on the English itself, exactly as it appears in the file, inline
   <span> and <em> included, with whitespace collapsed.

   That is deliberate for a site this size. Tagging every element with
   data-i18n means editing ten HTML files and keeping two sets of ids in
   sync forever. Keying on the English leaves the markup untouched, and a
   string with no translation simply stays English, which is visible and
   harmless, rather than rendering a raw key.

   The cost: editing an English sentence orphans its translation, which
   then falls back to English. If you reword English copy, update the
   matching key here.

   Elements are translated whole rather than per text node. Arabic word
   order is not English word order, so translating the three fragments of
   "Built for the <span>night</span> you're planning" separately would
   reassemble into nonsense. The <span> lives inside the Arabic string.

   NOT TRANSLATED, on purpose:
   terms, privacy, the contract and the invoice. Those are legal and
   financial documents; a machine translation of them could be read as
   binding and disagree with the English. They stay English in both
   languages, and the documents stay left to right.
   ===================================================================== */

const LANG_KEY = "lang";

/* Arabic needs a face with Arabic glyphs; the two Latin display fonts
   have none and would fall back to whatever the OS supplies. Loaded on
   demand, so English visitors never pay for it. */
const AR_FONT = "https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap";

/* ---------------------------------------------------------------------
   ELEMENT TEXT — keys are English innerHTML, whitespace collapsed
   --------------------------------------------------------------------- */
const AR = {
  /* ---- shell: nav, header, footer ---- */
  "Home": "الرئيسية",
  "About": "نبذة عني",
  "Gallery": "الصور",
  "Reviews": "التقييمات",
  "Booking": "الحجز",
  "Contact": "تواصل معي",
  "Book Me": "احجزني",
  "Book a date": "احجز موعدك",
  "Explore": "تصفح",
  "Get in touch": "للتواصل",
  "Email": "البريد الإلكتروني",
  "Phone": "الهاتف",
  "WhatsApp": "واتساب",
  "Message me": "راسلني",
  "Follow": "تابعني",
  "Booking Agreement": "اتفاقية الحجز",
  "Booking agreement": "اتفاقية الحجز",
  "Open the agreement": "افتح الاتفاقية",
  "Fill in your details, sign it with your name, and download the finished agreement as a PDF. You can send me a copy in one click at the end, so we both have the same thing in writing: dates, times, what is included and what it costs.":
    "املأ بياناتك، ووقّع باسمك، ثم نزّل الاتفاقية النهائية بصيغة PDF. ويمكنك إرسال نسخة لي بنقرة واحدة في النهاية، ليكون لدينا الاتفاق نفسه مكتوباً: التواريخ والأوقات وما يشمله السعر وتكلفته.",
  "Terms and Conditions": "الشروط والأحكام",
  "Privacy Policy": "سياسة الخصوصية",
  "All rights reserved.": "جميع الحقوق محفوظة.",
  "Calgary, AB": "كالغاري، ألبرتا",
  "Open-format DJ · Calgary, AB": "دي جيه بجميع الأنماط · كالغاري، ألبرتا",

  /* ---- marquee strip + hero scroll cue ---- */
  "Back": "رجوع",
  "Back to the form": "العودة إلى النموذج",
  "Scroll": "مرّر",
  "Nightclubs": "النوادي الليلية",
  "Birthdays": "أعياد الميلاد",
  "Private Events": "مناسبات خاصة",
  "Open Format": "جميع الأنماط",
  "Arabic": "عربي",
  "Hip-Hop": "هيب هوب",
  "House": "هاوس",
  "Afrobeats": "أفروبيتس",
  "Top 40": "الأغاني الرائجة",

  /* ---- contact info rows ---- */
  "Call or text": "اتصال أو رسالة",
  "Based in": "المقر",
  "Response time": "وقت الرد",
  "<span>Based in</span> Calgary, AB, available across Alberta":
    "<span>المقر</span> كالغاري، ألبرتا، وأعمل في جميع أنحاء المقاطعة",
  "<span>Response time</span> Usually same day, always within 48 hours":
    "<span>وقت الرد</span> في نفس اليوم غالباً، وخلال ٤٨ ساعة دائماً",

  /* ---- breadcrumbs ---- */
  '<a href="index.html">Home</a> / About': '<a href="index.html">الرئيسية</a> / نبذة عني',
  '<a href="index.html">Home</a> / Contact': '<a href="index.html">الرئيسية</a> / تواصل معي',
  '<a href="index.html">Home</a> / Gallery': '<a href="index.html">الرئيسية</a> / الصور',
  '<a href="index.html">Home</a> / Reviews': '<a href="index.html">الرئيسية</a> / التقييمات',
  '<a href="index.html">Home</a> / Booking': '<a href="index.html">الرئيسية</a> / الحجز',

  /* ---- home ---- */
  "Calgary, Alberta": "كالغاري، ألبرتا",
  '<span>I don\'t play</span> <span>a set,</span> <span>I play <em class="accent" style="font-style:normal">your room</em></span>':
    '<span>لا أشغّل</span> <span>قائمة جاهزة،</span> <span>بل أشغّل <em class="accent" style="font-style:normal">حفلتك</em></span>',
  "Open-format DJ playing Arabic and English. Weddings, clubs, corporate nights and private parties. Read the crowd, build the night, never let the floor drop.":
    "دي جيه بجميع الأنماط، عربي وأجنبي. أعراس ونوادٍ وحفلات شركات ومناسبات خاصة. أقرأ الحضور، وأبني الليلة، ولا أدع السهرة تهدأ.",
  "Check my availability": "تحقق من توفري",
  "Read reviews": "اقرأ التقييمات",
  "What I do": "ما أقدمه",
  'Built for the <span class="accent">night</span> you\'re planning':
    'مصمّم على مقاس <span class="accent">السهرة</span> التي تخطط لها',
  "Every room is different. The gear, the genre and the energy get matched to yours, not pulled off a shelf.":
    "كل قاعة تختلف عن غيرها. المعدات والأنماط والطاقة تُختار على مقاس مناسبتك، لا من قائمة جاهزة.",
  "Weddings": "الأعراس",
  "Ceremony, cocktail hour and reception handled end to end, including MC announcements, timeline cues and your must-play list.":
    "المراسم وساعة الاستقبال والحفل من البداية إلى النهاية، بما في ذلك تقديم الفقرات وضبط التوقيت وقائمة الأغاني التي تريدها.",
  "Clubs &amp; Bars": "النوادي والحانات",
  "Open-format sets that keep a floor full from doors to last call. Comfortable on residency nights and one-off guest spots alike.":
    "فقرات متنوعة تُبقي الساحة ممتلئة من فتح الأبواب حتى آخر الليل، سواء في الليالي الدائمة أو الظهور لمرة واحدة.",
  "Corporate": "حفلات الشركات",
  "Galas, launches and holiday parties. Clean transitions, a read on the room, and volume that still lets people talk.":
    "حفلات رسمية وإطلاق منتجات ومناسبات الأعياد. انتقالات نظيفة، وقراءة دقيقة للأجواء، وصوت يسمح للحضور بالحديث.",
  "Private Parties": "الحفلات الخاصة",
  "Backyards, lofts, birthdays and anniversaries. Compact setup that fits a living room or scales up to a venue.":
    "حدائق منزلية وشقق وأعياد ميلاد وذكريات سنوية. تجهيزات مرنة تناسب غرفة المعيشة وتتوسع لتناسب صالة كاملة.",
  "MC &amp; Hosting": "التقديم والإشراف",
  "Announcements, introductions and timeline cues delivered on the mic, so the night keeps moving without anyone chasing it.":
    "الإعلانات والتقديم وضبط الفقرات عبر الميكروفون، لتسير السهرة بسلاسة دون أن يلاحقها أحد.",
  "Sound &amp; Lighting": "الصوت والإضاءة",
  "Full PA, wireless mics and dance-floor lighting available. Delivered, set up and struck without you lifting anything.":
    "نظام صوت متكامل وميكروفونات لاسلكية وإضاءة لساحة الرقص. تُنقل وتُركّب وتُفكّك دون أن ترفع أنت شيئاً.",
  "Events played": "مناسبة أحييتها",
  "Behind the decks": "خلف الأجهزة",
  "Venues played": "صالة عملت فيها",
  "Floors filled": "ساحات ممتلئة",
  'What people say <span class="accent">after</span>': 'ما يقوله الناس <span class="accent">بعدها</span>',
  "All reviews &amp; leave your own": "كل التقييمات وأضف تقييمك",
  '<b>No reviews published yet</b> <span>Yours could be the first.</span>':
    '<b>لا توجد تقييمات منشورة بعد</b> <span>قد يكون تقييمك هو الأول.</span>',
  'Tell me about <span class="accent">your night</span>': 'حدثني عن <span class="accent">سهرتك</span>',
  "Send the date, the venue and the vibe. You'll get a straight answer on availability and a quote, usually the same day.":
    "أرسل التاريخ والمكان والأجواء المطلوبة، وستحصل على رد واضح بشأن التوفر والسعر، في نفس اليوم غالباً.",
  "Start a booking": "ابدأ الحجز",
  "Just ask a question": "اسأل سؤالاً فقط",

  /* ---- about ---- */
  'Behind the <span class="accent">decks</span>': 'خلف <span class="accent">الأجهزة</span>',
  'Ten minutes in and the floor is <span class="accent">full</span>':
    'عشر دقائق وتمتلئ <span class="accent">الساحة</span>',
  "I started DJing house parties in Calgary and never really stopped. What began as a computer speaker in a bedroom turned into weekend residencies and wedding seasons booked out months ahead.":
    "بدأت التشغيل في حفلات المنازل بكالغاري ولم أتوقف منذ ذلك الحين. ما بدأ بمكبر صوت صغير في غرفة تحوّل إلى ليالٍ دائمة في نهايات الأسبوع ومواسم أعراس محجوزة قبل أشهر.",
  "My style is open format, hip-hop into house, Afrobeats into Top 40, whatever the room is actually asking for. I'd rather watch the floor than the tracklist. That means the set you get on the night is built live, not pre-recorded and pressed play.":
    "أسلوبي متعدد الأنماط، من الهيب هوب إلى الهاوس، ومن الأفروبيتس إلى الأغاني الرائجة، وفق ما تطلبه القاعة فعلاً. أراقب الساحة لا قائمة الأغاني، أي أن الفقرة تُبنى مباشرة في تلك الليلة لا مسجلة مسبقاً.",
  "I DJ Arabic as well, mixed into the same set as the English material rather than kept to its own bracket. If half your guest list speaks Arabic and half doesn't, that is the room I am most comfortable in.":
    "أشتغل على الأغاني العربية أيضاً، مدمجة ضمن نفس الفقرة مع الأغاني الأجنبية لا في وقت منفصل. وإن كان نصف المدعوين يتحدثون العربية والنصف الآخر لا، فهذه أكثر الأجواء التي أرتاح فيها.",
  "The other half of the job is everything around the music: arriving early, keeping the timeline on track, and handling the mic so nobody has to think about logistics.":
    "النصف الآخر من العمل هو كل ما يحيط بالموسيقى: الحضور مبكراً، وضبط توقيت الفقرات، وإدارة الميكروفون حتى لا ينشغل أحد بالتنظيم.",
  "Check availability": "تحقق من التوفر",
  "See the gallery": "شاهد الصور",
  "How it works": "كيف تسير الأمور",
  'Four steps, <span class="accent">no surprises</span>': 'أربع خطوات، <span class="accent">بلا مفاجآت</span>',
  "Send your date, venue and rough guest count. I'll confirm whether I'm free and what it costs, with no back and forth to get a number.":
    "أرسل التاريخ والمكان وعدد الحضور التقريبي، وسأؤكد لك توفري والتكلفة، دون أخذ ورد للحصول على السعر.",
  "Lock it in": "ثبّت الحجز",
  "A deposit holds the date. You get a written agreement covering hours, gear and arrival time so nothing is verbal.":
    "عربون يحجز التاريخ. تحصل على اتفاق مكتوب يغطي الساعات والمعدات ووقت الوصول، فلا شيء يبقى شفهياً.",
  "Plan the music": "خطط للموسيقى",
  "We go through must-plays, do-not-plays, announcements and the timeline a few weeks out. You approve it before the night.":
    "نراجع الأغاني المطلوبة والممنوعة والإعلانات وجدول الفقرات قبل أسابيع، وتعتمدها أنت قبل الموعد.",
  "Show night": "ليلة الحفل",
  "I arrive early, set up, sound check and then read the room. You enjoy your event instead of managing a playlist.":
    "أصل مبكراً وأجهّز وأضبط الصوت ثم أقرأ الأجواء. تستمتع أنت بمناسبتك بدلاً من إدارة قائمة أغانٍ.",
  "Setup": "التجهيزات",
  'The <span class="accent">gear</span>': '<span class="accent">المعدات</span>',
  "Professional, redundant and quiet to look at. Available as part of a package or as an add-on if your venue supplies its own PA.":
    "احترافية ومزدوجة الاحتياط وأنيقة المظهر. متوفرة ضمن الباقة أو كإضافة إن كانت الصالة توفر نظام صوتها الخاص.",
  "Decks": "الأجهزة",
  "Pioneer DDJ-FLX10, a four channel controller, plus a laptop based backup that can take over mid set.":
    "بايونير DDJ-FLX10، جهاز بأربع قنوات، مع نظام احتياطي على حاسوب محمول يمكنه تولي المهمة أثناء الفقرة.",
  "Sound": "الصوت",
  "Powered PA scaled to the room, with subs for dance floors over about 80 guests.":
    "نظام صوت مضخّم يُختار حسب حجم القاعة، مع مكبرات للترددات المنخفضة للساحات التي تتجاوز نحو ثمانين ضيفاً.",
  "Microphones": "الميكروفونات",
  "Two wireless handhelds for speeches, vows and announcements.":
    "ميكروفونان لاسلكيان للكلمات والعهود والإعلانات.",
  "Lighting": "الإضاءة",
  "Uplighting and dance-floor effects, colour matched to your event.":
    "إضاءة جدارية ومؤثرات لساحة الرقص، بألوان تناسب مناسبتك.",
  "Booth": "منصة التشغيل",
  "Clean facade with cable management, so it photographs well and nobody trips.":
    "واجهة نظيفة مع تنظيم للأسلاك، فتظهر جيداً في الصور ولا يتعثر بها أحد.",
  "Backup": "الاحتياط",
  "Spare controller, spare mic and duplicate music library on site every time.":
    "جهاز احتياطي وميكروفون احتياطي ونسخة ثانية من مكتبة الموسيقى في كل مرة.",

  /* ---- gallery ---- */
  'Nights that <span class="accent">worked</span>': 'ليالٍ <span class="accent">نجحت</span>',
  "Photos": "الصور",
  'From the <span class="accent">floor</span>': 'من قلب <span class="accent">الحفل</span>',
  "Videos": "الفيديوهات",
  'Sets in <span class="accent">motion</span>': 'فقرات <span class="accent">أثناء العمل</span>',
  'Want yours in <span class="accent">here?</span>': 'تريد مناسبتك <span class="accent">هنا؟</span>',
  "Tell me about the event.": "حدثني عن مناسبتك.",

  /* ---- reviews ---- */
  'In their <span class="accent">words</span>': 'بكلماتهم <span class="accent">هم</span>',
  'Played your <span class="accent">event?</span>': 'أحييتُ <span class="accent">مناسبتك؟</span>',
  "Thirty seconds of your time genuinely helps the next couple decide. Write whatever is honest, the good and the awkward.":
    "ثلاثون ثانية من وقتك تساعد العروسين التاليين على اتخاذ قرارهما. اكتب ما تراه صادقاً، الجيد والمحرج معاً.",
  "Reviews are sent straight to me and are published on this page by hand, so nothing goes live without both of us knowing. Your email is never shown.":
    "تصلني التقييمات مباشرة وتُنشر على هذه الصفحة يدوياً، فلا شيء يظهر دون علمنا معاً. ولا يُعرض بريدك الإلكتروني أبداً.",
  "Leave a review": "أضف تقييماً",
  "Which event?": "أي مناسبة؟",
  "Rating": "التقييم",
  "Your review": "تقييمك",
  "Send review": "أرسل التقييم",
  "Planning something?": "تخطط لمناسبة؟",
  "Let's talk about your date.": "لنتحدث عن موعدك.",
  "I'm happy for this review and my first name to appear on this site.":
    "أوافق على نشر هذا التقييم واسمي الأول على هذا الموقع.",

  /* ---- booking ---- */
  'Lock in your <span class="accent">date</span>': 'ثبّت <span class="accent">موعدك</span>',
  "Packages": "الباقات",
  'Straightforward <span class="accent">pricing</span>': 'أسعار <span class="accent">واضحة</span>',
  "Starting points, not fine print. Every quote is confirmed in writing once I know the venue and the hours. <!-- EDIT: set your real prices below -->":
    "أسعار بداية لا شروط خفية. يُؤكَّد كل عرض سعر كتابياً بمجرد معرفة المكان وعدد الساعات. <!-- EDIT: set your real prices below -->",
  "starting": "ابتداءً من",
  "Essential": "الأساسية",
  "Signature": "المميزة",
  "Headline": "الاحترافية",
  "Small parties and events where the venue already has sound.":
    "الحفلات الصغيرة والمناسبات التي يتوفر فيها نظام صوت بالمكان.",
  "Up to 4 hours of DJ time": "حتى ٤ ساعات تشغيل",
  "Open-format set, planned with you": "فقرة متعددة الأنماط، مخطط لها معك",
  "Controller, laptop and headphones": "جهاز تحكم وحاسوب محمول وسماعات",
  "One wireless microphone": "ميكروفون لاسلكي واحد",
  "PA system": "نظام صوت",
  "Dance-floor lighting": "إضاءة لساحة الرقص",
  "Choose Essential": "اختر الباقة الأساسية",
  "The full wedding and event package, with sound, mics and lighting included.":
    "باقة الأعراس والمناسبات الكاملة، وتشمل الصوت والميكروفونات والإضاءة.",
  "Up to 6 hours of DJ time": "حتى ٦ ساعات تشغيل",
  "Ceremony and cocktail coverage": "تغطية المراسم وساعة الاستقبال",
  "MC announcements and timeline cues": "التقديم وضبط توقيت الفقرات",
  "Full PA scaled to your room": "نظام صوت متكامل يناسب حجم القاعة",
  "Two wireless microphones": "ميكروفونان لاسلكيان",
  "Choose Signature": "اختر الباقة المميزة",
  "Large venues, galas and anything that needs a production step up.":
    "الصالات الكبيرة والحفلات الرسمية وكل ما يحتاج إنتاجاً أعلى.",
  "Up to 8 hours of DJ time": "حتى ٨ ساعات تشغيل",
  "Everything in Signature": "كل ما في الباقة المميزة",
  "Subwoofers and expanded PA": "مكبرات ترددات منخفضة ونظام صوت موسّع",
  "Uplighting throughout the venue": "إضاءة جدارية في أنحاء الصالة",
  "Full planning call and site visit": "مكالمة تخطيط كاملة وزيارة للموقع",
  "Dry ice for the first dance": "ثلج جاف للرقصة الأولى",
  "Cold spark fountains": "نافورات شرر باردة",
  "Choose Headline": "اختر الباقة الاحترافية",
  "Travel outside Calgary, extra hours and late-night extensions are quoted separately. A deposit holds your date; the balance is due on the day.":
    "التنقل خارج كالغاري والساعات الإضافية والتمديد حتى وقت متأخر تُسعَّر بشكل منفصل. العربون يحجز موعدك، ويُسدَّد الباقي يوم المناسبة.",
  "Already agreed a date?": "اتفقنا على موعد؟",
  "Pick your package and pay the deposit, which is half the package price. The balance is due on the day, and I'll send written confirmation as soon as it clears.":
    "اختر باقتك وادفع العربون، وهو نصف قيمة الباقة. يُسدَّد الباقي يوم المناسبة، وسأرسل تأكيداً كتابياً فور وصول الدفعة.",
  "Most booked": "الأكثر حجزاً",
  "Deposit due": "العربون المستحق",
  "Send your deposit by Interac e-Transfer": "أرسل العربون عبر التحويل الإلكتروني إنتراك",
  "Amount": "المبلغ",
  "Send to": "أرسل إلى",
  "Message": "الملاحظة",
  "Copy": "نسخ",
  "Copied": "تم النسخ",
  "Your package": "باقتك",
  "Pay deposit": "ادفع العربون",
  /* Deposit picker options are built from CONFIG.packages, so the price
     is baked into the key. Change a price and these fall back to English
     until the key here is updated to match. */
  "Essential ($800)": "الأساسية (٨٠٠ $)",
  "Signature ($1,500)": "المميزة (١٥٠٠ $)",
  "Headline ($2,000)": "الاحترافية (٢٠٠٠ $)",
  'Not agreed a date yet? Send an <a href="#enquiry" style="color:var(--red)">enquiry</a> first. Deposits are only for confirmed bookings.':
    'لم نتفق على موعد بعد؟ أرسل <a href="#enquiry" style="color:var(--red)">استفساراً</a> أولاً. العربون للحجوزات المؤكدة فقط.',
  "Enquiry": "استفسار",
  'The more you can give me here, the faster the quote. If your date is inside two weeks, <a href="contact.html" style="color:var(--red)">call or WhatsApp me</a> instead, it is quicker.':
    'كلما زادت التفاصيل هنا، وصلك السعر أسرع. وإن كان موعدك خلال أسبوعين، <a href="contact.html" style="color:var(--red)">اتصل بي أو راسلني على واتساب</a> فذلك أسرع.',
  "Event date": "تاريخ المناسبة",
  "Event type": "نوع المناسبة",
  "Wedding": "عرس",
  "Club / bar": "نادٍ أو حانة",
  "Birthday": "عيد ميلاد",
  "Private party": "حفلة خاصة",
  "Other": "أخرى",
  "Venue / area": "المكان أو المنطقة",
  "Guests": "عدد الضيوف",
  "Package": "الباقة",
  "Not sure yet": "لم أقرر بعد",
  "Anything else": "أي شيء آخر",
  "Send enquiry": "أرسل الاستفسار",
  "No spam, no list. Your details are only used to answer this enquiry.":
    "لا رسائل مزعجة ولا قوائم بريدية. تُستخدم بياناتك للرد على هذا الاستفسار فقط.",

  /* ---- contact ---- */
  'Say <span class="accent">hello</span>': 'قل <span class="accent">مرحباً</span>',
  'Bookings &amp; <span class="accent">everything else</span>':
    'الحجوزات <span class="accent">وكل ما عداها</span>',
  "Quickest way to reach me is Instagram or WhatsApp. For a formal quote, use the booking form so I have the details in one place.":
    "أسرع طريقة للوصول إليّ هي إنستغرام أو واتساب. وللحصول على عرض سعر رسمي، استخدم نموذج الحجز لتصلني كل التفاصيل في مكان واحد.",
  "Booking page": "صفحة الحجز",

  /* Reach cards. Keyed on the full inner HTML, so the flag inside the
     WhatsApp title travels with it rather than being left in English. */
  'WhatsApp <em class="reach-flag">fastest</em>':
    'واتساب <em class="reach-flag">الأسرع</em>',
  "Message me and you will usually have an answer the same day.":
    "راسلني وستصلك الإجابة في نفس اليوم غالباً.",
  "Best if you have a lot of detail, or need something in writing.":
    "الأفضل إن كانت لديك تفاصيل كثيرة، أو تحتاج شيئاً مكتوباً.",
  "If your date is inside two weeks, phone me. It is quicker than typing.":
    "إن كان موعدك خلال أسبوعين، اتصل بي. هذا أسرع من الكتابة.",

  "Tell me four things": "أخبرني بأربعة أمور",
  "However you get in touch, these are all I need to tell you straight away whether I am free and what it costs.":
    "بأي طريقة تتواصل بها، هذه كل ما أحتاجه لأخبرك فوراً إن كنت متفرغاً وبكم.",
  "<b>The date</b><span>And rough hours, if you know them</span>":
    "<b>التاريخ</b><span>والساعات التقريبية إن كنت تعرفها</span>",
  "<b>The venue</b><span>Or the area, if it is not booked yet</span>":
    "<b>المكان</b><span>أو المنطقة إن لم يُحجز بعد</span>",
  "<b>The occasion</b><span>Wedding, birthday, corporate, club night</span>":
    "<b>المناسبة</b><span>عرس، عيد ميلاد، حفل شركة، ليلة في نادٍ</span>",
  "<b>The vibe</b><span>Arabic, English, both, and anything you love or hate</span>":
    "<b>الأجواء</b><span>عربي، أجنبي، أو الاثنان، وما تحبه أو تكرهه</span>",
  'Ready to book rather than ask? The <a href="booking.html" style="color:var(--red)">booking page</a> has packages, deposits and the agreement.':
    'جاهز للحجز بدل السؤال؟ <a href="booking.html" style="color:var(--red)">صفحة الحجز</a> فيها الباقات والعربون والاتفاقية.',
  "Your name": "الاسم",
  "Subject": "الموضوع",
  "Message": "الرسالة",
  "Send message": "أرسل الرسالة",
  "No spam, no list. Your details are only used to reply.":
    "لا رسائل مزعجة ولا قوائم بريدية. تُستخدم بياناتك للرد فقط.",
};

/* ---------------------------------------------------------------------
   ATTRIBUTES — placeholders, aria-labels, titles
   --------------------------------------------------------------------- */
/* Stat counter suffixes, matched on the data-suffix attribute. */
const AR_SUFFIX = {
  "+": "+",
  "%": "٪",
  " yrs": " سنوات",
};

const AR_ATTR = {
  "What's this about?": "ما موضوع رسالتك؟",
  "Menu": "القائمة",
  "Back to top": "العودة إلى الأعلى",
  "Switch to light mode": "التبديل إلى الوضع الفاتح",
  "Switch to dark mode": "التبديل إلى الوضع الداكن",
};

/* Page <title>, keyed by the English title. */
const AR_TITLE = {
  "DJ Mishoo, Open-Format DJ in Calgary": "دي جيه ميشو، دي جيه بجميع الأنماط في كالغاري",
  "About DJ Mishoo": "نبذة عن دي جيه ميشو",
  "Contact DJ Mishoo": "تواصل مع دي جيه ميشو",
  "DJ Mishoo Gallery": "معرض صور دي جيه ميشو",
  "DJ Mishoo Reviews": "تقييمات دي جيه ميشو",
  "Book DJ Mishoo": "احجز دي جيه ميشو",
};

/* Candidate elements. Deliberately leaf-ish: a container full of other
   blocks must not be listed, or swapping it would wipe its children. */
const I18N_SEL = [
  /* Headings and prose */
  "#page h1", "#page h2", "#page h3", "#page h4",
  "#page p", "#page li", "#page label", "#page button",
  "#page figcaption", "#page summary", "#page option", "#page small",
  /* Inline carriers. A narrow tag list missed the marquee, the stat
     captions and the contact rows, all of which are bare spans and divs.
     Parents are visited before children, so a container that IS
     translated detaches its children and they are skipped as stale. */
  "#page span", "#page div", "#page b", "#page strong", "#page em", "#page a",
  "#page td", "#page th",
  ".marquee-track span", ".hero-scroll",
  /* Shell */
  ".site-header .nav-link", ".site-header .btn",
  ".mobile-nav a",
  ".site-footer h4", ".site-footer p", ".site-footer li",
  ".site-footer .footer-nav a", ".site-footer .footer-contact span",
  ".site-footer .footer-contact a", ".site-footer .btn",
  ".site-footer .footer-legal a", ".site-footer .footer-bottom span",
].join(", ");

const normKey = (s) => s.replace(/\s+/g, " ").trim();

function ensureArabicFont() {
  if (document.getElementById("arFont")) return;
  const l = document.createElement("link");
  l.id = "arFont"; l.rel = "stylesheet"; l.href = AR_FONT;
  document.head.appendChild(l);
}

function translateTree(lang) {
  document.querySelectorAll(I18N_SEL).forEach((el) => {
    /* A parent swapped earlier in this same pass detaches its children,
       and those stale nodes must not be written to. */
    if (!el.isConnected) return;

    /* Never swap the innerHTML of anything holding a live form control or
       a value JS wrote in (prices, deposit amounts, the animated stat
       counters). Rewriting the HTML would replace the real control with a
       dead copy and drop the value. `matches` covers the element itself,
       `querySelector` its descendants; the counter <b> is the element,
       the .stat wrapper is the ancestor, and both must be left alone.
       Their sibling captions still translate on their own. */
    if (el.matches("[data-price], [data-count]")) return;
    if (el.querySelector("input, select, textarea, [data-price], [data-count]")) return;

    if (el._en === undefined) el._en = el.innerHTML;

    if (lang === "ar") {
      const hit = AR[normKey(el._en)];
      if (hit) el.innerHTML = hit;
    } else if (el.innerHTML !== el._en) {
      el.innerHTML = el._en;
    }
  });

  document.querySelectorAll("[placeholder], [aria-label], [title]").forEach((el) => {
    ["placeholder", "aria-label", "title"].forEach((a) => {
      const cur = el.getAttribute(a);
      if (cur === null) return;
      const cache = "_en_" + a;
      if (el[cache] === undefined) el[cache] = cur;
      if (lang === "ar") {
        const hit = AR_ATTR[normKey(el[cache])];
        if (hit) el.setAttribute(a, hit);
      } else {
        el.setAttribute(a, el[cache]);
      }
    });
  });

  /* The stat counters are animated by motion.js, which reads data-suffix
     every frame and rewrites the text. Translating the element directly
     would be overwritten on the next frame, so the SUFFIX is translated
     instead and the visible text is set to the value the animation ends
     on. Re-running the count-up afterwards lands on the same string. */
  document.querySelectorAll("[data-count]").forEach((el) => {
    if (el._enSuffix === undefined) el._enSuffix = el.dataset.suffix || "";
    const suffix = lang === "ar"
      ? (AR_SUFFIX[el._enSuffix] !== undefined ? AR_SUFFIX[el._enSuffix] : el._enSuffix)
      : el._enSuffix;
    el.dataset.suffix = suffix;
    el.textContent = (el.dataset.count || "") + suffix;
  });

  if (document._enTitle === undefined) document._enTitle = document.title;
  document.title = lang === "ar"
    ? (AR_TITLE[normKey(document._enTitle)] || document._enTitle)
    : document._enTitle;
}

function applyLang(lang, { animate = false } = {}) {
  const root = document.documentElement;
  const isAr = lang === "ar";

  if (isAr) ensureArabicFont();

  root.lang = isAr ? "ar" : "en";
  root.dir = isAr ? "rtl" : "ltr";
  root.dataset.lang = isAr ? "ar" : "en";

  if (animate) {
    root.classList.add("lang-anim");
    clearTimeout(applyLang._t);
    applyLang._t = setTimeout(() => root.classList.remove("lang-anim"), 300);
  }

  translateTree(isAr ? "ar" : "en");

  /* Switching language rewrites whole elements, so nested content comes
     back as brand new nodes: no revealed state, and no longer watched by
     the scroll observer. refreshReveal restores both, otherwise the copy
     stays invisible for the rest of the visit. It also covers the reflow,
     since the two languages set at different lengths. */
  if (typeof window.refreshReveal === "function") window.refreshReveal();

  /* The hero headline is split into per-character nodes to animate, and
     the swap above just replaced the lot with plain text. Same contract
     as refreshReveal: motion.js owns it, this only says when. */
  if (typeof window.refreshHeadline === "function") window.refreshHeadline();

  const btn = document.getElementById("langToggle");
  if (btn) {
    /* The button shows both codes at once and highlights the active one
       in CSS off data-lang, so its text is never rewritten here. Writing
       textContent would destroy the two spans. */
    const label = isAr ? "Switch to English" : "التبديل إلى العربية";
    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", label);
    /* This label is itself language-dependent, so it must not be reverted
       by the attribute pass on the next switch. */
    btn._en_title = label;
    btn["_en_aria-label"] = label;
  }
}

function storedLang() {
  try { return localStorage.getItem(LANG_KEY); } catch { return null; }
}

function initLang() {
  applyLang(document.documentElement.dataset.lang || storedLang() || "en");

  const btn = document.getElementById("langToggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const next = document.documentElement.dataset.lang === "ar" ? "en" : "ar";
    try { localStorage.setItem(LANG_KEY, next); } catch { /* private mode */ }
    applyLang(next, { animate: true });
  });
}

/* Re-run over content app.js rendered after the first pass: reviews,
   prices and the package options built from CONFIG. */
function retranslate() {
  if (document.documentElement.dataset.lang === "ar") translateTree("ar");
}

/* Development helper: lists every candidate string on the current page,
   so new copy can be collected without hunting through the HTML. */
window.__i18nExtract = function () {
  const out = new Set();
  document.querySelectorAll(I18N_SEL).forEach((el) => {
    const k = normKey(el._en !== undefined ? el._en : el.innerHTML);
    if (k) out.add(k);
  });
  return [...out];
};
window.__hasAR = (k) => Object.prototype.hasOwnProperty.call(AR, k);
