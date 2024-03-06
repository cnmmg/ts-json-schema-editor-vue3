<script setup lang="ts">
import { defineProps, ref, computed,  defineExpose } from 'vue';
import { isNull, renamePropertyAndKeepKeyPrecedence } from './util';
import { TYPE_NAME, TYPE, ITypeMap } from './type/type';
import {
    SelectOption as ASelectOption,
    Textarea as ATextarea,
  FormItem as AFormItem,
  Switch as ASwitch,
  Checkbox as ACheckbox,
  Col as ACol,
  Row as ARow,
  Form as AForm,
  Button as AButton,
  Modal as AModal,
  Input as AInput, Select as ASelect, Tooltip as ATooltip, InputNumber as AInputNumber,
} from 'ant-design-vue';
import {CheckboxChangeEvent} from "ant-design-vue/lib/checkbox/interface";
import { CaretRightOutlined, CaretDownOutlined, SettingOutlined, PlusOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons-vue';
import {LangsMap} from './LocalProvider';
import LocalProvider from './LocalProvider';

const props = defineProps({
  value: {
    type: Object,
    required:true
  },
  disabled: { //name不可编辑，根节点name不可编辑,数组元素name不可编辑
    type: Boolean,
    default: false
  },
  disabledType: { //禁用类型选择
    type: Boolean,
    default: false
  },
  isItem: { //是否数组元素
    type: Boolean,
    default: false
  },
  deep: { // 节点深度，根节点deep=0
    type:Number,
    default: 0
  },
  root: { //是否root节点
    type:Boolean,
    default:true
  },
  parent: {
    type: Object,
    default: null
  },
  custom: { //enable custom properties
    type: Boolean,
    default: false
  },
  lang: {
    type: String as ()=>keyof LangsMap,
    default: 'zh_CN'
  }
});

const hidden = ref(false);
const modalVisible = ref(false);
const advancedValue = ref({});
const addProp = ref({ key: '', value: '' });
const customProps = ref<{ key: string; value: unknown }[]>([]);
const customing = ref(false);
const countAdd = ref(1);


const local = computed(() => LocalProvider(props.lang));

const pickValue = computed(() => Object.values(props.value)[0] as {
  type: keyof ITypeMap;
  title?: string;
  properties?: Record<string, unknown>;
  items?: { type: string; [key: string]: unknown };
});

const pickKey = computed(() => Object.keys(props.value)[0]);

const isObject = computed(() => pickValue.value.type === 'object');

const isArray = computed(() => pickValue.value.type === 'array');

const checked = computed(() => props.parent && props.parent.required && props.parent.required.includes(pickKey.value));

const advanced = computed(() => TYPE[pickValue.value.type]);

const advancedAttr = computed(() => {
  return TYPE[pickValue.value.type].attr
});

const ownProps = computed(() => ['type', 'title', 'properties', 'items', 'required', ...Object.keys(advancedAttr.value)]);

const advancedNotEmptyValue = computed(() => {
  const jsonNode = { ...advancedValue.value } as Record<string, unknown>;
  for (const key in jsonNode) {
    if (isNull(jsonNode[key])) {
      delete jsonNode[key];
    }
  }
  return jsonNode;
});

const completeNodeValue = computed(() => {
  const t: { [key: string]: unknown } = {};
  const basicValue = { ...pickValue.value } as Record<string, unknown>;
  for (const item of customProps.value) {
    t[item.key] = item.value;
  }
  // Assuming _pickDiffKey is a method to filter out keys not in ownProps
  const diffKeys = _pickDiffKey(); // You need to implement _pickDiffKey logic accordingly
  diffKeys.forEach(key => delete basicValue[key]);
  return { ...basicValue, ...t, ...advancedNotEmptyValue.value };
});

const enumText = computed(() => {
  // 使用 as 断言来访问 enum 属性
  const t = (advancedValue.value as { enum?: string[] })['enum'];
  if (!t) return '';
  if (!t.length) return '';
  return t.join('\n');
});


// Methods
const onInputName = (e: Event) => {
  const oldKey = pickKey.value;
  const newKey = (e.target as HTMLInputElement).value;
  console.log(oldKey, newKey)
  if (oldKey === newKey) return;
  renamePropertyAndKeepKeyPrecedence(props.parent.properties, [oldKey, newKey]);

  const requiredKeys = props.parent.required || [];
  const oldIndex = requiredKeys.indexOf(oldKey);
  if (requiredKeys.length > 0 && oldIndex > -1) {
    requiredKeys.splice(oldIndex, 1);
    requiredKeys.push(newKey);
    // eslint-disable-next-line vue/no-mutating-props
    props.parent.required = [...new Set(requiredKeys)];
  }
};

const onChangeType = () => {
  parseCustomProps();
  const value = pickValue.value as Record<string, unknown>; // 临时断言为更宽泛的类型
  customProps.value.forEach(item => {
    delete value[item.key];
  });
  customProps.value = [];

  delete value['properties'];
  delete value['items'];
  delete value['required'];
  delete value['format'];
  delete value['enum'];

  if (isArray.value) {
    value['items'] = { type: 'string' };
  }
};

const onCheck = (e: CheckboxChangeEvent) => {
  _checked((e.target as HTMLInputElement).checked, props.parent);
};

const onRootCheck = (e: CheckboxChangeEvent) => {
  _deepCheck((e.target as HTMLInputElement).checked, pickValue.value);
};

const changeEnumValue = (e: Event) => {
  const pickType = pickValue.value.type;
  const value = (e.target as HTMLInputElement).value;
  const arr = value.split('\n');

  // 使用类型断言来临时将 advancedValue.value 视为一个更宽泛的类型
  const advancedValueTemp = advancedValue.value as Record<string, unknown>;

  if (pickType === 'string') {
    advancedValueTemp.enum = arr;
  } else {
    advancedValueTemp.enum = arr.length === 0 || (arr.length === 1 && arr[0] === '') ? null : arr.map(item => parseFloat(item));
  }
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _deepCheck = (checked: boolean, node: any) => {
  if (node.type === 'object' && node.properties) {
    checked ? node['required'] = Object.keys(node.properties) : delete node['required'];
    Object.keys(node.properties).forEach(key => _deepCheck(checked, node.properties[key]));
  } else if (node.type === 'array' && node.items.type === 'object') {
    checked ? node.items['required'] = Object.keys(node.items.properties) : delete node.items['required'];
    Object.keys(node.items.properties).forEach(key => _deepCheck(checked, node.items.properties[key]));
  }
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _checked = (checked: boolean, parent: any) => {
  console.log(parent)
  let required = parent.required;
  if (checked) {
    required || (parent['required'] = []);
    required = parent.required;
    required.indexOf(pickKey.value) === -1 && required.push(pickKey.value);
  } else {
    const pos = required.indexOf(pickKey.value);
    pos >= 0 && required.splice(pos, 1);
  }
  required.length === 0 && delete parent['required'];
};

const addChild = () => {
  const name = _joinName();
  const type = 'string';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node:any = pickValue.value;
  node.properties || (node['properties'] = {});
  const props = node.properties;
  props[name] = { type: type };
};

const parseCustomProps = () => {
  const ownPropsVal = ownProps.value;
  const value = pickValue.value as Record<string, unknown>; // 临时断言为更宽泛的类型
  Object.keys(pickValue.value).forEach(key => {
    if (ownPropsVal.indexOf(key) === -1) {
      confirmAddCustomNode({ key: key, value: value[key] });
    }
  });
};

const addCustomNode = () => {
  addProp.value['key'] = _joinName();
  addProp.value['value'] = '';
  customing.value = true;
};

const removeCustomNode = (key: string) => {
  customProps.value = customProps.value.filter(item => item.key !== key);
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const confirmAddCustomNode = (prop: any) => {
  const p = prop || addProp.value;
  let existKey = false;
  customProps.value.forEach(item => {
    if (item.key === p.key) {
      existKey = true;
    }
  });
  if (existKey) return;
  customProps.value.push(p);
  addProp.value = { key: '', value: '' };
  customing.value = false;
};

const removeNode = () => {
  const { properties, required } = props.parent;
  delete properties[pickKey.value];
  if (required) {
    const pos = required.indexOf(pickKey.value);
    pos >= 0 && required.splice(pos, 1);
    // eslint-disable-next-line vue/no-mutating-props
    required.length === 0 && delete props.parent['required'];
  }
};

const _joinName = () => {
  return `field_${props.deep}_${countAdd.value++}`;
};

const onSetting = () => {
  // 首先，确保advancedValue.value可以被视为一个更宽泛的类型
  advancedValue.value = { ...advanced.value.value };
  const advancedValueTemp = advancedValue.value as Record<string, unknown>;

  // 同样对pickValue.value进行类型断言
  const value = pickValue.value as Record<string, unknown>;

  for (const k in advancedValueTemp) {
    if (value[k] !== undefined) { // 使用 !== undefined 来确保即使值为 null 也能被复制过去
      advancedValueTemp[k] = value[k];
    }
  }

  console.log(advancedValueTemp); // 注意：现在我们操作的是断言后的变量
  modalVisible.value = true;
  parseCustomProps();
};


const handleOk = () => {
  modalVisible.value = false;

  // 使用类型断言将 advancedValue.value 视为更宽泛的类型
  const advancedValueTemp = advancedValue.value as Record<string, unknown>;
  // 同样，对 pickValue.value 应用类型断言
  const pickValueTemp = pickValue.value as Record<string, unknown>;

  for (const key in advancedValueTemp) {
    if (isNull(advancedValueTemp[key])) {
      delete pickValueTemp[key];
    } else {
      pickValueTemp[key] = advancedValueTemp[key];
    }
  }

  const diffKey = _pickDiffKey();
  diffKey.forEach(key => delete pickValueTemp[key]);

  for (const item of customProps.value) {
    pickValueTemp[item.key] = item.value;
  }
};


const _pickDiffKey = () => {
  const keys = Object.keys(pickValue.value);
  return keys.filter(item => ownProps.value.indexOf(item) === -1);
};
//eslint-disable-next-line @typescript-eslint/no-explicit-any
function  debug(obj1:any,obj2:any){
  console.log(obj1,obj2)
  return false
}


defineExpose({
  onInputName,
  onChangeType,
  onCheck,
  onRootCheck,
  changeEnumValue,
  _deepCheck,
  _checked,
  addChild,
  parseCustomProps,
  addCustomNode,
  removeCustomNode,
  confirmAddCustomNode,
  removeNode,
  _joinName,
  onSetting,
  handleOk,
  _pickDiffKey
});
</script>

<template>
  <div class="json-schema-editor">
    <ARow class="row" :gutter="10">
      <ACol :span="8" class="ant-col-name">
        <div :style="{ marginLeft: `${20 * deep}px` }" class="ant-col-name-c">
          <AButton v-if="pickValue.type === 'object'" type="link" style="color: rgba(0, 0, 0, .65)" @click="hidden = !hidden">
            <template #icon>
              <caret-right-outlined v-if="hidden"/>
              <caret-down-outlined v-else/>
            </template>
          </AButton>
          <span v-else style="width: 32px; display: inline-block;"></span>
          <AInput :disabled="disabled || root" :default-value="pickKey" class="ant-col-name-input" @blur="onInputName" :key="pickValue"/>
        </div>
        <ATooltip v-if="root">
          <template v-slot:title>{{ local['checked_all'] }}</template>
          <ACheckbox :disabled="!isObject && !isArray" class="ant-col-name-required" @change="onRootCheck"/>
        </ATooltip>
        <ATooltip v-else>
          <template v-slot:title>{{ local['required'] }}</template>
          <ACheckbox :disabled="isItem" :checked="checked" class="ant-col-name-required" @change="onCheck"/>
        </ATooltip>
      </ACol>
      <ACol :span="4">
        <ASelect v-model:value="pickValue.type" :disabled="disabledType" class="ant-col-type" @change="onChangeType" :getPopupContainer="triggerNode => triggerNode.parentNode || document.body">
          <ASelectOption :key="t" v-for="t in TYPE_NAME" :value="t">{{ t }}</ASelectOption>
        </ASelect>
      </ACol>
      <ACol :span="6">
        <AInput v-model:value="pickValue.title" class="ant-col-title" :placeholder="local['title']"/>
      </ACol>
      <ACol :span="6" class="ant-col-setting">
        <ATooltip>
          <template v-slot:title>{{ local['adv_setting'] }}</template>
          <AButton type="link" class="setting-icon" @click="onSetting">
            <template #icon><setting-outlined /></template>
          </AButton>
        </ATooltip>
        <ATooltip v-if="isObject">
          <template v-slot:title>{{ local['add_child_node'] }}</template>
          <AButton type="link" class="plus-icon" @click="addChild">
            <template #icon><plus-outlined /></template>
          </AButton>
        </ATooltip>
        <ATooltip v-if="!root && !isItem">
          <template v-slot:title>{{ local['remove_node'] }}</template>
          <AButton type="link" class="close-icon ant-btn-icon-only" @click="removeNode">
            <close-outlined />
          </AButton>
        </ATooltip>
      </ACol>
    </ARow>
    <template v-if="!hidden && pickValue.properties && !isArray">
      <json-schema-editor v-for="(item, key, index) in pickValue.properties" :value="{ [key]: item }" :parent="pickValue" :key="index" :deep="deep + 1" :root="false" class="children" :lang="lang" :custom="custom"/>
    </template>
    <template v-if="isArray">
      <json-schema-editor :value="{ items: pickValue.items }" :deep="deep + 1" disabled isItem :root="false" class="children" :lang="lang" :custom="custom"/>
    </template>
    <a-modal v-model:visible="modalVisible" v-if="modalVisible" :title="local['adv_setting']" :maskClosable="false" :okText="local['ok']" :cancelText="local['cancel']" width="800px" @ok="handleOk" wrapClassName="json-schema-editor-advanced-modal">
      <h3>{{ local['base_setting'] }}</h3>
      <AForm :model="advancedValue" class="ant-advanced-search-form">
        <ARow :gutter="6">
          <ACol :span="8" v-for="(item, key) in advancedValue" :key="key">
            <AFormItem>
              <span>{{ local[key] }}</span>
              <AInput-number v-model:value="advancedValue[key]" v-if="debug(key,advancedValue[key]) || advancedAttr[key].type === 'integer' || advancedAttr[key].type === 'number'" style="width: 100%" :placeholder="key"/>
              <span v-else-if="advancedAttr[key].type === 'boolean'" style="display: inline-block; width: 100%">
                <a-switch v-model:checked="advancedValue[key]"/>
              </span>
              <ATextarea @blur="changeEnumValue" v-model:value="enumText" :rows="2" v-else-if="key === 'enum'" :placeholder="local['enum_msg']"></ATextarea>
              <ASelect v-else-if="advancedAttr[key].type === 'array'" v-model:value="advancedValue[key]" style="width: 100%" :getPopupContainer="triggerNode => triggerNode.parentNode || document.body" :placeholder="local[key]">
                <ASelectOption value="">{{ local['nothing'] }}</ASelectOption>
                <ASelectOption :key="t" v-for="t in advancedAttr[key].enums" :value="t">{{ t }}</ASelectOption>
              </ASelect>
              <AInput v-model:value="advancedValue[key]" v-else style="width: 100%" :placeholder="key"/>
            </AFormItem>
          </ACol>
        </ARow>
      </AForm>
      <h3 v-show="custom">{{ local['add_custom'] }}</h3>
      <AForm class="ant-advanced-search-form" v-show="custom">
        <ARow :gutter="6">
          <ACol :span="8" v-for="item in customProps" :key="item.key">
            <AFormItem :label="item.key">
              <AInput v-model:value="item.value" style="width: calc(100% - 30px)"/>
              <AButton type="link" @click="removeCustomNode(item.key)" style="width: 30px">
                <close-outlined />
              </AButton>
            </AFormItem>
          </ACol>
          <ACol :span="8" v-show="addProp.key !== undefined">
            <AFormItem>
              <template #label><AInput v-model:value="addProp.key" style="width: 100px"/></template>
              <AInput v-model:value="addProp.value" style="width: 100%"/>
            </AFormItem>
          </ACol>
          <ACol :span="8">
            <AFormItem>
              <AButton type="link" @click="confirmAddCustomNode(null)" v-if="customing">
                <check-outlined />
              </AButton>
              <ATooltip :title="local['add_custom']" v-else>
                <AButton type="link" @click="addCustomNode">
                  <plus-outlined />
                </AButton>
              </ATooltip>
            </AFormItem>
          </ACol>
        </ARow>
      </AForm>
      <h3>{{ local['preview'] }}</h3>
      <pre style="width: 100%">{{ completeNodeValue }}</pre>
    </a-modal>
  </div>
</template>


<style scoped>
.json-schema-editor .row {
  display: flex;
  margin: 12px;
}
.json-schema-editor .row .ant-col-name {
  display: flex;
  align-items: center;
}
.json-schema-editor .row .ant-col-name .ant-col-name-c {
  display: flex;
  align-items: center;
}
.json-schema-editor .row .ant-col-name .ant-col-name-required {
  flex: 0 0 24px;
  text-align: center;
  padding-left: 5px;
}
.json-schema-editor .row .ant-col-type {
  width: 100%;
}
.json-schema-editor .row .ant-col-setting {
  display: inline-block;
}
.json-schema-editor .row .setting-icon {
  color: rgba(0, 0, 0, 0.45);
  border: none;
}
.json-schema-editor .row .plus-icon {
  border: none;
}
.json-schema-editor .row .close-icon {
  color: #888;
  border: none;
}
</style>
<style>
.json-schema-editor-advanced-modal {
  color: rgba(0, 0, 0, 0.65);
  min-width: 600px;
}
.json-schema-editor-advanced-modal pre {
  font-family: monospace;
  height: 100%;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 12px;
  width: 50%;
}
.json-schema-editor-advanced-modal h3 {
  display: block;
  border-left: 3px solid #1890ff;
  padding: 0 8px;
}
.json-schema-editor-advanced-modal .ant-advanced-search-form .ant-form-item {
  display: flex;
}
.json-schema-editor-advanced-modal .ant-advanced-search-form .ant-form-item .ant-form-item-control-wrapper {
  flex: 1;
}

</style>