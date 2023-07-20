import { describe, test } from "vitest";

import { table, column } from "./tables";
import { Client, PGClient } from "./client";
import { integer, text } from "./datatype";

describe("client", () => {
	test("assert trough client", () => {
		const client = new Client(new PGClient());

		const usersTable = table("users", {
			id: column(integer()),
			name: column(text()),
			desc: column(text().null(), { name: "description" }),
		});
		const postsTable = table("posts", {
			id: column(integer()),
			post: column(text()),
			owner: column(integer()),
		});

		client.assertSchema([
			usersTable,
			postsTable,
		]);
	});
});