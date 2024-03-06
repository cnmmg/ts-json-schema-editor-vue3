import { ITypeWrapper, IValue, IAttribute } from './types';

const value: IValue = {
    description: null,
    maxProperties: null,
    minProperties: null
};

const attr: Record<string, IAttribute> = {
    description: {
        name: '描述',
        type: 'string',
    },
    maxProperties: {
        name: '最大属性个数',
        type: 'integer'
    },
    minProperties: {
        name: '最小属性个数',
        type: 'integer'
    }
};

const wrapper: ITypeWrapper = { value, attr };
export default wrapper;
