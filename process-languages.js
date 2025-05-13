const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Radio Browser API endpoint
const RADIO_BROWSER_API = 'https://de1.api.radio-browser.info/json';

// Language mapping object similar to the Dart implementation
const languageMap = {
    // Chinese variations
    'chinese': 'Chinese',
    'china': 'Chinese',
    'mandarin': 'Chinese',
    'mandarin chinese': 'Chinese',
    'chinese mandarin': 'Chinese',
    '国语': 'Chinese',
    '中文': 'Chinese',
    '中国': 'Chinese',
    'cantonese': 'Chinese',
    'hakka': 'Chinese',
    'hokkien': 'Chinese',
    'teochew': 'Chinese',
    'chaoshan dialect': 'Chinese',
    
    // English variations
    'english': 'English',
    'american english': 'English',
    'british english': 'English',
    'australian': 'English',
    'engilsh': 'English',
    'engilsh uk': 'English',
    'engish': 'English',
    'englisg': 'English',
    'englsih': 'English',
    'englsh': 'English',
    'engllish': 'English',
    'englisj': 'English',
    'caribbean english': 'English',
    'english uk': 'English',
    'english/': 'English',
    'engels': 'English',
    'en gb': 'English',
    'английский': 'English',
    
    // Spanish variations
    'spanish': 'Spanish',
    'español': 'Spanish',
    'castellano': 'Spanish',
    'andaluz.español': 'Spanish',
    'espa': 'Spanish',
    'españa': 'Spanish',
    'españo': 'Spanish',
    'español - latinoamerica': 'Spanish',
    'español argentina': 'Spanish',
    'español chile': 'Spanish',
    'español colombia': 'Spanish',
    'español costa rica': 'Spanish',
    'español ecuador': 'Spanish',
    'español internacional': 'Spanish',
    'español mexico': 'Spanish',
    'español paraguay': 'Spanish',
    'español peruano': 'Spanish',
    'espaňol': 'Spanish',
    'espsñol': 'Spanish',
    'castellano. español': 'Spanish',
    'castilian': 'Spanish',
    'castelhano': 'Spanish',
    'испанский': 'Spanish',
    
    // Arabic variations
    'arabic': 'Arabic',
    'arabi': 'Arabic',
    'arapça': 'Arabic',
    'arabesk': 'Arabic',
    'العربية': 'Arabic',
    'عربي': 'Arabic',
    'عربية': 'Arabic',
    'moroccan arabic': 'Arabic',
    
    // Japanese variations
    'japanese': 'Japanese',
    'japan': 'Japanese',
    '日本語': 'Japanese',
    'japones': 'Japanese',
    
    // Korean variations
    'korean': 'Korean',
    'korea': 'Korean',
    '한국어': 'Korean',
    
    // French variations
    'french': 'French',
    'français': 'French',
    'francaise': 'French',
    'franch': 'French',
    'francés': 'French',
    'louisiana french': 'French',
    
    // German variations
    'german': 'German',
    'deutsch': 'German',
    'deu': 'German',
    'deutsch fränkisch': 'German',
    'gernan': 'German',
    'schweizerdeutsch': 'German',
    'pfälzisch': 'German',
    'norddeutsch': 'German',
    'sächsisch': 'German',
    'kölscher dialekt': 'German',
    '德语': 'German',
    
    // Russian variations
    'russian': 'Russian',
    'русский': 'Russian',
    'rus': 'Russian',
    'rossia': 'Russian',
    'язык: russia': 'Russian',
    'язык: ру': 'Russian',
    'язык: русский': 'Russian',
    'язык: русский английский': 'Russian',
    
    // Portuguese variations
    'portuguese': 'Portuguese',
    'português': 'Portuguese',
    'brazilian portuguese': 'Portuguese',
    'portugues do braasil': 'Portuguese',
    'portugues do brasil': 'Portuguese',
    'português  brasil': 'Portuguese',
    'português (br)': 'Portuguese',
    'português (brasil)': 'Portuguese',
    'pt-br': 'Portuguese',
    'portoguese': 'Portuguese',
    'portguese': 'Portuguese',
    'porguês': 'Portuguese',
    'port': 'Portuguese',
    'por': 'Portuguese',
    
    // Italian variations
    'italian': 'Italian',
    'italiano': 'Italian',
    
    // Dutch variations
    'dutch': 'Dutch',
    'nederlands': 'Dutch',
    'durch': 'Dutch',
    'holland': 'Dutch',
    'nederland': 'Dutch',
    'nedersaksisch': 'Dutch',
    'limburgs': 'Dutch',
    'twents': 'Dutch',
    'belge': 'Dutch',
    
    // Hindi variations
    'hindi': 'Hindi',
    'हिंदी': 'Hindi',
    'hindu': 'Hindi',
    
    // Turkish variations
    'turkish': 'Turkish',
    'türkçe': 'Turkish',
    'türkisch': 'Turkish',
    'türkish': 'Turkish',
    'turkt': 'Turkish',
    'turkçe': 'Turkish',
    
    // Ukrainian variations
    'ukrainian': 'Ukrainian',
    'ukranian': 'Ukrainian',
    'ukraninan': 'Ukrainian',
    'ukrainisch': 'Ukrainian',
    'украина': 'Ukrainian',
    'ucrânia': 'Ukrainian',
    
    // Polish variations
    'polish': 'Polish',
    'śląski': 'Polish',
    
    // Czech variations
    'czech': 'Czech',
    'česky': 'Czech',
    
    // Romanian variations
    'romanian': 'Romanian',
    'româna': 'Romanian',
    'românä': 'Romanian',
    'română': 'Romanian',
    'moldovan': 'Romanian',
    'moldovian': 'Romanian',
    'молдавский': 'Romanian',
    
    // Greek variations
    'greek': 'Greek',
    'greel': 'Greek',
    
    // Hungarian variations
    'hungarian': 'Hungarian',
    'ungarisch': 'Hungarian',
    
    // Bulgarian variations
    'bulgarian': 'Bulgarian',
    'bulgaria': 'Bulgarian',
    
    // Croatian variations
    'croatian': 'Croatian',
    'croatia': 'Croatian',
    'kroatisch': 'Croatian',
    
    // Serbian variations
    'serbian': 'Serbian',
    'српски': 'Serbian',
    
    // Slovak variations
    'slovak': 'Slovak',
    
    // Slovenian variations
    'slovenian': 'Slovenian',
    'slovenski': 'Slovenian',
    'slowenisch': 'Slovenian',
    
    // Belarusian variations
    'belarusian': 'Belarusian',
    'беларуская': 'Belarusian',
    
    // Lithuanian variations
    'lithuanian': 'Lithuanian',
    
    // Latvian variations
    'latvian': 'Latvian',
    'latviešu': 'Latvian',
    
    // Estonian variations
    'estonian': 'Estonian',
    'eesti': 'Estonian',
    
    // Finnish variations
    'finnish': 'Finnish',
    'suomi': 'Finnish',
    'finish': 'Finnish',
    
    // Swedish variations
    'swedish': 'Swedish',
    'swe': 'Swedish',
    
    // Norwegian variations
    'norwegian': 'Norwegian',
    'norsk': 'Norwegian',
    'norwwegian': 'Norwegian',
    
    // Danish variations
    'danish': 'Danish',
    'dansk/oldnordisk': 'Danish',
    
    // Icelandic variations
    'icelandic': 'Icelandic',
    
    // Vietnamese variations
    'vietnamese': 'Vietnamese',
    '月南': 'Vietnamese',
    
    // Thai variations
    'thai': 'Thai',
    'ภาษาไทย': 'Thai',
    
    // Indonesian variations
    'indonesian': 'Indonesian',
    'bahasa indonesia': 'Indonesian',
    
    // Malay variations
    'malay': 'Malay',
    'melayu': 'Malay',
    'kelantanese malay': 'Malay',
    
    // Tagalog variations
    'tagalog': 'Tagalog',
    'filipino': 'Tagalog',
    
    // Bengali variations
    'bengali': 'Bengali',
    'bangla': 'Bengali',
    
    // Tamil variations
    'tamil': 'Tamil',
    
    // Telugu variations
    'telugu': 'Telugu',
    
    // Kannada variations
    'kannada': 'Kannada',
    
    // Malayalam variations
    'malayalam': 'Malayalam',
    'ml': 'Malayalam',
    
    // Punjabi variations
    'punjabi': 'Punjabi',
    'punjab': 'Punjabi',
    'panjabi': 'Punjabi',
    
    // Gujarati variations
    'gujarati': 'Gujarati',
    'gujrati': 'Gujarati',
    
    // Marathi variations
    'marathi': 'Marathi',
    
    // Nepali variations
    'nepali': 'Nepali',
    
    // Sinhala variations
    'sinhala': 'Sinhala',
    'sinhalese': 'Sinhala',
    
    // Burmese variations
    'burmese': 'Burmese',
    
    // Khmer variations
    'khmer': 'Khmer',
    
    // Lao variations
    'lao': 'Lao',
    
    // Mongolian variations
    'mongolian': 'Mongolian',
    'monoglian': 'Mongolian',
    
    // Kazakh variations
    'kazakh': 'Kazakh',
    
    // Uzbek variations
    'uzbek': 'Uzbek',
    
    // Kyrgyz variations
    'kyrgyz': 'Kyrgyz',
    
    // Tajik variations
    'tajik': 'Tajik',
    
    // Turkmen variations
    'turkmen': 'Turkmen',
    
    // Persian variations
    'persian': 'Persian',
    'iran': 'Persian',
    'irani': 'Persian',
    'iranian': 'Persian',
    
    // Kurdish variations
    'kurdish': 'Kurdish',
    'kurdi': 'Kurdish',
    'kurdish.': 'Kurdish',
    
    // Hebrew variations
    'hebrew': 'Hebrew',
    'he': 'Hebrew',
    
    // Yiddish variations
    'yiddish': 'Yiddish',
    
    // Amharic variations
    'amharic': 'Amharic',
    
    // Swahili variations
    'swahili': 'Swahili',
    'kiswahili': 'Swahili',
    
    // Hausa variations
    'hausa': 'Hausa',
    'hausa l': 'Hausa',
    
    // Yoruba variations
    'yoruba': 'Yoruba',
    
    // Igbo variations
    'ibo': 'Igbo',
    
    // Zulu variations
    'zulu': 'Zulu',
    'isizulu': 'Zulu',
    
    // Xhosa variations
    'xhosa': 'Xhosa',
    'isixhosa': 'Xhosa',
    
    // Afrikaans variations
    'afrikaans': 'Afrikaans',
    
    // Sesotho variations
    'sesotho': 'Sesotho',
    
    // Setswana variations
    'setswana': 'Setswana',
    
    // Sepedi variations
    'sepedi': 'Sepedi',
    
    // Tshivenda variations
    'tshivenda': 'Tshivenda',
    'tshivenḓa': 'Tshivenda',
    
    // Xitsonga variations
    'xitsonga': 'Xitsonga',
    
    // Siswati variations
    'siswati': 'Siswati',
    
    // IsiNdebele variations
    'isindebele': 'IsiNdebele',
    
    // Music/No Language variations
    'music': 'Music',
    'only music': 'Music',
    '音乐': 'Music',
    'pop music': 'Music',
    'rock': 'Music',
    'soul': 'Music',
    'rnb': 'Music',
    'hiphop': 'Music',
    'vaporwave': 'Music',
    'chill': 'Music',
    'hits': 'Music',
    'top 40': 'Music',
    'soft': 'Music',
    'roots': 'Music',
    'evergreens': 'Music',
    '80s': 'Music',
    'sing along': 'Music',
    'samba e pagode': 'Music'
};

