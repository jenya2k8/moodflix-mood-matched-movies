import type { Stream, Trailer } from "@/lib/types";

/**
 * Official trailers, keyed by title id.
 *
 * Each video was found on YouTube and checked against YouTube's public oEmbed
 * endpoint: the channel name below is what YouTube reports as the uploader, and
 * a 200 response means the owner allows embedding. Only studio, distributor,
 * streaming-service or verified trailer channels were accepted. Titles with no
 * trustworthy trailer (Friends, Queen, Taare Zameen Par, Ulidavaru Kandanthe)
 * are left out on purpose, and the app says so instead of guessing.
 */
export const TRAILERS: Record<string, Trailer> = {
  "3-idiots": { youtubeId: "K0eDlFX9GMc", channel: "moviemaniacsDE", label: "Official trailer" },
  "zindagi-na-milegi-dobara": { youtubeId: "ifIBOKCfjVs", channel: "Excel Movies", label: "Official trailer" },
  "dangal": { youtubeId: "x_7YlGv9u1g", channel: "UTV Motion Pictures", label: "Official trailer" },
  "andhadhun": { youtubeId: "2iVYI99VGaw", channel: "Star Studios Premiere", label: "Official trailer" },
  "dilwale-dulhania-le-jayenge": { youtubeId: "cmax1C1p660", channel: "YRF Movies", label: "Official trailer" },
  "lagaan": { youtubeId: "hTt5FbgziPw", channel: "Aamir Khan Talkies", label: "Official re-release trailer" },
  "barfi": { youtubeId: "fDpjzEKJjsM", channel: "PVR", label: "Official trailer" },
  "the-lunchbox": { youtubeId: "sK3R0rvnlPs", channel: "Sony Pictures Classics", label: "Official trailer" },
  "tumbbad": { youtubeId: "YGIcZrUBY0k", channel: "Rotten Tomatoes Indie", label: "Official trailer" },
  "drishyam": { youtubeId: "eMASubc1y_k", channel: "Mohanlal", label: "Official trailer" },
  "kumbalangi-nights": { youtubeId: "3P4BFBSafF0", channel: "BHAVANA STUDIOS", label: "Official trailer" },
  "premam": { youtubeId: "tRQeIsxaBkg", channel: "Anwar Rasheed Entertainment Official", label: "Official re-release teaser" },
  "vikram": { youtubeId: "OKBMCL-frPU", channel: "Sony Music South", label: "Official trailer" },
  "96": { youtubeId: "r0synl-lI4I", channel: "Think Music India", label: "Official trailer" },
  "jai-bhim": { youtubeId: "Gc6dEDnL8JA", channel: "Prime Video India", label: "Official trailer" },
  "rrr": { youtubeId: "NgBoMJy386M", channel: "DVV Entertainment", label: "Official trailer" },
  "baahubali-the-beginning": { youtubeId: "3NQRhE772b0", channel: "Baahubali Movie", label: "Official trailer" },
  "jersey": { youtubeId: "AjAe_Q1WZ_8", channel: "Haarika & Hassine Creations", label: "Official trailer" },
  "kantara": { youtubeId: "8mrVmf239GU", channel: "Hombale Films", label: "Official trailer" },
  "parasite": { youtubeId: "isOGD_7hNIY", channel: "NEON", label: "Official trailer" },
  "train-to-busan": { youtubeId: "97bcFB4VnEk", channel: "Well Go USA Entertainment", label: "Official trailer" },
  "inception": { youtubeId: "zp_YGmAoht0", channel: "Legendary", label: "Official trailer" },
  "the-grand-budapest-hotel": { youtubeId: "1Fg5iWmQjwk", channel: "SearchlightPictures", label: "Official trailer" },
  "before-sunrise": { youtubeId: "6MUcuqbGTxc", channel: "Rotten Tomatoes Classic Trailers", label: "Official trailer" },
  "paddington-2": { youtubeId: "52x5HJ9H8DM", channel: "StudiocanalUK", label: "Official trailer" },
  "mad-max-fury-road": { youtubeId: "hEJnMQG9ev8", channel: "Warner Bros.", label: "Official trailer" },
  "forrest-gump": { youtubeId: "bLvqoHBptjg", channel: "Paramount Movies", label: "Official trailer" },
  "the-shawshank-redemption": { youtubeId: "PLl99DlL6b4", channel: "Warner Bros. Entertainment", label: "Official trailer" },
  "knives-out": { youtubeId: "qGqiHJTsRkQ", channel: "Lionsgate Movies", label: "Official trailer" },
  "get-out": { youtubeId: "sRfnevzM9kQ", channel: "Universal Pictures", label: "Official trailer" },
  "up": { youtubeId: "HWEW_qTLSEE", channel: "Pixar", label: "Official trailer" },
  "toy-story": { youtubeId: "v-PjgYDrg70", channel: "Rotten Tomatoes Classic Trailers", label: "Official trailer" },
  "spirited-away": { youtubeId: "GAp2_0JJskk", channel: "GKIDS Films", label: "Official trailer" },
  "your-name": { youtubeId: "RuyHIkXdYf8", channel: "GKIDS Films", label: "Official trailer" },
  "my-neighbor-totoro": { youtubeId: "HaLISMAGdOE", channel: "GKIDS Films", label: "Official trailer" },
  "attack-on-titan": { youtubeId: "n4Nj6Y_SNYI", channel: "Crunchyroll Dubs", label: "Official trailer" },
  "demon-slayer": { youtubeId: "VQGCKyvzIM4", channel: "Aniplex USA", label: "Official trailer" },
  "death-note": { youtubeId: "NlJZ-YgAt-c", channel: "Crunchyroll", label: "Official trailer" },
  "your-lie-in-april": { youtubeId: "3aL0gDZtFbE", channel: "Aniplex USA", label: "Official trailer" },
  "haikyu": { youtubeId: "FIdSK3Jwy1U", channel: "Sentai", label: "Official trailer" },
  "spy-x-family": { youtubeId: "ofXigq9aIpo", channel: "Crunchyroll", label: "Official trailer" },
  "sacred-games": { youtubeId: "AkUgf2jIPyI", channel: "Netflix", label: "Official teaser" },
  "panchayat": { youtubeId: "mojZJ7oeD_g", channel: "Prime Video India", label: "Official trailer" },
  "the-family-man": { youtubeId: "XatRGut65VI", channel: "Prime Video India", label: "Official trailer" },
  "kota-factory": { youtubeId: "pNZQ6msbOvM", channel: "The Viral Fever", label: "Official trailer" },
  "mirzapur": { youtubeId: "4iao_ZoPuXk", channel: "Prime Video India", label: "Official trailer" },
  "special-ops": { youtubeId: "GF0H5DZAE2g", channel: "DisneyPlus Hotstar_IN", label: "Official trailer" },
  "suzhal-the-vortex": { youtubeId: "b2xE68VEjUs", channel: "Prime Video India", label: "Official trailer" },
  "kerala-crime-files": { youtubeId: "HU93EBeMUZs", channel: "JioHotstar Malayalam", label: "Official trailer" },
  "dhootha": { youtubeId: "-ITBFd_K5_M", channel: "Prime Video India", label: "Official trailer" },
  "squid-game": { youtubeId: "oqxAJKy0ii4", channel: "Netflix", label: "Official trailer" },
  "crash-landing-on-you": { youtubeId: "eXMjTXL2Vks", channel: "Netflix K-Content", label: "Official trailer" },
  "reply-1988": { youtubeId: "td2wneErbcQ", channel: "tvN DRAMA", label: "Official preview (tvN)" },
  "stranger-things": { youtubeId: "mnd7sFt5c3A", channel: "Rotten Tomatoes TV", label: "Official trailer" },
  "brooklyn-nine-nine": { youtubeId: "icTOP9F17pU", channel: "IGN", label: "Official trailer" },
  "breaking-bad": { youtubeId: "XZ8daibM3AE", channel: "Sony Pics at Home UK", label: "Official series trailer" },
  "the-office": { youtubeId: "kEiMppTHQs8", channel: "Prime Video Philippines", label: "Official trailer" },
  "fleabag": { youtubeId: "I5Uv6cb9YRs", channel: "Prime Video", label: "Official trailer" },
  "our-planet": { youtubeId: "aETNYyrqNYE", channel: "Netflix", label: "Official trailer" },
  "planet-earth-ii": { youtubeId: "c8aFcHFu8QM", channel: "BBC Earth", label: "Official extended trailer" },
  "chef-s-table": { youtubeId: "qKqj85oo2wI", channel: "Netflix", label: "Official trailer" },
  "the-last-dance": { youtubeId: "N9Z9JtNcCWY", channel: "ESPN", label: "Official trailer" },
  "my-octopus-teacher": { youtubeId: "3s0LTDhqe5A", channel: "Netflix", label: "Official trailer" },
  "free-solo": { youtubeId: "urRVZ4SW7WU", channel: "National Geographic", label: "Official trailer" },
  "the-elephant-whisperers": { youtubeId: "a0J0b_OVa9w", channel: "Netflix India", label: "Official trailer" },
  "searching-for-sugar-man": { youtubeId: "tDw7OqVBT-w", channel: "Sony Pictures Classics", label: "Official trailer" },};

