/**
 * One-shot workbook fixture author for Feature 002 Phase 0.
 * Generates minimal OOXML .xlsx files per tests/fixtures/workbooks/README.md.
 * Post-generation verification uses read-excel-file/node (production parser dependency).
 *
 * Run: node scripts/generate-workbook-fixtures.mjs
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import readXlsxFile from 'read-excel-file/node';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'tests', 'fixtures', 'workbooks');

const EXPECTED_SHEETS = ['Project', 'Schedule', 'Delivery', 'Team', 'Risk'];

const SHEET_HEADERS = {
  Project: ['templateVersion', 'projectKey', 'projectName', 'asOfDate', 'snapshotLabel'],
  Schedule: ['slipDays', 'milestoneDueDate', 'onTimePercent'],
  Delivery: ['blockerState', 'changeRatePercent', 'trendPercent'],
  Team: ['engagementScore', 'completionPercent'],
  Risk: ['escalationPriority', 'gapPriority'],
};

/** Columns that must remain inline text (never numeric-coerced in OOXML). */
const TEXT_COLUMNS = new Set([
  'templateVersion',
  'projectKey',
  'projectName',
  'asOfDate',
  'snapshotLabel',
  'milestoneDueDate',
  'blockerState',
  'escalationPriority',
  'gapPriority',
]);

const PROJECT_BASE = {
  templateVersion: '1.0',
  projectKey: 'IMPORT-DEMO-001',
  projectName: 'Import Demo Complete',
  asOfDate: '2026-06-15',
  snapshotLabel: '',
};

const DIMENSION_BASE = {
  Schedule: { slipDays: '5', milestoneDueDate: '', onTimePercent: '85' },
  Delivery: { blockerState: 'advisory', changeRatePercent: '12', trendPercent: '-3' },
  Team: { engagementScore: '72', completionPercent: '90' },
  Risk: { escalationPriority: 'important', gapPriority: 'none' },
};

function rowFromRecord(headers, record) {
  return headers.map((h) => record[h] ?? '');
}

function buildSheets(overrides = {}) {
  const projectRow2 = { ...PROJECT_BASE, ...(overrides.project ?? {}) };
  const sheets = {
    Project: [rowFromRecord(SHEET_HEADERS.Project, projectRow2)],
    Schedule:
      overrides.scheduleRows ??
      [rowFromRecord(SHEET_HEADERS.Schedule, { ...DIMENSION_BASE.Schedule, ...(overrides.schedule ?? {}) })],
    Delivery:
      overrides.deliveryRows ??
      [rowFromRecord(SHEET_HEADERS.Delivery, { ...DIMENSION_BASE.Delivery, ...(overrides.delivery ?? {}) })],
    Team:
      overrides.teamRows ??
      [rowFromRecord(SHEET_HEADERS.Team, { ...DIMENSION_BASE.Team, ...(overrides.team ?? {}) })],
    Risk:
      overrides.riskRows ??
      [rowFromRecord(SHEET_HEADERS.Risk, { ...DIMENSION_BASE.Risk, ...(overrides.risk ?? {}) })],
  };
  if (overrides.includeHeaders !== false) {
    for (const name of Object.keys(sheets)) {
      sheets[name].unshift([...SHEET_HEADERS[name]]);
    }
  }
  return sheets;
}

const FIXTURES = [
  { file: 'complete-v1.xlsx', sheets: buildSheets() },
  { file: 'incomplete-team-empty-row2.xlsx', sheets: buildSheets({ teamRows: [] }) },
  {
    file: 'partial-schedule.xlsx',
    sheets: buildSheets({
      schedule: { slipDays: '8', milestoneDueDate: '', onTimePercent: '' },
    }),
  },
  {
    file: 'all-dimensions-empty-row2.xlsx',
    sheets: buildSheets({
      scheduleRows: [],
      deliveryRows: [],
      teamRows: [],
      riskRows: [],
    }),
  },
  {
    file: 'invalid-template-version.xlsx',
    sheets: buildSheets({ project: { templateVersion: '2.0' } }),
  },
  {
    file: 'missing-project-row2.xlsx',
    sheets: buildSheets(),
    emptyProjectRow2: true,
  },
  {
    file: 'extra-row3-data.xlsx',
    sheets: (() => {
      const s = buildSheets();
      s.Schedule.push(['', '', '']);
      s.Schedule[2][0] = '99';
      return s;
    })(),
  },
  {
    file: 'malformed-dimension-values.xlsx',
    sheets: buildSheets({
      team: { engagementScore: '150', completionPercent: '90' },
      delivery: {
        blockerState: 'not-a-valid-state',
        changeRatePercent: '12',
        trendPercent: '-3',
      },
    }),
  },
];

