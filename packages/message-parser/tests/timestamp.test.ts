// 时间戳解析功能测试文件
// 此文件测试 message-parser 包对各种格式时间戳的解析能力

// 导入主要的解析函数
import { parse } from '../src';
// 导入测试中使用的辅助函数和构建器
import {
  bold,      // 用于构建粗体文本节点
  paragraph, // 用于构建段落节点
  plain,     // 用于构建普通文本节点
  strike,    // 用于构建删除线文本节点
  timestamp, // 用于构建时间戳节点
  timestampFromHours, // 用于从小时/分钟/秒构建时间戳
} from '../src/utils';

// 测试基本时间戳格式解析
// 测试普通时间戳和相对时间戳格式
// 格式: <t:时间戳> 或 <t:时间戳:R>
test.each([
  [`<t:1708551317>`, [paragraph([timestamp('1708551317')])]],  // 标准时间戳格式
  [`<t:1708551317:R>`, [paragraph([timestamp('1708551317', 'R')])]], // 相对时间戳格式
  [
    'hello <t:1708551317>',
    [paragraph([plain('hello '), timestamp('1708551317')])], // 混合文本和时间戳
  ],
])('parses %p', (input, output) => {
  // 验证解析器是否能正确将输入解析为预期的节点结构
  expect(parse(input)).toMatchObject(output);
});

// 测试无效时间戳格式处理
// 验证解析器对无效时间戳格式的容错处理
// 无效格式应被视为普通文本

test.each([
  ['<t:1708551317:I>', [paragraph([plain('<t:1708551317:I>')])]], // 无效的时间戳格式标识
  ['<t:17>', [paragraph([plain('<t:17>')])]], // 时间戳太短，不符合要求
])('parses %p', (input, output) => {
  // 验证解析器是否将无效格式作为普通文本处理
  expect(parse(input)).toMatchObject(output);
});

// 测试时间戳与文本样式的组合
// 验证时间戳在不同文本样式中的解析行为

test.each([
  ['~<t:1708551317>~', [paragraph([strike([timestamp('1708551317')])])]], // 删除线中的时间戳
  ['*<t:1708551317>*', [paragraph([bold([plain('<t:1708551317>')])])]],   // 粗体中的时间戳（注：这里时间戳被当作普通文本）
])('parses %p', (input, output) => {
  // 验证解析器是否能正确处理样式嵌套中的时间戳
  expect(parse(input)).toMatchObject(output);
});

// 测试复杂时间戳格式解析
// 测试 ISO 格式日期时间和仅时间格式的解析

test.each([
  // 完整 ISO 格式日期时间解析（毫秒精度）
  [
    '<t:2025-07-22T10:00:00.000+00:00:R>',
    [
      paragraph([
        timestamp(
          (Date.parse('2025-07-22T10:00:00.000+00:00') / 1000).toString(),
          'R',
        ),
      ]),
    ],
  ],
  // ISO 格式日期时间（无毫秒）
  [
    '<t:2025-07-22T10:00:00+00:00:R>',
    [
      paragraph([
        timestamp(
          (Date.parse('2025-07-22T10:00:00+00:00') / 1000).toString(),
          'R',
        ),
      ]),
    ],
  ],
  // 仅时间格式（时:分:秒+时区）
  [
    '<t:10:00:00+00:00:R>',
    [
      paragraph([
        timestamp(timestampFromHours('10', '00', '00', '+00:00'), 'R'),
      ]),
    ],
  ],
  // 仅时间格式（时:分+时区）
  [
    '<t:10:00+00:00:R>',
    [
      paragraph([
        timestamp(timestampFromHours('10', '00', '00', '+00:00'), 'R'),
      ]),
    ],
  ],
  // 仅时间格式（默认格式标识 't'）
  [
    '<t:10:00:05+00:00>',
    [
      paragraph([
        timestamp(timestampFromHours('10', '00', '05', '+00:00'), 't'),
      ]),
    ],
  ],
  // 仅时间格式（无时区）
  [
    '<t:10:00+00:00>',
    [paragraph([timestamp(timestampFromHours('10', '00', '00'), 't')])],
  ],
  // 高精度 ISO 格式，带毫秒（验证整数时间戳转换）
  [
    '<t:2025-07-24T20:19:58.154+00:00:R>',
    [
      paragraph([
        timestamp(
          ((Date.parse('2025-07-24T20:19:58.154+00:00') / 1000) | 0).toString(),
          'R',
        ),
      ]),
    ],
  ],
])('parses %p', (input, output) => {
  // 验证解析器对各种复杂时间格式的处理
  expect(parse(input)).toMatchObject(output);
});
