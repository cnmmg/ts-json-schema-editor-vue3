import { ITypeWrapper, IValue, IAttribute } from './types';

const value: IValue = {
    description: null,
    maxLength: null,
    minLength: null,
    pattern: null,
    format: undefined,
    enum: undefined
};

const attr: Record<string, IAttribute> = {
    description: {
        name: '描述',
        type: 'string',
    },
    maxLength: {
        name: '最大字符数',
        type: 'integer'
    },
    minLength: {
        name: '最小字符数',
        type: 'integer'
    },
    pattern: {
        name: '正则表达式',
        type: 'string'
    },
    format: {
        name: '格式',
        type: 'array',
        enums: ['date', 'date-time', 'email', 'hostname', 'ipv4', 'ipv6', 'uri']
    },
    enum: {
        name: '枚举',
        type: 'array'
    }
};

const wrapper: ITypeWrapper = { value, attr };
export default wrapper;
