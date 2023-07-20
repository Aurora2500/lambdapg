import { DataType, integer, text } from "./datatype";
import type { Query } from "./types";

export class Table<
	Shape extends { [key: string]: Column<DataType> } = { [key: string]: Column<DataType> }
> {
	constructor(public readonly name: string, public readonly columns: Shape) {
		for (const [key, value] of Object.entries(columns)) {
			if (value.name === undefined) {
				value.name = key;
			}
		}
	}

	static create<Shape extends { [key: string]: Column<DataType> }>(name: string, shape: Shape) {
		return new Table(name, shape)
	}

	select<Columns extends keyof Shape>(...columns: Columns[]): Query<Columns> {
		return {
			toSQL() {
				return ""
			}
		}
	}

	print_table() {
		console.log(`Table (${this.name}):`);
		for (const value of Object.values(this.columns)) {
			console.log(`  ${value.name}: ${value.datatype.type}`);
		}
	}
}

type ColumnOptions = {
	name?: string,
}

export class Column<DT extends DataType> {
	public name: string | undefined = undefined;
	readonly null: boolean = false;

	constructor(public readonly datatype: DT, options?: ColumnOptions) {
		if (options?.name) {
			this.name = options.name;
		}
	}

	hasName(): this is { name: string } & this {
		return this.name !== undefined;
	}

	static create<T extends DataType>(dt: T, options?: ColumnOptions): Column<T> {
		return new Column(dt, options);
	}
}

const table = Table.create;
const column = Column.create;

export {
	table,
	column
}

const userTable = table("users", {
	id: column(integer()),
	name: column(text()),
	age: column(integer(), { name: "userAge" }),
	token: column(text().null())
})

userTable.print_table();