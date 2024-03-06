// 导入 types.ts 中定义的接口
import { ITypeWrapper, IValue, IAttribute } from './types';

// 根据 number.js 定义 value 对象
const value: IValue = {
    description: null,
    maximum: null,
    minimum: null,
    exclusiveMaximum: null,
    exclusiveMinimum: null,
    enum: null
};

// 定义 attr 对象，包括每个属性的描述
const attr: Record<string, IAttribute> = {
    description: {
        name: '描述',
        type: 'string',
    },
    maximum: {
        name: '最大值',
        type: 'number'
    },
    minimum: {
        name: '最小值',
        type: 'number'
    },
    exclusiveMaximum: {
        name: '不包含最大值',
        type: 'boolean'
    },
    exclusiveMinimum: {
        name: '不包含最小值',
        type: 'boolean'
    },
    enum: {
        name: '枚举',
        type: 'array'
    }
};

// 将 value 和 attr 封装到 wrapper 中
const wrapper: ITypeWrapper = { value, attr };

// 导出 wrapper
export default wrapper;
