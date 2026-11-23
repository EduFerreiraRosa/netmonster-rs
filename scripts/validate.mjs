import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UNKNOWN = '2147483647';
const LIMITS = {
  '2G': [[1, 65534], [1, 65534], null, [0, 1030], [0, 1023]],
  '3G': [[1, 65535], [1, 65534], [1, 65535], [0, 511], [0, 16383]],
  '4G': [[0, 255], [1, 65534], [0, 1048575], [0, 503], [0, 2147483646]],
  '5G': [[0, 68719476735], [0, 65535], null, [0, 1007], [0, 2016666]],
};

function integer(value, range, label, allowUnknown = false) {
  if (allowUnknown && value === UNKNOWN) return;
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) ||
      Number(value) < range[0] || Number(value) > range[1]) {
    throw new Error(`${label}: inteiro fora de ${range.join('–')}`);
  }
}

export function parseLine(line, allowedMncs) {
  const c = line.split(';');
  if (c.length !== 11) throw new Error('Esperados exatamente 11 campos');
  const [tech, mcc, mnc, cid, area, node, code, lat, lon, location, channel] = c;
  if (!Object.hasOwn(LIMITS, tech)) throw new Error('Tecnologia fora do perfil');
  if (mcc !== '724') throw new Error('MCC deve ser 724');
  if (!/^\d{2}$/.test(mnc) || !allowedMncs.includes(mnc)) throw new Error('MNC não permitido para esta base');
  const ranges = LIMITS[tech];
  integer(cid, ranges[0], 'Identidade');
  integer(area, ranges[1], 'LAC/TAC');
  if (ranges[2]) integer(node, ranges[2], 'RNC/eNB');
  else if (node !== '') throw new Error('Campo ignorado deve ficar vazio');
  integer(code, ranges[3], 'Código rádio', true);
  integer(channel, ranges[4], 'Canal', true);
  for (const [value, min, max, label] of [[lat, -34, -27, 'Latitude'], [lon, -58, -49, 'Longitude']]) {
    if (!/^-?\d+(?:\.\d+)?$/.test(value) || !Number.isFinite(Number(value)) ||
        Number(value) < min || Number(value) > max) throw new Error(`${label} inválida ou fora da triagem RS`);
  }
  if (!location.trim() || location !== location.trim() || /[\p{Cc}\p{Cf}]/u.test(location) || location.length > 240) {
    throw new Error('Descrição vazia, longa ou com caracteres de controle');
  }
  // A área distingue identidades GSM/UMTS; LTE/NR são identificadas no PLMN.
  const identity = [tech, mcc, mnc, ...(tech === '2G' || tech === '3G' ? [Number(area)] : []),
    ...(tech === '3G' || tech === '4G' ? [Number(node)] : []), Number(cid)].join(':');
  return { identity };
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    if (e.isSymbolicLink()) throw new Error('Links simbólicos não são permitidos nas bases');
    return e.isDirectory() ? walk(p) : [p];
  });
}

