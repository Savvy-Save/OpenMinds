const wordLists = {
  "3": [
    "Ace", "Add", "Ape", "Arc", "Ash", "Bad", "Bag", "Bat", "Bed", "Bib",
    "Cab", "Cam", "Cap", "Car", "Cat", "Dad", "Dam", "Day", "Den", "Dew",
    "Ear", "Eat", "Ebb", "Elf", "End", "Fan", "Far", "Fat", "Fay", "Fed",
    "Gab", "Gad", "Gap", "Gas", "Gem", "Had", "Ham", "Hat", "Hay", "Hen",
    "Ice", "Icy", "Ink", "Inn", "Ion", "Jab", "Jam", "Jar", "Jet", "Job",
    "Key", "Kid", "Kin", "Kit", "Koi", "Lad", "Lag", "Lap", "Law", "Led",
    "Mad", "Man", "Map", "Mat", "Mew", "Nag", "Nap", "Net", "New", "Nod",
    "Oak", "Oar", "Oat", "Odd", "Oil", "Pad", "Pal", "Pan", "Pat", "Paw",
    "Rad", "Rag", "Ram", "Ran", "Raw", "Sad", "Sag", "Sap", "Sat", "Saw",
    "Tab", "Tag", "Tan", "Tap", "Tar", "Via", "Vow", "Wad", "Wag", "War",
    "Yak", "Yam", "Yap", "Yen", "Zip"
  ],
  "5": [
    "Abide", "Adept", "Alarm", "Ample", "Arrow", "Balsa", "Bathe", "Bison", "Blaze", "Brawn",
    "Cactus", "Canal", "Cello", "Chime", "Cobra", "Dairy", "Dance", "Delta", "Drape", "Drift",
    "Eagle", "Ember", "Enact", "Evade", "Exact", "Fable", "Fever", "Flair", "Flute", "Frail",
    "Gable", "Gauge", "Gleam", "Glove", "Grape", "Haste", "Haven", "Hedge", "Hobby", "Hound",
    "Igloo", "Image", "Inert", "Inner", "Issue", "Jelly", "Jewel", "Joint", "Jolly", "Judge",
    "Kappa", "Kiosk", "Knife", "Koala", "Krill", "Lasso", "Lemon", "Linen", "Livid", "Lodge",
    "Magma", "Mirth", "Mossy", "Mural", "Mystic", "Nerve", "Niche", "Nylon", "Nudge", "Nymph",
    "Oasis", "Ocean", "Olive", "Onion", "Orbit", "Paddle", "Petal", "Plank", "Pride", "Pulse",
    "Quail", "Quest", "Quick", "Quiet", "Quota", "Radar", "Ranch", "Raven", "Rifle", "Rogue",
    "Sable", "Salty", "Scent", "Shore", "Sleek", "Talon", "Tango", "Tidal", "Trace", "Tweak",
    "Umber", "Unity", "Urban", "Usher", "Utter", "Vapor", "Vivid", "Vocal", "Vogue", "Vying",
    "Waltz", "Weave", "Wheat", "Whirl", "Woven", "Xenon", "Xylem", "Yacht", "Yearn", "Yield",
    "Zebra", "Zesty", "Zilch", "Zinc", "Zone"
  ],
  "7": [
    "Abandon", "Ablaze", "Absence", "Acrobat", "Adeptly", "Baggage", "Bamboo", "Banter", "Beacon", "Bizarre",
    "Cabbage", "Caliber", "Canoe", "Cascade", "Cavalry", "Dagger", "Daylight", "Debate", "Delight", "Diatom",
    "Earring", "Eclipse", "Edition", "Elevate", "Emulate", "Factual", "Falcon", "Fathom", "Fissure", "Flannel",
    "Gargle", "Gateway", "Gimmick", "Glacier", "Grapple", "Halogen", "Hammer", "Harvest", "Hearth", "Hurdle",
    "Icicle", "Ignite", "Imagery", "Immerse", "Inquire", "Jacket", "Jester", "Jigsaw", "Jostle", "Journey",
    "Kennel", "Kettle", "Kidney", "Kindle", "Kiosk", "Lament", "Lattice", "Laundry", "Legend", "Lobster",
    "Magnify", "Mammoth", "Mandate", "Marble", "Mermaid", "Nectar", "Nervous", "Neutral", "Noodle", "Notable",
    "Oatmeal", "Oblige", "Octave", "Offset", "Outcast", "Padding", "Parade", "Pebble", "Pensive", "Pioneer",
    "Quaint", "Quarry", "Quest", "Quiver", "Quota", "Raccoon", "Radiant", "Ramble", "Rebound", "Ripple",
    "Saddle", "Saffron", "Savior", "Scenery", "Sculpt", "Tactic", "Tangle", "Tempest", "Thrive", "Tribute",
    "Umbrella", "Uncover", "Uniform", "Unravel", "Utopia", "Vaccine", "Vanish", "Velvet", "Venture", "Vortex",
    "Waffle", "Wander", "Whistle", "Wicked", "Wrench", "Xerox", "Xylem", "Yankee", "Yearly", "Yogurt",
    "Zealot", "Zenith", "Zephyr", "Zigzag", "Zodiac"
  ],
  "10": [
    "Abbreviate", "Abominable", "Absorption", "Acoustical", "Adrenaline", "Backpacker", "Bamboozle", "Barbarian", "Battleship", "Befriended",
    "Cacophony", "Calamity", "Camouflage", "Carpenter", "Cathedral", "Dandelion", "Dashboard", "Dedicated", "Democracy", "Deviation",
    "Ebullient", "Educator", "Effortless", "Emanation", "Enthusiasm", "Fabricate", "Faltering", "Fantastic", "Fertility", "Flicker",
    "Gallantry", "Gargantuan", "Gemstone", "Gigantic", "Gratitude", "Hallelujah", "Handiwork", "Harboring", "Hazardous", "Holograph",
    "Ignition", "Illusion", "Imitation", "Incentive", "Inclusion", "Jackpot", "Jeopardy", "Jubilant", "Judgment", "Junction",
    "Kangaroo", "Keystone", "Kilometer", "Kindness", "Knowledge", "Labyrinth", "Landscape", "Latitude", "Lethargy", "Livelihood",
    "Magnolia", "Malleable", "Maneuver", "Marigold", "Memorize", "Narcissus", "Navigator", "Nebulous", "Negligent", "Nominate",
    "Oasis", "Obedient", "Obscurity", "Octagonal", "Ornament", "Pacifist", "Palatable", "Panorama", "Paradigm", "Patriarch",
    "Quagmire", "Quarrel", "Quartz", "Quicksand", "Quintet", "Radiator", "Rambunctious", "Ration", "Recliner", "Regiment",
    "Sabbatical", "Saxophone", "Scoundrel", "Scrutiny", "Sentiment", "Tangerine", "Tapestry", "Temerity", "Terrific", "Textbook",
    "Umbrella", "Uncertain", "Undergo", "Unfurl", "Uplifting", "Vacation", "Valiant", "Vaporize", "Venerable", "Vibration",
    "Wallaby", "Warranty", "Waterfall", "Withering", "Wonderful", "Xylophone", "Yearning", "Yesterday", "Yogurt", "Youthful",
    "Zeppelin", "Zirconium", "Zucchini", "Zoology"
  ]
};

export default wordLists;
