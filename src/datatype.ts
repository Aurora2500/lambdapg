type DataType = {
	readonly isNull: boolean;
	readonly type: string;
	readonly primitive: PrimitiveDataType;
}

abstract class PrimitiveDataType implements DataType {
	abstract type: string;
	readonly isNull = false;
	get primitive(): this {
		return this;
	}

	abstract isCompatible(dt: string): boolean;

	null(): Nullable<this> {
		return new Nullable(this);
	}
}

class Integer extends PrimitiveDataType {
	private discriminator: null = null;
	get type() { return "integer"; }
	constructor() {
		super();
	}

	static create(): Integer {
		return new Integer();
	}

	isCompatible(dt: string): boolean {
		return dt === "integer";
	}
}

class Text extends PrimitiveDataType {
	private discriminator: null = null;
	get type() { return "text"; }
	constructor() {
		super();
	}

	static create(): Text {
		return new Text();
	}

	isCompatible(dt: string): boolean {
		return dt === "text" || dt === "character varying";
	}

}

class Nullable<T extends PrimitiveDataType> implements DataType {
	readonly isNull = true;
	get type() { return `${this.innerType.type} null`; }
	get primitive(): T {
		return this.innerType;
	}
	constructor(public readonly innerType: T) {
	}
}

const integer = Integer.create;
const text = Text.create;

export {
	PrimitiveDataType,
	DataType,
	Integer,
	Text,
	Nullable,
	integer,
	text
}