export function validate(root = ROOT) {
  const errors = [];
  const records = new Map();
  const identities = new Map();
  let config, metadata;
  try {
    config = JSON.parse(fs.readFileSync(path.join(root, 'config/operadoras.json'), 'utf8'));
    metadata = JSON.parse(fs.readFileSync(path.join(root, 'metadata/registros.json'), 'utf8'));
    if (!Array.isArray(metadata)) throw new Error('Metadados devem ser uma lista');
    if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('Configuração inválida');
    const required = ['databases/vivo/vivo-rs.ntm', 'databases/claro/claro-rs.ntm', 'databases/tim/tim-rs.ntm'];
    if (required.some(p => !Object.hasOwn(config, p))) throw new Error('Falta base obrigatória de operadora');
    for (const [p, mncs] of Object.entries(config)) {
      if (!/^databases\/(vivo|claro|tim)\/[a-z0-9-]+\.ntm$/.test(p) ||
          !Array.isArray(mncs) || !mncs.length || mncs.some(m => !/^\d{2}$/.test(m))) {
        throw new Error('Configuração de arquivo/MNC inválida');
      }
    }
  } catch (e) { return { count: 0, errors: [`Configuração/metadados: ${e.message}`] }; }

  try {
    for (const p of walk(path.join(root, 'databases'))) {
      const rel = path.relative(root, p).split(path.sep).join('/');
      if (p.endsWith('.ntm') && !Object.hasOwn(config, rel)) errors.push(`${rel}: base sem configuração`);
    }
  } catch (e) { errors.push(e.message); }

  for (const [rel, mncs] of Object.entries(config)) {
    try {
      const data = fs.readFileSync(path.join(root, rel));
      const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(data);
      if (text.startsWith('\uFEFF')) throw new Error('UTF-8 deve ser sem BOM');
      const lines = text === '' ? [] : text.replace(/\r\n/g, '\n').split('\n');
      if (lines.at(-1) === '') lines.pop();
      for (let i = 0; i < lines.length; i++) {
        try {
          const { identity } = parseLine(lines[i], mncs);
          const label = `${rel}:${i + 1}`;
          if (identities.has(identity)) throw new Error(`Identidade duplicada/conflitante com ${identities.get(identity)}`);
          identities.set(identity, label);
          records.set(`${rel}\n${lines[i]}`, label);
        } catch (e) { errors.push(`${rel}:${i + 1}: ${e.message}`); }
      }
    } catch (e) { errors.push(`${rel}: ${e.message}`); }
  }

  const seen = new Set();
  for (const [i, m] of metadata.entries()) {
    try {
      if (!m || typeof m !== 'object' || Array.isArray(m)) throw new Error('Objeto esperado');
      const required = ['arquivo', 'linha', 'uf', 'municipio', 'metodo', 'evidencia', 'referencia',
        'data_verificacao', 'atribuicao', 'licenca', 'coordenadas_da_erb', 'sem_dados_pessoais'];
      if (Object.keys(m).some(k => !required.includes(k))) throw new Error('Campo de metadados não previsto');
      for (const k of required.filter(k => !['coordenadas_da_erb', 'sem_dados_pessoais'].includes(k))) {
        if (typeof m[k] !== 'string' || !m[k].trim()) throw new Error(`Campo obrigatório: ${k}`);
      }
      if (m.uf !== 'RS' || m.licenca !== 'CC-BY-4.0' || m.coordenadas_da_erb !== true || m.sem_dados_pessoais !== true) {
        throw new Error('UF/licença/declarações inválidas');
      }
      if (!['marcacao_manual_erb', 'fonte_explicita_torre'].includes(m.metodo)) throw new Error('Método não aceito');
      const d = new Date(`${m.data_verificacao}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(m.data_verificacao) || !Number.isFinite(d.valueOf()) ||
          d.toISOString().slice(0, 10) !== m.data_verificacao || d.valueOf() > Date.now()) throw new Error('Data inválida/futura');
      if (m.evidencia.trim().length < 30) throw new Error('Descreva a evidência e o vínculo com a torre');
      const key = `${m.arquivo}\n${m.linha}`;
      if (!records.has(key)) throw new Error('Metadado sem linha válida correspondente');
      if (seen.has(key)) throw new Error('Metadado duplicado');
      seen.add(key);
    } catch (e) { errors.push(`metadata/registros.json[${i}]: ${e.message}`); }
  }
  for (const [key, label] of records) if (!seen.has(key)) errors.push(`${label}: falta procedência válida`);
  return { count: records.size, errors };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = validate();
  for (const error of result.errors) console.error(error);
  console.log(`${result.count} células; ${result.errors.length} erros.`);
  if (result.count === 0 && !result.errors.length) console.log('Estrutura inicial vazia: nenhuma cobertura publicada.');
  process.exitCode = result.errors.length ? 1 : 0;
}
