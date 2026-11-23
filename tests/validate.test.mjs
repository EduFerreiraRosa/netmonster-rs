import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseLine, validate } from '../scripts/validate.mjs';

// Dados sintéticos de teste: não são células reais e não são distribuídos nos .ntm.
const line = '4G;724;04;13;35170;141311;270;-30.0;-51.0;ERB sintética de teste;6200';
const meta = {
  arquivo: 'databases/tim/tim-rs.ntm', linha: line, uf: 'RS', municipio: 'Teste',
  metodo: 'marcacao_manual_erb', evidencia: 'Evidência sintética de teste, sem torre real ou contribuição.',
  referencia: 'Teste automatizado', data_verificacao: '2026-01-01', atribuicao: 'Teste',
  licenca: 'CC-BY-4.0', coordenadas_da_erb: true, sem_dados_pessoais: true,
};
function fixture(t, contents = line + '\n', metadata = [meta]) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'netmonster-rs-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const d of ['databases/tim', 'databases/vivo', 'databases/claro', 'config', 'metadata']) fs.mkdirSync(path.join(root, d), { recursive: true });
  fs.writeFileSync(path.join(root, 'config/operadoras.json'), JSON.stringify({
    'databases/tim/tim-rs.ntm': ['04'], 'databases/vivo/vivo-rs.ntm': ['06'], 'databases/claro/claro-rs.ntm': ['05'],
  }));
  fs.writeFileSync(path.join(root, 'metadata/registros.json'), JSON.stringify(metadata));
  fs.writeFileSync(path.join(root, 'databases/tim/tim-rs.ntm'), contents);
  fs.writeFileSync(path.join(root, 'databases/vivo/vivo-rs.ntm'), '');
  fs.writeFileSync(path.join(root, 'databases/claro/claro-rs.ntm'), '');
  return root;
}

test('LTE mantém setor/eNB na ordem dos exemplos oficiais', () => {
  assert.match(parseLine(line, ['04']).identity, /141311:13$/);
  assert.throws(() => parseLine(line.replace(';13;35170;141311;', ';36175629;35170;141311;'), ['04']));
});
test('NR preserva NCI de 36 bits e campo ignorado vazio', () => {
  assert.doesNotThrow(() => parseLine('5G;724;06;68719476735;12345;;1007;-30;-51;Teste sintético;629952', ['06']));
  assert.throws(() => parseLine('5G;724;06;68719476736;12345;;1007;-30;-51;Teste sintético;629952', ['06']));
  assert.throws(() => parseLine('5G;724;06;100;152051;;393;-30;-51;Teste sintético;629952', ['06']));
});
test('aceita GSM e WCDMA incluindo UARFCN acima de 1023', () => {
  assert.doesNotThrow(() => parseLine('2G;724;04;123;35170;;12;-30;-51;Teste sintético;60', ['04']));
  assert.doesNotThrow(() => parseLine('3G;724;06;35796;21800;4011;211;-30;-51;Teste sintético;10812', ['06']));
});
test('rejeita sentinelas de GPS, campos extras, MNC errado e controles', () => {
  for (const invalid of [line.replace('-30.0', '2147483647'), line.replace('-30.0', 'NaN'),
    line.replace('-30.0', '0'), line + ';extra', line.replace(';04;', ';4;'),
    line.replace(';04;', ';05;'), line.replace('sintética', 'sintética\t')]) {
    assert.throws(() => parseLine(invalid, ['04']));
  }
});
test('somente código e canal admitem desconhecido', () => {
  assert.doesNotThrow(() => parseLine(line.replace(';270;', ';2147483647;').replace(';6200', ';2147483647'), ['04']));
  assert.throws(() => parseLine(line.replace(';35170;', ';2147483647;'), ['04']));
});
test('base com procedência passa', t => assert.deepEqual(validate(fixture(t)), { count: 1, errors: [] }));
test('base vazia é válida e reporta zero células', t => assert.deepEqual(validate(fixture(t, '', [])), { count: 0, errors: [] }));
test('linha sem procedência falha', t => assert.match(validate(fixture(t, line, [])).errors.join(' '), /falta procedência/));
test('metadado órfão falha', t => assert.match(validate(fixture(t, '')).errors.join(' '), /sem linha válida/));
test('duplicata com local ou canal diferente falha', t => {
  const other = line.replace('-30.0', '-30.1').replace(';6200', ';449');
  assert.match(validate(fixture(t, line + '\n' + other)).errors.join(' '), /duplicada/);
});
test('declaração falsa, método de recepção e data impossível falham', t => {
  for (const change of [{ sem_dados_pessoais: false }, { metodo: 'gps_telefone' }, { data_verificacao: '2026-02-30' }]) {
    assert.ok(validate(fixture(t, line, [{ ...meta, ...change }])).errors.length > 0);
  }
});
test('BOM, linha em branco e UTF-8 inválido falham', t => {
  for (const data of ['\uFEFF' + line, line + '\n\n', Buffer.from([0xff])]) {
    assert.ok(validate(fixture(t, data)).errors.length > 0);
  }
});
test('base fora da configuração não é ignorada', t => {
  const root = fixture(t);
  fs.writeFileSync(path.join(root, 'databases/tim/extra.ntm'), line);
  assert.match(validate(root).errors.join(' '), /sem configuração/);
});