// Reverse map to store all variations for each standardized language
const reverseMap = {};

// Initialize the reverse map
function initializeReverseMap() {
    if (Object.keys(reverseMap).length > 0) return; // Already initialized

    Object.entries(languageMap).forEach(([variation, standard]) => {
        if (!reverseMap[standard]) {
            reverseMap[standard] = [];
        }
        reverseMap[standard].push(variation);
    });
}

function standardizeLanguage(language) {
    // Convert to lowercase for case-insensitive matching
    const normalizedLanguage = language.toLowerCase().trim();
    
    // Check if we have a direct mapping
    if (languageMap[normalizedLanguage]) {
        return languageMap[normalizedLanguage];
    }
    
    // If no mapping found, return the original language name
    // but capitalize the first letter
    return language.length === 0 ? language : 
           language[0].toUpperCase() + language.substring(1);
}

async function fetchTotalStations() {
    try {
        const response = await axios.get(`${RADIO_BROWSER_API}/stats`);
        return response.data;
    } catch (error) {
        console.error('Error fetching station stats:', error.message);
        throw error;
    }
}

async function fetchLanguages() {
    try {
        const response = await axios.get(`${RADIO_BROWSER_API}/languages`);
        return response.data;
    } catch (error) {
        console.error('Error fetching languages:', error.message);
        throw error;
    }
}

