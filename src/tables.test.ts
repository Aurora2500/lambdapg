import { beforeAll, describe, test } from "vitest";
import createDb from "pg-tmp";

import { table, column } from "./tables";
import { Integer, Text, integer, text } from "./datatype";
import { asObject, asType } from "./types";

describe("tables", () => {
	test("table", () => {
		const t = table("users", {
			id: column(integer()),
			name: column(text()),
			age: column(integer().null()),
		});
	});
})