function colName(index) {
  let n = index + 1;
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cellXml(ref, value, columnName) {
  if (value === '' || value === undefined) return '';
  if (TEXT_COLUMNS.has(columnName)) {
    return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
  }
  const num = Number(value);
  if (!Number.isNaN(num) && String(value).trim() !== '') {
    return `<c r="${ref}"><v>${num}</v></c>`;
  }
  return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
}

function sheetToXml(sheetName, rows) {
  const headers = SHEET_HEADERS[sheetName];
  const rowXml = rows
    .map((row, rowIndex) => {
      const r = rowIndex + 1;
      const cells = row
        .map((value, colIndex) => {
          const columnName = headers[colIndex];
          const ref = `${colName(colIndex)}${r}`;
          return cellXml(ref, value, columnName);
        })
        .filter(Boolean)
        .join('');
      return `<row r="${r}">${cells}</row>`;
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowXml}</sheetData></worksheet>`;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** ZIP Store: compression method 0, general-purpose flag 0, uncompressed payload. */
function zipStore(files) {
  const parts = [];
  const central = [];
  let offset = 0;

  for (const [name, data] of files) {
    const nameBuf = Buffer.from(name, 'utf8');
    const crc = crc32(data);

    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);
    nameBuf.copy(localHeader, 30);

    parts.push(localHeader, data);

    const cd = Buffer.alloc(46 + nameBuf.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8);
    cd.writeUInt16LE(0, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(data.length, 20);
    cd.writeUInt32LE(data.length, 24);
    cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offset, 42);
    nameBuf.copy(cd, 46);
    central.push(cd);

    offset += localHeader.length + data.length;
  }

  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...parts, centralBuf, end]);
}

function buildXlsx(sheets) {
  const sheetNames = EXPECTED_SHEETS;
  const sheetFiles = sheetNames.map((name, i) => {
    const rows = sheets[name] ?? [[...SHEET_HEADERS[name]]];
    return [`xl/worksheets/sheet${i + 1}.xml`, Buffer.from(sheetToXml(name, rows), 'utf8')];
  });

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>
${sheetNames.map((name, i) => `<sheet name="${name}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}
</sheets>
</workbook>`;

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheetNames.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}
</Relationships>`;

  const files = [
    [
      '[Content_Types].xml',
      Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
${sheetNames.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}
</Types>`,
        'utf8',
      ),
    ],
    [
      '_rels/.rels',
      Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
        'utf8',
      ),
    ],
    ['xl/workbook.xml', Buffer.from(workbookXml, 'utf8')],
    ['xl/_rels/workbook.xml.rels', Buffer.from(workbookRels, 'utf8')],
    ...sheetFiles,
  ];

  return zipStore(files);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function rowRecord(headers, row) {
  const rec = {};
  headers.forEach((h, i) => {
    rec[h] = row[i];
  });
  return rec;
}

function isEmpty(value) {
  return value === undefined || value === null || value === '';
}

function expectString(actual, expected, label) {
  assert(typeof actual === 'string', `${label}: expected string "${expected}", got ${typeof actual} ${JSON.stringify(actual)}`);
  assert(actual === expected, `${label}: expected "${expected}", got "${actual}"`);
}

function expectNumber(actual, expected, label) {
  assert(typeof actual === 'number' && !Number.isNaN(actual), `${label}: expected number ${expected}, got ${JSON.stringify(actual)}`);
  assert(actual === expected, `${label}: expected ${expected}, got ${actual}`);
}

function expectEmpty(actual, label) {
  assert(isEmpty(actual), `${label}: expected empty, got ${JSON.stringify(actual)}`);
}

function sheetMap(parsed) {
  return Object.fromEntries(parsed.map((s) => [s.sheet, s.data]));
}

function row2Record(sheetName, data) {
  const headers = SHEET_HEADERS[sheetName];
  assert(data.length >= 1, `${sheetName}: missing header row`);
  if (data.length < 2) return null;
  return rowRecord(headers, data[1]);
}

function verifyCommonSheets(map, file) {
  const names = Object.keys(map);
  assert(
    names.length === EXPECTED_SHEETS.length && EXPECTED_SHEETS.every((n) => names.includes(n)),
    `${file}: worksheets must be exactly ${EXPECTED_SHEETS.join(', ')}; got ${names.join(', ')}`,
  );
  for (const name of EXPECTED_SHEETS) {
    const data = map[name];
    assert(data.length >= 1, `${file} ${name}: missing header row`);
    const headerRow = data[0].map(String);
    assert(
      JSON.stringify(headerRow) === JSON.stringify(SHEET_HEADERS[name]),
      `${file} ${name}: header mismatch expected ${JSON.stringify(SHEET_HEADERS[name])} got ${JSON.stringify(headerRow)}`,
    );
  }
}

function verifyCompleteLike(map, file, { templateVersion = '1.0' } = {}) {
  verifyCommonSheets(map, file);
  const project = row2Record('Project', map.Project);
  assert(project, `${file}: Project row 2 required`);
  expectString(project.templateVersion, templateVersion, `${file} Project.templateVersion`);
  expectString(project.projectKey, 'IMPORT-DEMO-001', `${file} Project.projectKey`);
  expectString(project.projectName, 'Import Demo Complete', `${file} Project.projectName`);
  expectString(project.asOfDate, '2026-06-15', `${file} Project.asOfDate`);

  const schedule = row2Record('Schedule', map.Schedule);
  assert(schedule, `${file}: Schedule row 2 required`);
  expectNumber(schedule.slipDays, 5, `${file} Schedule.slipDays`);
  expectNumber(schedule.onTimePercent, 85, `${file} Schedule.onTimePercent`);

  const delivery = row2Record('Delivery', map.Delivery);
  assert(delivery, `${file}: Delivery row 2 required`);
  expectString(delivery.blockerState, 'advisory', `${file} Delivery.blockerState`);
  expectNumber(delivery.changeRatePercent, 12, `${file} Delivery.changeRatePercent`);
  expectNumber(delivery.trendPercent, -3, `${file} Delivery.trendPercent`);

  const team = row2Record('Team', map.Team);
  assert(team, `${file}: Team row 2 required`);
  expectNumber(team.engagementScore, 72, `${file} Team.engagementScore`);
  expectNumber(team.completionPercent, 90, `${file} Team.completionPercent`);

  const risk = row2Record('Risk', map.Risk);
  assert(risk, `${file}: Risk row 2 required`);
  expectString(risk.escalationPriority, 'important', `${file} Risk.escalationPriority`);
  expectString(risk.gapPriority, 'none', `${file} Risk.gapPriority`);
}

const VERIFIERS = {
  'complete-v1.xlsx': (map) => verifyCompleteLike(map, 'complete-v1.xlsx'),
  'incomplete-team-empty-row2.xlsx': (map) => {
    verifyCommonSheets(map, 'incomplete-team-empty-row2.xlsx');
    const project = row2Record('Project', map.Project);
    expectString(project.templateVersion, '1.0', 'incomplete-team-empty-row2.xlsx Project.templateVersion');
    expectString(project.projectKey, 'IMPORT-DEMO-001', 'incomplete-team-empty-row2.xlsx Project.projectKey');
    expectString(project.asOfDate, '2026-06-15', 'incomplete-team-empty-row2.xlsx Project.asOfDate');
    for (const name of ['Schedule', 'Delivery', 'Risk']) {
      const row = row2Record(name, map[name]);
      assert(row, `incomplete-team-empty-row2.xlsx: ${name} row 2 required`);
    }
    assert(map.Team.length === 1, 'incomplete-team-empty-row2.xlsx: Team must have headers only');
    const schedule = row2Record('Schedule', map.Schedule);
    expectNumber(schedule.slipDays, 5, 'incomplete-team-empty-row2.xlsx Schedule.slipDays');
    expectNumber(schedule.onTimePercent, 85, 'incomplete-team-empty-row2.xlsx Schedule.onTimePercent');
  },
  'partial-schedule.xlsx': (map) => {
    verifyCommonSheets(map, 'partial-schedule.xlsx');
    const project = row2Record('Project', map.Project);
    expectString(project.templateVersion, '1.0', 'partial-schedule.xlsx Project.templateVersion');
    const schedule = row2Record('Schedule', map.Schedule);
    expectNumber(schedule.slipDays, 8, 'partial-schedule.xlsx Schedule.slipDays');
    expectEmpty(schedule.onTimePercent, 'partial-schedule.xlsx Schedule.onTimePercent');
  },
  'all-dimensions-empty-row2.xlsx': (map) => {
    verifyCommonSheets(map, 'all-dimensions-empty-row2.xlsx');
    const project = row2Record('Project', map.Project);
    expectString(project.templateVersion, '1.0', 'all-dimensions-empty-row2.xlsx Project.templateVersion');
    expectString(project.projectKey, 'IMPORT-DEMO-001', 'all-dimensions-empty-row2.xlsx Project.projectKey');
    expectString(project.asOfDate, '2026-06-15', 'all-dimensions-empty-row2.xlsx Project.asOfDate');
    for (const name of ['Schedule', 'Delivery', 'Team', 'Risk']) {
      assert(map[name].length === 1, `all-dimensions-empty-row2.xlsx: ${name} must have headers only`);
    }
  },
  'invalid-template-version.xlsx': (map) => {
    verifyCompleteLike(map, 'invalid-template-version.xlsx', { templateVersion: '2.0' });
  },
  'missing-project-row2.xlsx': (map) => {
    verifyCommonSheets(map, 'missing-project-row2.xlsx');
    assert(map.Project.length === 1, 'missing-project-row2.xlsx: Project must have headers only');
  },
  'extra-row3-data.xlsx': (map) => {
    verifyCompleteLike(map, 'extra-row3-data.xlsx');
    assert(map.Schedule.length >= 3, 'extra-row3-data.xlsx: Schedule must have row 3');
    const row3 = rowRecord(SHEET_HEADERS.Schedule, map.Schedule[2]);
    expectNumber(row3.slipDays, 99, 'extra-row3-data.xlsx Schedule row3 slipDays');
  },
  'malformed-dimension-values.xlsx': (map) => {
    verifyCommonSheets(map, 'malformed-dimension-values.xlsx');
    const project = row2Record('Project', map.Project);
    expectString(project.templateVersion, '1.0', 'malformed-dimension-values.xlsx Project.templateVersion');
    const team = row2Record('Team', map.Team);
    expectNumber(team.engagementScore, 150, 'malformed-dimension-values.xlsx Team.engagementScore');
    expectNumber(team.completionPercent, 90, 'malformed-dimension-values.xlsx Team.completionPercent');
    const delivery = row2Record('Delivery', map.Delivery);
    expectString(delivery.blockerState, 'not-a-valid-state', 'malformed-dimension-values.xlsx Delivery.blockerState');
    expectNumber(delivery.changeRatePercent, 12, 'malformed-dimension-values.xlsx Delivery.changeRatePercent');
    expectNumber(delivery.trendPercent, -3, 'malformed-dimension-values.xlsx Delivery.trendPercent');
  },
};

async function verifyWorkbook(file) {
  const path = join(OUT_DIR, file);
  const buf = await readFile(path);
  const parsed = await readXlsxFile(buf);
  const map = sheetMap(parsed);
  const sheetOrder = parsed.map((s) => s.sheet);
  assert(
    JSON.stringify(sheetOrder) === JSON.stringify(EXPECTED_SHEETS),
    `${file}: sheet order must be ${EXPECTED_SHEETS.join(', ')}; got ${sheetOrder.join(', ')}`,
  );
  VERIFIERS[file](map);
  return { file, sheets: sheetOrder, templateVersion: row2Record('Project', map.Project)?.templateVersion ?? null };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const hashes = {};

  for (const fixture of FIXTURES) {
    let sheets = fixture.sheets;
    if (fixture.emptyProjectRow2) {
      sheets = { ...sheets, Project: [[...SHEET_HEADERS.Project]] };
    }
    const buf = buildXlsx(sheets);
    const outPath = join(OUT_DIR, fixture.file);
    await writeFile(outPath, buf);
    hashes[fixture.file] = createHash('sha256').update(buf).digest('hex').toUpperCase();
    console.log(`Wrote ${fixture.file} SHA-256=${hashes[fixture.file]}`);
  }

  const binContent = Buffer.from('not an xlsx file', 'utf8');
  await writeFile(join(OUT_DIR, 'invalid-not-xlsx.bin'), binContent);
  hashes['invalid-not-xlsx.bin'] = createHash('sha256').update(binContent).digest('hex').toUpperCase();
  console.log(`Wrote invalid-not-xlsx.bin SHA-256=${hashes['invalid-not-xlsx.bin']}`);

  console.log('\n--- Post-generation verification (read-excel-file/node) ---');
  const parserResults = [];
  for (const fixture of FIXTURES) {
    const result = await verifyWorkbook(fixture.file);
    parserResults.push(result);
    console.log(
      `OK ${fixture.file}: parse success; sheets=[${result.sheets.join(', ')}]; templateVersion=${JSON.stringify(result.templateVersion)}`,
    );
  }

  console.log('\n--- JSON for README ---');
  console.log(JSON.stringify(hashes, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
