const wordList = [
  // A
  "abide", "about", "above", "abuse", "actor", "acute", "admit", "adopt", "adore", "adult", "afoul", "after", "again", "agony", "ahead", "album", "alert", "alien", "alike", "alive", "allow", "alone", "along", "aloud", "alter", "amaze", "amber", "amend", "ample", "amuse", "angel", "angry", "ankle", "apart", "aphid", "apple", "apply", "apron", "ardor", "argue", "arise", "armor", "arrow", "ashes", "aside", "asset", "audio", "audit", "avoid", "await", "awake", "award", "aware", "awful", "axiom", "azure",
  // B
  "bacon", "badge", "baker", "balsa", "barge", "basic", "basin", "basis", "batch", "beach", "beard", "beast", "begin", "begun", "being", "belly", "bench", "berry", "birth", "black", "blade", "blame", "blank", "blast", "blaze", "bleed", "blend", "bless", "blind", "blink", "block", "bloom", "blues", "board", "boast", "bobby", "bonus", "boost", "booth", "boots", "bound", "brace", "braid", "brain", "brake", "brand", "brave", "bread", "break", "brick", "bride", "brief", "bring", "broad", "brook", "broom", "brush", "build", "bulge", "bunch", "bumpy", "burst", "buyer", "bylaw", "byte",
  // C
  "cabin", "cable", "candy", "canal", "canoe", "caper", "caret", "carve", "catch", "cause", "cease", "cedar", "cello", "chalk", "champ", "chant", "charm", "chart", "chase", "cheap", "cheat", "check", "cheek", "cheer", "chess", "chest", "chief", "child", "chill", "chime", "choir", "choke", "chord", "chore", "chose", "civic", "claim", "clash", "class", "clean", "clear", "click", "climb", "clock", "clone", "close", "cloth", "cloud", "clown", "coach", "coast", "cobra", "colon", "color", "comic", "comma", "coral", "count", "court", "cover", "crack", "craft", "crash", "crawl", "crazy", "cream", "creed", "creek", "crest", "crime", "crisp", "cross", "crowd", "crown", "crude", "crumb", "crush", "crust", "crypt", "curb", "curse", "curve", "cycle", "cynic",
  // D
  "daily", "dairy", "dance", "dated", "dater", "dazed", "deal", "dealt", "death", "debut", "decay", "decal", "decor", "defer", "delay", "delta", "dense", "dent", "depth", "depot", "derby", "deter", "deity", "diary", "digit", "diner", "dirty", "ditch", "dizzy", "dodge", "dolly", "donut", "donor", "doubt", "dough", "dove", "dozen", "draft", "drain", "drama", "dream", "dress", "drift", "drill", "drink", "drive", "drown", "dryer", "dusty", "dwarf", "dwell",
  // E
  "eager", "early", "earth", "easel", "eaten", "edged", "eerie", "effort", "elbow", "elder", "elect", "elite", "email", "embed", "ember", "empty", "enact", "ended", "endow", "enjoy", "enter", "entry", "equal", "equip", "erase", "error", "essay", "evade", "event", "every", "exact", "exalt", "excel", "exert", "exist", "extra", "exude", "eying",
  // F
  "fable", "faced", "fact", "faint", "faith", "false", "fancy", "fatal", "fault", "favor", "feast", "feral", "ferry", "fetch", "fever", "fiber", "field", "fiery", "fifth", "fifty", "fight", "filed", "filer", "filet", "final", "first", "fishy", "flair", "flame", "flash", "flask", "fleet", "flesh", "flick", "flight", "float", "flock", "flood", "floor", "flour", "fluid", "flute", "focus", "foggy", "foil", "folly", "force", "forge", "forth", "forty", "forum", "found", "frame", "frank", "fraud", "freak", "fresh", "frost", "frown", "frozen", "fruit", "funny", "fuzzy",
  // G
  "gable", "gain", "game", "gamma", "gaze", "gauge", "gauze", "gene", "genre", "ghost", "giant", "glide", "gland", "glare", "glass", "gloom", "glory", "gloss", "glove", "glyph", "gnome", "goose", "grace", "grade", "grain", "grand", "grant", "grape", "graph", "grasp", "grass", "grate", "grave", "greed", "green", "greet", "grief", "grill", "grind", "groom", "gross", "group", "grout", "growl", "grunt", "guard", "guess", "guest", "guide", "guild", "guilt", "gusto", "gutty", "gypsum",
  // H
  "habit", "handy", "happy", "hardy", "harem", "haste", "hasty", "haunt", "haven", "head", "heave", "heavy", "hedge", "hefty", "hence", "herby", "hinge", "hobby", "honey", "honor", "horse", "hotel", "hound", "house", "hover", "human", "humid", "humor", "hurry", "husky", "hydro", "hyena",
  // I
  "ideal", "idiom", "idiot", "image", "imply", "inbox", "index", "inert", "infer", "influx", "ingot", "injure", "inlay", "inner", "input", "ironic", "irony", "irate", "issue", "ivory", "ixora",
  // J
  "jaded", "jaunt", "jazzy", "jelly", "jetty", "jewel", "joint", "jolly", "joust", "judge", "juice", "jumbo", "jumpy", "junta", "juror", "justly",
  // K
  "karma", "kayak", "kebab", "kennel", "kernel", "khaki", "kicks", "kings", "kiosk", "kinds", "kneel", "knelt", "knife", "knock", "knots", "koala", "kooky", "kraft", "kudos",
  // L
  "label", "labor", "lakes", "large", "laser", "latch", "later", "lathe", "laugh", "layer", "learn", "lease", "least", "leave", "ledge", "legal", "lemon", "level", "lever", "libel", "light", "limit", "linen", "lingo", "liver", "lobby", "local", "logic", "loose", "loved", "lover", "lower", "loyal", "lucid", "lucky", "lunch", "lungs", "lure", "lying", "lyric", "lodge", "lunar", "lumpy", "lynx",
  // M
  "magic", "major", "maker", "mango", "manor", "march", "marry", "marsh", "match", "matte", "maybe", "mayor", "means", "meant", "medal", "media", "mercy", "merge", "merit", "merry", "messy", "metal", "meter", "metro", "might", "minor", "minty", "minus", "mirth", "model", "moist", "molar", "money", "month", "moral", "motor", "motto", "mound", "mount", "mouse", "mouth", "movie", "much", "mucky", "mural", "music", "muted", "mummy",
  // N
  "naive", "naked", "nasty", "navel", "nerve", "nest", "never", "newer", "newly", "nexus", "niche", "night", "ninja", "noble", "noise", "north", "notch", "noted", "novel", "nudge", "nurse", "nutty", "nylon", "nymph", "nerdy", "nobly", "noisy",
  // O
  "oasis", "obese", "ocean", "offer", "often", "olive", "onion", "onset", "opera", "optic", "orbit", "order", "organ", "other", "otter", "ought", "ounce", "outer", "outro", "ovary", "owner", "oxide", "ozone", "odors", "omens", "opals", "ovals", "owlet",
  // P
  "paint", "panel", "panic", "paper", "parka", "party", "pasta", "paste", "patch", "patio", "pause", "peach", "pearl", "pedal", "penny", "perch", "peril", "phase", "phone", "photo", "piano", "piece", "pilot", "pinch", "piney", "pinky", "pitch", "place", "plain", "plane", "plank", "plant", "plate", "plaza", "plead", "pluck", "plumb", "plush", "point", "poise", "poker", "polar", "pouch", "pound", "power", "press", "price", "pride", "prime", "print", "prize", "probe", "proof", "prose", "proud", "prune", "pulse", "punch", "pupil", "purge", "purse", "pushy", "putty", "puffy", "pylon",
  // Q
  "quack", "quail", "quart", "queen", "quest", "quick", "quiet", "quilt", "quirk", "quite", "quota", "quote", "query", "quasi", "queue", "quell", "quips",
  // R
  "radar", "radio", "rainy", "raise", "rally", "ranch", "range", "rapid", "ratio", "raven", "reach", "react", "ready", "realm", "rebel", "refer", "reign", "relax", "relay", "renew", "repay", "reply", "reset", "resin", "retro", "rhyme", "rider", "ridge", "rifle", "right", "rigid", "rival", "river", "roast", "robin", "robot", "rocky", "rodeo", "roman", "roomy", "rough", "round", "route", "royal", "ruler", "rumor", "rural", "rusty", "rugby", "rungs", "runny", "rupee", "rushy",
  // S
  "saber", "saint", "salad", "salty", "sandy", "satin", "sauce", "sauna", "scale", "scare", "scene", "scent", "scold", "scone", "scoop", "scope", "score", "scout", "scrap", "screw", "seize", "sense", "serve", "setup", "seven", "sewer", "shade", "shake", "shame", "shape", "share", "shark", "sharp", "shear", "sheen", "sheep", "sheer", "sheet", "shelf", "shell", "shift", "shine", "shiny", "shirt", "shock", "shoot", "shore", "short", "shout", "shove", "shown", "shrub", "sight", "siren", "sixth", "sixty", "skill", "skirt", "skull", "slack", "slang", "slate", "slave", "sleep", "slice", "slide", "sling", "slope", "sloth", "slump", "small", "smart", "smash", "smell", "smile", "smoke", "snack", "snake", "snarl", "sneak", "snore", "sober", "solar", "solid", "solve", "sonar", "sonic", "sound", "south", "space", "spare", "spark", "speak", "spear", "speed", "spell", "spend", "spice", "spike", "spill", "spine", "spite", "split", "spoil", "spoon", "sport", "spray", "spree", "squad", "stack", "stage", "stain", "stair", "stake", "stale", "stand", "stark", "start", "state", "steak", "steal", "steam", "steel", "steep", "steer", "stick", "stiff", "still", "sting", "stock", "stole", "stone", "store", "storm", "story", "stout", "strap", "straw", "stray", "strip", "study", "stuff", "stump", "style", "sugar", "suite", "sunny", "super", "surge", "swamp", "swarm", "swear", "sweat", "sweep", "sweet", "swell", "swift", "swing", "swirl", "sword", "syrup",
  // T
  "table", "tacit", "taken", "tales", "tally", "tango", "taste", "taunt", "teach", "tease", "tempo", "tenth", "terms", "terra", "thank", "theme", "thick", "thief", "thing", "think", "third", "those", "three", "threw", "throw", "thumb", "tiger", "tight", "timer", "title", "toast", "today", "token", "tonic", "tooth", "topic", "torch", "total", "touch", "tough", "tower", "toxic", "trace", "track", "trade", "trail", "train", "trait", "trash", "treat", "trend", "trial", "tribe", "trick", "troop", "trout", "truck", "truly", "trunk", "trust", "truth", "tulip", "tumor", "tunic", "twins", "twist", "tweak", "twirl",
  // U
  "ultra", "uncle", "under", "unify", "union", "unite", "unity", "upper", "upset", "urban", "usage", "usual", "usurp", "utter", "uvula", "unbox", "unfit", "unzip",
  // V
  "vague", "valid", "value", "vapor", "vault", "vegan", "venom", "verse", "verve", "video", "villa", "vinyl", "viral", "visit", "vista", "vital", "vivid", "vocal", "voice", "voter", "vouch", "vowed", "vibes", "vines", "vogue",
  // W
  "wagon", "waist", "waste", "watch", "water", "waver", "weave", "wedge", "weird", "whale", "wharf", "wheat", "wheel", "where", "which", "while", "whine", "whirl", "white", "whole", "whose", "widow", "width", "wield", "wince", "windy", "wiser", "witch", "witty", "woman", "world", "worry", "worse", "worth", "would", "wound", "woven", "wreck", "wrist", "write", "wrong", "wrote", "wrung",
  // X
  "xerox",
  // Y
  "yacht", "yahoo", "yearn", "yeast", "yield", "yoga", "yogurt", "young", "youth", "yummy", "yanks", "yards", "yawns", "yells", "yokes", "yolks", "yowls", "yucca", "yuppy",
  // Z
  "zebra", "zesty", "zippy", "zonal", "zowie", "zeals", "zeros", "zincs", "zings", "zones", "zooms"
];

// Export the word list for use in other files
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = wordList;
} else {
  window.wordList = wordList;
}
