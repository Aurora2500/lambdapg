import { Client as PGClient } from "pg";
import type { Table, Column } from "./tables";
import { type DataType, Text } from "./datatype";
import { Query, asObject } from "./types";

type Issue = {
	type: "missing table";
	table: string;
} | {
	type: "missing column";
	table: string;
	column: string;
} | {
	type: "wrong datatype";
	table: string;
	column: string;
}

export class Client {
	constructor(public client: PGClient) { }

	async assertSchema(tables: Table<{ [key: string]: Column<DataType> }>[]) {
		const issues: Issue[] = [];
		const tableNames = tables.map(t => t.name);

		const nameList = tableNames.map(name => `'${name}'`).join(", ");
		const queryTables = `
			SELECT table_name
			FROM information_schema.tables
			WHERE table_schema = 'public'
			AND table_name IN (${nameList});
		`;
		const tableResults = await this.client.query<{ table_name: string }>(queryTables);

		const existingTables = tableResults.rows.map(row => row.table_name);
		// add tables that are missing to issues
		for (const table of tableNames) {
			if (!existingTables.includes(table)) {
				issues.push({
					type: "missing table",
					table,
				});
			}
		}
		// make sure the existing tables are the same as the ones we want to assert
		const existingTableNames = existingTables.map(name => `'${name}'`).join(", ");
		const queryColumns = `
			SELECT table_name, column_name, data_type, is_nullable
			FROM information_schema.columns
			WHERE table_schema = 'public'
			AND table_name IN (${existingTableNames});
		`

		const columnResults = await this.client.query<{ table_name: string, column_name: string, data_type: string, is_nullable: "YES" | "NO" }>(queryColumns);
		const columnGrouping: { [table: string]: { [column: string]: { type: string, null: boolean } } } = {};
		for (const row of columnResults.rows) {
			if (!columnGrouping[row.table_name]) {
				columnGrouping[row.table_name] = {};
			}
			columnGrouping[row.table_name][row.column_name] = {
				type: row.data_type,
				null: row.is_nullable === "YES",
			};
		}

		for (const table of tables) {
			if (!existingTables.includes(table.name)) {
				continue;
			}
			//table exists, check its columns
			for (const col in table.columns) {
				const column = table.columns[col];
				if (!column.hasName()) {
					continue;
				}
				const existingColumn = columnGrouping[table.name][column.name];
				if (existingColumn === undefined) {
					issues.push({
						type: "missing column",
						table: table.name,
						column: column.name,
					});
					continue;
				}
				if (existingColumn.null && !column.datatype.isNull) {
					issues.push({
						type: "wrong datatype",
						table: table.name,
						column: column.name,
					});
					continue;
				}
				if (!column.datatype.primitive.isCompatible(existingColumn.type)) {
					issues.push({
						type: "wrong datatype",
						table: table.name,
						column: column.name,
					});
					continue;
				}
			}
		}

		if (issues.length !== 0) {
			throw new Error(`Schema assertion failed:\n\t${issues.map(issue => {
				switch (issue.type) {
					case "missing table":
						return `table '${issue.table}' is missing`;
					case "missing column":
						return `column '${issue.column}' is missing from table '${issue.table}'`;
					case "wrong datatype":
						return `column '${issue.column}' in table '${issue.table}' has a different datatype`;
				}
			}).join("\n\t- ")}`);
		}
	}

	async query<T extends Table>(query: Query<T>): Promise<asObject<T>[]> {
		const result = await this.client.query<asObject<T>>(query.toSQL());
		return result.rows as asObject<T>[];
	}
}

// export client from pg as PGClient
export { PGClient };

