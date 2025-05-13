const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs').promises;

const DB_PATH = path.join('data', 'radio_stations.db');
const EXPORT_DIR = path.join('public', 'stations');

async function initializeDatabase() {
    return await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });
}

async function getStationsByLanguage(db, limit) {
    // Get all stations with their languages
    const stations = await db.all(`
        SELECT 
            s.id,
            s.name,
            s.url,
            s.favicon,
            s.tags,
            s.country,
            s.state,
            s.language,
            s.votes,
            s.codec,
            s.bitrate,
            s.homepage,
            sl.language as languages
        FROM stations s
        LEFT JOIN station_languages sl ON s.id = sl.station_id
    `);

    // Group stations by language
    const stationsByLanguage = {};
    
    for (const station of stations) {
        // Split languages and process each one
        const languages = station.languages ? station.languages.split(',') : [station.language];
        
        for (const lang of languages) {
            if (!lang) continue;
            
            if (!stationsByLanguage[lang]) {
                stationsByLanguage[lang] = [];
            }
            
            // Create a clean station object
            const cleanStation = {
                id: station.id,
                name: station.name,
                url: station.url,
                favicon: station.favicon,
                tags: station.tags ? station.tags.split(',').map(t => t.trim()) : [],
                country: station.country,
                state: station.state,
                language: lang,
                votes: station.votes,
                codec: station.codec,
                bitrate: station.bitrate,
                homepage: station.homepage
            };
            
            stationsByLanguage[lang].push(cleanStation);
        }
    }

    // if the language has less than limit, then skip
    for (const lang of Object.keys(stationsByLanguage)) {
        if (stationsByLanguage[lang].length <= limit) {
            delete stationsByLanguage[lang];
        }
    }
    
    return stationsByLanguage;
}

async function exportStations() {
    try {
        // Ensure export directory exists
        await fs.mkdir(EXPORT_DIR, { recursive: true });
        
        // Initialize database
        const db = await initializeDatabase();
        console.log('Database initialized');
        
        // Get stations grouped by language
        // station limit, if less than amount, then skip
        const stationLimit = 25;
        const stationsByLanguage = await getStationsByLanguage(db, stationLimit);
        console.log(`Found stations in ${Object.keys(stationsByLanguage).length} languages`);
        
        // Export each language to a separate file
        for (const [language, stations] of Object.entries(stationsByLanguage)) {
            // Create a safe filename from the language name
            // if(stations.length <= 20) continue;

            const safeLanguage = language.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const filename = path.join(EXPORT_DIR, `${safeLanguage}.json`);
            
            // Sort stations by votes (descending)
            stations.sort((a, b) => b.votes - a.votes);
            
            // Write to file
            await fs.writeFile(
                filename,
                JSON.stringify({
                    language: language,
                    count: stations.length,
                    stations: stations
                }, null, 2)
            );
            
            console.log(`Exported ${stations.length} stations for ${language} to ${filename}`);
        }
        
        // Create an index file with language statistics
        const index = Object.entries(stationsByLanguage).map(([language, stations]) => ({
            language: language,
            count: stations.length,
            filename: `${language.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`
        })).sort((a, b) => b.count - a.count);
        
        await fs.writeFile(
            path.join(EXPORT_DIR, 'index.json'),
            JSON.stringify({
                total_languages: index.length,
                total_stations: index.reduce((sum, lang) => sum + lang.count, 0),
                languages: index
            }, null, 2)
        );
        
        console.log('\nExport complete!');
        console.log(`Total languages: ${index.length}`);
        console.log(`Total stations: ${index.reduce((sum, lang) => sum + lang.count, 0)}`);
        console.log(`Files exported to: ${EXPORT_DIR}`);
        
        await db.close();
        
    } catch (error) {
        console.error('Export failed:', error.message);
        process.exit(1);
    }
}

exportStations(); 