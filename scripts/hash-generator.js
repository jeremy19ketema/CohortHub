const bcrypt = require('bcryptjs');

async function generate() {
    console.log('Generating password hashes...\n');
    const passwords = ['Admin123!', 'Instructor123!', 'Student123!'];
    
    console.log('Copy these into your database/seed.sql file:\n');
    console.log('-- === PASSWORD HASHES ===');
    
    for (const pwd of passwords) {
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(pwd, salt);
        const verify = await bcrypt.compare(pwd, hash);
        
        console.log(`-- Password: ${pwd}`);
        console.log(`-- Hash: ${hash}`);
        console.log(`-- Verified: ${verify ? 'YES' : 'NO'}`);
        console.log(`INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES`);
        console.log(`('demo_${pwd.toLowerCase().replace('!', '')}@cohorthub.com', '${hash}', 'Demo', 'User', 'student');`);
        console.log('---');
    }
    
    console.log('\n=== END OF HASHES ===');
    console.log('\nTo use these hashes, update the INSERT statements in database/seed.sql');
}

generate().catch(console.error);