interface AttrProperty {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array';
}

interface Attr {
    description: AttrProperty;
    maximum: AttrProperty;
    minimum: AttrProperty;
    exclusiveMaximum: AttrProperty;
    exclusiveMinimum: AttrProperty;
    enum: AttrProperty;
}