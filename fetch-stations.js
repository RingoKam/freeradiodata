const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

// Radio Browser API endpoint
const RADIO_BROWSER_API = 'https://de1.api.radio-browser.info/json';

// Configuration
const BATCH_SIZE = 1000; // Number of stations to fetch per request
const DB_PATH = path.join('data', 'radio_stations.db');

// Language mapping object from process-languages.js
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

// Ensure data directory exists
if (!fs.existsSync('data')) {
    fs.mkdirSync('data', { recursive: true });
}

async function initializeDatabase() {
    const db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    // Create tables
    await db.exec(`
        CREATE TABLE IF NOT EXISTS stations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            favicon TEXT,
            tags TEXT,
            country TEXT,
            state TEXT,
            language TEXT,
            votes INTEGER DEFAULT 0,
            codec TEXT,
            bitrate INTEGER,
            lastcheckok INTEGER,
            lastchecktime TEXT,
            clicktimestamp TEXT,
            clickcount INTEGER DEFAULT 0,
            clicktrend INTEGER DEFAULT 0,
            ssl_error INTEGER DEFAULT 0,
            geo_lat REAL,
            geo_long REAL,
            has_extended_info INTEGER DEFAULT 0,
            homepage TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS station_tags (
            station_id TEXT,
            tag TEXT,
            PRIMARY KEY (station_id, tag),
            FOREIGN KEY (station_id) REFERENCES stations(id)
        );

        CREATE TABLE IF NOT EXISTS station_languages (
            station_id TEXT,
            language TEXT,
            PRIMARY KEY (station_id, language),
            FOREIGN KEY (station_id) REFERENCES stations(id)
        );

        CREATE INDEX IF NOT EXISTS idx_stations_country ON stations(country);
        CREATE INDEX IF NOT EXISTS idx_stations_language ON stations(language);
        CREATE INDEX IF NOT EXISTS idx_stations_codec ON stations(codec);
        CREATE INDEX IF NOT EXISTS idx_station_tags_tag ON station_tags(tag);
    `);

    return db;
}

async function fetchStationsBatch(offset, limit) {
    try {
        const response = await axios.get(`${RADIO_BROWSER_API}/stations`, {
            params: {
                offset,
                limit,
                order: 'stationcount',
                reverse: true
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching stations batch (offset: ${offset}):`, error.message);
        throw error;
    }
}

async function insertStation(db, station) {
    const stmt = await db.prepare(`
        INSERT OR REPLACE INTO stations (
            id, name, url, favicon, tags, country, state, language,
            votes, codec, bitrate, lastcheckok, lastchecktime,
            clicktimestamp, clickcount, clicktrend, ssl_error,
            geo_lat, geo_long, has_extended_info, homepage, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    try {
        // `Standa`rdize the language before inserting
        const standardizedLanguage = standardizeLanguage(station.language);

        await stmt.run(
            station.stationuuid,
            station.name,
            station.url,
            station.favicon,
            station.tags,
            station.country,
            station.state,
            standardizedLanguage,
            station.votes,
            station.codec,
            station.bitrate,
            station.lastcheckok,
            station.lastchecktime,
            station.clicktimestamp,
            station.clickcount,
            station.clicktrend,
            station.ssl_error,
            station.geo_lat,
            station.geo_long,
            station.has_extended_info ? 1 : 0,
            station.homepage
        );

        // Insert tags
        if (station.tags) {
            const tags = station.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            for (const tag of tags) {
                await db.run(
                    'INSERT OR IGNORE INTO station_tags (station_id, tag) VALUES (?, ?)',
                    [station.stationuuid, tag]
                );
            }
        }

        // Insert languages - now using standardized language names
        if (station.language) {
            const languages = station.language.split(',')
                .map(lang => lang.trim())
                .filter(lang => lang)
                .map(lang => standardizeLanguage(lang));
            
            for (const language of languages) {
                await db.run(
                    'INSERT OR IGNORE INTO station_languages (station_id, language) VALUES (?, ?)',
                    [station.stationuuid, language]
                );
            }
        }
    } finally {
        // Always finalize the statement
        await stmt.finalize();
    }
}

async function fetchAllStations() {
    try {
        // Initialize database
        const db = await initializeDatabase();
        console.log('Database initialized');

        // First, get total count
        const stats = await axios.get(`${RADIO_BROWSER_API}/stats`);
        const totalStations = stats.data.stations;
        console.log(`Total stations to fetch: ${totalStations}`);

        // Start transaction
        await db.run('BEGIN TRANSACTION');

        // Fetch stations in batches
        let offset = 0;
        let batchNumber = 1;
        let totalProcessed = 0;

        while (offset < totalStations) {
            console.log(`Fetching batch ${batchNumber} (offset: ${offset}, limit: ${BATCH_SIZE})...`);
            const stations = await fetchStationsBatch(offset, BATCH_SIZE);
            
            // Process each station
            for (const station of stations) {
                await insertStation(db, station);
            }
            
            totalProcessed += stations.length;
            console.log(`Processed ${stations.length} stations (Total: ${totalProcessed}/${totalStations})`);
            
            offset += BATCH_SIZE;
            batchNumber++;
        }

        // Commit transaction
        await db.run('COMMIT');
        console.log('\nAll stations processed and saved to database');

        // Generate summary
        const summary = {
            totalStations: await db.get('SELECT COUNT(*) as count FROM stations').then(row => row.count),
            languages: await db.all('SELECT language, COUNT(*) as count FROM station_languages GROUP BY language ORDER BY count DESC'),
            countries: await db.all('SELECT country, COUNT(*) as count FROM stations GROUP BY country ORDER BY count DESC'),
            tags: await db.all('SELECT tag, COUNT(*) as count FROM station_tags GROUP BY tag ORDER BY count DESC'),
            codecs: await db.all('SELECT codec, COUNT(*) as count FROM stations GROUP BY codec ORDER BY count DESC')
        };

        // Save summary to database
        await db.run('CREATE TABLE IF NOT EXISTS summary (key TEXT PRIMARY KEY, value TEXT)');
        await db.run('DELETE FROM summary');
        await db.run('INSERT INTO summary (key, value) VALUES (?, ?)', 
            ['last_updated', new Date().toISOString()]);
        await db.run('INSERT INTO summary (key, value) VALUES (?, ?)', 
            ['total_stations', summary.totalStations.toString()]);

        console.log('\nDatabase summary:');
        console.log(`Total stations: ${summary.totalStations}`);
        console.log('\nTop 5 languages:');
        summary.languages.slice(0, 5).forEach(lang => {
            console.log(`${lang.language}: ${lang.count} stations`);
        });

        await db.close();
        return summary;

    } catch (error) {
        console.error('Error fetching stations:', error.message);
        throw error;
    }
}

async function main() {
    try {
        console.log('Starting station data collection...');
        const summary = await fetchAllStations();
        
        console.log('\n=== Collection Complete ===');
        console.log(`Total stations collected: ${summary.totalStations}`);
        console.log(`Database location: ${DB_PATH}`);
        
    } catch (error) {
        console.error('Script failed:', error.message);
        process.exit(1);
    }
}

main();