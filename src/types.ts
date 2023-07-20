import type { DataType, Nullable, Integer, Text } from "./datatype";
import type { Table } from "./tables"

export type Query<T> = {
	toSQL(): string
}

export type asType<T extends DataType> =
	T extends Nullable<infer U> ? asType<U> | null :
	(
		T extends Integer ? number :
		T extends Text ? string :
		never
	)

export type asObject<T extends Table> = {
	[K in keyof T["columns"]]: asType<T["columns"][K]["datatype"]>
}

