// 首先导入types.ts中定义的接口
import { ITypeWrapper, IValue, IAttribute } from './types';

// 使用IValue接口定义value的结构，注意适用于array类型的特定属性
const value: IValue = {
    description: null,
    minItems: null,
    maxItems: null,
    uniqueItems: false
};

// 使用IAttribute接口定义attr的结构，为每个属性提供名称和类型
const attr: Record<string, IAttribute> = {
    description: {
        name: '描述',
        type: 'string'
    },
    maxItems: {
        name: '最大元素个数',
        type: 'integer'
    },
    minItems: {
        name: '最小元素个数',
        type: 'integer'
    },
    uniqueItems: {
        name: '元素不可重复',
        type: 'boolean'
    }
};

// 使用ITypeWrapper接口定义wrapper的结构，包括value和attr
const wrapper: ITypeWrapper = { value, attr };

// 导出wrapper
export default wrapper;
// Path: boolean.ts