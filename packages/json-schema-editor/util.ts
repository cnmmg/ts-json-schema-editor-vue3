export function clearAttr(obj: Record<string, unknown>): void {
    for(let key in obj){
        delete obj[key]
    }
}

/**
 * 快速拷贝两个对象的属性值
 * @param {*} source
 * @param {*} target
 */
export function copyAttr(source: Record<string, unknown>, target: Record<string, unknown>): void {
    Object.keys(target).forEach(key => {target[key] = source[key]})
}

export function isNull(ele: unknown): boolean {
    if(typeof ele === 'undefined'){
        return true;
    }else if(ele === null){
        return true;
    }else if(ele === ''){
        return true;
    }
    return false;
}

export function renamePropertyAndKeepKeyPrecedence(obj: Record<string, unknown>, [oldKey, newKey]: [string, string]): Record<string, unknown> {
    const descriptors = Object.getOwnPropertyDescriptors(obj)
    if (Object.prototype.hasOwnProperty.call(descriptors, oldKey)) {
        Object.entries(descriptors)
            .reduce((target, [key, descriptor]) => {
                Reflect.deleteProperty(target, key)
                if (key === oldKey) {
                    key = newKey
                }
                Reflect.defineProperty(target, key, descriptor)
                return target;
            }, obj)
    }
    return obj
}


export function _debounce(callback: (...args: any[]) => void, delay = 1000): (...args: any[]) => void {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return (...args: any[]) => { // 使用箭头函数，避免this问题
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            callback(...args); // 直接传递args，不需要使用apply
        }, delay);
    }
}