const IA = "https://archive.org/download";
const PD = { license: "Public domain", licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/" } as const;
const CCBY = { license: "CC BY 3.0 · Blender Foundation", licenseUrl: "https://creativecommons.org/licenses/by/3.0/" } as const;

/**
 * Full films that MoodFlix may legally play. All are public domain or
 * Creative Commons, streamed straight from the Internet Archive.
 * `previewStart` is the second where the 30-second scene preview begins.
 */
export const STREAMS: Record<string, Stream> = {
  "night-of-the-living-dead": { src: `${IA}/Night.Of.The.Living.Dead_1080p/NightOfTheLivingDead_720p.mp4`, pageUrl: "https://archive.org/details/Night.Of.The.Living.Dead_1080p", previewStart: 1500, ...PD },
  "his-girl-friday": { src: `${IA}/his_girl_friday/his_girl_friday.mp4`, pageUrl: "https://archive.org/details/his_girl_friday", previewStart: 600, ...PD },
  "the-general": { src: `${IA}/The_General_Buster_Keaton/The_General.mp4`, pageUrl: "https://archive.org/details/The_General_Buster_Keaton", previewStart: 2400, ...PD },
  "sherlock-jr": { src: `${IA}/sherlockjr1924_201909/${encodeURIComponent("Sherlock Jr. - Buster Keaton (1924) HD [720p].mp4")}`, pageUrl: "https://archive.org/details/sherlockjr1924_201909", previewStart: 1200, ...PD },
  "detour": { src: `${IA}/Detour/Detour.mp4`, pageUrl: "https://archive.org/details/Detour", previewStart: 900, ...PD },
  "charade": { src: `${IA}/charade-1963-cary-grant-audrey-hepburn-comedy-mystery-romance-thriller-full-movie/Charade_READY.mp4`, pageUrl: "https://archive.org/details/charade-1963-cary-grant-audrey-hepburn-comedy-mystery-romance-thriller-full-movie", previewStart: 420, ...PD },
  "big-buck-bunny": { src: `${IA}/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4`, pageUrl: "https://archive.org/details/BigBuckBunny_124", previewStart: 60, ...CCBY },
  "sintel": { src: `${IA}/Sintel/sintel-2048-stereo.mp4`, pageUrl: "https://archive.org/details/Sintel", previewStart: 300, ...CCBY },
  "tears-of-steel": { src: `${IA}/Tears-of-Steel/tears_of_steel_720p.mp4`, pageUrl: "https://archive.org/details/Tears-of-Steel", previewStart: 120, ...CCBY },
  "elephants-dream": { src: `${IA}/ElephantsDream/ed_hd.mp4`, pageUrl: "https://archive.org/details/ElephantsDream", previewStart: 90, ...CCBY },
};
