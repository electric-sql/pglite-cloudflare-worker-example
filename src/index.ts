/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { PGlite } from '@electric-sql/pglite';
import wasm from '@electric-sql/pglite/dist/postgres.wasm';
import fsBinary from '@electric-sql/pglite/dist/share.data';

let pg: PGlite | null = null;

export default {
	async fetch(request, env, ctx): Promise<Response> {

		pg ??= new PGlite(undefined, {
			// debug:1,
			wasmModule: wasm,
			fsDataBinary: fsBinary,
		});

		const sql = `
			SELECT NOW() AS now, version() AS version;
			CREATE TABLE IF NOT EXISTS test (
				id INT PRIMARY KEY NOT NULL,
				name TEXT NOT NULL,
				counter INT DEFAULT 0
			);
			INSERT INTO test (id, name) VALUES (1, 'Hello, World!') ON CONFLICT DO NOTHING;
			UPDATE test SET counter = counter + 1 WHERE id = 1;
			SELECT * FROM test;
		`

		const ret = await pg.exec(sql);
		return new Response(JSON.stringify({
			about: 'This is a Cloudflare Worker running PostgreSQL via WASM using PGlite.',
			repo: 'http://github.com/electric-sql/pglite',
			sql,
			ret,
		}, null, 2), {
			headers: { 'content-type': 'application/json' },
		});
	},
} satisfies ExportedHandler<Env>;