function processLanguages(languages) {
    // Initialize the reverse map
    initializeReverseMap();
    
    // Clean and deduplicate languages
    const seen = new Set();
    const processed = [];
    const languageStats = {};
    
    for (const lang of languages) {
        const standardizedName = standardizeLanguage(lang.name);
        
        if (!languageStats[standardizedName]) {
            languageStats[standardizedName] = {
                name: standardizedName,
                iso_639: lang.iso_639,
                stationcount: 0,
                variations: new Set()
            };
        }
        
        // Add to stats
        languageStats[standardizedName].stationcount += lang.stationcount;
        languageStats[standardizedName].variations.add(lang.name);
        
        // Only add to processed list if we haven't seen this standardized name
        if (!seen.has(standardizedName)) {
            seen.add(standardizedName);
            processed.push({
                name: standardizedName,
                iso_639: lang.iso_639,
                stationcount: languageStats[standardizedName].stationcount,
                variations: Array.from(languageStats[standardizedName].variations)
            });
        }
    }
    
    // Sort by station count (descending)
    return processed.sort((a, b) => b.stationcount - a.stationcount);
}

async function saveToFile(data, filename) {
    try {
        await fs.writeFile(
            filename,
            JSON.stringify(data, null, 2),
            'utf8'
        );
        console.log(`Successfully saved to ${filename}`);
    } catch (error) {
        console.error('Error saving file:', error.message);
        throw error;
    }
}

