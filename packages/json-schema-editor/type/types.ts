// 定义基础的属性描述接口
export interface IAttribute {
    name: string;
    type: 'string' | 'number' | 'integer' | 'boolean' | 'array';
    enums?: string[];
}

// 定义一个通用的值接口，以包含所有可能的属性
export interface IValue {
    description?: string | null;
    maximum?: number | null;
    minimum?: number | null;
    exclusiveMaximum?: boolean | null;
    exclusiveMinimum?: boolean | null;
    //eslint-disable-next-line
    enum?: any[] | null;
    minItems?: number | null;
    maxItems?: number | null;
    uniqueItems?: boolean;
    maxProperties?: number | null;
    minProperties?: number | null;
    maxLength?: number | null;
    minLength?: number | null;
    pattern?: string | null;
    format?: 'date' | 'date-time' | 'email' | 'hostname' | 'ipv4' | 'ipv6' | 'uri' | undefined;
    // 更多属性根据需要添加
}

// 定义通用的wrapper接口，包含value和attr
export interface ITypeWrapper {
    value: IValue;
    attr: Record<string, IAttribute>;
}
