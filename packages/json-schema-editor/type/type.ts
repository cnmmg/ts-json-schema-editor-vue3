// 导入各类型定义
import _object from './object';
import _string from './string';
import _array from './array';
import _boolean from './boolean';
import _integer from './integer';
import _number from './number';

// 定义类型名称数组
const TYPE_NAME: string[] = ['string', 'number', 'integer', 'object', 'array', 'boolean'];

// 定义类型与其对应值的映射
interface ITypeMap {
    object: typeof _object;
    string: typeof _string;
    array: typeof _array;
    boolean: typeof _boolean;
    integer: typeof _integer;
    number: typeof _number;
}

const TYPE: ITypeMap = {
    'object': _object,
    'string': _string,
    'array': _array,
    'boolean': _boolean,
    'integer': _integer,
    'number': _number
};

export { TYPE, TYPE_NAME,ITypeMap };
