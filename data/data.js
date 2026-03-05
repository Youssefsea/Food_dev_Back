const { Pool, types } = require("pg");

// Parse NUMERIC/DECIMAL as JavaScript floats (OID 1700)
types.setTypeParser(1700, parseFloat);
// Parse BIGINT/INT8 as JavaScript numbers (OID 20) - used by COUNT(*)
types.setTypeParser(20, parseInt);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Connection check
pool.connect().then(client => {
    console.log('Database connected successfully');
    client.release();
}).catch(err => {
    console.error('Error connecting to the database:', err);
    process.exit(1);
});

/**
 * Convert MySQL-style ? placeholders to PostgreSQL $1, $2, ... placeholders.
 * Skips ? inside single-quoted string literals.
 */
function convertPlaceholders(sql) {
    let index = 0;
    let result = '';
    let inString = false;

    for (let i = 0; i < sql.length; i++) {
        const ch = sql[i];

        if (ch === "'" && !inString) {
            inString = true;
            result += ch;
        } else if (ch === "'" && inString) {
            // Handle escaped quotes ''
            if (i + 1 < sql.length && sql[i + 1] === "'") {
                result += "''";
                i++;
            } else {
                inString = false;
                result += ch;
            }
        } else if (ch === '?' && !inString) {
            index++;
            result += `$${index}`;
        } else {
            result += ch;
        }
    }

    return result;
}

/**
 * Wraps a pg query result to be compatible with mysql2/promise format.
 * - SELECT: returns [rows, fields]
 * - INSERT: returns [{insertId, affectedRows}, null]
 * - UPDATE/DELETE: returns [{affectedRows}, null]
 */
async function wrapQuery(queryFn, sql, params) {
    const pgSql = convertPlaceholders(sql);
    const trimmed = pgSql.trim().toUpperCase();
    const isInsert = trimmed.startsWith('INSERT');

    let finalSql = pgSql;
    if (isInsert && !trimmed.includes('RETURNING')) {
        finalSql = pgSql.replace(/;?\s*$/, '') + ' RETURNING id';
    }

    const result = await queryFn(finalSql, params || []);

    if (isInsert || trimmed.startsWith('UPDATE') || trimmed.startsWith('DELETE')) {
        const header = {
            insertId: (result.rows && result.rows.length > 0 && result.rows[0].id !== undefined)
                ? result.rows[0].id
                : null,
            affectedRows: result.rowCount
        };
        return [header, null];
    }

    // SELECT
    return [result.rows, result.fields];
}

// mysql2-compatible wrapper
const wrapper = {
    async query(sql, params) {
        return wrapQuery((text, values) => pool.query(text, values), sql, params);
    },

    async getConnection() {
        const client = await pool.connect();
        return {
            async query(sql, params) {
                return wrapQuery((text, values) => client.query(text, values), sql, params);
            },
            async beginTransaction() {
                await client.query('BEGIN');
            },
            async commit() {
                await client.query('COMMIT');
            },
            async rollback() {
                await client.query('ROLLBACK');
            },
            release() {
                client.release();
            }
        };
    }
};

module.exports = wrapper;
