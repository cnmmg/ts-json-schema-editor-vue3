import { ITypeWrapper, IValue, IAttribute } from './types';

const value: IValue = {
    description: null
};

const attr: Record<string, IAttribute> = {
    description: {
        name: '描述',
        type: 'string',
    }
};

const wrapper: ITypeWrapper = { value, attr };
export default wrapper;