async function main() {
    try {
        console.log('Fetching data from Radio Browser API...');
        
        // Fetch both station stats and languages in parallel
        const [stats, languages] = await Promise.all([
            fetchTotalStations(),
            fetchLanguages()
        ]);
        
        console.log('\n=== Radio Browser API Statistics ===');
        console.log(`Total stations in API: ${stats.stations}`);
        console.log(`Total broken stations: ${stats.broken}`);
        console.log(`Total working stations: ${stats.working}`);
        console.log(`Total stations with clicks: ${stats.clicks}`);
        console.log(`Total stations with votes: ${stats.votes}`);
        
        console.log('\nProcessing languages...');
        const processedLanguages = processLanguages(languages);
        
        // Calculate statistics
        const totalStations = processedLanguages.reduce((sum, lang) => sum + lang.stationcount, 0);
        const totalUniqueLanguages = processedLanguages.length;
        const languagesWithStations = processedLanguages.filter(lang => lang.stationcount > 0).length;
        
        // Save processed data locally
        await saveToFile(processedLanguages, 'processed_languages.json');
        
        // Print language statistics
        console.log('\n=== Language Statistics ===');
        console.log(`Total stations by language: ${totalStations.toLocaleString()}`);
        console.log(`Total unique languages: ${totalUniqueLanguages.toLocaleString()}`);
        console.log(`Languages with stations: ${languagesWithStations.toLocaleString()}`);
        
        console.log('\nTop 10 languages by station count:');
        processedLanguages.slice(0, 10).forEach((lang, index) => {
            const percentage = ((lang.stationcount / totalStations) * 100).toFixed(1);
            console.log(`\n${index + 1}. ${lang.name}: ${lang.stationcount.toLocaleString()} stations (${percentage}%)`);
            console.log('   Variations:', lang.variations.join(', '));
        });
        
        // Show languages with most variations
        console.log('\nLanguages with most variations:');
        const sortedByVariations = [...processedLanguages]
            .sort((a, b) => b.variations.length - a.variations.length)
            .slice(0, 5);
        
        sortedByVariations.forEach((lang, index) => {
            console.log(`\n${index + 1}. ${lang.name}: ${lang.variations.length} variations`);
            console.log('   Variations:', lang.variations.join(', '));
        });
        
    } catch (error) {
        console.error('Script failed:', error.message);
        process.exit(1);
    }
}

main(); 